# Phase 3 In Progress

Phase 3 goal: build trust moat and distribution flywheel.

## Initial Phase 3 deliverables

- Reliability signals formalized in API contracts:
  - per-citation `confidence`
  - source `qualityTier`
  - stale-source warning details (`staleWarning`)
  - response-level `reliability` summary
- Public eval scorecard output added:
  - `evals/reports/public-scorecard.json`
- Reliability policy snippets added for agent builders:
  - [`docs/AI_QUICKSTART.md`](docs/AI_QUICKSTART.md)

## Why this matters

- Integrators can enforce deterministic trust policies before publish.
- Reliability metadata is now machine-readable for agents and gateways.
- Public scorecard format makes quality progress transparent over time.

## Next Phase 3 steps

- Publish weekly reliability changelog entries.
- Add comparison runners for named alternatives in the scorecard.
- Ship onboarding/free-tier docs and activation funnel instrumentation updates.
