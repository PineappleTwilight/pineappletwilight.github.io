---
title: Frequently asked questions
description: Short answers to the questions that come up most often.
---

## The basics

### What is Hyoukan?

A free, open-source manga and novel reader for Android. It organises a library, fetches chapters through installable extensions or local files, and renders them with either an image reader or an EPUB reader. It does not host or distribute any content.

### Is it legal?

The application is legal open-source software. What you read with it is your responsibility, and the developers have no affiliation with any content provider. The app hosts zero content and ships no sources beyond the local source, E-Hentai/ExHentai and Komga.

### Is it free? Are there ads or subscriptions?

Yes, free. There are no ads, no subscriptions and no paywalled features. Optional services you connect — trackers, cloud LLM providers, a Komga server — have their own terms.

### Does it collect data?

By default, no telemetry is compiled in. Builds made with `-Pinclude-telemetry` include Firebase Crashlytics; the official release APKs do not. Logs stay on the device unless you explicitly share them, and translation/upscaling can run entirely on-device.

### Why is the package ID still `app.houri`?

The project was renamed from Houri to Hyoukan. Changing the Android application ID would break upgrades, backups and every existing library database, so the ID stays as a stable internal identifier. The product name, repository and documentation use Hyoukan.

## Compatibility

### What Android version do I need?

Android 8.0 (API 26) or newer. The app targets API 36 and compiles against API 37.

### Which architectures are supported?

`arm64-v8a`, `armeabi-v7a`, `x86` and `x86_64`. The WebGPU reader runs on 32-bit too, with a deliberately smaller memory budget. The local LLM runtime is 64-bit only for GPU offload; 32-bit devices fall back to CPU inference.

### Does it support Android TV?

There is no TV-specific interface. It can run on some Android TV devices, but navigation is designed for touch and the app is not tested there.

### Can I use an SD card?

Yes for downloads and backups through Android's storage access framework. The database lives in app-private storage and cannot be moved to removable media.

### Can I import my Mihon, Komikku or Tachiyomi library?

Yes. Restore a `.tachibk` backup from **Settings → Data and storage → Restore backup**. Install missing extensions and log back into trackers afterwards. Mihon-format backups (which carry no per-entry update schedule) are supported; the app recomputes the schedule from the backup's chapter list.

### Can I go back to an older version?

Only by uninstalling the newer build first, which erases app data. Take a backup before downgrading, and expect the database schema of the newer build to be unreadable by older versions. In practice, downgrading usually means restoring a backup made on the older version.

### Will stable and beta installs share data?

No. They have different application IDs and signing keys. They can coexist, but each has its own library and settings.

## Sources and extensions

### Why are sources separate extensions?

Because the sites change constantly and the app should not ship a hundred scrapers. Extensions are independent APKs: they can be updated without an app release, and the app's core does not need to know about any particular site. This is the same model Tachiyomi and Mihon use.

### Why did MangaDex disappear?

The in-app MangaDex client, login, follows sync and recommendations were removed. MangaDex remains available through the community MangaDex extension. Removed-source library entries are kept, and their metadata stays readable.

### Why can't I install an extension?

The usual causes:

- No extension store is configured. Add a repository URL first.
- Android has not granted the installer permission. The Private installer needs none; the legacy/package installers do.
- Android 14+ blocks unverified installs from the app until the per-app "allow" cooldown expires. The Private installer avoids this.
- The APK is for a different app signature or a newer API level than the device supports.

### Are all extensions safe?

No one can guarantee that. Extensions are third-party code and can read what they request. Prefer well-known repositories, use the Private installer (which verifies repository signatures), and avoid extensions from unknown sources.

### Why does an extension show an error?

Most extension errors mean the site changed and the extension has not caught up. Open the extension's details: the app names the repository and offers a GitHub issue search. Updating the extension often fixes it. Cloudflare challenges and rate limits are logged but are not treated as extension failures.

## Reading

### Why did the reader fall back to the standard viewer?

On current `master`, the WebGPU viewer declines for three reasons, in order: the high-quality switch is off; WebGPU cannot run on this device (the renderer cannot initialise, or a previously dead device cannot be rebuilt); or constructing the viewer threw. Each reason is written to the in-app log. There is no per-device health latch: degraded sessions are diagnostic only, and a recoverable GPU loss is answered by rebuilding the device rather than falling back to the standard viewer.

### Why is my page blank or black?

On WebGPU devices this is usually a GPU/driver problem, not a missing image. Update the app, try the **Use high quality renderer** switch off and on, and check the log for a `WebGPU viewer declined` line. On the legacy viewer, lower the hardware bitmap threshold or enable the legacy long-strip decoder.

### Why does a very tall page open at the bottom?

That was a long-standing page-splitting bug and is fixed in current builds. If you see it, update and report the source and chapter; the split path logs its decisions.

### Does it read right-to-left and vertical writing?

Yes. The pager supports LTR, RTL and vertical modes, and books honour the publisher's vertical-writing CSS unless you override it. Tap zones follow the reading direction.

### Does it support novels?

Yes — EPUB and plain-text web novels get a dedicated reader with publisher styling, pagination, highlights, footnotes, TTS and typography controls. See [Reading books](/hyoukan/guide/books/).

### Can I read local files?

Yes. The local source reads image folders, CBZ/CBR archives and EPUB files. Put them in the local source directory and refresh. A folder that is all EPUBs is treated as a book series; a mixed folder stays a comic.

### How do I read a downloaded book offline?

Download the chapter from the book's entry as usual. The EPUB is stored with the chapter and opened from disk by the book reader. Do not wrap an EPUB in a CBZ — an EPUB inside a CBZ is not a book.

## AI features

### Does AI translation send my pages to the cloud?

Only if you choose a cloud provider. The local pipeline (detection, OCR, inpainting, typesetting) runs on-device. Translation itself can use Gemini Nano or a local GGUF model with no network. The Ichigo image service is remote by design and sends the page image.

### Why is AI translation unavailable?

It needs at least 3 GB of RAM for the local engine and a supported ABI (`arm64-v8a` or `armeabi-v7a`). The `nomtl` build has no local engine. Without a downloaded model or a cloud key, pages fail cleanly rather than half-translating.

### Does upscaling require AI translation?

No. Upscaling is its own module and works in `nomtl` builds. Without a native model it falls back to a simple resample.

### Why does upscaling look soft sometimes?

The requested backend or model was unavailable and the plan fell through to a lower step. The upscaler's live status shows served, cache-hit, fallback and failure counts, plus per-backend readiness.

## Library and data

### Where are my downloads?

Under the storage location chosen in **Settings → Data and storage**, in a per-source/per-entry/per-chapter tree. The **Downloaded and cached content** screen shows exactly what is on disk, including entries no longer in the library.

### How do I free space?

- **Delete downloads not in library** for orphaned content.
- **Delete all downloads** for a clean slate (library entries and progress are kept).
- **Clear chapter cache** for cached-but-not-downloaded pages.
- Set a **chapter cache retention** window so old cached chapters expire on their own.

### How do I back up?

**Settings → Data and storage → Create backup.** Choose the content and a location. Enable automatic backups if you want the app to keep the last four. Custom covers are included when selected; private settings are opt-in.

### Does sync replace backups?

No. Sync keeps devices aligned; a backup is a portable snapshot you control. Keep periodic backups even while using SyncYomi, WebDAV or Drive.

### Can I export my library as a list?

Yes — **Settings → Data and storage → Export → Library List** writes a CSV with the columns you select (title, author, artist, categories). The same screen can export the database itself.

## Troubleshooting and contributing

### How do I report a bug?

Update first, then check the existing issues. Include the app version, device, Android version, steps to reproduce and a log dump from **Settings → Advanced → Dump crash logs**. The version row on About copies the device-info block for you.

### How do I request a feature?

Open a GitHub issue describing what it should do and why. Major changes are easier to discuss before code exists.

### How can I help translate?

Translations are managed on Weblate. The app links to the project from **About → Help translate**. Do not edit non-base locale files in a pull request; Weblate owns them.

### The wiki has a mistake. Can I fix it?

Yes. Every page has an **Edit this page** link at the bottom. The wiki source lives in `wiki/` and is built with `node tools/build-wiki.mjs`. See [Contributing](/hyoukan/contributing/).
