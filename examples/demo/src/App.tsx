import { useState, type JSX } from "react"
import "endnotes/style.css"
import { Toaster } from "endnotes"
import { APIReference } from "./sections/APIReference"
import { Examples } from "./sections/Examples"
import { Hero } from "./sections/Hero"
import { Installation } from "./sections/Installation"
import { Principles } from "./sections/Principles"
import { ReadingTrail } from "./sections/ReadingTrail"
import { Styling } from "./sections/Styling"
import { Usage } from "./sections/Usage"
import { Workbench } from "./sections/Workbench"

const NAV_ITEMS = [
  { href: "#install", label: "Install" },
  { href: "#usage", label: "Usage" },
  { href: "#examples", label: "Examples" },
  { href: "#reading-trail", label: "Reading trail" },
  { href: "#styling", label: "Styling" },
  { href: "#api", label: "API" },
  { href: "#principles", label: "Principles" },
  { href: "#workbench", label: "Demo" }
]

export default function App(): JSX.Element {
  const [dark, setDark] = useState(false)

  return (
    <div className={dark ? "demo-root dark" : "demo-root"}>
      <header className="site-header">
        <div className="site-header-inner">
          <a href="#top" className="wordmark">
            Endnotes
          </a>
          <nav aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <button type="button" className="theme-toggle" onClick={() => setDark((value) => !value)} aria-pressed={dark}>
            {dark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <main className="demo-shell">
        <Hero />
        <Installation />
        <Usage />
        <Examples />
        <ReadingTrail />
        <Styling />
        <APIReference />
        <Principles />
        <Workbench />
      </main>
      <Toaster position="bottom-right" maxVisible={4} closeButton />
    </div>
  )
}
