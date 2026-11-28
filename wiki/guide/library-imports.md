---
title: Library imports
description: Turn another service's library export into Hyoukan entries, matched to sources one at a time.
---

**Library imports** takes an export from another service and lets you rebuild a library from it, one entry at a time. It is on the current `master` build, not in the stable 1.25.3 release.

> [!NOTE]
>
> This is not a backup restore. A `.tachibk` restores Hyoukan's own snapshot verbatim; an import reads another service's export and asks you which source each entry should come from. See [Backup & sync](/hyoukan/guide/backup-sync/).

## Start an import

**More → Settings → Data and storage → Library imports → Import a library export**, then pick the export file. **MangaBaka** is always supported: a `.json` export downloaded from the site, with a file name containing `mangabaka` or `manga_baka`. Both the site's current `schema_version: 2` shape and the older API shape are accepted.

With **Settings → Data and storage → Library interoperability** on, the same flow also offers **Kototoro** (`.bk.zip` Kotatsu-style backups), **Usagi** (`.bk.zip`), and **Aniyomi** (`.tachibk`, gzip-compressed protobuf, including anime entries). Those adapters are hidden while the switch is off, so the picker accepts exactly what it did before. The Kotatsu-compatible archive carries source, URL, cover, author, genres, categories and last-read chapter; tracker accounts and app settings are not transferred. The normal matching rules below still apply. Under **Settings → Data and storage → Library interoperability**, use **Export to Kototoro** or **Export to Usagi** to write a backup that app can restore; exports are named `hyoukan_kototoro.bk.zip` / `hyoukan_usagi.bk.zip`, contain your favourites and categories, and do not include tracker credentials or app settings.

A file that cannot be parsed reports "That file is not a readable library export"; an export with no entries reports "That export has no entries". The screen is titled **Library imports**, and a new import becomes a session named after the file. Picking the same export again continues that session, keeping entries already imported or skipped.

## What a session shows

Each row is a **shell**, not a library entry: it carries metadata from the export but has no chapters and cannot be opened or read. A row shows the cover, title, author, chapter progress against the total, and publication status. Pending rows say "Tap to choose a source"; done rows are dimmed, and imported ones get a check.

- **Skip this entry** sets a row aside; **Move back to pending** restores it.
- Long-press a row to open the original series URL in a browser, if the export contains one.
- **Delete import session** removes the session but keeps entries already added to the library.

Sessions are stored as JSON in app-private `files/library_imports/sessions.json` and survive a restart.

## Match an entry to a source

Tapping a pending entry opens a source search prefilled with the shell's title. Pick a result and a dialog asks what to carry over. Every applicable box is pre-checked:

| Flag | What it carries |
|---|---|
| **Read progress up to chapter ...** | Marks those chapters read on the real entry — only chapters the source recognises and that were still unread |
| **Track with ...** | Creates a local tracking row for a logged-in tracker, with the status, a score from the export rating, and the dates |
| **Note** | Copies the export's note |

Confirm with **Import**. The real entry is fetched with its chapter list and added to the library; nothing from the export is uploaded, and the shell's own metadata does not overwrite what the source returns. You return to the same session list with the row marked **Imported**.

**Fetch chapters in manual search** is off by default in the migration config sheet. Turning it on adds one latest-chapter request per search result.

## What is not imported

- The shell has no chapters; chapter lists come entirely from the chosen source.
- Categories, custom covers, downloads and volume progress are not carried over.
- The shell's artist, tags, description, status and type are for display and search only; the real entry's metadata comes from the source.
- The export rating is used only as the tracking score, not as library metadata.

Nothing enters the library until you choose a source for it.
