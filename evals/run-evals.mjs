import { readdir, readFile, writeFile } from "node:fs/promises"

const DATASET_DIRECTORY = new URL("./dataset/", import.meta.url)
const reportPath = new URL("./reports/latest.json", import.meta.url)
const publicScorecardPath = new URL("./reports/public-scorecard.json", import.meta.url)
const apiBaseUrl = (process.env.ENDNOTES_API_BASE_URL ?? "https://api.endnotes.ai/v1").replace(/\/$/, "")
const endpointUrl = `${apiBaseUrl}/endnotes:generate`
const apiKeyRequired = process.env.ENDNOTES_EVAL_REQUIRE_API_KEY === "true"
const allowsNoKeyApiCases = /localhost|127\.0\.0\.1/.test(apiBaseUrl)

const TRUST_POLICY = {
  minAverageConfidence: 0.8,
  minCitationConfidence: 0.7,
  allowLowTierSources: false,
  maxStaleCitations: 0,
  maxCitationsBelowThreshold: 0
}

const apiKey = process.env.ENDNOTES_API_KEY
const apiCases = []
const syntheticCases = []

const datasetFiles = (await readdir(DATASET_DIRECTORY)).filter((fileName) => fileName.endsWith(".json"))
for (const datasetFile of datasetFiles) {
  const datasetPath = new URL(`./dataset/${datasetFile}`, import.meta.url)
  const cases = JSON.parse(await readFile(datasetPath, "utf8"))
  for (const testCase of cases) {
    if (testCase.mode === "synthetic") {
      syntheticCases.push(testCase)
    } else {
      apiCases.push(testCase)
    }
  }
}

if (!apiKey && apiKeyRequired && apiCases.length > 0) {
  throw new Error("ENDNOTES_API_KEY is required because ENDNOTES_EVAL_REQUIRE_API_KEY=true")
}

if (!apiKey && apiCases.length > 0 && !allowsNoKeyApiCases) {
  console.warn("ENDNOTES_API_KEY is not set, skipping API-backed eval cases and running synthetic cases only.")
}

const results = []

const runnableApiCases = apiKey || allowsNoKeyApiCases ? apiCases : []

for (const testCase of [...runnableApiCases, ...syntheticCases]) {
  const fromSynthetic = testCase.mode === "synthetic"
  const response = fromSynthetic
    ? { ok: true, status: 200 }
    : await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          draft: testCase.draft,
          style: "numeric",
          outputFormat: "markdown"
        })
      })

  const payload = fromSynthetic ? testCase.payload : await response.json()
  const signalResults = evaluateSignals(payload)
  const trustDecision = evaluateTrustPolicy(payload, TRUST_POLICY)
  const expectedDecision = testCase.expectedDecision ?? null
  const decisionMatchesExpectation =
    expectedDecision === null ||
    (expectedDecision === "publishable" ? trustDecision.canPublish : trustDecision.needsReview)

  results.push({
    id: testCase.id,
    dataset: fromSynthetic ? "synthetic" : "api",
    description: testCase.description ?? null,
    passed: response.ok && signalResults.passed && decisionMatchesExpectation,
    status: response.status,
    requestId: payload.requestId ?? null,
    reliability: payload.reliability ?? null,
    passedSignals: signalResults.signals,
    trustDecision,
    expectedDecision,
    decisionMatchesExpectation
  })
}

const total = results.length
const passRate = rate(results.filter((item) => item.passed).length, total)
const publishableRate = rate(results.filter((item) => item.trustDecision.canPublish).length, total)
const manualReviewRate = rate(results.filter((item) => item.trustDecision.needsReview).length, total)
const sourceQualityCoverage = rate(results.filter((item) => item.passedSignals.hasQualityTier).length, total)
const staleSignalCoverage = rate(
  results.filter((item) => item.passedSignals.hasStaleSignal && item.passedSignals.hasStaleWarning).length,
  total
)
const trustDecisionAccuracy = rate(
  results.filter((item) => item.decisionMatchesExpectation).length,
  total
)

await writeFile(
  reportPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      apiBaseUrl,
      total,
      passRate,
      policy: TRUST_POLICY,
      metrics: {
        publishableRate,
        manualReviewRate,
        sourceQualityCoverage,
        staleSignalCoverage,
        trustDecisionAccuracy
      },
      results
    },
    null,
    2
  )
)

await writeFile(
  publicScorecardPath,
  JSON.stringify(
    {
      schemaVersion: "2026-04-trust-mvp",
      generatedAt: new Date().toISOString(),
      apiBaseUrl,
      notes: "Public reliability scorecard format for transparent benchmark publishing.",
      policy: TRUST_POLICY,
      thresholds: {
        minPassRate: 0.9,
        minPublishableRate: 0.25,
        maxManualReviewRate: 0.75,
        minTrustDecisionAccuracy: 1
      },
      categories: {
        signalCompleteness: {
          citationAvailability: rate(results.filter((item) => item.passedSignals.hasCitation).length, total),
          confidenceCoverage: rate(results.filter((item) => item.passedSignals.hasConfidence).length, total),
          sourceQualityCoverage,
          staleSignalCoverage
        },
        trustOutcomes: {
          passRate,
          publishableRate,
          manualReviewRate,
          trustDecisionAccuracy
        }
      },
      totalCases: total
    },
    null,
    2
  )
)

console.log(
  `Eval run complete. Pass rate: ${(passRate * 100).toFixed(1)}%, publishable rate: ${(
    publishableRate * 100
  ).toFixed(1)}%`
)

function evaluateSignals(payload) {
  const hasCitation = Array.isArray(payload.citations) && payload.citations.length > 0
  const hasConfidence = hasCitation && typeof payload.citations[0].confidence === "number"
  const hasQualityTier =
    Array.isArray(payload.sources) && payload.sources.some((source) => typeof source.qualityTier === "string")
  const hasReliabilitySummary = typeof payload.reliability?.averageConfidence === "number"
  const hasStaleSignal = hasCitation && typeof payload.citations[0].stale === "boolean"
  const hasStaleWarning =
    !payload.citations?.[0]?.stale || typeof payload.citations?.[0]?.staleWarning?.reason === "string"
  return {
    passed:
      hasCitation &&
      hasConfidence &&
      hasQualityTier &&
      hasReliabilitySummary &&
      hasStaleSignal &&
      hasStaleWarning,
    signals: {
      hasCitation,
      hasConfidence,
      hasQualityTier,
      hasReliabilitySummary,
      hasStaleSignal,
      hasStaleWarning
    }
  }
}

function evaluateTrustPolicy(payload, policy) {
  const reasons = []
  const averageConfidence = payload.reliability?.averageConfidence ?? 0
  const citationsBelowThreshold = payload.reliability?.citationsBelowThreshold ?? 0
  const staleCitationCount = payload.reliability?.staleCitationCount ?? 0
  const lowTierSourceCount = Array.isArray(payload.sources)
    ? payload.sources.filter((source) => source.qualityTier === "low").length
    : 0
  const lowConfidenceCitationCount = Array.isArray(payload.citations)
    ? payload.citations.filter((citation) => citation.confidence < policy.minCitationConfidence).length
    : 0

  if (averageConfidence < policy.minAverageConfidence) {
    reasons.push("average_confidence_below_threshold")
  }
  if (citationsBelowThreshold > policy.maxCitationsBelowThreshold) {
    reasons.push("citations_below_threshold_present")
  }
  if (staleCitationCount > policy.maxStaleCitations) {
    reasons.push("stale_citations_present")
  }
  if (!policy.allowLowTierSources && lowTierSourceCount > 0) {
    reasons.push("low_tier_sources_present")
  }
  if (lowConfidenceCitationCount > 0) {
    reasons.push("citation_confidence_below_policy")
  }

  return {
    canPublish: reasons.length === 0,
    needsReview: reasons.length > 0,
    reasons
  }
}

function rate(numerator, denominator) {
  if (denominator === 0) {
    return 0
  }
  return numerator / denominator
}
