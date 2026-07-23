import type { JSX } from "react"
import { useEndnotesContextOptional } from "../context/EndnotesContext"
import type { EndnotesProps, RegisteredEndnote } from "../types/endnotes"
import { useImplicitEndnotesContext } from "../context/implicitStore"
import { inferEndnoteKind } from "../core/sourceKind"

const SAFE_HREF_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"])

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ")
}

function sanitizeHref(rawHref?: string): string | undefined {
  if (!rawHref) {
    return undefined
  }

  const trimmedHref = rawHref.trim()
  if (!trimmedHref) {
    return undefined
  }

  if (trimmedHref.startsWith("/")) {
    return trimmedHref
  }

  try {
    const parsedUrl = new URL(trimmedHref, "https://endnotes.local")
    if (!SAFE_HREF_PROTOCOLS.has(parsedUrl.protocol)) {
      return undefined
    }
    return trimmedHref
  } catch {
    return undefined
  }
}

function metadata(note: RegisteredEndnote): string {
  const parts = [note.source.author, note.source.date, note.source.accessed].filter(Boolean)
  return parts.join(" • ")
}

function supportingSentence(note: RegisteredEndnote): string | null {
  const kind = inferEndnoteKind(note.source)
  if (kind === "citation") {
    return note.source.source ?? metadata(note) ?? note.source.description ?? note.source.supports ?? note.source.quote ?? null
  }
  const attribution = [note.source.source, note.source.author, note.source.date, note.source.accessed]
    .filter(Boolean)
    .join(" • ")
  return attribution || note.source.description || note.source.supports || note.source.quote || null
}

export function Endnotes({ title, heading, className }: EndnotesProps): JSX.Element | null {
  const explicitContext = useEndnotesContextOptional()
  const implicitContext = useImplicitEndnotesContext()
  const context = explicitContext ?? implicitContext
  const resolvedHeading = (title ?? heading ?? "Endnotes").trim() || "Endnotes"

  if (context.notes.length === 0) {
    return null
  }

  return (
    <section
      className={joinClassNames(
        explicitContext ? undefined : "endnotes-root endnotes-root--implicit",
        "endnotes-section",
        className
      )}
      aria-label={resolvedHeading}
    >
      <div className="endnotes-sectionHeader">
        <h2 className="endnotes-sectionHeader-name">{resolvedHeading}</h2>
        <div className="endnotes-sectionHeader-divider" aria-hidden="true" />
      </div>
      <ol className="endnotes-list">
        {context.notes.map((note) => {
          const kind = inferEndnoteKind(note.source)
          const sanitizedHref = sanitizeHref(note.source.href)
          const titleText = note.source.title ?? note.source.href ?? (kind === "note" ? "Note" : "Untitled source")
          const sentence = supportingSentence(note)
          return (
            <li
              key={note.key}
              id={context.noteIdFor(note.key)}
              value={note.number}
              tabIndex={-1}
              className={joinClassNames(
                "endnotes-item",
                `endnotes-item--${kind}`,
                context.activeNoteKey === note.key ? "is-active" : undefined
              )}
              data-endnote-kind={kind}
            >
              <p className="endnotes-footnote-p">
                {sanitizedHref ? (
                  <a
                    className="endnotes-title endnotes-title-link"
                    href={sanitizedHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {titleText}
                  </a>
                ) : (
                  <span className="endnotes-title">{titleText}</span>
                )}
                {sentence ? <span className="endnotes-sentence"> {sentence}</span> : null}{" "}
                <span className="endnotes-links">
                  {note.instances.length > 1 ? (
                    <span className="endnotes-backlink-prefix" aria-hidden="true">
                      ↩
                    </span>
                  ) : null}
                  {note.instances.map((instance, index) => (
                    <a
                      key={instance.instanceId}
                      href={`#${context.markerIdFor(instance.instanceId)}`}
                      className={joinClassNames(
                        "endnotes-backref",
                        note.instances.length > 1 ? "endnotes-backlink--index" : undefined
                      )}
                      onClick={(event) => {
                        event.preventDefault()
                        context.scrollToMarker(instance.instanceId)
                      }}
                      aria-label={`Return to citation ${note.number}${note.instances.length > 1 ? ` (${index + 1})` : ""}`}
                    >
                      {note.instances.length > 1 ? index + 1 : "↩︎"}
                    </a>
                  ))}
                </span>
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
