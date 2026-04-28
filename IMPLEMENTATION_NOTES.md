## Endnotes Implementation Notes

Endnotes is a small React primitive for trustworthy source trails in modern product UI. The MVP should feel native in host apps, avoid academic complexity, and provide reliable reference behavior by default.

### Product intent

- Endnotes is a trust-layer UI primitive, not a bibliography manager.
- The first install should produce a polished result with minimal setup.
- Public API should remain small: `EndnotesProvider`, `Endnote`, `Endnotes`.
- Default interaction is marker-to-list scroll and backlink return.

### MVP boundaries

- Include deterministic numbering by first appearance.
- Deduplicate sources by `id`, then normalized `href`.
- Support repeated inline references to one source.
- Render generated endnotes with graceful missing-data fallback.
- Ship accessible marker/backlink behavior and visible focus styles.
- Use CSS variables and adaptation mappings to inherit host design tokens.
- Avoid runtime fetching, academic formatting systems, and plugin sprawl.

### Architecture choices for this pass

- **Core model layer**: pure TypeScript utilities for identity, dedupe, ordering, and instance tracking.
- **React layer**: provider-owned state and actions, registration lifecycle, and navigation/highlight orchestration.
- **Styling layer**: default CSS classes and variables with host-token adaptation.
- Keep behavior deterministic and SSR-conscious (no random IDs, stable keys, predictable ordering).

### Quality bar

- Typed public API and internals.
- Focused unit/render tests around registry correctness and user-facing behavior.
- Minimal dependency footprint and straightforward implementation.
- Clear dev warnings for incorrect usage and weak source identity input.
