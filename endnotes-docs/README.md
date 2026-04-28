# Endnotes

Beautiful references for React.

Endnotes is a tiny, production-ready references API for modern interfaces. It lets you add inline citations, source previews, and generated endnote sections that inherit your app’s visual style.

```tsx
import { EndnotesProvider, Endnote, Endnotes } from "endnotes"

export default function Page() {
  return (
    <EndnotesProvider adapt>
      <article>
        <p>
          AI interfaces increasingly need visible evidence trails.
          <Endnote
            href="https://example.com/report"
            title="AI Product Interfaces Report"
            source="Example Research"
          />
        </p>

        <Endnotes />
      </article>
    </EndnotesProvider>
  )
}
```

## Why Endnotes?

References are becoming product UI.

AI products need citations. Dashboards need methodology. Internal tools need provenance. Product reports need source trails. Longform writing needs footnotes that do not look like a pasted-on academic bibliography.

Endnotes gives every claim in your product a clean path to the source behind it.

## Features

- Automatic inline reference numbers
- Generated endnotes section
- Click-to-scroll correlation between reference and note
- Backlinks from notes to inline references
- Duplicate source handling
- Source preview popovers
- Mobile drawer behavior
- CSS variable style adaptation
- Theme override support
- Dark mode support
- MDX-friendly API
- SSR-safe IDs and deterministic registration
- Accessible keyboard and screen reader behavior
- Useful development warnings

## Installation

```bash
npm install endnotes
```

> Package name is provisional until published.

## Basic usage

Wrap the relevant page or app section with `EndnotesProvider`.

```tsx
import { EndnotesProvider, Endnote, Endnotes } from "endnotes"

export function Article() {
  return (
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
  )
}
```

## The `adapt` prop

Endnotes can inherit visual styles from the host app.

```tsx
<EndnotesProvider adapt>
  {children}
</EndnotesProvider>
```

When enabled, Endnotes attempts to use common CSS variables and computed styles from the current app, including:

- `--background`
- `--foreground`
- `--muted`
- `--muted-foreground`
- `--border`
- `--primary`
- `--radius`
- `--font-sans`
- `--popover`
- `--popover-foreground`

If no tokens are found, Endnotes falls back to polished defaults.

## Manual theming

```tsx
<EndnotesProvider
  theme={{
    background: "var(--background)",
    foreground: "var(--foreground)",
    muted: "var(--muted-foreground)",
    border: "var(--border)",
    accent: "var(--primary)",
    radius: "var(--radius)",
    fontFamily: "var(--font-sans)",
  }}
>
  {children}
</EndnotesProvider>
```

## Endnote metadata

```tsx
<Endnote
  id="github-survey"
  href="https://example.com/survey"
  title="Developer Survey"
  source="GitHub"
  author="GitHub Research"
  date="2026"
  accessed="2026-04-25"
  quote="A short excerpt from the source."
  supports="Claim about AI-assisted development adoption."
/>
```

## Duplicate sources

By default, Endnotes deduplicates sources by `id`, then by `href`.

```tsx
<Endnote id="survey" href="https://example.com/survey" title="Survey" />
<Endnote id="survey" href="https://example.com/survey" title="Survey" />
```

Both render the same reference number.

If you need two separate notes for the same URL, provide distinct IDs.

```tsx
<Endnote id="survey-adoption" href="https://example.com/survey" />
<Endnote id="survey-workflow" href="https://example.com/survey" />
```

## Interaction modes

Initial supported modes:

```tsx
<EndnotesProvider interaction="scroll" />
<EndnotesProvider interaction="popover" />
<EndnotesProvider interaction="drawer" />
```

Recommended default:

- desktop: popover preview plus scroll affordance
- mobile: drawer preview
- endnotes list: always available where rendered

## Display variants

```tsx
<EndnotesProvider marker="superscript" />
<EndnotesProvider marker="bracket" />
<EndnotesProvider marker="pill" />
```

Examples:

- `superscript`: `¹`
- `bracket`: `[1]`
- `pill`: `Source 1`

## MDX usage

```mdx
AI-generated interfaces need visible provenance.<Endnote
  href="https://example.com/report"
  title="AI Product Interfaces Report"
  source="Example Research"
/>

<Endnotes />
```

## Accessibility

Endnotes should be usable without hover and without a mouse.

Expected behavior:

- inline markers are keyboard-focusable
- markers have descriptive labels
- popovers and drawers can be dismissed with Escape
- focus is restored after closing previews
- endnote backlinks return to the citing text
- reduced motion is respected
- color contrast meets accessible defaults

## Development warnings

In development, Endnotes should warn when:

- `Endnote` is used outside `EndnotesProvider`
- duplicate IDs contain conflicting metadata
- malformed URLs are passed
- `Endnotes` is missing while notes are registered
- required metadata is missing in strict mode

```tsx
<EndnotesProvider strict>
  {children}
</EndnotesProvider>
```

## Project status

Endnotes is currently a product and API concept. This repository should begin with the smallest useful implementation:

1. Provider registry
2. Inline reference marker
3. Generated endnotes list
4. Click-to-scroll behavior
5. Backlinks
6. Duplicate handling
7. Style adaptation
8. Accessible popover preview
9. Mobile drawer fallback
10. MDX compatibility

## What is intentionally out of scope for v0

- BibTeX
- Zotero
- CSL formatting
- hosted source management
- academic bibliography generation
- AI source verification
- browser extensions
- team collaboration
- runtime website scraping

## Design philosophy

Endnotes should feel like Sonner for references: small API, excellent defaults, beautiful motion, and production details handled for you.

The best version is not a bibliography tool.

It is a trust layer for modern interfaces.
