// supabase/functions/mint-pet-auth/index.ts
//
// v3 — Path A gas sponsorship: optional backend relay.
//
// What v3 adds vs v2:
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

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { privateKeyToAccount } from "npm:viem@2.21.0/accounts";
import { createWalletClient, http, parseAbi } from "npm:viem@2.21.0";
import { baseSepolia, base } from "npm:viem@2.21.0/chains";

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
  let body: { wallet_address?: string; ipfs_cid?: string; pet_name?: string; relay?: boolean };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { wallet_address, ipfs_cid, pet_name, relay } = body;
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

      txHash = await wallet.writeContract({
        address:      contractAddress as `0x${string}`,
        abi:          mintAbi,
        functionName: "mintWithAuth",
        args: [
          {
            to:      wallet_address as `0x${string}`,
            petId,
            ipfsCID: ipfs_cid,
            nonce,
            expiry,
          },
          signature,
        ],
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
    relayed:   wantsRelay,
    ...(txHash ? { tx_hash: txHash } : {}),
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
