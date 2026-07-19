# 🧩 Quiz re-seed — handoff

> **For:** Claude Code (has tlav Supabase MCP access — this session's MCP is org-scoped and can't reach tlav).
> **What's done:** M1–M3 quiz content authored + validated, committed as a real seed migration.
> **What's left:** apply to tlav, verify in UI, then extend to M4–M12.

---

## Why this exists

Quiz content was AI-generated straight into the **old** project and never committed, so the `yhtmui → tlav` rebuild left `hv_quizzes` empty (0 rows). Root fix: quiz content now lives in **git** as a seed migration. It survives the next rebuild.

**File:** `supabase/migrations/20260718210000_seed_hv_quizzes.sql`

## 🛑 The numbering trap (found on apply, 2026-07-18)

The master pack (`rewrites/NOTEBOOKLM_MASTER_PACK.md`) uses an **old numbering that no longer matches the live tlav curriculum.** A new intro module was inserted and the courses diverge from M4 on. Verified on live tlav:

| Pack # | Pack title | Live tlav module | Verdict |
|---|---|---|---|
| M1 🧠 Turn On Your AI Brain | *(no live equivalent)* | tlav M1 = 🧘 Designing Your Focus Zone | ❌ dropped |
| M2 🎤 Prompt Like a Pro | → **tlav M3** 🎤 Prompt Like a Pro | exact title+emoji | ✅ re-keyed |
| M3 🏗️ Build Your First App | → **tlav M4** 🏗️ Build Your First App | exact title+emoji | ✅ re-keyed |
| M4+ Money Engine / Agent Crew… | ≠ tlav M5+ Full Stack / HyperCode… | curricula diverge | ⛔ do not map |

**Lesson:** the pack is a *doc*; tlav is *reality*; they drifted — the same class of bug as the repo map and the dead ref. **Author quizzes from the LIVE module, keyed to the LIVE module.**

The committed seed now contains **only the two content-verified quizzes (tlav M3 + M4).**

---

## Pre-flight — confirm CONTENT, not just codes (done 2026-07-18)

⚠️ Codes existing is NOT enough — the numbering shifted (see the trap above). The
seed now targets **tlav M3 + M4**, whose titles+emojis exactly match the pack
content. Final gate before applying: spot-check that tlav M3/M4 *lesson content*
teaches these concepts (3-Part Formula / Kitchen-Waiter). It should — titles match.

```sql
select code, emoji, title from public.hv_modules where code in ('M3','M4');
-- expect: M3 🎤 Prompt Like a Pro · M4 🏗️ Build Your First App
```

---

## Apply (2 min)

Via Supabase MCP `apply_migration` against **tlav** (`tlavrxiaegbtyfmjfdcz`). **Never `supabase db push`.**

```
supabase/migrations/20260718210000_seed_hv_quizzes.sql
```

Idempotent — safe to re-run. `on conflict (module_id, version) do update` re-seeds payload in place.

---

## Verify — data (1 min)

```sql
-- one row per seeded module, each with 5 questions
select m.code, q.version, jsonb_array_length(q.payload->'questions') as questions
from public.hv_quizzes q
join public.hv_modules m on m.id = q.module_id
order by m.code;
```

Expect `M3, M4` → `5` each.

```sql
-- payload shape sanity (should return 0 bad rows)
select m.code
from public.hv_quizzes q
join public.hv_modules m on m.id = q.module_id
where jsonb_typeof(q.payload->'questions') <> 'array';
```

---

## Verify — UI (2 min)

The gate that matters is `isQuizPayload()` + `HvQuizPayload` in `frontend/src/pages/CourseModule.tsx`.

1. Log in, open tlav module M3 (Prompt Like a Pro) or M4 (Build Your First App).
2. Quiz renders below the content (multiple-choice + true/false + one practical self-check).
3. Answer all → submit → grade shows (practical = self-assessed boolean, not counted in %).
4. Complete → XP/coins award fires.

Already validated locally: all 3 payloads parse clean, every `answer_index` is in range, `true_false` uses `["True","False"]`, `practical` uses `answer_index: null`. `isQuizPayload` needs only `questions` to be an array — satisfied.

---

## Extend to the remaining live modules (M1, M2, M5–M12)

🛑 **Do NOT extend from the master pack** — it's a different curriculum (see the trap table). Author each quiz from the **live tlav module's own content**:

```sql
-- pull the real lesson content for a module, then write questions from IT
select code, emoji, title, summary, content
from public.hv_modules where code = 'M5';
```

Then add one block per module to a new dated seed file, keyed to the LIVE code, authored from that live content — not generic:

```sql
insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M4",
  "title": "Quiz: <emoji> <module title>",
  "questions": [
    { "id": "m4q1", "type": "multiple_choice", "prompt": "...", "choices": ["...","...","..."], "answer_index": 0, "explanation": "..." },
    { "id": "m4q2", "type": "true_false",      "prompt": "...", "choices": ["True","False"], "answer_index": 1, "explanation": "..." },
    { "id": "m4q3", "type": "practical",       "prompt": "...", "answer_index": null, "explanation": "..." }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M4'
on conflict (module_id, version) do update
  set payload = excluded.payload, updated_at = now();
```

**Authoring rules (keep the batch consistent):**
- 4–5 questions/module: ~3 `multiple_choice`, 1 `true_false`, 1 `practical`.
- Ground every question in that module's actual content (a command, a metaphor, a named concept). No filler.
- `answer_index` is 0-based into `choices`. `true_false` → `["True","False"]`, 0=True. `practical` → `answer_index: null`.
- Unique `id` per question (`m<n>q<k>`).
- Double any apostrophe inside the JSON is NOT needed — the `$json$` dollar-quote handles quotes; just keep the JSON itself valid.
- Re-run the local validator before applying:
  ```
  python3 -c "import re,json;[json.loads(b) for b in re.findall(r'\$json\$(.*?)\$json\$', open('supabase/migrations/20260718210000_seed_hv_quizzes.sql').read(), re.S)]" && echo OK
  ```

---

## When done

- Update `WHATS_DONE.md`: quizzes M3+M4 re-seeded from git; root cause closed (content now versioned); numbering trap recorded.
- Update `docs/PROJECT_REPORT_2026-07-18.*`: finding #5 → partially resolved (2 of 12; rest need live-content authoring).
- Commit: `feat(quizzes): seed hv_quizzes M3+M4 from git — survives rebuilds`.

> 🐶♾️ Content that only lives in the DB gets lost. Now it lives in git.
