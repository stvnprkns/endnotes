import { render, screen, fireEvent, cleanup, within } from "@testing-library/react"
import { describe, expect, it, vi, beforeAll, beforeEach, afterEach } from "vitest"
import { Endnote } from "../src/components/Endnote"
import { Endnotes } from "../src/components/Endnotes"
import { Note } from "../src/components/Note"
import { EndnotesProvider } from "../src/components/EndnotesProvider"

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: vi.fn(),
    configurable: true
  })
})

let reducedMotion = false

beforeEach(() => {
  reducedMotion = false
  vi.clearAllMocks()

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? reducedMotion : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe("Endnotes rendering", () => {
  it("renders marker and note title from children without provider", async () => {
    render(
      <>
        <p>
          Claim text
          <Note href="https://example.com/source">Source 1</Note>
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByRole("link", { name: /view reference 1: source 1/i })).toBeInTheDocument()
    expect(await screen.findByText("Source 1")).toBeInTheDocument()
  })

  it("uses title prop over children when both are provided", async () => {
    render(
      <>
        <p>
          Claim text
          <Note href="https://example.com/source" title="Title Prop Wins">
            Children Title
          </Note>
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByRole("link", { name: /view reference 1: title prop wins/i })).toBeInTheDocument()
    expect(screen.getByText("Title Prop Wins")).toBeInTheDocument()
  })

  it("explicit provider still works", async () => {
    render(
      <EndnotesProvider>
        <p>
          Claim text
          <Note id="source-1" title="Source 1" source="Publisher" />
        </p>
        <Endnotes />
      </EndnotesProvider>
    )

    expect(await screen.findByRole("link", { name: /view reference 1/i })).toBeInTheDocument()
    expect(await screen.findByText("Source 1")).toBeInTheDocument()
  })

  it("uses Endnotes title prop for section heading and aria-label", async () => {
    render(
      <>
        <p>
          Claim
          <Note href="https://example.com/source">Source 1</Note>
        </p>
        <Endnotes title="Footnotes & References" />
      </>
    )

    expect(screen.getByRole("heading", { level: 2, name: "Footnotes & References" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Footnotes & References" })).toBeInTheDocument()
  })

  it("uses heading prop as alias when title is omitted", async () => {
    render(
      <>
        <p>
          Claim
          <Note href="https://example.com/source">Source 1</Note>
        </p>
        <Endnotes heading="Sources" />
      </>
    )

    expect(screen.getByRole("heading", { level: 2, name: "Sources" })).toBeInTheDocument()
  })

  it("dedupes duplicate references and shows backlinks for each marker", async () => {
    render(
      <>
        <p>
          First
          <Note id="shared">Shared source</Note>
        </p>
        <p>
          Second
          <Note id="shared">Shared source</Note>
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findAllByRole("link", { name: /view reference 1/i })).toHaveLength(2)
    expect(screen.getAllByText("Shared source")).toHaveLength(1)
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    expect(screen.getAllByRole("link", { name: /return to citation 1/i })).toHaveLength(2)
  })

  it("handles missing source data gracefully", async () => {
    render(
      <>
        <p>
          Claim
          <Note id="bare" />
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByText("Untitled source")).toBeInTheDocument()
  })

  it("renders internal note metadata without href", async () => {
    render(
      <>
        <p>
          Internal context
          <Note source="Internal memo" date="2026">
            Design review notes
          </Note>
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByText("Design review notes")).toBeInTheDocument()
    expect(screen.getByText("Internal memo")).toBeInTheDocument()
  })

  it("shows and hides marker preview on hover", async () => {
    render(
      <>
        <p>
          Claim text
          <Note
            href="https://example.com/research"
            source="Interface Research Group"
            author="Mara Bell"
            date="2026"
            quote="Users trusted generated answers more when sources appeared close to the claim."
          >
            Source Trails in AI Products
          </Note>
        </p>
        <Endnotes />
      </>
    )

    const marker = await screen.findByRole("link", { name: /view reference 1: source trails in ai products/i })
    fireEvent.mouseEnter(marker.closest("sup")!)
    const preview = screen.getByRole("region", { name: /reference preview: source trails in ai products/i })
    expect(preview).toBeInTheDocument()
    expect(within(preview).getByText("Source Trails in AI Products")).toBeInTheDocument()
    expect(within(preview).getByText(/interface research group · mara bell · 2026/i)).toBeInTheDocument()
    expect(
      within(preview).getByText(/users trusted generated answers more when sources appeared close to the claim/i)
    ).toBeInTheDocument()
    expect(within(preview).getByRole("link", { name: "https://example.com/research" })).toHaveAttribute(
      "href",
      "https://example.com/research"
    )

    fireEvent.mouseLeave(marker.closest("sup")!)
    expect(screen.queryByRole("region", { name: /reference preview:/i })).not.toBeInTheDocument()
  })

  it("shows marker preview on focus and hides on blur", async () => {
    render(
      <>
        <p>
          Claim text
          <Note href="https://example.com/source">Focus Source</Note>
        </p>
        <Endnotes />
      </>
    )

    const marker = await screen.findByRole("link", { name: /view reference 1: focus source/i })
    fireEvent.focus(marker)
    const preview = screen.getByRole("region", { name: /reference preview: focus source/i })
    expect(preview).toBeInTheDocument()
    expect(marker).toHaveAttribute("aria-describedby")

    fireEvent.blur(marker)
    expect(screen.queryByRole("region", { name: /reference preview:/i })).not.toBeInTheDocument()
    expect(marker).not.toHaveAttribute("aria-describedby")
  })

  it("toggles marker preview on touch tap", async () => {
    render(
      <>
        <p>
          Claim text
          <Note href="https://example.com/source">Touch Source</Note>
        </p>
        <Endnotes />
      </>
    )

    const marker = await screen.findByRole("link", { name: /view reference 1: touch source/i })
    fireEvent.touchStart(marker)
    fireEvent.click(marker)
    expect(screen.getByRole("region", { name: /reference preview: touch source/i })).toBeInTheDocument()
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()

    fireEvent.click(marker)
    expect(screen.queryByRole("region", { name: /reference preview:/i })).not.toBeInTheDocument()
  })

  it("supports note navigation from marker click", async () => {
    render(
      <>
        <p>
          Claim
          <Note id="navigate">Navigate Source</Note>
        </p>
        <Endnotes />
      </>
    )

    const marker = await screen.findByRole("link", { name: /view reference 1/i })
    fireEvent.click(marker)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
    expect(screen.getByRole("listitem")).toHaveClass("is-active")
    expect(screen.getByRole("listitem")).toHaveFocus()
  })

  it("supports backlink navigation and accessible backlink labels", async () => {
    render(
      <>
        <p>
          Claim
          <Note id="shared">Shared source</Note>
        </p>
        <p>
          Claim again
          <Note id="shared">Shared source</Note>
        </p>
        <Endnotes />
      </>
    )

    const backlinks = await screen.findAllByRole("link", { name: /return to citation 1/i })
    expect(backlinks).toHaveLength(2)
    fireEvent.click(backlinks[0]!)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
    const markers = await screen.findAllByRole("link", { name: /view reference 1/i })
    expect(markers[0]).toHaveFocus()
  })

  it("applies active marker state after backlink navigation in implicit mode", async () => {
    render(
      <>
        <p>
          First claim
          <Note id="implicit-shared">Shared source</Note>
        </p>
        <p>
          Second claim
          <Note id="implicit-shared">Shared source</Note>
        </p>
        <Endnotes />
      </>
    )

    const markers = await screen.findAllByRole("link", { name: /view reference 1/i })
    const backlinks = await screen.findAllByRole("link", { name: /return to citation 1/i })

    fireEvent.click(backlinks[0]!)
    expect(markers[0]).toHaveClass("is-active")
  })

  it("renders long text metadata safely", async () => {
    render(
      <>
        <p>
          Claim
          <Note
            id="long-metadata"
            title="A very long report title that should wrap safely in the generated list without visual breakage"
            source="Longform Source Team"
            author="Someone"
            date="2026"
            description="Very long description content that should render without throwing and remain readable."
            quote="This is a long quote that should remain subtle in the default card style."
          />
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByText(/very long report title/i)).toBeInTheDocument()
    expect(screen.getByText(/very long description content/i)).toBeInTheDocument()
  })

  it("renders long URL sources without layout-breaking fallback", async () => {
    const longUrl =
      "https://example.com/reports/long-urls/2026/q2/source-trails/field-research/findings/appendix/interaction-models/inline-citation-patterns-and-trust-calibration"

    render(
      <>
        <p>
          Claim
          <Note href={longUrl}>Long URL Wrapping Test</Note>
        </p>
        <Endnotes />
      </>
    )

    const listItem = await screen.findByRole("listitem")
    const title = within(listItem).getByRole("link", { name: /long url wrapping test/i })
    expect(title).toHaveAttribute("href", longUrl)
  })

  it("does not render javascript protocol href as a clickable link", async () => {
    render(
      <>
        <p>
          Claim
          <Note href="javascript:alert(document.domain)">Unsafe JS Link</Note>
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByText("Unsafe JS Link")).toBeInTheDocument()
    const dangerousHrefs = screen
      .getAllByRole("link")
      .map((el) => el.getAttribute("href") ?? "")
      .filter((href) => /^javascript:/i.test(href) || /^data:/i.test(href))
    expect(dangerousHrefs).toHaveLength(0)
  })

  it("does not render data protocol href as a clickable link", async () => {
    render(
      <>
        <p>
          Claim
          <Note href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Unsafe Data Link</Note>
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByText("Unsafe Data Link")).toBeInTheDocument()
    const dangerousHrefs = screen
      .getAllByRole("link")
      .map((el) => el.getAttribute("href") ?? "")
      .filter((href) => /^javascript:/i.test(href) || /^data:/i.test(href))
    expect(dangerousHrefs).toHaveLength(0)
  })

  it("renders expected core css class names", async () => {
    render(
      <>
        <p>
          Claim
          <Note id="css-classes">Class Source</Note>
        </p>
        <Endnotes />
      </>
    )

    const marker = await screen.findByRole("link", { name: /view reference 1/i })
    const listItem = screen.getByRole("listitem")
    expect(marker).toHaveClass("endnotes-marker-link")
    expect(listItem).toHaveClass("endnotes-item")
  })

  it("keeps Endnote as alias for Note", async () => {
    render(
      <>
        <p>
          Claim
          <Endnote href="https://example.com/alias" title="Alias Source" />
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByRole("link", { name: /view reference 1: alias source/i })).toBeInTheDocument()
  })

  it("uses auto scroll behavior when reduced motion is preferred", async () => {
    reducedMotion = true

    render(
      <>
        <p>
          Claim
          <Note id="reduced-motion">Reduced Motion Source</Note>
        </p>
        <Endnotes />
      </>
    )

    const marker = await screen.findByRole("link", { name: /view reference 1/i })
    fireEvent.click(marker)

    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start"
    })
  })

  it("clears active highlight after reduced-motion timeout", async () => {
    reducedMotion = true

    render(
      <>
        <p>
          Claim
          <Note id="reduced-timeout">Reduced Timeout Source</Note>
        </p>
        <Endnotes />
      </>
    )

    const marker = await screen.findByRole("link", { name: /view reference 1/i })
    vi.useFakeTimers()
    fireEvent.click(marker)
    const listItem = screen.getByRole("listitem")
    expect(listItem).toHaveClass("is-active")

    await vi.advanceTimersByTimeAsync(701)
    expect(listItem).not.toHaveClass("is-active")
  })

  it("keeps deterministic numbering across rerenders", async () => {
    const view = render(
      <>
        <p>
          First
          <Note id="stable-a">Stable A</Note>
        </p>
        <p>
          Second
          <Note id="stable-b">Stable B</Note>
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByRole("link", { name: /view reference 1: stable a/i })).toBeInTheDocument()
    expect(await screen.findByRole("link", { name: /view reference 2: stable b/i })).toBeInTheDocument()

    view.rerender(
      <>
        <p>
          First
          <Note id="stable-a">Stable A</Note>
        </p>
        <p>
          Second
          <Note id="stable-b">Stable B</Note>
        </p>
        <Endnotes />
      </>
    )

    expect(await screen.findByRole("link", { name: /view reference 1: stable a/i })).toBeInTheDocument()
    expect(await screen.findByRole("link", { name: /view reference 2: stable b/i })).toBeInTheDocument()
  })
})
