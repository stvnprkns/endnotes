import type { EndnoteKind, EndnoteSource } from "../types/endnotes"

export function inferEndnoteKind(source: EndnoteSource): EndnoteKind {
  if (source.kind) {
    return source.kind
  }

  if (source.href?.trim() || source.type) {
    return "citation"
  }

  return "note"
}
