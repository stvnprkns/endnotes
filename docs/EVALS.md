# Endnotes Evaluation Framework

Run baseline quality checks:

```bash
ENDNOTES_API_KEY=your_key npm run evals
```

If `ENDNOTES_API_KEY` is not set, the runner still executes synthetic trust fixtures and skips live API cases.

## Local builder workflow (recommended while building Endnotes)

Point evals at your local API server first:

```bash
npm run api:dev
```

Then run evals against localhost:

```bash
ENDNOTES_API_BASE_URL=http://localhost:8787/v1 npm run evals
```

Or use the helper script:

```bash
npm run evals:local
```

Notes:

- `ENDNOTES_API_KEY` is optional by default in eval runner.
- If your local API enforces auth, set `ENDNOTES_API_KEY=dev_local_key` (or your chosen dev key).
- To hard-require a key in evals, set `ENDNOTES_EVAL_REQUIRE_API_KEY=true`.
- To enforce auth in the local dev API server, set `ENDNOTES_DEV_REQUIRE_API_KEY=true`.

This executes prompts from [`evals/dataset/baseline.json`](evals/dataset/baseline.json) and writes:

- detailed report: `evals/reports/latest.json`
- public scorecard summary: `evals/reports/public-scorecard.json`

It also runs deterministic trust policy fixtures from [`evals/dataset/trust-cases.json`](evals/dataset/trust-cases.json) to validate publish-vs-review behavior.

## Current quality gates

- At least one citation returned
- Confidence score present on citations
- Source quality tier present
- Stale-source signal present
- Reliability summary present
- Request completes successfully
- Trust decision matches expected outcome for synthetic trust fixtures

## Trust thresholds

Default trust gates used by evals:

- `minAverageConfidence`: `0.8`
- `minCitationConfidence`: `0.7`
- `allowLowTierSources`: `false`
- `maxStaleCitations`: `0`
- `maxCitationsBelowThreshold`: `0`

Scorecard thresholds:

- `minPassRate`: `0.9`
- `minPublishableRate`: `0.25`
- `maxManualReviewRate`: `0.75`
- `minTrustDecisionAccuracy`: `1.0`

Use this as the baseline scorecard and extend with task-specific datasets over time.

## Public scorecards (Phase 3)

The public scorecard format is designed for transparent comparisons against alternatives. Categories currently tracked:

- signal completeness (`citationAvailability`, `confidenceCoverage`, `sourceQualityCoverage`, `staleSignalCoverage`)
- trust outcomes (`passRate`, `publishableRate`, `manualReviewRate`, `trustDecisionAccuracy`)

## Comparison runners for named alternatives

Generate a comparison scorecard with Endnotes and named alternative profiles:

```bash
npm run evals:compare
```

Output:

- `evals/reports/public-comparison-scorecard.json`

Current named profiles:

- `endnotes`
- `generic_rag_citations` (simulated baseline RAG citation pipeline)
- `manual_footnotes` (simulated manual footnote workflow)

Note: comparison alternatives are synthetic behavior profiles for transparent benchmarking shape and regression tracking. They are not live measurements against third-party APIs.

## CI threshold enforcement

CI enforces scorecard quality with:

```bash
npm run verify:scorecards
```

Current enforced checks:

- public scorecard thresholds (`passRate`, `publishableRate`, `manualReviewRate`, `trustDecisionAccuracy`)
- Endnotes must rank first in comparison scorecard
- Endnotes must lead runner-up by at least 10 percentage points in `passRate`

Threshold change process is documented in [`docs/SCORECARD_GOVERNANCE.md`](docs/SCORECARD_GOVERNANCE.md).

## Artifact policy

Generated report files in `evals/reports/*.json` are treated as runtime artifacts and are uploaded by CI. They are not source-of-truth files and are ignored in Git, except `evals/reports/.gitkeep`.
