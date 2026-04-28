# Golden Examples

These are the canonical integration patterns used for default-assistant adoption:

- `examples/recipes/nextjs-ai-route.ts`
- `examples/recipes/fastapi_agent.py`
- `examples/recipes/static-markdown-build.mjs`

CI verifies these examples remain valid and runnable via `npm run test:golden`.

All three recipes now include a canonical trust decision (`publishable` vs `needs_review`) before final output.
