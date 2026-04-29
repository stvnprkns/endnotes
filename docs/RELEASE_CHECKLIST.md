# Endnotes Release Checklist

Use this checklist for every publish.

## 1) Preflight

- Confirm `main` is clean and up to date.
- Confirm package version in `package.json` is correct for the release.
- Confirm `README.md` examples still match actual exports.
- Confirm `docs/API.md` matches implemented behavior and prop names.

## 2) Local quality gates

Run the full verification sequence:

```bash
npm install
npm run build
npm run typecheck
npm test
npm run test:contracts
npm run test:fixtures
npm run test:golden
npm run verify:scorecards
npm run build:demo
npm run verify:package
npm run smoke
npm pack --dry-run
```

Release only if all commands pass.

## 3) Tarball validation

Build and inspect the exact publish artifact:

```bash
npm pack
tar -tf endnotes-<version>.tgz
```

Expected publish contents:

- `package/dist/index.js`
- `package/dist/index.cjs`
- `package/dist/index.d.ts`
- `package/dist/endnotes.css`
- `package/package.json`
- `package/README.md`
- `package/docs/API.md` (if included by package strategy)

Also verify `package.json` export map:

- `"."` resolves to JS + type entries
- `"./style.css"` resolves to `./dist/endnotes.css`
- `"./styles.css"` resolves to `./dist/endnotes.css` (compat alias)

## 4) Runtime smoke test

Before publish, verify consumer behavior from a clean install:

1. Create a throwaway React app.
2. Install the local tarball from `npm pack`.
3. Confirm this works without extra configuration:

```tsx
import { Note, Endnotes } from "endnotes"
import "endnotes/style.css"
```

4. Confirm marker click and backlink return behavior works.
5. Confirm dark mode token inheritance is sane.

### Stage 8 smoke + CI gates

- [ ] fresh app smoke test exists at `smoke/vite-react`
- [ ] smoke test installs packed tarball (not `src` or workspace aliases)
- [ ] smoke test imports `endnotes/style.css`
- [ ] smoke test app build passes
- [ ] CI runs install, typecheck, lint (if present), tests, build, demo build
- [ ] CI runs package verification, `npm pack --dry-run`, and smoke

## 5) Release metadata

- Draft release notes with:
  - Added
  - Changed
  - Fixed
  - Breaking changes (if any)
- Include migration notes if API or defaults changed.
- Complete go/no-go checklist in `docs/GO_NO_GO_30_DAY_SCORECARD.md`.
- Record final decision in `docs/RELEASE_DECISION_RECORD.md`.

## 6) Publish

```bash
npm publish --access public
```

Then verify:

- Package page renders expected README sections.
- Install command works in a clean project.
- `import "endnotes/style.css"` resolves correctly.

## 7) Post-publish verification

- Run demo with published package version (not local alias) when possible.
- Confirm no missing files or sourcemap warnings in consumer builds.
- Tag release in git and attach concise notes.
