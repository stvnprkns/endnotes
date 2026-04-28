import type { JSX } from "react"
import { CodeBlock } from "../components/CodeBlock"

const TOKENS_SNIPPET = `:root {
  --endnotes-accent: var(--primary);
  --endnotes-radius: 10px;
  /* optional footnotes look: --endnotes-rule, --endnotes-citation (links use --endnotes-accent on hover) */
}`

export function Styling(): JSX.Element {
  return (
    <section className="section" id="styling" aria-labelledby="styling-title">
      <h2 id="styling-title">Styling</h2>
      <p>
        I did not want Endnotes to feel like importing a second design system. It maps to common app tokens like{" "}
        <code>--foreground</code>, <code>--muted-foreground</code>, <code>--background</code>, <code>--border</code>,{" "}
        <code>--primary</code>, and <code>--radius</code>.
      </p>
      <CodeBlock code={TOKENS_SNIPPET} label="Light override" title="Keep it native" language="css" />
    </section>
  )
}
