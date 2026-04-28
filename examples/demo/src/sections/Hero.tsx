import { useCallback, useState } from "react"
import type { JSX } from "react"
import { Endnotes, EndnotesProvider, Note } from "endnotes"
import { CodeBlock } from "../components/CodeBlock"

const INSTALL_COMMAND = "npm install endnotes"

const HERO_EXAMPLE = `import { Note, Endnotes } from "endnotes"
import "endnotes/style.css"

<p>
  Good interfaces show their work.
  <Note href="https://example.com">Example Source</Note>
</p>

<Endnotes title="Footnotes & References" />`

export function Hero(): JSX.Element {
  const [installCopied, setInstallCopied] = useState(false)

  const copyInstallCommand = useCallback(async () => {
    const done = () => {
      setInstallCopied(true)
      window.setTimeout(() => setInstallCopied(false), 2000)
    }
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND)
      done()
    } catch {
      const ta = document.createElement("textarea")
      ta.value = INSTALL_COMMAND
      ta.setAttribute("aria-hidden", "true")
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand("copy")
        done()
      } finally {
        document.body.removeChild(ta)
      }
    }
  }, [])

  return (
    <section className="section hero" id="top" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Endnotes</p>
        <h1 id="hero-title">A calm trail from claim to source.</h1>
        <p className="lede">
          Endnotes is a small React primitive for the moment everyone asks, &quot;okay, but where did that come from?&quot;
          I did not want another bibliography skin. I wanted the interaction you know from serious footnotes: marker
          next to the sentence, evidence collected where the eye expects it, typography that inherits your app instead
          of shouting over it.
        </p>
        <div className="install-cta" role="group" aria-labelledby="install-cta-title">
          <p id="install-cta-title" className="install-cta-title">
            Install from npm
          </p>
          <p className="install-cta-hint">Copy this command, paste it into your terminal, and press Enter.</p>
          <div className="install-cta-row">
            <code className="install-cta-command">{INSTALL_COMMAND}</code>
            <button
              type="button"
              className="install-cta-copy"
              onClick={copyInstallCommand}
              aria-label={installCopied ? "Command copied to clipboard" : "Copy install command to clipboard"}
            >
              {installCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <CodeBlock code={HERO_EXAMPLE} label="Tiny API" language="tsx" />

      <div className="live-demo">
        <h2 className="live-demo-title">The first impression</h2>
        <EndnotesProvider adapt>
          <p>
            Great component libraries usually win in the first 30 seconds.
            <Note
              href="https://emilkowal.ski/ui/building-a-toast-component"
              source="Emil Kowalski"
              author="Emil Kowalski"
              date="2026"
              supports="Claim that strong defaults and clear docs lower adoption friction."
            >
              Building a toast component
            </Note>
          </p>
          <p>
            The same instinct shows up when footnotes are doing real work—not just a link farm at the end of a blog
            post, but deferral, proof, or a second voice.
            <Note
              href="https://en.wikipedia.org/wiki/Infinite_Jest"
              source="Wikipedia"
              title="Infinite Jest"
              date="2026"
              quote="digressions involving 388 endnotes, some of which themselves have footnotes."
              supports="Example of endnotes as structural device rather than bibliography alone."
            >
              Infinite Jest (structure)
            </Note>
          </p>
          <Endnotes title="Footnotes & References" />
        </EndnotesProvider>
      </div>
    </section>
  )
}
