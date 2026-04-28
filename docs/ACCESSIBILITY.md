# Accessibility

Accessibility is baseline behavior in Endnotes, not an optional add-on.

## Built-in behaviors

- Inline markers are interactive buttons with descriptive labels.
- Endnote rows are focusable targets for marker-driven navigation.
- Backlinks are interactive buttons with clear return labels.
- Focus-visible treatment is present for markers and backlinks.
- Reduced-motion users get orientation cues without smooth animated transitions.

## Expected keyboard flow

1. User tabs to an inline marker.
2. Pressing Enter/Space activates marker and moves to the matching note.
3. User tabs to one of the note backlinks.
4. Pressing Enter/Space returns to the originating marker.

## Screen reader semantics

- Marker labels include numeric order and note title when available.
- Backlink labels include destination marker number.
- Generated notes are rendered as a semantic list.

## Product limitations

- Endnotes does not infer citation quality or source credibility.
- Endnotes does not enforce external content accessibility for linked URLs.

## Manual verification checklist

- Navigate the entire marker/backlink flow with keyboard only.
- Confirm visible focus indicators against both light and dark host themes.
- Enable reduced-motion in OS settings and confirm behavior remains understandable.
- Validate that repeated sources expose multiple backlinks without ambiguity.
- Verify no color-only signal is required to understand active state.

## Automated coverage

Automated tests cover:

- marker and note rendering
- dedupe and backlink behavior
- marker-to-note and backlink-to-marker navigation
- reduced-motion-safe interaction behavior

See `tests/rendering.test.tsx` for current assertions.
