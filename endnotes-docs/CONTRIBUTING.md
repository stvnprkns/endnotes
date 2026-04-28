# Contributing

Endnotes should stay small, polished, and production-minded.

Before adding a feature, ask:

1. Does this make references easier to ship in real products?
2. Does this preserve the small API?
3. Does this improve trust, accessibility, or native-feeling design?
4. Can this be done without turning Endnotes into an academic citation platform?

## Development principles

- Keep public APIs minimal
- Prefer excellent defaults over many options
- Do not add dependencies casually
- Treat accessibility as core behavior
- Test registry logic thoroughly
- Keep styling easy to override
- Avoid framework lock-in where possible

## Out-of-scope contributions

Please avoid PRs that add the following before the core package is stable:

- Zotero integration
- BibTeX import
- CSL formatting
- hosted source database
- browser extension
- analytics SDK
- AI verification

These may be useful later, but they should not shape the first version.
