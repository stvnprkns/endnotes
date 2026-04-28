# MVP Scope

This document defines the smallest useful version of Endnotes.

The MVP should prove the core promise:

> Install it, cite something, and it already looks like your app.

## v0 goals

The first version should support a complete references loop:

1. render an inline reference marker
2. register the source
3. generate an ordered endnotes list
4. click the marker to reach the note or preview it
5. click back to return to the original reference
6. inherit the visual style of the host app

## Must have

### Provider registry

- `EndnotesProvider`
- source registration
- stable numbering by first appearance
- duplicate handling by `id` or `href`
- support multiple references pointing to one source

### Inline marker

- `Endnote` component
- automatic number rendering
- accessible button/link behavior
- hover/focus/active states
- marker variants: `superscript`, `bracket`

### Endnotes list

- `Endnotes` component
- ordered list of sources
- title, source, URL, quote, supports fields
- backlinks to inline reference
- active highlight when navigated to

### Interaction

- click marker to scroll to endnote
- highlight matching note
- click backlink to return to inline reference
- optional popover preview on desktop
- mobile drawer fallback if popover is not suitable

### Styling

- polished default styles
- `adapt` mode for common CSS variables
- manual theme overrides
- dark mode support
- className escape hatches

### Accessibility

- keyboard-focusable markers
- aria-labels for references
- Escape closes preview
- focus restore after closing preview
- reduced motion support
- readable focus states

### Production safety

- SSR-safe IDs
- deterministic numbering
- dev warnings
- TypeScript types
- Next.js app router example
- MDX example

## Should have

- copy source link
- compact/card variants for note list
- favicon/domain display
- `strict` mode warnings
- configurable endnotes title
- support internal/offline sources without `href`

## Could have later

- sidenote layout
- static extraction for MDX
- source import helpers
- AI citation range renderer
- evidence panel
- source health checks
- design system presets
- citation linting

## Explicitly out of scope for v0

- BibTeX
- CSL
- Zotero
- academic citation styles
- browser extension
- hosted backend
- analytics
- runtime scraping of external websites
- AI verification/scoring
- team collaboration

## Definition of done

The MVP is done when this works in a Next.js app:

```tsx
<EndnotesProvider adapt>
  <p>
    This is a sourced claim.
    <Endnote
      href="https://example.com"
      title="Example Source"
      source="Example"
    />
  </p>

  <Endnotes />
</EndnotesProvider>
```

And the implementation provides:

- correct numbering
- correct deduping
- click correlation
- backlink return
- usable keyboard behavior
- native-feeling styles
- dark mode behavior
- TypeScript types
- no hydration mismatch
