import { useEffect, useMemo, useRef, type CSSProperties, type JSX, type PointerEvent } from "react"
import { setToasterDefaults, toaster, useToastStore } from "../toaster/store"
import type { ToastPosition, ToastRecord, ToasterProps } from "../types/toaster"

const SWIPE_DISMISS_THRESHOLD = 72

function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ")
}

function isReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

type ToastItemProps = {
  toast: ToastRecord
  closeButton: boolean
}

function ToastItem({ toast, closeButton }: ToastItemProps): JSX.Element {
  const timeoutRef = useRef<number | null>(null)
  const startedAtRef = useRef<number>(Date.now())
  const remainingRef = useRef<number>(toast.duration)
  const pointerStartRef = useRef<number | null>(null)

  useEffect(() => {
    if (!toast.visible || !Number.isFinite(toast.duration) || toast.duration <= 0) {
      return
    }

    const runTimer = () => {
      startedAtRef.current = Date.now()
      timeoutRef.current = window.setTimeout(() => {
        toaster.dismiss(toast.id)
      }, remainingRef.current)
    }

    runTimer()
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [toast.duration, toast.id, toast.visible])

  const pauseTimer = () => {
    if (timeoutRef.current === null || !Number.isFinite(toast.duration)) {
      return
    }
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    const elapsed = Date.now() - startedAtRef.current
    remainingRef.current = Math.max(150, remainingRef.current - elapsed)
  }

  const resumeTimer = () => {
    if (timeoutRef.current !== null || !Number.isFinite(toast.duration) || !toast.visible) {
      return
    }
    startedAtRef.current = Date.now()
    timeoutRef.current = window.setTimeout(() => {
      toaster.dismiss(toast.id)
    }, remainingRef.current)
  }

  const swipeEnabled = toast.dismissible

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!swipeEnabled || event.pointerType === "mouse") {
      return
    }
    pointerStartRef.current = event.clientX
  }

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!swipeEnabled || pointerStartRef.current === null) {
      return
    }
    const delta = event.clientX - pointerStartRef.current
    pointerStartRef.current = null
    if (Math.abs(delta) >= SWIPE_DISMISS_THRESHOLD) {
      toaster.dismiss(toast.id)
    }
  }

  return (
    <li
      className={classNames("endnotes-toast", `endnotes-toast--${toast.type}`, !toast.visible && "is-hidden")}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="endnotes-toast-content">
        {toast.title ? <div className="endnotes-toast-title">{toast.title}</div> : null}
        {toast.description ? <div className="endnotes-toast-description">{toast.description}</div> : null}
      </div>

      {(toast.action || toast.cancel) && (
        <div className="endnotes-toast-actions">
          {toast.cancel ? (
            <button
              className="endnotes-toast-button endnotes-toast-button--cancel"
              type="button"
              onClick={() => {
                toast.cancel?.onClick()
                toaster.dismiss(toast.id)
              }}
            >
              {toast.cancel.label}
            </button>
          ) : null}
          {toast.action ? (
            <button
              className="endnotes-toast-button"
              type="button"
              onClick={() => {
                toast.action?.onClick()
                toaster.dismiss(toast.id)
              }}
            >
              {toast.action.label}
            </button>
          ) : null}
        </div>
      )}

      {(closeButton || toast.dismissible) && (
        <button className="endnotes-toast-close" type="button" aria-label="Dismiss notification" onClick={() => toaster.dismiss(toast.id)}>
          ×
        </button>
      )}
    </li>
  )
}

function positionClass(position: ToastPosition): string {
  return `endnotes-toaster--${position}`
}

export function Toaster({
  position = "bottom-right",
  maxVisible = 3,
  closeButton = false,
  richColors = true,
  offset = "16px",
  gap = "10px",
  duration = 4000
}: ToasterProps): JSX.Element {
  const reduceMotion = useMemo(() => isReducedMotion(), [])
  useEffect(() => {
    setToasterDefaults({ position, maxVisible, closeButton, richColors, offset, gap, duration })
  }, [closeButton, duration, gap, maxVisible, offset, position, richColors])

  const { toasts, defaults } = useToastStore()
  const currentPosition = defaults.position ?? position

  return (
    <section
      className={classNames(
        "endnotes-toaster",
        positionClass(currentPosition),
        defaults.richColors ? "endnotes-toaster--rich" : "endnotes-toaster--neutral",
        reduceMotion && "endnotes-toaster--reduce-motion"
      )}
      style={
        {
          "--endnotes-toast-offset": defaults.offset ?? offset,
          "--endnotes-toast-gap": defaults.gap ?? gap
        } as CSSProperties
      }
      aria-live="polite"
      aria-atomic="false"
    >
      <ol className="endnotes-toast-list" role="status">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} closeButton={Boolean(defaults.closeButton)} />
        ))}
      </ol>
    </section>
  )
}
