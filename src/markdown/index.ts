export type MarkdownEndnoteKind = "citation" | "note"

export type MarkdownEndnote = {
  index: number
  title: string
  href?: string
  kind: MarkdownEndnoteKind
}

export type TransformMarkdownEndnotesResult = {
  markdown: string
  endnotes: MarkdownEndnote[]
}

export type MarkdownTransformerOptions = {
  appendDefinitions?: boolean
}

const MARKER_PATTERN = /\[\^endnote\s+([^\]]+)\]/g
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

function normalizeKind(value?: string): MarkdownEndnoteKind {
  if (value === "citation" || value === "note") {
    return value
  }
  return "citation"
}

export function transformMarkdownEndnotes(
  input: string,
  options: MarkdownTransformerOptions = {}
): TransformMarkdownEndnotesResult {
  const endnotes: MarkdownEndnote[] = []
  let nextIndex = 1

  const markdownBody = input.replace(MARKER_PATTERN, (_token, rawAttributes: string) => {
    const attrs = parseAttributes(rawAttributes)
    const title = attrs.title?.trim()
    if (!title) {
      return _token
    }

    const note: MarkdownEndnote = {
      index: nextIndex,
      title,
      href: attrs.href?.trim() || undefined,
      kind: normalizeKind(attrs.kind)
    }
    endnotes.push(note)
    nextIndex += 1
    return `[^${note.index}]`
  })

  if (endnotes.length === 0) {
    return { markdown: input, endnotes }
  }

  const definitions = endnotes.map((note) => {
    const label = note.href ? `[${note.title}](${note.href})` : note.title
    const kindSuffix = note.kind === "note" ? " (note)" : ""
    return `[^${note.index}]: ${label}${kindSuffix}`
  })

  const appendDefinitions = options.appendDefinitions ?? true
  const markdown = appendDefinitions
    ? `${markdownBody.trimEnd()}\n\n${definitions.join("\n")}\n`
    : markdownBody
  return { markdown, endnotes }
}

export function createMarkdownEndnotesTransformer(options: MarkdownTransformerOptions = {}) {
  return (input: string): string => transformMarkdownEndnotes(input, options).markdown
}
