---
title: Tracking
description: Connect MyAnimeList, AniList, MangaBaka and ten more services, and keep progress in sync.
---

Tracking connects a library entry to a record on an external service. Hyoukan keeps thirteen tracker integrations, including four "enhanced" trackers that discover a server automatically.

## Supported services

| Service | Login | Notes |
|---|---|---|
| **MyAnimeList** | OAuth | Manga list, score, status, rereads |
| **AniList** | OAuth | Manga list, score, progress, relations |
| **Kitsu** | Credentials | Manga list and progress |
| **MangaUpdates** | Credentials | Reading list and score |
| **Shikimori** | OAuth | Russian manga database |
| **Bangumi** | OAuth | Chinese anime/manga database |
| **Anime-Planet** | WebView cookie | Search and progress |
| **ComicK** | Credentials | Official API, rebuilt from scratch |
| **MangaBaka** | Credentials | Full progress sync, including total chapter count |
| **Hikka** | Credentials | Ukrainian anime/manga tracker |
| **Kavita** | Enhanced | Auto-discovered, no credential dialog |
| **Komga** | Enhanced | Auto-discovered, also used for book progress |
| **Suwayomi** | Enhanced | Auto-discovered |

Each service has its own capabilities: reading dates, score, reread count, status, priority. Capabilities are registry-level facts, not user toggles.

## Connecting a service

1. **More → Settings → Tracking**.
2. Choose a service and log in using its auth mode:
   - **OAuth** opens the service's authorisation page in a browser or WebView and stores the token.
   - **Credentials** asks for the username and password (or API key) the service requires.
   - **WebView cookie** opens the site's login page and captures the session cookie.
   - **Enhanced** services need no login dialog; they are discovered from their server.
3. Return to the list; the row shows "Logged in".

Tokens are stored in the tracking preference store. A tracker can be logged out without deleting its records, or with them, depending on **Delete tracking records on logout**.

## Tracking an entry

From an entry's details page, open the tracking sheet and choose a service. Search for the matching record, then set:

- **Status** — reading, completed, on hold, dropped, plan to read.
- **Score** — the service's scale.
- **Chapter progress**.
- **Reading dates** — start and finish, where supported.
- **Reread count** — where supported.

The entry then shows the tracker's status and score, and updates flow both ways according to the settings below.

## Automatic behaviour

**Settings → Tracking:**

| Setting | Effect |
|---|---|
| **Open track menu on adding to library** | Prompt for a tracker when a new entry is added |
| **Update progress after reading** | Push the chapter number to trackers as you read |
| **Update progress when marked as read** | Push when you mark a chapter read manually |
| **Auto sync progress from trackers** | Pull progress changes made on the service |
| **Delete tracking records on logout** | Wipe scores and statuses on logout; off keeps them for a future re-login |
| **Select entries using source metadata** | Auto-match on a source's tracker links (MangaDex-style) |

Progress updates are rate-limited and retried. A tracker that is offline does not block reading; the update is queued and applied later.

## Enhanced trackers

Kavita, Komga and Suwayomi are **enhanced trackers**. They are recognised from the source/server rather than configured with a username and password:

- They appear only when the corresponding source is available.
- Entries are tracked automatically when added to the library.
- **Komga** also carries book reading progress, so a novel read in Hyoukan is marked read on the server.
- Enhanced trackers can be hidden per entry and are included in the tracking sheet like any other service.

## Relations and recommendations

Trackers that expose relations give the entry page **sequel and prequel cards**:

- AniList and MangaBaka relations are read from the tracker.
- MangaDex can fall back for missing relations when its extension is installed.
- Web novels route to the browser instead of the reader.
- Recommendations come from AniList, MyAnimeList (Jikan), MangaUpdates and ComicK, ranked by frequency across the library.

The related-mangas row has its own display settings (expanded by default, in overflow, Home button visibility).

## Definitive tracker source

An entry can be in several categories. When a series needs one canonical tracker record, set a **definitive tracker** for the entry or its category. The choice is used for status updates and smart-category moves, avoiding a tug-of-war between services.

## Rereads

Rereading is tracked explicitly:

- Start a reread from the entry's menu.
- Reread counts are stored per entry and pushed to trackers that support them.
- A reread starts progress from the beginning without marking the series unread.
- Achievements can be earned for rereads (see [Achievements](/hyoukan/guide/achievements/)).

## Smart categories and tracking

A category bound to a tracker status becomes a **smart category**:

- Finish chapter 1 and the entry leaves *Wish to read* for *Reading*.
- Complete the last chapter and it moves to *Completed*.
- Only explicitly bound categories are touched.

This works with any tracker that reports status, and is the easiest way to keep a shelf current without manual dragging.

## Troubleshooting

- **Login fails** — check the service's status page, then try the other auth mode. MyAnimeList accepts the app's own redirect schemes; Anime-Planet now waits out its Cloudflare check.
- **Progress does not update** — check **Update progress after reading**, and whether the entry is linked to that tracker. A tracker that is rate-limited will retry later.
- **Duplicate records** — use the tracker's own search to pick the correct record; the app does not merge records on the service.
- **A tracker disappeared** — enhanced trackers require their source; standard trackers require a login. Re-authenticate.
- **Scores or statuses vanished after logout** — **Delete tracking records on logout** was on. Restore from a backup or re-sync from the service.
