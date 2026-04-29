# Contract Versioning Policy

This policy keeps model-facing contracts deterministic for AI tooling and agent integrations.

## Canonical Contract Set

The following files must remain semantically aligned:

- `docs/openapi/endnotes.v1.yaml`
- `docs/tooling/mcp-endnotes-tool.json`
- `docs/tooling/prompt-snippets.md`

## Versioning Rules

- `v1` remains backward compatible for all additive changes.
- Breaking changes require a new contract version and file namespace (`v2`).
- Canonical minimal note schema must remain:
  - `title`
  - `href`
  - optional `kind`

## Drift Protection

- Contract conformance tests run in CI with `npm run test:contracts`.
- Any schema drift between OpenAPI, MCP, and prompt snippets blocks merge.
- Prompt snippets must keep `kind` defaults:
  - `citation` for bibliographic references
  - `note` for narrative footnotes
