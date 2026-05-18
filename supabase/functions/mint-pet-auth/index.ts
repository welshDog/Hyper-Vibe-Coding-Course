// supabase/functions/mint-pet-auth/index.ts
//
// v4 — Phase 2A persistence: writes the pet row to public.pets after a
// successful relay mint so the UI can show the user's collection on reload.
//
// What v4 adds vs v3:
//   - Accepts optional `species_id` + `rarity` in the request body. Validated
//     server-side against the canonical 10-species list and 4-rarity list.
//   - After a successful relay tx, INSERTs into public.pets. Failures are
//     logged but do NOT refund — the on-chain tx already succeeded, and a
//     reconciliation job (Phase 2B) can backfill from PetMinted events.
//   - Wallet-signed mode (relay !== true) does NOT insert here. Phase 2A.5
//     will introduce a `mint-pet-confirm` endpoint that verifies the user's
//     tx receipt before inserting.
//
// What v3 added vs v2:
//   - Optional `relay: true` flag in request body. When set, the Edge Function
//     submits the mintWithAuth tx itself instead of returning the signature
//     for the user to broadcast. Users no longer need ETH to mint.
//   - Refund-on-relay-failure: if the on-chain tx revert/throws, BROski$
//     are returned. Same refund path as v2 signing failures.
//   - Backwards compatible: omit `relay` (or set false) → identical v2 behavior.
//
// What v2 fixed vs v1:
//   1. Typehash matches the contract: `string petId, string ipfsCID`.
//   2. EIP-712 encoding delegated to viem.
//   3. Refund-on-failure wraps every post-spend error path.
//   4. petId returned as a string ("broski_<seq>").
//
// Trust boundary:
//   Anything signed here is treated as authorized by the on-chain contract.
//   The signing wallet (BACKEND_SIGNER_PRIVATE_KEY) must hold BACKEND_SIGNER_ROLE
//   on the deployed BROskiPet contract.
//
// Relay funding:
//   The relayer wallet pays gas. Defaults to BACKEND_SIGNER_PRIVATE_KEY (same
//   wallet signs auth and submits tx). Override via RELAYER_PRIVATE_KEY env if
//   you want to separate the signing wallet (no ETH) from the relayer (holds ETH).
//   The relayer wallet must have funds on the target chain.

// NOTE: editor-only ambient types previously came from ../deno-shims.d.ts.
// That side-effect import is intentionally omitted so this file deploys as a
// single self-contained module (Deno Edge resolves jsr:/npm: natively, and a
// cross-dir relative import is fragile in single-function deploys).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { privateKeyToAccount } from "npm:viem@2.21.0/accounts";
import { concatHex, createWalletClient, encodeFunctionData, http, parseAbi } from "npm:viem@2.21.0";
import { baseSepolia, base } from "npm:viem@2.21.0/chains";
import { Attribution } from "npm:ox@0.14.20/erc8021";

// ─── Constants ───────────────────────────────────────────────────────────────
const MINT_COST_TOKENS    = 100;
const SIG_EXPIRY_SECONDS  = 300;          // 5-minute signature window
const CHAIN_ID: number    = 84532;        // Base Sepolia. Mainnet = 8453.
const DOMAIN_NAME         = "BROskiPet";
const DOMAIN_VERSION      = "1";

// Mirror of frontend/src/lib/species.ts — kept in lockstep manually. If a new
// species is added there, add it here too or the Edge Fn will reject mints.
const VALID_SPECIES = new Set([
  "apex_dragon", "blizzard_lizard", "chaos_cat", "cyber_fox",
  "gigabyte_guinea_pig", "hyper_beam_bunny", "hyper_hamster",
  "hyperfocus_horse", "power_pup", "sonic_spider",
]);
const VALID_RARITIES = new Set(["common", "uncommon", "rare", "legendary"]);

const EIP712_TYPES = {
  MintAuth: [
    { name: "to",      type: "address" },
    { name: "petId",   type: "string"  },
    { name: "ipfsCID", type: "string"  },
    { name: "nonce",   type: "uint256" },
    { name: "expiry",  type: "uint256" },
  ],
} as const;

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

  // 1. Auth — verify Supabase JWT
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
    wallet_address?:   string;
    ipfs_cid?:         string;
    pet_name?:         string;
    relay?:            boolean;
    species_id?:       string;
    rarity?:           string;
    /** Contract + chain the client is configured for. Checked pre-spend. */
    expected_contract?: string;
    expected_chain_id?: number;
  };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { wallet_address, ipfs_cid, pet_name, relay, species_id } = body;
  const wantsRelay = relay === true;
  if (!wallet_address || !ipfs_cid) {
    return json({ error: "wallet_address and ipfs_cid are required" }, 400);
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet_address)) {
    return json({ error: "Invalid wallet address" }, 400);
  }
  if (typeof ipfs_cid !== "string" || ipfs_cid.length < 10 || ipfs_cid.length > 100) {
    return json({ error: "Invalid IPFS CID" }, 400);
  }

  // Optional fields — required for the post-mint pets row in relay mode.
  // We don't hard-fail on missing values for older clients; we just skip the
  // INSERT and log so the operator can see it. New clients should always
  // send these.
  const speciesValid = typeof species_id === "string" && VALID_SPECIES.has(species_id);
  if (species_id && !speciesValid) {
    return json({ error: "Invalid species_id" }, 400);
  }
  // SECURITY: rarity is NEVER taken from the client. It used to be a
  // user-selectable picker, which let anyone mint Legendaries at will and
  // broke the game economy. We roll it server-side, weighted, here.
  const rolledRarity = rollRarity();
  // Names must fit the public.pets CHECK constraint.
  const safePetName =
    typeof pet_name === "string" && pet_name.trim().length >= 1 && pet_name.trim().length <= 32
      ? pet_name.trim()
      : null;

  // 3. Secrets check
  const signerKeyRaw     = Deno.env.get("BACKEND_SIGNER_PRIVATE_KEY");
  const contractAddress  = Deno.env.get("BROSKIPET_CONTRACT_ADDRESS");
  if (!signerKeyRaw || !contractAddress) {
    console.error("[mint-pet-auth] Missing BACKEND_SIGNER_PRIVATE_KEY or BROSKIPET_CONTRACT_ADDRESS");
    return json({ error: "Service not configured — contact admin" }, 503);
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(contractAddress)) {
    console.error("[mint-pet-auth] BROSKIPET_CONTRACT_ADDRESS is not a valid 0x address");
    return json({ error: "Service misconfigured — contact admin" }, 503);
  }
  const signerKey = (signerKeyRaw.startsWith("0x") ? signerKeyRaw : `0x${signerKeyRaw}`) as `0x${string}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(signerKey)) {
    console.error("[mint-pet-auth] BACKEND_SIGNER_PRIVATE_KEY is not a valid 32-byte key");
    return json({ error: "Service misconfigured — contact admin" }, 503);
  }

  // 3b. Contract / chain handshake — reject a stale client BEFORE the spend.
  // The frontend sends the contract + chain it's configured for. If they
  // don't match what we sign for, the client's own post-auth sanity check
  // rejects the payload anyway — but by then 100 BROski$ are already gone
  // (and in relay mode the NFT is already minted). Catch it here, pre-spend,
  // at zero cost. Backwards-compatible: older clients that omit these fields
  // are logged and allowed through (same policy as species_id above).
  const expectedContract =
    typeof body.expected_contract === "string"
      ? body.expected_contract.trim().toLowerCase()
      : null;
  const expectedChainId =
    typeof body.expected_chain_id === "number" ? body.expected_chain_id : null;

  if (expectedContract && expectedContract !== contractAddress.toLowerCase()) {
    console.error(
      `[mint-pet-auth] Pre-spend contract mismatch: client=${expectedContract} ` +
        `server=${contractAddress.toLowerCase()} — refusing, no BROski$ spent.`,
    );
    return json(
      { error: "Pet minting is temporarily unavailable (contract config mismatch). No BROski$ were spent — ping support on Discord." },
      409,
    );
  }
  if (expectedChainId !== null && expectedChainId !== CHAIN_ID) {
    console.error(
      `[mint-pet-auth] Pre-spend chain mismatch: client=${expectedChainId} ` +
        `server=${CHAIN_ID} — refusing, no BROski$ spent.`,
    );
    return json(
      { error: "Pet minting is temporarily unavailable (network mismatch). No BROski$ were spent — ping support on Discord." },
      409,
    );
  }
  if (!expectedContract) {
    console.warn(
      "[mint-pet-auth] Client omitted expected_contract — pre-spend mismatch guard skipped (older client?).",
    );
  }

  // 4. Spend BROski$ atomically (server-side; client cannot bypass)
  const { error: spendErr } = await adminClient.rpc("spend_tokens", {
    p_user_id: user.id,
    p_amount:  MINT_COST_TOKENS,
    p_reason:  `Mint BROskiPet: ${pet_name ?? ipfs_cid.slice(0, 10)}`,
  });
  if (spendErr) {
    const insufficient = spendErr.message?.toLowerCase().includes("insufficient");
    return json(
      { error: insufficient ? `Need ${MINT_COST_TOKENS} BROski$ to mint` : "Token spend failed" },
      insufficient ? 402 : 500,
    );
  }

  // Refund helper — used on every failure path past the spend.
  const refund = async (reason: string) => {
    const { error } = await adminClient.rpc("award_tokens", {
      p_user_id: user.id,
      p_amount:  MINT_COST_TOKENS,
      p_reason:  `Mint failure refund: ${reason}`,
    });
    if (error) console.error(`[mint-pet-auth] REFUND FAILED for ${user.id}:`, error);
  };

  // 5. Allocate next petId (numeric DB sequence → namespaced string)
  const { data: petIdRow, error: petIdErr } = await adminClient.rpc("next_pet_id");
  if (petIdErr || petIdRow == null) {
    await refund("petId allocation failed");
    return json({ error: "Could not allocate pet ID" }, 500);
  }
  const petId = `broski_${petIdRow}`;

  // 6. Generate single-use nonce + expiry
  const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = BigInt(
    "0x" + Array.from(nonceBytes).map(b => b.toString(16).padStart(2, "0")).join(""),
  );
  const expiry = BigInt(Math.floor(Date.now() / 1000) + SIG_EXPIRY_SECONDS);

  const { error: nonceErr } = await adminClient
    .from("mint_nonces")
    .insert({
      user_id:    user.id,
      nonce:      nonce.toString(),
      expires_at: new Date(Number(expiry) * 1000).toISOString(),
    });
  if (nonceErr) {
    await refund("nonce insert failed");
    return json({ error: "Failed to generate secure nonce" }, 500);
  }

  // 7. Build + sign EIP-712 payload (viem handles the encoding correctly)
  let signature: `0x${string}`;
  try {
    const account = privateKeyToAccount(signerKey);
    signature = await account.signTypedData({
      domain: {
        name:              DOMAIN_NAME,
        version:           DOMAIN_VERSION,
        chainId:           CHAIN_ID,
        verifyingContract: contractAddress as `0x${string}`,
      },
      types: EIP712_TYPES,
      primaryType: "MintAuth",
      message: {
        to:      wallet_address as `0x${string}`,
        petId,
        ipfsCID: ipfs_cid,
        nonce,
        expiry,
      },
    });
  } catch (e) {
    console.error("[mint-pet-auth] Signing failed:", e);
    await refund("signing failed");
    return json({ error: "Signing failed" }, 500);
  }

  // 8. Optional Path A relay — submit the on-chain tx ourselves.
  //    Users skip the wallet-signature step and don't need to hold ETH.
  let txHash: `0x${string}` | undefined;
  if (wantsRelay) {
    const relayerKeyRaw = Deno.env.get("RELAYER_PRIVATE_KEY") ?? signerKeyRaw;
    const relayerKey = (relayerKeyRaw.startsWith("0x") ? relayerKeyRaw : `0x${relayerKeyRaw}`) as `0x${string}`;
    if (!/^0x[0-9a-fA-F]{64}$/.test(relayerKey)) {
      console.error("[mint-pet-auth] Invalid relayer key");
      await refund("relayer key invalid");
      return json({ error: "Service misconfigured — contact admin" }, 503);
    }

    const rpcUrl = Deno.env.get("MINT_RPC_URL")
      ?? (CHAIN_ID === 8453 ? "https://mainnet.base.org" : "https://sepolia.base.org");
    const chain = CHAIN_ID === 8453 ? base : baseSepolia;

    const mintAbi = parseAbi([
      "function mintWithAuth((address to, string petId, string ipfsCID, uint256 nonce, uint256 expiry) auth, bytes signature) external",
    ]);

    try {
      const relayer = privateKeyToAccount(relayerKey);
      const wallet = createWalletClient({ account: relayer, chain, transport: http(rpcUrl) });

      const builderCodeRaw = (Deno.env.get("BUILDER_CODE") ?? "").trim();
      let dataSuffix: `0x${string}` | null = null;
      if (builderCodeRaw) {
        try {
          dataSuffix = Attribution.toDataSuffix({ codes: [builderCodeRaw] }) as `0x${string}`;
        } catch (e) {
          console.warn("[mint-pet-auth] Failed to encode ERC-8021 suffix; continuing without suffix:", e);
          dataSuffix = null;
        }
      } else {
        console.warn("[mint-pet-auth] BUILDER_CODE not set; continuing without ERC-8021 suffix");
      }

      const callData = encodeFunctionData({
        abi: mintAbi,
        functionName: "mintWithAuth",
        args: [
          {
            to: wallet_address as `0x${string}`,
            petId,
            ipfsCID: ipfs_cid,
            nonce,
            expiry,
          },
          signature,
        ],
      });

      const data = dataSuffix ? concatHex([callData, dataSuffix]) : callData;
      txHash = await wallet.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      });
    } catch (e) {
      console.error("[mint-pet-auth] Relay submit failed:", e);
      await refund("relay submit failed");
      const msg = e instanceof Error ? e.message : String(e);
      // Surface insufficient-funds clearly so ops can refill the relayer wallet
      const isFunding = /insufficient funds|gas required exceeds/i.test(msg);
      return json(
        { error: isFunding ? "Relayer out of gas — contact admin" : "Mint relay failed" },
        isFunding ? 503 : 500,
      );
    }

    // ── 8b. Persist the pet row ──────────────────────────────────────────────
    // Only runs in relay mode (we have full trust in the tx because we
    // submitted it). Wallet-signed mode handles persistence in a future
    // mint-pet-confirm endpoint that verifies the user's tx receipt.
    //
    // Failure here does NOT refund — the tx is already on-chain. A
    // reconciliation job (Phase 2B) can backfill from PetMinted events.
    if (txHash && speciesValid && safePetName) {
      const { error: petInsertErr } = await adminClient
        .from("pets")
        .insert({
          user_id:        user.id,
          wallet_address: wallet_address,
          pet_id:         petId,
          species_id:     species_id,
          pet_name:       safePetName,
          rarity:         rolledRarity,
          mint_tx_hash:   txHash,
          ipfs_cid:       ipfs_cid,
          chain_id:       CHAIN_ID,
        });
      if (petInsertErr) {
        console.error(
          `[mint-pet-auth] pets INSERT failed (tx ${txHash} succeeded — needs backfill):`,
          petInsertErr,
        );
      }
    } else if (txHash) {
      console.warn(
        `[mint-pet-auth] Skipping pets INSERT for tx ${txHash} — missing species_id/pet_name. ` +
        `Update the client to send these fields. petId=${petId}`,
      );
    }
  }

  // 9. Return — adds tx_hash when relayed; v2 clients ignore unknown fields.
  return json({
    auth: {
      to:      wallet_address,
      petId,                       // string — matches contract.MintAuth.petId
      ipfsCID: ipfs_cid,           // string — matches contract.MintAuth.ipfsCID
      nonce:   nonce.toString(),   // stringified for safe JSON transport
      expiry:  expiry.toString(),
    },
    signature,
    cost_paid: MINT_COST_TOKENS,
    chain_id:  CHAIN_ID,
    contract:  contractAddress,
    rarity:    rolledRarity,   // server-authoritative; client must use this
    relayed:   wantsRelay,
    ...(txHash ? { tx_hash: txHash } : {}),
  }, 200);
});

// ─── Rarity (server-authoritative) ───────────────────────────────────────────
// Client input is ignored entirely. Weights sum to 1.00 and mirror the
// intended game economy. crypto.getRandomValues → unbiased uniform draw.
const RARITY_WEIGHTS: ReadonlyArray<readonly [string, number]> = [
  ["common",    0.60],
  ["uncommon",  0.25],
  ["rare",      0.12],
  ["legendary", 0.03],
];
function rollRarity(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const x = buf[0] / 2 ** 32; // uniform [0, 1)
  let acc = 0;
  for (const [tier, weight] of RARITY_WEIGHTS) {
    acc += weight;
    if (x < acc) return tier;
  }
  return "common"; // floating-point safety net
}

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
