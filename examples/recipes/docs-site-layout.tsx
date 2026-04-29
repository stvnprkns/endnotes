import type { ReactNode } from "react"
import { Endnotes, EndnotesProvider, Note } from "../../src"

type DocsPageProps = {
  children: ReactNode
}

export function DocsPageLayout({ children }: DocsPageProps) {
  return (
    <EndnotesProvider adapt>
      <article>
        {children}
        <p>
          This guide follows stable integration defaults.
          <Note kind="citation" href="https://example.com/docs-integration" type="website">
            Integration Notes
          </Note>
        </p>
        <Endnotes title="References" />
      </article>
    </EndnotesProvider>
  )
}
