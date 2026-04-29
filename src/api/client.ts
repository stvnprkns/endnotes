import type {
  EndnotesReplayRequest,
  EndnotesErrorPayload,
  GenerateEndnotesRequest,
  GenerateEndnotesResponse
} from "./types"
import type {
  EndnotesMetricHandler,
  EndnotesSourceAttributionHandler,
  EndnotesTraceHandler
} from "./analytics"

export interface EndnotesClientOptions {
  apiKey: string
  baseUrl?: string
  timeoutMs?: number
  appName?: string
  appVersion?: string
  onMetric?: EndnotesMetricHandler
  onTrace?: EndnotesTraceHandler
  onSourceAttribution?: EndnotesSourceAttributionHandler
}

export class EndnotesApiError extends Error {
  readonly code: string
  readonly status: number
  readonly retryable: boolean

  constructor(message: string, details: { code: string; status: number; retryable: boolean }) {
    super(message)
    this.name = "EndnotesApiError"
    this.code = details.code
    this.status = details.status
    this.retryable = details.retryable
  }
}

export class EndnotesClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly appName?: string
  private readonly appVersion?: string
  private readonly onMetric?: EndnotesMetricHandler
  private readonly onTrace?: EndnotesTraceHandler
  private readonly onSourceAttribution?: EndnotesSourceAttributionHandler

  constructor(options: EndnotesClientOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl ?? "https://api.endnotes.ai/v1"
    this.timeoutMs = options.timeoutMs ?? 10_000
    this.appName = options.appName
    this.appVersion = options.appVersion
    this.onMetric = options.onMetric
    this.onTrace = options.onTrace
    this.onSourceAttribution = options.onSourceAttribution
  }

  buildReplayRequest(request: GenerateEndnotesRequest): EndnotesReplayRequest {
    return {
      method: "POST",
      url: `${this.baseUrl}/endnotes:generate`,
      headers: {
        "content-type": "application/json",
        authorization: "Bearer <ENDNOTES_API_KEY>",
        "x-endnotes-client": this.clientHeader()
      },
      body: JSON.stringify(request)
    }
  }

  async generate(request: GenerateEndnotesRequest): Promise<GenerateEndnotesResponse> {
    const traceId = this.traceId()
    const startedAt = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)
    this.onTrace?.({
      phase: "request_started",
      traceId,
      route: "/v1/endnotes:generate"
    })

    try {
      const response = await fetch(`${this.baseUrl}/endnotes:generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
          "x-endnotes-client": this.clientHeader()
        },
        body: JSON.stringify(request),
        signal: controller.signal
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as EndnotesErrorPayload | null
        this.onTrace?.({
          phase: "request_failed",
          traceId,
          route: "/v1/endnotes:generate",
          status: response.status,
          durationMs: Date.now() - startedAt,
          errorCode: payload?.error.code ?? "unknown_error"
        })
        this.onMetric?.({
          name: "endnotes.activation.failure",
          value: 1,
          tags: { code: payload?.error.code ?? "unknown_error" }
        })
        throw new EndnotesApiError(payload?.error.message ?? "Endnotes API request failed", {
          code: payload?.error.code ?? "unknown_error",
          status: response.status,
          retryable: payload?.error.retryable ?? response.status >= 500
        })
      }

      this.onMetric?.({ name: "endnotes.activation.success", value: 1 })
      const payload = (await response.json()) as GenerateEndnotesResponse
      this.onMetric?.({
        name: payload.reliability.citationsBelowThreshold === 0 ? "endnotes.trust.publishable" : "endnotes.trust.needs_review",
        value: 1
      })
      this.onMetric?.({
        name: "endnotes.trust.citations_below_threshold",
        value: payload.reliability.citationsBelowThreshold
      })
      this.onMetric?.({
        name: "endnotes.trust.stale_citations",
        value: payload.reliability.staleCitationCount
      })
      const sourceById = new Map(payload.sources.map((source) => [source.id, source]))
      this.onTrace?.({
        phase: "request_succeeded",
        traceId,
        route: "/v1/endnotes:generate",
        status: response.status,
        durationMs: Date.now() - startedAt
      })
      this.onSourceAttribution?.({
        requestId: payload.requestId,
        mapping: payload.citations.map((citation) => {
          const source = sourceById.get(citation.sourceId)
          return {
            citationId: citation.citationId,
            sourceId: citation.sourceId,
            sourceUrl: citation.sourceUrl,
            confidence: citation.confidence,
            stale: citation.stale,
            sourceQualityTier: source?.qualityTier,
            staleWarningReason: citation.staleWarning?.reason
          }
        })
      })
      return payload
    } catch (error) {
      if (error instanceof EndnotesApiError) {
        throw error
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        this.onTrace?.({
          phase: "request_failed",
          traceId,
          route: "/v1/endnotes:generate",
          status: 408,
          durationMs: Date.now() - startedAt,
          errorCode: "timeout"
        })
        throw new EndnotesApiError("Endnotes API request timed out", {
          code: "timeout",
          status: 408,
          retryable: true
        })
      }

      this.onTrace?.({
        phase: "request_failed",
        traceId,
        route: "/v1/endnotes:generate",
        status: 0,
        durationMs: Date.now() - startedAt,
        errorCode: "network_error"
      })
      throw new EndnotesApiError("Network error while calling Endnotes API", {
        code: "network_error",
        status: 0,
        retryable: true
      })
    } finally {
      this.onMetric?.({
        name: "endnotes.request.latency_ms",
        value: Date.now() - startedAt
      })
      clearTimeout(timeout)
    }
  }

  private clientHeader(): string {
    const version = "endnotes-ts/0.1.0"
    if (!this.appName) {
      return version
    }

    const appVersion = this.appVersion ? `/${this.appVersion}` : ""
    return `${version} ${this.appName}${appVersion}`
  }

  private traceId(): string {
    return `trace_${Date.now().toString(36)}`
  }
}
