# AGENTS.md — Hyoukan wiki

This repository publishes the **Hyoukan** documentation site at
<https://pineappletwilight.github.io/hyoukan/>. It contains no app code. The app
being documented lives in [`PineappleTwilight/hyoukan`](https://github.com/PineappleTwilight/hyoukan),
default branch `master`.

The wiki is a reviewed snapshot of that app, updated in batches. This file explains
how to take the next batch without losing the place where the last one stopped.

## Repository map

| Path | What it is |
|---|---|
| `wiki/` | Markdown source for every wiki page. All prose edits happen here. |
| `tools/wiki-nav.json` | Sidebar sections, page titles and order. A page missing here is not built. |
| `tools/build-wiki.mjs` | Static-site generator. Also holds the `VERSION` / `UPDATED` strings shown in the sidebar. |
| `tools/wiki-sync.json` | **The upstream review cursor.** See the next section. |
| `hyoukan/` | Generated site, committed to git and served by GitHub Pages. Never hand-edit. |
| `index.html`, `404.html` | Landing page and 404 page outside the wiki. |

Build after every content change:

```bash
node tools/build-wiki.mjs
```

The builder wipes and regenerates all of `hyoukan/` — pages, `search-index.json`,
`sitemap.xml` and assets — and rewrites the root `.nojekyll`. It has no runtime
dependencies and needs no network. GitHub Pages runs no build step: the committed
output is the site, so the regenerated files must be committed with the source change.

## The upstream review cursor

`tools/wiki-sync.json` records the newest app commit the wiki fully reflects:

```json
{
  "sourceRepo": "PineappleTwilight/hyoukan",
  "branch": "master",
  "lastReviewedCommit": "<full 40-character SHA>",
  "lastReviewedAt": "<YYYY-MM-DD, UTC>",
  "documentedVersion": "<stable app version the wiki describes>"
}
```

- `lastReviewedCommit` is the **resume point**. Start every update from it.
- `lastReviewedAt` is the date that commit was reviewed, not the date of the app commit.
- `documentedVersion` is the stable release the wiki describes. It may lag `master`,
  which carries unreleased work; keep it in step with `VERSION` and the version pages.

Rules:

1. Read the cursor before writing any factual claim about the app.
2. Advance it only after every user-visible change between the old and new commit has
   been reflected in `wiki/`. A commit with no documentation-visible effect still
   counts as reviewed once you have checked it.
3. Never advance past commits you did not read. If a review stops partway, leave the
   cursor at the last **fully** reviewed commit and say which commits remain.
4. Never rewind the cursor without an explicit instruction to discard documented work.
5. A task that does not concern app behaviour (site styling, navigation, typo in a
   page that is already consistent with the cursor) leaves the cursor alone. Do not
   slip in claims from unreviewed commits while doing it.

## Reviewing a range

`gh` and `jq` are available. Run from the repository root.

```bash
REPO=$(jq -r .sourceRepo tools/wiki-sync.json)
BRANCH=$(jq -r .branch tools/wiki-sync.json)
SHA=$(jq -r .lastReviewedCommit tools/wiki-sync.json)

# Pin the app head you are reviewing; master may move while you work
HEAD_SHA=$(gh api "repos/$REPO/commits/$BRANCH" --jq .sha)

# Commits not yet reviewed, oldest first
gh api "repos/$REPO/compare/$SHA...$HEAD_SHA" \
  --jq '.commits[] | "\(.sha[0:10])  \(.commit.message | split("\n")[0])"'

# Files those commits touched
gh api "repos/$REPO/compare/$SHA...$HEAD_SHA" \
  --jq '.files[] | "\(.status)\t\(.filename)"'
```

The compare endpoint needs the full SHA — the cursor always stores one. It also caps
at 250 commits and 300 files. For a larger gap, clone once and use git history directly:

```bash
gh repo clone "$REPO" /tmp/opencode/hyoukan -- --filter=blob:none
git -C /tmp/opencode/hyoukan log --first-parent --oneline "$SHA..origin/$BRANCH"
git -C /tmp/opencode/hyoukan show <sha>
```

Review in this order:

1. The `RELEASE_NOTES.md` and `CHANGELOG.md` diffs — they summarise what users see.
2. Commit bodies. Merge commits carry no useful subject; inspect the branch commits
   and the resulting files instead of trusting `Merge branch ...`.
3. The touched source at the pinned `HEAD_SHA` for exact labels, defaults, screen
   names and formats. Never infer them from a commit subject. A `refactor` can rename
   a setting; a `fix` can change a default.

Useful context for structural changes:

- `docs/superpowers/specs/` — design notes for reader, EPUB, settings, upscaling and
  library rewrites.
- The nearest upstream `AGENTS.md` (for example `app/AGENTS.md`,
  `app/.../ui/reader/AGENTS.md`, `data/AGENTS.md`) — invariants and terminology.

Classify each commit before editing:

| Kind | Examples | Wiki action |
|---|---|---|
| User-visible | Features, UI, settings, formats, import/export, permissions, defaults | Must be reflected |
| Documented internals | Architecture, pipeline, schema, build, release, extension ABI | Update the matching development/reference page |
| Invisible | Tests, lint, dependency bumps with no behaviour change, CI retries | Check, then no edit |
| Ambiguous | Refactors, "misc" fixes | Read the diff; usually at least one page is affected |

Do not trust path filters alone. A change under `app/` may only touch tests, and a
change under `.github/` may alter the release process that `development/build.md`
describes.

## Where changes land

| Upstream area | Wiki pages |
|---|---|
| `app/` reader UI, `app/.../viewer/webgpu/`, `presentation-core`, `presentation-widget`, reader policy in `domain/` | `development/reader.md`, `guide/comics.md`, `tutorials/calibrate-the-reader.md` |
| Book engine, `core/` EPUB/archive code, `app/.../ui/books/` | `development/books-engine.md`, `guide/books.md`, `reference/formats.md`, `tutorials/typeset-an-epub.md` |
| `data/`, `core-metadata/`, SQLDelight schemas and migrations | `development/data.md`, `guide/backup-sync.md` |
| `source-api/`, `source-local/`, extension loading | `development/extensions.md`, `guide/sources.md` |
| `yakuyomi-engine/`, `llamatik-native/`, `mtl-spine/`, translation settings | `development/translation-upscaling.md`, `guide/translation.md`, `tutorials/translate-a-chapter.md`, `tutorials/translate-offline.md` |
| `upscale/`, upscaler settings | `guide/upscaling.md`, `development/translation-upscaling.md`, `tutorials/upscale-a-series.md` |
| Settings framework, preference keys and defaults | `development/settings.md`, `reference/settings.md`, `guide/appearance.md` |
| `app/.../data/track/`, tracker services | `guide/tracking.md`, `guide/connections.md` |
| Downloads, storage, SAF, import paths | `guide/downloads.md`, `guide/privacy.md`, `reference/formats.md` |
| `AndroidManifest.xml` permissions, telemetry, credentials | `guide/privacy.md`, `guide/connections.md` |
| Library, categories, history, migration | `guide/library.md`, `guide/backup-sync.md`, `getting-started.md` |
| `app/build.gradle.kts`, `gradle/`, `buildSrc/`, `.github/workflows/`, release scripts | `development/build.md`, `reference/versions.md` |
| `RELEASE_NOTES.md`, tags, version bumps | `reference/versions.md`, `reference/history.md`, `index.md`, `getting-started.md` |
| Achievements | `guide/achievements.md` |
| App icon, name, theme, languages | `guide/appearance.md`, `guide/privacy.md` |

The table is a starting point, not a partition. A setting rename can touch the user
guide, the settings reference and a tutorial at once. Before deciding a page needs no
edit, search it for the affected label, preference key, class name or screen name:

```bash
rg -n "PreferenceKey|ScreenLabel|feature name" wiki
```

## Editing rules

- Keep the frontmatter on every page: `title` and `description`.
- Link between pages with relative `.md` paths (`../guide/books.md`). The builder
  rewrites them to site URLs and preserves `#anchors`. Root-absolute `/hyoukan/...`
  links also work; external links open in a new tab automatically.
- Callouts use this form (kinds: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`):

  ```markdown
  > [!NOTE]
  >
  > Body text.
  ```

- Add a page by creating `wiki/<section>/<name>.md` and adding an entry to
  `tools/wiki-nav.json`. An unlisted file is invisible on the site.
- The wiki uses British spelling (`behaviour`, `colour`, `organise`) and sentence-case
  headings. Match the surrounding page.
- Keep claims verifiable against the reviewed commit. If behaviour is unreleased or
  version-specific, say so and name the version. Never invent a setting, default or
  screen from a commit title.
- Do not edit `hyoukan/` by hand. If the output is wrong, fix `wiki/` or
  `tools/build-wiki.mjs` and rebuild.

## Version bumps

The documented stable version appears in more than one place. When the wiki moves to a
new release, update all of them:

```bash
rg -n "1\.25\.3|November 2026" wiki tools/build-wiki.mjs
```

- `tools/build-wiki.mjs` — `VERSION` (sidebar pill) and `UPDATED` (month and year).
- `wiki/reference/versions.md` — current version table and the release history section.
- `wiki/index.md` — hero version and the "Latest stable" row.
- `wiki/getting-started.md` — stable-channel example, if it names a version.
- `tools/wiki-sync.json` — `documentedVersion`.

A master-only change does not bump the documented version until it ships in a stable
release. Document it as current behaviour only if that is true for the version the
page describes; otherwise mark it as unreleased.

## Finishing a sync

1. Rebuild and inspect the output:

   ```bash
   node tools/build-wiki.mjs
   git status --short
   git diff --stat
   ```

   Expect changes under `wiki/` plus regenerated `hyoukan/` pages,
   `hyoukan/search-index.json` and `hyoukan/sitemap.xml`. Investigate any page you did
   not intend to change.

2. Confirm the text landed:

   ```bash
   rg -n "<the new label or claim>" hyoukan/
   ```

3. Advance the cursor in `tools/wiki-sync.json` to the pinned `HEAD_SHA` you finished
   reviewing, with today's UTC date and, if it changed, the documented version. If
   `master` moved during the review, stop at the last commit you read and leave the
   newer ones for the next pass.

4. Commit the source, the cursor and the generated site together:

   ```
   docs: sync wiki through <short-sha>
   ```

   For a targeted edit unrelated to upstream movement, use a normal `docs:` subject
   and leave the cursor as it is.

5. In the reply, state the range covered (`<old-sha>..<new-sha>`), the pages touched,
   and any commits deliberately left for the next pass.
