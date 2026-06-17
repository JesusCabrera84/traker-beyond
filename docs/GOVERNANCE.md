# Governance — geminis-labs-web-page

## Branch protection (recommended for `develop`)

Configure in **GitHub → Settings → Branches → Branch protection rules**:

| Setting                     | Value                        |
| --------------------------- | ---------------------------- |
| Branch                      | `develop`                    |
| Require pull request        | Yes                          |
| Required approvals          | 1                            |
| Require status checks       | `quality`, `security`, `e2e` |
| Require branches up to date | Yes                          |
| Include administrators      | Optional (team decision)     |

## CODEOWNERS

See [.github/CODEOWNERS](../.github/CODEOWNERS). Replace `@geminislabs/engineering` with your real GitHub team slug before enforcing reviews.

## CI jobs (phase 3)

| Job        | Blocks merge                                  |
| ---------- | --------------------------------------------- |
| `quality`  | Yes — lint, check, coverage thresholds, build |
| `security` | Yes — Gitleaks, Semgrep, OSV-Scanner          |
| `e2e`      | Yes — Playwright smoke                        |

## Coverage policy

Vitest enforces thresholds on `src/lib/**` (excluding Svelte components and `src/routes/**`). Target: **≥90%** lines/statements/functions, **≥70%** branches on included files.

## Release

Follow [docs/RELEASE.md](RELEASE.md). Deploy only via annotated tags `v*.*.*`.
