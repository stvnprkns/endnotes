import type { JSX } from "react"
import { CodeBlock } from "../components/CodeBlock"

const INSTALL_SNIPPET = `npm install endnotes`

const CSS_SNIPPET = `import "endnotes/style.css"`

export function Installation(): JSX.Element {
  return (
    <section className="section" id="install" aria-labelledby="install-title">
      <h2 id="install-title">Install</h2>
      <p>I care a lot about this part. If setup feels heavy, people leave. So the happy path is still two lines.</p>
      <div className="two-up">
        <CodeBlock code={INSTALL_SNIPPET} label="Package" title="Install" language="bash" />
        <CodeBlock code={CSS_SNIPPET} label="Styles" title="Import CSS" language="tsx" />
      </div>
    </section>
  )
}
