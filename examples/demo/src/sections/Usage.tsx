import type { JSX } from "react"
import { Endnotes, EndnotesProvider, Note, toaster } from "endnotes"
import { CodeBlock } from "../components/CodeBlock"

const USAGE_SNIPPET = `import { Note, Endnotes, Toaster, toaster } from "endnotes"
import "endnotes/style.css"

export function Article() {
  return (
    <>
      <p>
        Good interfaces show their work.
        <Note href="https://example.com">Example Source</Note>
      </p>
      <Endnotes />
      <Toaster />
    </>
  )
}`

const TOASTER_SNIPPET = `toaster.success("Saved", {
  description: "Your draft is synced to cloud."
})

toaster.promise(saveDraft(), {
  loading: "Saving draft...",
  success: "Draft saved",
  error: "Save failed"
})`

const TRUST_GATE_SNIPPET = `const result = await client.generate({
  draft,
  style: "numeric",
  outputFormat: "markdown"
})

const trust = evaluateTrustPolicy(result)
if (!trust.canPublish) {
  return { status: "needs_review", trust, result }
}

return { status: "publishable", trust, result }`

export function Usage(): JSX.Element {
  return (
    <section className="section" id="usage" aria-labelledby="usage-title">
      <h2 id="usage-title">Usage</h2>
      <p>
        The model is intentionally boring, which is the point. You mark the sentence that needs air, then you render{" "}
        <code>Endnotes</code> once. Everything else—numbering, dedupe, scroll target—is deterministic so you can think
        about writing, not state machines.
      </p>
      <CodeBlock code={USAGE_SNIPPET} label="Minimal usage" title="Start here" language="tsx" />
      <CodeBlock code={TOASTER_SNIPPET} label="Imperative API" title="Sonner-style toasts" language="tsx" />
      <CodeBlock code={TRUST_GATE_SNIPPET} label="Trust gate" title="Publish vs needs review" language="ts" />
      <div className="install-cta-row" style={{ maxWidth: "42rem", marginBottom: "1rem" }}>
        <button
          type="button"
          className="install-cta-copy"
          onClick={() =>
            toaster.success("Changes saved", {
              description: "Endnotes now supports a Sonner-style imperative API."
            })
          }
        >
          Success Toast
        </button>
        <button
          type="button"
          className="install-cta-copy"
          onClick={() =>
            toaster.promise(
              new Promise<void>((resolve) => {
                window.setTimeout(() => resolve(), 1200)
              }),
              {
                loading: "Publishing update...",
                success: "Update published",
                error: "Publishing failed"
              }
            )
          }
        >
          Promise Toast
        </button>
      </div>
      <div className="live-demo">
        <EndnotesProvider adapt>
          <p>
            Endnotes sit at the bottom of the page or section, like print end matter—except the jump is one click, not
            a thumb workout.
            <Note
              href="https://en.wikipedia.org/wiki/Endnote"
              source="Wikipedia"
              title="Endnote"
              date="2026"
              quote="A note containing text printed at the end of a document, such as a chapter, book, or PDF."
              supports="Definition of endnotes as deferred text anchored to the body."
            >
              Endnote (typography)
            </Note>
          </p>
          <p>
            Journals use the same split under different names: main text, then supporting information with its own
            identifiers and citation hooks.
            <Note
              href="https://journals.plos.org/plosone/s/submission-guidelines#loc-supplementary-material"
              source="PLOS ONE"
              title="Supporting information"
              date="2026"
              supports="Claim that supplementary files are part of the publication record and expected to be cited from the article."
            >
              PLOS ONE submission guidelines
            </Note>
          </p>
          <p>
            Some details are narrative annotations rather than bibliography sources.
            <Note kind="note">Rollout timing note: support playbooks were finalized one sprint later.</Note>
          </p>
          <Endnotes title="Footnotes & References" />
        </EndnotesProvider>
      </div>
    </section>
  )
}
