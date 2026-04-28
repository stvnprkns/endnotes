import { createHash, randomBytes } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createServer } from "node:http"

const port = Number(process.env.ENDNOTES_DEV_API_PORT ?? 8787)
const requireApiKey = process.env.ENDNOTES_DEV_REQUIRE_API_KEY === "true"
const bootstrapApiKey = process.env.ENDNOTES_DEV_API_KEY ?? "dev_local_key"
const dataDirPath = new URL("../.local/", import.meta.url)
const keyStorePath = new URL("../.local/dev-api-keys.json", import.meta.url)
const usageLogPath = new URL("../.local/dev-api-usage.log", import.meta.url)
const adminToken = process.env.ENDNOTES_DEV_ADMIN_TOKEN ?? "dev_admin_token"

const server = createServer(async (req, res) => {
  const { method, url, headers } = req

  await ensureKeyStore()

  if (method === "GET" && url === "/health") {
    return writeJson(res, 200, { ok: true, service: "endnotes-dev-api" })
  }
  if (method === "POST" && url === "/v1/api-keys") {
    return createApiKey(req, res)
  }
  if (method === "GET" && url === "/v1/api-keys") {
    return listApiKeys(req, res)
  }
  if (method === "POST" && url?.startsWith("/v1/api-keys/revoke/")) {
    return revokeApiKey(req, res, url.replace("/v1/api-keys/revoke/", ""))
  }

  if (method !== "POST" || url !== "/v1/endnotes:generate") {
    return writeJson(res, 404, {
      error: { code: "not_found", message: "Route not found", retryable: false }
    })
  }

  const token = extractBearerToken(headers.authorization)
  if (requireApiKey) {
    const valid = token ? await isValidApiKey(token) : false
    if (!valid) {
      return writeJson(res, 401, {
        error: { code: "unauthorized", message: "Invalid API key", retryable: false }
      })
    }
  }

  const rawBody = await readBody(req)
  let payload
  try {
    payload = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    return writeJson(res, 400, {
      error: { code: "invalid_request", message: "Request body must be valid JSON", retryable: false }
    })
  }

  const draft = typeof payload.draft === "string" ? payload.draft.trim() : ""
  if (!draft) {
    return writeJson(res, 422, {
      error: { code: "invalid_request", message: "draft is required", retryable: false }
    })
  }

  const generatedAt = new Date().toISOString()
  const claim = draft.split(".")[0]?.trim() || draft
  const confidence = clampConfidence(draft)
  const stale = /outdated|stale|deprecated/i.test(draft)
  const qualityTier = /rumor|unverified|unknown/i.test(draft) ? "low" : "high"
  const citationBelowThreshold = confidence < 0.8 ? 1 : 0
  await appendUsageLog({
    at: generatedAt,
    route: "/v1/endnotes:generate",
    authenticated: Boolean(token),
    keyId: token ? await resolveKeyId(token) : null
  })

  const response = {
    requestId: `dev_${Date.now().toString(36)}`,
    citations: [
      {
        citationId: "cit_dev_1",
        claim,
        endnoteLabel: "1",
        confidence,
        sourceId: "src_dev_1",
        sourceUrl: "https://example.com/dev-source",
        sourceTitle: "Endnotes Dev Source",
        stale,
        ...(stale
          ? {
              staleWarning: {
                reason: "source_outdated",
                checkedAt: generatedAt,
                recommendedAction: "refresh_source"
              }
            }
          : {})
      }
    ],
    sources: [
      {
        id: "src_dev_1",
        title: "Endnotes Dev Source",
        url: "https://example.com/dev-source",
        publisher: "Endnotes Dev",
        publishedAt: "2026-04-01",
        qualityTier
      }
    ],
    renderedText: `${draft}[^1]\n\n[^1]: Endnotes Dev Source - https://example.com/dev-source`,
    generatedAt,
    reliability: {
      averageConfidence: confidence,
      citationsBelowThreshold: citationBelowThreshold,
      staleCitationCount: stale ? 1 : 0,
      sourceQualityBreakdown: {
        high: qualityTier === "high" ? 1 : 0,
        medium: 0,
        low: qualityTier === "low" ? 1 : 0
      }
    }
  }

  return writeJson(res, 200, response)
})

server.listen(port, () => {
  console.log(
    `Endnotes dev API listening on http://localhost:${port} (auth ${
      requireApiKey ? "required" : "optional"
    })`
  )
})

function writeJson(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader("content-type", "application/json")
  res.end(JSON.stringify(body))
}

function extractBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== "string" || !headerValue.startsWith("Bearer ")) {
    return ""
  }
  return headerValue.slice("Bearer ".length)
}

function requireAdminTokenOrReject(res, headers) {
  const provided = headers["x-endnotes-admin-token"]
  if (provided !== adminToken) {
    writeJson(res, 401, {
      error: { code: "unauthorized", message: "Missing or invalid admin token", retryable: false }
    })
    return false
  }
  return true
}

async function ensureKeyStore() {
  await mkdir(dataDirPath, { recursive: true })
  try {
    await readFile(keyStorePath, "utf8")
  } catch {
    const bootstrapRecord = createKeyRecord(bootstrapApiKey, "bootstrap")
    await writeFile(
      keyStorePath,
      JSON.stringify(
        {
          keys: [bootstrapRecord]
        },
        null,
        2
      )
    )
  }
}

async function readKeyStore() {
  const parsed = JSON.parse(await readFile(keyStorePath, "utf8"))
  return Array.isArray(parsed.keys) ? parsed.keys : []
}

async function writeKeyStore(keys) {
  await writeFile(keyStorePath, JSON.stringify({ keys }, null, 2))
}

function hashApiKey(apiKey, salt) {
  return createHash("sha256").update(`${salt}:${apiKey}`).digest("hex")
}

function createKeyRecord(plainKey, label = "generated") {
  const salt = randomBytes(8).toString("hex")
  const keyId = `key_${randomBytes(5).toString("hex")}`
  return {
    id: keyId,
    label,
    createdAt: new Date().toISOString(),
    revokedAt: null,
    salt,
    hash: hashApiKey(plainKey, salt)
  }
}

async function isValidApiKey(apiKey) {
  const keys = await readKeyStore()
  return keys.some((record) => !record.revokedAt && record.hash === hashApiKey(apiKey, record.salt))
}

async function resolveKeyId(apiKey) {
  const keys = await readKeyStore()
  const match = keys.find((record) => !record.revokedAt && record.hash === hashApiKey(apiKey, record.salt))
  return match?.id ?? null
}

async function createApiKey(req, res) {
  if (!requireAdminTokenOrReject(res, req.headers)) {
    return
  }
  const rawBody = await readBody(req)
  let payload = {}
  try {
    payload = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    return writeJson(res, 400, {
      error: { code: "invalid_request", message: "Request body must be valid JSON", retryable: false }
    })
  }
  const label = typeof payload.label === "string" && payload.label.trim() ? payload.label.trim() : "generated"
  const plainKey = `en_dev_${randomBytes(16).toString("hex")}`
  const record = createKeyRecord(plainKey, label)
  const keys = await readKeyStore()
  keys.push(record)
  await writeKeyStore(keys)
  return writeJson(res, 201, {
    id: record.id,
    label: record.label,
    createdAt: record.createdAt,
    key: plainKey
  })
}

async function listApiKeys(req, res) {
  if (!requireAdminTokenOrReject(res, req.headers)) {
    return
  }
  const keys = await readKeyStore()
  return writeJson(res, 200, {
    keys: keys.map((record) => ({
      id: record.id,
      label: record.label,
      createdAt: record.createdAt,
      revokedAt: record.revokedAt
    }))
  })
}

async function revokeApiKey(req, res, keyId) {
  if (!requireAdminTokenOrReject(res, req.headers)) {
    return
  }
  const keys = await readKeyStore()
  const target = keys.find((record) => record.id === keyId)
  if (!target) {
    return writeJson(res, 404, {
      error: { code: "not_found", message: "API key not found", retryable: false }
    })
  }
  target.revokedAt = new Date().toISOString()
  await writeKeyStore(keys)
  return writeJson(res, 200, { ok: true, id: keyId, revokedAt: target.revokedAt })
}

async function appendUsageLog(entry) {
  const current = await readFile(usageLogPath, "utf8").catch(() => "")
  await writeFile(usageLogPath, `${current}${JSON.stringify(entry)}\n`)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ""
    req.on("data", (chunk) => {
      data += chunk
    })
    req.on("end", () => resolve(data))
    req.on("error", reject)
  })
}

function clampConfidence(draft) {
  if (/outdated|stale|deprecated/i.test(draft)) {
    return 0.73
  }
  if (/rumor|unverified|unknown/i.test(draft)) {
    return 0.66
  }
  return 0.91
}
