# API Keys (Dev Server)

The local dev API server includes a lightweight API key management flow for builder dogfooding.

## Environment

- `ENDNOTES_DEV_REQUIRE_API_KEY=true` enforces auth on `POST /v1/endnotes:generate`
- `ENDNOTES_DEV_API_KEY=dev_local_key` bootstrap key created on first run
- `ENDNOTES_DEV_ADMIN_TOKEN=dev_admin_token` protects key-management endpoints

## Key management endpoints

All key-management requests require header:

- `x-endnotes-admin-token: <ENDNOTES_DEV_ADMIN_TOKEN>`

Create key:

```bash
curl -X POST http://localhost:8787/v1/api-keys \
  -H "content-type: application/json" \
  -H "x-endnotes-admin-token: dev_admin_token" \
  -d '{"label":"ci-local"}'
```

List keys:

```bash
curl http://localhost:8787/v1/api-keys \
  -H "x-endnotes-admin-token: dev_admin_token"
```

Revoke key:

```bash
curl -X POST http://localhost:8787/v1/api-keys/revoke/<key_id> \
  -H "x-endnotes-admin-token: dev_admin_token"
```

## Automated verification

Run a lifecycle check (create -> generate -> revoke -> denied):

```bash
npm run verify:dev-keys
```

## Storage

- Hashed keys are stored in `.local/dev-api-keys.json`
- Usage events are appended to `.local/dev-api-usage.log`

Create a summary report from usage logs:

```bash
npm run report:dev-usage
```
