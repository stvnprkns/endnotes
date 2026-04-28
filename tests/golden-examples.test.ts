import { describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { POST } from "../examples/recipes/nextjs-ai-route"

describe("golden examples", () => {
  it("contains canonical recipe files", () => {
    const nextjs = readFileSync(resolve(process.cwd(), "examples/recipes/nextjs-ai-route.ts"), "utf8")
    const fastapi = readFileSync(resolve(process.cwd(), "examples/recipes/fastapi_agent.py"), "utf8")
    const staticSite = readFileSync(
      resolve(process.cwd(), "examples/recipes/static-markdown-build.mjs"),
      "utf8"
    )

    expect(nextjs).toContain("EndnotesClient")
    expect(fastapi).toContain("EndnotesClient")
    expect(staticSite).toContain("outputFormat")
  })

  it("runs nextjs API recipe end-to-end", async () => {
    process.env.ENDNOTES_API_KEY = "test_key"
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        requestId: "req_golden",
        citations: [
          {
            citationId: "cit_1",
            claim: "Answer draft",
            endnoteLabel: "1",
            confidence: 0.9,
            sourceId: "src_1",
            sourceUrl: "https://example.com/source",
            sourceTitle: "Source",
            stale: false
          }
        ],
        sources: [{ id: "src_1", title: "Source", url: "https://example.com/source", qualityTier: "high" }],
        renderedText: "Answer",
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

    const request = new Request("https://example.com/api/endnotes", {
      method: "POST",
      body: JSON.stringify({ draft: "Answer draft" })
    })
    const response = await POST(request)
    const json = (await response.json()) as { status: string; result: { requestId: string } }

    expect(response.status).toBe(200)
    expect(json.status).toBe("publishable")
    expect(json.result.requestId).toBe("req_golden")
  })
})
