# Integration Chooser

Use this quick guide to pick the default Endnotes integration path.

## Choose by Content Surface

- **React app article pages**: use `examples/recipes/react-mixed-footnotes.tsx`
- **MDX blog/post pipeline**: use `examples/recipes/mdx-blog-post.mdx`
- **Docs site layout shell**: use `examples/recipes/docs-site-layout.tsx`
- **API-generated content flow**: use `examples/recipes/nextjs-ai-route.ts`

## Choose by Team Priority

- **Fastest setup**: React mixed recipe (fewest moving parts).
- **Authoring workflow fidelity**: MDX recipe.
- **Shared site-wide behavior**: docs layout recipe with provider at root.
- **Trust-policy automation**: Next.js API route recipe with `publishable` vs `needs_review` gating.

## Default Recommendation

Start with one recipe only, ship the first render, then add customization.

- Keep API surface minimal (`<Note />`, `<Endnotes />`, optional `kind`).
- Keep trust-policy output deterministic (`publishable` vs `needs_review`).
