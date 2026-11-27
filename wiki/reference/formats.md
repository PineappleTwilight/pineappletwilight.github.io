---
title: Files & formats
description: Backup schema, local-source layout, extension indexes, download trees and the formats the decoder accepts.
---

## Backups (`.tachibk`)

A backup is a protobuf stream. The top-level `Backup` message carries:

| Field | Contents |
|---|---|
| `backupManga` | Library and read entries |
| `backupCategories` | Categories, including parent ids |
| `backupHistory` | History rows |
| `backupPreferences` | Typed preference values |
| `backupExtensionStores` | Repository URLs |
| `backupSavedSearches` | Saved source searches |
| `backupFeedSavedSearches` | Feed definitions |
| `backupMergedMangaReferences` | Merge relationships |
| `backupCustomMangaInfo` | User-edited metadata |
| `backupSearchMetadata`, `backupSearchTags`, `backupSearchTitles` | E-Hentai caches |
| `backupFavorites` | E-Hentai favourites |
| `date`, `version`, counts | Metadata |

A `BackupManga` contains the entry's URL, title, cover, metadata, chapters, tracking rows, history, categories, custom cover bytes and merge references. A `BackupChapter` contains the URL, name, scanlator, read/bookmark state, last page and date.

The format is intentionally stable: old and new backups are both readable because the reader walks the protobuf by field length rather than materialising it.

> [!WARNING]
>
> A backup is not a database file. Do not rename a `.tachibk` to `.db`, and do not try to open it with SQLite.

## Local source

The local source reads a folder you choose. Each immediate subfolder is an entry; each file or subfolder inside it is a chapter.

```
Local source root/
  Series Name/
    cover.jpg                 # optional cover
    details.json              # optional metadata
    ComicInfo.xml             # optional ComicInfo metadata
    Chapter 1/
      001.jpg
      002.png
    Chapter 2.cbz
    Chapter 3/                # a folder is a chapter too
  Novel Series/
    Book 1.epub
    Book 2.epub
  Plain books/
    Story.fb2
    Notes.txt
```

Rules:

- Supported image files become pages, sorted naturally by name.
- `cover.jpg`, `cover.png`, `cover.webp` are recognised as the cover.
- `details.json` is read when present.
- `ComicInfo.xml` is read for title, series, volume, summary, writer, artist and publishing status.
- Hidden folders are ignored unless the setting is enabled.
- A folder whose chapters are **all** books (`.epub`, `.fb2`, `.txt`) is a book series; a mixed folder is a comic.
- An EPUB can also be read as an image chapter if the entry is explicitly set to comic.
- A single `.epub`, `.fb2` or `.txt` file can stand as its own local-source entry. Files imported through **Settings → Book reading → Import books** are copied into one new local-source folder and matched by file name, case-insensitively; the MIME type is ignored.

### `details.json`

```json
{
  "title": "Series Name",
  "author": "Author Name",
  "artist": "Artist Name",
  "description": "A short description.",
  "genre": ["Action", "Adventure"],
  "status": "Ongoing",
  "thumbnailUrl": "https://example.com/cover.jpg"
}
```

`status` accepts `Ongoing`, `Completed`, `Licensed`, `Publishing finished`, `Cancelled` or `On hiatus`.

### `ComicInfo.xml`

ComicInfo is the ComicRack schema. Hyoukan reads the common fields (`Title`, `Series`, `Number`, `Volume`, `Summary`, `Writer`, `Penciller`, `Publisher`, `PublishingStatus`, `Year`, `Month`, `Day`, `Genre`, `Tags`). It is also written into encrypted archives with random padding as an anti-fingerprint measure.

### FB2 and TXT conversion

FB2 is parsed as XML: each leaf `<section>` becomes a reader section, with `<title>` as its heading. Emphasis, strong, strikethrough, sub/superscript, code, citation, epigraphs, annotations and `<v>` verse lines map to HTML with inline CSS; images are not inlined and only `http(s)` links are kept. Encoding is taken from a byte-order mark or an `encoding="…"` declaration, falling back to UTF-8.

TXT is normalised to line feeds, split into paragraphs on blank lines (single newlines become `<br/>`), escaped, and packed into sections of at most 12,000 characters, preferring paragraph boundaries and falling back to sentence or hard cuts inside an over-long paragraph.

Both conversions run entirely on the device. Parsed sections are cached per chapter and files over 64 MiB are refused. **Search in chapter** uses a case-insensitive literal index with context snippets. FB2/TXT files keep the generated placeholder cover.

> [!NOTE]
>
> FB2 and TXT support is on the current `master` build, not in the stable 1.25.3 release. The **Import books** strings still say "EPUB" even though the picker accepts all three formats.

## Downloads

Downloads live under the chosen storage location:

```
<storage>/<source name>/<entry title>/
  <chapter name>/
    001.jpg
    002.jpg
  <chapter name>.cbz
  book.epub                 # a downloaded book chapter
```

- `CBZ` output is optional.
- **Include chapter URL hash** appends the first six characters of the chapter URL's MD5 to the chapter folder or file name.
- **Disallow non-ASCII filenames** affects source and entry folder names; chapter files are not renamed.
- A book chapter stores the source EPUB as `book.epub`; it is never wrapped in a CBZ.

## Supported archives

| Format | Reading | Writing |
|---|---|---|
| ZIP / CBZ | Yes | Yes |
| RAR / CBR | Yes | No |
| 7z | Yes | No |
| EPUB | Yes (book or comic) | No |
| Encrypted CBZ | AES-256, AES-128, ZipCrypto | AES-256, AES-128, ZipCrypto |

Archive reading uses libarchive through JNI with memory-mapped files.

## Supported image formats

The libvips decoder handles:

**JPEG · PNG · WebP · GIF · AVIF · HEIF · JPEG XL (JXL) · JPEG 2000 (JP2) · TIFF**

Animated GIF, animated WebP and animated HEIF are recognised as animated where the platform supports them. HDR variants (PQ, HLG, UltraHDR) are supported by the WebGPU reader; the legacy viewer tone-maps or clamps them.

Crop borders are applied after decode; the decoder itself has no native trim.

## EPUB expectations

Hyoukan reads:

- EPUB 2 with `toc.ncx`;
- EPUB 3 with `nav.xhtml` (only a nav marked `epub:type="toc"`);
- OPF metadata in any namespace binding;
- `encryption.xml` for DRM and font obfuscation;
- percent-encoded and non-ASCII file names;
- charset declarations from the XML prolog;
- Calibre and EPUB 3 series metadata.

It does **not** read:

- DRM-protected content (it reports the book as locked);
- resources hosted outside the archive;
- EPUBs with a spine entry missing from the manifest (that entry is dropped).

## Extension repository index

A repository publishes a JSON index. The modern format is an array:

```json
[
  {
    "name": "Example",
    "pkg": "eu.kanade.tachiyomi.extension.en.example",
    "apk": "example-v1.4.2.apk",
    "lang": "en",
    "code": 14,
    "version": "1.4.2",
    "nsfw": 0
  }
]
```

The app also accepts a legacy format with a store object (`name`, `website`, `signingKey`, `contact`) and a separate extension list. The store base URL resolves `apk/<file>` and `icon/<package>.png`.

The signing key is the trust anchor: the Private installer verifies the downloaded APK against it before storing. Remote store indexes and extension lists are capped at **16 MiB**; a larger response is refused with a clear error before it is buffered.

## Sync payload

SyncYomi, WebDAV and Google Drive carry the same protobuf payload as a backup, with sync-specific settings:

- custom covers off by default;
- tombstones for deleted categories/chapters in v2;
- a cursor and last-pushed timestamp in preferences;
- per-class inclusion flags.

The payload is not encrypted by the app. Use a host you trust.

## Logs and diagnostics

| Artifact | Where |
|---|---|
| App logcat ring | In memory; browsable from **View logs** |
| Crash files | App-private log folder |
| Log dumps | Written on demand by **Dump crash logs** |
| Database rolling backups | App-private `files/database_backup/tachiyomi-*.db` (max 3) |
| Quarantined databases | `tachiyomi.db.corrupt-<timestamp>` |
| Backup schema | Debug menu → Backup schema |

Log files include the app version, build time, device info and, at higher log levels, request/response headers.

## Storage paths at a glance

| Data | Default |
|---|---|
| Database | App-private `databases/tachiyomi.db` |
| Preferences | App-private SharedPreferences |
| Downloads | Chosen storage location |
| Automatic backups | Chosen storage location / automatic-backup folder |
| Covers | App-private cover cache |
| Reader cache | App-private cache |
| Translation / upscale cache | App-private cache |
| Imported fonts | App-private files |
| Imported GGUF / ONNX models | App-private files |
| Library import sessions | App-private `files/library_imports/sessions.json` |
| Novel plugins | App-private `files/novel_plugins/<id>.js` |

Android may clear app-private caches on its own. Downloads and backups in user-chosen storage are not cleared by the system.
