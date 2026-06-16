# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Engineering foundation docs: `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.editorconfig`, `.nvmrc`
- Release discipline: `CHANGELOG.md`, `docs/RELEASE.md`, `scripts/setup.sh`, pre-push hooks
- CI guardrails workflow: lint, type-check, coverage, audit, Gitleaks, Semgrep
- Separate `deploy.yml` for tag-based EC2 deployments

### Changed

- Split monolithic GitHub Actions workflow into `ci.yml` (quality gates) and `deploy.yml` (releases)
- Enriched pull request template with changelog and base-branch checks

### Removed

- Dead scoped CSS from `src/routes/+page.svelte` (zero `css_unused_selector` build warnings)
- Unused `.alert--demo` styles from billing payment-methods page
