import type { JSX } from "react"
import { Endnotes, EndnotesProvider, Note } from "endnotes"

export function ReadingTrail(): JSX.Element {
  return (
    <section className="section section--essay essay" id="reading-trail" aria-labelledby="reading-trail-title">
      <h2 id="reading-trail-title">The reading trail</h2>
      <p className="essay-lede">
        This page is a little honest: it is part case study, part install guide, part essay. I kept the API small on purpose. The hard part is not the component tree. It is deciding what a reference is allowed to do in an interface.
      </p>
      <p className="pull-line">
        A footnote is not always a bibliography entry. Sometimes it is timing, voice, evidence, or a whole second plot hiding in the back matter.
      </p>

      <EndnotesProvider adapt>
        <h3 className="essay-subhead">The physical flip</h3>
        <p>
          If you have ever read something with real endnotes, you know the gesture. You hit a superscript, you save your place, you jump to the back, you read a lane of text that was deliberately held back, then you snap back to the body. The annoyance is part of the design. Software can smooth the motion without pretending the deferral never happened.
        </p>

        <h3 className="essay-subhead">A novel that lives in the notes</h3>
        <p>
          David Foster Wallace&apos;s <em>Infinite Jest</em> is the usual shorthand for &quot;footnotes gone feral&quot;: hundreds of endnotes, some with their own footnotes, mapped in fan-maintained errata tables to specific pages in the back matter.
          <Note
            href="https://en.wikipedia.org/wiki/Infinite_Jest"
            source="Wikipedia"
            title="Infinite Jest"
            date="2026"
            quote="famous for its length, detail, and digressions involving 388 endnotes, some of which themselves have footnotes."
            supports="Structural claim about endnote count and nested notes."
          >
            Infinite Jest (overview)
          </Note>
          Endnote 24 is the long James O. Incandenza filmography: not a reading list, a parallel archive that changes how you hear the main text. Endnote 304 is a different kind of rabbit hole (the train game note in the same apparatus). Same mechanism, different jobs: world-building, punch line, evidence, pace.
          <Note
            href="https://infinitejest.wallacewiki.com/david-foster-wallace/index.php?title=Notes_and_Errata_-_Pages_983-1079"
            source="Wallace Wiki"
            title="Notes and Errata — pages 983–1079"
            date="2026"
            supports="Maps endnote numbers (including n24 and n304) to back-matter pages for cross-edition checking."
          >
            Infinite Jest notes and errata
          </Note>
        </p>
        <p>
          That is the point I care about in product work. A reference system that only knows &quot;source URL&quot; flattens everything into bibliography brain. The interesting notes are the ones that explain <em>why</em> the sentence in the body is allowed to exist.
          <Note
            href="https://lithub.com/on-david-foster-wallaces-footnotes/"
            source="Literary Hub"
            title="On David Foster Wallace’s footnotes"
            date="2016"
            supports="Critical context on footnotes as narrative and ethical device, not mere citation."
          >
            On Wallace’s footnotes
          </Note>
        </p>

        <h3 className="essay-subhead">Journals and the supplementary lane</h3>
        <p>
          Research publishing runs on the same split. The article is the argument; the supplement is the method, the extra table, the robustness check, the thing you do not want in the flow of the main read but cannot delete without breaking trust. Inline text sends you to &quot;see Supplementary Note 3&quot; the way fiction sends you to endnote 24. Different culture, same shape: a labeled trail instead of a vague see also link at the bottom.
          <Note
            href="https://journals.plos.org/plosone/s/submission-guidelines#loc-supplementary-material"
            source="PLOS ONE"
            title="Submission guidelines — supporting information"
            date="2026"
            supports="Editorial expectation that supporting information is cited from the article and treated as part of the published record."
          >
            PLOS ONE supporting information
          </Note>
        </p>

        <h3 className="essay-subhead">What I wanted in UI</h3>
        <p>
          So in React I wanted a primitive that behaves like a good endnote: quiet inline marker, explicit list, stable numbering, room for a pull quote or a &quot;this supports claim X&quot; line. Defaults that inherit typography so it can be beautiful without importing a second theme. The same instinct as strong component docs: show the work, reduce surprise, keep the surface calm.
          <Note
            href="https://emilkowal.ski/ui/building-a-toast-component"
            source="Emil Kowalski"
            author="Emil Kowalski"
            date="2026"
            supports="Claim that opinionated defaults and clear boundaries speed adoption and reduce bespoke UI drift."
          >
            Building a toast component
          </Note>
        </p>

        <h3 className="essay-subhead">Where Endnotes stops</h3>
        <p>
          Everything past that is a boundary, not a roadmap. No fetching previews, no managing your Zotero library, no turning your app into a CMS. The sections below are the boring, reliable contract: install, props, tokens. If the essay part did its job, you already know why that narrow scope is the feature.
        </p>

        <Endnotes title="Reading trail" />
      </EndnotesProvider>
    </section>
  )
}
