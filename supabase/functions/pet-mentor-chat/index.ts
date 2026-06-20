// supabase/functions/pet-mentor-chat/index.ts
//
// Phase 2 of the BROskiPet Mentor: the LLM brain behind <PetMentorBubble/>.
// The bubble (lesson pages only) POSTs a student message; this function builds
// the species-specific system prompt (buildSystemPrompt) and relays to the LLM.
//
// JWT-verified — the caller's auth user is the source of truth. We still accept
// species_id / xp / module in the body as a fast path (the bubble already knows
// them); when absent we look them up. None of those grant privilege — they only
// flavour the prompt — so trusting the client for them is safe.
//
// Request:  { message, pet_id, user_id, species_id?, xp?, module?, history? }
// Response: { response, mood_update }
//
// Provider: Anthropic by default (ANTHROPIC_API_KEY). Set PET_MENTOR_PROVIDER=qwen
// with QWEN_BASE_URL + QWEN_API_KEY for a self-hosted Qwen2.5 (OpenAI-compatible).
// With no key configured it degrades to the personality's scripted line — so the
// bubble never hard-fails, it just falls back to Phase-1 behaviour.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  buildSystemPrompt,
  fallbackLine,
  PET_PERSONALITIES,
  type SpeciesId,
} from "./personalities.ts";

type ChatTurn = { role: "user" | "assistant"; content: string };
type PetMood = "idle" | "learning" | "hyperfocus" | "evolving";

const MAX_MESSAGE_LEN = 500;
const MAX_HISTORY_TURNS = 8;
const MAX_TOKENS = 160;

function isSpeciesId(v: unknown): v is SpeciesId {
  return typeof v === "string" && v in PET_PERSONALITIES;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, corsHeaders);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401, corsHeaders);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: "Unauthorized" }, 401, corsHeaders);

  // ── Body ──────────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400, corsHeaders);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return json({ error: "message is required" }, 400, corsHeaders);
  if (message.length > MAX_MESSAGE_LEN) {
    return json({ error: `message exceeds ${MAX_MESSAGE_LEN} chars` }, 400, corsHeaders);
  }

  const petId = typeof body.pet_id === "string" ? body.pet_id : null;

  // ── Resolve species + xp + module (body fast-path, DB fallback) ─────────────
  let species: SpeciesId = isSpeciesId(body.species_id) ? body.species_id : "power_pup";
  let xp = Number.isFinite(body.xp as number) ? Number(body.xp) : NaN;

  if ((!isSpeciesId(body.species_id) && petId) || Number.isNaN(xp)) {
    // RLS scopes both reads to the authenticated user.
    if (!isSpeciesId(body.species_id) && petId) {
      const { data: petRow } = await supabase
        .from("pets")
        .select("species_id")
        .eq("pet_id", petId)
        .maybeSingle();
      if (isSpeciesId(petRow?.species_id)) species = petRow!.species_id as SpeciesId;
    }
    if (Number.isNaN(xp)) {
      const { data: xpRow } = await supabase
        .from("user_xp")
        .select("total_xp")
        .eq("user_id", user.id)
        .maybeSingle();
      xp = Number(xpRow?.total_xp ?? 0);
    }
  }
  if (Number.isNaN(xp)) xp = 0;

  const moduleLabel = typeof body.module === "string" && body.module.trim()
    ? body.module.trim()
    : "your current lesson";

  const history: ChatTurn[] = Array.isArray(body.history)
    ? (body.history as unknown[])
        .filter(
          (t): t is ChatTurn =>
            !!t && typeof t === "object" &&
            ((t as ChatTurn).role === "user" || (t as ChatTurn).role === "assistant") &&
            typeof (t as ChatTurn).content === "string",
        )
        .slice(-MAX_HISTORY_TURNS)
    : [];

  const systemPrompt = buildSystemPrompt(species, xp, moduleLabel);

  // ── Call the LLM (graceful scripted fallback on any miss) ───────────────────
  let response: string;
  try {
    response = await callLLM(systemPrompt, history, message);
  } catch (e) {
    console.error("[pet-mentor-chat] LLM call failed:", e);
    response = fallbackLine(species);
  }

  // mood_update — v1 heuristic: chatting = engaged. The bubble can reflect this
  // on the pet. (A future pass can have the model classify the student's state.)
  const mood_update: PetMood = "learning";

  return json({ response, mood_update }, 200, corsHeaders);
});

// ── LLM providers ─────────────────────────────────────────────────────────────

async function callLLM(system: string, history: ChatTurn[], message: string): Promise<string> {
  const provider = (Deno.env.get("PET_MENTOR_PROVIDER") ?? "anthropic").toLowerCase();
  if (provider === "qwen") return callQwen(system, history, message);
  return callAnthropic(system, history, message);
}

async function callAnthropic(system: string, history: ChatTurn[], message: string): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const model = Deno.env.get("PET_MENTOR_MODEL") ?? "claude-haiku-4-5-20251001";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      system,
      messages: [...history, { role: "user", content: message }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) throw new Error("Empty Anthropic response");
  return text.trim();
}

async function callQwen(system: string, history: ChatTurn[], message: string): Promise<string> {
  const baseUrl = Deno.env.get("QWEN_BASE_URL");
  const apiKey = Deno.env.get("QWEN_API_KEY");
  if (!baseUrl || !apiKey) throw new Error("QWEN_BASE_URL / QWEN_API_KEY not configured");

  const model = Deno.env.get("PET_MENTOR_MODEL") ?? "qwen2.5-7b-instruct";
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "authorization": `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "system", content: system }, ...history, { role: "user", content: message }],
    }),
  });

  if (!res.ok) throw new Error(`Qwen ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("Empty Qwen response");
  return text.trim();
}

function json(body: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
