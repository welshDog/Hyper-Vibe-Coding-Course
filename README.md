# Hyper Vibe Coding Course

Course content + launch kit for **Vibe Coding Foundations (Course 1)**, including curriculum, email sequences, gamification, marketing assets, and a deployable landing page.

## Repository Structure

- `assets/` Static assets (images, logos, screenshots)
- `config/` Tooling configuration (CI lint configs, etc.)
- `docs/` Documentation & Course Content
  - `course/` Proprietary Curriculum
  - `guides/` Public Resources
- `frontend/` Static Marketing Site (HTML/CSS/JS)
- `tests/` Automated Test Suite

Key docs:

- `docs/ARCHITECTURE.md` System Design (Option A)
- `docs/course/CURRICULUM.md` Full Course 1 curriculum
- `docs/guides/` Launch, marketing, email sequences, sprint plans
- `frontend/public/index.html` Live landing page

## Quick Start

### View the landing page locally

Open `frontend/public/index.html` in your browser.

### Publish the landing page (GitHub Pages)

This repo includes a GitHub Pages deployment workflow. To enable it:

1. In GitHub, go to **Settings → Pages**
2. Under **Build and deployment**, select **GitHub Actions**
3. Push to `main` and the workflow will deploy

## Usage Examples

### Create a feature branch (Git-flow style)

```bash
git checkout develop
git pull
git checkout -b feature/landing-page-cta
```

### Open a PR

- Target branch: `develop`
- Ensure required checks pass (CI / markdownlint)

### Validate workflows and templates locally (PowerShell)

```powershell
$ErrorActionPreference = "Stop"

$code = @'
from pathlib import Path
import sys
import yaml

yaml_files = [
  ".github/workflows/ci.yml",
  ".github/workflows/pages.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
]

missing = [p for p in yaml_files if not Path(p).exists()]
if missing:
  print("Missing required files:", *missing, sep="\\n- ")
  sys.exit(1)

for p in yaml_files:
  yaml.safe_load(Path(p).read_text(encoding="utf-8"))

print("YAML validated OK.")
'@

$code | python -
```

## Troubleshooting

### Push fails with 403 (HTTPS)

If you see `Permission denied ... (403)`, Git is authenticating as a GitHub account without write access. Update your credentials or grant the account write permissions to the repo.

### Push fails with `Permission denied (publickey)` (SSH)

This means your SSH key is not added to the GitHub account (or the account does not have repo write access). Add your public key under **GitHub → Settings → SSH and GPG keys**, then retry the push.

## Contribution Guidelines

### Branching (Git-flow style)

- `main`: always deployable (protected)
- `develop`: integration branch for upcoming release
- Feature branches: `feature/<short-name>`
- Fix branches: `fix/<short-name>`
- Release branches (optional): `release/<yyyy-mm-dd>` or `release/<version>`

### PR Rules (expected)

- Open all changes as PRs into `develop` (or `main` for urgent hotfixes)
- Keep PRs small and scoped
- Use descriptive titles and include screenshots for landing page changes
- CI must pass before merge

### Commit Messages

Use Conventional Commits:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`

### Local Checks

CI currently runs Markdown linting and Pages deploy. If you later add a frontend (`package.json`) or backend (`pyproject.toml`), extend the workflows to run the appropriate tests and typechecks.

## Repository Settings (Branch Protection)

Recommended branch protection for `main`:

- Require pull request reviews before merging (1+)
- Require status checks to pass before merging
  - `CI / markdownlint`
- Require linear history
- Require signed commits (optional, recommended)
- Block force pushes
- Do not allow deletions

Recommended branch protection for `develop`:

- Require status checks to pass before merging
  - `CI / markdownlint`
- Block force pushes

## License

Code is licensed under MIT (see `LICENSE`). Course content licensing is described in `docs/LICENSE_CONTENT.md`.
