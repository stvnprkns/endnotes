export type EndnotesOutputFormat = "markdown" | "html" | "json"

export interface EndnotesSource {
  id: string
  title: string
  url: string
  publisher?: string
  publishedAt?: string
  qualityTier?: "high" | "medium" | "low"
}

export interface EndnotesCitation {
  citationId: string
  claim: string
  endnoteLabel: string
  confidence: number
  sourceId: string
  sourceUrl: string
  sourceTitle: string
  stale: boolean
  staleWarning?: {
    reason: "source_unreachable" | "source_moved" | "source_outdated"
    checkedAt: string
    recommendedAction: "refresh_source" | "replace_source" | "manual_review"
  }
}

export interface GenerateEndnotesRequest {
  draft: string
  style?: "numeric" | "author-date"
  outputFormat?: EndnotesOutputFormat
  locale?: string
  metadata?: Record<string, string>
}

export interface GenerateEndnotesResponse {
  requestId: string
  citations: EndnotesCitation[]
  sources: EndnotesSource[]
  renderedText: string
  generatedAt: string
  reliability: {
    averageConfidence: number
    citationsBelowThreshold: number
    staleCitationCount: number
    sourceQualityBreakdown: {
      high: number
      medium: number
      low: number
    }
  }
}

export interface EndnotesErrorPayload {
  error: {
    code: string
    message: string
    retryable: boolean
  }
}

export interface EndnotesReplayRequest {
  method: "POST"
  url: string
  headers: Record<string, string>
  body: string
}
