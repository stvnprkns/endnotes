import { transformMarkdownEndnotes, type MarkdownEndnote } from "../markdown"

export type TransformHtmlEndnotesResult = {
  html: string
  endnotes: MarkdownEndnote[]
}

export type HtmlTransformerOptions = {
  includeSection?: boolean
}

const HTML_ENDNOTE_TAG = /<endnote\s+([^>]*)>([\s\S]*?)<\/endnote>/gi
const ATTRIBUTE_PATTERN = /([a-zA-Z_]+)="([^"]*)"/g

function parseAttributes(raw: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  let match: RegExpExecArray | null = ATTRIBUTE_PATTERN.exec(raw)
  while (match) {
    attributes[match[1]] = match[2]
    match = ATTRIBUTE_PATTERN.exec(raw)
  }
  ATTRIBUTE_PATTERN.lastIndex = 0
  return attributes
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function transformHtmlEndnotes(
  input: string,
  options: HtmlTransformerOptions = {}
): TransformHtmlEndnotesResult {
  let markerCounter = 0
  let markdownProxy = input.replace(HTML_ENDNOTE_TAG, (_full, rawAttributes: string, content: string) => {
    markerCounter += 1
    const attrs = parseAttributes(rawAttributes)
    const title = (attrs.title ?? content ?? "").trim()
    const href = attrs.href?.trim()
    const kind = attrs.kind === "note" ? "note" : "citation"

    if (!title) {
      return _full
    }

    const segments = [`title="${title.replace(/"/g, '\\"')}"`]
    if (href) {
      segments.push(`href="${href.replace(/"/g, '\\"')}"`)
    }
    if (kind === "note") {
      segments.push(`kind="note"`)
    }
    return `[^endnote ${segments.join(" ")}]`
  })

  if (markerCounter === 0) {
    return { html: input, endnotes: [] }
  }

  const transformed = transformMarkdownEndnotes(markdownProxy)
  if (transformed.endnotes.length === 0) {
    return { html: input, endnotes: [] }
  }

  let body = transformed.markdown
  transformed.endnotes.forEach((note) => {
    body = body.replace(
      `[^${note.index}]`,
      `<sup class="endnotes-marker"><a href="#endnote-${note.index}" id="endnote-ref-${note.index}">${note.index}</a></sup>`
    )
  })

  const listItems = transformed.endnotes.map((note) => {
    const content = note.href
      ? `<a href="${escapeHtml(note.href)}">${escapeHtml(note.title)}</a>`
      : escapeHtml(note.title)
    const kind = note.kind === "note" ? "note" : "citation"
    return `<li id="endnote-${note.index}" data-endnote-kind="${kind}">${content} <a href="#endnote-ref-${note.index}" aria-label="Back to reference ${note.index}">↩</a></li>`
  })

  const includeSection = options.includeSection ?? true
  const section = `<section class="endnotes-html" aria-label="Endnotes"><ol>${listItems.join("")}</ol></section>\n`
  const html = `${body
    .replace(/\[\^\d+\]:[^\n]*(\n|$)/g, "")
    .trimEnd()}\n${includeSection ? section : ""}`

  return { html, endnotes: transformed.endnotes }
}

export function createHtmlEndnotesTransformer(options: HtmlTransformerOptions = {}) {
  return (input: string): string => transformHtmlEndnotes(input, options).html
}
