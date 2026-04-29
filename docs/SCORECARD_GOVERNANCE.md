# Scorecard Governance

This document defines how threshold changes are proposed, reviewed, and adopted.

## Current enforced gates

- `passRate >= 0.90`
- `publishableRate >= 0.25`
- `manualReviewRate <= 0.75`
- `trustDecisionAccuracy >= 1.0`
- Endnotes must rank first in comparison scorecard
- Endnotes pass-rate lead over runner-up must be at least `0.10`

## Change policy

Threshold changes require:

1. A PR with rationale tied to quality or risk reduction.
2. Before/after scorecard evidence from `npm run evals` and `npm run evals:compare`.
3. Explicit reviewer sign-off from at least one maintainer focused on trust quality.

## Frequency

- Thresholds should be reviewed monthly.
- Emergency temporary relaxations must include an expiration date and follow-up issue.

## Non-goals

- No silent threshold tuning.
- No threshold changes bundled with unrelated feature work.
