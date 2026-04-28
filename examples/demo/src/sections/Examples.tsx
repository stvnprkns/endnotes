import type { JSX } from "react"
import { Endnotes, EndnotesProvider, Note } from "endnotes"
import { CodeBlock } from "../components/CodeBlock"

const RICH_SNIPPET = `<Note
  href="https://en.wikipedia.org/wiki/Infinite_Jest"
  source="Wikipedia"
  title="Infinite Jest"
  date="2026"
  quote="famous for its length, detail, and digressions involving 388 endnotes, some of which themselves have footnotes."
>
  Infinite Jest (overview)
</Note>`

const DEDUPE_SNIPPET = `<Note href="https://en.wikipedia.org/wiki/Infinite_Jest">Infinite Jest (overview)</Note>
<Note href="https://en.wikipedia.org/wiki/Infinite_Jest">Infinite Jest (overview)</Note>

// One source. One number. Multiple references.`

export function Examples(): JSX.Element {
  return (
    <section className="section" id="examples" aria-labelledby="examples-title">
      <h2 id="examples-title">Rich notes and duplicate sources</h2>
      <p>
        Sometimes you only have a URL. Sometimes you have a pull quote, a named source, or a one-line &quot;this
        supports…&quot; bridge—the kind of thing you see in long-form criticism or a methods supplement. Rich fields
        are optional. Dedupe is not your job.
      </p>

      <div className="stack">
        <CodeBlock code={RICH_SNIPPET} label="Rich note" title="Metadata where it matters" language="tsx" />
        <div className="live-demo">
          <EndnotesProvider adapt>
            <p>
              A link alone is often not enough context.
              <Note
                href="https://en.wikipedia.org/wiki/Infinite_Jest"
                source="Wikipedia"
                title="Infinite Jest"
                date="2026"
                quote="famous for its length, detail, and digressions involving 388 endnotes, some of which themselves have footnotes."
              >
                Infinite Jest (overview)
              </Note>
            </p>
            <p>
              A useful reference explains what claim it is carrying, not just where it came from.
              <Note
                href="https://en.wikipedia.org/wiki/Infinite_Jest"
                source="Wikipedia"
                title="Infinite Jest"
                date="2026"
                supports="Claim that nested endnotes are a structural feature of the novel, not a bibliography appendix."
              >
                Infinite Jest (overview)
              </Note>
            </p>
            <Endnotes title="Footnotes & References" />
          </EndnotesProvider>
        </div>

        <CodeBlock code={DEDUPE_SNIPPET} label="Automatic dedupe" title="One source, multiple references" language="tsx" />
        <div className="live-demo">
          <EndnotesProvider adapt>
            <p>
              If the same source appears again, the UI should stay quiet.
              <Note href="https://en.wikipedia.org/wiki/Infinite_Jest">Infinite Jest (overview)</Note>
            </p>
            <p>
              Later mentions should reuse the same source identity automatically.
              <Note href="https://en.wikipedia.org/wiki/Infinite_Jest">Infinite Jest (overview)</Note>
            </p>
            <p className="muted">One source. One number. Multiple references.</p>
            <Endnotes title="Footnotes & References" />
          </EndnotesProvider>
        </div>
      </div>
    </section>
  )
}
