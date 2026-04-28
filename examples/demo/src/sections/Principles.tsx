import type { JSX } from "react"

export function Principles(): JSX.Element {
  return (
    <section className="section" id="principles" aria-labelledby="principles-title">
      <h2 id="principles-title">Principles</h2>
      <p>
        If you widen the scope, you inherit someone else&apos;s content model. I kept the boundary sharp so the API stays
        boring and the UI stays yours.
      </p>
      <ul className="principles-list">
        <li>
          <strong className="principles-strong">No source manager.</strong> It does not own your Zotero, BibTeX, or
          citation keys. You pass the metadata you already trust.
        </li>
        <li>
          <strong className="principles-strong">No preview fetching.</strong> No surprise network calls, no broken
          oEmbed states, no layout shift while a card loads.
        </li>
        <li>
          <strong className="principles-strong">No bibliography engine.</strong> It will not rewrite Chicago vs APA.
          It renders what you hand it: quote, supports line, link—then gets out of the way.
        </li>
        <li>
          <strong className="principles-strong">No publishing platform.</strong> It is not a CMS, not a doc host, not
          a comment system. One job: inline marker, collected trail, predictable numbering.
        </li>
      </ul>
      <p>
        That is the trade. You bring the judgment about what counts as evidence. Endnotes keeps the trail legible,
        keyboard-friendly, and quiet enough to ship next to real prose.
      </p>
    </section>
  )
}
