---
title: Troubleshooting
description: Diagnose the app without a computer — logs, crash reports, reader fallbacks, extension errors and sync failures.
---

Most problems have one of four causes: an extension that has not caught up with its site, a network or Cloudflare block, a device-specific rendering limit, or a setting that is doing what it says. This page starts with the tools that tell you which one you are looking at.

## First steps

1. **Update the app** — About → Check for updates. Many reports describe bugs already fixed.
2. **Update the extension** — a site change is the most common source failure.
3. **Restart the app** — a force stop clears the source map and the reader state.
4. **Check the log** — the app keeps a log ring even when nothing is written to disk.

## Diagnostics

### Log levels

**Settings → Advanced → Log level:**

| Level | What it records | Where |
|---|---|---|
| **Minimal** (default) | Warnings and errors | In-memory ring, flushed on demand |
| **Extra** | Adds debug detail and request/response headers | File logging enabled |
| **Extreme** | Adds full network bodies for every app request | File logging enabled; expensive |

Changing the level can affect performance and requires a force restart. Return to Minimal when you are done.

### View logs

**Settings → Advanced → View logs** browses the app's crash reports, dumps and logcat ring on-device. You can copy or share individual files. **Clear logs** wipes crash files, the ring and the system buffer.

### Dump crash logs

**Settings → Advanced → Dump crash logs** writes a shareable archive. It includes a short WebGPU session summary:

- what the reader decoded and how long it took;
- how tight memory was;
- whether pages were downsampled or evicted;
- whether a decode stalled;
- whether the GPU device was lost.

A report with this attached is far more useful than "the reader is broken". Current builds count `frames=` from frames the renderer actually presented, not from the reader's pre-submit `drawn` flag; the summary also carries `tiles=`, `filter=` and a `page=` line with the first drawn page's size, scale and mip count, plus the adapter backend and renderer/Dawn log lines.

### Debug info

**Settings → Advanced → Debug info** shows the version, build, device, ABI, memory class, database size and feature flags. Tapping the version row on **About** copies the same device-info block.

### Worker info and backup schema

The debug menu exposes scheduled workers and the backup schema. These are advanced tools; they are safe to inspect and copy, not to edit.

### Source health diagnostics

**Settings → Advanced → Source health diagnostics** shows which installed sources are answering. It is local-only: nothing is uploaded, and the screen reads connectivity only to decide whether a verdict is meaningful.

| Status | Meaning |
|---|---|
| **Unknown** | No check has run, or the device is offline. Offline overrides every stored verdict and freezes the failure counts. |
| **Healthy** | The last call succeeded; the failure streak was cleared. |
| **Degraded** | The last call failed but the streak is under three — usually a transient timeout or HTTP error. |
| **Blocked** | A Cloudflare challenge or a login is in the way. One such failure is enough. |
| **Suspected dead** | Three DNS or 404 failures in a row. The site may have moved or closed. |

Failures are counted only while the device is online; a success clears the streak but keeps the lifetime total. **Blocked** wins over a long DNS/404 streak because the most recent failure kind is checked first. **Refresh** reloads the screen and **Clear health records** forgets every recorded failure. **Export redacted report** shares a plain-text summary through Android's share sheet: source names, statuses, failure counts, failure kinds and a success timestamp, never library titles, URLs, accounts or reading history. An offline export downgrades every status to Unknown so stale "dead" verdicts are not replayed.

## App crashes

- The crash screen shows the **full stack trace and device info**, not just the exception name.
- A crash loop is tolerated for a burst of crashes before the app gives up, so a one-off crash does not lock you out.
- If the app will not start at all, the database may have failed its integrity check. The maintenance pass restores the latest daily database snapshot; if that fails, it quarantines the corrupt file as `tachiyomi.db.corrupt-<timestamp>` in app-private storage.
- If the database was reset, restore your latest `.tachibk` backup.

## Library and updates

| Symptom | Likely cause | What to do |
|---|---|---|
| Library update finds nothing | All entries skipped by rules | Check **Skip entries with unread chapters / unstarted / completed** and category schedules |
| A series never updates | Excluded scanlator covers every chapter | Open the chapter list → Scanlator filter |
| Update errors list is empty but updates fail | HTTP 401/404 only are recorded | Check **View logs** at Extra level |
| Entries missing after restore | Restore was interrupted, or the backup was category-scoped | Re-run the restore; check the source/tracker warnings |
| Duplicate entries | Same series from several sources | Use **Find duplicates** and merge or migrate |
| Covers not loading | Coil cache or source blocked | Long-press the cover to refresh; check the source in WebView |
| Unread counts wrong | Blacklisted chapters or merged entries | Check the chapter blacklist and merge state |

## Sources and extensions

| Symptom | Likely cause | What to do |
|---|---|---|
| Extension will not install | Installer permission or Android 14+ cooldown | Choose the **Private** installer |
| Extension installs but no sources appear | Incompatible API level or a disabled content warning | Check the extension details; review Allowed content warnings |
| "Cloudflare" or a timeout | Challenge not solved | Open the source in WebView; enable FlareSolverr; try again |
| HTTP 403/429 | Site blocking or rate limiting | Slow down downloads, change the user agent, wait |
| Source works in browser but not in app | User agent or cookie difference | Reset the user agent; clear cookies and log in again |
| Source shows **Blocked** in health diagnostics | Cloudflare or a login challenge | Open the source in WebView and solve the challenge |
| Source shows **Suspected dead** | Three DNS or 404 failures in a row | Check whether the site moved; clear health records once it recovers |
| Every source shows **Unknown** | Device offline | Reconnect; failure counts are frozen while offline |
| Komga cannot connect | Wrong URL, API key or DNS | Use the server's IP; the source intentionally uses system DNS |
| EPUB from Komga says "No pages found" | Chapter treated as an image chapter | Update; downloaded books must use the downloaded-book loader |

## The WebGPU reader

### It falls back to the standard viewer

Check **Settings → Advanced → Use high quality renderer**. If it is on, the log says why:

- `WebGPU viewer declined:` — WebGPU cannot run on this device, or a previously dead device cannot be rebuilt.
- `WebGPU viewer failed` — constructing the viewer threw.

On current `master`, there are no accumulated-strike resets. Degraded sessions are diagnostic only and never cause fallback; a recoverable GPU loss rebuilds the device. A device left dead by a previous session is rebuilt before the next reader starts.

### The screen is black, but pages are decoding

This is a GPU/driver problem. Try:

1. Update the app (the bundled Dawn runtime tracks upstream).
2. Toggle the high-quality switch off and on.
3. Try **Fast rendering**, or turn off **Settings → Advanced → Reader → WebGPU tile cache** (on by default). PowerVR devices take that cache-free path automatically.
4. Disable **ArtCNN** and, on current `master` builds, **Sharpening**.
5. Update: recent builds paint the page under the tiles every frame and require a real blit before the tile path can report "covered", so a wrong answer can no longer leave the screen blank.

### Pages are blurry or downsampled

The reader caps the uploaded page at what the panel can show, with zoom headroom, and scales further under memory pressure. That is deliberate: the alternative is a lost GPU device. Free memory or lower the preload counts.

### A page is stuck

Tap it to retry. The reader's ladder retries a bounded number of times, then gives up and leaves a visible error page rather than spinning forever.

### It opens at the wrong page

Update first. Several fixes landed for split pages, process-death restores and progress writes over failed pages. If it persists, note the source, chapter, reading mode and whether the entry was incognito.

## Books

| Symptom | Likely cause | What to do |
|---|---|---|
| Book opens as images | Entry type or mixed folder | Set **Render as book** on the entry |
| Text is invisible | Page colour vs text colour, or a dark theme | Enable Force dark or pick contrasting colours |
| Styles are ignored | The book hardcodes sizes | Enable **Ignore publisher styles** |
| Images missing | External URLs are not copied | Only archive resources are inlined; this is expected |
| Pages do not turn | Not in Paged mode, or the document has no layout yet | Check the page mode; update |
| Read-aloud silent | No TTS engine or language data | Install a system TTS voice |
| Footnotes do nothing | The note is not labelled as a footnote | Unlabelled links navigate normally |

## Downloads

- **Stuck at 0%** — the source cannot list pages. Verify it in WebView.
- **"No pages found"** — a book being downloaded as images; update the app.
- **Files exist but the app disagrees** — **Reindex downloads**.
- **Not enough space** — clear the cache, then orphaned downloads, then all downloads.
- **Corrupt archive** — the download is verified on completion; a broken archive is deleted and the download fails with a retry message. Re-download.

## Backup and restore

- **Invalid backup file** — the file is truncated or not a `.tachibk`. Try another copy; the error screen shows the parser message.
- **Restore is slow** — expected on a large library; it streams and batches. Do not kill it.
- **Trackers missing after restore** — log back in; tracking records are restored but sessions are not.
- **Extensions missing after restore** — extension APKs are not in the backup. Install them, then restore source settings if needed.
- **Custom covers missing** — restore with **Custom covers** enabled; the images are stored inside the backup.

## Sync

- **Nothing appears on the second device** — check the host, API key and last-sync timestamp; run **Sync now**.
- **Most of the library was skipped** — run **Sync now** once after updating so every entry gets the favorite stamp the uploader requires.
- **Deleted entries come back** — v1 is full-payload; enable protocol v2 for tombstones, or delete again on both devices.
- **Sync is slow or times out** — v2 allows up to 5 minutes per full request; a very large library may still need several runs.

## Tracking

- **Login fails** — check the service status, then try the other auth mode. Anime-Planet's Cloudflare check is waited out.
- **Progress does not update** — check the per-setting toggles and whether the entry is linked.
- **Records vanished after logout** — **Delete tracking records on logout** was on. Restore or re-sync.

## Translation and upscaling

- **Translation unavailable** — 3 GB RAM, supported ABI, models installed or a provider configured. The status row names the missing piece.
- **Blank or half-translated page** — OCR found nothing; install the PaddleOCR add-on for Latin scripts.
- **Upscaling does nothing** — check the global switch, per-entry toggle and category default, in that order.
- **Everything falls back to resample** — no model installed or the backend is unavailable. Check live status.

## Background work and notifications

- **Updates stop when the app is closed** — Android battery optimization. Use **Settings → Advanced → Disable battery optimization**, and check the manufacturer's extra restrictions.
- **No notifications** — grant the notification permission; check that the channel is not blocked.
- **Backups do not run** — auto backups require battery not low and a valid storage location.

## Performance and battery

- Lower the reader cache and preload counts.
- Disable ArtCNN and page transitions.
- Turn off cover-based dynamic colour if the library scroll stutters.
- Use **Fast rendering** on weak tablets.
- The reader already backs off memory polling when the screen is off and only requests the top refresh rate while something moves; if battery drain persists, capture a log and report the device.

## Reporting a bug

Include:

1. App version and build number (About).
2. Device, Android version and ABI (the version row copies this block).
3. Steps to reproduce, with the source and entry if relevant.
4. Whether it happens on a fresh library or only yours.
5. A log dump from **Dump crash logs**.

Open the issue on [GitHub](https://github.com/PineappleTwilight/hyoukan/issues). For extension bugs, use the extension's own repository — the app cannot fix a source it does not own.
