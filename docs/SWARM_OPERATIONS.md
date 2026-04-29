# Swarm Operations

Execution board and guardrails for the Endnotes 30-day swarm program.

## Stage Board

Use one source-of-truth board with these columns:

- `backlog`
- `ready`
- `in_progress`
- `blocked`
- `in_review`
- `done`

Mandatory labels:

- `stage:0` through `stage:5`
- `agent:orchestrator`
- `agent:core-api-ui`
- `agent:ai-contracts`
- `agent:developer-dx`
- `agent:reliability-evals`
- `agent:demo-proof`

## Merge Policy

- Contract-first ordering: OpenAPI/MCP/prompt + conformance tests merge before docs-only polish.
- Max PR size: keep changes under 500 net lines unless labeled `needs-large-pr`.
- No feature merge without docs or tests update.
- No docs claims without executable verification in CI.

## Branch Naming

- `swarm/stage0-<topic>`
- `swarm/stage1-<topic>`
- `swarm/stage2-<topic>`
- `swarm/stage3-<topic>`
- `swarm/stage4-<topic>`
- `swarm/stage5-<topic>`

## Daily Standup Template

- Yesterday: what shipped and where.
- Today: tasks by stage + owner agent.
- Blockers: dependency, test failure, review wait.
- Handoffs: which PR or artifact another agent needs.

## Baseline Snapshot (Start of Program)

- Canonical API docs:
  - `docs/openapi/endnotes.v1.yaml`
  - `docs/tooling/mcp-endnotes-tool.json`
  - `docs/tooling/prompt-snippets.md`
- Golden verification command: `npm run test:golden`
- Existing CI gates:
  - `npm test`
  - `npm run test:golden`
  - `npm run evals`
  - `npm run evals:compare`
  - `npm run verify:scorecards`

Record this snapshot before Stage 1 changes and update only in explicit stage reviews.
