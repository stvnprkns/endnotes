import type { EndnotesCitation, EndnotesSource, GenerateEndnotesResponse } from "./types"

export interface EndnotesTrustPolicyOptions {
  minAverageConfidence?: number
  minCitationConfidence?: number
  allowLowTierSources?: boolean
  maxStaleCitations?: number
  maxCitationsBelowThreshold?: number
}

export interface EndnotesTrustDecision {
  canPublish: boolean
  needsReview: boolean
  reasons: string[]
  summary: {
    averageConfidence: number
    citationsBelowThreshold: number
    staleCitationCount: number
    lowTierSourceCount: number
  }
}

const DEFAULT_POLICY: Required<EndnotesTrustPolicyOptions> = {
  minAverageConfidence: 0.8,
  minCitationConfidence: 0.7,
  allowLowTierSources: false,
  maxStaleCitations: 0,
  maxCitationsBelowThreshold: 0
}

export function evaluateTrustPolicy(
  response: GenerateEndnotesResponse,
  options: EndnotesTrustPolicyOptions = {}
): EndnotesTrustDecision {
  const policy = { ...DEFAULT_POLICY, ...options }
  const reasons: string[] = []
  const lowTierSourceCount = countLowTierSources(response.sources)
  const citationsBelowConfidence = countCitationsBelowConfidence(
    response.citations,
    policy.minCitationConfidence
  )

  if (response.reliability.averageConfidence < policy.minAverageConfidence) {
    reasons.push("average_confidence_below_threshold")
  }
  if (response.reliability.citationsBelowThreshold > policy.maxCitationsBelowThreshold) {
    reasons.push("citations_below_threshold_present")
  }
  if (response.reliability.staleCitationCount > policy.maxStaleCitations) {
    reasons.push("stale_citations_present")
  }
  if (!policy.allowLowTierSources && lowTierSourceCount > 0) {
    reasons.push("low_tier_sources_present")
  }
  if (citationsBelowConfidence > 0) {
    reasons.push("citation_confidence_below_policy")
  }

  return {
    canPublish: reasons.length === 0,
    needsReview: reasons.length > 0,
    reasons,
    summary: {
      averageConfidence: response.reliability.averageConfidence,
      citationsBelowThreshold: response.reliability.citationsBelowThreshold,
      staleCitationCount: response.reliability.staleCitationCount,
      lowTierSourceCount
    }
  }
}

function countLowTierSources(sources: EndnotesSource[]): number {
  return sources.filter((source) => source.qualityTier === "low").length
}

function countCitationsBelowConfidence(
  citations: EndnotesCitation[],
  minCitationConfidence: number
): number {
  return citations.filter((citation) => citation.confidence < minCitationConfidence).length
}
