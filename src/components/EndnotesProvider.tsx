import type { JSX } from "react"
import { EndnotesEngine } from "../context/EndnotesEngine"
import type { EndnotesProviderProps } from "../types/endnotes"
import { useEndnotesContextOptional } from "../context/EndnotesContext"
import { useImplicitEndnotesContext } from "../context/implicitStore"

export function EndnotesProvider({
  children,
  adapt = false,
  theme,
  variant = "default",
  marker,
  behavior
}: EndnotesProviderProps): JSX.Element {
  void marker
  void behavior
  return (
    <EndnotesEngine adapt={adapt} theme={theme} variant={variant}>
      {children}
    </EndnotesEngine>
  )
}

export function useEndnotes() {
  const explicitContext = useEndnotesContextOptional()
  const implicitContext = useImplicitEndnotesContext()
  const context = explicitContext ?? implicitContext
  return {
    notes: context.notes,
    scrollToNote: context.scrollToNote,
    scrollToMarker: context.scrollToMarker
  }
}

