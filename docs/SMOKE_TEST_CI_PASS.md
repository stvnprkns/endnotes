# Smoke Test + CI Pass

Stage 8 goal: prove Endnotes works outside this repo using real package boundaries.

## What was verified before this pass

- Library exports and type entrypoints were defined in `package.json`.
- CSS export path existed (`endnotes/style.css`).
- Unit tests and demo build existed locally.
- No automated fresh-app smoke project or CI workflow was present.

## Fresh app smoke test setup

- Added isolated app at `smoke/vite-react` (Vite + React + TypeScript).
- App imports only public package paths:
  - `import { Note, Endnotes } from "endnotes"`
  - `import "endnotes/style.css"`
- Smoke scenarios rendered:
  - basic note
  - duplicate source dedupe
  - rich note with metadata and quote
  - note without `href`
  - `Endnotes` list rendering

## CI workflow added

- Added GitHub Actions workflow at `.github/workflows/ci.yml`.
- Triggered on `pull_request` and pushes to `main`.
- Runs:
  - `npm ci`
  - `npm run typecheck --if-present`
  - `npm run lint --if-present`
  - `npm test --if-present`
  - `npm run build --if-present`
  - `npm run build:demo --if-present`
  - `npm run verify:package --if-present`
  - `npm pack --dry-run`
  - `npm run smoke --if-present`

## Repeatable smoke scripts

- Added `scripts/smoke.mjs`:
  - clears `tmp/`
  - builds library
  - packs tarball to `tmp/`
  - installs tarball into smoke app
  - builds smoke app
- Added root script:
  - `npm run smoke`

## Package boundary verification

- Added `scripts/verify-package.mjs`.
- Added root script:
  - `npm run verify:package`
- Checks:
  - `exports["."]` exists
  - `exports["./style.css"]` exists
  - `dist/index.js`, `dist/index.d.ts`, `dist/endnotes.css` exist
  - `files` includes `dist`
  - `sideEffects` includes CSS handling
  - peer deps include `react` and `react-dom`

## Commands run

- `npm install` - passed.
- `npm test` - passed (27 tests).
- `npm run build` - passed.
- `npm run build:demo` - passed.
- `npm run typecheck` - passed.
- `npm run lint` - failed because no root `lint` script exists.
- `npm pack --dry-run` - passed.
- `npm run verify:package` - passed.
- `npm run smoke` - initially failed, then passed after fix.

## Failures found and fixed

- `npm run lint` failed due to missing script in `package.json`.
  - Resolution in this pass: CI step uses `npm run lint --if-present` to avoid false failures until a lint script is intentionally added.
- `npm run smoke` initially failed in smoke app type build with:
  - `Cannot find namespace 'JSX'` from ambient `@types/mdx`.
  - Root cause: smoke TS config did not constrain ambient type packages.
  - Fix: updated `smoke/vite-react/tsconfig.app.json` with explicit `types` (`vite/client`, `react`, `react-dom`) and `skipLibCheck: true`.

## Remaining release blockers

- No Stage 8 blockers found for smoke + CI readiness.
- Optional follow-up: add a root `lint` script if linting should be mandatory rather than optional in CI.
