# Endnotes Vision

Endnotes is a tiny, beautiful references API for modern interfaces.

It gives React products a native-feeing way to connect claims, sources, footnotes, evidence, and citations without bolting on an academic publishing system.

The goal is simple:

> Add references that look like they belong in your app.

## Why this exists

The web is filling up with claims.

AI answers cite sources. Product pages reference research. Internal tools expose provenance. Dashboards need methodology notes. Design case studies need receipts. Generated reports need evidence trails. But the UI patterns for references are still stuck between Wikipedia footnotes, academic bibliographies, and ugly chatbot source pills.

Most teams do not need a citation manager.

They need a polished trust layer.

Endnotes exists for that space: the layer between a sentence and the source that supports it.

## The problem

References are deceptively hard.

A production-ready reference system needs to handle:

- inline numbering
- source registration
- duplicate source detection
- click correlation between text and note
- hover previews
- mobile behavior
- endnote lists
- backlinks
- dark mode
- accessibility
- SSR safety
- theming
- imperfect metadata
- MDX content
- generated AI output

Most apps either ignore this or rebuild a brittle version from scratch.

Endnotes should make this feel obvious.

## The product promise

Endnotes gives every claim in your product a beautiful, native-feeling source trail.

It should feel:

- **small**: easy to install and understand
- **native**: inherits the host product’s visual style
- **credible**: makes sources feel trustworthy, not decorative
- **accessible**: works with keyboard, screen readers, and reduced motion
- **production-ready**: stable IDs, SSR-safe behavior, useful warnings
- **unacademic**: useful for products, reports, docs, AI tools, and essays

## What Endnotes is

Endnotes is:

- a React component library
- a reference registry
- an inline citation primitive
- a generated endnotes section
- a source preview system
- a styling adapter for host apps
- a trust UI layer for modern products

## What Endnotes is not

Endnotes is not:

- a bibliography manager
- a Zotero replacement
- a BibTeX-first tool
- a CSL formatting engine
- an academic publishing framework
- a hosted citation database
- an AI source verification product
- a browser extension

Those may become integrations later, but they are not the wedge.

## Core insight

Footnotes are for essays.

Receipts are for claims.

Endnotes should support both, but the product should be designed around the modern claim: a sentence, a number, a source, and a clear path back.

## Design principles

### 1. The installed component should disappear into the product

Endnotes should inherit typography, color, radius, border, and spacing from the host app whenever possible.

The default experience should feel like:

```tsx
<EndnotesProvider adapt>
```

Not like adopting a new design system.

### 2. The API should be smaller than the problem

The core API should stay obvious:

```tsx
<Endnote href="..." title="..." source="..." />
<Endnotes />
```

Advanced behavior should layer on without making the default feel heavy.

### 3. Sources should support claims, not just decorate them

A reference should be able to say what it supports.

```tsx
<Endnote
  href="https://example.com"
  title="AI Developer Survey"
  source="Example Research"
  supports="Claim about AI-assisted coding adoption"
/>
```

This makes the source card useful, not ornamental.

### 4. Production behavior matters

The boring details are the product:

- deterministic numbering
- duplicate handling
- keyboard navigation
- screen reader labels
- mobile fallback
- SSR-safe rendering
- route-safe anchors
- useful dev warnings

### 5. The product should be beautiful before it is powerful

Do not start with academic formats, importers, or citation processors.

Start with the simplest possible use case and make it excellent.

## Primary use cases

### AI answers

Show source trails for generated responses without making the UI look like a research paper.

### Product reports

Attach methodology, datasets, and external references to claims in dashboards and reports.

### Portfolio and editorial pages

Add tasteful footnotes, sidenotes, and references to longform writing.

### Internal tools

Expose where a number, decision, or generated recommendation came from.

### Documentation

Reference RFCs, pull requests, specs, datasets, and supporting docs inline.

## The first magical moment

A developer installs Endnotes, writes this:

```tsx
<EndnotesProvider adapt>
  <p>
    AI interfaces increasingly need visible evidence trails.
    <Endnote
      href="https://example.com/report"
      title="AI Product Interfaces Report"
      source="Example Research"
    />
  </p>

  <Endnotes />
</EndnotesProvider>
```

And the result already looks like their app.

The citation number feels native.

The hover card feels native.

The endnotes section feels native.

No theme work. No CSS wrestling. No academic residue.

## Long-term direction

Endnotes can grow toward:

- MDX plugins
- source importers
- generated answer citation ranges
- evidence panels for AI products
- source health checks
- citation linting
- design system adapters
- framework-specific packages
- static extraction for content sites

But the center should stay the same:

> Beautiful references that inherit your product’s style.
