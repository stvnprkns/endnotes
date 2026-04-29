import { ReactNode, JSX } from 'react';

type EndnoteSourceType = "article" | "paper" | "book" | "report" | "website" | "dataset" | "internal" | "other";
type EndnoteKind = "citation" | "note";
type EndnoteSource = {
    id?: string;
    href?: string;
    title?: string;
    source?: string;
    author?: string;
    date?: string;
    accessed?: string;
    quote?: string;
    supports?: string;
    description?: string;
    type?: EndnoteSourceType;
    kind?: EndnoteKind;
};
type EndnoteTheme = {
    fontFamily?: string;
    foreground?: string;
    muted?: string;
    background?: string;
    border?: string;
    accent?: string;
    radius?: string;
    shadow?: string;
};
type EndnotesTheme = EndnoteTheme;
type EndnoteInstance = {
    instanceId: string;
    sourceKey: string;
};
type RegisteredEndnote = {
    key: string;
    number: number;
    source: EndnoteSource;
    instances: EndnoteInstance[];
};
type EndnotesProviderProps = {
    children: ReactNode;
    adapt?: boolean;
    theme?: EndnoteTheme;
    variant?: "default" | "compact";
    marker?: "superscript" | "bracket" | "pill";
    behavior?: "scroll";
};
type NoteProps = EndnoteSource & {
    children?: ReactNode;
    className?: string;
};
type EndnoteProps = NoteProps;
type EndnotesProps = {
    title?: string;
    heading?: string;
    className?: string;
};

declare function EndnotesProvider({ children, adapt, theme, variant, marker, behavior }: EndnotesProviderProps): JSX.Element;
declare function useEndnotes(): {
    notes: RegisteredEndnote[];
    scrollToNote: (sourceKey: string) => void;
    scrollToMarker: (instanceId: string) => void;
};

declare function Note({ children, title, className, ...source }: NoteProps): JSX.Element;

declare function Endnote(props: EndnoteProps): JSX.Element;

declare function Endnotes({ title, heading, className }: EndnotesProps): JSX.Element | null;

type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading";
type ToastPosition = "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";
type ToastAction = {
    label: string;
    onClick: () => void;
};
type ToastContent = ReactNode | {
    title?: ReactNode;
    description?: ReactNode;
};
type ToastOptions = {
    id?: string | number;
    description?: ReactNode;
    duration?: number;
    dismissible?: boolean;
    action?: ToastAction;
    cancel?: ToastAction;
    type?: ToastType;
};
type ToastRecord = {
    id: string;
    type: ToastType;
    title?: ReactNode;
    description?: ReactNode;
    createdAt: number;
    duration: number;
    dismissible: boolean;
    visible: boolean;
    action?: ToastAction;
    cancel?: ToastAction;
};
type ToasterProps = {
    position?: ToastPosition;
    maxVisible?: number;
    closeButton?: boolean;
    richColors?: boolean;
    offset?: string;
    gap?: string;
    duration?: number;
};

declare function Toaster({ position, maxVisible, closeButton, richColors, offset, gap, duration }: ToasterProps): JSX.Element;

type ToastStoreState = {
    toasts: ToastRecord[];
    defaults: Pick<ToasterProps, "position" | "maxVisible" | "closeButton" | "richColors" | "offset" | "gap" | "duration">;
};
type ToastStoreRuntime = {
    subscribers: Set<() => void>;
    state: ToastStoreState;
    idCounter: number;
};
declare global {
    var __endnotesToastRuntime: ToastStoreRuntime | undefined;
}
declare function dismissToast(id?: string | number): void;
declare function updateToast(id: string | number, content: ToastContent, options?: ToastOptions): string;
declare function promiseToast<T>(promise: Promise<T>, messages: {
    loading: ToastContent;
    success: ToastContent | ((value: T) => ToastContent);
    error: ToastContent | ((error: unknown) => ToastContent);
}, options?: Omit<ToastOptions, "type">): Promise<T>;
declare const toaster: ((content: ToastContent, options?: ToastOptions) => string) & {
    success: (content: ToastContent, options?: ToastOptions) => string;
    info: (content: ToastContent, options?: ToastOptions) => string;
    warning: (content: ToastContent, options?: ToastOptions) => string;
    error: (content: ToastContent, options?: ToastOptions) => string;
    loading: (content: ToastContent, options?: ToastOptions) => string;
    dismiss: typeof dismissToast;
    update: typeof updateToast;
    promise: typeof promiseToast;
};

type EndnotesOutputFormat = "markdown" | "html" | "json";
interface EndnotesSource {
    id: string;
    title: string;
    url: string;
    publisher?: string;
    publishedAt?: string;
    qualityTier?: "high" | "medium" | "low";
}
interface EndnotesCitation {
    citationId: string;
    claim: string;
    endnoteLabel: string;
    confidence: number;
    sourceId: string;
    sourceUrl: string;
    sourceTitle: string;
    stale: boolean;
    staleWarning?: {
        reason: "source_unreachable" | "source_moved" | "source_outdated";
        checkedAt: string;
        recommendedAction: "refresh_source" | "replace_source" | "manual_review";
    };
}
interface GenerateEndnotesRequest {
    draft: string;
    style?: "numeric" | "author-date";
    outputFormat?: EndnotesOutputFormat;
    locale?: string;
    metadata?: Record<string, string>;
}
interface GenerateEndnotesResponse {
    requestId: string;
    citations: EndnotesCitation[];
    sources: EndnotesSource[];
    renderedText: string;
    generatedAt: string;
    reliability: {
        averageConfidence: number;
        citationsBelowThreshold: number;
        staleCitationCount: number;
        sourceQualityBreakdown: {
            high: number;
            medium: number;
            low: number;
        };
    };
}
interface EndnotesReplayRequest {
    method: "POST";
    url: string;
    headers: Record<string, string>;
    body: string;
}

type EndnotesMetricName = "endnotes.activation.success" | "endnotes.activation.failure" | "endnotes.request.latency_ms" | "endnotes.trust.publishable" | "endnotes.trust.needs_review" | "endnotes.trust.citations_below_threshold" | "endnotes.trust.stale_citations";
interface EndnotesMetric {
    name: EndnotesMetricName;
    value: number;
    tags?: Record<string, string>;
}
type EndnotesMetricHandler = (metric: EndnotesMetric) => void;
interface EndnotesTraceEvent {
    phase: "request_started" | "request_succeeded" | "request_failed";
    traceId: string;
    route: string;
    status?: number;
    durationMs?: number;
    errorCode?: string;
}
type EndnotesTraceHandler = (trace: EndnotesTraceEvent) => void;
interface EndnotesSourceAttributionEvent {
    requestId: string;
    mapping: Array<{
        citationId: string;
        sourceId: string;
        sourceUrl: string;
        confidence: number;
        stale: boolean;
        sourceQualityTier?: "high" | "medium" | "low";
        staleWarningReason?: "source_unreachable" | "source_moved" | "source_outdated";
    }>;
}
type EndnotesSourceAttributionHandler = (sourceAttribution: EndnotesSourceAttributionEvent) => void;

interface EndnotesClientOptions {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
    appName?: string;
    appVersion?: string;
    onMetric?: EndnotesMetricHandler;
    onTrace?: EndnotesTraceHandler;
    onSourceAttribution?: EndnotesSourceAttributionHandler;
}
declare class EndnotesApiError extends Error {
    readonly code: string;
    readonly status: number;
    readonly retryable: boolean;
    constructor(message: string, details: {
        code: string;
        status: number;
        retryable: boolean;
    });
}
declare class EndnotesClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeoutMs;
    private readonly appName?;
    private readonly appVersion?;
    private readonly onMetric?;
    private readonly onTrace?;
    private readonly onSourceAttribution?;
    constructor(options: EndnotesClientOptions);
    buildReplayRequest(request: GenerateEndnotesRequest): EndnotesReplayRequest;
    generate(request: GenerateEndnotesRequest): Promise<GenerateEndnotesResponse>;
    private clientHeader;
    private traceId;
}

interface EndnotesTrustPolicyOptions {
    minAverageConfidence?: number;
    minCitationConfidence?: number;
    allowLowTierSources?: boolean;
    maxStaleCitations?: number;
    maxCitationsBelowThreshold?: number;
}
interface EndnotesTrustDecision {
    canPublish: boolean;
    needsReview: boolean;
    reasons: string[];
    summary: {
        averageConfidence: number;
        citationsBelowThreshold: number;
        staleCitationCount: number;
        lowTierSourceCount: number;
    };
}
declare function evaluateTrustPolicy(response: GenerateEndnotesResponse, options?: EndnotesTrustPolicyOptions): EndnotesTrustDecision;

type MarkdownEndnoteKind = "citation" | "note";
type MarkdownEndnote = {
    index: number;
    title: string;
    href?: string;
    kind: MarkdownEndnoteKind;
};
type TransformMarkdownEndnotesResult = {
    markdown: string;
    endnotes: MarkdownEndnote[];
};
type MarkdownTransformerOptions = {
    appendDefinitions?: boolean;
};
declare function transformMarkdownEndnotes(input: string, options?: MarkdownTransformerOptions): TransformMarkdownEndnotesResult;
declare function createMarkdownEndnotesTransformer(options?: MarkdownTransformerOptions): (input: string) => string;

type TransformHtmlEndnotesResult = {
    html: string;
    endnotes: MarkdownEndnote[];
};
type HtmlTransformerOptions = {
    includeSection?: boolean;
};
declare function transformHtmlEndnotes(input: string, options?: HtmlTransformerOptions): TransformHtmlEndnotesResult;
declare function createHtmlEndnotesTransformer(options?: HtmlTransformerOptions): (input: string) => string;

export { Endnote, Endnotes, EndnotesApiError, type EndnotesCitation, EndnotesClient, type EndnotesMetric, type EndnotesMetricHandler, type EndnotesMetricName, type EndnotesOutputFormat, type EndnotesProps, EndnotesProvider, type EndnotesReplayRequest, type EndnotesSource, type EndnotesSourceAttributionEvent, type EndnotesSourceAttributionHandler, type EndnotesTheme, type EndnotesTraceEvent, type EndnotesTraceHandler, type EndnotesTrustDecision, type EndnotesTrustPolicyOptions, type GenerateEndnotesRequest, type GenerateEndnotesResponse, type HtmlTransformerOptions, type MarkdownEndnote, type MarkdownEndnoteKind, type MarkdownTransformerOptions, Note, type NoteProps, type ToastOptions, type ToastPosition, type ToastType, Toaster, type ToasterProps, type TransformHtmlEndnotesResult, type TransformMarkdownEndnotesResult, createHtmlEndnotesTransformer, createMarkdownEndnotesTransformer, evaluateTrustPolicy, toaster, transformHtmlEndnotes, transformMarkdownEndnotes, useEndnotes };
