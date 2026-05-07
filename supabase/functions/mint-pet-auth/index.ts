// supabase/functions/mint-pet-auth/index.ts
//
// v2 — corrected EIP-712 signing for the BROskiPet contract.
//
// What v2 fixes vs v1:
//   1. Typehash now matches the contract: `string petId, string ipfsCID`
//      (v1 declared uint256/bytes32 — sig recover would always fail).
//   2. EIP-712 encoding delegated to viem instead of hand-rolled encodeAbiPacked
//      (v1 packed address as 20 bytes; abi.encode requires 32-byte left-pad —
//      both the domain separator and the struct hash were wrong).
//   3. Refund-on-failure now wraps every post-spend error path
//      (v1 only refunded on nonce-insert failure → leaked tokens on petId
//      allocation or signing failures).
//   4. petId returned as a string ("broski_<seq>") — matches contract semantics.
//
// Trust boundary:
//   Anything signed here is treated as authorized by the on-chain contract.
//   The signing wallet (BACKEND_SIGNER_PRIVATE_KEY) must hold BACKEND_SIGNER_ROLE
//   on the deployed BROskiPet contract.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { privateKeyToAccount } from "npm:viem@2.21.0/accounts";

// ─── Constants ───────────────────────────────────────────────────────────────
const MINT_COST_TOKENS    = 100;
const SIG_EXPIRY_SECONDS  = 300;          // 5-minute signature window
const CHAIN_ID            = 84532;        // Base Sepolia. Mainnet = 8453.
const DOMAIN_NAME         = "BROskiPet";
const DOMAIN_VERSION      = "1";

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
  let body: { wallet_address?: string; ipfs_cid?: string; pet_name?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { wallet_address, ipfs_cid, pet_name } = body;
  if (!wallet_address || !ipfs_cid) {
    return json({ error: "wallet_address and ipfs_cid are required" }, 400);
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet_address)) {
    return json({ error: "Invalid wallet address" }, 400);
  }
  if (typeof ipfs_cid !== "string" || ipfs_cid.length < 10 || ipfs_cid.length > 100) {
    return json({ error: "Invalid IPFS CID" }, 400);
  }

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

  // 8. Return signed payload to client
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
  }, 200);
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
