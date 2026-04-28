import { useMemo, useSyncExternalStore } from "react"
import { EndnotesRegistry } from "../core/registry"
import { warnOnce } from "../core/warnings"
import type { EndnotesContextValue } from "./EndnotesEngine"
import type { EndnoteSource } from "../types/endnotes"

type ImplicitState = {
  revision: number
  activeNoteKey?: string
  activeMarkerInstanceId?: string
  notes: ReturnType<EndnotesRegistry["snapshot"]>["notes"]
}

const registry = new EndnotesRegistry()
const subscribers = new Set<() => void>()
let implicitState: ImplicitState = {
  revision: 0,
  notes: []
}

let clearHighlightHandle: number | undefined
let clearMarkerHighlightHandle: number | undefined
const ACTIVE_HIGHLIGHT_MS = 1700
const REDUCED_MOTION_HIGHLIGHT_MS = 700

function emitChange(): void {
  implicitState = {
    ...implicitState,
    revision: implicitState.revision + 1,
    notes: registry.snapshot().notes
  }
  subscribers.forEach((callback) => callback())
}

function subscribe(callback: () => void): () => void {
  subscribers.add(callback)
  return () => {
    subscribers.delete(callback)
  }
}

function markerIdFor(instanceId: string): string {
  return `endnote-marker-${instanceId}`
}

function noteIdFor(sourceKey: string): string {
  return `endnote-note-${encodeURIComponent(sourceKey)}`
}

function reducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function setActive(sourceKey?: string): void {
  implicitState = {
    ...implicitState,
    activeNoteKey: sourceKey
  }
  emitChange()
}

function scrollToNote(sourceKey: string): void {
  if (typeof document === "undefined") {
    return
  }

  const target = document.getElementById(noteIdFor(sourceKey))
  if (!target) {
    warnOnce(`Could not find note target for "${sourceKey}". Ensure <Endnotes /> is rendered.`)
    return
  }

  const motionReduced = reducedMotion()
  target.scrollIntoView({ behavior: motionReduced ? "auto" : "smooth", block: "start" })
  target.focus()
  setActive(sourceKey)
  if (clearHighlightHandle !== undefined) {
    window.clearTimeout(clearHighlightHandle)
  }
  clearHighlightHandle = window.setTimeout(
    () => setActive(undefined),
    motionReduced ? REDUCED_MOTION_HIGHLIGHT_MS : ACTIVE_HIGHLIGHT_MS
  )
}

function scrollToMarker(instanceId: string): void {
  if (typeof document === "undefined") {
    return
  }

  const marker = document.getElementById(markerIdFor(instanceId))
  if (!marker) {
    return
  }

  const motionReduced = reducedMotion()
  marker.scrollIntoView({ behavior: motionReduced ? "auto" : "smooth", block: "nearest", inline: "nearest" })
  marker.focus()
  implicitState = {
    ...implicitState,
    activeMarkerInstanceId: instanceId
  }
  emitChange()
  if (clearMarkerHighlightHandle !== undefined) {
    window.clearTimeout(clearMarkerHighlightHandle)
  }
  clearMarkerHighlightHandle = window.setTimeout(() => {
    implicitState = {
      ...implicitState,
      activeMarkerInstanceId: undefined
    }
    emitChange()
  }, motionReduced ? REDUCED_MOTION_HIGHLIGHT_MS : ACTIVE_HIGHLIGHT_MS)
}

function snapshotState() {
  return implicitState
}

function registerSource(source: EndnoteSource, instanceId: string) {
  const note = registry.register({ source, instanceId })
  emitChange()
  return { sourceKey: note.key, number: note.number }
}

function unregisterSourceInstance(instanceId: string): void {
  registry.unregisterInstance(instanceId)
  emitChange()
}

export function useImplicitEndnotesContext(): EndnotesContextValue {
  const state = useSyncExternalStore(subscribe, snapshotState, snapshotState)

  return useMemo(
    () => ({
      adapt: true,
      theme: undefined,
      variant: "default" as const,
      notes: state.notes,
      activeNoteKey: state.activeNoteKey,
      activeMarkerInstanceId: state.activeMarkerInstanceId,
      registerSource,
      unregisterSourceInstance,
      markerIdFor,
      noteIdFor,
      scrollToNote,
      scrollToMarker
    }),
    [state.activeMarkerInstanceId, state.activeNoteKey, state.notes]
  )
}
