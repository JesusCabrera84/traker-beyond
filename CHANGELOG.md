# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Las tarjetas de «por dónde empezar» se estiraban a la misma altura, así que la de diagnóstico —más corta— quedaba con un vacío enorme entre su texto y el botón, que va anclado abajo. Ahora cada una toma su alto natural
- Deploy no longer runs `docker container prune` and `docker volume prune` on the EC2 host. Both sweep the entire machine, which is shared with `siscom-api`, `siscom-admin-api` and a Valkey container holding data-token scope state, and neither reclaimed anything belonging to this project: the web container is already removed by name a few lines above, and the image is static and creates no volumes. `docker image prune` stays, since dangling images are where the disk actually goes
- Nexus product page CTAs now point to `/#contacto` (the contact form lives on the home page; `#contacto` on `/products/nexus` was a dead hash). Fleet CTA label is "Solicitar una demo". Fleet ROI card no longer mentions Excel
- Account-deletion confirmation dialog is keyboard-accessible: `tabindex`, Escape to dismiss, and an `aria-labelledby` title

### Added

- La fotografía del hero de `/servicios` se desplaza con el cursor, en contra y a la mitad de velocidad que el árbol: lo que la vista lee como profundidad es el desplazamiento relativo entre los dos planos, no el de cada uno. Siete píxeles como máximo, con una transición casi el doble de lenta —esa pereza es la que le da peso de plano lejano— y un 3% de escala que paga la sobremedida, porque sin ella el desplazamiento destaparía fondo en el borde contrario. No hay recorte del sujeto ni mapa de profundidad: se mueve la imagen entera
- Señal animada en el riel de proceso de `/servicios`: una sola partícula lo recorre de «entendemos» a «operamos», tramo por tramo, y cada nodo destella cuando llega. Una por tramo corriendo a la vez leería los cinco pasos como simultáneos, que es justo lo que un proceso no es. El ciclo se reparte en cinco franjas para cuatro tramos: la quinta es la pausa del final, sin la cual el recorrido se leería como un bucle sin principio. Se apaga con `prefers-reduced-motion`
- Parallax y foco en el árbol de `/servicios`: el puntero mueve cada nodo según tres factores —su capa, su altura en el árbol y su cercanía al puntero— y el nodo más cercano se enciende junto con la rama que lo alimenta. El foco no usa `:hover` porque las piezas son PNG con resplandor transparente alrededor y sus cajas se solapan: el puntero picaría el rectángulo de un vecino invisible antes que el dibujo visible, así que se ilumina el nodo cuyo centro está más cerca. Las coordenadas se escriben como custom properties sobre el contenedor y no como estado, un `requestAnimationFrame` por fotograma como máximo. La altura ancla el árbol a la mesa —la raíz se desplaza 0.9 px y las hojas de la copa 14— y la cercanía lo vuelve local: la pieza bajo el cursor recorre unos 6 px y las del extremo opuesto menos de 1, en vez de desplazarse las quince en bloque. En táctil no se activa —el dedo no tiene hover— y con `prefers-reduced-motion` se va el desplazamiento y se queda el foco
- Árbol tecnológico en el hero de `/servicios`: quince piezas y nueve ramas montadas sobre la fotografía, en un sistema de coordenadas 0–100 que vive en `arbolNodos` y `arbolRamas`, no en el marcado. La silueta crece por niveles —la copa alcanza x≈20/78 y la base x≈−11/101— porque es esa progresión, y no el tamaño de las piezas, la que hace que se lea como un árbol; las ramas bajan al alejarse del tronco, que horizontales dejaban el conjunto como candelabro. Las ocho imágenes vienen recoloreadas al cian de marca en el archivo (RGB→HLS con el tono fijo en 189°, conservando saturación y luminosidad) y no con `hue-rotate`, que es una aproximación matricial y sobre verdes saturados devuelve morados. 400 KB en webp. El pulso que recorre las ramas se apaga con `prefers-reduced-motion`
- Fotografía en el hero de `/servicios`: alguien colocando una pieza sobre una mesa, con la ciudad de noche detrás. La metáfora es la que se vende — tú decides, nosotros construimos — y la mitad derecha queda reservada, ya como celda de la rejilla, para el árbol tecnológico que viene después. 73 KB en webp desde 1.6 MB en PNG, servida como `<img>` con `fetchpriority="high"` por ser el elemento mayor de la primera pantalla
- Diagrama del CTO as a Service en `/servicios`: tu empresa entra por arriba, la decisión pasa por una sola cabeza técnica y sale hacia los tres frentes donde se pierde el dinero — equipo, proveedores y tecnología. Va como SVG en línea y no como imagen: escala sin pixelarse, hereda la paleta de la sección y se anima con el mismo pulso de señal que la landing. Es decorativo —lo que dice ya está en la lista de arriba— así que queda fuera del árbol de accesibilidad, y el pulso se apaga con `prefers-reduced-motion`
- Checkout Stripe with server-quoted prices, tax profile, and on-demand CFDI in the billing panel
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

- Cleared eight advisories that CI started reporting after `v1.11.0` shipped, without a single source change: `qs` 6.15.2 → 6.16.0, `fast-uri` 4.1.2 → 4.1.4, `postcss-selector-parser` 7.1.1 → 7.1.6 and `@humanfs/node` 0.16.7 → 0.16.8. `npm audit fix` resolved all of them without `--force` and without a major bump, so only `package-lock.json` changed. `qs` is the one that sits in the production dependency tree (`pixi.js` → `@pixi/utils` → `url`); the other three are build tooling
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

## [1.12.1] — 2026-09-10

### Added

- 48 tests nuevos sobre las rutas de error de `billingService`, `authStore` y `userStore`: qué ocurre cuando el backend responde mal, cuando el servicio lanza y cuando el cuerpo no es JSON. En un módulo de pagos ese es el comportamiento que no puede romperse en silencio. También quedan cubiertos los stores derivados, que son los que consumen los componentes

### Changed

- Vitest 4 mide la cobertura con remapeo AST y no admite volver al método anterior, así que las métricas bajaron con el mismo código. En vez de recalibrar los umbrales de [GOVERNANCE.md](docs/GOVERNANCE.md) se escribieron los tests que faltaban: statements 83.6% → 91.03%, funciones 83.92% → 92.94%, líneas 88.8% → 94.64%
- El `include` de cobertura pasa de `src/lib/**` a `src/lib/**/*.{js,ts}`: vitest 4 intentaba parsear los `.css` y `.md` de `src/lib/styles` y emitía un `PARSE_ERROR` por cada uno

### Security

- `maplibre-gl` eliminada. Resolvía [GHSA-jrc7-96c5-q579](https://osv.dev/GHSA-jrc7-96c5-q579) (CVSS 10.0, bypass del sanitizador XSS) sin subir a la major 6.x: la dependencia no se importaba en ningún archivo del repositorio, los mapas usan `@googlemaps/js-api-loader`
- `vitest` y `@vitest/coverage-v8` a 4.x, que resuelve [GHSA-82fw-gwwq-j7x9](https://osv.dev/GHSA-82fw-gwwq-j7x9) (path traversal, solo desarrollo). `npm audit` y OSV quedan ambos limpios

### Removed

- `@vitest/browser`, `vitest-browser-svelte`, `vitest-setup-client.js` y `src/routes/page.svelte.spec.js`. Fijaban los peers de vitest en la 3.x e impedían la actualización, y eran andamiaje: browser mode nunca estuvo configurado (`vite.config.js` usa `happy-dom`) y ese spec —el demo que trae SvelteKit— estaba excluido por config, así que nunca llegó a ejecutarse

## [1.12.0] — 2026-09-10

### Added

- Module docs for the new routes (`docs/architecture/modules/servicios.md`, `products-nexus-partners.md`), plus the index diagram and `home.md` brought up to date with the new section order, the shared data sources, and the two unscoped global stylesheets a future author needs to know about before adding an `nx-*` class
- `/servicios/[slug]`: one template serving all six capability pages, with the full detail the grouping hides — the source document's thirteen areas survive here, 100+ services across the six. An unknown slug is a real 404, not an empty shell that Google would index. Each page links to its neighbours with wraparound, so the six can be toured without returning to the hub
- `/servicios`: the consulting hub. The thirteen areas of the source document grouped into six capabilities, presented as full-bleed rows that expand rather than a third grid — the landing already has the 2×2 technology layers and the five area badges, and one more grid would read as more of the same. The ENTENDEMOS → OPERAMOS flow is a 1px process rail, not five more cards
- `/servicios/diagnostico`: the commercial entry point. What gets reviewed, who it is for, and the deliverable the source document specifies — state, risks, opportunities, recommended architecture, roadmap, investment estimate
- `src/lib/data/services.js`: the six capabilities with promises written in customer language, plus the process steps. Its test asserts jargon stays out of the promise — the reader is an operations director, not an architect
- Services teaser on the landing between the technology and product sections, and a Servicios column in the footer. The narrative now runs: what we are → what we can do → what we do for you → what we have built
- `src/lib/styles/tokens.css`, now that there is something to consume it: the services palette belongs to neither the landing nor `nexus.css`. The deep blue-teal is deliberately none of the three product blacks — green, silver and red belong to Nexus, Orion and Signum, and a services page wearing one would read as a different company
- `/products/nexus/partners`: the technical page for integrators. Protocols (TCP, MQTT, REST, webhooks) with what each one is for, accepted payload formats, what white-label actually includes, and the onboarding timeline. The partner story existed only inside the Nexus product page — two clicks and 1200 lines of scroll down, with no URL of its own — so it could not be sent to a prospect
- `src/lib/data/nexusModels.js`: the three ways to have Nexus (subscription, Nexus Connect, Nexus Platform) as a single source read by the landing card, the Nexus page and the partners route. The copy now lives in two pages by design, so shared data is what keeps them from drifting apart
- Contract-model band in the landing product panel. It is a fixed slot in all three products and only the number of pills varies, so SaaS and white-label sit at the same hierarchical level as Signum's "one-time purchase" instead of being the eleventh chip
- Audience line ("para quién") on each product rail cell. The rail is the only place a visitor reads all three products at once

### Changed

- Services section moved below Products and rebuilt around an annotated isometric illustration (`static/img/servicios-cadena.webp`, 149 KB). The illustration ships with a real alpha channel: its background was removed from the file itself, deriving transparency from luminance against a per-block model of the artwork's own background gradient. Matching the section colour could never work — the artwork carries its own gradient, from #000911 in one corner to #001b29 in another, so no flat backdrop matches the whole rectangle at once. With alpha there is no rectangle to hide, and the section can be recoloured later without the seam coming back. Costs 352 KB against 145 KB opaque, lazy-loaded below the fold. The text column overlaps the illustration, which slides underneath it. A signal pulse travels down each leader line from label to drawing, the rings beat in phase with it, and a faint second glow drifts behind the scene — the section was the only one on the landing with no motion at all, and a pulse of telemetry moving from device to dashboard is what the platform actually does. All three stop under `prefers-reduced-motion`. Five callouts anchored in percentages over the image so they scale with it — each opens with a ring, hangs its label to the right of the guide line, and the line fades out as it reaches the illustration rather than ending in a marker; below 1200px they turn off and the same content reads as a list. The 3×2 capability grid is gone — it repeated the reading gesture of "Tecnologías que convergen" directly above it, and three of the six capabilities mirrored those layers, so the section carried no new information at that point in the scroll. The position matters for the copy too: "También construimos la tecnología de otros" needs the visitor to have seen the products for "también" to have an antecedent
- Process rail (Entendemos → Diseñamos → Construimos → Integramos → Operamos) added to the landing as a full-width row. It is the one piece of the services story that is not duplicated elsewhere on the page, and it is what demonstrates the "un solo equipo, de la estrategia a producción" the lead promises
- Services teaser CTAs: "Ver las seis capacidades" and "Empezar por un diagnóstico". The previous secondary read "¿Prefieres empezar con un diagnóstico?" — a CTA offers, it does not ask permission
- Landing product panel rebuilt around what a visitor actually asks, in order: what it is (`oneLiner`, twelve words or fewer), whether it is for them (`problem`), what they would have to do (`howItWorks`, three steps), how it is bought (`models`) and whether it is real (`proof`). The previous schema — a 45-word subtitle over twelve chips of identical weight — answered none of them well, and left the three panels with the same silhouette
- Commercial names for the partner modalities: Nexus Connect (own hardware) and Nexus Platform (own brand). "Telemetry as a Service" is not what a buyer searches for, and it forced explaining two brands to sell one. The acronym stays as the technical term in the detail line, never as the hook — all three modalities are SaaS, so labelling only Connect as such reads imprecise
- FAQ answers for Geminis TaaS and white-label now carry the commercial names and link to `/products/nexus/partners`, and the footer points Signum at its own route instead of straight off-domain
- Nexus product page partner card: commercial names and a "Ver detalles técnicos" link, reusing the sub-note pattern the family card already uses. The three-card section is otherwise untouched
- Navbar labels now match the sections they point to, and the stray `#servicios` anchor inside "¿Qué es Geminis Labs?" is renamed `#nosotros`, freeing `/servicios` for the consulting page

### Fixed

- Landing product panel painted a white block on hover over "Explorar Nexus". `nexus.css` is a plain global stylesheet, and SvelteKit preloads a route's CSS when the pointer enters a link to it, so hovering the CTA loaded the Nexus page's styles site-wide. Its `.nx-proof` (the product page's social-proof band, `background: #f2f4f7`) then painted over the landing's own `.nx-proof`. Svelte's scoping stops a component's styles leaking out, not global styles leaking in. The landing's two colliding classes are renamed `.nx-evidence` and `.nx-slide`; `nexus.css` is left untouched. The second collision, `.nx-panel`, was latent since before this change and was also forcing `overflow: hidden` and `cursor: pointer` onto the active product panel
- Hero CTA promised "Descubre Nuestros Servicios" and anchored to the "¿Qué es Geminis Labs?" section. It now points at `/servicios`, which exists
- `.nx-kicker` contrast: `rgba(10,37,64,.55)` on `#eceff2` at 0.72rem is ≈4.3:1, below AA
- Services teaser stretched to a full viewport height with its content floating in the middle, from the unscoped `section { min-height: 100vh; display: flex; align-items: center }` in `login-page.css` leaking site-wide. The new pages already neutralised it; the landing section did not
- Contract-model pills showed a text cursor and lifted on hover, reading as clickable when they are not
- Capability detail rows kept their link in the tab order while collapsed. `grid-template-rows: 0fr` clips the content but does not remove it from focus, so a keyboard user landed on an invisible link; the panel is now `inert` when closed
- Footer linked to `/docs`, which does not exist. Replaced with the new partners route until documentation is real
