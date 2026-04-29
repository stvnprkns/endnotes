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
- Canonical trust decision helper shipped:
  - `evaluateTrustPolicy` in TypeScript and Python SDK examples
- Weekly reliability changelog pipeline added:
  - `npm run reliability:weekly`
  - [`docs/reliability-changelog.md`](docs/reliability-changelog.md)

## Why this matters

- Integrators can enforce deterministic trust policies before publish.
- Reliability metadata is now machine-readable for agents and gateways.
- Public scorecard format makes quality progress transparent over time.

## Weekly trust workflow

Run this command once per week:

```bash
npm run reliability:weekly
```

This will:

1. Run API + synthetic trust eval cases.
2. Regenerate `evals/reports/latest.json` and `evals/reports/public-scorecard.json`.
3. Append a dated entry to [`docs/reliability-changelog.md`](docs/reliability-changelog.md).

## Next Phase 3 steps

- Expand local/CI trust operations with API key lifecycle verification and usage summaries.
- Add live-provider comparison adapters beyond synthetic profiles.

## Comparison runners (shipped)

Named alternative comparison runners now generate a public comparison scorecard:

- command: `npm run evals:compare`
- output: `evals/reports/public-comparison-scorecard.json`
- providers:
  - `endnotes`
  - `generic_rag_citations`
  - `manual_footnotes`

## Onboarding and growth artifacts (shipped)

- onboarding/free-tier spec: [`docs/ONBOARDING_FREE_TIER.md`](docs/ONBOARDING_FREE_TIER.md)
- weekly scheduled reliability automation: `.github/workflows/weekly-reliability.yml`
- threshold governance policy: [`docs/SCORECARD_GOVERNANCE.md`](docs/SCORECARD_GOVERNANCE.md)
