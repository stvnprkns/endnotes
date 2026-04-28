import type { JSX } from "react"
import type { EndnoteProps } from "../types/endnotes"
import { Note } from "./Note"

export function Endnote(props: EndnoteProps): JSX.Element {
  return <Note {...props} />
}
