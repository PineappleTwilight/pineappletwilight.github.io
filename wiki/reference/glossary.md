---
title: Glossary
description: The vocabulary used across Hyoukan, its documentation and its code.
---

## A–C

| Term | Meaning |
|---|---|
| **ABI** | The CPU instruction set an APK targets: `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`. Extensions and native features depend on it. |
| **Achievement** | An optional collectible milestone. Positive, secret, negative or rotating. |
| **Activity** | An Android screen with its own lifecycle. The reader and main UI are activities; most other screens are Navigation 3 routes. |
| **AdaptiveSheet** | A Compose bottom sheet that adapts to phone/tablet layouts. Used for dialogs inside tabs. |
| **Archive** | A container of pages: ZIP/CBZ, RAR/CBR, 7z, EPUB. Read through libarchive. |
| **AST search** | The library's field-aware query syntax (`author:`, `tag:`, `NOT`, quotes). Toggleable. |
| **Auto webtoon** | Automatically using the continuous viewer for entries whose pages look like a long strip. |
| **Backup** | A `.tachibk` protobuf snapshot of library data and selected settings. |
| **Beta** | A minified preview build published from every `master` push as `r<commitCount>`. |
| **Blacklist (chapter)** | A per-entry list of chapters hidden from the chapter list and update counts. |
| **Book** | A text entry rendered by the novel viewer, usually an EPUB. Contrast **Comic**. |
| **Catalogue** | A source's browse/search listing of entries. |
| **Category** | A library label. Can contain subcategories. |
| **CBZ** | A ZIP archive of images, optionally encrypted. |
| **Chapter** | A unit inside an entry. An image chapter has pages; a book chapter has text documents. |
| **Chapter cache** | Pages cached while reading, evictable and separate from downloads. |
| **Cloudflare challenge** | A bot check in front of a site; solved by a WebView, FlareSolverr or a visible Turnstile popup. |
| **ComicInfo.xml** | The ComicRack metadata file read from local folders and archives. |
| **Compose** | Jetpack Compose, the UI toolkit used for all app screens. |
| **ConfigurableSource** | A source with its own preferences in `source_$id`. |
| **Continuous vertical** | A long-strip reading mode. |
| **Cover-based theme** | A palette derived from the open entry's cover. |

## D–H

| Term | Meaning |
|---|---|
| **DB (database)** | The SQLite database holding entries, chapters, categories, history and tracking. |
| **Delegated source** | An installed extension served by an in-app implementation (notably Komga). |
| **DoH** | DNS over HTTPS. Twelve providers are selectable. |
| **Download** | An explicitly saved chapter, kept until deleted. Contrast **chapter cache**. |
| **Dual page** | Two pages side by side, with height matching. |
| **Enhanced tracker** | A tracker discovered from a server (Kavita, Komga, Suwayomi) rather than logged into. |
| **Entry** | A series, book or one-shot in the library or in a source. |
| **EPUB** | An open ebook format: OPF package, spine documents, resources and a TOC. |
| **Extension** | A separately installed APK that provides one or more sources. |
| **Extension store** | A repository index of extensions, with a signing key for verification. |
| **Feed** | A multi-source stream of latest entries and saved searches. |
| **FlareSolverr** | An external Cloudflare-solving service the app can use. |
| **Force dark** | A palette rewrite for books, not a colour filter. |
| **Global search** | A search across every enabled source. |
| **GPU device** | The Vulkan/WebGPU device used by the hardware reader. A lost device triggers recovery. |
| **HDR** | High dynamic range pages (PQ, HLG, UltraHDR), rendered at full brightness by WebGPU. |
| **Hyoukan** | This app. Formerly Houri, and before that a Komikku fork. |

## I–M

| Term | Meaning |
|---|---|
| **Incognito** | A session mode that writes no history or progress. |
| **Installer (extension)** | Private, Shizuku, Legacy or Package installer. |
| **Interactor** | A domain use case (`GetManga`, `SetMangaChapterFlags`). |
| **JXL** | JPEG XL, a modern image format the decoder supports. |
| **Komga** | A self-hosted comic/manga/ebook server, supported as a built-in source and tracker. |
| **Library** | The set of entries you saved, plus their organisation. |
| **Library update** | A scheduled refresh that fetches new chapters and metadata. |
| **Local source** | The built-in source that reads folders, archives and EPUBs on the device. |
| **Long strip** | A continuous vertical reading mode (webtoon). |
| **LUT** | Look-up table for colour grading. Presets and custom `.cube`/`.3dlut` files. |
| **Merge** | Combining several source entries into one library entry. |
| **Metro** | The dependency-injection framework used by the app. |
| **Migration** | Moving an entry to another source, or a database schema change (`.sqm`). |
| **Mihon** | The upstream reader Hyoukan ultimately derives from, alongside TachiyomiSY. |
| **Moko resources** | The string-resource system (`MR`, `KMR`, `SYMR`). |
| **MTL** | Machine translation — the page-translation pipeline. |
| **MangaBaka** | A tracker with full progress sync. |

## N–R

| Term | Meaning |
|---|---|
| **Navigation 3** | AndroidX's navigation library; every screen is a serializable route. |
| **Negative achievement** | A "shame" achievement that does not count toward rank. |
| **NCNN** | A neural-network inference framework used by the upscaler and the translation detector/inpainter. |
| **Nomtl** | The build flavour without the translation engine. |
| **Novel viewer** | The WebView-based book renderer. |
| **ONNX** | An open model format; used by OCR, the NPU upscaler and imported models. |
| **OPF** | The EPUB package document (`content.opf`) listing metadata, manifest and spine. |
| **Page** | An image unit with a load state and a stream. |
| **Page split** | Cutting a too-tall page into segments that replace it in the page list. |
| **Preference** | A persisted setting (`Preference<T>` / `SettingKey<T>`). |
| **Private installer** | The extension installer that needs no install permission and verifies signatures. |
| **Provider (MTL)** | A translation backend: Ichigo, Gemini Nano, local GGUF or cloud. |
| **Reader cache** | The image cache used while reading. |
| **Reread** | A tracked repeat read of an entry, with tracker support. |
| **Rotating achievement** | A daily or weekly challenge drawn from a pool. |

## S–Z

| Term | Meaning |
|---|---|
| **Scanlator** | The group that translated/released a chapter. Used for filtering and priority. |
| **Secret achievement** | An achievement hidden as `???` until unlocked. |
| **Secure screen** | `FLAG_SECURE`: hides recents and blocks screenshots. |
| **Series** | A group of books, or a manga entry; the library's main object. |
| **Shizuku** | An Android service that lets the app install extensions with shell identity. |
| **Smart category** | A category bound to a tracker status that moves entries automatically. |
| **Smart scanlator filter** | Deduplicating chapters across groups, preferring the most complete coverage. |
| **Source** | A provider of entries, chapters and pages. |
| **Source API** | The extension-facing contract in `source-api`. |
| **Spine** | The ordered list of EPUB documents that make up a book. |
| **SQLDelight** | The database code generator used by the data module. |
| **SQLCipher** | Optional encryption for the SQLite database. |
| **Stuck page** | A page whose decode/load state has stalled; recovered by the stuck-page ladder or a tap. |
| **SyncYomi** | The hosted library-sync protocol, v1 or v2. |
| **Text page** | A unit of book text (`TextPage`), not an image page. |
| **TextSource** | The extension interface for EPUB/web-novel content. |
| **Tier (device)** | TINY → XLARGE, derived from RAM, low-RAM flag and ABI. |
| **Tombstone** | A sync record marking a deleted category or chapter in protocol v2. |
| **Tracker** | An external service that records reading progress and scores. |
| **Turnstile** | Cloudflare's visible human-check widget. |
| **Upscaler** | The super-resolution pipeline for page images. |
| **Vulkan** | The GPU API used by WebGPU and NCNN. |
| **WebGPU** | The hardware-accelerated page renderer. |
| **Webtoon** | A vertical long-strip comic format. |
| **WebView** | The Android browser component used for book rendering and login flows. |
| **XLog** | The app's logging library. |
| **`__PRIVATE_`** | Preference-key prefix for values excluded from backups by default. |
| **`__APP_STATE_`** | Preference-key prefix for internal state that is never backed up. |

## Notation

| Symbol | Meaning |
|---|---|
| `.tachibk` | Backup file extension |
| `.sqm` | SQLDelight migration |
| `app.houri` | The Android application ID (legacy name, kept for upgrade compatibility) |
| `KMR` / `MR` / `SYMR` | Hyoukan / Mihon / TachiyomiSY string resource classes |
| `// KMK` | Hyoukan/Komikku fork marker |
