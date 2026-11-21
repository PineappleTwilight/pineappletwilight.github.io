---
title: Contributing
description: Report bugs, translate, write code, or improve this wiki — and know which rules CI enforces.
---

Hyoukan is a volunteer project. Contributions are welcome in several forms, and the most useful ones are not always code.

## Report a bug

1. **Update** the app and the extension first.
2. **Search** the existing [issues](https://github.com/PineappleTwilight/hyoukan/issues) and the [changelog](https://github.com/PineappleTwilight/hyoukan/releases).
3. Open a new issue with:
   - app version and build number (About);
   - device, Android version and ABI;
   - steps to reproduce;
   - expected vs actual behaviour;
   - a log dump from **Settings → Advanced → Dump crash logs**;
   - a screenshot if it is visual.

Do not group unrelated problems into one issue. A reproducible report with a log is worth more than a long one without.

For **extension** bugs, use the extension's own repository. Hyoukan cannot fix a source it does not own; the Extensions screen builds the GitHub search link for you.

## Request a feature

Open an issue describing:

- what you want to do;
- why the current behaviour does not let you do it;
- how you imagine it working;
- any prior art (another reader, a fork, a website).

For a major change, discuss it before writing code. A design that conflicts with the app's structure is expensive to discover after implementation.

## Translate

Translations are managed on **Weblate**. The app links to the project from **About → Help translate**.

Rules:

- only edit `base/` locale files in a pull request;
- never edit non-base `strings.xml` or `plurals.xml` in `i18n/`, `i18n-kmk/` or `i18n-sy/`;
- use `KMR` for Hyoukan-only strings, `MR` for shared upstream strings, `SYMR` for TachiyomiSY strings;
- keep placeholders (`%1$s`, `%d`) intact.

CI path-filters non-base locales, so a translation-only PR is handled by Weblate, not by code review.

## Contribute code

### Before you start

Read the repository's `AGENTS.md` and the guide for the module you are touching:

| Area | Guide |
|---|---|
| App module, screens, DI | `app/AGENTS.md` |
| Reader | `app/.../ui/reader/AGENTS.md` |
| WebGPU | `app/.../viewer/webgpu/AGENTS.md` |
| Domain | `domain/AGENTS.md` |
| Data / SQLDelight | `data/AGENTS.md` |
| Source API | `source-api/AGENTS.md` |
| Archive / EPUB | `core/archive/AGENTS.md` |
| Settings framework | `app/.../settings/framework/AGENTS.md` |
| Trackers | `app/.../data/track/AGENTS.md` |
| E-Hentai | `app/.../exh/AGENTS.md` |
| Upscaling | `upscale/AGENTS.md` |
| Translation | `yakuyomi-engine/AGENTS.md` |
| Native LLM | `llamatik-native/AGENTS.md` |

These files are maps, not suggestions. They record invariants that have already cost incidents.

### Setup

```bash
git clone --recursive https://github.com/PineappleTwilight/hyoukan.git
cd hyoukan

export ANDROID_HOME=/path/to/android-sdk
export JAVA_HOME=/path/to/jdk-21

./gradlew spotlessApply
./gradlew assembleDebug
```

The first build downloads dependencies and native tools. `llamatik-native` needs the WSL setup on Windows; see [Build & release](/hyoukan/development/build/#native-builds-on-windows).

### Branch and commit

- External contributions: use a feature branch and open a pull request.
- Agent-assisted sessions in this repository follow `AGENTS.md`: work on `master`, do not create a branch, commit or run Gradle unless the user asks.
- Keep commits focused. One concern per commit is easier to review and revert.
- When porting an upstream PR, co-author its author in the commit trailer.

### What CI enforces

| Gate | Rule |
|---|---|
| `spotlessCheck` | Formatting (ktlint) |
| Unit tests | `testReleaseUnitTest` |
| Both flavours | `mtl` and `nomtl` compile |
| Path filters | Non-base locale changes are ignored |
| Release notes | A user-visible change needs a bullet in `RELEASE_NOTES.md` |

### The rules that get PRs rejected

- Adding a Hyoukan-only string to `i18n/` instead of `i18n-kmk/`.
- Renaming a preference key without a migration.
- Changing a schema without a `.sqm` and regenerated interface.
- Breaking the extension ABI by adding an abstract member.
- Writing policy with Android imports where a harness could reach it.
- Cutting a `// KMK` or `// SY` island open.
- Skipping `spotlessCheck`.
- A user-visible change with no release note.

## Improve this wiki

The wiki source lives in `wiki/` in the site repository. Every page has an **Edit this page** link at the bottom.

```bash
# from the site repository root
node tools/build-wiki.mjs
```

The generator reads `tools/wiki-nav.json`, renders Markdown with the vendored `marked` build, and writes `hyoukan/`. It has no runtime dependencies and needs no network.

When editing:

- keep the frontmatter (`title`, `description`);
- use relative `.md` links between pages — the builder rewrites them;
- use the callout syntax:

```markdown
> [!NOTE]
>
> A note.
```

- run the builder and check the page before committing;
- keep claims verifiable. If a behaviour is version-specific, say so.

## Code of conduct

Be civil. Assume good faith. Disagreement about code is fine; personal attacks are not. The project follows the spirit of the Contributor Covenant in `CODE_OF_CONDUCT.md`.

## Where help is most useful

- Reproducible bug reports with logs.
- Extension maintenance (separate repositories).
- Translations.
- Documentation: this wiki, module guides, troubleshooting notes.
- Reader testing on unusual devices: e-ink, foldables, low-RAM phones, 32-bit devices, unusual GPUs.
- Regression tests and harnesses for policy that currently has none.

## Thank you

Every bug report that includes a log, every translated string and every harness case makes the next release a little less mysterious. That is the whole contribution model.
