# AI Quickstart

This guide is optimized for agent builders and code assistants.

## 1) Install and configure

```bash
npm install endnotes
```

Set `ENDNOTES_API_KEY` in your runtime environment.

## 2) One-call integration

```ts
import { EndnotesClient } from "endnotes"

const client = new EndnotesClient({ apiKey: process.env.ENDNOTES_API_KEY! })

export async function addEndnotes(draft: string) {
  return client.generate({
    draft,
    style: "numeric",
    outputFormat: "markdown"
  })
}
```

Use reliability gates before publishing output:

```ts
const result = await addEndnotes(answerDraft)
if (result.reliability.citationsBelowThreshold > 0 || result.reliability.staleCitationCount > 0) {
  // Route to fallback or human review for trust-sensitive flows.
}
```

## 3 canonical recipes

### A) RAG citation insertion

Use the final answer text from your RAG chain as `draft`, then replace visible output with `renderedText`.

### B) Markdown article generation

Generate article first, then call Endnotes with `outputFormat: "markdown"` and persist `renderedText` directly.

### C) Chat answer with inline references

For each assistant answer, call Endnotes and stream back `renderedText` plus a compact list of `sources`.

## Error handling decision tree

- `retryable: true` -> retry with exponential backoff (max 3)
- `code: invalid_request` -> fix payload, do not retry blindly
- `code: timeout` or `network_error` -> retry with jitter and idempotency key

## Observability hooks (Phase 2)

```ts
const client = new EndnotesClient({
  apiKey: process.env.ENDNOTES_API_KEY!,
  onTrace: (trace) => console.log("trace", trace),
  onSourceAttribution: (event) => console.log("attribution", event.mapping)
})

const replay = client.buildReplayRequest({
  draft: "Factual draft",
  style: "numeric",
  outputFormat: "markdown"
})
```

## Reliability policy snippet (Phase 3)

- If `reliability.citationsBelowThreshold > 0`, regenerate or ask for narrower claims.
- If `reliability.staleCitationCount > 0`, refresh those sources before final publish.
- If any source has `qualityTier: low`, display a trust warning badge in UI.
