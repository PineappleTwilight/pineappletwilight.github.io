---
title: Library & categories
description: Organise a library of thousands with categories, smart shelves and per-category rules.
---

The **Library** tab is the app's home. It is a view over one SQLite database of entries, chapters, categories, history and tracking records — not a folder of files. Everything you see here survives restarts and travels through backups.

## The five tabs

| Tab | Purpose |
|---|---|
| **Library** | Your saved entries, grouped by category or source |
| **Updates** | Newly fetched chapters across the library |
| **History** | What you have read, newest first |
| **Browse** | Sources, extensions, global search, migration and the feed |
| **More** | Downloads, statistics, settings, about |

The Updates and History tabs can be hidden from **Settings → Appearance → Navbar**; the More tab keeps fallback rows for them.

## Adding and removing entries

- **Add** from a source's browse screen, a search result, global search, or a URL import.
- On adding, Hyoukan can optionally fetch the entry's metadata and chapter list immediately (**Settings → Library → Fetch metadata/chapters when adding**).
- **Remove** from the entry's menu. Removing from the library does not delete downloaded chapters; clean those up under **Data and storage → Downloaded and cached content**.

An entry is identified by its **source + URL**, so the same series from two sources is two entries until you merge them.

### Importing another service's library

**Settings → Data and storage → Library imports → Import a library export** turns a MangaBaka JSON export into library entries. Nothing is added automatically: each export entry is a shell that you match to a source one at a time, carrying over read progress, notes and tracking where applicable. Sessions survive a restart. See [Library imports](/hyoukan/guide/library-imports/) for the flow; this is not the same as restoring a [backup](/hyoukan/guide/backup-sync/).

## Finding things

The library search field understands a small query language:

| Syntax | Meaning |
|---|---|
| `word` | Match title (and indexed fields) |
| `"exact phrase"` | Keep the phrase together |
| `-word` or `NOT word` | Exclude |
| `word1 AND word2`, `word1 OR word2` | Boolean separators; lowercase `and`/`or` stay literal text |
| `$word` | Exact term |
| `title:`, `author:`, `artist:` | Field filters |
| `tag:` / `tags:`, `genre:` | Tag filters |
| `source:`, `id:` / `src:` | Source filters |
| `status:`, `tracker:` | Tracking filters |
| `desc:` / `description:`, `uploader:` | Description and uploader |
| `category:` / `cat:`, `subcategory:` / `sub:` | Category and subcategory |
| `artist:`, `character:`, `female:`, `male:`, `group:`, `parody:`, `language:`, `reclass:` | E-Hentai metadata namespaces |

**Advanced search (colons)** is a setting. When it is off, colons are ordinary text so titles like *Re:Zero* search normally.

> [!TIP]
>
> Search is applied within the current category and grouping. Clearing the field restores the full shelf.

## Sorting, display and grouping

**Sort types:** alphabetical (article-aware — "A Sign of Affection" sorts under S), last read, last update, unread count, total chapters, latest chapter, chapter fetch date, date added, tracker mean score, tag list and random.

**Display modes:** grid, compact grid, list, staggered grid and panorama cover flow. Covers can be shown in landscape, aligned to the top, with or without a loading spinner.

**Grouping:** by category, by source, by track status, or ungrouped. The choice is per library view and can be overridden per category.

**Badges:** unread counts, source and language badges, download state and content warnings are all toggleable.

## Categories and subcategories

Categories are the library's primary organisation. Open **More → Categories** or **Settings → Library → Edit categories**.

- Create, rename, reorder and delete categories.
- A category can contain **subcategories**, nested to any depth.
- **Folder layout** renders subcategories as home-screen-style folders inside their category; entries not in a subcategory stay alongside them.
- The virtual **All** subcategory can be hidden per category.
- The default category for new entries is configurable.
- **Per-category sort** can differ from the global sort.
- **Category-scoped refresh** updates only one shelf without touching the rest.
- **Orphan cleanup** removes categories with no entries when you ask for it.
- Categories and their hierarchy are included in backups and sync.

An entry can live in several categories at once. A category is a label, not a folder on disk.

### Per-category reader settings

A category can pin a reading mode and orientation for everything on that shelf — useful for a webtoon-only or manga-only collection. The resolution order is **entry override → first matching category → global default**.

### Per-category update schedules

Each category can set its own library-update interval, from daily to monthly. The shortest interval among the categories an entry belongs to wins. A category with no schedule follows the global one; a **subcategory** with no schedule of its own inherits its parent's interval, while one with a schedule keeps it. Deleting or moving a category falls back to the parent or global interval instead of silently stopping updates. Inheritance is on the current `master` build, not in stable 1.25.3.

## Smart categories

A smart category is bound to a tracker status. When an entry's status changes on a tracker — or when you finish the first chapter of something in *Wish to read* — it moves to the matching category automatically.

- Only categories you explicitly bind are touched.
- The binding is one-way and idempotent: an entry can be in several categories, and smart categories never remove it from unrelated ones.
- Categories without a binding are never modified.

This is how a "Reading", "Completed" or "On hold" shelf stays current without manual dragging.

## Library updates

**Settings → Library → Global update** controls the scheduled refresh.

| Setting | Effect |
|---|---|
| Automatic updates | Off, every 12 hours, daily, every 2/3 days, weekly |
| Device restrictions | Wi-Fi only, unmetered only, charging only, battery not low |
| Launch behaviour | Always run a global update, or only for ungrouped entries while categories update themselves |
| Refresh metadata | Re-fetch cover and details during an update |
| Subcategory scope | Refresh the entire category or only the selected subcategory |
| Skip rules | Skip entries with unread chapters, unstarted entries, or completed entries |
| Smart update | Predict the next release date from the entry's release calendar instead of counting days |
| Progress banner | Show or hide the updating banner |
| Unread badge | Show the unread count on the Updates icon |

**Smart update** understands fixed weekdays, days of the month, twice-monthly and batch-release patterns, and keeps counting from a missed release instead of resetting. Excluded scanlators do not skew the estimate.

**Excluded scanlators** are configured per entry from the chapter list. If every chapter of a series comes from an excluded group, that series is skipped during updates.

Failed updates are collected in **More → Library update errors**, with the failing source, message and entry context. HTTP 401/404 are recorded as extension errors; Cloudflare challenges and rate limits are logged but not treated as failures.

## The entry screen

Tapping an entry opens its details page. From here you can:

- **Read** — continue from the last chapter, or open a specific chapter.
- **Track** — link the entry to one or more trackers and set status, score, progress and dates.
- **Download** — queue chapters, or manage the downloaded ones.
- **Edit** — change the title, author, artist, description, tags, status and cover; edits are stored in `custom_manga_info` and survive source refreshes.
- **Notes** — keep private notes per entry.
- **Related** — see sequel/prequel relations from trackers, with a MangaDex fallback.
- **Recommendations** — similar series from AniList, MAL, MangaUpdates and ComicK.
- **Merge / Migrate** — combine or move the entry to another source.
- **Palette** — inspect the cover's colour palette.
- **Share** — share the entry or its cover.
- **Refresh** — re-fetch details and chapters without a full library update.
- **Incognito** — read this entry without recording history.

The chapter list below the details is the main working surface: filters, sorting, download state, bookmark colours, scanlator priority and read/unread actions all live there.

## Duplicates, merge and migration

- **Find duplicates** (More → Duplicates) lists every entry with more than one copy, with side-by-side opening and a jump to migration.
- **Merge** combines several source entries into one library entry. Chapters from all sources appear together; the merged entry keeps a synthetic source id internally so views and backups stay consistent.
- **Migrate** moves entries to another source, individually or in bulk. Migration can compare chapter counts, search the target source, and preserve categories, tracking and read state.

Merged entries are excluded from orphaned-download cleanup so their files are never deleted by accident.

## Covers and presentation

- **Custom covers:** pick an image, crop or fit, then nudge and zoom. Covers can be included in backups.
- **Cover cache retention:** how long a removed entry's cover is kept before it is deleted.
- **Panorama cover flow:** a large cover view for landscape and wide images.
- **Censor lewd manga:** blur thumbnails and redact titles, tags and descriptions in the library, catalogue and details. It is a display filter, not an access control.
- **Relative timestamps and date format:** configure how dates appear.
- **Images in descriptions:** render remote images inside entry descriptions, or show text only.

## The Feed

The **Feed** tab (Browse → Feed) shows the latest entries and saved searches from several sources in one stream. It can be hidden, moved to the front of Browse, and filtered to hide entries already in the library. Feed sources are saved searches, so a feed is built from searches you already trust.

## History and statistics

- **History** tracks every chapter opened, with the entry, chapter, timestamp and progress. Entries can be removed from history without removing them from the library.
- **Statistics** shows library counts and reading totals, with a square or book-style cover presentation.
- Non-library history is cleaned from **Settings → Advanced → Clear database**, which can keep entries that have read chapters.

## Local content in the library

The local source presents folders as entries:

```
Hyoukan/local/
  Series Name/
    cover.jpg
    details.json          (optional metadata)
    ComicInfo.xml         (optional metadata)
    Chapter 1/
      001.jpg
      002.jpg
    Chapter 2.cbz
  A Novel/
    Book.epub
    Story.fb2
    Notes.txt
```

A folder containing only book files (EPUB, FB2 or TXT) is treated as a **book** series; a mixed folder is treated as a comic. FB2/TXT support is on the current `master` build, not in stable 1.25.3. You can override the entry type per entry ("Render as book" / "Render as comic") and the choice survives library updates. See [Files & formats](/hyoukan/reference/formats/) for the metadata fields.

## What to do next

- [Put your library on autopilot](/hyoukan/tutorials/library-autopilot/) — scheduled updates, auto-download, cleanup and tracker sync.
- [Sources & extensions](/hyoukan/guide/sources/) — where the entries come from.
- [Reading comics](/hyoukan/guide/comics/) and [Reading books](/hyoukan/guide/books/) — the two readers.
- [Backup & sync](/hyoukan/guide/backup-sync/) — keep the library safe.
- [Library imports](/hyoukan/guide/library-imports/) — bring in an export from another service.
