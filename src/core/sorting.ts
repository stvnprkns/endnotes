import type { RegisteredEndnote } from "../types/endnotes"

export function sortRegisteredEndnotes(notes: RegisteredEndnote[]): RegisteredEndnote[] {
  return [...notes].sort((first, second) => first.number - second.number)
}
