# Guía de contribución

Gracias por contribuir a **geminis-labs-web-page**. Este documento define el flujo mínimo para mantener calidad y consistencia.

## Requisitos previos

- **Node.js 22** (ver `.nvmrc` y `engines` en `package.json`)
- npm (incluido con Node)

```bash
nvm use              # si usas nvm
bash scripts/setup.sh
```

`scripts/setup.sh` ejecuta `npm ci` y configura los hooks de Husky.

## Flujo de trabajo

### 1. Rama base

Trabaja siempre desde `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b <tipo>/<descripcion-corta>
```

Prefijos de rama:

| Prefijo     | Uso                                         |
| ----------- | ------------------------------------------- |
| `feature/`  | Nueva funcionalidad                         |
| `fix/`      | Corrección de bug                           |
| `chore/`    | Tooling, docs, dependencias, CI             |
| `refactor/` | Cambio interno sin cambio de comportamiento |
| `test/`     | Solo tests                                  |

### 2. Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/). Husky valida el mensaje con commitlint.

Formato:

```text
<tipo>(<alcance opcional>): <descripción en imperativo>
```

Tipos habituales: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`.

Ejemplos:

```text
feat(billing): add invoice download button
fix(auth): handle expired refresh token
chore: add CONTRIBUTING guidelines
```

### 3. Antes de abrir un PR

Ejecuta localmente (en este orden):

```bash
npm run lint       # prettier + eslint
npm run check      # svelte-check
npm run test       # vitest
npm run build      # build de producción
```

Opcional pero recomendado:

```bash
npm run test:coverage   # verificar cobertura en src/lib/
npm run audit           # vulnerabilidades npm (nivel high+)
npm run scan:secrets    # escaneo de secretos con Gitleaks CLI (gratis, sin licencia)
```

**Gitleaks local (antes de push):** la primera vez descarga el binario a `.cache/gitleaks/`. Escanea el working tree con las reglas por defecto + `.gitleaks.toml`. Exit 0 = sin hallazgos; exit 1 = posible secreto expuesto.

Alternativa si ya lo tienes instalado: `gitleaks detect --source . --redact --verbose`

Los hooks de Husky ejecutan:

- **pre-commit:** lint-staged (formato y lint en archivos staged)
- **commit-msg:** validación Conventional Commits (commitlint)
- **pre-push:** nombre de rama válido y `CHANGELOG.md` cuando hay commits de release note desde `origin/develop`

No omitas hooks con `--no-verify` salvo emergencia justificada.

### 4. Pull Request

- **Base:** `develop`
- Usa la [plantilla de PR](.github/pull_request_template.md)
- Descripción clara del qué y el por qué
- Screenshots o video si hay cambios de UI
- Enlaza issues relacionados (`Closes #123`)

### 5. Changelog

Actualiza `CHANGELOG.md` bajo `[Unreleased]` cuando el PR incluya cambios que deban aparecer en release notes (`feat`, `fix`, `chore`, `refactor`, `docs`, `perf` con impacto visible).

Formato: [Keep a Changelog](https://keepachangelog.com/). Ver [docs/RELEASE.md](docs/RELEASE.md) para el flujo de versionado y tags.

### 6. Requisitos mínimos de merge

- CI en verde (lint, type-check, tests con cobertura, build, audit, Gitleaks, Semgrep)
- Al menos **1 approval** de revisión de código
- Sin conflictos con `develop`
- Sin warnings nuevos de lint en código tocado
- Tests agregados o actualizados cuando cambies lógica en `src/lib/`

### 6. Cobertura de tests

Vitest reporta cobertura en `src/lib/` (excluye rutas y componentes Svelte). CI ejecuta `test:coverage` como reporte; el gate bloqueante es `npm run test`.

Objetivos de cobertura para lógica en `src/lib/services`, `stores` y `utils`:

| Métrica    | Objetivo |
| ---------- | -------- |
| Líneas     | 70%      |
| Funciones  | 70%      |
| Ramas      | 60%      |
| Statements | 70%      |

Si modificas un servicio, store o utilidad en `src/lib/`, agrega o actualiza tests en el mismo PR.

## Convenciones de código

- **Formato:** Prettier (tabs, comillas simples, sin trailing comma). No reformatees archivos fuera del alcance del PR.
- **Lint:** ESLint flat config (`eslint.config.js`). Variables no usadas con prefijo `_` están permitidas.
- **Lenguaje:** JavaScript (no TypeScript por ahora). Tipos vía JSDoc cuando aporten claridad.
- **Estilos:** Tailwind CSS 4 + CSS modular en `src/lib/styles/` cuando aplique.
- **Imports:** Rutas con alias `$lib/` de SvelteKit.

## Estructura relevante

```text
src/lib/services/    # Lógica de API y negocio (prioridad para tests)
src/lib/stores/      # Estado global (Svelte stores)
src/lib/components/  # Componentes reutilizables
src/routes/          # Páginas y layouts (SvelteKit file-based routing)
docs/architecture/   # Dependencias por módulo
```

Consulta [docs/architecture/modules/README.md](docs/architecture/modules/README.md) antes de tocar integraciones con el backend.

## Documentación

- Cambios de arquitectura o decisiones importantes → `docs/adr/` (cuando exista)
- Cambios en módulos y APIs consumidas → actualizar `docs/architecture/modules/`
- Cambios de setup o variables de entorno → actualizar `README.md`

## Reportar problemas

- **Bugs y features:** abre un issue en GitHub
- **Vulnerabilidades de seguridad:** no abras issues públicos; sigue [SECURITY.md](SECURITY.md)

## Preguntas

Si algo no está cubierto aquí, abre un issue o pregunta en el PR antes de asumir convenciones.
