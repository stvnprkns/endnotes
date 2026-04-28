import { describe, expect, it } from "vitest"
import * as endnotes from "../src"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

describe("package exports", () => {
  it("exports the recommended public API", () => {
    expect(endnotes.Note).toBeTypeOf("function")
    expect(endnotes.Endnote).toBeTypeOf("function")
    expect(endnotes.Endnotes).toBeTypeOf("function")
    expect(endnotes.Toaster).toBeTypeOf("function")
    expect(endnotes.toaster).toBeTypeOf("function")
    expect(endnotes.EndnotesProvider).toBeTypeOf("function")
    expect(endnotes.useEndnotes).toBeTypeOf("function")
    expect(endnotes.EndnotesClient).toBeTypeOf("function")
    expect(endnotes.EndnotesApiError).toBeTypeOf("function")
  })

  it("exposes style.css export path in package metadata", () => {
    const packageJsonPath = resolve(process.cwd(), "package.json")
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      exports?: Record<string, unknown>
    }

    expect(packageJson.exports).toBeDefined()
    expect(packageJson.exports?.["./style.css"]).toBe("./dist/endnotes.css")
  })
})
