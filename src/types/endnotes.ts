import type { ReactNode } from "react"

export type EndnoteSourceType =
  | "article"
  | "paper"
  | "book"
  | "report"
  | "website"
  | "dataset"
  | "internal"
  | "other"

export type EndnoteKind = "citation" | "note"

export type EndnoteSource = {
  id?: string
  href?: string
  title?: string
  source?: string
  author?: string
  date?: string
  accessed?: string
  quote?: string
  supports?: string
  description?: string
  type?: EndnoteSourceType
  kind?: EndnoteKind
}

export type EndnoteTheme = {
  fontFamily?: string
  foreground?: string
  muted?: string
  background?: string
  border?: string
  accent?: string
  radius?: string
  shadow?: string
}

export type EndnotesTheme = EndnoteTheme

export type EndnoteInstance = {
  instanceId: string
  sourceKey: string
}

export type RegisteredEndnote = {
  key: string
  number: number
  source: EndnoteSource
  instances: EndnoteInstance[]
}

export type EndnotesProviderProps = {
  children: ReactNode
  adapt?: boolean
  theme?: EndnoteTheme
  variant?: "default" | "compact"
  marker?: "superscript" | "bracket" | "pill"
  behavior?: "scroll"
}

export type NoteProps = EndnoteSource & {
  children?: ReactNode
  className?: string
}

export type EndnoteProps = NoteProps

export type EndnotesProps = {
  title?: string
  heading?: string
  className?: string
}
