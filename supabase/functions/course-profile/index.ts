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
 * Env vars required:
 *   HYPERCODE_API_URL  — e.g. https://api.hypercode.dev  (or http://hypercode-core:8000 in local)
 *   SUPABASE_URL       — injected automatically by Supabase
 *   SUPABASE_ANON_KEY  — injected automatically by Supabase
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const HYPERCODE_API_URL = Deno.env.get("HYPERCODE_API_URL") ?? "http://hypercode-core:8000";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req: Request) => {
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
  const supabaseKey = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY env var" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
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
