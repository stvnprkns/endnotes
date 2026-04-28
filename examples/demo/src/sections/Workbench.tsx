import type { JSX } from "react"
import { Endnotes, EndnotesProvider, Note } from "endnotes"

export function Workbench(): JSX.Element {
  return (
    <section className="section section--workbench" id="workbench" aria-labelledby="workbench-title">
      <h2 id="workbench-title">See it under stress</h2>
      <p>
        This is the part I always check before shipping: long content, repeated sources, offline notes, dark mode, and
        keyboard flow.
      </p>
      <div className="live-demo live-demo--workbench">
        <EndnotesProvider adapt>
          <p className="workbench-line">
            Basic note state.
            <Note href="https://example.com/basic">Basic Source</Note>
          </p>
          <p className="workbench-line">
            Rich note state.
            <Note
              href="https://example.com/reports/source-trails"
              source="Example Research"
              quote="Users were more likely to trust generated answers when sources appeared close to the claim."
              supports="Inline sources improve trust calibration."
            >
              Source Trails in AI Products
            </Note>
          </p>
          <p className="workbench-line">
            Duplicate source dedupe.
            <Note href="https://example.com/reports/trust-in-ai-systems" source="Research Lab">
              Trust in AI Systems
            </Note>
          </p>
          <p className="workbench-line">
            Same source again.
            <Note href="https://example.com/reports/trust-in-ai-systems" source="Research Lab">
              Trust in AI Systems
            </Note>
          </p>
          <p className="workbench-line">
            Internal or offline source.
            <Note source="Internal memo" date="2026">
              Design review notes
            </Note>
          </p>
          <p className="workbench-line">
            Long title handling.
            <Note href="https://example.com/reports/long-title-case-study" source="Editorial Systems Group">
              Building Composable Trust Surfaces Across Multi-Modal Product Interfaces in High-Velocity Teams Without
              Disrupting Reading Rhythm
            </Note>
          </p>
          <p className="workbench-line">
            Long URL handling.
            <Note href="https://example.com/reports/long-urls/2026/q2/source-trails/field-research/findings/appendix/interaction-models/inline-citation-patterns-and-trust-calibration">
              Long URL Wrapping Test
            </Note>
          </p>
          <Endnotes title="Footnotes & References" />
        </EndnotesProvider>
      </div>
    </section>
  )
}
