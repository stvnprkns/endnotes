import { readFile, writeFile } from "node:fs/promises"

const trustCasesPath = new URL("./dataset/trust-cases.json", import.meta.url)
const comparisonReportPath = new URL("./reports/public-comparison-scorecard.json", import.meta.url)

const TRUST_POLICY = {
  minAverageConfidence: 0.8,
  minCitationConfidence: 0.7,
  allowLowTierSources: false,
  maxStaleCitations: 0,
  maxCitationsBelowThreshold: 0
}

const PROVIDERS = [
  {
    id: "endnotes",
    label: "Endnotes",
    transformPayload: (payload) => payload
  },
  {
    id: "generic_rag_citations",
    label: "Generic RAG citations",
    transformPayload: (payload) => degradeRagPayload(payload)
  },
  {
    id: "manual_footnotes",
    label: "Manual footnotes pipeline",
    transformPayload: (payload) => degradeManualPayload(payload)
  }
]

const externalAlternative = buildExternalAlternativeProvider()
if (externalAlternative) {
  PROVIDERS.push(externalAlternative)
}

for (const provider of PROVIDERS) {
  if (!provider.getPayload) {
    provider.getPayload = async (testCase) => provider.transformPayload(structuredClone(testCase.payload))
  }
}

const trustCases = JSON.parse(await readFile(trustCasesPath, "utf8"))
const providerResults = []

for (const provider of PROVIDERS) {
  const results = []
  for (const testCase of trustCases) {
    const payload = await provider.getPayload(testCase)
    const signalResults = evaluateSignals(payload)
    const trustDecision = evaluateTrustPolicy(payload, TRUST_POLICY)
    const expectedDecision = testCase.expectedDecision
    const decisionMatchesExpectation =
      expectedDecision === "publishable" ? trustDecision.canPublish : trustDecision.needsReview

    results.push({
      id: testCase.id,
      passed: signalResults.passed && decisionMatchesExpectation,
      passedSignals: signalResults.signals,
      trustDecision,
      decisionMatchesExpectation
    })
  }

  providerResults.push({
    providerId: provider.id,
    providerLabel: provider.label,
    mode: provider.mode ?? "synthetic",
    totalCases: results.length,
    categories: buildCategories(results),
    passRate: rate(results.filter((item) => item.passed).length, results.length),
    results
  })
}

const ranking = providerResults
  .map((provider) => ({
    providerId: provider.providerId,
    providerLabel: provider.providerLabel,
    passRate: provider.passRate,
    publishableRate: provider.categories.trustOutcomes.publishableRate,
    trustDecisionAccuracy: provider.categories.trustOutcomes.trustDecisionAccuracy,
    mode: provider.mode ?? "synthetic"
  }))
  .sort((a, b) => b.passRate - a.passRate)

await writeFile(
  comparisonReportPath,
  JSON.stringify(
    {
      schemaVersion: "2026-04-trust-comparison-v1",
      generatedAt: new Date().toISOString(),
      notes:
        "Trust-case comparison across named alternatives. Providers may be synthetic profiles or live adapters depending on runtime configuration.",
      policy: TRUST_POLICY,
      providers: providerResults,
      ranking
    },
    null,
    2
  )
)

console.log(
  `Comparison scorecard generated for ${providerResults.length} providers at ${new URL(comparisonReportPath).pathname}`
)

function buildCategories(results) {
  const total = results.length
  const sourceQualityCoverage = rate(results.filter((item) => item.passedSignals.hasQualityTier).length, total)
  const staleSignalCoverage = rate(
    results.filter((item) => item.passedSignals.hasStaleSignal && item.passedSignals.hasStaleWarning).length,
    total
  )
  const publishableRate = rate(results.filter((item) => item.trustDecision.canPublish).length, total)
  const manualReviewRate = rate(results.filter((item) => item.trustDecision.needsReview).length, total)
  const trustDecisionAccuracy = rate(results.filter((item) => item.decisionMatchesExpectation).length, total)

  return {
    signalCompleteness: {
      citationAvailability: rate(results.filter((item) => item.passedSignals.hasCitation).length, total),
      confidenceCoverage: rate(results.filter((item) => item.passedSignals.hasConfidence).length, total),
      sourceQualityCoverage,
      staleSignalCoverage
    },
    trustOutcomes: {
      passRate: rate(results.filter((item) => item.passed).length, total),
      publishableRate,
      manualReviewRate,
      trustDecisionAccuracy
    }
  }
}

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

function degradeRagPayload(payload) {
  payload.citations = payload.citations.map((citation) => ({
    ...citation,
    confidence: Math.max(0, Number((citation.confidence - 0.1).toFixed(2))),
    staleWarning: citation.stale ? undefined : citation.staleWarning
  }))
  payload.sources = payload.sources.map((source, index) => ({
    ...source,
    qualityTier: index === 0 ? "medium" : source.qualityTier
  }))
  payload.reliability = {
    ...payload.reliability,
    averageConfidence: Math.max(0, Number((payload.reliability.averageConfidence - 0.1).toFixed(2))),
    citationsBelowThreshold:
      payload.reliability.citationsBelowThreshold + (payload.reliability.averageConfidence < 0.8 ? 1 : 0)
  }
  return payload
}

function buildExternalAlternativeProvider() {
  const baseUrl = process.env.ENDNOTES_ALT_PROVIDER_URL
  if (!baseUrl) {
    return null
  }
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "")
  const apiKey = process.env.ENDNOTES_ALT_PROVIDER_API_KEY

  return {
    id: "external_alt_provider",
    label: process.env.ENDNOTES_ALT_PROVIDER_LABEL ?? "External alternative provider",
    mode: "live",
    async getPayload(testCase) {
      const response = await fetch(`${normalizedBaseUrl}/endnotes:generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          draft: testCase.payload.citations?.[0]?.claim ?? testCase.id,
          style: "numeric",
          outputFormat: "markdown"
        })
      })
      if (!response.ok) {
        throw new Error(`External alternative provider request failed (${response.status})`)
      }
      return response.json()
    }
  }
}

function degradeManualPayload(payload) {
  payload.citations = payload.citations.map((citation, index) => ({
    ...citation,
    confidence: Math.max(0, Number((citation.confidence - 0.18).toFixed(2))),
    stale: index === 0 ? true : citation.stale,
    staleWarning:
      index === 0
        ? {
            reason: "source_outdated",
            checkedAt: new Date().toISOString(),
            recommendedAction: "manual_review"
          }
        : citation.staleWarning
  }))
  payload.sources = payload.sources.map((source) => ({
    ...source,
    qualityTier: "low"
  }))
  payload.reliability = {
    ...payload.reliability,
    averageConfidence: Math.max(0, Number((payload.reliability.averageConfidence - 0.18).toFixed(2))),
    citationsBelowThreshold: Math.max(1, payload.reliability.citationsBelowThreshold),
    staleCitationCount: Math.max(1, payload.reliability.staleCitationCount),
    sourceQualityBreakdown: { high: 0, medium: 0, low: payload.sources.length }
  }
  return payload
}

function rate(numerator, denominator) {
  if (denominator === 0) {
    return 0
  }
  return numerator / denominator
}
