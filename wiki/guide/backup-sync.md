---
title: Backup & sync
description: Portable .tachibk backups, automatic snapshots, SyncYomi, WebDAV and Google Drive.
---

Hyoukan stores everything in one SQLite database. Keeping that database safe has two parts: **backups** (portable snapshots you own) and **sync** (keeping several devices aligned). They are not substitutes for each other.

> [!NOTE]
>
> Importing another service's export is not a restore. [Library imports](/hyoukan/guide/library-imports/) asks you to match each entry to a source; a `.tachibk` restore writes Hyoukan's own snapshot back.

## Backups

A backup is a `.tachibk` file — a protobuf stream containing the library, chapters, categories, history, tracking and selected settings. It is not a copy of the database file, and it does not contain downloaded pages or extension APKs.

### Creating one

**More → Settings → Data and storage → Create backup.**

| Option | Default | What it includes |
|---|---|---|
| **Library entries** | On | Entries, covers, metadata |
| **Chapters** | On | Chapter lists and read state |
| **Tracking** | On | Tracker links, scores, statuses |
| **History** | On | Reading history |
| **Categories** | On | Categories and their hierarchy |
| **Non-library settings** | On | Read state for entries not in the library |
| **Custom entry info** | On | User-edited metadata |
| **Saved searches & feeds** | On | Saved searches and feed definitions |
| **Custom covers** | On | The actual cover images, not just references |
| **App settings** | On | App preferences |
| **Extension stores** | On | Configured repositories |
| **Source settings** | On | Per-source preferences (logins included) |
| **Private settings** | **Off** | Settings marked `__PRIVATE_`; may include passwords |

A backup can also be **scoped to selected categories**, so you can snapshot one shelf without the rest.

> [!WARNING]
>
> **Backups can contain sensitive data.** With private settings or source settings enabled, they can include stored passwords and cookies. Treat a backup like a password database, not like a screenshot.

### Automatic backups

**Settings → Data and storage → Automatic backup frequency** schedules a backup every 1, 3, 6 or 12 hours, daily, every 2 days or weekly. Automatic backups:

- run only when the battery is not low;
- are written to the automatic-backup folder (or the chosen storage location);
- keep the **four most recent** files; older automatic backups are deleted;
- never run while a restore is in progress.

The screen shows the last automatic backup time.

### Restoring

**Settings → Data and storage → Restore backup.** Pick a file, choose what to restore, and confirm.

Restore options mirror the backup options: library, categories, app settings, extension stores, source settings and saved searches/feeds. A separate **Update library after restore** toggle (on by default) runs a full library refresh once the restore finishes; it is a follow-up action, not backup content, so checking only it restores nothing.

How restore behaves:

- The file is **streamed**. Entries are decoded one at a time and restored in batches, so a large library does not need to fit in memory.
- A block that declares a length over **64 MiB** is refused, so a malformed file cannot demand gigabytes of memory.
- Entries are classified as new, existing or merged and walked twice; merged entries are written after the ordinary chunks.
- Each batch runs in one transaction, falling back to per-entry writes if the batch fails.
- Old Mihon-format backups are readable; entries without an update schedule have one computed from the backup's own chapter list.
- Missing extensions and logged-out trackers are reported before the restore starts.
- The "Restoring backup" banner clears when the restore finishes, not when the follow-up refresh does.

A restore merges into the existing library rather than replacing it wholesale. Entries are matched by source and URL; categories are remapped by id and name.

### Integrity and recovery

The app protects the database on its own:

- A **startup quick check** runs its integrity pragma on the app's own SQLDelight connection, so it reads the same WAL state the app is writing.
- A **rolling local database backup** is refreshed at most once a day; the three most recent are kept.
- If the quick check fails, the latest local backup is restored automatically.
- If no backup can be restored, the corrupt file is **quarantined** (renamed with a `.corrupt-<timestamp>` suffix) instead of crash-looping forever.

This is separate from your `.tachibk` backups and lives in app-private storage. It protects against corruption, not against uninstalling the app.

## Sync

Sync keeps several devices aligned. Configure it under **Settings → Data and storage → Sync**.

| Service | What it needs |
|---|---|
| **Off** | — |
| **SyncYomi** | A host URL and an API key |
| **Google Drive** | A Google sign-in |
| **WebDAV** | Server URL, username, password and a data folder |

### What syncs

The same content classes as a backup, with one important difference: **custom covers are off by default for sync** so the images do not ride on every request. Private settings are on by default for sync in the current configuration; turn them off if you do not want credentials leaving the device.

### Frequency and triggers

- **Synchronization frequency** — every 30 minutes, hourly, every 3/6/12 hours, daily, every 2 days or weekly.
- **Sync triggers** — sync on chapter read, on chapter open, on app start and on app resume. Any combination.
- **Sync now** — run immediately.
- **Show syncing progress banner** — show or hide the banner.
- **Last Synchronization** — the timestamp of the last successful run.

### SyncYomi protocol v2

SyncYomi has two protocols:

- **v1 (default)** — full-library upload/download with an ETag.
- **v2 (opt-in)** — server-side merge and delta sync, with tombstones for deleted categories and chapters. It requires a host running SyncYomi 1.6 or newer.

Enable **Use protocol v2** to opt in. The app probes the host, and a host that does not advertise v2 falls back to the classic path. v2 keeps a cursor and a last-pushed timestamp; a full sync is requested when the server needs one. It also applies remote un-favourites and drops chapters tombstoned on another device.

### WebDAV

Point the app at any WebDAV server and folder. The default folder is `houri` (a legacy name kept for compatibility). The app writes the sync payload as a file and downloads it on the next device. No third-party service is involved beyond your own server.

### Google Drive

Sign in with Google, then sync to the app's Drive folder. **Clear Sync Data from Google Drive** purges the remote payload after a confirmation. The OAuth redirect is a build setting, so a fork can register its own client.

### What sync is not

- It is **not encrypted end-to-end** by the app. Your host can read the payload.
- It is **not a backup**. A bad merge or a deleted library propagates. Keep periodic `.tachibk` backups.
- It does **not** sync downloaded pages or extensions.
- It does **not** resolve every conflict automatically. When two devices change the same entry, the service's merge rules decide; v1 is last-write-wins per payload, v2 merges by version and tombstone.

## Choosing a strategy

| Situation | Recommendation |
|---|---|
| One device | Automatic backups weekly, plus a manual backup before updates |
| Two or three devices | SyncYomi or WebDAV for convenience, plus a weekly backup |
| A very large library | Manual backups scoped to categories; sync v2 if the host supports it |
| Privacy-sensitive library | Local backups only, private settings off, database encryption on |
| Moving to a new phone | Create a full backup, copy it, restore on the new device, then log back into trackers |

## Troubleshooting

- **Restore says the file is invalid** — the file is truncated or not a `.tachibk`. Try another copy; the error screen shows the full parser message.
- **Restore is slow** — expected on a very large library; it is streaming and batched. Do not kill the app mid-restore.
- **Sync uploads but the other device sees nothing** — check the device's last-sync timestamp and whether the host accepts the payload. Run **Sync now** once after updating.
- **Sync skipped most of the library** — older builds required a favorite stamp that restored entries lacked. Run **Sync now** once so the full library uploads.
- **The database was reset after an update** — the startup quick check may have quarantined a corrupt file. Look for `tachiyomi.db.corrupt-*` in app-private storage and restore your latest `.tachibk`.
