---
title: Feature tour
description: Every major Hyoukan feature, grouped by the job it does.
---

This page is the map. Each section links to the guide that covers the feature in depth.

## Reading comics

| Feature | What it does |
|---|---|
| **WebGPU renderer** | Hardware-accelerated page rendering with tiled decoding, smooth transitions and memory-aware scaling. Default on supported devices. |
| **Pager modes** | Left-to-right, right-to-left and vertical paged reading, with configurable tap zones and page-turn animations. |
| **Webtoon / long strip** | Continuous vertical scrolling with page splitting, side padding, smart scaling and optional gaps. |
| **Dual-page spreads** | Two pages side by side with deterministic height matching, inversion and a centre margin for foldables. |
| **HDR pages** | PQ, HLG and UltraHDR content at full brightness with clean SDR tone-mapping. |
| **Colour grading** | Brightness, contrast, HLG exposure, built-in LUT presets and custom `.cube` / madVR `.3dlut` files. |
| **Smart dark mode** | Darkens pages on dark backgrounds without destroying line art. |
| **E-ink preset** | Grayscale, boosted contrast, calm transitions and tiled-refresh handling for e-ink panels. |
| **Auto webtoon detection** | Switches to the continuous viewer for entries that look like long strips. |
| **Page splitting** | Pages too tall for the decoder are cut into segments and stitched back into the reading flow. |
| **Preload control** | Separate pages-ahead and pages-behind counts, plus memory-gated prefetch. |
| **Reader cache** | A configurable image cache, with aggressive whole-chapter loading as an option. |
| **ArtCNN** | On-GPU super-resolution for zoomed tiles when the device supports it. |
| **Cutout support** | Draw into the display cutout area, with per-viewer behaviour. |
| **Chapter transitions** | Optional transition pages between chapters, with a "always show" override. |
| **In-chapter search** | Search the open book chapter as you type, with context snippets and jump-to-match. |
| **Chapter completion sound** | Optional randomized 60/30/10 audio when a chapter finishes, with user sound packs. |

→ [Reading comics](/hyoukan/guide/comics/) · [Tutorial: calibrate the reader](/hyoukan/tutorials/calibrate-the-reader/)

## Reading books

| Feature | What it does |
|---|---|
| **EPUB 2 and EPUB 3** | Parses `toc.ncx` and `nav.xhtml`, the OPF manifest/spine, `encryption.xml`, and both series conventions. |
| **Publisher typography** | Drop caps, ruby, tables, vertical writing and the book's own stylesheets survive because the reader is a WebView, not a text widget. |
| **Books in the library** | An `.epub` in a library folder is detected as a BOOK; art books can stay COMIC. Per-entry "Render as book / comic" survives updates. |
| **Continuous reading** | Sections append ahead and prepend behind, so a book scrolls like the continuous manga viewer. |
| **Paged and double-page** | CSS multi-column pagination with page-turn animations, including a spine-swing transition. |
| **Table of contents** | The book's own ToC, indented like a printed contents page and opened at the reader's place. |
| **In-chapter search** | Case-insensitive search with selectable context and a jump to the match. |
| **Typography** | Font size and scale, family (bundled, generic or imported font files), colours with contrast derivation, line/paragraph/letter/word spacing, outline, margins, justification, hyphenation, indentation and vertical writing as follow-book tri-states. |
| **Imported fonts** | Any `.ttf`, `.otf`, `.woff` or `.woff2` from storage, validated before acceptance and stored privately. |
| **Ignore publisher styles** | Drops the book's stylesheets so the reader's typography wins on books that hardcode sizes. |
| **Force dark** | A palette rewrite, not a filter: classed backgrounds are neutralised and illustrations keep their colours. |
| **Highlights** | Four pen colours, persistent per chapter, re-marked after reflow, tap to remove. |
| **Selection actions** | Copy and look-up through the system browser, ColorDict or GoldenDict. |
| **Footnote popups** | Tapping a labelled note reference shows the note beside the text, even when it lives in another file. |
| **Read-aloud** | System TTS in document order, chaining across the book and turning pages itself. |
| **Auto-scroll** | Continuous auto-scroll at a chosen dp/s, pausing on touch; timed page turns in paged mode. |
| **Status line** | Clock, chapter progress, chapter name and battery, each toggleable, top or bottom. |
| **Custom CSS and JavaScript** | Reader-authored styles and scripts injected into every document, with JS off by default. |
| **Stable positions** | Reading position is a character offset plus document URL, not a page index. |
| **Cover page** | The declared cover is prepended as page zero when the spine does not already show it. |
| **DRM detection** | DRM-locked books are reported instead of rendered as garbage; font obfuscation is ignored. |

→ [Reading books](/hyoukan/guide/books/) · [Tutorial: typeset an EPUB](/hyoukan/tutorials/typeset-an-epub/)

## Library and organisation

| Feature | What it does |
|---|---|
| **Hierarchical categories** | Categories can contain subcategories, with an optional home-screen-style folder layout and a virtual "All" view. |
| **Smart categories** | Bind a category to a tracker status; entries move in and out automatically. Unbound categories are never touched. |
| **Per-category reader settings** | A category can override reading mode, orientation and other reader defaults. First matching category wins. |
| **Per-category update schedules** | Daily to monthly, independently of the global schedule; the shortest interval wins. |
| **Library update** | Scheduled refresh with Wi-Fi, charging and battery constraints, smart release-date prediction and excluded scanlators. |
| **Sorting** | Title with article handling ("A Sign of Affection" under S), last read, date added, unread count and more. |
| **Display modes** | Grid, compact grid, list, staggered grid and cover-flow panorama. |
| **Custom covers** | Pick an image, crop or fit it, nudge and zoom; covers can travel inside backups. |
| **Duplicates** | A dedicated screen lists entries with more than one copy, with side-by-side open and jump-to-migration. |
| **Merge** | Merge multiple sources of the same series into one entry while keeping chapters and tracking. |
| **Migration** | Move entries to another source, individually or in bulk, with search and chapter-count comparison. |
| **Censor lewd content** | Blur thumbnails and redact titles, tags and descriptions across the library, catalogue and details. |
| **Source filters** | Per-source default filters, including per-sort defaults, and pinned source categories. |
| **Feed** | A multi-source feed of latest entries and saved searches, with its own tab. |
| **History** | Reading history with per-entry progress, timestamps and chapter counts. |
| **Stats** | Library and reading statistics with configurable cover styling. |
| **Local source** | Folder-per-series reading of images, archives and EPUBs, with hidden-folder support. |
| **Comics and books together** | One library holds both; the entry type is detected from the content, not the file extension alone. |

→ [Library & categories](/hyoukan/guide/library/) · [Tutorial: library on autopilot](/hyoukan/tutorials/library-autopilot/)

## Sources and extensions

| Feature | What it does |
|---|---|
| **Extension ecosystem** | Installable APK sources, compatible with the Tachiyomi/Mihon extension format. |
| **Extension stores** | Add repositories by URL, browse their catalogues, and install or update in place. |
| **Four installers** | Private (no permission, signature-verified), Shizuku (no per-app prompt), legacy session and package installer. |
| **Automatic extension updates** | Background updates every 6/12 hours, daily or weekly, through the Private or Shizuku installer. |
| **Extension diagnostics** | Failed extensions report their icon, version, repository and failing source, with one-tap issue search. |
| **Content warnings** | Extensions are flagged Safe, Mixed or NSFW; you choose which warnings you allow. |
| **Built-in Komga** | Browse, search and read from a Komga server without an extension, including EPUB books and progress sync. |
| **Delegated sources** | The app's enhanced implementations can take over installed extensions where supported (notably Komga). |
| **E-Hentai / ExHentai** | Login, favourites sync, watched tags, language filtering, original images, H@H, censorship metadata and enhanced browse. |
| **Cloudflare handling** | WebView challenge solving, an optional FlareSolverr instance, and a visible Turnstile popup when a challenge needs a human. |
| **Data saver** | Per-source image compression, Bandwidth Hero or wsrv.nl proxying, JPEG/WebP conversion and black-and-white conversion. |
| **Saved searches** | Save a source search and reopen it later, or put it in the feed. |
| **Global search** | Search every enabled source from one query, with source-category filtering. |

→ [Sources & extensions](/hyoukan/guide/sources/)

## Downloads and storage

| Feature | What it does |
|---|---|
| **Download queue** | Per-chapter downloads with pause, resume, retry and progress notifications; survives a full app close. |
| **Concurrency controls** | Separate concurrent source and page limits, and download threads. |
| **CBZ output** | Save downloads as CBZ archives instead of folders. |
| **Split tall images** | Cut long strips for better reader performance. |
| **Auto-download** | Download new chapters, download ahead while reading, and skip duplicate read chapters. |
| **Delete after reading** | Remove chapters after manual read marks or after N read chapters, with bookmark protection. |
| **Chapter cache** | Cached (not downloaded) chapters with a retention window and a size limit. |
| **Downloaded-only mode** | Hide every entry and chapter that is not available offline. |
| **Storage cleanup** | Delete downloads of entries no longer in the library, or every download, with confirmation. |
| **Downloaded content screen** | Lists non-library downloads and cached chapters by source, size and age, with per-item deletion. |
| **Reindex downloads** | Rebuild the download index after moving or restoring files. |
| **Download URL hash** | Optional URL-hash suffix to avoid collisions between chapters with the same name. |

→ [Downloads & storage](/hyoukan/guide/downloads/)

## Tracking

Thirteen services are built in:

| Service | Auth |
|---|---|
| MyAnimeList | OAuth |
| AniList | OAuth |
| Kitsu | Credentials |
| MangaUpdates | Credentials |
| Shikimori | OAuth |
| Bangumi | OAuth |
| Anime-Planet | WebView cookie |
| ComicK | Credentials |
| MangaBaka | Credentials |
| Hikka | Credentials |
| Kavita | Enhanced, auto-discovered |
| Komga | Enhanced, auto-discovered |
| Suwayomi | Enhanced, auto-discovered |

Also: automatic progress updates on read, per-tracker score and status, reading dates, reread counts, sequel/prequel relations from trackers, recommendations, a definitive tracker source per entry/category, and tracker-status-driven smart categories.

→ [Tracking](/hyoukan/guide/tracking/)

## AI translation

| Feature | What it does |
|---|---|
| **Full page pipeline** | Detect → OCR → group → translate → inpaint → typeset, with removal covering every detected region. |
| **On-device stages** | DBNet detection, ONNX CTC OCR (or PaddleOCR v5), AOT-GAN inpainting and Canvas typesetting. |
| **Cloud providers** | Gemini, OpenRouter or any OpenAI-compatible endpoint with an API key. |
| **On-device LLMs** | Bundled llama.cpp with a Vulkan backend, plus Gemini Nano through ML Kit as an offline fallback. |
| **Ichigo image service** | Full remote page translation through a MangaTranslator-compatible API, anonymous or signed in. |
| **Prompt control** | Target language, formality, SFX policy, custom instructions, few-shot examples and a glossary. |
| **Cache** | Content-addressed page cache; prompt/provider changes invalidate only what depends on them. |
| **Metadata translation** | Translate titles and descriptions, with staleness checks against the entry's current metadata. |
| **Download translation** | Optionally translate pages as they download, with a per-manga permanent cache. |
| **Sessions** | Pause, resume, retry or stop active translation sessions per chapter. |
| **Grammar fixer** | An optional English grammar and vocabulary pass. |

→ [AI translation](/hyoukan/guide/translation/) · [Tutorial: translate a chapter](/hyoukan/tutorials/translate-a-chapter/) · [Tutorial: translate offline](/hyoukan/tutorials/translate-offline/)

## AI upscaling

| Feature | What it does |
|---|---|
| **Native models** | Real-CUGAN 2×/3×/4×, Real-ESRGAN and Waifu2x through NCNN. |
| **ONNX models** | NNAPI/NPU or CPU inference, including user-imported `.onnx` files validated before acceptance. |
| **Simple resample** | Bicubic, bilinear or nearest-neighbour fallback with no model download. |
| **Plan chains** | Vulkan → NPU → CPU → resample, falling through when a backend is unavailable. |
| **Enablement ladder** | Global switch → per-entry toggle → category default → default for new entries. |
| **Prefetch** | Warm the cache for the next 0–5 pages while reading. |
| **Cache** | 200 MB, 30-day page cache keyed by model, factor, backend, format and artifact hashes. |
| **WebGPU ArtCNN** | An on-GPU tile refinement path that is display quality only, not a page pipeline. |
| **Live status** | Served, cache-hit, fallback, failure, average inference time and per-backend readiness. |

→ [AI upscaling](/hyoukan/guide/upscaling/) · [Tutorial: upscale a series](/hyoukan/tutorials/upscale-a-series/)

## Backup, sync and continuity

| Feature | What it does |
|---|---|
| **Manual backup** | `.tachibk` protobuf backup with selectable content and per-category scoping. |
| **Automatic backups** | Scheduled hourly to weekly; the four most recent automatic backups are kept. |
| **Streaming restore** | Entries are decoded one at a time and restored in batched transactions. |
| **Integrity checking** | Backup validation, corrupt-file handling and a database integrity check at startup. |
| **SyncYomi** | Hosted library sync with protocol v1 and an opt-in v2 delta/tombstone mode. |
| **WebDAV** | Self-hosted sync to any WebDAV folder. |
| **Google Drive** | OAuth-based Drive sync with a purge action. |
| **Sync triggers** | Sync on app start, resume, chapter open or chapter read. |
| **Selective sync** | Choose exactly which content classes travel. |

→ [Backup & sync](/hyoukan/guide/backup-sync/)

## Personalisation

| Feature | What it does |
|---|---|
| **Named themes** | Tachiyomi, Catppuccin, Cloudflare, Cottoncandy, Doom, Green Apple, Lavender, Matrix, Midnight Dusk, Mocha, Monet, Monochrome, Nord, Sapphire, Strawberry, Tako, Teal Turquoise, Tidal Wave, Yin Yang and Yotsuba, plus a custom scheme. |
| **Dynamic colour** | Cover-based palettes, Material You wallpaper palettes (including below Android 12) and five palette styles. |
| **Pure black** | AMOLED black dark theme. |
| **App icon & name** | Six built-in launcher icons and a custom image/name shortcut, with crop or fit. |
| **Tablet UI** | Automatic two-pane layout, rail alignment and navigation options. |
| **Languages** | Per-app language selection driven by the translated string catalogue. |
| **Reader appearance** | Per-book and per-comic typography, colours, layout and behaviour. |

→ [Appearance & identity](/hyoukan/guide/appearance/)

## Connections

| Feature | What it does |
|---|---|
| **Discord RPC** | Rich presence showing the entry, chapter and reading state, with category exclusions and multiple accounts. |
| **Webhooks** | Discord webhooks or generic JSON endpoints for chapter started/read, manga added/removed/finished, migrate, backup created/restored and reading time. |
| **FlareSolverr** | Optional external Cloudflare solver with a test action and automatic fallback. |
| **DNS over HTTPS** | Twelve DoH providers, plus a custom user-agent setting. |
| **Network inspection** | Optional request logging at the higher log levels. |

→ [Connections](/hyoukan/guide/connections/)

## Privacy and security

| Feature | What it does |
|---|---|
| **App lock** | Biometric or device-credential unlock, with a timeout, active days and time ranges. |
| **Secure screen** | Hide app contents in the recents thumbnail and block screenshots — always, in incognito, or never. |
| **Incognito mode** | Read without writing history or progress. |
| **Database encryption** | Optional SQLCipher encryption with a password. |
| **Encrypted archives** | AES-256, AES-128 or ZipCrypto CBZ encryption. |
| **Password-protected downloads** | Encrypt downloaded chapters and require the password to read them. |
| **Notification privacy** | Hide notification content. |
| **Local-first defaults** | No telemetry unless the build is compiled with it; translation and upscaling can run entirely on-device. |

→ [Privacy & security](/hyoukan/guide/privacy/)

## Achievements and extras

- **150+ achievements** across reading, library, tracker, translation, social and exploration categories.
- **Ranks** from Novice to Ultimate, based on unlocked achievements, chapters read and series finished.
- **Secret achievements**, **negative/shame achievements** that do not count toward rank, and **rotating daily/weekly** pools with real progress bars.
- **Animated tier gradients**, achievement popups and optional sounds.
- **Chapter completion moan** with gacha-style rarity and user sound packs.

→ [Achievements](/hyoukan/guide/achievements/)

## Diagnostics

- In-memory logcat ring that survives process death and flushes on demand.
- **View logs**, **Clear logs** and **Dump crash logs** under Advanced.
- A crash screen showing the full stack trace and device info.
- WebGPU session summaries in the log dump.
- Extension failure reasons and repository attribution.
- Worker inspection and backup-schema inspection in the debug menu.

→ [Troubleshooting](/hyoukan/guide/troubleshooting/)
