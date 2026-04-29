# Integration Benchmarks

Median implementation size for first render, measured from canonical recipes.

## LOC Snapshot

- React app (`examples/recipes/react-mixed-footnotes.tsx`): 17 LOC
- MDX blog (`examples/recipes/mdx-blog-post.mdx`): 13 LOC
- Docs site layout (`examples/recipes/docs-site-layout.tsx`): 20 LOC

## Measurement Rules

- Count only functional integration lines (imports, `<Note />`, `<Endnotes />`, provider wiring).
- Exclude blank lines and comments.
- Re-capture this snapshot when recipe files change.

## Simplicity Target

- Keep median integration under 25 LOC for first successful install-to-render path.
