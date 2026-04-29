export { EndnotesProvider, useEndnotes } from "./components/EndnotesProvider"
export { Note } from "./components/Note"
export { Endnote } from "./components/Endnote"
export { Endnotes } from "./components/Endnotes"
export { Toaster } from "./components/Toaster"
export { toaster } from "./toaster/store"
export { EndnotesClient, EndnotesApiError } from "./api/client"
export { evaluateTrustPolicy } from "./api/trust"
export { createMarkdownEndnotesTransformer, transformMarkdownEndnotes } from "./markdown"
export { createHtmlEndnotesTransformer, transformHtmlEndnotes } from "./html"

export type {
  EndnotesTheme,
  NoteProps,
  EndnotesProps
} from "./types/endnotes"
export type { ToastOptions, ToastPosition, ToastType, ToasterProps } from "./types/toaster"
export type { EndnotesTrustDecision, EndnotesTrustPolicyOptions } from "./api/trust"
export type {
  MarkdownEndnote,
  MarkdownEndnoteKind,
  MarkdownTransformerOptions,
  TransformMarkdownEndnotesResult
} from "./markdown"
export type { TransformHtmlEndnotesResult } from "./html"
export type { HtmlTransformerOptions } from "./html"
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
