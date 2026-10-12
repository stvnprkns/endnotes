import type { JSX } from "react"
import { Note } from "endnotes"

export type PassageId = "jest" | "roach" | "nature"

export type Passage = {
  id: PassageId
  label: string
  notesTitle: string
  Content: () => JSX.Element
}

function InfiniteJest(): JSX.Element {
  return (
    <p>
      “I am seated in an office, surrounded by heads and bodies. My posture is consciously congruent to the shape of my hard chair.”<Note
        id="jest-book"
        title="Infinite Jest"
        href="https://en.wikipedia.org/wiki/Infinite_Jest"
        source="David Foster Wallace. Little, Brown, 1996. Opening lines."
      />
    </p>
  )
}

function MaryRoach(): JSX.Element {
  return (
    <p>
      “The way I see it, being dead is not terribly far off from being on a cruise ship. Most of your time is spent lying on your back.”<Note
        id="roach-stiff"
        title="Stiff: The Curious Lives of Human Cadavers"
        href="https://wwnorton.com/books/9780393324822"
        source="Mary Roach. W. W. Norton, 2003. Opening lines."
      />
    </p>
  )
}

function Nature(): JSX.Element {
  return (
    <>
      <p>
        “Here we provide the first computational method that can regularly predict protein structures with atomic accuracy even in cases in which no similar structure is known.”<Note
          id="nature-alphafold"
          title="Highly accurate protein structure prediction with AlphaFold"
          href="https://doi.org/10.1038/s41586-021-03819-2"
          source="Jumper, J. et al. Nature 596, 583–589 (2021). Abstract."
        />
      </p>
      <p>
        “We validated an entirely redesigned version of our neural network-based model, AlphaFold, in the challenging 14th Critical Assessment of protein Structure Prediction (CASP14), demonstrating accuracy competitive with experimental structures in a majority of cases and greatly outperforming other methods.”<Note
          id="nature-alphafold"
          title="Highly accurate protein structure prediction with AlphaFold"
          href="https://doi.org/10.1038/s41586-021-03819-2"
          source="Jumper, J. et al. Nature 596, 583–589 (2021). Abstract."
        />
      </p>
    </>
  )
}

export const passages: Passage[] = [
  { id: "jest", label: "Infinite Jest", notesTitle: "End notes", Content: InfiniteJest },
  { id: "roach", label: "Mary Roach", notesTitle: "End notes", Content: MaryRoach },
  { id: "nature", label: "Nature", notesTitle: "References", Content: Nature }
]
