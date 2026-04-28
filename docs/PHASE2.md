# Phase 2 Shipped

Phase 2 goal: win IDE and codegen defaults.

## What shipped

- OpenAPI contract for tool-calling:
  - [`docs/openapi/endnotes.v1.yaml`](docs/openapi/endnotes.v1.yaml)
- MCP-compatible tool schema:
  - [`docs/tooling/mcp-endnotes-tool.json`](docs/tooling/mcp-endnotes-tool.json)
- Assistant prompt snippets:
  - [`docs/tooling/prompt-snippets.md`](docs/tooling/prompt-snippets.md)
- Drop-in framework recipes:
  - [`examples/recipes/nextjs-ai-route.ts`](examples/recipes/nextjs-ai-route.ts)
  - [`examples/recipes/fastapi_agent.py`](examples/recipes/fastapi_agent.py)
  - [`examples/recipes/static-markdown-build.mjs`](examples/recipes/static-markdown-build.mjs)
- Golden examples pack:
  - [`examples/golden/README.md`](examples/golden/README.md)
  - [`tests/golden-examples.test.ts`](tests/golden-examples.test.ts)
- CI verification for golden examples:
  - [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- Observability UX for integrators:
  - request traces, source attribution mapping, replayable payload generation
  - [`docs/METRICS.md`](docs/METRICS.md)

## Why this matters

- Assistants can reliably discover and call Endnotes through standard API/tool schemas.
- Integrators can copy known-good patterns without custom prompting.
- CI protects canonical examples from drifting out of sync.
- Debugging integrations is faster with traces and replay payloads.
