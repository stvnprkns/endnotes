import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

type Fixture = {
  id: string
  promptStyle: string
  expected: {
    minimalFields: string[]
    allowedKinds: string[]
  }
}

describe("assistant fixture matrix", () => {
  it("covers required prompt styles and schema defaults", () => {
    const raw = readFileSync(resolve(process.cwd(), "evals/dataset/assistant-fixture-matrix.json"), "utf8")
    const fixtures = JSON.parse(raw) as Fixture[]
    const styles = fixtures.map((fixture) => fixture.promptStyle)

    expect(styles).toContain("factual_answer")
    expect(styles).toContain("report")
    expect(styles).toContain("recommendation")

    fixtures.forEach((fixture) => {
      expect(fixture.expected.minimalFields).toContain("title")
      expect(fixture.expected.minimalFields).toContain("href")
      expect(fixture.expected.allowedKinds).toContain("citation")
      expect(fixture.expected.allowedKinds).toContain("note")
    })
  })
})
