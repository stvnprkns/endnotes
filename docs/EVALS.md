# Endnotes Evaluation Framework

Run baseline quality checks:

```bash
ENDNOTES_API_KEY=your_key npm run evals
```

This executes prompts from [`evals/dataset/baseline.json`](evals/dataset/baseline.json) and writes:

- detailed report: `evals/reports/latest.json`
- public scorecard summary: `evals/reports/public-scorecard.json`

## Current quality gates

- At least one citation returned
- Confidence score present on citations
- Source quality tier present
- Stale-source signal present
- Reliability summary present
- Request completes successfully

Use this as the baseline scorecard and extend with task-specific datasets over time.

## Public scorecards (Phase 3)

The public scorecard format is designed for transparent comparisons against alternatives. Categories currently tracked:

- citation availability
- source quality coverage
- stale signal coverage
