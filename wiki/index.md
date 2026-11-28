---
title: Hyoukan Wiki
description: The complete guide to Hyoukan — a free, open-source manga and novel reader for Android.
---

<section class="hero">
  <div class="hero-eyebrow">Android 8.0+ · Apache-2.0 · v1.25.3</div>
  <h1>Every kind of story,<br>one shelf.</h1>
  <p class="lede">Hyoukan is a free, open-source manga and novel reader for Android. It reads image chapters through a hardware-accelerated WebGPU renderer, opens EPUB books as real books, organises a library of thousands, and can translate and upscale pages entirely on your device — with no account and no content hosted by the app.</p>
  <div class="hero-actions">
    <a class="button button-primary" href="/hyoukan/getting-started/">Get started</a>
    <a class="button" href="/hyoukan/features/">Feature tour</a>
    <a class="button" href="https://github.com/PineappleTwilight/hyoukan" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="hero-stats">
    <div class="hero-stat"><strong>13</strong><span>tracker services</span></div>
    <div class="hero-stat"><strong>150+</strong><span>achievements</span></div>
    <div class="hero-stat"><strong>2</strong><span>readers: comics &amp; books</span></div>
    <div class="hero-stat"><strong>0</strong><span>bytes of content hosted</span></div>
  </div>
</section>

## Start here

<div class="cards">
  <a class="card" href="/hyoukan/getting-started/">
    <span class="card-icon">🚀</span>
    <span class="card-title">Getting started</span>
    <span class="card-text">Install the app, add sources, build a library and take your first backup.</span>
  </a>
  <a class="card" href="/hyoukan/guide/sources/">
    <span class="card-icon">🧩</span>
    <span class="card-title">Sources &amp; extensions</span>
    <span class="card-text">How the extension ecosystem works, which sources are built in, and how installers differ.</span>
  </a>
  <a class="card" href="/hyoukan/guide/comics/">
    <span class="card-icon">📖</span>
    <span class="card-title">Reading comics</span>
    <span class="card-text">Pager, webtoon and vertical modes, the WebGPU renderer, gestures and reading settings.</span>
  </a>
  <a class="card" href="/hyoukan/guide/books/">
    <span class="card-icon">📚</span>
    <span class="card-title">Reading books</span>
    <span class="card-text">EPUB and web-novel reading with publisher typography, highlights, footnotes and read-aloud.</span>
  </a>
</div>

## What Hyoukan is

Hyoukan is a **reader**, not a catalogue. It does not host, index or distribute manga, novels or images. It displays content fetched by **extensions** — small APK packages installed separately, exactly as in Tachiyomi, Mihon and Komikku — or content you already own: local folders, CBZ/CBR archives, EPUB files and a self-hosted Komga server.

The app is a fork with a long lineage:

```
Tachiyomi
  ├── Mihon ──────────┐
  └── TachiyomiSY ────┴── Komikku ── Houri ── Hyoukan
```

Hyoukan keeps the entire Mihon and TachiyomiSY feature set, carries Komikku's additions, and adds its own work across the reader, the library, translation, upscaling, books, tracking, backup and diagnostics. It is licensed under Apache-2.0; the source lives at [PineappleTwilight/hyoukan](https://github.com/PineappleTwilight/hyoukan).

> [!NOTE]
>
> **A note on names.** The project was previously published as **Houri** and before that as **Komikku**. The repository and update channels now use the Hyoukan name. The Android application ID is still `app.houri` so existing installs, backups and library databases continue to resolve; that identifier is an implementation detail, not the product name.

## What sets it apart

<div class="split">
  <div class="panel">
    <h3>A reader that takes rendering seriously</h3>
    <p>The <strong>WebGPU reader</strong> is the default on supported devices: HDR pages at full brightness, LUT colour grading, ArtCNN upscaling, dual-page spreads and a memory budget that follows the device rather than a fixed RAM class. A recoverable GPU loss rebuilds the device; when WebGPU genuinely cannot run, the app uses the standard viewer and records why — without demoting future sessions.</p>
  </div>
  <div class="panel">
    <h3>Books are first-class, not image strips</h3>
    <p>Drop an <code>.epub</code> into a library folder and it opens as a <strong>book</strong>: the publisher's typography survives, illustrations and fonts travel inside the page, chapters flow continuously or turn as pages, positions survive font changes, and highlights, footnotes and text-to-speech are built in.</p>
  </div>
  <div class="panel">
    <h3>AI that can stay on the device</h3>
    <p>Translation runs through a hybrid pipeline — on-device detection, OCR and inpainting, then a cloud LLM, Gemini Nano or a bundled llama.cpp model. Upscaling is a separate pipeline with Real-CUGAN, Real-ESRGAN, Waifu2x and imported ONNX models, and it works even in builds without the translation engine.</p>
  </div>
  <div class="panel">
    <h3>A library that stays organised</h3>
    <p>Hierarchical categories, a home-screen-style folder layout, smart categories bound to tracker status, per-category reader settings and update schedules, duplicate detection, merging, migration and a feed that watches sources for you.</p>
  </div>
</div>

## Explore the wiki

<div class="cards">
  <a class="card" href="/hyoukan/guide/translation/">
    <span class="card-icon">🌐</span>
    <span class="card-title">AI translation</span>
    <span class="card-text">The pipeline, providers, models, glossaries and cache — and what stays on-device.</span>
  </a>
  <a class="card" href="/hyoukan/guide/upscaling/">
    <span class="card-icon">🔍</span>
    <span class="card-title">AI upscaling</span>
    <span class="card-text">Models, backends, per-category defaults, prefetching and the WebGPU tile sampler.</span>
  </a>
  <a class="card" href="/hyoukan/guide/backup-sync/">
    <span class="card-icon">💾</span>
    <span class="card-title">Backup &amp; sync</span>
    <span class="card-text">What a backup contains, how restore streams it, and how SyncYomi, WebDAV and Drive work.</span>
  </a>
  <a class="card" href="/hyoukan/development/architecture/">
    <span class="card-icon">🏗️</span>
    <span class="card-title">For developers</span>
    <span class="card-text">Modules, DI, navigation, the reader internals, the extension API and the build pipeline.</span>
  </a>
  <a class="card" href="/hyoukan/tutorials/">
    <span class="card-icon">🧭</span>
    <span class="card-title">Tutorials</span>
    <span class="card-text">Guided walkthroughs: translate a chapter, upscale a series, typeset an EPUB, automate the library and calibrate the reader.</span>
  </a>
</div>

## Current status

| Item | Value |
|---|---|
| Latest stable | **1.25.3** (4 November 2026) |
| Beta channel | Published from every `master` push as `r<commitCount>` |
| Minimum Android | 8.0 (API 26) |
| Target / compile SDK | 36 / 37 |
| Language | Kotlin 2.x, JVM target 17 |
| Licence | Apache-2.0 |

See [Versions & channels](/hyoukan/reference/versions/) for the full release-channel and signing picture, and [Project history](/hyoukan/reference/history/) for how the fork got here.

> [!WARNING]
>
> Hyoukan's developers have no affiliation with any content provider. The app hosts zero content. You are responsible for how you use it and for the content you access.
