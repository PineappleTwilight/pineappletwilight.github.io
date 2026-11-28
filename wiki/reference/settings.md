---
title: Settings index
description: A screen-by-screen reference to Hyoukan's settings, grouped by the decision each one makes.
---

This is the map of **More → Settings**. Rows are grouped as they appear; a row's exact wording may vary slightly by translation. Linked pages explain the behaviour behind a group.

## Appearance

**Theme**

- **App theme** — light, dark, system or a named scheme.
- **Palette Personalizer** — pick a seed colour and style for the custom theme.
- **Custom theme style** — tonal spot, neutral, vibrant, expressive, rainbow, fruit salad, monochrome, fidelity or content.
- **Pure black dark mode** — AMOLED black.
- **Theme based on cover** — derive the palette from the open entry.
- **Cover based theme style** — how that palette is built.
- **Panorama Cover** — show a wide cover in landscape.
- **Align Cover to Top** — cover at the top of the details page.
- **Cover Loading Spinner** — spinner or plain placeholder.

**Display**

- **App icon & name** — launcher identity screen.
- **App language** — follow the system or pick a language.
- **Tablet UI** — automatic, always on, always off.
- **Rail button alignment** — start, centre, end.
- **Date format**.
- **Statistics cover style** — square/compact or book/full.
- **Relative timestamps** — "2 hours ago" instead of an absolute date.
- **Render images in manga descriptions**.
- **Censor lewd manga** — blur thumbnails and redact text.

**Fork settings**

- **Panorama Cover Flow** — show panorama covers in global search and suggestions.
- **Expand all search filters by default**.
- **Recommendations in overflow**.
- **Merge in overflow**.
- **Previews row count**.

**Navbar**

- **Show updates in the nav**.
- **Show history in the nav**.
- **Always show nav labels**.

## App icon & name

- **Six built-in launcher icons** — Forest, Midnight, Sakura, Ocean, Ember, Paper.
- **Custom launcher icon** — choose an image; Android cannot replace the installed icon, so a shortcut is pinned.
- **Crop / Fit** — crop trims the edges; fit keeps the whole image on a transparent square.
- **Add home-screen shortcut** — pins the custom image and name.
- **Remove image**.
- **Custom app name** — shown on the shortcut and in About.

## Library

**Categories**

- **Edit categories** — create, rename, reorder, delete, nest subcategories.
- **Default category** — where new entries land.
- **Per-category settings for sort**.

**Global update**

- **Automatic updates** — off, every 12 hours, daily, every 2/3 days, weekly.
- **Automatic updates device restrictions** — Wi-Fi only, unmetered only, charging.
- **Always launch global updates** / **Launch global updates only for ungrouped, category updates for others** / **Launch category updates all the time**.
- **Automatically refresh metadata** — cover and details during updates.
- **Subcategory refresh scope** — entire category or selected subcategory.
- **Skip entries with unread chapter(s)**.
- **Skip unstarted entries**.
- **Skip entries with "Completed" status**.
- **Predict next release time** / **Smart update**.
- **Show unread count on Updates icon**.
- **Show updating progress banner**.

**Behavior**

- **Chapter on swipe left / right** — disabled, bookmark, mark as read, download.
- **After reading a chapter** — what happens when a chapter is finished.
- **After fetching new chapter**.
- **Mark duplicate read chapter as read** — old or new.
- **Hide missing chapter indicators**.
- **Show empty categories during search/filtering**.
- **Use folder layout for subcategories**.
- **Hide the "All" subcategory**.
- **Fetch metadata when adding to library**.
- **Fetch chapters when adding to library**.
- **Advanced search (colons)**.

**Sorting settings**

- Tag sorting tags.

## Reader

**Display**

- **Default reading mode** — LTR, RTL, vertical, webtoon, continuous vertical.
- **Default rotation** — free, portrait, landscape, locked.
- **Background color** — black, gray, white, auto.
- **Fullscreen**.
- **Show content in cutout area**.
- **Keep screen on**.
- **Show page number**.
- **Flash on page change** — duration, interval, black/white.
- **Display cutout mode** — single and dual page.

**Reading**

- **Skip chapters marked read**.
- **Skip filtered chapters**.
- **Skip duplicate chapters**.
- **Always show chapter transition**.
- **NSFW chapter completion sound**.
- **Randomize moan location** — 50% last page, 50% between chapters.

**Paged**

- **Tap zones** and **Invert tap zones**.
- **Scale type**.
- **Zoom start position**.
- **Crop borders**.
- **Automatically zoom into wide images**.
- **Wide images zoom mode**.
- **Disable zoom in**.
- **Double tap to zoom**.
- **Pan wide images**.
- **Split wide pages** and **Invert split page placement**.
- **Rotate wide pages to fit** and **Flip orientation of rotated wide pages**.

**Long strip**

- **Smart scale on wide screen**.
- **Apply Smart scale to Long strip with gaps**.
- **Side padding**.
- **Sensitivity for hiding menu on scroll**.
- **Pinch to zoom**.
- **Disable zoom out**.
- **Long strip with gaps**.
- **Tap scroll by page**.
- **Performance HUD** (debug builds).

**WebGPU**

- **WebGPU page offset**.
- **Dark mode filter / True black (AMOLED) / Gray tolerance / Color dimming**.
- **ArtCNN upscaling** — sharper zoomed tiles, more battery.
- **Fast rendering** — skip the tile cache for weak tablets.
- **Brightness** (−70–100%), **Contrast** (0–200%).
- **Sharpening** — unsharp mask, 0–200%, live (on `master`).
- **Filter presets** — save and reapply named looks; see [Calibrate the reader](/hyoukan/tutorials/calibrate-the-reader/#step-8-save-a-filter-preset) (on `master`).
- **HLG tone mapping** and **HLG exposure**.
- **Color LUT preset** and **LUT intensity**.
- **Custom LUT file** — `.cube` or madVR `.3dlut`.
- **Compare translation** — show the original page.
- **E-ink preset**.
- **Pages preloaded ahead / behind**.
- **Transition animation** (single and dual).
- **Display cutout mode** (single and dual).
- **Min width**, **Gap**.

**Navigation**

- **Volume keys** and **Invert volume keys**.
- **Controller scroll speed**.

**Actions**

- **Show actions on long tap**.
- **Save pages into separate folders**.

**Page downloading**

- **Page Preload amount**.
- **Download threads**.
- **Reader cache size**.
- **Aggressively load pages**.

**Fork settings**

- **Skip queue on retry**.
- **Preserve reading position on read entries**.
- **Auto Webtoon Mode**.
- **Reader Bottom Buttons**.
- **Page layout**.
- **Invert double pages**.
- **Center Margin** — spacer for foldables.
- **Archive reader mode**.

## Book reading

- **Import books** — copy EPUB, FB2 or TXT files into a new local-source folder (FB2/TXT on `master`, not in stable 1.25.3).
- **Reading appearance** — the full typography and behaviour sheet (also available in the reader).

## Downloads

- **Only on Wi-Fi**.
- **Save as CBZ archive**.
- **Split tall images**.
- **Concurrent source downloads**.
- **Concurrent page downloads**.
- **Download threads**.
- **Download cache renew interval** — manual to 1 day.
- **Delete chapters** — after manual read, or after the last/second/third/fourth/fifth read chapter.
- **After reading automatically delete**.
- **Allow deleting bookmarked chapters**.
- **Excluded categories**.
- **Download new chapters**.
- **Skip downloading duplicate read chapters**.
- **Download ahead**.
- **Auto download while reading**.

## Tracking

- **Open track menu on adding to library**.
- **Update progress after reading**.
- **Update progress when marked as read**.
- **Auto sync progress from Trackers**.
- **Delete tracking records on logout**.
- **Select entries using source metadata**.
- **Trackers** — per-service login and status.
- **Enhanced trackers** — Kavita, Komga, Suwayomi.

## Connections

**Sync** (Data and storage → Sync)

- **Service** — Off, SyncYomi, Google Drive, WebDAV.
- **SyncYomi host**, **API key**, **Use protocol v2**, **Scan a QR code**.
- **WebDAV server URL**, **username**, **password**, **data folder**.
- **Choose what to sync**.
- **Sync now**.
- **Create sync triggers** — chapter read, chapter open, app start, app resume.
- **Synchronization frequency** — 30 minutes to weekly.
- **Show syncing progress banner**.

**Discord**

- **Discord RPC** and **Discord Accounts**.
- **Discord status** — online, idle, do not disturb.
- **Custom message**.
- **Show progress**, **Show page progress**, **Show timestamp**, **Show buttons**, **Download button**, **Discord button**.
- **Incognito** and **Excluded categories**.

**Webhooks**

- **Discord webhook URL** and **generic JSON endpoint**.
- **Events** — chapter started/read, manga added/removed/finished/started/migrated, library update, downloads finished, backup created/restored, app updated, achievement unlocked.
- **Include reading time**.
- **Excluded categories**.
- **Send test notification**.

## Browse

- **Sources** group.
- **Suggestions** — show, expand, overflow, Home button.
- **Show scanlator priority** — show the entry-page **Scanlator priority** entry; on by default (on `master`).
- **Scanlator priority in overflow** — move **Scanlator priority** into the toolbar's ⋮ menu; off by default, requires **Show scanlator priority** (on `master`).
- **Sequels & prequels**.
- **Edit categories** / **Filter sources in categories**.
- **Replace latest button** — custom browse view.
- **Local source hidden folders**.
- **Feed** — hide tab, tab position, hide entries already in library.
- **Feed enhancements** — local Feed categories, filters, duplicate collapsing, failure summary and suggestions; off by default (on `master`); see [Feed](/hyoukan/guide/library/#the-feed).
- **Extension stores**.
- **Extensions**.
- **Allowed content warnings** — Safe, Mixed, NSFW.

## Data and storage

- **Storage location** — used for automatic backups, downloads and the local source.
- **Create backup**.
- **Restore backup**.
- **Automatic backup frequency** — every 1/3/6/12 hours, daily, every 2 days, weekly.
- **Show restoring progress banner**.
- **Storage usage**.
- **Clear chapter cache**.
- **Clear page preview cache**.
- **Clear chapter cache on app launch**.
- **Chapter cache retention** — until space is needed, 12 h, 24 h, 3 d, 7 d, 30 d.
- **Downloaded and cached content**.
- **Delete downloads not in library**.
- **Delete all downloads**.
- **Export → Library List (CSV)**.
- **Export database**.
- **Library imports → Import a library export** — match entries from a MangaBaka export to sources; with **Library interoperability** on, also import Kototoro, Usagi or Aniyomi exports (on `master`); see [Library imports](/hyoukan/guide/library-imports/).
- **Library interoperability** — off by default; import Kototoro/Usagi `.bk.zip` backups and Aniyomi `.tachibk` backups through Library imports, and export **Export to Kototoro** / **Export to Usagi** backups (on `master`).

## Security

- **Require unlock** — never, always, lock when idle.
- **Lock when idle** timeout.
- **Hide notification content**.
- **Secure screen** — always, incognito, never.
- **Password protect downloads**.
- **Encryption type** — AES-256, AES-128, ZipCrypto.
- **Set / delete CBZ archive password**.
- **Edit lock times**.
- **Biometric lock days**.
- **Send crash logs**.
- **Allow analytics**.

## E-Hentai

- **E-Hentai Website Account Settings**.
- **E-Hentai Favorites sync**.
- **Gallery update checker**.
- **Incognito mode**.
- **Enable ExHentai** (requires login).
- **Client type** — any client, default-port clients only.
- **Use Hentai@Home Network**.
- **Show Japanese titles in search results**.
- **Use original images**.
- **Watched Tags**.
- **Tag Filtering Threshold** and **Tag Watching Threshold**.
- **Language Filtering**.
- **Front Page Categories**.
- **Watched List Filter Default State**.
- **Image quality** — auto, 2400×, 1600×, 1280×, 980×, 780×.
- **Enhanced E/ExHentai browse**.
- **Disable favorites uploading**.
- **Show favorites sync notes**.
- **Ignore sync errors when possible**.
- **Force sync state reset**.
- **Time between update batches**.
- **Auto update restrictions**.
- **Show updater statistics**.

## AI translation

- **Status row** — engine, provider, model, readiness.
- **Target language**.
- **Translation font**.
- **Text color** — palette or custom hex.
- **Offline ML Kit fallback**.
- **Cache translated pages**.
- **Auto-translate on download**.
- **Advanced engine tuning** — quality pipeline, uniform fast cleanup, long-page slicing.
- **Provider** — Auto, Ichigo, Gemini Nano, local GGUF, cloud LLM.
- **Models & engine** — detector, OCR, PaddleOCR add-on, inpainter, local LLM, custom URLs, clear models.
- **Translation prompts** — custom instructions, formality, SFX policy, few-shot examples, glossary, reset.
- **Sessions** — stop, pause, resume, retry.

## AI upscaling

- **Enable AI upscaling**.
- **Upscale new entries by default**.
- **Upscale mode** — auto, native models, simple resample.
- **Resampling algorithm** — bicubic, bilinear, nearest.
- **Quality preset** — fast, balanced, high, quality.
- **Model** — Real-CUGAN, Real-ESRGAN, Waifu2x, imported ONNX.
- **Upscale factor**.
- **Backend** — best available, Vulkan, NPU, CPU.
- **Prefetch pages ahead** — off, 1–5.
- **WebGPU tile refinement (ArtCNN)**.
- **Cache upscaled pages** and **Clear upscaled cache**.
- **Live status** — served, cached, fell back, failed, average inference, backend readiness.
- **Models installed**, **download**, **clear**, **import ONNX**.
- **Library categories** — inherit, always, never.

## Achievements

- **Enable achievements**.
- **Achievement popups**.
- **Achievement sounds**.
- **Wipe achievement data**.
- **All achievements**, rank, stats, rotating pool.

## Advanced

**Diagnostics**

- **Source health diagnostics** — local source-answer checks; see [Troubleshooting](/hyoukan/guide/troubleshooting/#source-health-diagnostics).
- **Dump crash logs**.
- **Verbose logging**.
- **Debug info**.
- **View logs** / **Clear logs**.
- **Onboarding guide**.

**Notifications**

- **Manage notifications**.
- **Only on Wi-Fi**, **Only on unmetered network**, **When charging**.
- **Auto-update app** and update restrictions.

**Background activity**

- **Disable battery optimization**.
- Manufacturer-restriction help link.

**Data**

- **Keep removed covers** — retention period.
- **Reindex downloads**.
- **Clear database** — non-library history, with "keep entries with read chapters".

**Library**

- **Refresh library covers**.
- **Preload library's cover color**.
- **Reset per-series reader settings**.
- **Update library manga titles to match source**.
- **Disallow non-ASCII filenames**.
- **Smart scanlator merge**.
- **Show scanlator filter in details**.

**Downloads**

- **Include chapter URL hash**.

**Reader**

- **Custom hardware bitmap threshold**.
- **Use legacy decoder for long strip reader**.
- **Use high quality renderer (WebGPU)**.
- **WebGPU tile cache** — on by default; off uses the cache-free path for GPUs that show black or flickering pages (on `master`).
- **Match double-page heights**.
- **Custom display profile**.

**Plugin sources**

- **Novel plugins** — import and manage sandboxed `.js` novel sources (on `master`); see [Novel plugins](/hyoukan/guide/novel-plugins/).

**Extensions**

- **Installer** — Private, Shizuku, Legacy, Package installer.
- **Update extensions automatically** — every 6/12 hours, daily, weekly.
- **Revoke trusted unknown extensions**.

**Networking**

- **Clear cookies**.
- **Clear WebView data**.
- **DNS over HTTPS (DoH)**.
- **Default user agent string** / **Reset**.
- **Enable FlareSolverr**, **URL**, **Test**.
- **Cloudflare bypass banner**.
- **Clean up downloaded chapters**.

**Developer tools**

- **Enable integrated hentai features**.
- **Enable source blacklist**.
- **Extension error popups**.
- **Extension error details**.
- **Enable delegated sources**.
- **Log level** — Minimal, Extra, Extreme.
- **Encrypt database**.
- **Open debug menu** — workers, backup schema, backup schema tools.

## About

- **Version** (tap to copy the device-info block).
- **Check for updates**.
- **What's new**.
- **What's coming (soon)**.
- **Help translate**.
- **Open source licenses**.
- **Privacy policy**.
- **Website**.

> [!NOTE]
>
> Settings marked `__PRIVATE_` are excluded from backups unless **Private settings** is enabled. Settings marked `__APP_STATE_` are internal and never backed up.
