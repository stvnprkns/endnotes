# Endnotes

The default footnoting API for AI-generated content.

Endnotes turns generated claims into validated, formatted endnotes with source metadata and confidence scores through one API call.

## Core wedge

- One job: turn draft AI output into trustworthy endnotes
- One call: `POST /v1/endnotes:generate`
- One success metric: time-to-first-citation under 15 minutes

## API-first quick start

```ts
import { EndnotesClient, evaluateTrustPolicy } from "endnotes"

const client = new EndnotesClient({
  apiKey: process.env.ENDNOTES_API_KEY!
})

const result = await client.generate({
  draft: "Teams make better decisions when they cite primary sources.",
  style: "numeric",
  outputFormat: "markdown"
})

const trust = evaluateTrustPolicy(result)
if (!trust.canPublish) {
  console.warn("Needs review", trust.reasons)
}

console.log(result.renderedText)
```

See [`docs/API.md`](docs/API.md) for the request/response contract and [`docs/AI_QUICKSTART.md`](docs/AI_QUICKSTART.md) for copy-paste recipes.

## Python quick start

```py
from sdk.python.endnotes_sdk import EndnotesClient

client = EndnotesClient(api_key="YOUR_API_KEY")
result = client.generate(
    draft="Teams make better decisions when they cite primary sources.",
    style="numeric",
    output_format="markdown",
)

print(result["renderedText"])
```

---

Beautiful references and toasts for React.

Add citations, sources, and evidence trails that feel native to your product.

## Install

```bash
npm install endnotes
```

## 30-second quick start

```tsx
import { Note, Endnotes, Toaster, toaster } from "endnotes"
import "endnotes/style.css"

export function Article() {
  function onSave() {
    toaster.success("Saved", {
      description: "Your draft is synced to cloud."
    })
  }

  return (
    <>
      <p>
        Good interfaces show their work.
        <Note href="https://example.com">Example Source</Note>
      </p>
      <button onClick={onSave}>Save</button>
      <Endnotes />
      <Toaster />
    </>
  )
}
```

### 60-second framework starts

- React app: use `<Note />` inline and render one `<Endnotes />` near article end.
- MDX blog: map markdown references to `<Note />` and keep `<Endnotes />` in post layout.
- Docs site: add `<EndnotesProvider>` at docs root and call `<Note />` from MDX components.

## Promise toasts

```tsx
toaster.promise(saveDraft(), {
  loading: "Saving draft...",
  success: "Draft saved",
  error: "Save failed"
})
```

## Rich notes

```tsx
<Note
  href="https://example.com/research"
  source="Interface Research Group"
  author="Mara Bell"
  date="2026"
  quote="Users trusted generated answers more when sources appeared close to the claim."
>
  Source Trails in AI Products
</Note>
```

Repeated sources dedupe automatically:

```tsx
<Note href="https://example.com/report">Trust Report</Note>
<Note href="https://example.com/report">Trust Report</Note>
```

## Citation and note kinds

Use one API for both bibliography-style sources and narrative footnotes.

```tsx
<p>
  The benchmark improved by 17%.
  <Note
    kind="citation"
    href="https://example.com/benchmarks"
    type="report"
    source="Engineering Report"
    date="2026"
  >
    Performance Report
  </Note>
</p>

<p>
  The migration took two weeks.
  <Note kind="note">Timeline based on internal team logs.</Note>
</p>
```

Default inference is non-breaking:

- If `href` or `type` exists, Endnotes treats the item as a `citation`
- If bibliographic fields are missing, Endnotes treats the item as a narrative `note`

## Toast actions and positioning

```tsx
<Toaster position="top-right" maxVisible={4} closeButton />

toaster("Item archived", {
  action: { label: "Undo", onClick: () => restoreItem() },
  cancel: { label: "Dismiss", onClick: () => {} }
})
```

## Migrate from manual superscript links

Replace this:

```html
Claim text<sup><a href="#fn1">1</a></sup>
```

With this:

```tsx
Claim text<Note href="https://example.com/source">Source title</Note>
```

Then render `<Endnotes />` once at the end of the article/template.

## Styling

Endnotes ships plain CSS and maps cleanly to common app tokens (`--foreground`, `--muted-foreground`, `--background`, `--border`, `--primary`, `--radius`).

```css
:root {
  --endnotes-accent: var(--primary);
  --endnotes-surface: color-mix(in srgb, var(--background) 94%, transparent);
  --endnotes-radius: 10px;
}
```

### Common token overrides

```css
:root {
  --endnotes-accent: #2f6feb;
  --endnotes-focus: color-mix(in srgb, var(--endnotes-accent) 45%, transparent);
  --endnotes-border: color-mix(in srgb, var(--foreground) 18%, transparent);
  --endnotes-highlight: color-mix(in srgb, var(--endnotes-accent) 12%, transparent);
}
```

## Compatibility

- React: `^18.2.0 || ^19.0.0`
- React DOM: `^18.2.0 || ^19.0.0`
- Browsers: latest stable Chrome, Edge, Firefox, Safari
- SSR: supported (interactive behavior activates on the client)

See [`docs/BROWSER_SUPPORT.md`](docs/BROWSER_SUPPORT.md) for runtime assumptions and validation guidance.

## Accessibility

Endnotes includes keyboard-friendly marker and backlink navigation, focus-visible treatment, and reduced-motion-safe interaction cues.

See [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) for verification guidance.

## Limitations

Endnotes intentionally stays small:

- not a bibliography or academic formatting engine
- no external URL fetching or preview generation
- no markdown citation parser pipeline
- no analytics or hosted source management

## Demo

Run the combined landing + docs + workbench site:

```bash
npm run demo
```

## Smoke test

Endnotes includes a fresh Vite React TypeScript smoke app that installs the packed local package and verifies real consumer imports.

```bash
npm run smoke
```

## API

See [`docs/API.md`](docs/API.md) for the full API reference.

For local dogfooding while building Endnotes itself, run evals against a local API base URL:

```bash
ENDNOTES_API_BASE_URL=http://localhost:8787/v1 npm run evals
```

## AI adoption assets

- Quickstart for agent builders: [`docs/AI_QUICKSTART.md`](docs/AI_QUICKSTART.md)
- OpenAPI tool-calling spec: [`docs/openapi/endnotes.v1.yaml`](docs/openapi/endnotes.v1.yaml)
- MCP tool definition: [`docs/tooling/mcp-endnotes-tool.json`](docs/tooling/mcp-endnotes-tool.json)
- Prompt snippets for assistants: [`docs/tooling/prompt-snippets.md`](docs/tooling/prompt-snippets.md)
- LLM-safe minimal schema guidance: [`docs/AI_QUICKSTART.md`](docs/AI_QUICKSTART.md)
- Golden examples pack: [`examples/golden/README.md`](examples/golden/README.md)
- Golden examples verification: [`tests/golden-examples.test.ts`](tests/golden-examples.test.ts)
- CI workflow with golden checks: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- Quality scorecards: [`docs/EVALS.md`](docs/EVALS.md)
- Comparison scorecards: `evals/reports/public-comparison-scorecard.json`
- Adoption instrumentation: [`docs/METRICS.md`](docs/METRICS.md)
- Weekly reliability changelog workflow: [`docs/PHASE3.md`](docs/PHASE3.md)
- Weekly reliability updates: [`docs/reliability-changelog.md`](docs/reliability-changelog.md)
- Builder setup and local trust workflow: [`docs/BUILDER_ONBOARDING.md`](docs/BUILDER_ONBOARDING.md)
- Dev API key management: [`docs/API_KEYS.md`](docs/API_KEYS.md)

## Phase 2 shipped

See [`docs/PHASE2.md`](docs/PHASE2.md) for the shipped IDE/codegen default assets and verification coverage.

## Phase 3 in progress

See [`docs/PHASE3.md`](docs/PHASE3.md) for trust moat and distribution work (reliability signals + public scorecards).

## Release

- Publish checklist: [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)
