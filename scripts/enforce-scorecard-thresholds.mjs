import { readFile } from "node:fs/promises"

const publicScorecardPath = new URL("../evals/reports/public-scorecard.json", import.meta.url)
const comparisonScorecardPath = new URL("../evals/reports/public-comparison-scorecard.json", import.meta.url)

const publicScorecard = JSON.parse(await readFile(publicScorecardPath, "utf8"))
const comparisonScorecard = JSON.parse(await readFile(comparisonScorecardPath, "utf8"))

const thresholds = {
  minPassRate: 0.9,
  minPublishableRate: 0.25,
  maxManualReviewRate: 0.75,
  minTrustDecisionAccuracy: 1.0,
  minComparisonPassRateGap: 0.1
}

const publicOutcomes = publicScorecard.categories?.trustOutcomes ?? {}
assertAtLeast(publicOutcomes.passRate, thresholds.minPassRate, "passRate")
assertAtLeast(publicOutcomes.publishableRate, thresholds.minPublishableRate, "publishableRate")
assertAtMost(publicOutcomes.manualReviewRate, thresholds.maxManualReviewRate, "manualReviewRate")
assertAtLeast(
  publicOutcomes.trustDecisionAccuracy,
  thresholds.minTrustDecisionAccuracy,
  "trustDecisionAccuracy"
)

const ranking = comparisonScorecard.ranking ?? []
if (ranking.length < 2) {
  throw new Error("Comparison scorecard must include at least two providers for threshold enforcement")
}

const leader = ranking[0]
if (leader.providerId !== "endnotes") {
  throw new Error(`Endnotes must rank first in comparison scorecard. Current leader: ${leader.providerId}`)
}

const runnerUp = ranking[1]
const passRateGap = Number(leader.passRate ?? 0) - Number(runnerUp.passRate ?? 0)
if (passRateGap < thresholds.minComparisonPassRateGap) {
  throw new Error(
    `Endnotes passRate lead (${passRateGap.toFixed(3)}) is below required gap ${thresholds.minComparisonPassRateGap}`
  )
}

console.log(
  `Scorecard thresholds passed. Endnotes lead over ${runnerUp.providerId}: ${(passRateGap * 100).toFixed(1)}%`
)

function assertAtLeast(value, minimum, fieldName) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue < minimum) {
    throw new Error(`${fieldName}=${numericValue} is below minimum ${minimum}`)
  }
}

function assertAtMost(value, maximum, fieldName) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue > maximum) {
    throw new Error(`${fieldName}=${numericValue} exceeds maximum ${maximum}`)
  }
}
