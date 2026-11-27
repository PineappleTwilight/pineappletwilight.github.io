---
title: Sources & extensions
description: How Hyoukan gets content — built-in sources, the extension ecosystem, installers and diagnostics.
---

Hyoukan separates **the reader** from **the places content comes from**. A source is a small program that knows how to browse a site and return entries, chapters and pages. Most sources are not in the app; they are installed separately as extension APKs.

## Built-in sources

Only a handful of sources ship inside the app:

| Source | What it is |
|---|---|
| **Local source** | Reads folders, CBZ/CBR archives and EPUB files on the device |
| **E-Hentai / ExHentai** | The full E-Hentai client, with 36 language-specific source IDs |
| **Komga** | A built-in client for a self-hosted [Komga](https://komga.org) server |

Everything else — MangaDex, Mangadex-style aggregators, scanlation sites, webtoon sites — comes from extensions.

> [!NOTE]
>
> **MangaDex is no longer bundled.** Its in-app client, login, follows sync and recommendations were removed. Install the community MangaDex extension instead. Library entries from the removed source are retained and their metadata stays readable; MDList tracker rows are cleaned up on upgrade.

## The extension model

An extension is an Android APK with a specific metadata block and a class implementing the `Source` API. The app loads it in a classloader, shows its sources in Browse, and talks to it through a stable ABI. Extensions can be updated independently of the app; this is why the ecosystem survives site changes.

Extensions declare:

- a package name, version code and version name;
- the app version they target (`tachiyomix.extensionLib` and related metadata);
- one or more sources, each with a name, language, id and optional content warnings;
- an optional icon.

The app never bundles a source's secrets. Login state lives in the source's own preferences, and cookies are stored per source.

## Adding an extension store

1. **Browse → Extensions**.
2. Open **Extension stores**.
3. Add a repository URL. A repository is a JSON index (commonly `index.min.json`) that lists extensions, their APK URLs and their icons.
4. Return to Extensions and refresh.

A store can be disabled or deleted without uninstalling the extensions it provided. Extension updates are matched by package name and signing key, so a store cannot silently replace another store's extension with a different signature.

## Installing extensions

Four installers are available under **Settings → Advanced → Extensions → Installer**:

| Installer | Permission | Background updates | Notes |
|---|---|---|---|
| **Private** | None | Yes | The recommended choice. Verifies the archive against the repository's signing key, stores it privately and loads it without Android's package installer. No 24-hour unverified-install cooldown. |
| **Shizuku** | Shizuku running | Yes | Uses Shizuku's shell identity. Skips Play Protect verification for updates, so they register immediately. |
| **Legacy** | Install unknown apps | No | The classic session installer with the Android install UI. |
| **Package installer** | Install unknown apps | No | Uses `PackageInstaller` sessions directly. |

Automatic extension updates can run every 6 or 12 hours, daily or weekly. Only the Private and Shizuku installers can update in the background; the others require the user to confirm each install.

If an install fails, the Extensions screen records the reason — signature mismatch, incompatible API level, storage, permission or a package conflict.

## Content warnings

Extensions are classified **Safe**, **Mixed** or **NSFW**. A single extension can carry more than one label because its sources may differ. Under **Settings → Browse → Allowed content warnings** you choose which labels you accept; sources whose labels you reject are hidden everywhere, not just in Browse.

This replaced the old single "show NSFW sources" switch. Existing settings migrate to the new model, and previously visible sources stay visible.

> [!WARNING]
>
> Content warnings are advisory metadata supplied by extensions, not a guarantee. They do not filter content inside an extension that mislabels itself.

## Delegated sources

Some installed extensions can be served by Hyoukan's own implementation instead of the extension's code. This is called **delegation** and is enabled under **Settings → Advanced → Developer tools → Enable delegated sources**.

The main case is **Komga**: when a Komga extension is installed and delegation is on, the app substitutes its built-in Komga source under the extension's source id. Settings, library entries, absolute URLs and tracker links carry over, and EPUB books open in the book reader. The switch is read when the source map is built, so changing it requires a restart.

Delegation exists because the app's implementation can do things an extension cannot — notably open an EPUB as a book and download it as a file rather than page images.

## Komga

Komga is a self-hosted comic/manga/ebook server. Configure it from **Browse → Sources → Komga → Settings**:

- **Server address** — for example `http://192.168.1.20:25600`.
- **API key** — optional, for authenticated servers.
- **Display name** — how the source appears in Browse.

The source browses libraries, series and books; comics read as image pages, EPUBs open in the book reader, and reading progress syncs through the Komga tracker. The app's HTTP client uses the system DNS on purpose so IP-addressed servers work, and never sends credentials to a host that did not issue the challenge.

## E-Hentai / ExHentai

The E-Hentai source is a full client:

- **Login** with cookies (`memberId`, `passHash`, `igneous`, `sk`, `s`) for favourites sync and ExHentai access.
- **Language filtering** and front-page category selection.
- **Watched tags** with soft-filter and watching thresholds.
- **Original vs resampled images**, H@H network preference and image-quality caps.
- **Favourites sync** in both directions, with a dry-run note, error tolerance, reset and a disable-upload switch.
- **Gallery update checker** in batches, with interval and restriction settings.
- **Censorship metadata** — censored, decensored, uncensored, mosaic/full — as tags with sort/filter support and colours.
- **Japanese title display** and an enhanced browse menu.
- **Batch add** from a list of E-Hentai URLs.

The app auto-configures an E-Hentai settings profile on request (**Configure ExHentai**), which requires fewer than three profiles on the account.

## Local source

The local source is the only way to read files you already own without a server.

- Add a folder from **Browse → Sources → Local source → Settings**.
- Each subfolder becomes an entry; each file or subfolder inside it becomes a chapter.
- `cover.jpg`, `details.json` and `ComicInfo.xml` are read when present.
- Hidden folders are ignored unless **Settings → Browse → Local source hidden folders** is on.
- `.epub`, `.fb2` and `.txt` files become book chapters; a folder containing only books is detected as a book series. FB2/TXT conversion is on the current `master` build, not in stable 1.25.3.
- CBZ, CBR, ZIP, RAR and 7z archives are read through the native archive layer.

See [Files & formats](/hyoukan/reference/formats/) for the folder layout and metadata schema.

## Novel plugins

**Settings → Advanced → Novel plugins** installs single-file JavaScript novel sources that run in a sandboxed QuickJS runtime. They appear in Browse like other sources, and their chapters open in the book reader. See [Novel plugins](/hyoukan/guide/novel-plugins/) for the import rules, sandbox limits and author contract.

## Cloudflare and FlareSolverr

Many sites put a Cloudflare challenge in front of their pages. Hyoukan handles this in two ways:

1. **Built-in WebView solver** — invisible for background work and downloads; a visible popup when a challenge needs a human (for example a Turnstile checkbox). The resulting clearance cookie is reused by the app, and concurrent requests to the same host wait for the one popup.
2. **FlareSolverr** — an optional external service. Configure its URL under **Settings → Advanced → Networking**, then use **Test FlareSolverr** to verify it and refresh the user agent. The instance must share the device's public IP, because Cloudflare binds the clearance cookie to it.

If a challenge cannot be solved, the source fails with the reason rather than hanging forever.

## Data saver and image handling

Per-source data saving can:

- route images through a **Bandwidth Hero** proxy or **wsrv.nl**;
- compress images before download or display;
- convert to JPEG or WebP;
- skip GIF animations;
- convert to black and white;
- cap image quality.

These settings are for slow connections and metered data; they trade quality for bytes and are applied at the source boundary, so the reader still sees ordinary pages.

## Source organisation

- **Pin sources** to a category to keep them at the top of Browse.
- **Source categories** group sources without changing their language grouping.
- **Source filters** set default filters per source, including per-sort defaults.
- **Saved searches** store a query for later, and can feed the Feed tab.
- **Global search** queries every enabled source at once; filter it by source category.

## When an extension breaks

A failing extension is almost always a site change. The Extensions screen shows:

- the extension's icon, name and version;
- the repository it came from;
- the source that failed;
- the HTTP status or exception;
- a one-tap GitHub issue search for that extension.

Only HTTP 401 and 404 are recorded as extension errors — the statuses that mean the source needs attention. Cloudflare challenges, rate limits and server errors are logged but do not flood the error list.

To report an extension bug, use the extension's own repository, not Hyoukan's issue tracker. The app builds the search link for you.

## Source health diagnostics

**Settings → Advanced → Source health diagnostics** records how the installed sources are answering, in five local buckets: **Unknown**, **Healthy**, **Degraded**, **Blocked** (Cloudflare or login) and **Suspected dead** (three DNS or 404 failures in a row). Nothing is uploaded automatically; a plain-text report can be shared manually with source names and statuses only. See [Troubleshooting](/hyoukan/guide/troubleshooting/#source-health-diagnostics) for the counting rules and the redacted report format.

## Security notes

- Extensions run with the app's permissions. They can read anything the app can read, including cookies they are given and the files they are asked to open.
- The Private installer verifies repository signatures, but it cannot make an untrusted repository trustworthy.
- Prefer a small number of well-known stores. Remove stores you no longer use.
- Do not install extensions from random links, and never enter credentials into a source you do not trust.
- A [novel plugin](/hyoukan/guide/novel-plugins/) is JavaScript, not an APK: its sandbox blocks files, databases and classes, and its network calls go through the app's HTTP client. There is no signature or content-warning check for plugins.

## For extension developers

The API is documented in [Extensions & source API](/hyoukan/development/extensions/). The short version: implement `Source` / `HttpSource` in Kotlin, declare the extension metadata, build an APK, and publish it in a repository index. The text-source interfaces add EPUB and web-novel support without any app-side changes.
