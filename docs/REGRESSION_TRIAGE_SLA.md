# Regression Triage SLA

Reliability and contract regressions are treated as release blockers.

## Severity

- `P0`: contract drift, failing golden suite, failing scorecard gate, broken quickstart path.
- `P1`: degraded reliability metric trend, non-blocking fixture failure, docs-contract mismatch.

## Response Windows

- `P0`: acknowledge within 2 hours, mitigation plan within 4 hours, fix or rollback within 24 hours.
- `P1`: acknowledge within 1 business day, fix scheduled within 3 business days.

## Ownership

- Primary owner: Reliability & Evals agent.
- Secondary owner: AI Contracts agent for schema/tooling drift.
- Release decision owner: Orchestrator agent.

## Required Evidence in Triage

- failing check name and URL
- first bad commit SHA
- impacted files/contracts
- rollback or patch recommendation
