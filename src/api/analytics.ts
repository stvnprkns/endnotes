export type EndnotesMetricName =
  | "endnotes.activation.success"
  | "endnotes.activation.failure"
  | "endnotes.request.latency_ms"
  | "endnotes.trust.publishable"
  | "endnotes.trust.needs_review"
  | "endnotes.trust.citations_below_threshold"
  | "endnotes.trust.stale_citations"

export interface EndnotesMetric {
  name: EndnotesMetricName
  value: number
  tags?: Record<string, string>
}

export type EndnotesMetricHandler = (metric: EndnotesMetric) => void

export interface EndnotesTraceEvent {
  phase: "request_started" | "request_succeeded" | "request_failed"
  traceId: string
  route: string
  status?: number
  durationMs?: number
  errorCode?: string
}

export type EndnotesTraceHandler = (trace: EndnotesTraceEvent) => void

export interface EndnotesSourceAttributionEvent {
  requestId: string
  mapping: Array<{
    citationId: string
    sourceId: string
    sourceUrl: string
    confidence: number
    stale: boolean
    sourceQualityTier?: "high" | "medium" | "low"
    staleWarningReason?: "source_unreachable" | "source_moved" | "source_outdated"
  }>
}

export type EndnotesSourceAttributionHandler = (
  sourceAttribution: EndnotesSourceAttributionEvent
) => void
