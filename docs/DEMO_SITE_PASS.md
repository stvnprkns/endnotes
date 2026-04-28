# Demo Site Pass

## What existed before

- The project had a library-first setup with `build`, `test`, and `typecheck`.
- A visual example existed as `examples/basic/App.tsx`, but no runnable app shell (`index.html`, `main.tsx`, Vite wiring) for local iteration.
- Endnotes UI behavior and CSS primitives were already in place, but tuning was not grounded in a polished workbench page.

## What was added

- A lightweight Vite + React demo app at `examples/demo`:
  - `examples/demo/index.html`
  - `examples/demo/src/main.tsx`
  - `examples/demo/src/App.tsx`
  - `examples/demo/src/app.css`
  - `examples/demo/vite.config.ts`
- Root scripts to run and build the demo:
  - `demo`
  - `dev` (same command as `demo`)
  - `build:demo`
- Package CSS refinements for quieter, more intentional defaults:
  - added `--endnotes-focus` variable
  - tuned marker sizing/interaction polish
  - improved note highlight subtlety
  - improved wrapping and metadata readability
  - reduced-motion transition handling extended to marker/backlink controls

## How to run the demo

```bash
npm install
npm run demo
```

Then open the local Vite URL shown in the terminal.

## UI states covered

- Basic inline note marker and generated endnotes
- Source metadata (`source`, `author`, `date`)
- Rich note fields (`quote`, `supports`)
- Duplicate dedupe (same source in multiple paragraphs)
- Internal/offline note with no `href`
- Long source title wrapping
- Long URL wrapping
- Dark mode toggle proving host token/style inheritance
- Focus-visible treatment for marker, backlink, and toggle
- Marker-to-note and backlink-to-marker navigation with active highlight
- Mobile layout behavior (stacked cards, tighter spacing)

## Known visual issues or tradeoffs

- The demo is intentionally editorial and minimal, not a full docs or marketing experience.
- Reduced-motion mode keeps highlight behavior but removes transitions; highlight duration remains short by design.
- The demo imports package CSS from source to optimize local iteration speed during this pass.

## Product goal

This pass establishes a polished local workbench where Endnotes can be judged in realistic writing. The focus remains the tiny, primary API:

```tsx
import { Note, Endnotes } from "endnotes"
import "endnotes/style.css"
```
