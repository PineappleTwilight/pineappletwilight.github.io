---
title: Project history
description: From Tachiyomi to Mihon, TachiyomiSY, Komikku and Houri — where Hyoukan comes from and what each layer contributed.
---

Hyoukan is the current name of a fork with a long lineage. Understanding that lineage explains why the codebase contains several package roots, three string modules and inline `// KMK` / `// SY` markers.

## Timeline

| Period | Project | What happened |
|---|---|---|
| 2015–2024 | **Tachiyomi** | The original open-source Android manga reader, created by Javier Tomás. Apache-2.0. |
| 2024 | **Mihon** | The community continuation after Tachiyomi was discontinued. Modern maintenance, Navigation 3, the current image decoder and many backports. |
| 2020s | **TachiyomiSY** | A long-running fork adding the Feed, automatic webtoon detection, lewd filtering, custom source categories, merging, migration and more. |
| 2020s | **Komikku** | A fork of TachiyomiSY/Mihon with a large feature set: library improvements, trackers, translation, WebGPU work and more. |
| 2026 | **Houri** | The development name of this fork while it was being rebuilt around Komikku. |
| 2026 | **Hyoukan** | The published name. The repository, update channels and documentation use it. |

```
Tachiyomi
   └── Mihon ──────────────┐
   └── TachiyomiSY ────────┤
                           ├── Komikku
                           │      └── Houri
                           │             └── Hyoukan
```

The exact branch points are less important than the practical consequence: Hyoukan carries the **entire Mihon and TachiyomiSY feature set**, plus Komikku's additions, plus its own work.

## What each layer contributed

### Tachiyomi

The original architecture and vocabulary:

- sources as installable extensions;
- the library, chapters, categories, history and tracking model;
- the reader with pager and webtoon modes;
- the extension API that every fork still honours.

Tachiyomi's package root (`eu.kanade.tachiyomi.*`) is still the app's namespace.

### Mihon

The modern maintenance line:

- current AndroidX and Compose versions;
- Navigation 3 migration;
- the upstream image decoder;
- database schema reworks and performance work;
- a steady stream of reader and library fixes.

Hyoukan's `mihon.*` package root marks this layer.

### TachiyomiSY

The feature-heavy fork:

- the **Feed** tab;
- automatic webtoon detection;
- the lewd filter and NSFW controls;
- custom source categories;
- merging, migration and duplicate handling;
- enhanced E-Hentai features;
- archive encryption.

The `exh.*` package root and `SYMR` strings mark this layer.

### Komikku

The immediate parent of this fork's feature set:

- library subcategories, smart categories and per-category settings;
- additional trackers (MangaBaka, Anime-Planet, ComicK, Hikka);
- the WebGPU reader work;
- AI translation and upscaling;
- book/EPUB reading;
- achievements, webhooks and Discord RPC;
- the modular settings framework.

The `// KMK` markers and `KMR` strings mark this layer.

### Houri → Hyoukan

The current fork's own work:

- the reader and WebGPU pipeline hardening;
- EPUB and novel-reader completion (paged, double, highlights, TTS, footnotes, custom CSS/JS);
- the upscaling pipeline rewrite;
- the translation spine rewrite;
- app identity and launcher personalisation;
- expanded diagnostics and log viewer;
- SyncYomi protocol v2;
- the settings search and tablet two-pane fixes;
- the wiki you are reading.

## The name

The project was developed and published as **Houri** while the fork was being rebuilt. It was renamed **Hyoukan** when the repository and update channels moved.

The rename is deliberately conservative:

- the Android application ID remains `app.houri`;
- the database name, backup file prefix and several preference keys still say `houri` or `tachiyomi`;
- the beta repository and APK asset names may still carry legacy spellings;
- a few strings still mention Houri.

These are compatibility identifiers, not a second product. Changing them would break upgrades, backups and existing library databases. The product, the documentation and the public repository use **Hyoukan**.

## Licence and credits

Hyoukan is licensed under **Apache-2.0**, inherited from Tachiyomi. The original copyright notice (Javier Tomás, 2015) is preserved in `LICENSE`.

The project exists because of:

- the Tachiyomi, Mihon, TachiyomiSY and Komikku maintainers and contributors;
- the extension developers who keep sources working;
- the translators on Weblate;
- everyone who files a reproducible bug report.

The app hosts **zero content**. Its developers have no affiliation with any content provider.

## Where to go next

- [Versions & channels](/hyoukan/reference/versions/) — the release history and channel rules.
- [Architecture](/hyoukan/development/architecture/) — how the layers are arranged today.
- [Contributing](/hyoukan/contributing/) — how to add to the lineage.
