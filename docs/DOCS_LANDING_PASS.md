# Docs + Landing Pass

## What existed before

- A functional package with core components and tests.
- A local demo workbench in `examples/demo`, but as a single monolithic page.
- A concise `README.md`, plus prior pass notes in `docs/`.
- Historical product docs in `endnotes-docs/`, not mirrored in root `docs/`.

## What was added in this pass

- A combined landing + docs + demo single page built on the existing demo app.
- Explicit sections for:
  - hero
  - install
  - usage
  - rich notes + duplicate source behavior
  - styling
  - API reference
  - principles
  - stress/workbench states
- A reusable, plain-CSS `CodeBlock` component for install and API clarity.
- A simple sticky header with section anchors, GitHub placeholder, and dark mode toggle.
- Root docs now include:
  - `docs/API.md`
  - `docs/MVP.md`
  - `docs/DESIGN_PRINCIPLES.md`
- README now follows a one-minute install path and points to `docs/API.md`.
- Export confidence test now validates style export metadata (`./style.css`).

## How to run

```bash
npm install
npm run build
npm test
npm run demo
npm run build:demo
```

## Decisions made

- Kept the existing lightweight Vite demo foundation instead of adding a docs framework.
- Kept scope strict: no new citation features, no popovers/drawers/sidenotes, no source fetching.
- Tuned copy toward a small, tasteful open-source package tone.
- Documented only implemented API behavior; reserved props are called out as such.
- Made demo code import from `endnotes` and `endnotes/style.css` via Vite aliases to mirror real consumer usage while preserving local development speed.

## What remains before launch

- Replace the GitHub placeholder link with the real repository URL.
- Run a packaging smoke test (`npm pack`) and verify tarball contents manually before publish.
- Add release notes and versioning/changelog workflow for first public release.
- Validate docs/demo content once package publish name/version strategy is finalized.

## Product goal

Endnotes should be understood, trusted, and installable in under one minute:

```tsx
import { Note, Endnotes } from "endnotes"
import "endnotes/style.css"
```
