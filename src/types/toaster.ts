import type { ReactNode } from "react"

export type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading"

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center"

export type ToastAction = {
  label: string
  onClick: () => void
}

export type ToastContent =
  | ReactNode
  | {
      title?: ReactNode
      description?: ReactNode
    }

export type ToastOptions = {
  id?: string | number
  description?: ReactNode
  duration?: number
  dismissible?: boolean
  action?: ToastAction
  cancel?: ToastAction
  type?: ToastType
}

export type ToastRecord = {
  id: string
  type: ToastType
  title?: ReactNode
  description?: ReactNode
  createdAt: number
  duration: number
  dismissible: boolean
  visible: boolean
  action?: ToastAction
  cancel?: ToastAction
}

export type ToasterProps = {
  position?: ToastPosition
  maxVisible?: number
  closeButton?: boolean
  richColors?: boolean
  offset?: string
  gap?: string
  duration?: number
}
