import type { EndnoteSource } from "../types/endnotes"
import { warnOnce } from "./warnings"

export function normalizeHref(href: string): string {
  const trimmed = href.trim()
  if (!trimmed) {
    return ""
  }

  try {
    const url = new URL(trimmed)
    url.hash = ""
    return url.toString().replace(/\/$/, "")
  } catch {
    return trimmed.toLowerCase().replace(/\/$/, "")
  }
}

function hashString(input: string): string {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function fallbackIdentityFields(source: EndnoteSource): string[] {
  return [
    source.kind ?? "",
    source.title ?? "",
    source.source ?? "",
    source.date ?? "",
    source.author ?? "",
    source.quote ?? "",
    source.supports ?? "",
    source.description ?? ""
  ].filter(Boolean)
}

export function resolveSourceKey(source: EndnoteSource): string {
  if (source.id?.trim()) {
    return `id:${source.id.trim()}`
  }

  if (source.href?.trim()) {
    return `href:${normalizeHref(source.href)}`
  }

  const fields = fallbackIdentityFields(source)
  if (fields.length === 0) {
    warnOnce(
      "Endnote source is missing id, href, and descriptive fields. Generated fallback identity may collide."
    )
    return "fallback:unknown"
  }

  warnOnce(
    "Endnote source is missing id and href. Using derived fallback identity; provide id for deterministic dedupe."
  )

  return `fallback:${hashString(fields.join("|"))}`
}
