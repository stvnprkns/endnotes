import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("contract conformance", () => {
  it("keeps OpenAPI and MCP minimal schema guidance aligned", () => {
    const openapi = read("docs/openapi/endnotes.v1.yaml")
    const mcpRaw = read("docs/tooling/mcp-endnotes-tool.json")
    const mcp = JSON.parse(mcpRaw) as {
      inputSchema: { required: string[] }
      x_llmOutputGuidance?: unknown
      "x-llmOutputGuidance"?: {
        minimalUiNoteSchema?: { title?: string; href?: string; kind?: string }
      }
    }

    expect(mcp.inputSchema.required).toContain("draft")
    expect(openapi).toContain("required: [draft]")
    expect(openapi).toContain("minimalUiNoteSchema:")
    expect(openapi).toContain("title: Source title")
    expect(openapi).toContain("href: https://example.com/source")
    expect(openapi).toContain("kind: citation")

    const minimal = mcp["x-llmOutputGuidance"]?.minimalUiNoteSchema
    expect(minimal?.title).toBe("Source title")
    expect(minimal?.href).toBe("https://example.com/source")
    expect(minimal?.kind).toBe("citation")
  })

  it("keeps prompt snippet defaults for citation and note", () => {
    const snippets = read("docs/tooling/prompt-snippets.md")
    expect(snippets).toContain('"kind": "citation"')
    expect(snippets).toContain('kind: "citation"')
    expect(snippets).toContain('kind: "note"')
  })
})
