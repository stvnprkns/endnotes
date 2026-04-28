# Design Principles

Endnotes should feel like a tiny, thoughtful product. The details matter because references are trust UI.

## 1. Look native, not branded

Endnotes should not impose a visual identity on the host product.

It should inherit:

- font
- text color
- muted color
- link color
- radius
- border
- background
- shadow style

The best compliment is: “I forgot this was a package.”

## 2. Avoid academic residue

Endnotes can support footnotes, but the UI should not feel trapped in academic publishing.

No default MLA/APA clutter.
No giant bibliographic blocks.
No unreadable source dumps.

Default references should feel useful in a product interface.

## 3. Make the source card useful

A source preview should answer:

- What is this source?
- Who made it?
- What claim does it support?
- Can I open it?
- Can I get back to where I was?

## 4. Keep the marker quiet

The inline marker should never overpower the sentence.

It should be visible enough to invite trust, but quiet enough to preserve reading flow.

## 5. Respect reading context

Different contexts need different treatments:

- essays need subtle superscripts
- docs need bracket markers
- AI answers may need source pills
- dashboards may need compact methodology notes
- mobile screens need drawers, not tiny hover cards

## 6. Motion should clarify, not perform

Motion should help users understand the relationship between marker and note.

Good uses:

- gentle scroll
- brief highlight
- popover fade
- drawer slide

Bad uses:

- bouncy citation markers
- decorative animation
- dramatic transitions

## 7. Errors should help builders

If a developer passes conflicting source metadata, forgets the provider, or omits the endnotes list, Endnotes should explain what happened and how to fix it.

## 8. The default should be enough

A developer should be able to ship with:

```tsx
<EndnotesProvider adapt>
```

without opening a theme file.

Customization exists, but the default should be tasteful.
