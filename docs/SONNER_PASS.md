# Sonner Pass

## What currently feels too complex

- The public package root exported many implementation-heavy types.
- Interaction polish was one-sided: note highlighting existed, marker highlighting did not.
- README simplicity was good, but not yet optimized for a 30-second product understanding.

## What prevents install/use from feeling effortless

- The happy path was present but not emphasized enough as the first mental model.
- API visibility made internals feel like required knowledge.
- Example app looked like a component smoke test rather than a polished product demo.

## What visual details needed polish

- Marker needed a calmer default tone and clearer hover/focus treatment.
- Endnotes heading and metadata hierarchy needed a quieter, more readable balance.
- Active states needed clearer feedback for both note targets and source markers.
- Wrapping and spacing needed to stay graceful for long titles, metadata, and URLs.

## What changed in this pass

- Public exports now prioritize product-level API:
  - `Note`, `Endnote`, `Endnotes`, `EndnotesProvider`, `useEndnotes`
  - `NoteProps`, `EndnotesProps`, `EndnotesTheme`
- Marker and backlink interaction now feel paired:
  - marker click scrolls, focuses, and highlights the matching note
  - backlink click scrolls, focuses, and highlights the originating marker
  - both respect reduced motion
- Default CSS polish updates:
  - tighter variable mapping to host app tokens
  - calmer marker defaults and active state
  - stronger title/metadata/quote hierarchy
  - cleaner wrapping behavior for long content
- README rewritten around a dead-simple install and usage story.
- Example app upgraded to feel like a landing-page-ready essay demo.

## North star

Endnotes should feel tiny, obvious, and production-ready:

```tsx
import { Note, Endnotes } from "endnotes"
import "endnotes/style.css"

<p>
  Good interfaces show their work.
  <Note href="https://example.com">Example Source</Note>
</p>

<Endnotes />
```

No framework feeling, no extra ceremony, no distraction from the content.
