# SHARED_SPEC.md
> HyperAgent Interface Standard v0.1
> Generated: 2026-04-11 | Audit Pass 1 — READ ONLY / PROPOSED SPEC

---

## Why This Exists

Two repos have incompatible agent formats:

| Repo | Current Format | Fields |
|------|---------------|--------|
| V2.4 | `config.json` | agent_name, specializations, model, ollama_host, temperature |
| Course | `SKILL.md` frontmatter | name, version, description, author, metadata |

Neither format is wrong — they serve different purposes. But they can't talk to each other. An agent built in the Course cannot be registered in V2.4's MCP gateway without manual rewrite.

**The fix:** `hyper-agent-spec.json` — a third file format that becomes the shared standard. Both repos keep their existing internal formats. Agents that want to cross the boundary must also include a `manifest.json` that validates against this spec. Think of it as the passport.

---

## `hyper-agent-spec.json` — Full Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "https://github.com/welshDog/HyperAgent-SDK/hyper-agent-spec.json",
  "title": "HyperAgent Manifest",
  "description": "Shared interface contract for agents that can run in both Hyper-Vibe Course (.agents/) and HyperCode V2.4 (Hyper-Agents-Box)",
  "type": "object",
  "required": ["name", "version", "runtime", "entrypoint", "tools", "mcp_compatible"],
  "additionalProperties": false,
  "properties": {

    "name": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]{1,48}[a-z0-9]$",
      "description": "kebab-case, 3–50 chars, globally unique within a deployment"
    },

    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "semver — increment minor for new tools, patch for fixes"
    },

    "display_name": {
      "type": "string",
      "maxLength": 80,
      "description": "Human-readable name shown in Discord and Mission Control UI"
    },

    "description": {
      "type": "string",
      "maxLength": 500
    },

    "author": {
      "type": "string",
      "description": "Discord username or GitHub handle of the builder"
    },

    "runtime": {
      "enum": ["python", "node", "deno"],
      "description": "Determines which base Docker image is used at graduation"
    },

    "entrypoint": {
      "type": "string",
      "description": "Relative path from manifest.json to the main file (e.g. main.py, index.ts)"
    },

    "tools": {
      "type": "array",
      "minItems": 1,
      "description": "MCP-compatible tool definitions — must have at least 1",
      "items": {
        "type": "object",
        "required": ["name", "description", "input_schema"],
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string",
            "pattern": "^[a-z][a-z0-9_]{1,62}[a-z0-9]$",
            "description": "snake_case tool name"
          },
          "description": {
            "type": "string",
            "maxLength": 300,
            "description": "What the tool does — shown to the LLM calling it"
          },
          "input_schema": {
            "type": "object",
            "description": "JSON Schema for the tool's input parameters"
          },
          "output_schema": {
            "type": "object",
            "description": "Optional JSON Schema describing tool output shape"
          }
        }
      }
    },

    "mcp_compatible": {
      "type": "boolean",
      "description": "Set true only if the agent implements the MCP SSE transport. Required for V2.4 gateway registration."
    },

    "memory": {
      "enum": ["none", "redis", "postgres"],
      "default": "none",
      "description": "Backing store for agent state. 'none' = stateless. V2.4 provides redis + postgres automatically when docker compose runs."
    },

    "env_vars": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of required environment variable names (values NOT stored here). The graduate script will prompt for missing ones.",
      "examples": [["OPENAI_API_KEY", "SUPABASE_URL"]]
    },

    "port": {
      "type": "integer",
      "minimum": 3100,
      "maximum": 3999,
      "description": "⚠️ REQUIRED if mcp_compatible=true. Port in 3100–3999 range that the agent's MCP server listens on. Must not clash with other agents in the same deployment. V2.4 MCP gateway reverse-proxies this."
    },

    "health_check": {
      "type": "string",
      "description": "HTTP path for container health check (e.g. /health). Defaults to /health if absent."
    },

    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Free-form searchable tags (e.g. ['discord', 'writing', 'code-review'])"
    },

    "course_level": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5,
      "description": "Minimum Course progression level required to build/use this agent template. 1=HyperNewbie, 5=BROski Elite"
    }
  }
}
```

---

## Mapping: Existing Formats → Manifest

### V2.4 `config.json` → `manifest.json`

```
V2.4 config.json          →  manifest.json
─────────────────────────────────────────────────
agent_name                →  name (convert to kebab-case)
specializations[0]        →  tags[]
model                     →  (internal — NOT in manifest; agent manages its own model calls)
ollama_host               →  env_vars: ["OLLAMA_HOST"]
temperature               →  (internal — agent's concern, not the contract)
                          +  runtime: "python" (all V2.4 agents are Python)
                          +  entrypoint: "main.py"
                          +  tools: [] (must be authored — V2.4 agents don't declare MCP tools today)
                          +  mcp_compatible: true (for gateway-registered agents)
                          +  version: "1.0.0"
```

⚠️ **Assumption:** V2.4 agents don't currently export MCP tool definitions — `tools[]` would need to be written manually per agent. This is the biggest migration cost.

### Course `SKILL.md` frontmatter → `manifest.json`

```
SKILL.md frontmatter     →  manifest.json
─────────────────────────────────────────────────
name                     →  display_name
                         →  name (slugified: "My Agent" → "my-agent")
version                  →  version
description              →  description
author                   →  author
metadata.tags            →  tags[]
                         +  runtime: (student declares — python|node|deno)
                         +  entrypoint: (student declares — main.py etc.)
                         +  tools: [] (student writes their tool definitions)
                         +  mcp_compatible: false (default for starter agents)
```

Course teaches students to write `manifest.json` alongside `SKILL.md`. The two files coexist — `SKILL.md` stays as Claude's skill instructions; `manifest.json` is the deployment contract.

---

## File Layout: Course `.agents/` Folder

```
.agents/
  my-first-agent/
    manifest.json          ← validates against hyper-agent-spec.json ← NEW
    SKILL.md               ← Claude skill instructions (existing)
    main.py                ← agent entrypoint
    requirements.txt       ← Python deps (if runtime: "python")
    README.md              ← optional, shown in Mission Control
```

---

## Validation CLI — `npx hyper-agent validate`

Lives in the `HyperAgent-SDK` npm package. Two modes:

```bash
# Validate a single agent
npx hyper-agent validate .agents/my-first-agent

# Validate all agents in the folder
npx hyper-agent validate .agents/

# Output (pass)
✓ my-first-agent v0.1.0 — manifest valid
  tools: 2  |  runtime: python  |  mcp_compatible: false

# Output (fail)
✗ my-first-agent — INVALID manifest
  → "tools" must have at least 1 item
  → "port" is required when mcp_compatible is true
```

The `npm run graduate` script calls this internally. Agents that fail validation are excluded from the graduation package (not a hard stop — student can still graduate with valid agents).

---

## Port Assignment Convention

To avoid port conflicts when students deploy multiple agents into V2.4:

```
3100–3199  →  Writing / content agents
3200–3299  →  Code review / dev agents
3300–3399  →  Data / research agents
3400–3499  →  Discord / social agents
3500–3599  →  Personal automation agents
3600–3999  →  Reserved / custom
```

⚠️ **Assumption:** V2.4 MCP gateway supports dynamic registration of new tool servers on startup. If it requires static config, this needs a gateway config template per agent.

---

## Versioning Policy

| Change Type | Version Bump |
|-------------|-------------|
| New required field | Major (1.0.0 → 2.0.0) — breaking |
| New optional field | Minor (0.1.0 → 0.2.0) — backwards compatible |
| Field description fix | Patch (0.1.0 → 0.1.1) |

The spec itself is versioned in `$id`. Manifests declare which spec version they validate against via `$schema`. The CLI validates against the version the manifest declares.

---

## What Ships in `HyperAgent-SDK` Repo (Minimal v0.1)

```
HyperAgent-SDK/
  hyper-agent-spec.json      ← the schema (source of truth)
  package.json               ← name: "hyper-agent", bin: "hyper-agent"
  cli/
    validate.js              ← ajv-based validator, coloured CLI output
  templates/
    python-starter/          ← manifest.json + main.py + requirements.txt
    node-starter/            ← manifest.json + index.js + package.json
  README.md
```

Published to npm as `hyper-agent`. Used as:
- `npx hyper-agent validate` — no install needed
- `npm install -D hyper-agent` — for CI validation

---

## Status

| Item | Status |
|------|--------|
| Schema design | 🟡 Draft — needs review before implementation |
| V2.4 tool export | 🔴 Does not exist — biggest gap |
| Course SKILL.md coexistence | 🟢 Compatible — no changes to SKILL.md needed |
| Port range convention | 🟡 Proposed — needs V2.4 gateway architecture check |
| npm package | 🔴 Not created yet |
| Validation CLI | 🔴 Not created yet |
