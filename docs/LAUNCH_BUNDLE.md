# Launch Bundle

Use this bundle for Stage 4 distribution review.

## Required Artifacts

- Changelog update: `docs/reliability-changelog.md`
- Canonical contracts:
  - `docs/openapi/endnotes.v1.yaml`
  - `docs/tooling/mcp-endnotes-tool.json`
  - `docs/tooling/prompt-snippets.md`
- Integration chooser: `docs/INTEGRATION_CHOOSER.md`
- Benchmarks: `docs/INTEGRATION_BENCHMARKS.md`
- Reliability policy: `docs/REGRESSION_TRIAGE_SLA.md`

## Public Proof Pack

- Demo section with citation + narrative note behavior.
- Trust-policy snippet showing `publishable` vs `needs_review` in demo/docs.
- Mixed and framework recipes in `examples/recipes/`.

## Approval Checklist

- Artifacts updated in same release branch.
- Golden, contract, fixture, and scorecard checks green.
- Release owner signoff captured.
