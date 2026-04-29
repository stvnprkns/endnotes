# Migration: Manual Superscripts to Endnotes

Use this when moving from hand-authored superscript anchors to the Endnotes API.

## Basic Migration

From:

```html
Claim text<sup><a href="#fn1">1</a></sup>
```

To:

```tsx
Claim text<Note href="https://example.com/source">Source title</Note>
```

Then render `<Endnotes />` once near article end.

## Edge Cases

- Duplicate references: use the same `href` or explicit `id` so Endnotes dedupes.
- Non-bibliographic footnotes: use `kind="note"` and plain narrative text.
- Mixed content systems: keep `<EndnotesProvider>` at layout/root and only use `<Note />` in content.
- Legacy in-page `#fn1` URLs: map these to stable source URLs during migration to avoid broken anchors.

## Verification Checklist

- All previous superscripts replaced with `<Note />`.
- `<Endnotes />` rendered once per article/template.
- No duplicate endnote entries for repeated sources.
- Keyboard navigation and backlink loop still work.
