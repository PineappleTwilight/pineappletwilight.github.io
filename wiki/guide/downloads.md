---
title: Downloads & storage
description: Offline reading, the download queue, chapter cache retention and reclaiming disk space.
---

Downloads are the difference between a reader that needs the network and one that does not. Hyoukan has two separate offline mechanisms: **downloaded chapters** (explicit, kept until you delete them) and the **chapter cache** (implicit, evictable, used while reading).

## Downloads

Download a chapter from:

- the chapter list (tap the download icon, or select several chapters);
- the entry's details page;
- **More → Download queue** for the live queue.

Downloads run in a foreground worker, survive leaving the app, and persist across a full app close — the queue is restored once the extension sources have finished loading.

### Queue controls

- **Pause / resume** the whole queue.
- **Retry** a failed chapter.
- **Cancel** a chapter or the queue.
- Per-chapter progress in the notification and the queue screen.

### Download settings

**Settings → Downloads:**

| Setting | Effect |
|---|---|
| **Only on Wi-Fi** | Restrict downloads to Wi-Fi |
| **Save as CBZ archive** | Store each chapter as a single `.cbz` instead of a folder of images |
| **Split tall images** | Cut very long pages for reader performance |
| **Concurrent source downloads** | How many entries download at once |
| **Concurrent page downloads** | How many pages download at once |
| **Download threads** | Pages fetched in parallel within a source |
| **Download cache renew interval** | How often the download index is refreshed; manual means you reindex yourself |

### Automatic downloads

| Setting | Effect |
|---|---|
| **Download new chapters** | Automatically download chapters fetched by library updates |
| **Skip downloading duplicate read chapters** | Do not re-download a chapter you have already read elsewhere |
| **Download ahead** | Pre-download the next chapters of what you are reading |
| **Auto download while reading** | Download the current and next chapter as you read — only when both are already partially available |
| **Excluded categories** | Entries in these categories are never auto-downloaded, even if they are also in an included category |

### Deleting after reading

| Setting | Effect |
|---|---|
| **Delete chapters after reading** | Off, after the last read chapter, or the second/third/fourth/fifth to last |
| **After reading automatically delete** | Delete a chapter once it is read |
| **Allow deleting bookmarked chapters** | Whether bookmarks protect a chapter from automatic cleanup |

## Where downloads live

Downloads go under the storage location set in **Settings → Data and storage**:

```
<storage>/<source name>/<entry title>/
  Chapter 1/
    001.jpg
    002.jpg
  Chapter 2.cbz
```

- **Include chapter URL hash** appends the first six characters of the chapter URL's MD5 to the folder or file name. This avoids collisions when two chapters share a title.
- **Disallow non-ASCII filenames** makes downloads compatible with storage that cannot represent Unicode. You then need to rename source and entry folders yourself using lowercase UTF-8 hex escapes; chapter files do not need renaming.
- **Reindex downloads** rebuilds the index after you move files or restore a backup.

> [!NOTE]
>
> The database stores download state, but the files are the source of truth for "what is on disk". Reindex after any external change.

## The chapter cache

While you read, the reader caches pages it has fetched. The cache is not a download: it is evictable, shared with prefetching, and can be cleared without losing anything you deliberately saved.

**Settings → Data and storage:**

| Setting | Effect |
|---|---|
| **Clear chapter cache** | Delete all cached pages now |
| **Clear page preview cache** | Delete page-preview thumbnails |
| **Clear chapter cache on app launch** | Wipe the cache every time the app starts |
| **Chapter cache retention** | Drop cached chapters once unread for 12 hours to 30 days; default off ("until space is needed") |
| **Clear page preview cache** | Page previews used before a page loads |

Cached chapters show a live countdown in the **Downloaded and cached content** screen: "expires in …", "kept until space is needed" or "removed at next sweep". Reading a cached chapter resets its timer.

## Reclaiming space

**Settings → Data and storage → Downloaded and cached content** is the place to look when storage is tight:

- Every download whose entry is **not in the library**, grouped by source, with chapter count and disk size.
- Cached chapters, with age and expiry.
- Per-chapter, per-entry and "delete all shown" actions.
- Entries whose source extension is gone appear as folders rather than entries.
- Merge children are excluded, so a merged entry's files are never listed as orphans.

Two confirmed cleanup actions also exist:

- **Delete downloads not in library** — removes downloaded chapters of entries you have removed.
- **Delete all downloads** — wipes every downloaded chapter on the device. Library entries, bookmarks and reading progress are kept; failed downloads go too.

Neither action deletes your library entries. To remove an entry itself, use the library.

## Storage location

**Settings → Data and storage → Storage location** chooses the root for downloads, automatic backups and the local source. It uses Android's storage access framework, so an SD card or a cloud-provider folder works if the provider implements SAF properly.

- **No storage location set** means downloads cannot start.
- **Invalid location** is reported rather than silently falling back.
- **Storage usage** shows used and free space for the chosen volume.

> [!WARNING]
>
> Changing the storage location does not move existing downloads. Move them with a file manager and then **Reindex downloads**, or re-download.

## Export

The same screen offers:

- **Library List (CSV)** — choose title, author, artist and categories columns, and restrict the export to selected categories.
- **Export database** — write a snapshot of the library database to a file.

The CSV is for spreadsheets; the database export is for debugging and migration, not a replacement for a backup. Use [Create backup](/hyoukan/guide/backup-sync/) for a restorable copy.

## Downloading books

A book chapter (EPUB) downloads as its source file, not as image pages. The downloader writes `book.epub` into the chapter folder, and the reader opens that file offline. A Komga chapter that is really a comic still downloads as pages.

## Troubleshooting

- **A download is stuck at 0%** — check the source in a WebView, then retry. A source that cannot list pages cannot download them.
- **"No pages found" for a book** — the chapter is being treated as an image chapter. Update the app; downloaded books need the downloaded-book loader.
- **Files exist but the app says they are not downloaded** — run **Reindex downloads**.
- **Not enough space** — clear the cache first, then orphaned downloads, then all downloads.
- **Download fails after a restore** — the download index was restored from the backup, but the files were not. Reindex or re-download.
