export { EndnotesProvider, useEndnotes } from "./components/EndnotesProvider"
export { Note } from "./components/Note"
export { Endnote } from "./components/Endnote"
export { Endnotes } from "./components/Endnotes"
export { Toaster } from "./components/Toaster"
export { toaster } from "./toaster/store"
export { EndnotesClient, EndnotesApiError } from "./api/client"

export type {
  EndnotesTheme,
  NoteProps,
  EndnotesProps
} from "./types/endnotes"
export type { ToastOptions, ToastPosition, ToastType, ToasterProps } from "./types/toaster"
export type {
  EndnotesCitation,
  EndnotesOutputFormat,
  EndnotesReplayRequest,
  EndnotesSource,
  GenerateEndnotesRequest,
  GenerateEndnotesResponse
} from "./api/types"
export type {
  EndnotesMetric,
  EndnotesMetricHandler,
  EndnotesMetricName,
  EndnotesSourceAttributionEvent,
  EndnotesSourceAttributionHandler,
  EndnotesTraceEvent,
  EndnotesTraceHandler
} from "./api/analytics"
