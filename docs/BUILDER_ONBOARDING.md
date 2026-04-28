# Builder Onboarding

This guide is for contributors building Endnotes itself.

## 1) Install and run app dev server

```bash
npm ci
npm run dev
```

## 2) Run local Endnotes API server

Start the local API used by evals:

```bash
npm run api:dev
```

Default local API base URL:

- `http://localhost:8787/v1`

Health check:

```bash
curl http://localhost:8787/health
```

## 3) Run trust evals locally

Run trust evals against localhost:

```bash
ENDNOTES_API_BASE_URL=http://localhost:8787/v1 npm run evals
```

Shortcut:

```bash
npm run evals:local
```

## 4) Auth-required local mode (recommended for auth dogfooding)

Terminal 1:

```bash
ENDNOTES_DEV_REQUIRE_API_KEY=true ENDNOTES_DEV_API_KEY=dev_local_key npm run api:dev
```

Terminal 2:

```bash
ENDNOTES_API_BASE_URL=http://localhost:8787/v1 ENDNOTES_API_KEY=dev_local_key npm run evals
```

To require key presence in eval runner:

```bash
ENDNOTES_EVAL_REQUIRE_API_KEY=true ENDNOTES_API_BASE_URL=http://localhost:8787/v1 ENDNOTES_API_KEY=dev_local_key npm run evals
```

## 5) Manage dev API keys

Use the local key-management endpoints documented in [`docs/API_KEYS.md`](docs/API_KEYS.md) to create/revoke keys without changing code.

Example: create a new key:

```bash
curl -X POST http://localhost:8787/v1/api-keys \
  -H "content-type: application/json" \
  -H "x-endnotes-admin-token: dev_admin_token" \
  -d '{"label":"my-local-client"}'
```

## 6) Weekly trust workflow

Generate/refresh scorecards and changelog:

```bash
ENDNOTES_API_BASE_URL=http://localhost:8787/v1 npm run reliability:weekly
```

Outputs:

- `evals/reports/latest.json`
- `evals/reports/public-scorecard.json`
- `docs/reliability-changelog.md`

## 7) Pre-PR checklist

```bash
npm test
npm run typecheck
npm run evals
npm run verify:dev-keys
```
