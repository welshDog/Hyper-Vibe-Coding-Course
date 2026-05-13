// supabase/functions/mint-pet-confirm/index.ts
//
// Phase 2A.5 — wallet-signed mint persistence.
//
// Called by the frontend AFTER a user-signed mintWithAuth tx mines (i.e. the
// non-relay mint path). Verifies the on-chain receipt and idempotently INSERTs
// the pets row so the persistent collection works for ALL mint modes.
//
// Trust model:
//   We do NOT trust the client's claim that the tx was successful — we read
//   the tx receipt directly from a Base RPC and check:
//     1. status === "success"
//     2. tx.to === BROSKIPET_CONTRACT_ADDRESS
//     3. logs contain a PetMinted event with matching petId AND owner=wallet_address
//
// Idempotency:
//   pets.pet_id is UNIQUE. If a row already exists for the supplied pet_id we
//   return 200 with persisted:true so the client treats it as success. The
//   reconciliation job (Phase 2B) hits the same endpoint when backfilling, so
//   replaying is safe.
//
// What this does NOT do (explicit non-goals):
//   - Refund on failure: by the time the user is calling confirm, BROski$ have
//     already been spent inside mint-pet-auth and the on-chain mint either
//     succeeded or didn't. Refunds happen inside mint-pet-auth.
//   - Allocate a new pet_id: pet_id is whatever was signed in the auth payload
//     and emitted on-chain. We just record it.

import "../deno-shims.d.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  createPublicClient,
  decodeEventLog,
  http,
  parseAbi,
} from "npm:viem@2.21.0";
import { base, baseSepolia } from "npm:viem@2.21.0/chains";

// ─── Constants ───────────────────────────────────────────────────────────────
// Must match mint-pet-auth's CHAIN_ID. Both functions read the same env layout.
const CHAIN_ID: number = 84532; // Base Sepolia. Mainnet = 8453.

type Hex = `0x${string}`;

const VALID_SPECIES = new Set([
  "apex_dragon", "blizzard_lizard", "chaos_cat", "cyber_fox",
  "gigabyte_guinea_pig", "hyper_beam_bunny", "hyper_hamster",
  "hyperfocus_horse", "power_pup", "sonic_spider",
]);
const VALID_RARITIES = new Set(["common", "uncommon", "rare", "legendary"]);

// Subset of the BROskiPet ABI — only the PetMinted event we need to decode.
const PET_MINTED_ABI = parseAbi([
  "event PetMinted(uint256 indexed tokenId, address indexed owner, string petId, string ipfsCID, uint256 nonce)",
]);

// ─── Handler ─────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // 1. Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  // 2. Parse + validate body
  let body: {
    tx_hash?:        string;
    pet_id?:         string;
    wallet_address?: string;
    species_id?:     string;
    rarity?:         string;
    pet_name?:       string;
    ipfs_cid?:       string;
  };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { tx_hash, pet_id, wallet_address, species_id, rarity, pet_name, ipfs_cid } = body;

  if (!tx_hash || !/^0x[0-9a-fA-F]{64}$/.test(tx_hash)) {
    return json({ error: "Invalid tx_hash" }, 400);
  }
  if (!pet_id || typeof pet_id !== "string" || !/^broski_\d+$/.test(pet_id)) {
    return json({ error: "Invalid pet_id" }, 400);
  }
  if (!wallet_address || !/^0x[0-9a-fA-F]{40}$/.test(wallet_address)) {
    return json({ error: "Invalid wallet_address" }, 400);
  }
  if (!species_id || !VALID_SPECIES.has(species_id)) {
    return json({ error: "Invalid species_id" }, 400);
  }
  if (!rarity || !VALID_RARITIES.has(rarity)) {
    return json({ error: "Invalid rarity" }, 400);
  }
  if (!ipfs_cid || typeof ipfs_cid !== "string" || ipfs_cid.length < 10 || ipfs_cid.length > 100) {
    return json({ error: "Invalid ipfs_cid" }, 400);
  }
  const safePetName =
    typeof pet_name === "string" && pet_name.trim().length >= 1 && pet_name.trim().length <= 32
      ? pet_name.trim()
      : null;
  if (!safePetName) {
    return json({ error: "Invalid pet_name (1–32 chars required)" }, 400);
  }

  const contractAddress = Deno.env.get("BROSKIPET_CONTRACT_ADDRESS");
  if (!contractAddress || !/^0x[0-9a-fA-F]{40}$/.test(contractAddress)) {
    console.error("[mint-pet-confirm] BROSKIPET_CONTRACT_ADDRESS missing or invalid");
    return json({ error: "Service misconfigured — contact admin" }, 503);
  }

  // 3. Idempotency short-circuit — if we already persisted this pet_id, return.
  const { data: existing, error: existingErr } = await adminClient
    .from("pets")
    .select("id, user_id, mint_tx_hash")
    .eq("pet_id", pet_id)
    .maybeSingle();
  if (existingErr) {
    console.error("[mint-pet-confirm] existing lookup failed:", existingErr);
    return json({ error: "Lookup failed" }, 500);
  }
  if (existing) {
    if (existing.user_id !== user.id) {
      // Someone else already owns this pet_id. Don't leak details.
      return json({ error: "pet_id conflict" }, 409);
    }
    return json({ ok: true, persisted: true, pet_id, already: true }, 200);
  }

  // 4. Verify the on-chain receipt.
  const rpcUrl = Deno.env.get("MINT_RPC_URL")
    ?? (CHAIN_ID === 8453 ? "https://mainnet.base.org" : "https://sepolia.base.org");
  const chain = CHAIN_ID === 8453 ? base : baseSepolia;
  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

  let receipt: Awaited<ReturnType<typeof publicClient.getTransactionReceipt>>;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: tx_hash as Hex });
  } catch (e) {
    // viem throws TransactionReceiptNotFoundError when the tx isn't mined yet.
    const msg = e instanceof Error ? e.message : String(e);
    const notFound = /not.*found|TransactionReceiptNotFound/i.test(msg);
    return json(
      { error: notFound ? "Transaction not yet mined" : "Receipt lookup failed" },
      notFound ? 425 : 502, // 425 Too Early — frontend should retry
    );
  }

  if (receipt.status !== "success") {
    return json({ error: "Transaction reverted on-chain" }, 422);
  }
  if ((receipt.to ?? "").toLowerCase() !== contractAddress.toLowerCase()) {
    return json({ error: "Transaction did not target the BROskiPet contract" }, 422);
  }

  // 5. Decode logs to find a matching PetMinted event.
  let matched = false;
  for (const log of receipt.logs) {
    if ((log.address ?? "").toLowerCase() !== contractAddress.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: PET_MINTED_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName !== "PetMinted") continue;
      const ownerOk =
        decoded.args.owner.toLowerCase() === wallet_address.toLowerCase();
      const petIdOk = decoded.args.petId === pet_id;
      if (ownerOk && petIdOk) { matched = true; break; }
    } catch {
      // Not a PetMinted log — skip silently.
    }
  }
  if (!matched) {
    return json(
      { error: "Receipt did not contain a matching PetMinted event" },
      422,
    );
  }

  // 6. Insert. Idempotency was checked in step 3 but a concurrent confirm
  //    could still race us — handle the unique-violation gracefully.
  const { error: insertErr } = await adminClient
    .from("pets")
    .insert({
      user_id:        user.id,
      wallet_address,
      pet_id,
      species_id,
      pet_name:       safePetName,
      rarity,
      mint_tx_hash:   tx_hash,
      ipfs_cid,
      chain_id:       CHAIN_ID,
    });
  if (insertErr) {
    if (insertErr.code === "23505") {
      // Unique violation — concurrent confirm got there first. That's a win,
      // not an error.
      return json({ ok: true, persisted: true, pet_id, already: true }, 200);
    }
    console.error("[mint-pet-confirm] pets INSERT failed:", insertErr);
    return json({ error: "Persist failed" }, 500);
  }

  return json({ ok: true, persisted: true, pet_id, already: false }, 200);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type":               "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
