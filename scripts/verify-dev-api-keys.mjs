import { spawn } from "node:child_process"

const port = Number(process.env.ENDNOTES_DEV_API_PORT ?? 8790)
const adminToken = process.env.ENDNOTES_DEV_ADMIN_TOKEN ?? "dev_admin_token"
const baseUrl = `http://localhost:${port}`

const server = spawn("node", ["scripts/dev-api-server.mjs"], {
  stdio: "pipe",
  env: {
    ...process.env,
    ENDNOTES_DEV_API_PORT: String(port),
    ENDNOTES_DEV_REQUIRE_API_KEY: "true",
    ENDNOTES_DEV_ADMIN_TOKEN: adminToken
  }
})

try {
  await waitForServer(baseUrl)

  const created = await requestJson(`${baseUrl}/v1/api-keys`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-endnotes-admin-token": adminToken
    },
    body: JSON.stringify({ label: "verify-script" })
  })
  const issuedKey = created.key
  const issuedId = created.id

  if (!issuedKey || !issuedId) {
    throw new Error("Failed to issue API key from local dev server")
  }

  const okResponse = await fetch(`${baseUrl}/v1/endnotes:generate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${issuedKey}`
    },
    body: JSON.stringify({ draft: "Trusted claim for verification." })
  })
  if (!okResponse.ok) {
    throw new Error(`Expected generate to succeed before revoke (status ${okResponse.status})`)
  }

  const revokeResponse = await fetch(`${baseUrl}/v1/api-keys/revoke/${issuedId}`, {
    method: "POST",
    headers: {
      "x-endnotes-admin-token": adminToken
    }
  })
  if (!revokeResponse.ok) {
    throw new Error(`Expected revoke to succeed (status ${revokeResponse.status})`)
  }

  const deniedResponse = await fetch(`${baseUrl}/v1/endnotes:generate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${issuedKey}`
    },
    body: JSON.stringify({ draft: "Second claim after revoke." })
  })
  if (deniedResponse.status !== 401) {
    throw new Error(`Expected revoked key to fail with 401 (got ${deniedResponse.status})`)
  }

  console.log("Dev API key lifecycle verification passed.")
} finally {
  server.kill("SIGTERM")
}

async function waitForServer(url) {
  const maxAttempts = 25
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${url}/health`)
      if (response.ok) {
        return
      }
    } catch {
      // keep retrying
    }
    await sleep(200)
  }
  throw new Error("Timed out waiting for dev API server to become healthy")
}

async function requestJson(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`)
  }
  return response.json()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
