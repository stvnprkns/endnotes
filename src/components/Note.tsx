import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type JSX,
  type MouseEvent,
  type ReactNode
} from "react"
import { useEndnotesContextOptional } from "../context/EndnotesContext"
import type { NoteProps } from "../types/endnotes"
import { warnOnce } from "../core/warnings"
import { useImplicitEndnotesContext } from "../context/implicitStore"

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ")
}

function formatMarkerLabel(number: number, title?: string): string {
  return title ? `View reference ${number}: ${title}` : `View reference ${number}`
}

function isSafePreviewHref(href: string): boolean {
  const lower = href.trim().toLowerCase()
  return !lower.startsWith("javascript:") && !lower.startsWith("data:")
}

function normalizeTitle(title?: string, children?: ReactNode): string | undefined {
  if (title) {
    return title
  }

  if (typeof children === "string") {
    const trimmed = children.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  return undefined
}

type PreviewPhase = "entering" | "open" | "exiting"

const PREVIEW_EXIT_MS = 170

export function Note({
  children,
  title,
  className,
  ...source
}: NoteProps): JSX.Element {
  const explicitContext = useEndnotesContextOptional()
  const implicitContext = useImplicitEndnotesContext()
  const context = explicitContext ?? implicitContext
  const reactId = useId()
  const [registration, setRegistration] = useState<{ sourceKey: string; number: number } | null>(null)
  const [isPreviewMounted, setIsPreviewMounted] = useState(false)
  const [previewPhase, setPreviewPhase] = useState<PreviewPhase>("exiting")
  const [touchPreviewMode, setTouchPreviewMode] = useState(false)
  const markerRootRef = useRef<HTMLElement>(null)
  const previewEnterRafRef = useRef<number | null>(null)
  const previewCloseTimerRef = useRef<number | null>(null)
  const { registerSource, unregisterSourceInstance, markerIdFor, scrollToNote } = context

  const instanceId = useMemo(() => reactId.replace(/:/g, ""), [reactId])
  const resolvedTitle = normalizeTitle(title, children)

  const clearPreviewTimers = () => {
    if (previewEnterRafRef.current !== null) {
      window.cancelAnimationFrame(previewEnterRafRef.current)
      previewEnterRafRef.current = null
    }
    if (previewCloseTimerRef.current !== null) {
      window.clearTimeout(previewCloseTimerRef.current)
      previewCloseTimerRef.current = null
    }
  }

  const openPreview = () => {
    clearPreviewTimers()
    if (!isPreviewMounted) {
      setIsPreviewMounted(true)
      setPreviewPhase("entering")
      previewEnterRafRef.current = window.requestAnimationFrame(() => {
        setPreviewPhase("open")
        previewEnterRafRef.current = null
      })
      return
    }
    setPreviewPhase("open")
  }

  const closePreview = () => {
    clearPreviewTimers()
    if (!isPreviewMounted) {
      return
    }
    setPreviewPhase("exiting")
    previewCloseTimerRef.current = window.setTimeout(() => {
      setIsPreviewMounted(false)
      previewCloseTimerRef.current = null
    }, PREVIEW_EXIT_MS)
  }

  useEffect(() => {
    if (!source.id && !source.href && !resolvedTitle && !source.source) {
      warnOnce("Note received minimal metadata. Provide at least id, href, title, or source.")
    }

    const result = registerSource(
      {
        ...source,
        title: resolvedTitle
      },
      instanceId
    )
    setRegistration(result)

    return () => {
      unregisterSourceInstance(instanceId)
    }
  }, [
    instanceId,
    registerSource,
    resolvedTitle,
    source.accessed,
    source.author,
    source.date,
    source.description,
    source.href,
    source.id,
    source.quote,
    source.kind,
    source.source,
    source.supports,
    source.type,
    unregisterSourceInstance
  ])

  useEffect(() => {
    const root = markerRootRef.current
    if (!root) {
      return
    }

    const onFocusOut = (event: FocusEvent) => {
      if (touchPreviewMode) {
        return
      }
      const next = event.relatedTarget as Node | null
      if (next && root.contains(next)) {
        return
      }
      closePreview()
    }

    root.addEventListener("focusout", onFocusOut)
    return () => {
      root.removeEventListener("focusout", onFocusOut)
    }
  }, [touchPreviewMode, registration?.sourceKey ?? null, isPreviewMounted])

  useEffect(() => {
    return () => {
      clearPreviewTimers()
    }
  }, [])

  if (!registration) {
    return (
      <span
        ref={markerRootRef}
        className={joinClassNames(
          explicitContext ? undefined : "endnotes-root endnotes-root--implicit",
          "endnotes-marker-wrap"
        )}
      >
        <sup className={joinClassNames("endnotes-marker", className)}>
          <span className="endnotes-marker-link endnotes-marker-link--pending" aria-label="Loading reference">
            ?
          </span>
        </sup>
      </span>
    )
  }

  const markerId = markerIdFor(instanceId)
  const previewId = `endnote-preview-${instanceId}`
  const { number, sourceKey } = registration
  const registeredSource = context.notes.find((note) => note.key === sourceKey)?.source
  const previewTitle = registeredSource?.title ?? resolvedTitle ?? "Untitled source"
  const previewMeta = [registeredSource?.source, registeredSource?.author, registeredSource?.date]
    .filter((value): value is string => Boolean(value))
    .join(" · ")

  const noteAnchorId = context.noteIdFor(sourceKey)

  const handleMarkerClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (touchPreviewMode) {
      event.preventDefault()
      if (isPreviewMounted && previewPhase !== "exiting") {
        closePreview()
      } else {
        openPreview()
      }
      return
    }
    event.preventDefault()
    scrollToNote(sourceKey)
  }

  const previewRegionLabel = `Reference preview: ${previewTitle}`

  return (
    <span
      ref={markerRootRef}
      className={joinClassNames(
        explicitContext ? undefined : "endnotes-root endnotes-root--implicit",
        "endnotes-marker-wrap"
      )}
      onMouseEnter={() => {
        if (!touchPreviewMode) {
          openPreview()
        }
      }}
      onMouseLeave={() => {
        if (!touchPreviewMode) {
          closePreview()
        }
      }}
    >
      <sup className={joinClassNames("endnotes-marker", className)}>
        <a
          id={markerId}
          href={`#${noteAnchorId}`}
          className={joinClassNames(
            "endnotes-marker-link",
            context.activeMarkerInstanceId === instanceId ? "is-active" : undefined
          )}
          aria-label={formatMarkerLabel(number, resolvedTitle)}
          aria-describedby={isPreviewMounted && previewPhase !== "exiting" ? previewId : undefined}
          onPointerDown={(event) => {
            if (event.pointerType === "touch") {
              setTouchPreviewMode(true)
            }
          }}
          onTouchStart={() => {
            setTouchPreviewMode(true)
          }}
          onClick={handleMarkerClick}
          onFocus={() => {
            if (!touchPreviewMode) {
              openPreview()
            }
          }}
        >
          {number}
        </a>
      </sup>
      {isPreviewMounted ? (
        <span
          id={previewId}
          role={previewPhase === "exiting" ? undefined : "region"}
          aria-label={previewPhase === "exiting" ? undefined : previewRegionLabel}
          aria-hidden={previewPhase === "exiting" ? "true" : undefined}
          className={joinClassNames(
            "endnotes-preview-card",
            previewPhase === "entering" ? "is-entering" : undefined,
            previewPhase === "open" ? "is-open" : undefined,
            previewPhase === "exiting" ? "is-exiting" : undefined
          )}
        >
          <span className="endnotes-preview-title">{previewTitle}</span>
          {previewMeta ? <span className="endnotes-preview-meta">{previewMeta}</span> : null}
          {registeredSource?.quote ? <span className="endnotes-preview-quote">"{registeredSource.quote}"</span> : null}
          {registeredSource?.href ? (
            isSafePreviewHref(registeredSource.href) ? (
              /^https?:\/\//i.test(registeredSource.href) ? (
                <a
                  className="endnotes-preview-href"
                  href={registeredSource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {registeredSource.href}
                </a>
              ) : (
                <a className="endnotes-preview-href" href={registeredSource.href}>
                  {registeredSource.href}
                </a>
              )
            ) : (
              <span className="endnotes-preview-href">{registeredSource.href}</span>
            )
          ) : null}
        </span>
      ) : null}
    </span>
  )
}
