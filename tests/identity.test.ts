import { describe, expect, it, vi, beforeEach } from "vitest"
import { normalizeHref, resolveSourceKey } from "../src/core/identity"
import { resetWarningsForTests } from "../src/core/warnings"

describe("identity", () => {
  beforeEach(() => {
    resetWarningsForTests()
  })

  it("uses id as highest-priority key", () => {
    expect(resolveSourceKey({ id: "source-a", href: "https://example.com" })).toBe("id:source-a")
  })

  it("normalizes href when id is absent", () => {
    expect(resolveSourceKey({ href: "https://example.com/report/#fragment" })).toBe(
      "href:https://example.com/report"
    )
  })

  it("normalizes trailing slashes and lowercase fallback", () => {
    expect(normalizeHref("HTTPS://EXAMPLE.COM/")).toBe("https://example.com")
  })

  it("falls back to derived key when id and href are missing", () => {
    const key = resolveSourceKey({ title: "Some report", source: "Team", date: "2026" })
    expect(key.startsWith("fallback:")).toBe(true)
  })

  it("warns for weak fallback identity", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    resolveSourceKey({ title: "Only title" })
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
