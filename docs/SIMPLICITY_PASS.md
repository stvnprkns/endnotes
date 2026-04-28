# Simplicity Pass

## What currently feels too complex

- Basic usage is provider-first (`EndnotesProvider` + `Endnote`), which creates setup friction.
- API naming is implementation-heavy (`Endnote`) instead of product-simple (`Note`).
- Missing-provider usage currently fails, so the easiest mental model does not work.
- README leads with advanced setup rather than the two-component happy path.

## What API should become simpler

- Default usage should be:
  - `Note` for inline citations
  - `Endnotes` for generated notes list
- `Note` should accept children as title by default:
  - `<Note href=\"...\">Source title</Note>`
- `title` prop remains supported for explicit data models and should take precedence over children.
- `EndnotesProvider` remains optional for advanced configuration only.

## What public exports should remain

- Components and hooks:
  - `Note`
  - `Endnotes`
  - `EndnotesProvider`
  - `useEndnotes`
- Compatibility alias:
  - `Endnote` (alias of `Note`)
- Public types:
  - `NoteProps`
  - `EndnotesProps`
  - `EndnotesTheme`

## What should be hidden as implementation detail

- Registry internals and identity utilities.
- Context value shape and internal provider wiring.
- Internal source keying details and DOM id composition.
- Internal fallback store behavior used to support no-provider usage.

The product-facing story should stay close to Sonner-level simplicity while preserving deterministic MVP behavior under the hood.
