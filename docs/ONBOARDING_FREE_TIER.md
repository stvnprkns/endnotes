# Onboarding and Free Tier

This page defines the default onboarding and free-tier experience for builder adoption.

## Onboarding path (target under 10 minutes)

1. Install package and set API key.
2. Run one `client.generate(...)` call with trust gating enabled.
3. Verify output is publishable (`trust.canPublish`).
4. Enable traces/metrics hooks for production routing.

## Free-tier defaults

- Monthly calls: `1,000`
- Rate limit: `10 requests/minute` per key
- Comparison runner access: included
- Reliability signals (`confidence`, `staleWarning`, `qualityTier`): included
- Priority support and custom thresholds: paid tier

## Upgrade triggers

Teams should move off free tier when one of these becomes true:

- sustained usage > `1,000` calls/month
- need custom trust thresholds by workspace
- need SLA and incident response commitments
- need multi-key/team management and audit exports

## Activation instrumentation to capture

- `endnotes.activation.success` / `endnotes.activation.failure`
- `endnotes.trust.publishable` / `endnotes.trust.needs_review`
- `endnotes.request.latency_ms`

These events map directly to activation and reliability funnel analysis.
