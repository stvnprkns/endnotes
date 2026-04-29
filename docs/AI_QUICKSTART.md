# AI Quickstart

This guide is optimized for agent builders and code assistants.

## 1) Install and configure

```bash
npm install endnotes
```

Set `ENDNOTES_API_KEY` in your runtime environment.

## 2) One-call integration

```ts
import { EndnotesClient, evaluateTrustPolicy } from "endnotes"

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
const trust = evaluateTrustPolicy(result)

if (!trust.canPublish) {
  // Route to fallback or human review for trust-sensitive flows.
  // trust.reasons includes normalized reason codes.
}
```

## 3 canonical recipes

### A) RAG citation insertion

Use the final answer text from your RAG chain as `draft`, then replace visible output with `renderedText`.

### B) Markdown article generation

Generate article first, then call Endnotes with `outputFormat: "markdown"` and persist `renderedText` directly.

### C) Chat answer with inline references

For each assistant answer, call Endnotes and stream back `renderedText` plus a compact list of `sources`.

## LLM-safe minimal schema

When generating UI-facing notes, emit the smallest stable shape first:

```json
{
  "title": "Primary source title",
  "href": "https://example.com/source",
  "kind": "citation"
}
```

Use this field priority:

1. Required-first: `title`, `href` (for sources) or `title` (for narrative notes)
2. Optional semantic: `kind` (`citation` or `note`)
3. Enrichment: `author`, `date`, `source`, `quote`, `description`, `supports`, `type`

Inference defaults for generated UI payloads are non-breaking:

- `href` or `type` present -> treat as `citation`
- no bibliographic metadata -> treat as narrative `note`

## 60-second framework snippets

- React app: inline `<Note />` in prose, render one `<Endnotes />` near content end.
- MDX blog: convert markdown references into `<Note />` via MDX components.
- Docs site: wrap docs shell with `<EndnotesProvider>`, render `<Endnotes />` in page template.

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

Canonical publish gate:

```ts
const trust = evaluateTrustPolicy(result, {
  minAverageConfidence: 0.8,
  minCitationConfidence: 0.7,
  allowLowTierSources: false,
  maxStaleCitations: 0,
  maxCitationsBelowThreshold: 0
})

if (trust.canPublish) {
  // safe to auto-publish
} else {
  // require review: trust.reasons + trust.summary
}
```
