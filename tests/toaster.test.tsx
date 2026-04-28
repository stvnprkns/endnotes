import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Toaster, toaster } from "../src"

describe("Toaster", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)" ? false : false,
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
    toaster.dismiss()
    cleanup()
  })

  it("shows and dismisses a toast", async () => {
    render(<Toaster duration={40} />)
    toaster("Saved draft")

    expect(await screen.findByText("Saved draft")).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText("Saved draft")).not.toBeInTheDocument()
    })
  })

  it("supports toast.promise transitions", async () => {
    render(<Toaster duration={1200} />)
    const task = new Promise<string>((resolve) => {
      window.setTimeout(() => resolve("done"), 30)
    })
    void toaster.promise(task, {
      loading: "Saving...",
      success: (value) => `Success: ${value}`,
      error: "Failed"
    })

    expect(await screen.findByText("Saving...")).toBeInTheDocument()
    await task
    await waitFor(() => expect(screen.getByText("Success: done")).toBeInTheDocument())
  })

  it("handles action buttons", async () => {
    render(<Toaster closeButton />)
    const onUndo = vi.fn()
    toaster("Archived", {
      action: { label: "Undo", onClick: onUndo }
    })

    fireEvent.click(await screen.findByRole("button", { name: "Undo" }))
    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it("respects maxVisible queue", async () => {
    render(<Toaster maxVisible={2} />)
    toaster("Toast 1")
    toaster("Toast 2")
    toaster("Toast 3")

    expect(screen.queryByText("Toast 1")).not.toBeInTheDocument()
    expect(await screen.findByText("Toast 2")).toBeInTheDocument()
    expect(await screen.findByText("Toast 3")).toBeInTheDocument()
  })
})
