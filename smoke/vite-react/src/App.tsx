import { Endnotes, Note } from "endnotes"
import "endnotes/style.css"
import "./app.css"

export default function App() {
  return (
    <main className="shell">
      <article>
        <h1>Endnotes smoke test</h1>

        <p>
          Good interfaces show their work.
          <Note href="https://example.com/research">Example Research</Note>
        </p>

        <p>
          Duplicate references should reuse the same note number.
          <Note href="https://example.com/research">Example Research</Note>
        </p>

        <p>
          Rich references can carry useful context.
          <Note
            href="https://example.com/source-trails"
            source="Interface Research Group"
            author="Mara Bell"
            date="2026"
            quote="Users trusted generated answers more when sources appeared close to the claim."
          >
            Source Trails in AI Products
          </Note>
        </p>

        <p>
          Internal notes should not require a URL.
          <Note source="Internal memo" date="2026">
            Design review notes
          </Note>
        </p>

        <Endnotes />
      </article>
    </main>
  )
}
