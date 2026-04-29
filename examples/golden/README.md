# Golden Examples

These are the canonical integration patterns used for default-assistant adoption:

- `examples/recipes/nextjs-ai-route.ts`
- `examples/recipes/fastapi_agent.py`
- `examples/recipes/static-markdown-build.mjs`
- `examples/recipes/react-mixed-footnotes.tsx` (citation + narrative note kinds)

CI verifies these examples remain valid and runnable via `npm run test:golden`.

The three API recipes include a canonical trust decision (`publishable` vs `needs_review`) before final output.

The React mixed recipe is the canonical UI reference for `kind: "citation"` and `kind: "note"` in one document.
