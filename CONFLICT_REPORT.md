# CONFLICT_REPORT.md
> HyperCode V2.4 ↔ Hyper-Vibe-Coding-Course
> Generated: 2026-04-11 | Audit Pass 1 — READ ONLY

---

## 🔴 HARD CONFLICTS (will break if merged without resolution)

### C1 — Port 5432 (PostgreSQL)
| Repo | Service | Port |
|------|---------|------|
| V2.4 | postgres (SQLAlchemy) | 5432 |
| Course | postgres (legacy docker-compose.yml) | 5432 |

**Impact:** Both docker-compose files bind `0.0.0.0:5432:5432`. Running both locally = bind failure.
**Fix:** Course's local postgres is legacy/unused (Supabase cloud is the real DB). Remove port 5432 from Course's docker-compose.yml or add a profile guard.

---

### C2 — Port 3000
| Repo | Service | Port |
|------|---------|------|
| V2.4 | broski-terminal | 3000 |
| Course | legacy web app (apps/web) | 3000 |

**Impact:** Clash in local dev if both stacks run simultaneously.
**Fix:** Course's apps/web is abandoned — remove from docker-compose.yml. V2.4 keeps 3000.

---

### C3 — `/leaderboard` Discord Slash Command (Duplicate Registration)
| Repo | Bot | Command |
|------|-----|---------|
| V2.4 | broski-bot v4.0 (economy.py) | `/leaderboard` — BROski$ coin top 10 |
| Course | discord-bot (xp.py) | `/leaderboard` — XP + badge top 10 |

**Impact:** Both bots in the same Discord server = two commands named `/leaderboard`. Discord shows duplicates in autocomplete. Users confused about which bot answered.
**Fix:** Rename Course bot's to `/xp-leaderboard`. V2.4 bot keeps `/leaderboard`.

---

### C4 — Dual Achievement Systems (Incompatible Schemas)
| Repo | Table/Model | Fields |
|------|------------|--------|
| V2.4 | `BROskiAchievement` (SQLAlchemy) | id, name, description, category, points, badge_emoji, trigger_type, trigger_value |
| Course | `public.achievements` (Supabase) | id, user_id, badge_id (varchar 50), xp_awarded (int), earned_at |

**Impact:** If you try to sync achievements, the schemas are incompatible. V2.4 has a master achievement catalogue table + user join table. Course just logs earned badges directly on the user.
**Fix:** V2.4 is the richer model. When syncing, map Course `badge_id` → V2.4 `achievement.name`. Keep both systems independent for now; sync via bridge only.

---

### C5 — Dual Token Economies (Different Field Names + DBs)
| Repo | Table | Currency Field | DB |
|------|-------|---------------|-----|
| V2.4 | `BROskiWallet` | `coins` (int) + `xp` (int, separate) | PostgreSQL (SQLAlchemy) |
| Course | `public.users` | `broski_tokens` (int) | Supabase PostgreSQL |

**Impact:** Both track a "BROski$" concept but in separate DBs with different field names. You cannot JOIN them.
**Fix:** Supabase (`broski_tokens`) is authoritative for course-earned tokens. V2.4 mirrors via one-way sync webhook. Do NOT merge the databases. Map: `broski_tokens → coins` when syncing.

---

## 🟡 NAMING CLASHES (ambiguous — need a decision)

### N1 — "Shop" exists in both systems
| Repo | Implementation |
|------|--------------|
| V2.4 | `shop_system.py` cog, `BROskiWallet` coins as currency |
| Course | `shop_items` + `shop_purchases` tables + `shop-purchase` Edge Function |

**Not a hard conflict** — they're in different DBs. But if a student is in both, they have two shops.
**Decision needed:** Are these the same shop or different? Recommend: Course shop = course content (prompt packs, coaching). V2.4 shop = agent access + platform features. Different inventories, one currency.

---

### N2 — "BROski Bot" name used by both
| Repo | Bot |
|------|-----|
| V2.4 | `broski-bot` service in docker-compose, 13 cogs, v4.0 |
| Course | `discord-bot/` folder, 4 cogs, no version tag |

**Not a hard conflict** (different bot tokens). But confusing to maintain.
**Naming convention:** V2.4 bot = `HyperCode Bot`. Course bot = `Hyper-Vibe Bot`. Keep them as two distinct bots.

---

### N3 — `.agents/` vs `/agents/` — different meanings
| Repo | Folder | Contains |
|------|--------|---------|
| V2.4 | `/agents/` | Actual running agent microservices (Python, Dockerized) |
| Course | `.agents/` | Claude skill definitions (SKILL.md metadata files only) |

**Impact:** Zero runtime conflict (totally different things). High cognitive confusion when looking at both repos together.
**Fix:** Documentation. Add a README.md to each clarifying the distinction. Consider renaming Course's `.agents/` to `.claude-skills/` for clarity.

---

### N4 — `config.json` agent format vs `SKILL.md` agent format
| Repo | Agent Config Format | Fields |
|------|-------------------|--------|
| V2.4 | `config.json` | agent_name, specializations, model, ollama_host, temperature |
| Course | SKILL.md frontmatter | name, version, description, author, metadata |

**No shared interface contract.** An agent from the Course cannot be registered in V2.4 without manual adaptation.
**Fix:** `hyper-agent-spec.json` (see SHARED_SPEC.md).

---

## 🟡 SCHEMA CONFLICTS

### S1 — User Identity (UUID vs Int + missing discord_id)
| Repo | User PK | discord_id field |
|------|---------|-----------------|
| Course | `id UUID` | No — linked via separate `discord_links` table |
| V2.4 | `id INT` (autoincrement) | ❌ **Missing entirely** |

**Critical:** The integration plan requires V2.4 to look up users by Discord ID. V2.4's `users` table has no `discord_id` column.
**Fix:** Alembic migration in V2.4 — add `discord_id VARCHAR(30) UNIQUE NULLABLE` to users table. This is the **#1 prerequisite** for any integration work.

---

### S2 — XP Calculation Differs
| Repo | XP Source |
|------|----------|
| V2.4 | `xp` column on `BROskiWallet` (direct value) |
| Course | `len(achievements) * 100` (Discord bot) OR `lifetime_earned` from `user_loyalty_tier` VIEW |

**Impact:** If you display XP from both systems, numbers will differ for the same user.
**Fix:** Document which is authoritative per context. Course = lifetime_earned for tier. V2.4 = its own XP for V2.4 progression. Don't merge; display separately.

---

### S3 — Two Separate PostgreSQL Instances
- **V2.4:** Dockerized Postgres managed by SQLAlchemy + Alembic
- **Course:** Supabase-managed Postgres (cloud, not local) with RLS

**Impact:** No migration tooling is shared. Alembic won't touch Supabase. Supabase CLI won't touch V2.4.
**Fix:** Keep them separate. Integration is via API/webhook, never direct DB cross-connect.

---

## 🟢 NO CONFLICT (safe to proceed)

| Area | Status | Notes |
|------|--------|-------|
| MCP Gateway (V2.4 port 8820) | ✅ Safe | No overlap with Course — Course has no MCP layer yet |
| Stripe Webhook (Course) | ✅ Safe | V2.4 has no Stripe integration |
| Supabase Edge Functions | ✅ Safe | V2.4 has no Edge Functions |
| skills-lock.json | ✅ Safe | Course-specific, V2.4 has different skill mechanism |
| Grafana (V2.4 port 3001) | ✅ Safe | Course has no Grafana |
| Redis (V2.4) | ✅ Safe | Course doesn't use Redis |
| CLAUDE.md content | ✅ Safe | Different instructions, different repos — keep separate |
| Auth model (JWT/Supabase vs V2.4 JWT) | ✅ Safe | Different issuers, no collision in the same app |

---

## Priority Fix Order

```
🔴 C1 — Remove port 5432 from Course docker-compose.yml
🔴 C2 — Remove apps/web from Course docker-compose.yml  
🔴 C3 — Rename /leaderboard → /xp-leaderboard in Course bot
🔴 S1 — Add discord_id to V2.4 users table (Alembic migration) ← BLOCKS EVERYTHING
🟡 C4 — Document achievement sync mapping
🟡 C5 — Document token sync mapping + implement one-way webhook
🟡 N1 — Define shop inventory split (course content vs agent access)
🟡 N3 — Add README.md to .agents/ and /agents/ clarifying difference
🟡 N4 — Implement hyper-agent-spec.json (see SHARED_SPEC.md)
```
