# Contributing

Thanks for contributing.

- For workflow and repo standards, see `README.md`
- For sprint tasks and planning, see `docs/guides/`

## Documentation workflow

### Versioning
- Documentation changes ship with the repository version (git history + release tags).
- Add doc-impacting changes to `CHANGELOG.md` under `[Unreleased]` (even if no code changed).
- Use commit prefixes consistently: `docs:` for documentation-only changes.

### Review (cross-check)
- Verify commands match the current scripts/config in the repo.
- Verify paths and URLs exist (or are clearly marked as placeholders).
- Verify code examples match the current implementation (API routes, env vars, table/column names).
- Run Markdown lint if your environment supports it.

### Communication
- When docs change, post a short summary in the team channel and link the PR/commit.
- If the change affects onboarding or production ops, notify stakeholders and pin the update for at least one sprint cycle.
