# Adoption Metrics

The TypeScript client supports lightweight instrumentation via `onMetric`.

```ts
import { EndnotesClient } from "endnotes"

const client = new EndnotesClient({
  apiKey: process.env.ENDNOTES_API_KEY!,
  onMetric(metric) {
    console.log(metric)
  }
})
```

## Emitted metrics

- `endnotes.activation.success`
- `endnotes.activation.failure` (includes `code` tag)
- `endnotes.request.latency_ms`
- `endnotes.trust.publishable`
- `endnotes.trust.needs_review`
- `endnotes.trust.citations_below_threshold`
- `endnotes.trust.stale_citations`

## Mixed footnote reliability checks

Track these verification indicators in CI for citation + narrative note coverage:

- Golden recipe contains both `kind="citation"` and `kind="note"` in `examples/recipes/react-mixed-footnotes.tsx`
- `npm run test:golden` remains green after API or UI schema changes
- Adoption evals preserve canonical minimal note shape (`title`, `href`, optional `kind`) in generated snippets

These metrics map directly to activation and reliability funnel analysis.

## Dev API usage report

For local builder telemetry, the dev API server appends request events to `.local/dev-api-usage.log`.

Generate a quick usage summary:

```bash
npm run report:dev-usage
```

The output includes:

- total request count
- authenticated vs unauthenticated request split
- top API key IDs by request volume

## Request traces

Use `onTrace` to capture request lifecycle events:

```ts
const client = new EndnotesClient({
  apiKey: process.env.ENDNOTES_API_KEY!,
  onTrace(trace) {
    console.log(trace.phase, trace.traceId, trace.status, trace.durationMs)
  }
})
```

## Source attribution debug logs

Use `onSourceAttribution` to inspect citation-to-source mappings returned by the API:

```ts
const client = new EndnotesClient({
  apiKey: process.env.ENDNOTES_API_KEY!,
  onSourceAttribution(event) {
    console.log(event.requestId, event.mapping)
  }
})
```

## Replayable payloads

Generate a replay-safe request shape for debugging:

```ts
const replay = client.buildReplayRequest({
  draft: "Generated answer text",
  style: "numeric",
  outputFormat: "markdown"
})

console.log(replay)
```
