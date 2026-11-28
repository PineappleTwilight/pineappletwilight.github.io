---
title: Versions & channels
description: What the version number means, how stable and beta differ, and what changed in recent releases.
---

## Current release

| Item | Value |
|---|---|
| **Version** | `1.25.3` |
| **Released** | 4 November 2026 |
| **Minimum Android** | 8.0 (API 26) |
| **Application ID** | `app.houri` |
| **Licence** | Apache-2.0 |

The version name is semantic-ish: `major.minor.patch`. The preview build appends `-<commitCount>`.

> [!NOTE]
>
> This wiki describes the behaviour at the reviewed `master` commit. Features still staged in the app's `RELEASE_NOTES.md` for the next version may be documented before they ship; they are **not** part of the stable 1.25.3 release until a version bump and a stable tag. Where a feature is new on `master`, the page says so.

## Channels

| Channel | Where | Signing | Updates |
|---|---|---|---|
| **Stable** | GitHub Releases, `PineappleTwilight/hyoukan` | Release key, signed in CI | In-app updater, or manual APK |
| **Beta** | The beta repository (`PineappleTwilight/houri-beta` at the time of writing) | Release key, preview build | In-app updater, beta channel |
| **Preview (manual)** | Manual `build_preview` workflow | Release key | Manual |
| **Local debug** | `assembleDebug` | Debug key | None |

Beta builds:

- are minified preview builds (`initWith(release)`), not debug builds;
- have a different application ID and signing key from stable;
- coexist with stable but do not share a library;
- publish from every `master` push as `r<commitCount>`;
- ship four MTL ABIs and two no-MTL ABIs.

Preview and benchmark builds use the **debug signing key** and are not intended for daily use.

## Application IDs

| Build | ID |
|---|---|
| Stable | `app.houri` |
| Debug | `app.houri.dev` |
| Release test | `app.houri.rt` |
| FOSS | `app.houri.foss` |
| Preview / beta | `app.houri.beta` |
| No-MTL | `app.houri.nomtl` |
| Benchmark | `app.houri` with `.benchmark` suffix |

The `houri` name is a legacy identifier kept for upgrade and backup compatibility. It is not the product name.

## Update behaviour

- The updater checks the channel the installed build was compiled for.
- A stable build does not offer beta releases, and a beta build does not silently move to stable.
- Moving between channels is a manual install; the signing keys differ.
- A same-channel install over an existing app keeps the database and settings.
- A different-signature install fails with "app not installed"; uninstall the old copy **after** taking a backup.

## Recent releases

### 1.25.3 — 4 November 2026

- WebGPU reader fixes: stale reading positions after chapter swaps, a thin line between pages, and a page that could stay latched as decoding.
- Extension update errors are recorded only for 401/404; other failures are logged.
- Migration: "Fetch chapters in manual search" is off by default.
- Book page turns report what the layout engine answered.
- Download queue survives a full app close.
- Tracking sheet sub-screens no longer reuse the previous tracker's search state.
- Tablet back navigation fixes.

### 1.25.2 — 2 November 2026

- **Downloaded & cached content** screen, grouped by source with sizes and per-item deletion.
- **Chapter cache retention** (12 hours to 30 days).
- Shizuku installer skips Play Protect verification for updates.
- WebGPU rotation crash fix and native device-loss crash fix.
- Tablet two-pane back navigation fixes.

### 1.25.1 — 1 November 2026

- CSV library export scoped to categories.
- Tablet UI mode applies without a restart.
- Faster illustrated EPUB page turns; full-screen illustration viewer with set-as-cover.
- Network inspection mode covers all app networking; Extra logs headers.

### 1.25.0 — 29 October 2026

- **Book reader: paged and two-page modes**, with writing-direction-aware turns.
- **Book reader: cover as first page**.
- **Navigation 3** across the whole app; Metro ViewModels replace Voyager ScreenModels.
- **Subcategory types** (Author, Artist, Illustrator, Designer).
- **Custom CSS & JavaScript** injection for books.
- WebGPU: parallel decoding, single-copy byte ingest, faster JXL handling, the between-pages line fixed at the root.
- Database schema reworked to Mihon's current schema; duplicate entries merge on upgrade.
- Anime-Planet rewired for true two-way sync.
- EPUB import picker offers only EPUBs (plus `application/octet-stream`).

### Earlier

The full history is in [`CHANGELOG.md`](https://github.com/PineappleTwilight/hyoukan/blob/master/CHANGELOG.md), and each release's notes are on the [releases page](https://github.com/PineappleTwilight/hyoukan/releases).

## Upgrade notes

- **Database migrations are one-way.** An older build cannot open a newer schema. Back up before downgrading.
- **1.25.0 merged duplicate entries** under one source. Read state, history, categories and tracking move to the survivor.
- **MangaDex's in-app client was removed.** Install the community extension; existing entries stay readable.
- **The blacklist storage format changed to JSON.** Old entries keep working; the views read both encodings.
- **Beta installs need one manual install** to move from the old debug-signed betas to the minified preview builds.
- **WebGPU diagnostic strikes are scoped to the build** (on current `master`). A new version gets a fresh diagnostic record automatically. Strikes never demote the reader to the standard viewer; recoverable GPU loss is recovered in place.

## Identifying a build

- **About → Version** shows the version and build number.
- Tapping the version copies a device-info block: version, build time, device model, Android version, ABI and memory class.
- A preview build's version ends in `-<commitCount>`.
- The beta release tag is `r<commitCount>`.

## Support policy

- The latest stable release is supported.
- Beta builds are supported on a best-effort basis; a report should say it is a beta and include the commit count.
- Old versions are not patched. If a bug is fixed on `master`, the fix ships in the next release.
