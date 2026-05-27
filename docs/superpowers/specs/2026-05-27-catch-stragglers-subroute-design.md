# Catch Stragglers (Mission Control Sub-route) — Design

## Goal

Expose the existing `CatchStragglers.jsx` UI inside the course admin area as a dedicated sub-route:

- `/admin/mission-control/catch-stragglers`

## Non-Goals

- No backend changes in this repo.
- No secrets in frontend env vars.
- No CORS policy changes (handled by Mission Control backend).

## Approach

- Add a new admin page that renders the existing component.
- Add an admin-only route under the existing `AdminRoute role="admin"` block.
- Update `CatchStragglers.jsx` fetch calls to support a configurable API base URL.

## Files

### Create

- `frontend/src/pages/admin/catch-stragglers.tsx`

### Modify

- `frontend/src/App.tsx` (lazy import + route)
- `frontend/src/pages/MissionControl.tsx` (link into the new sub-route)
- `frontend/components/mission-control/CatchStragglers.jsx` (API base)
- `frontend/.env.example` (document optional API base var)

## Env Vars

- `VITE_MISSION_CONTROL_API_URL` (optional)
  - If set, Catch Stragglers calls `${VITE_MISSION_CONTROL_API_URL}/api/...`
  - If not set, falls back to same-origin `/api/...` (local dev proxy or co-hosted deployment)

## Acceptance Criteria

- Route `/admin/mission-control/catch-stragglers` renders the Catch Stragglers UI for admins.
- Fetch calls can be targeted at Mission Control backend via `VITE_MISSION_CONTROL_API_URL`.
- No secrets are introduced.

