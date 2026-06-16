# Threat Model — geminis-labs-web-page

High-level security model for the SvelteKit frontend. Complements [SECURITY.md](../../SECURITY.md).

## System boundary

| In scope (this repo)               | Out of scope (other systems)      |
| ---------------------------------- | --------------------------------- |
| Browser bundle (`VITE_*` env vars) | `gac-api` / backend APIs          |
| SvelteKit routes & client stores   | PostgreSQL, Stripe server secrets |
| Docker image build & EC2 deploy    | Identity provider infrastructure  |

## Assets

1. **User session tokens** — stored client-side (`sessionStorage` via auth services)
2. **Organization & billing UI data** — rendered from API responses
3. **Public site keys** — reCAPTCHA site key, Google Maps key (`VITE_*`)
4. **CI/CD secrets** — EC2 SSH, API URLs in GitHub Actions (not in repo)

## Trust zones

```text
[Browser]  --HTTPS-->  [SvelteKit Node adapter]  --HTTPS-->  [Backend API]
   ^                           ^
   |                           |
 VITE_* (public)          Build-time embed of VITE_*
```

**Rule:** Never put server secrets in `VITE_*` variables — they ship to every client.

## Key flows

### Authentication

- Login/register call backend `/api/v1/auth/*`
- Tokens held in browser storage; refresh via `authService`
- **Risk:** XSS exfiltrating tokens → mitigate with CSP (future), input sanitization, dependency updates
- **Risk:** Session fixation → backend responsibility; frontend clears state on 401 via `sessionExpiredHandler`

### Billing

- UI in `src/routes/control-panel/billing/**`
- Stripe.js loads with publishable key only
- **Risk:** Tampering with client-side amounts → server must validate all charges (documented in module docs)

### Contact form

- reCAPTCHA v3 site key in client; verification on backend
- **Risk:** Bot spam → backend validates `recaptcha_token`

## STRIDE summary (frontend-focused)

| Threat                 | Example                     | Mitigation                                            |
| ---------------------- | --------------------------- | ----------------------------------------------------- |
| Spoofing               | Fake API responses          | HTTPS, auth headers server-validated                  |
| Tampering              | Modified client requests    | Server-side authorization                             |
| Repudiation            | Denied user action          | Backend audit logs (out of scope here)                |
| Information disclosure | Secrets in git              | Gitleaks, `.env` gitignored, `SECURITY.md`            |
| Denial of service      | Heavy client loops          | Rate limiting on API (backend)                        |
| Elevation of privilege | Access billing without role | API enforces org context; UI is not security boundary |

## Sensitive modules (extra review)

- `src/lib/services/authService.js`
- `src/lib/services/billingService.js`
- `src/lib/services/apiClient.js`
- `src/routes/control-panel/billing/**`
- `src/routes/auth/**`

## Reporting

Follow [SECURITY.md](../../SECURITY.md) for vulnerability disclosure. Do not open public issues for security bugs.
