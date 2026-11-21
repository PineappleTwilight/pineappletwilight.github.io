---
title: Connections
description: Discord presence, webhooks, FlareSolverr, DNS-over-HTTPS and the network plumbing behind sources.
---

Hyoukan can talk to more than sources. This page covers the optional services that observe or extend the app, and the network layer they share.

## Discord Rich Presence

**Settings → Connections → Discord.**

Enable **Discord RPC** and sign in to a Discord account. Presence shows what you are reading: the entry title, chapter, cover and progress, depending on the options below.

| Setting | Effect |
|---|---|
| **Discord status** | Online, idle or do-not-disturb |
| **Custom message** | Text shown in the presence |
| **Show progress** | Chapter progress in the presence |
| **Show page progress** | Page-level detail |
| **Show timestamp** | Elapsed reading time |
| **Show buttons** | Link buttons in the card |
| **Download button** | A button that opens the entry |
| **Discord button** | A button that opens the app's Discord |
| **Incognito** | Hide presence while incognito |
| **Excluded categories** | Entries in these categories are never shown |

### Signing in

Two paths:

1. **Embedded WebView login** — the normal OAuth flow.
2. **Log in with a token** — the account menu accepts a raw account token, validates it against Discord and stores it locally. This is the fallback when the WebView login is flagged or fails.

> [!WARNING]
>
> A Discord account token is a credential. Storing it locally is convenient, not risk-free. Use the OAuth flow where possible, and sign out from the Discord accounts screen when you are done.

Multiple accounts are supported; one is active at a time. Deleting an account removes its stored session.

## Webhooks

**Settings → Connections → Webhooks.**

Send app events to a **Discord webhook** or a **generic JSON endpoint**. URLs are stored privately and are included in backups.

### Events

| Event | When |
|---|---|
| **Chapter started** | A chapter is opened |
| **Chapter read** | A chapter is marked read |
| **New manga started** | First chapter of a new entry is read |
| **Manga finished** | The last chapter is marked read |
| **Library update** | A library refresh finishes |
| **Downloads finished** | The download queue drains |
| **Backup created** | A backup completes |
| **Backup restored** | A restore completes |
| **Manga added** | An entry is added to the library |
| **Manga removed** | An entry is removed |
| **Manga migrated** | An entry is migrated to another source |
| **App updated** | The app version changes |
| **Achievement unlocked** | An achievement unlocks |

**Include reading time** adds the session's reading time to the payload.

**Excluded categories** suppresses events for entries in those categories and subcategories.

### Payloads

- **Discord** payloads use Discord's webhook format: an embed with the entry, chapter, cover, progress and optional reading time.
- **Generic** payloads are JSON objects with the event name and the same fields, suitable for Home Assistant, n8n, a personal server or a script.

**Send test notification** validates the URL and shows what a payload looks like.

> [!NOTE]
>
> A webhook URL is a secret. Anyone with it can post to the channel or endpoint. If one leaks, revoke it at the destination.

## FlareSolverr

Some sources sit behind Cloudflare. Hyoukan's built-in WebView solver handles most challenges; FlareSolverr is an optional external service for the rest.

**Settings → Advanced → Networking:**

1. Enable **FlareSolverr**.
2. Set the URL, for example `http://192.168.1.202:8191/v1`.
3. **Test FlareSolverr and update user agent** — verifies the instance and refreshes the user agent string.
4. **Cloudflare bypass banner** — optionally show which host and method are being used while a challenge is being solved.

The instance must share the device's public IP, because Cloudflare binds the clearance cookie to it. If FlareSolverr is unreachable, the app falls back to the built-in solver.

## DNS over HTTPS

**Settings → Advanced → Networking → DNS over HTTPS.**

Twelve providers are available, from Cloudflare and Google to Quad9, AdGuard and others. DoH is applied to the app's OkHttp clients; the local Komga source deliberately uses the system DNS so IP-addressed servers keep working.

A custom **default user agent** can be set, or reset to the current Chrome string. Changing it affects sites that key behaviour on the user agent; a reset is the first thing to try when a source starts behaving differently.

## Cookies and WebView data

- **Clear cookies** — removes the app's HTTP cookie jar.
- **Clear WebView data** — clears the WebView profile used for logins and challenge solving.

Clearing these logs you out of cookie-based sources and trackers. It does not delete your library or downloaded chapters.

## Google Drive

The Google Drive sync service uses OAuth. Sign in from **Settings → Data and storage → Sync → Google Drive**, then choose what to sync. See [Backup & sync](/hyoukan/guide/backup-sync/#google-drive).

Forks can register their own OAuth client with `-PgoogleDriveRedirect=...`; the default keeps existing credentials working.

## SyncYomi and WebDAV

These are library-sync services rather than "connections" in the social sense. Their setup, triggers, protocol v2 and conflict behaviour are covered in [Backup & sync](/hyoukan/guide/backup-sync/#sync).

## Network log levels

**Settings → Advanced → Log level** controls diagnostics:

- **Minimal** (default) — warnings and errors in the in-memory ring; nothing written to disk.
- **Verbose / Extra / Extreme** — progressively more detail, including request and response headers.
- **Extreme** also captures the app's own networking (E-Hentai API, image loads, downloads, sync), not just source fetches.

Higher levels cost performance and storage. Return to Minimal when you are done diagnosing.
