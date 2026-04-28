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

These metrics map directly to activation and reliability funnel analysis.

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
