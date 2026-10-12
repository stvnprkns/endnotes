import { useLayoutEffect, useState, type JSX, type KeyboardEvent } from "react"
import { Endnotes, EndnotesProvider } from "endnotes"
import type { EndnotesTheme } from "endnotes"
import { passages, type PassageId } from "./passages"

type BrandId = "light" | "book" | "journal"

const brands: { id: BrandId; label: string }[] = [
  { id: "light", label: "Modern" },
  { id: "book", label: "Book" },
  { id: "journal", label: "Article" }
]

const themes: Record<BrandId, EndnotesTheme> = {
  light: {
    fontFamily: '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
    foreground: "var(--ink)",
    muted: "var(--muted)",
    background: "var(--card)",
    border: "color-mix(in oklch, var(--ink) 10%, transparent)",
    shadow: "0 1px 2px oklch(0.2 0 0 / 0.06)",
    radius: "0.625rem",
    accent: "var(--accent)"
  },
  book: {
    fontFamily: '"Instrument Serif", "Iowan Old Style", Palatino, Georgia, serif',
    foreground: "var(--ink)",
    muted: "var(--muted)",
    background: "var(--card)",
    border: "color-mix(in oklch, var(--ink) 12%, transparent)",
    shadow: "0 16px 40px oklch(0.3 0.04 50 / 0.12)",
    radius: "0.25rem",
    accent: "var(--accent)"
  },
  journal: {
    fontFamily: '"Source Serif 4", "Iowan Old Style", Palatino, Georgia, serif',
    foreground: "var(--ink)",
    muted: "var(--muted)",
    background: "var(--card)",
    border: "color-mix(in oklch, var(--ink) 16%, transparent)",
    shadow: "none",
    radius: "0.125rem",
    accent: "var(--accent)"
  }
}

function stepIndex(current: number, delta: number, length: number): number {
  return (current + delta + length) % length
}

export function App(): JSX.Element {
  const [passageId, setPassageId] = useState<PassageId>("jest")
  const [brand, setBrand] = useState<BrandId>("light")
  const passage = passages.find((item) => item.id === passageId) ?? passages[0]

  useLayoutEffect(() => {
    document.documentElement.dataset.brand = brand
  }, [brand])

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const index = passages.findIndex((item) => item.id === passageId)
    const nextIndex =
      event.key === "ArrowRight"
        ? stepIndex(index, 1, passages.length)
        : event.key === "ArrowLeft"
          ? stepIndex(index, -1, passages.length)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? passages.length - 1
              : null

    if (nextIndex === null) {
      return
    }

    event.preventDefault()
    const next = passages[nextIndex]
    setPassageId(next.id)
    document.getElementById(`tab-${next.id}`)?.focus()
  }

  function onBrandKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const index = brands.findIndex((item) => item.id === brand)
    const nextIndex =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? stepIndex(index, 1, brands.length)
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? stepIndex(index, -1, brands.length)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? brands.length - 1
              : null

    if (nextIndex === null) {
      return
    }

    event.preventDefault()
    const next = brands[nextIndex]
    setBrand(next.id)
    document.getElementById(`brand-${next.id}`)?.focus()
  }

  const PassageContent = passage.Content

  return (
    <main className="page">
      <header className="mast">
        <h1>End notes</h1>
        <p className="intro">
          A citation belongs in the sentence, and the source belongs underneath. Endnotes takes on the type, color, and shape of the page it’s in.
        </p>
        <a className="mast-link" href="https://github.com/stvnprkns/endnotes">
          Endnotes on GitHub
        </a>
      </header>

      <div className="tools">
        <div className="tabs" role="tablist" aria-label="Passage" onKeyDown={onTabKeyDown}>
          {passages.map((item) => {
            const selected = item.id === passage.id
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                type="button"
                role="tab"
                className="tab"
                aria-selected={selected}
                aria-controls="reading"
                tabIndex={selected ? 0 : -1}
                onClick={() => setPassageId(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="rail" role="radiogroup" aria-label="Style" onKeyDown={onBrandKeyDown}>
          {brands.map((item) => {
            const selected = item.id === brand
            return (
              <button
                key={item.id}
                id={`brand-${item.id}`}
                type="button"
                role="radio"
                className="swatch"
                data-option={item.id}
                aria-checked={selected}
                aria-label={item.label}
                tabIndex={selected ? 0 : -1}
                onClick={() => setBrand(item.id)}
              />
            )
          })}
          <span className="pattern" aria-hidden="true">
            {brands.find((item) => item.id === brand)?.label}
          </span>
        </div>
      </div>

      <div className="sheet">
        <EndnotesProvider key={passage.id} theme={themes[brand]}>
          <article
            id="reading"
            className={`quote quote-${passage.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${passage.id}`}
          >
            <PassageContent />
          </article>
          <Endnotes title={passage.notesTitle} />
        </EndnotesProvider>
      </div>
    </main>
  )
}
