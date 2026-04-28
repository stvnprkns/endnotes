import { useEffect, useState } from "react"
import type { ToastContent, ToastOptions, ToastRecord, ToasterProps, ToastType } from "../types/toaster"

const REMOVE_DELAY_MS = 180
const DEFAULT_DURATION_MS = 4000
const MAX_TOASTS_FALLBACK = 3
const LOADING_DURATION_MS = 24 * 60 * 60 * 1000

type ToastStoreState = {
  toasts: ToastRecord[]
  defaults: Pick<ToasterProps, "position" | "maxVisible" | "closeButton" | "richColors" | "offset" | "gap" | "duration">
}

type ToastStoreRuntime = {
  subscribers: Set<() => void>
  state: ToastStoreState
  idCounter: number
}

declare global {
  // eslint-disable-next-line no-var
  var __endnotesToastRuntime: ToastStoreRuntime | undefined
}

const runtime: ToastStoreRuntime =
  globalThis.__endnotesToastRuntime ??
  {
    subscribers: new Set<() => void>(),
    state: {
      toasts: [],
      defaults: {
        position: "bottom-right",
        maxVisible: MAX_TOASTS_FALLBACK,
        closeButton: false,
        richColors: true,
        offset: "16px",
        gap: "10px",
        duration: DEFAULT_DURATION_MS
      }
    },
    idCounter: 0
  }

globalThis.__endnotesToastRuntime = runtime

function emit(): void {
  runtime.subscribers.forEach((subscriber) => subscriber())
}

function subscribe(subscriber: () => void): () => void {
  runtime.subscribers.add(subscriber)
  return () => {
    runtime.subscribers.delete(subscriber)
  }
}

function snapshot(): ToastStoreState {
  return runtime.state
}

function isToastObject(content: ToastContent): content is Extract<ToastContent, { title?: unknown; description?: unknown }> {
  return typeof content === "object" && content !== null && ("title" in content || "description" in content)
}

function normalizeContent(content: ToastContent): { title?: ToastRecord["title"]; description?: ToastRecord["description"] } {
  if (isToastObject(content)) {
    return {
      title: content.title,
      description: content.description
    }
  }
  return {
    title: content
  }
}

function normalizeId(id?: string | number): string {
  if (id !== undefined) {
    return String(id)
  }
  runtime.idCounter += 1
  return `endnotes-toast-${runtime.idCounter}`
}

function scheduleRemoval(id: string): void {
  window.setTimeout(() => {
    runtime.state = {
      ...runtime.state,
      toasts: runtime.state.toasts.filter((toast) => toast.id !== id)
    }
    emit()
  }, REMOVE_DELAY_MS)
}

function upsertToast(content: ToastContent, options: ToastOptions = {}): string {
  const id = normalizeId(options.id)
  const normalized = normalizeContent(content)
  const existing = runtime.state.toasts.find((toast) => toast.id === id)
  const nextDuration = options.duration ?? existing?.duration ?? runtime.state.defaults.duration ?? DEFAULT_DURATION_MS
  const nextType = options.type ?? existing?.type ?? "default"

  if (existing) {
    runtime.state = {
      ...runtime.state,
      toasts: runtime.state.toasts.map((toast) =>
        toast.id === id
          ? {
              ...toast,
              ...normalized,
              duration: nextDuration,
              type: nextType,
              dismissible: options.dismissible ?? toast.dismissible,
              action: options.action ?? toast.action,
              cancel: options.cancel ?? toast.cancel,
              visible: true
            }
          : toast
      )
    }
    emit()
    return id
  }

  const toast: ToastRecord = {
    id,
    createdAt: Date.now(),
    duration: nextDuration,
    type: nextType,
    dismissible: options.dismissible ?? true,
    visible: true,
    action: options.action,
    cancel: options.cancel,
    ...normalized
  }

  runtime.state = {
    ...runtime.state,
    toasts: [toast, ...runtime.state.toasts]
  }
  emit()
  return id
}

function dismissToast(id?: string | number): void {
  if (id === undefined) {
    const visibleToasts = runtime.state.toasts.filter((toast) => toast.visible)
    if (visibleToasts.length === 0) {
      return
    }
    runtime.state = {
      ...runtime.state,
      toasts: runtime.state.toasts.map((toast) => ({ ...toast, visible: false }))
    }
    emit()
    visibleToasts.forEach((toast) => scheduleRemoval(toast.id))
    return
  }

  const normalized = String(id)
  const target = runtime.state.toasts.find((toast) => toast.id === normalized)
  if (!target || !target.visible) {
    return
  }
  runtime.state = {
    ...runtime.state,
    toasts: runtime.state.toasts.map((toast) => (toast.id === normalized ? { ...toast, visible: false } : toast))
  }
  emit()
  scheduleRemoval(normalized)
}

function updateToast(id: string | number, content: ToastContent, options: ToastOptions = {}): string {
  return upsertToast(content, { ...options, id })
}

function configureDefaults(props: ToasterProps): void {
  runtime.state = {
    ...runtime.state,
    defaults: {
      ...runtime.state.defaults,
      ...props
    }
  }
  emit()
}

function limitToasts(toasts: ToastRecord[]): ToastRecord[] {
  const maxVisible = runtime.state.defaults.maxVisible ?? MAX_TOASTS_FALLBACK
  return toasts.slice(0, maxVisible)
}

function promiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: ToastContent
    success: ToastContent | ((value: T) => ToastContent)
    error: ToastContent | ((error: unknown) => ToastContent)
  },
  options: Omit<ToastOptions, "type"> = {}
): Promise<T> {
  const id = upsertToast(messages.loading, { ...options, type: "loading", duration: LOADING_DURATION_MS })

  return promise
    .then((value) => {
      const next = typeof messages.success === "function" ? messages.success(value) : messages.success
      upsertToast(next, { ...options, id, type: "success", duration: options.duration ?? runtime.state.defaults.duration })
      return value
    })
    .catch((error: unknown) => {
      const next = typeof messages.error === "function" ? messages.error(error) : messages.error
      upsertToast(next, { ...options, id, type: "error", duration: options.duration ?? runtime.state.defaults.duration })
      throw error
    })
}

function typedToast(type: ToastType, content: ToastContent, options: ToastOptions = {}): string {
  return upsertToast(content, { ...options, type })
}

export const toaster = Object.assign(
  (content: ToastContent, options?: ToastOptions) => upsertToast(content, options),
  {
    success: (content: ToastContent, options?: ToastOptions) => typedToast("success", content, options),
    info: (content: ToastContent, options?: ToastOptions) => typedToast("info", content, options),
    warning: (content: ToastContent, options?: ToastOptions) => typedToast("warning", content, options),
    error: (content: ToastContent, options?: ToastOptions) => typedToast("error", content, options),
    loading: (content: ToastContent, options?: ToastOptions) => typedToast("loading", content, options),
    dismiss: dismissToast,
    update: updateToast,
    promise: promiseToast
  }
)

export function useToastStore(): {
  toasts: ToastRecord[]
  defaults: ToastStoreState["defaults"]
} {
  const [snapshotState, setSnapshotState] = useState<ToastStoreState>(snapshot())

  useEffect(() => {
    const unsubscribe = subscribe(() => setSnapshotState(snapshot()))
    setSnapshotState(snapshot())
    return unsubscribe
  }, [])

  return {
    toasts: limitToasts(snapshotState.toasts),
    defaults: snapshotState.defaults
  }
}

export function setToasterDefaults(props: ToasterProps): void {
  configureDefaults(props)
}
