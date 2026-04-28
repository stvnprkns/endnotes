# Endnotes API

Default footnoting API for AI-generated content.

## One-call endpoint

`POST /v1/endnotes:generate`

### Request body

```json
{
  "draft": "Teams make better decisions when they cite primary sources.",
  "style": "numeric",
  "outputFormat": "markdown",
  "locale": "en-US",
  "metadata": {
    "workspaceId": "wk_123"
  }
}
```

### Response body

```json
{
  "requestId": "req_123",
  "citations": [
    {
      "citationId": "cit_001",
      "claim": "Teams make better decisions when they cite primary sources.",
      "endnoteLabel": "1",
      "confidence": 0.93,
      "sourceId": "src_123",
      "sourceUrl": "https://example.org/research",
      "sourceTitle": "Research Paper",
      "stale": false,
      "staleWarning": {
        "reason": "source_outdated",
        "checkedAt": "2026-04-27T12:00:00.000Z",
        "recommendedAction": "manual_review"
      }
    }
  ],
  "sources": [
    {
      "id": "src_123",
      "title": "Research Paper",
      "url": "https://example.org/research",
      "publisher": "Example Journal",
      "publishedAt": "2025-08-01",
      "qualityTier": "high"
    }
  ],
  "renderedText": "Teams make better decisions when they cite primary sources.[^1]\\n\\n[^1]: Research Paper",
  "generatedAt": "2026-04-28T00:00:00.000Z",
  "reliability": {
    "averageConfidence": 0.93,
    "citationsBelowThreshold": 0,
    "staleCitationCount": 0,
    "sourceQualityBreakdown": { "high": 1, "medium": 0, "low": 0 }
  }
}
```

## Reliability signals (Phase 3)

Every response includes reliability signals designed for agent safety checks:

- Per-citation confidence (`citations[].confidence`)
- Source quality tier (`sources[].qualityTier`)
- Stale-source warning details (`citations[].staleWarning`)
- Aggregate reliability summary (`reliability`)

## JavaScript SDK

```ts
import { EndnotesClient } from "endnotes"

const client = new EndnotesClient({ apiKey: process.env.ENDNOTES_API_KEY! })
const result = await client.generate({
  draft: "Generated answer text",
  style: "numeric",
  outputFormat: "markdown"
})
```

## Error model

All non-2xx responses return:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "draft is required",
    "retryable": false
  }
}
```

## OpenAPI and tool-calling assets

- OpenAPI spec: [`docs/openapi/endnotes.v1.yaml`](docs/openapi/endnotes.v1.yaml)
- MCP tool definition: [`docs/tooling/mcp-endnotes-tool.json`](docs/tooling/mcp-endnotes-tool.json)
- Prompt snippets: [`docs/tooling/prompt-snippets.md`](docs/tooling/prompt-snippets.md)

## React UI package (existing exports)

Endnotes continues to ship React footnote UI and toast components:

- `Note`, `Endnote`, `Endnotes`
- `Toaster`, `toaster`
- `EndnotesProvider`, `useEndnotes`
