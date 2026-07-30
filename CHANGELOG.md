# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Phase 3 quality gates: coverage thresholds (90% lines/statements/functions on `src/lib/**`), blocking e2e and audit CI jobs
- Dependabot version updates for npm, GitHub Actions, and Docker (`.github/dependabot.yml`)
- OSV-Scanner dependency scan (`scripts/osv-scan.sh`, `npm run scan:osv`)
- `.github/CODEOWNERS` and `docs/GOVERNANCE.md` (branch protection checklist)
- Coverage artifact upload in CI
- Expanded unit tests for services, stores, and utils (~150 tests)
- Engineering foundation docs: `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.editorconfig`, `.nvmrc`

### Security

- Cleared all 13 known dependency vulnerabilities reported by `npm audit` and OSV-Scanner (1 critical, 10 high, 2 medium), all in dev dependencies
- Bumped `@sveltejs/kit` to `^2.69.1` and the `vitest` family (`vitest`, `@vitest/coverage-v8`, `@vitest/browser`) to `^3.2.7`
- Added `overrides` for `brace-expansion`, `minimatch`, `fast-uri`, `js-yaml`, and raised the `postcss` floor to `>=8.5.18`. `minimatch` has to move to `>=10.2.6` alongside `brace-expansion@>=5`, since v5 switched from a default to a named export and older `minimatch` calls it as a default

### Changed

- `npm run validate` now runs `test:coverage` with enforced thresholds
- CI `e2e` and `audit` jobs are blocking (removed `continue-on-error`)
- `apiClient.delete()` for organization user removal
- CI guardrails workflow: lint, type-check, coverage, audit, Gitleaks, Semgrep
- Separate `deploy.yml` for tag-based EC2 deployments
- Phase 2 (soft): DevContainer, `npm run validate`, unit test scaffolding, Playwright smoke e2e (informational CI)
- ADRs (`docs/adr/`), threat model (`docs/security/threat-model.md`), GitHub issue templates
- `sessionExpiredHandler` to isolate 401 handling from `apiClient`

### Changed

- Split monolithic GitHub Actions workflow into `ci.yml` (quality gates) and `deploy.yml` (releases)
- Enriched pull request template with changelog and base-branch checks
- Updated deploy GitHub Actions to current major versions (`actions/checkout@v5`, `docker/setup-buildx-action@v4`, `docker/build-push-action@v7`) to align with Node 24 runtime
- Renamed deploy Docker image/container from `tracker-web(-test)` to `geminislabs-web` in EC2 deployment flow
- Refactored Docker build to inject `VITE_RECAPTCHA_SITE_KEY` via BuildKit secrets instead of `ARG`/`ENV` in `Dockerfile`

### Removed

- Dead scoped CSS from `src/routes/+page.svelte` (zero `css_unused_selector` build warnings)
- Unused `.alert--demo` styles from billing payment-methods page
