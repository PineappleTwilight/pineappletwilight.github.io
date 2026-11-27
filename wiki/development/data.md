---
title: Data & database
description: The SQLDelight schema, migration rules, repository patterns and the streaming backup format.
---

All app state that is not a file lives in one SQLite database. This page covers the schema, the repository layer, the conventions that keep migrations safe, and how backups move that state between devices.

## Schema

SQLDelight sources live in `data/src/main/sqldelight/tachiyomi/`:

- `data/*.sq` — tables and queries.
- `view/*.sq` — views.
- `migrations/*.sqm` — schema migrations, currently through `69.sqm`.

There are **21 tables** and **4 views**.

### Core tables

| Table | Holds |
|---|---|
| `manga` | Library and non-library entries |
| `chapter` | Chapter rows, read state, bookmarks, scanlator |
| `manga_category` | Entry ↔ category join |
| `category` | Categories, flags, order, parent id |
| `history` | Reading history |
| `manga_track` | Tracker links and scores |
| `merged` | Merge references between entries |

### Support tables

| Table | Holds |
|---|---|
| `source` | Known sources and their display data |
| `saved_search` | Saved source searches |
| `feed_saved_search` | Feed definitions |
| `excluded_scanlator` | Per-entry scanlator exclusions |
| `extension_store` | Configured repositories |
| `libraryUpdateError`, `libraryUpdateErrorMessage` | Update failures |
| `custom_manga_info` | User-edited metadata |
| `manga_recommendations` | Cached recommendations |
| `search_metadata`, `search_tags`, `search_titles` | E-Hentai metadata |
| `eh_favorites`, `eh_favorites_alternatives` | E-Hentai favourites |

### Views

| View | Purpose |
|---|---|
| `libraryView` | Entry + aggregated chapter stats + categories, with a `UNION` arm for the merged source |
| `updatesView` | Chapter updates with excluded-scanlator awareness |
| `historyView` | History with max-read tracking and chapter counts |
| `libraryUpdateErrorView` | Errors with entry metadata |

Views are where a schema change most often goes wrong: **SQLDelight does not recreate a view when a table changes.** A migration must drop and recreate the view body verbatim.

## Migration rules

1. Add a new `NN.sqm`; never edit an applied one.
2. Include every view whose body touches a changed column.
3. Run `./gradlew :data:generateSqlDelightInterface` after any `.sq`/`.sqm` change.
4. Add a test or a harness assertion for data-shape changes where possible.
5. Keep preference key strings stable: backups match on raw keys, so renaming a preference needs a `Migration` that rewrites the stored key.

A JSON-encoded column cannot be matched by SQL text comparisons that assume the old encoding. The blacklist is the cautionary tale: `libraryView` and `historyView` kept blacklisted chapters out of the badge and history totals with `instr()` against a `", "`-joined string. When the blacklist moved to JSON, those predicates matched nothing and every blacklisted chapter was counted again. Both views now test both encodings, in all three arms. Any future encoding change needs the same treatment, and the migration must carry the recreated view.

## Repositories

There are 18 repository implementations in `tachiyomi.data.*`, each implementing a domain interface:

- `MangaRepositoryImpl`
- `ChapterRepositoryImpl`
- `CategoryRepositoryImpl`
- `HistoryRepositoryImpl`
- `TrackRepositoryImpl`
- `SourceRepositoryImpl`
- `SavedSearchRepositoryImpl`
- `FeedSavedSearchRepositoryImpl`
- `MangaMergeRepositoryImpl`
- `UpdatesRepositoryImpl`
- `ExtensionStoreRepositoryImpl`
- `LibraryUpdateErrorRepositoryImpl`
- `MangaMetadataRepositoryImpl`
- `FavoritesEntryRepositoryImpl`
- `CustomMangaRepositoryImpl`
- and the smaller supporting repositories

### Common patterns

```kotlin
// One-shot query with a mapper
handler.awaitOne { mangasQueries.getMangaById(id, MangaMapper::mapManga) }

// Reactive query
handler.subscribeToOne { mangasQueries.getMangaById(id, MangaMapper::mapManga) }

// Batched partial update
handler.await(inTransaction = true) {
    updates.forEach { mangasQueries.update(...) }
}
```

- **Coalesce updates** — `SET col = coalesce(:param, col)` for partial DTOs.
- **UPSERT** — `INSERT … ON CONFLICT DO UPDATE`.
- **Sync-aware versioning** — triggers increment `version` only when `is_syncing = 0`.
- **Merged entries** — views `UNION` the synthetic source id `6969`. The library fetches the merged children of a whole page in **one batched query** for filtering, bulk download and bulk delete; one round trip per entry made large libraries of merged titles stall.

### Custom metadata cache

`CustomMangaRepositoryImpl` fronts `custom_manga_info` with a process-wide cache because `Manga` snapshots edits in a `@Transient` initializer. The cache exists to make an edited title/cover/description visible everywhere a snapshot is already held.

## Preferences

Preferences are 100% SharedPreferences — no DataStore. The framework lives in `core:common`:

| Type | Role |
|---|---|
| `PreferenceStore` | Typed getters |
| `Preference<T>` | Reactive value with `get/set/changes()/stateIn()`; self-heals on type mismatch |
| `AndroidPreferenceStore` | Production implementation |
| `InMemoryPreferenceStore` | Tests and previews |
| `SettingKey<T>` | Storage key + default, the single source of truth |
| `SettingHost` / `SettingsRegistry` | Feature key contributions and duplicate detection |

Key prefixes:

- `__PRIVATE_` — excluded from backups unless the user opts in.
- `__APP_STATE_` — internal state, not user-facing.

Source preferences are separate: each `ConfigurableSource` gets its own `source_$id` SharedPreferences file, outside the app store. Do not migrate them into `SettingKey`s; the framework must never assume the default file.

## Backup format

A backup is a **protobuf stream** with a `.tachibk` extension. It is written by `BackupCreator` and read by `BackupReader`/`BackupDecoder`.

### Creation

`BackupCreator` writes:

- metadata (counts, date, app version);
- categories;
- entries, with chapters, tracking, history and optionally custom covers;
- saved searches and feeds;
- extension stores;
- preferences (with `__APP_STATE_` always dropped, `__PRIVATE_` only when opted in).

The file name is `<applicationId>_<date>.tachibk`.

### Restore

The restore path is **streaming**:

- `BackupDecoder.decodeMetadata` walks the entries by length to count them and hands back the stream.
- `decodeEntries(uri, include)` yields one `BackupManga` at a time, skipping rejected entries by length.
- `BackupReader` walks the protobuf by hand. The wire format is unchanged, so old and new backups are readable.
- An entry or metadata block whose declared length exceeds **64 MiB** is refused, so a malformed length field cannot demand gigabytes of memory.
- `decode(uri)` is used only for the integrity check, which needs every entry's trackers; never call it on the restore path.

Entries are classified as **NEW / EXISTING / MERGED** and the file is walked twice to realise the classification. Sorting would mean holding every entry in memory.

`MangaRestorer.restore` takes a list and opens one transaction for the chunk, falling back to entry-by-entry if the batch throws. A large library used to do one transaction per entry — roughly 15,000 commits.

The per-entry fetch-interval recompute reads the **backup's own chapter list**, not the table, because it runs before or independently of the rows just written.

### Preferences in backups

`PreferenceBackupCreator` snapshots `preferenceStore.getAll()` into typed `BackupPreference` values. `PreferenceRestorer` type-switches them back and special-cases:

- category-id remapping;
- `LibraryPreferences` / `DownloadPreferences` category key sets;
- `SourcePreferences.PINNED_SOURCES_PREF_KEY`.

A preference rename needs a migration; the backup matches raw key strings.

### Custom covers

A custom cover is a file in the cover cache, not a column. It is read separately at backup time and carried inside the entry's backup record. Sync keeps custom covers off by default so the bytes do not ride on every request.

## Database maintenance

`DatabaseMaintenanceManager` runs its pragmas on the app's **live SQLDelight `SqlDriver` connection**, before the pool opens. Framework SQLite used to open the same file a second time; under WAL that connection could not share the live `-shm` file and failed with `SQLITE_IOERR_SHMOPEN`, which spammed logcat on every launch and could abort the pass. The driver already selects plaintext or SQLCipher internally, so there is no passphrase path and no `System.loadLibrary("sqlcipher")` call here.

1. **Quick check** (`PRAGMA quick_check(1)`).
2. If OK — refresh the rolling local backup, at most once a day.
3. If corrupt — restore the latest local backup.
4. If that fails — quarantine the database as `tachiyomi.db.corrupt-<timestamp>` instead of crash-looping.

### Exporting a snapshot

`prepareSnapshot()` folds the WAL into the main file with `wal_checkpoint(TRUNCATE)`, falling back to `FULL` when a reader is blocking, and verifies the result. Copying only the main file while the WAL holds recent commits is how an exported database silently loses the newest chapters and categories.

## Sync versioning

Tables that participate in sync carry a `version` column and triggers:

- the version increments on update only when `is_syncing = 0`;
- chapter progress is versioned on the chapter, not the entry;
- an entry's version bumps when its categories change, not when chapters are read.

Protocol v2 adds tombstones for deleted categories and chapters, stored as pending sets in `SyncPreferences` and drained by the next delta request.

## Query and UI conventions

- The library is a view over the database, not a filesystem scan. Adding an entry writes a row; downloading writes files and a download record.
- A non-library entry (from history, search or a deep link) still has a `manga` row; it is simply not a favorite.
- Clearing the database can keep entries that have read chapters; the UI explains exactly what will be lost.

## Testing data changes

- `domain/src/test` covers search parsing, fetch intervals and model logic.
- `scripts/kotlinc-check/run-harness.sh` covers pure mapping and policy where extracted.
- `MigratorTest` in `app/src/test` exercises the migration chain.
- A schema change should come with a migration test and a note in `RELEASE_NOTES.md` if it affects users.

---

Next: [Extensions & source API](/hyoukan/development/extensions/) — the contract that keeps third-party sources working.
