# Browser Support

Endnotes targets modern evergreen browsers commonly used in production React apps.

## Supported baseline

- Chrome (latest stable)
- Edge (latest stable)
- Firefox (latest stable)
- Safari (latest stable)

## Runtime assumptions

Endnotes relies on platform features available in modern browsers:

- `Element.scrollIntoView`
- `:focus-visible`
- CSS custom properties (`--token` variables)
- `prefers-reduced-motion` media query

## Non-goals

- Legacy IE support
- Polyfill bundles shipped by Endnotes itself
- Full academic citation formatting compatibility

## Host app responsibilities

If your support matrix includes older browsers, apply polyfills at the host app layer.

Typical host-level polyfills may include:

- smooth scroll behavior fallbacks
- `:focus-visible` fallback strategy (if required by your design system)

## Validation matrix for releases

For each release, verify at least:

1. Marker numbering and dedupe are deterministic.
2. Marker click moves to note and applies temporary highlight.
3. Backlink click returns focus to source marker.
4. Reduced-motion preference disables animated transitions while preserving orientation cues.
5. Long note titles and URLs wrap without overflow on mobile widths.
