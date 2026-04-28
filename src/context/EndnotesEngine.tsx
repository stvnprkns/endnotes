import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode
} from "react"
import { EndnotesRegistry } from "../core/registry"
import { warnOnce } from "../core/warnings"
import type { EndnoteTheme, EndnoteSource, RegisteredEndnote } from "../types/endnotes"

const ACTIVE_HIGHLIGHT_MS = 1700
const REDUCED_MOTION_HIGHLIGHT_MS = 700

export type RegisterResult = {
  sourceKey: string
  number: number
}

export type EndnotesContextValue = {
  adapt: boolean
  theme?: EndnoteTheme
  variant: "default" | "compact"
  notes: RegisteredEndnote[]
  activeNoteKey?: string
  activeMarkerInstanceId?: string
  registerSource: (source: EndnoteSource, instanceId: string) => RegisterResult
  unregisterSourceInstance: (instanceId: string) => void
  markerIdFor: (instanceId: string) => string
  noteIdFor: (sourceKey: string) => string
  scrollToNote: (sourceKey: string) => void
  scrollToMarker: (instanceId: string) => void
}

const EndnotesContext = createContext<EndnotesContextValue | null>(null)

function getReducedMotionPreference(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function toCssVariables(theme?: EndnoteTheme): CSSProperties {
  if (!theme) {
    return {}
  }

  const style: Record<string, string> = {}
  if (theme.fontFamily) style["--endnotes-font-family"] = theme.fontFamily
  if (theme.foreground) style["--endnotes-foreground"] = theme.foreground
  if (theme.muted) style["--endnotes-muted"] = theme.muted
  if (theme.background) style["--endnotes-background"] = theme.background
  if (theme.border) style["--endnotes-border"] = theme.border
  if (theme.accent) style["--endnotes-accent"] = theme.accent
  if (theme.radius) style["--endnotes-radius"] = theme.radius
  if (theme.shadow) style["--endnotes-shadow"] = theme.shadow
  return style as CSSProperties
}

export type EndnotesEngineProps = {
  children: ReactNode
  adapt?: boolean
  theme?: EndnoteTheme
  variant?: "default" | "compact"
}

export function EndnotesEngine({
  children,
  adapt = false,
  theme,
  variant = "default"
}: EndnotesEngineProps): JSX.Element {
  const registryRef = useRef(new EndnotesRegistry())
  const [revision, setRevision] = useState(0)
  const [activeNoteKey, setActiveNoteKey] = useState<string | undefined>(undefined)
  const [activeMarkerInstanceId, setActiveMarkerInstanceId] = useState<string | undefined>(undefined)
  const highlightTimeoutRef = useRef<number | undefined>(undefined)
  const markerHighlightTimeoutRef = useRef<number | undefined>(undefined)

  const refresh = useCallback(() => setRevision((value) => value + 1), [])

  const registerSource = useCallback((source: EndnoteSource, instanceId: string) => {
    const note = registryRef.current.register({ source, instanceId })
    refresh()
    return { sourceKey: note.key, number: note.number }
  }, [refresh])

  const unregisterSourceInstance = useCallback((instanceId: string) => {
    registryRef.current.unregisterInstance(instanceId)
    refresh()
  }, [refresh])

  const markerIdFor = useCallback((instanceId: string) => `endnote-marker-${instanceId}`, [])
  const noteIdFor = useCallback((sourceKey: string) => `endnote-note-${encodeURIComponent(sourceKey)}`, [])

  const clearHighlight = useCallback(() => {
    if (highlightTimeoutRef.current !== undefined) {
      window.clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = undefined
    }
  }, [])

  const clearMarkerHighlight = useCallback(() => {
    if (markerHighlightTimeoutRef.current !== undefined) {
      window.clearTimeout(markerHighlightTimeoutRef.current)
      markerHighlightTimeoutRef.current = undefined
    }
  }, [])

  const scrollToNote = useCallback((sourceKey: string) => {
    if (typeof document === "undefined") {
      return
    }

    const target = document.getElementById(noteIdFor(sourceKey))
    if (!target) {
      warnOnce(`Could not find note target for "${sourceKey}". Ensure <Endnotes /> is rendered.`)
      return
    }

    const reducedMotion = getReducedMotionPreference()
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })
    target.focus()
    setActiveNoteKey(sourceKey)
    clearHighlight()
    highlightTimeoutRef.current = window.setTimeout(() => {
      setActiveNoteKey(undefined)
    }, reducedMotion ? REDUCED_MOTION_HIGHLIGHT_MS : ACTIVE_HIGHLIGHT_MS)
  }, [clearHighlight, noteIdFor])

  const scrollToMarker = useCallback((instanceId: string) => {
    if (typeof document === "undefined") {
      return
    }

    const marker = document.getElementById(markerIdFor(instanceId))
    if (!marker) {
      return
    }

    const reducedMotion = getReducedMotionPreference()
    marker.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest", inline: "nearest" })
    marker.focus()
    setActiveMarkerInstanceId(instanceId)
    clearMarkerHighlight()
    markerHighlightTimeoutRef.current = window.setTimeout(() => {
      setActiveMarkerInstanceId(undefined)
    }, reducedMotion ? REDUCED_MOTION_HIGHLIGHT_MS : ACTIVE_HIGHLIGHT_MS)
  }, [clearMarkerHighlight, markerIdFor])

  useEffect(() => () => {
    clearHighlight()
    clearMarkerHighlight()
  }, [clearHighlight, clearMarkerHighlight])

  const notes = useMemo(() => registryRef.current.snapshot().notes, [revision])

  const contextValue = useMemo(
    () => ({
      adapt,
      theme,
      variant,
      notes,
      activeNoteKey,
      activeMarkerInstanceId,
      registerSource,
      unregisterSourceInstance,
      markerIdFor,
      noteIdFor,
      scrollToNote,
      scrollToMarker
    }),
    [
      activeNoteKey,
      activeMarkerInstanceId,
      adapt,
      markerIdFor,
      noteIdFor,
      notes,
      registerSource,
      scrollToMarker,
      scrollToNote,
      theme,
      unregisterSourceInstance,
      variant
    ]
  )

  const className = adapt ? "endnotes-root endnotes-root--adapt" : "endnotes-root"
  const cssVars = toCssVariables(theme)

  return (
    <EndnotesContext.Provider value={contextValue}>
      <div className={className} style={cssVars} data-endnotes-variant={variant}>
        {children}
      </div>
    </EndnotesContext.Provider>
  )
}

export function useEndnotesContextOptional(): EndnotesContextValue | null {
  return useContext(EndnotesContext)
}

export function useEndnotesContext(): EndnotesContextValue {
  const value = useContext(EndnotesContext)
  if (!value) {
    throw new Error("Endnotes components must be rendered within EndnotesProvider.")
  }
  return value
}
