# Format Support

Endnotes supports `.md`, `.mdx`, and HTML content with one canonical marker contract.

## Canonical Marker Syntax

Use this inline marker in markdown or MDX content:

```md
[^endnote title="Source title" href="https://example.com/source" kind="citation"]
```

For narrative notes:

```md
[^endnote title="Rollout note for editors" kind="note"]
```

## Field Mapping

- `title` (required): visible note text.
- `href` (optional): source URL for bibliography-style citations.
- `kind` (optional): `citation` or `note` (defaults to `citation`).

## Format Paths

- `.md` / `.mdx`: use `transformMarkdownEndnotes()`.
- HTML with `<endnote ...>...</endnote>` tags: use `transformHtmlEndnotes()`.
- React pages can continue using `<Note />` and `<Endnotes />` directly.
