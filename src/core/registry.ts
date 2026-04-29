import { resolveSourceKey } from "./identity"
import { sortRegisteredEndnotes } from "./sorting"
import type { EndnoteSource, RegisteredEndnote } from "../types/endnotes"
import { warnOnce } from "./warnings"
import { inferEndnoteKind } from "./sourceKind"

export type RegisterSourceInput = {
  source: EndnoteSource
  instanceId: string
}

export type EndnotesRegistrySnapshot = {
  notes: RegisteredEndnote[]
}

function mergeSourceMetadata(
  existing: EndnoteSource,
  incoming: EndnoteSource,
  sourceKey: string
): EndnoteSource {
  if (
    existing.title &&
    incoming.title &&
    existing.title !== incoming.title
  ) {
    warnOnce(`Conflicting metadata for source "${sourceKey}" (title mismatch).`)
  }

  return {
    ...incoming,
    ...existing
  }
}

export class EndnotesRegistry {
  private notesByKey = new Map<string, RegisteredEndnote>()

  register({ source, instanceId }: RegisterSourceInput): RegisteredEndnote {
    const normalizedSource = {
      ...source,
      kind: inferEndnoteKind(source)
    }
    const key = resolveSourceKey(normalizedSource)
    const existing = this.notesByKey.get(key)

    if (existing) {
      const alreadyTracked = existing.instances.some(
        (instance) => instance.instanceId === instanceId
      )

      if (!alreadyTracked) {
        existing.instances.push({ instanceId, sourceKey: key })
      }

      existing.source = mergeSourceMetadata(existing.source, normalizedSource, key)
      return existing
    }

    const number = this.notesByKey.size + 1
    const created: RegisteredEndnote = {
      key,
      number,
      source: normalizedSource,
      instances: [{ instanceId, sourceKey: key }]
    }

    this.notesByKey.set(key, created)
    return created
  }

  unregisterInstance(instanceId: string): void {
    const entries = [...this.notesByKey.entries()]

    for (const [key, note] of entries) {
      const nextInstances = note.instances.filter(
        (instance) => instance.instanceId !== instanceId
      )

      if (nextInstances.length === note.instances.length) {
        continue
      }

      if (nextInstances.length === 0) {
        this.notesByKey.delete(key)
      } else {
        note.instances = nextInstances
        this.notesByKey.set(key, note)
      }
    }

    this.reindex()
  }

  getByKey(key: string): RegisteredEndnote | undefined {
    return this.notesByKey.get(key)
  }

  getOrderedNotes(): RegisteredEndnote[] {
    return sortRegisteredEndnotes([...this.notesByKey.values()])
  }

  snapshot(): EndnotesRegistrySnapshot {
    return { notes: this.getOrderedNotes() }
  }

  clear(): void {
    this.notesByKey.clear()
  }

  private reindex(): void {
    this.getOrderedNotes().forEach((note, index) => {
      note.number = index + 1
      this.notesByKey.set(note.key, note)
    })
  }
}
