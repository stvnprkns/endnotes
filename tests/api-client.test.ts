import { afterEach, describe, expect, it, vi } from "vitest"
import { EndnotesApiError, EndnotesClient } from "../src/api/client"

describe("EndnotesClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("posts one-call payload and returns typed response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        requestId: "req_123",
        citations: [],
        sources: [],
        renderedText: "Example[^1]\n\n[^1]: Source",
        generatedAt: "2026-04-28T00:00:00.000Z",
        reliability: {
          averageConfidence: 0.91,
          citationsBelowThreshold: 0,
          staleCitationCount: 0,
          sourceQualityBreakdown: { high: 1, medium: 0, low: 0 }
        }
      })
    })

    vi.stubGlobal("fetch", mockFetch)

    const client = new EndnotesClient({ apiKey: "test_key" })
    const response = await client.generate({ draft: "Example statement." })

    expect(response.requestId).toBe("req_123")
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it("maps API errors to EndnotesApiError", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        error: {
          code: "invalid_request",
          message: "draft is required",
          retryable: false
        }
      })
    })

    vi.stubGlobal("fetch", mockFetch)

    const client = new EndnotesClient({ apiKey: "test_key" })
    await expect(client.generate({ draft: "" })).rejects.toBeInstanceOf(EndnotesApiError)
  })

  it("emits trace and source attribution events", async () => {
    const traces: string[] = []
    const sourceAttributionRequests: string[] = []
    const sourceAttributionMappings: Array<Record<string, unknown>> = []
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        requestId: "req_456",
        citations: [
          {
            citationId: "cit_1",
            claim: "A claim",
            endnoteLabel: "1",
            confidence: 0.9,
            sourceId: "src_1",
            sourceUrl: "https://example.com/source",
            sourceTitle: "Source",
            stale: false,
            staleWarning: {
              reason: "source_outdated",
              checkedAt: "2026-04-28T00:00:00.000Z",
              recommendedAction: "manual_review"
            }
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
        renderedText: "A claim[^1]\n\n[^1]: Source",
        generatedAt: "2026-04-28T00:00:00.000Z",
        reliability: {
          averageConfidence: 0.9,
          citationsBelowThreshold: 0,
          staleCitationCount: 0,
          sourceQualityBreakdown: { high: 1, medium: 0, low: 0 }
        }
      })
    })
    vi.stubGlobal("fetch", mockFetch)

    const client = new EndnotesClient({
      apiKey: "test_key",
      onTrace: (trace) => traces.push(trace.phase),
      onSourceAttribution: (event) => {
        sourceAttributionRequests.push(event.requestId)
        sourceAttributionMappings.push(event.mapping[0] as Record<string, unknown>)
      }
    })

    const replay = client.buildReplayRequest({ draft: "A claim" })
    await client.generate({ draft: "A claim" })

    expect(replay.url.endsWith("/endnotes:generate")).toBe(true)
    expect(traces).toContain("request_started")
    expect(traces).toContain("request_succeeded")
    expect(sourceAttributionRequests).toEqual(["req_456"])
    expect(sourceAttributionMappings[0].sourceQualityTier).toBe("high")
    expect(sourceAttributionMappings[0].staleWarningReason).toBe("source_outdated")
  })
})
