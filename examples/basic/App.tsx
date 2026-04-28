import { Endnotes, Note } from "../../src"
import "../../src/styles/endnotes.css"
import "./example.css"

export default function App() {
  return (
    <main className="demo-shell">
      <article className="demo-essay">
        <p className="demo-kicker">Endnotes</p>
        <h1>Good interfaces show their work.</h1>
        <p>
          Thoughtful product writing earns trust when claims are easy to inspect.
          <Note href="https://example.com/report">Product Interfaces Report</Note>
        </p>
        <p>
          Repeating the same source should not create noise in the list.
          <Note href="https://example.com/report">Product Interfaces Report</Note>
        </p>
        <p>
          Rich references can add context without breaking reading flow.
          <Note
            id="developer-survey-2026"
            href="https://example.com/survey"
            source="Platform Research Group"
            author="Research Team"
            date="2026"
            supports="Claim about daily AI-assisted coding workflow adoption."
            quote="72% of respondents use AI assistance in at least one daily workflow."
          >
            Developer Survey 2026
          </Note>
        </p>
        <p>
          Notes can also capture supporting evidence in plain language for decision-making.
          <Note
            id="change-log"
            source="Internal Experiment"
            supports="A visible source trail reduces review friction in editorial workflows."
          >
            Internal Launch Notes
          </Note>
        </p>
        <Endnotes title="Sources" />
      </article>
    </main>
  )
}
