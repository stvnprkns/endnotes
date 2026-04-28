import type { JSX } from "react"

type ApiItem = {
  name: string
  details: string
}

type ApiGroupProps = {
  title: string
  items: ApiItem[]
}

function ApiGroup({ title, items }: ApiGroupProps): JSX.Element {
  return (
    <div className="api-group">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.name}>
            <code>{item.name}</code>
            <span>{item.details}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function APIReference(): JSX.Element {
  return (
    <section className="section section--reference" id="api" aria-labelledby="api-title">
      <h2 id="api-title">API Reference</h2>
      <p>Small enough to remember. Explicit enough to ship.</p>

      <ApiGroup
        title="Note"
        items={[
          { name: "children", details: "Inline title content when title is omitted." },
          { name: "title", details: "Explicit title. Takes precedence over children." },
          { name: "href", details: "External source URL." },
          { name: "id", details: "Canonical identity for dedupe." },
          { name: "source", details: "Source publisher or group." },
          { name: "author", details: "Author metadata." },
          { name: "date", details: "Publication or reference date." },
          { name: "accessed", details: "Accessed date." },
          { name: "quote", details: "Quoted supporting line." },
          { name: "supports", details: "Claim this source supports." },
          { name: "description", details: "Additional note body text." },
          { name: "type", details: "Optional source kind metadata." },
          { name: "className", details: "Extra class on the inline marker wrapper." }
        ]}
      />

      <ApiGroup
        title="Endnotes"
        items={[
          { name: "title", details: "Footnotes section heading (renders as the `<h2>` above the list)." },
          { name: "heading", details: "Alias for title." },
          { name: "className", details: "Extra class for list section wrapper." }
        ]}
      />

      <ApiGroup
        title="Toaster / toaster"
        items={[
          { name: "<Toaster />", details: "Mount once near app root. Handles rendering, motion, and queue." },
          { name: "toaster(message, options?)", details: "Show default toast and receive id." },
          { name: "toaster.success/info/warning/error", details: "One-liner typed variants." },
          { name: "toaster.loading", details: "Persistent loading toast until dismissed or updated." },
          { name: "toaster.dismiss(id?)", details: "Dismiss one toast by id or all visible toasts." },
          { name: "toaster.update(id, next, options?)", details: "Update existing toast by id." },
          { name: "toaster.promise(promise, states)", details: "Map async lifecycle to loading/success/error." },
          { name: "position", details: "top-left/top-right/top-center/bottom-left/bottom-right/bottom-center." },
          { name: "maxVisible", details: "Maximum visible toast cards (newest-first stack)." },
          { name: "action / cancel", details: "Optional CTA buttons per toast." }
        ]}
      />

      <ApiGroup
        title="EndnotesProvider (advanced)"
        items={[
          { name: "adapt", details: "Map to host app CSS tokens." },
          { name: "theme", details: "Direct theme token overrides." },
          { name: "variant", details: "default or compact list density." },
          { name: "marker", details: "Reserved marker prop in current API shape." },
          { name: "behavior", details: "Reserved behavior prop in current API shape." }
        ]}
      />
    </section>
  )
}
