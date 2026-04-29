import { describe, expect, it } from "vitest"
import { transformHtmlEndnotes, transformMarkdownEndnotes } from "../src"

describe("format transformers", () => {
  it("transforms markdown markers into numbered definitions", () => {
    const input = [
      "Claim with source [^endnote title=\"Source A\" href=\"https://example.com/a\" kind=\"citation\"].",
      "Narrative context [^endnote title=\"Editor note\" kind=\"note\"]."
    ].join("\n")

    const result = transformMarkdownEndnotes(input)
    expect(result.endnotes).toHaveLength(2)
    expect(result.markdown).toContain("[^1]")
    expect(result.markdown).toContain("[^2]")
    expect(result.markdown).toContain("[^1]: [Source A](https://example.com/a)")
    expect(result.markdown).toContain("[^2]: Editor note (note)")
  })

  it("transforms html endnote tags into anchors and list section", () => {
    const input = [
      "<p>Claim <endnote title=\"Source B\" href=\"https://example.com/b\" kind=\"citation\">ignored</endnote></p>",
      "<p>Context <endnote kind=\"note\">Narrative note</endnote></p>"
    ].join("\n")

    const result = transformHtmlEndnotes(input)
    expect(result.endnotes).toHaveLength(2)
    expect(result.html).toContain('id="endnote-ref-1"')
    expect(result.html).toContain('id="endnote-1"')
    expect(result.html).toContain('data-endnote-kind="citation"')
    expect(result.html).toContain('data-endnote-kind="note"')
  })
})
