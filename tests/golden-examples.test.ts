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
        citations: [],
        sources: [],
        renderedText: "Answer",
        generatedAt: "2026-04-28T00:00:00.000Z"
      })
    })
    vi.stubGlobal("fetch", mockFetch)

    const request = new Request("https://example.com/api/endnotes", {
      method: "POST",
      body: JSON.stringify({ draft: "Answer draft" })
    })
    const response = await POST(request)
    const json = (await response.json()) as { requestId: string }

    expect(response.status).toBe(200)
    expect(json.requestId).toBe("req_golden")
  })
})
