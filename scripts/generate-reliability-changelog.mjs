import { mkdir, readFile, writeFile } from "node:fs/promises"

const scorecardPath = new URL("../evals/reports/public-scorecard.json", import.meta.url)
const changelogPath = new URL("../docs/reliability-changelog.md", import.meta.url)
const historyPath = new URL("../evals/reports/reliability-history.json", import.meta.url)

const scorecard = JSON.parse(await readFile(scorecardPath, "utf8"))
const previousHistory = await readJsonOrFallback(historyPath, [])
const previousEntry = previousHistory[previousHistory.length - 1] ?? null

const currentEntry = {
  generatedAt: scorecard.generatedAt,
  schemaVersion: scorecard.schemaVersion ?? "unknown",
  totalCases: scorecard.totalCases ?? 0,
  passRate: scorecard.categories?.trustOutcomes?.passRate ?? 0,
  publishableRate: scorecard.categories?.trustOutcomes?.publishableRate ?? 0,
  manualReviewRate: scorecard.categories?.trustOutcomes?.manualReviewRate ?? 0,
  trustDecisionAccuracy: scorecard.categories?.trustOutcomes?.trustDecisionAccuracy ?? 0
}

const delta = previousEntry
  ? {
      passRate: diff(currentEntry.passRate, previousEntry.passRate),
      publishableRate: diff(currentEntry.publishableRate, previousEntry.publishableRate),
      manualReviewRate: diff(currentEntry.manualReviewRate, previousEntry.manualReviewRate),
      trustDecisionAccuracy: diff(currentEntry.trustDecisionAccuracy, previousEntry.trustDecisionAccuracy)
    }
  : null

const entry = renderEntry(currentEntry, delta)
const previousChangelog = await readTextOrFallback(changelogPath, "# Weekly Reliability Changelog\n")
const nextChangelog = previousChangelog.endsWith("\n")
  ? `${previousChangelog}\n${entry}`
  : `${previousChangelog}\n\n${entry}`

await mkdir(new URL("../evals/reports/", import.meta.url), { recursive: true })
await writeFile(changelogPath, nextChangelog)
await writeFile(historyPath, JSON.stringify([...previousHistory, currentEntry], null, 2))

console.log(`Reliability changelog updated at ${new URL(changelogPath).pathname}`)

function renderEntry(entryData, delta) {
  const date = entryData.generatedAt.slice(0, 10)
  return [
    `## ${date}`,
    "",
    `- Schema version: \`${entryData.schemaVersion}\``,
    `- Total cases: \`${entryData.totalCases}\``,
    `- Pass rate: \`${formatPercent(entryData.passRate)}\`${renderDelta(delta?.passRate)}`,
    `- Publishable rate: \`${formatPercent(entryData.publishableRate)}\`${renderDelta(delta?.publishableRate)}`,
    `- Manual review rate: \`${formatPercent(entryData.manualReviewRate)}\`${renderDelta(delta?.manualReviewRate)}`,
    `- Trust decision accuracy: \`${formatPercent(entryData.trustDecisionAccuracy)}\`${renderDelta(
      delta?.trustDecisionAccuracy
    )}`,
    "",
    "---",
    ""
  ].join("\n")
}

function renderDelta(value) {
  if (typeof value !== "number") {
    return ""
  }
  const sign = value > 0 ? "+" : ""
  return ` (delta: ${sign}${formatPercent(value)})`
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}

function diff(currentValue, previousValue) {
  return currentValue - previousValue
}

async function readJsonOrFallback(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"))
  } catch {
    return fallback
  }
}

async function readTextOrFallback(path, fallback) {
  try {
    return await readFile(path, "utf8")
  } catch {
    return fallback
  }
}
