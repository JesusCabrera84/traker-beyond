# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Nexus product page CTAs now point to `/#contacto` (the contact form lives on the home page; `#contacto` on `/products/nexus` was a dead hash). Fleet CTA label is "Solicitar una demo". Fleet ROI card no longer mentions Excel
- Account-deletion confirmation dialog is keyboard-accessible: `tabindex`, Escape to dismiss, and an `aria-labelledby` title

### Added

- Data Processing Agreement (`docs/legal/05-Convenio-de-Tratamiento-de-Datos-Personales`), signed with each client as Annex E of the Master Agreement. It is what contractually sustains the processor role the privacy notice describes; without it, the obligations placed on the client are a unilateral statement
- Retention specification for the team implementing data purging (`docs/legal/retencion-plazos-declarados.md`): the periods already published, four technical constraints found in the code, and acceptance criteria
- Third scenario in the privacy notice for individuals contracting for personal or household use, where Geminis Labs is the controller of everything including geolocation. Mexican data protection law does not reach individuals processing data for exclusively personal use, so no obligation can be passed to them
- Fourth scenario for partners reselling or white-labelling the platform, who act as controllers towards their own end customers
- Consumer carve-out in the jurisdiction clauses of the terms and the legal notice, mirroring clause 22.2 of the Master Agreement: a consumer may choose between their own domicile and Geminis Labs', and may turn to PROFECO
- `/legal/cookies` page, with a per-identifier inventory of everything NEXUS and Signum store in the browser. There was no cookie policy at all; the privacy notice covered the topic in two lines
- Single-source generation for the legal documents: one generator emits both the `.docx` under `docs/legal/` that counsel reviews and the content modules under `src/routes/legal/content/` that the site renders, so the published page and the reviewed document cannot drift apart
- `LegalDocument.svelte`, a shared renderer for the four legal pages (hero, sticky TOC, numbered sections, tables, callouts). Inline markup is tokenised rather than passed through `{@html}`
- Table and ordered-list styles in `legal.css`. Tables scroll inside their own box instead of forcing the page to scroll horizontally on a phone
- Product annexes in the privacy notice: NEXUS (geolocation processed on the client's behalf), Signum (health data published openly), Orion (system-to-system infrastructure)
- Signum as a third product on the landing page, with its own theme, background, and ECG animation behind the chips
- Product rail on the landing: the three brands are always visible, each with logo, name, and a functional descriptor. Replaces the tab selector that kept two of the three products hidden
- `src/lib/data/products.js` as the single source for the product catalogue, plus its unit tests
- E2E regression tests for product discoverability, including keyboard reachability of all three products
- "Zona de peligro" card in the profile view, with account-deletion confirmation modal
- Phase 3 quality gates: coverage thresholds (90% lines/statements/functions on `src/lib/**`), blocking e2e and audit CI jobs
- Dependabot version updates for npm, GitHub Actions, and Docker (`.github/dependabot.yml`)
- OSV-Scanner dependency scan (`scripts/osv-scan.sh`, `npm run scan:osv`)
- `.github/CODEOWNERS` and `docs/GOVERNANCE.md` (branch protection checklist)
- Coverage artifact upload in CI
- Expanded unit tests for services, stores, and utils (~150 tests)
- Engineering foundation docs: `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.editorconfig`, `.nvmrc`

### Security

- Raised the `nanoid` override to `^3.3.18` (GHSA-2v37-7h3g-55p8). The lockfile resolved to 3.3.16, which made `npm run audit --audit-level=high` fail
- Raised the `fast-uri` override from `>=3.1.4` to `>=4.1.2`. The former resolved to 4.1.1, affected by GHSA-7p8r-x3mc-p8w7, which made `npm run audit` fail on every pull request — all four open Dependabot PRs were red for a reason unrelated to what they were bumping
- Added `.claude/` to `.prettierignore`. It is in `.gitignore` but Prettier still checked it, so `prettier --check .` failed locally on an unversioned file and, because the lint script chains with `&&`, eslint never ran at all
- Cleared all 13 known dependency vulnerabilities reported by `npm audit` and OSV-Scanner (1 critical, 10 high, 2 medium), all in dev dependencies
- Bumped `@sveltejs/kit` to `^2.69.1` and the `vitest` family (`vitest`, `@vitest/coverage-v8`, `@vitest/browser`) to `^3.2.7`
- Added `overrides` for `brace-expansion`, `minimatch`, `fast-uri`, `js-yaml`, and raised the `postcss` floor to `>=8.5.18`. `minimatch` has to move to `>=10.2.6` alongside `brace-expansion@>=5`, since v5 switched from a default to a named export and older `minimatch` calls it as a default

### Changed

- Declared two processors that were missing, both verified in code: **Amazon Cognito** for identity management (`siscom-admin-api`, user pool in us-east-1) and **KORE Wireless (SuperSIM)** for cellular connectivity and SMS commands to units (`app/services/kore.py`). Mobile network operators are described as carriers of the communication, which is what they are
- Corrected a false statement in the privacy notice: passwords are not "protected by key derivation functions", they are **not stored at all**. Authentication has been fully delegated to Cognito since migration `004` of siscom-admin-api. The real posture is better than the one being declared
- Legal pages rewritten under the LFPDPPP published in the DOF on 20 March 2025, with the Secretaría Anticorrupción y Buen Gobierno as the supervisory authority. The previous text predated the reform and named neither
- Geolocation is no longer described as "possibly sensitive depending on use". Article 3 of the LFPDPPP lists sensitive data exhaustively and location is not on it. The privacy notice and the terms said different things about the same category
- Privacy notice now distinguishes when Geminis Labs acts as **responsable** (account holders' data) from when it acts as **encargado** (fleet geolocation, where the client is the responsable). The obligations that fall on the client — issuing its own notice, obtaining written consent from drivers, limiting monitoring to working hours — follow from that distinction
- Named the actual processors and where they run: AWS EC2/S3 and SES (us-east-1), Google Maps, Firebase Cloud Messaging, Apple APNs and Stripe, all in the United States. The previous text said "may be processed outside your country of residence"
- Stated retention periods: 3 months for raw telemetry, 12 for per-device aggregates and audit logs, 5 years for tax records and consent records. The previous text said periods "may vary by product"
- Privacy enquiries now point at `privacidad@geminislabs.com` instead of `contacto@`
- Jurisdiction set to Querétaro, Querétaro; ARCO deadlines (20 working days plus 15) and the supervisory authority spelled out
- Terms keep their existing commercial scope — third-party telemetry, APIs/TCP/MQTT, partner and white-label, alerts, indemnity — and add lawful-monitoring obligations and a cross-reference to Signum's own terms
- Product card is 13% shorter and matches the width of the "El futuro que estamos construyendo" card (1280px); it previously stretched to 2400px on large monitors
- Arrow-key navigation on the product selector now cycles the catalogue; the previous binary ternary made a third product unreachable by keyboard
- Nexus CTA now uses dark ink: white on `#5fd158` measured 1.95:1, an AA failure on the section's conversion element
- Product logo is no longer a focusable link inside an `aria-hidden` subtree
- Signum listed in the footer alongside Nexus and Orion
- Hero particle canvas is not mounted on mobile (≤600px), where only the static logo is shown
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
