---
name: migration-mcp
description: Forces correct Supabase MCP migration workflow with auto-numbering. Stops local/remote schema desync forever.
triggers:
  - migration
  - alter table
  - create table
  - schema change
  - database change
  - add column
  - drop column
  - rls
  - row level security
---

# 🗄️ migration-mcp — The Only Way to Migrate

> One rule: ALL database changes go through MCP apply_migration. No exceptions.

---

## ⛔ BANNED APPROACHES

```bash
# NEVER run any of these:
supabase db push
supabase migration up
psql -c "ALTER TABLE..."
# Direct SQL in Supabase dashboard (unless emergency hotfix — document it!)
```

---

## ✅ THE CORRECT WORKFLOW

### 1. Check existing migrations first
```
MCP → supabase list_migrations
```
See the highest number. Your new migration must be NEXT in sequence.

### 2. Name your migration correctly
```
Format: descriptive_snake_case
Examples:
  add_broski_tokens_to_profiles
  create_module_progress_table
  add_rls_policy_to_enrollments
  alter_tier_enum_add_architect
```
NO timestamps in name — MCP handles ordering.

### 3. Apply via MCP
```
MCP → supabase apply_migration
  project_id: yhtmuibgdnxhbgboajhc
  name: your_migration_name
  query: [your SQL here]
```

### 4. Verify it landed
```
MCP → supabase list_migrations
# Your migration should appear at the bottom
```

### 5. Check for RLS issues
```
MCP → supabase get_advisors (type: security)
# Fix any missing RLS policies before continuing
```

---

## 📋 MIGRATION SQL RULES

- Always use `IF NOT EXISTS` on CREATE TABLE
- Always use `IF EXISTS` on DROP
- Never hardcode UUIDs or generated IDs
- Always include RLS policy in same migration as table creation
- Test destructive changes on branch first
- Add comment block at top:

```sql
-- Migration: your_migration_name
-- Purpose: What this does
-- Affects: Which tables
-- Date: 2026-XX-XX
-- Author: welshDog + Claude
```

---

## 🏗️ SUPABASE PROJECT REFERENCE

```
Project ID:  yhtmuibgdnxhbgboajhc
Region:      eu-west-2
URL:         https://yhtmuibgdnxhbgboajhc.supabase.co
```

---

## 🚨 IF MIGRATION FAILS

1. Check error in `supabase get_logs (postgres)`
2. If partial apply — check what landed with `execute_sql`
3. Write a ROLLBACK migration (don't re-run the broken one)
4. Never try to fix by running db push — dig into MCP logs first

---

*Part of the HFZ Claude Skill Pack | welshDog 🐶♾️*
