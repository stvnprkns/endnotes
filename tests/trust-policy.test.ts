import { describe, expect, it } from "vitest"
import { evaluateTrustPolicy } from "../src/api/trust"
import type { GenerateEndnotesResponse } from "../src/api/types"

function buildResponse(
  overrides: Partial<GenerateEndnotesResponse> = {}
): GenerateEndnotesResponse {
  return {
    requestId: "req_1",
    citations: [
      {
        citationId: "cit_1",
        claim: "Claim",
        endnoteLabel: "1",
        confidence: 0.92,
        sourceId: "src_1",
        sourceUrl: "https://example.com/source",
        sourceTitle: "Source",
        stale: false
      }
    ],
    sources: [
      {
        id: "src_1",
        title: "Source",
        url: "https://example.com/source",
        qualityTier: "high"
      }
    ],
    renderedText: "Claim[^1]",
    generatedAt: "2026-04-28T00:00:00.000Z",
    reliability: {
      averageConfidence: 0.92,
      citationsBelowThreshold: 0,
      staleCitationCount: 0,
      sourceQualityBreakdown: { high: 1, medium: 0, low: 0 }
    },
    ...overrides
  }
}

describe("evaluateTrustPolicy", () => {
  it("allows publish when response passes default policy", () => {
    const decision = evaluateTrustPolicy(buildResponse())
    expect(decision.canPublish).toBe(true)
    expect(decision.needsReview).toBe(false)
    expect(decision.reasons).toHaveLength(0)
  })

  it("flags review reasons for stale and low-tier sources", () => {
    const decision = evaluateTrustPolicy(
      buildResponse({
        sources: [
          {
            id: "src_1",
            title: "Source",
            url: "https://example.com/source",
            qualityTier: "low"
          }
        ],
        reliability: {
          averageConfidence: 0.75,
          citationsBelowThreshold: 1,
          staleCitationCount: 1,
          sourceQualityBreakdown: { high: 0, medium: 0, low: 1 }
        }
      })
    )

    expect(decision.canPublish).toBe(false)
    expect(decision.needsReview).toBe(true)
    expect(decision.reasons).toContain("average_confidence_below_threshold")
    expect(decision.reasons).toContain("citations_below_threshold_present")
    expect(decision.reasons).toContain("stale_citations_present")
    expect(decision.reasons).toContain("low_tier_sources_present")
  })
})
