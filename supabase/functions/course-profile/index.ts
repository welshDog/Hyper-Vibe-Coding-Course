/**
 * course-profile — Supabase Edge Function
 * Phase 1: Identity Bridge
 *
 * Fetches a user's full cross-system profile by Discord ID:
 *   - Course data from Supabase (XP, level, BROski$ tokens, lessons completed)
 *   - HyperCode platform data from the V2.4 API (projects, tasks, role)
 *
 * Deploy to: Hyper-Vibe-Coding-Course Supabase project
 * Invoke:    GET /functions/v1/course-profile?discord_id=<snowflake>
 *
 * Trust model — service-to-service, NOT end-user facing:
 *   Per RISK_FLAGS.md (R5/R13), the intended caller is V2.4's own backend
 *   (the `hypercode_sync.py` cog / a reconciliation cron), polling this to
 *   read a student's Course-side balance. It is not meant to be reachable
 *   by student browsers or arbitrary signed-in users — there is no
 *   per-caller identity check possible here (V2.4 doesn't hold a Supabase
 *   user JWT for the student it's asking about), so auth is a shared
 *   secret instead, mirroring the existing Course<->V2.4 pattern
 *   (SHOP_SYNC_SECRET / COURSE_SYNC_SECRET) but in its own dedicated
 *   secret for this direction so a leak doesn't cross-expose the others.
 *   verify_jwt is OFF at the gateway — this header check is the real gate.
 *
 * Env vars required:
 *   HYPERCODE_API_URL     — e.g. https://api.hypercode.dev  (or http://hypercode-core:8000 in local)
 *   V24_SYNC_SECRET        — shared secret V2.4 must send as X-Sync-Secret
 *   SUPABASE_URL           — injected automatically by Supabase
 *   SUPABASE_SECRET_KEYS   — hosted named secret keys (this fn uses "course_profile")
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { resolveSupabaseAdminKey } from "../_shared/supabaseAdminKey.mjs";

const HYPERCODE_API_URL = Deno.env.get("HYPERCODE_API_URL") ?? "http://hypercode-core:8000";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

Deno.serve(async (req: Request) => {
  const v24SyncSecret = Deno.env.get("V24_SYNC_SECRET");
  if (!v24SyncSecret) {
    console.error("[course-profile] V24_SYNC_SECRET is not configured");
    return new Response(
      JSON.stringify({ error: "Service misconfigured — contact admin" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
  const providedSecret = req.headers.get("X-Sync-Secret");
  if (!providedSecret || providedSecret !== v24SyncSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const url = new URL(req.url);
  const discordId = url.searchParams.get("discord_id");

  if (!discordId) {
    return new Response(
      JSON.stringify({ error: "discord_id query param is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!SUPABASE_URL) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL env var" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let supabaseKey: string;
  try {
    supabaseKey = resolveSupabaseAdminKey(
      {
        SUPABASE_SECRET_KEYS: Deno.env.get("SUPABASE_SECRET_KEYS") ?? "",
        SUPABASE_SECRET_KEY: Deno.env.get("SUPABASE_SECRET_KEY") ?? "",
      },
      "course_profile",
    );
  } catch (err) {
    console.error("[course-profile] Admin key resolution failed:", err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: "Service misconfigured — contact admin" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(SUPABASE_URL, supabaseKey);

  // ── Course profile from Supabase ──────────────────────────────────────────
  const { data: linkRow, error: linkErr } = await supabase
    .from("discord_links")
    .select("discord_id,user_id")
    .eq("discord_id", discordId)
    .maybeSingle();

  if (linkErr) {
    return new Response(
      JSON.stringify({ error: "Course DB error", detail: linkErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!linkRow?.user_id) {
    return new Response(
      JSON.stringify({
        user_id: null,
        discord_id: discordId,
        display_name: null,
        broski_tokens: 0,
        tier: null,
        lifetime_earned: 0,
        lessons_completed: 0,
        hypercode: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const courseUserId = linkRow.user_id as string;

  const { data: courseUser, error: courseUserErr } = await supabase
    .from("users")
    .select("id,email,full_name,broski_tokens,created_at")
    .eq("id", courseUserId)
    .single();

  if (courseUserErr) {
    return new Response(
      JSON.stringify({ error: "Course DB error", detail: courseUserErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const { count: lessonsCompleted, error: lessonsCompletedErr } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", courseUserId)
    .eq("completed", true);

  if (lessonsCompletedErr) {
    return new Response(
      JSON.stringify({ error: "Course DB error", detail: lessonsCompletedErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const { data: tierRow, error: tierErr } = await supabase
    .from("user_loyalty_tier")
    .select("tier,lifetime_earned")
    .eq("user_id", courseUserId)
    .maybeSingle();

  if (tierErr) {
    return new Response(
      JSON.stringify({ error: "Course DB error", detail: tierErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── HyperCode platform profile ────────────────────────────────────────────
  let hypercodeUser: Record<string, unknown> | null = null;
  try {
    const hcRes = await fetch(
      `${HYPERCODE_API_URL}/api/v1/users/by-discord/${discordId}`,
      { headers: { "Accept": "application/json" } },
    );
    if (hcRes.ok) {
      hypercodeUser = await hcRes.json();
    }
  } catch {
    // HyperCode is optional — don't fail the whole response if it's down
  }

  return new Response(
    JSON.stringify({
      user_id: courseUserId,
      discord_id: discordId,
      display_name: courseUser.full_name ?? courseUser.email ?? null,
      broski_tokens: courseUser.broski_tokens ?? 0,
      tier: tierRow?.tier ?? null,
      lifetime_earned: tierRow?.lifetime_earned ?? 0,
      lessons_completed: lessonsCompleted ?? 0,
      hypercode: hypercodeUser
        ? {
            id: hypercodeUser.id,
            email: hypercodeUser.email,
            full_name: hypercodeUser.full_name,
            role: hypercodeUser.role,
            is_active: hypercodeUser.is_active,
          }
        : null,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
