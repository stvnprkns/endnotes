# Craft UI Pass

## What felt visually weak before this pass

- The marker was functional but slightly generic in tone and hit-area polish.
- Endnotes cards were readable, but hierarchy between title, metadata, and supporting text felt flatter than intended.
- Focus transfer worked functionally, but focused note targets lacked a strong visual cue.
- Reduced-motion behavior cleared highlights immediately, which reduced orientation feedback.
- Demo docs page looked clean but uniform; hero and code blocks needed stronger editorial hierarchy.
- Header navigation exposed only a subset of sections and included a placeholder-style link treatment.

## UI changes made

- Refined marker craft in package CSS:
  - calmer default marker color and stronger active state
  - tuned superscript size/offset and hit area
  - cleaner focus ring treatment using layered box-shadow
  - disabled loading placeholder marker to avoid transient interactive confusion
- Refined endnotes list hierarchy:
  - more understated section heading style
  - improved number/title/meta rhythm
  - calmer quote/supports/description typography
  - subtler backlink sizing and weight
  - stronger focused-note treatment (`:focus-visible`)
- Expanded package CSS token model:
  - `--endnotes-surface`
  - `--endnotes-marker-hover`
  - safer fallback-first values for border/highlight usage

## Interaction details refined

- Fixed implicit-mode active marker memo dependency so backlink return reliably updates marker active state.
- Updated marker->note navigation scroll target alignment (`block: start`) for more predictable landing.
- Kept marker return behavior compact (`nearest`) with inline-safe alignment.
- Increased highlight dwell time and preserved a brief non-animated orientation cue in reduced-motion mode.
- Added focused-note visual treatment so keyboard/programmatic focus is explicit after navigation.

## Demo/docs craft changes

- Elevated typography and spacing rhythm across sections.
- Improved hero composition and copy clarity:
  - “Add source trails to your app with one inline note and one generated list.”
- Upgraded code block presentation with label/title hierarchy.
- Improved nav polish and section discoverability by exposing more anchors.
- Replaced placeholder link affordance with neutral metadata copy in header.
- Improved responsive behavior for header wrapping, hero layout, and dense section readability.

## What still needs visual browser review

- Marker contrast in low-contrast host themes with custom token overrides.
- Focus ring visual strength against highly saturated host backgrounds.
- Long URL wrapping and card rhythm on very narrow mobile widths.
- Dark mode balance between section surfaces and package endnote surfaces when embedded in custom app palettes.
- Scroll landing comfort in pages with sticky app headers (host-dependent).

## Tradeoffs

- Kept the package CSS conservative and variable-driven instead of adding variant-specific visual systems.
- Preserved existing API and behavior model; did not add new interaction props/features.
- Kept demo styling plain-CSS and dependency-free, which favors portability over advanced visual effects.
