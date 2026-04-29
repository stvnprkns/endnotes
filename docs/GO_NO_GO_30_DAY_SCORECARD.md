# 30-Day Go/No-Go Scorecard

Final release gate for Endnotes swarm execution.

## Gate Metrics

- Activation: median install-to-first-endnote under 15 minutes.
- Simplicity: median integration LOC under 25.
- Reliability:
  - `npm run test:golden` pass
  - `npm run test:contracts` pass
  - `npm run test:fixtures` pass
  - `npm run verify:scorecards` pass
- Adoption: canonical API usage trend is positive week-over-week.

## Defect Policy

- Only `P0` and `P1` issues are in scope during cutover.
- Defer non-critical polish until post-release backlog.

## Decision Outcome

- `go`
- `no_go`

Record outcome in `docs/RELEASE_DECISION_RECORD.md`.
