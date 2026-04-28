import { readFile } from "node:fs/promises"

const usageLogPath = new URL("../.local/dev-api-usage.log", import.meta.url)

const raw = await readFile(usageLogPath, "utf8").catch(() => "")
const lines = raw
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)

if (lines.length === 0) {
  console.log("No dev API usage entries found.")
  process.exit(0)
}

const events = lines.map((line) => {
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
}).filter(Boolean)

const total = events.length
const authenticated = events.filter((event) => event.authenticated).length
const unauthenticated = total - authenticated
const byKeyId = new Map()

for (const event of events) {
  const key = event.keyId ?? "unauthenticated"
  byKeyId.set(key, (byKeyId.get(key) ?? 0) + 1)
}

const topKeys = [...byKeyId.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([keyId, count]) => ({ keyId, count }))

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalRequests: total,
      authenticatedRequests: authenticated,
      unauthenticatedRequests: unauthenticated,
      topKeys
    },
    null,
    2
  )
)
