import { readFile, writeFile } from "node:fs/promises"

const apiKey = process.env.ENDNOTES_API_KEY
if (!apiKey) {
  throw new Error("ENDNOTES_API_KEY is required")
}

const datasetPath = new URL("./dataset/baseline.json", import.meta.url)
const reportPath = new URL("./reports/latest.json", import.meta.url)
const publicScorecardPath = new URL("./reports/public-scorecard.json", import.meta.url)
const cases = JSON.parse(await readFile(datasetPath, "utf8"))

const results = []

for (const testCase of cases) {
  const response = await fetch("https://api.endnotes.ai/v1/endnotes:generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      draft: testCase.draft,
      style: "numeric",
      outputFormat: "markdown"
    })
  })

  const payload = await response.json()
  const hasCitation = Array.isArray(payload.citations) && payload.citations.length > 0
  const hasConfidence = hasCitation && typeof payload.citations[0].confidence === "number"
  const hasQualityTier = Array.isArray(payload.sources) && payload.sources.some((source) => typeof source.qualityTier === "string")
  const hasReliabilitySummary = typeof payload.reliability?.averageConfidence === "number"
  const hasStaleSignal = hasCitation && typeof payload.citations[0].stale === "boolean"
  const hasStaleWarning = !payload.citations?.[0]?.stale || typeof payload.citations?.[0]?.staleWarning?.reason === "string"
  const passedSignals = {
    hasCitation,
    hasConfidence,
    hasQualityTier,
    hasReliabilitySummary,
    hasStaleSignal,
    hasStaleWarning
  }

  results.push({
    id: testCase.id,
    passed:
      response.ok &&
      hasCitation &&
      hasConfidence &&
      hasQualityTier &&
      hasReliabilitySummary &&
      hasStaleSignal &&
      hasStaleWarning,
    requestId: payload.requestId ?? null,
    reliability: payload.reliability ?? null,
    passedSignals
  })
}

const passRate = results.filter((item) => item.passed).length / results.length

await writeFile(
  reportPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      total: results.length,
      passRate,
      results
    },
    null,
    2
  )
)

const sourceQualityCoverage =
  results.filter((item) => item.passedSignals.hasQualityTier).length / results.length
const staleSignalCoverage =
  results.filter((item) => item.passedSignals.hasStaleSignal && item.passedSignals.hasStaleWarning).length /
  results.length

await writeFile(
  publicScorecardPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      notes: "Public reliability scorecard format for transparent benchmark publishing.",
      categories: {
        citationAvailability: passRate,
        sourceQualityCoverage,
        staleSignalCoverage
      },
      totalCases: results.length
    },
    null,
    2
  )
)

console.log(`Eval run complete. Pass rate: ${(passRate * 100).toFixed(1)}%`)
