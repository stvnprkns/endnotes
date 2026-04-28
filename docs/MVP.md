# Endnotes MVP

Endnotes is the smallest useful source-trail primitive for React interfaces.

## Product goal

Install it, add one inline note, render one generated list, and ship with confidence.

## In scope

- Deterministic inline numbering by first appearance
- Deduping repeated sources (`id` first, `href` fallback)
- One-to-many marker backlinks
- Source metadata support (`source`, `author`, `date`, `quote`, `supports`, `description`)
- Internal/offline notes without `href`
- Accessible marker/backlink interactions with focus-visible states
- Reduced-motion-safe highlight behavior
- CSS-variable-driven styling that can inherit host app tokens

## Out of scope

- Academic bibliography formatting systems
- External source fetching or URL previews
- Popover/drawer/sidenote product surfaces
- Markdown parser pipelines
- BibTeX, CSL, Zotero integrations
- Analytics, auth, or hosted services

## Definition of done

This should feel obvious:

```tsx
import { Note, Endnotes } from "endnotes"
import "endnotes/style.css"
```

And it should provide clean source trails with minimal setup.
