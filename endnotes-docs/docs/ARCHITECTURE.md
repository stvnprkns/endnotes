# Architecture

Endnotes has three core layers:

1. Registry
2. Rendering
3. Interaction

The implementation should keep these layers separate so the public API stays simple while the internal behavior remains reliable.

## 1. Registry

The registry is owned by `EndnotesProvider`.

Responsibilities:

- store registered sources
- assign stable note numbers
- dedupe sources by identity
- track inline reference instances
- expose note data to `Endnotes`
- expose actions through context

Possible internal shape:

```ts
type RegistryState = {
  notesById: Map<string, RegisteredEndnote>
  order: string[]
  referencesByNoteId: Map<string, InlineReference[]>
  activeNoteId?: string
  activeReferenceId?: string
}
```

## 2. Registration flow

When `Endnote` mounts:

1. resolve source identity
2. register source with provider
3. receive assigned number
4. register inline reference instance
5. render marker

When `Endnote` unmounts:

1. unregister inline reference instance
2. keep source if another inline reference uses it
3. remove source if no references remain
4. recalculate order only when necessary

## 3. Numbering

Numbers should be based on first appearance in render order.

For deterministic behavior:

- prefer explicit IDs
- use React `useId` for instance IDs
- avoid random IDs
- avoid Date-based IDs
- keep server/client ordering stable

## 4. Dedupe

Dedupe identity priority:

1. explicit `id`
2. normalized `href`
3. generated instance identity

If the same ID is registered with conflicting metadata, dev mode should warn.

## 5. Rendering

### `Endnote`

Renders the inline marker.

It should not know how the full list is rendered. It only needs the assigned note number and interaction handlers.

### `Endnotes`

Reads the registry and renders the ordered list.

It should support variants without changing the registry model.

### Preview components

Popover and drawer previews should be separate internal components:

- `EndnotePopover`
- `EndnoteDrawer`
- `EndnoteCard`

## 6. Interaction

Core interactions:

- marker click
- marker keyboard activation
- popover open/close
- drawer open/close
- scroll to note
- scroll back to reference
- highlight active note/reference

The provider should expose interaction helpers:

```ts
type EndnotesActions = {
  openPreview: (noteId: string, referenceId: string) => void
  closePreview: () => void
  scrollToNote: (noteId: string) => void
  scrollToReference: (noteId: string, referenceId?: string) => void
}
```

## 7. Style adaptation

The style adapter should resolve theme values in this order:

1. explicit `theme` prop
2. known CSS variables
3. computed parent styles
4. default theme

The adapter should avoid layout thrashing.

Read computed styles once on mount, then update on theme/class changes only if necessary.

## 8. Accessibility

Use real buttons for interactive markers unless the marker is a direct link.

Expected details:

- marker label: `View reference 1: Source title`
- popover role and focus management
- Escape closes previews
- focus returns to the invoking marker
- note backlinks are links or buttons with clear labels
- reduced motion disables animated scroll/highlight transitions

## 9. SSR and hydration

Avoid client/server mismatch by:

- deterministic registration order
- stable React IDs
- no random runtime values in rendered markup
- no client-only numbering changes after hydration

If dynamic content changes after hydration, numbering may update, but should do so predictably.

## 10. Testing strategy

Minimum tests:

- registers one note
- assigns number by first appearance
- dedupes repeated source IDs
- supports same href with different IDs
- renders endnotes in order
- marker click scrolls/highlights note
- backlink returns to marker
- missing provider warning
- conflicting metadata warning
- SSR render does not throw
- keyboard activation works
