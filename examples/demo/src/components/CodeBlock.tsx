import { useCallback, useEffect, useId, useState } from "react"
import type { JSX, ReactNode } from "react"

type CodeBlockProps = {
  code: string
  label?: string
  title?: string
  /** Shown as a small badge (e.g. tsx, bash); also drives syntax highlighting. */
  language?: string
  children?: ReactNode
}

export function CodeBlock({ code, label, title, language, children }: CodeBlockProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)
  const headingId = useId()
  const hasToolbarHeading = !!(label || title || language)

  useEffect(() => {
    let cancelled = false
    setHighlightedHtml(null)
    ;(async () => {
      try {
        const { highlightToHtml } = await import("../lib/highlightCode")
        const html = await highlightToHtml(code, language)
        if (!cancelled) setHighlightedHtml(html)
      } catch {
        if (!cancelled) setHighlightedHtml(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [code, language])

  const copy = useCallback(async () => {
    const done = () => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
    try {
      await navigator.clipboard.writeText(code)
      done()
    } catch {
      const ta = document.createElement("textarea")
      ta.value = code
      ta.setAttribute("aria-hidden", "true")
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand("copy")
        done()
      } finally {
        document.body.removeChild(ta)
      }
    }
  }, [code])

  return (
    <figure className="code-block">
      <div
        className="code-block-panel"
        role="region"
        aria-labelledby={hasToolbarHeading ? headingId : undefined}
        aria-label={hasToolbarHeading ? undefined : "Code example"}
      >
        <div className="code-block-toolbar">
          <div className="code-block-toolbar-start" id={hasToolbarHeading ? headingId : undefined}>
            {label ? <span className="code-block-label">{label}</span> : null}
            {title ? <span className="code-block-title">{title}</span> : null}
            {language ? <span className="code-block-lang">{language}</span> : null}
          </div>
          <button type="button" className="code-block-copy" onClick={copy} aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="code-block-pre">
          {highlightedHtml ? (
            <div className="code-block-shiki" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          ) : (
            <pre className="code-block-pre-plain">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>
      {children}
    </figure>
  )
}
