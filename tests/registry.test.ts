import { describe, expect, it } from "vitest"
import { EndnotesRegistry } from "../src/core/registry"

describe("EndnotesRegistry", () => {
  it("registers one note with number one", () => {
    const registry = new EndnotesRegistry()
    const note = registry.register({
      source: { id: "a", title: "Alpha" },
      instanceId: "instance-a-1"
    })

    expect(note.number).toBe(1)
    expect(registry.getOrderedNotes()).toHaveLength(1)
  })

  it("dedupes matching ids and keeps one note", () => {
    const registry = new EndnotesRegistry()
    registry.register({ source: { id: "shared", title: "A" }, instanceId: "a1" })
    registry.register({ source: { id: "shared", title: "A" }, instanceId: "a2" })

    const notes = registry.getOrderedNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0]?.instances).toHaveLength(2)
  })

  it("preserves first appearance order", () => {
    const registry = new EndnotesRegistry()
    registry.register({ source: { id: "b", title: "Second" }, instanceId: "b1" })
    registry.register({ source: { id: "a", title: "First" }, instanceId: "a1" })

    const notes = registry.getOrderedNotes()
    expect(notes.map((note) => note.key)).toEqual(["id:b", "id:a"])
    expect(notes.map((note) => note.number)).toEqual([1, 2])
  })

  it("reindexes after source is removed", () => {
    const registry = new EndnotesRegistry()
    registry.register({ source: { id: "a", title: "A" }, instanceId: "a1" })
    registry.register({ source: { id: "b", title: "B" }, instanceId: "b1" })

    registry.unregisterInstance("a1")

    const notes = registry.getOrderedNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0]?.key).toBe("id:b")
    expect(notes[0]?.number).toBe(1)
  })
})
