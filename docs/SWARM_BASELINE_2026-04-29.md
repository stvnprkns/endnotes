# Swarm Baseline 2026-04-29

Initial baseline used for Stage 0 setup.

## Contract Baseline

- OpenAPI: `docs/openapi/endnotes.v1.yaml`
- MCP tool: `docs/tooling/mcp-endnotes-tool.json`
- Prompt snippets: `docs/tooling/prompt-snippets.md`
- Canonical minimal note schema:
  - `title`
  - `href`
  - optional `kind`

## Quality Baseline

- Golden command: `npm run test:golden`
- Last known result: pass
- Trust eval gate command: `npm run evals`
- Scorecard gate command: `npm run verify:scorecards`

## Working Baseline Targets

- Activation target: time-to-first-endnote under 15 minutes.
- Simplicity target: quickstart integration under 25 LOC.
- Reliability target: maintain passing golden and scorecard gates.
- Adoption target: canonical API usage trending upward week-over-week.
