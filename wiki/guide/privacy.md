---
title: Privacy & security
description: App lock, secure screen, incognito, encrypted databases and archives, and what leaves the device.
---

Hyoukan is local-first by default. It has no account, no advertising ID and no telemetry in the official release build. The privacy controls that do exist are about other people who can pick up your phone, and about the data you choose to send to services.

## App lock

**Settings → Security → Require unlock.**

| Option | Behaviour |
|---|---|
| **Never** | No lock |
| **Always** | Ask every time the app comes to the foreground |
| **Lock when idle** | Ask after the app has been in the background for the configured time |

The lock uses the device's biometric or credential prompt. Additional controls:

- **Lock times** — choose the days and time ranges when the lock applies (for example, only at night).
- **Biometric lock days** — the same schedule expressed as days.
- **Hide notification content** — remove entry and chapter titles from notifications on the lock screen.

The lock protects the app's UI. It does not encrypt the database; someone with root access or a full device backup can still read the files. See **Database encryption** below.

## Secure screen

**Settings → Security → Secure screen.**

| Mode | Effect |
|---|---|
| **Always** | Hide app contents in the recents thumbnail and block screenshots everywhere |
| **Incognito** | Apply the same protection only while incognito mode is on |
| **Never** | Allow screenshots and recents previews |

Secure screen is implemented with Android's `FLAG_SECURE`. It prevents screenshots and screen recording of the app, and blanks the recents card. It cannot stop a camera pointed at the screen.

## Incognito mode

**More → Incognito** (also available as a reader setting) stops the app from writing:

- history rows;
- reading progress;
- chapter read state;
- tracker progress updates.

The current session still works; the position is held in memory. Incognito is a privacy mode for a session, not an access control, and turning it off does not retroactively record what you read.

Some features intentionally keep working: downloads, translation and upscaling do not depend on history. Notifications and Discord presence can be configured to respect incognito.

## Database encryption

**Settings → Advanced → Developer tools → Encrypt database.**

The database can be encrypted with SQLCipher. This is a destructive migration, not a toggle:

1. Create a backup.
2. Clear the app's data in Android settings.
3. Open the app and enable **Encrypt database**.
4. Force-restart the app.
5. Restore the backup.

The screen spells these steps out because enabling encryption on an existing database would otherwise create a new, empty database and strand the old file. The password is stored in the app's encrypted preference store; losing it means losing the database.

Encryption protects the database file at rest. It does not encrypt downloaded images, logs or backups.

## Encrypted downloads and archives

**Settings → Security → Password protect downloads** encrypts downloaded CBZ archives.

| Setting | Options |
|---|---|
| **Encryption type** | AES-256, AES-128 or standard ZipCrypto |
| **Set CBZ archive password** | The password used for new archives |
| **Delete CBZ archive password** | Remove the stored password |

Keys live in the Android KeyStore. Standard ZIP encryption is the most compatible and the least secure; AES-256 is the strongest.

> [!WARNING]
>
> If you forget the archive password, the data inside the archives is unrecoverable. There is no recovery key.

Password protection applies to archives written after it is enabled. Existing downloads are not re-encrypted.

## What leaves the device

| Destination | What is sent | When |
|---|---|---|
| **Sources / extensions** | Requests to the sites you browse, with the app's cookies and user agent | Whenever you browse or read online |
| **Trackers** | Progress, scores, statuses and the account token | When you track an entry or auto-sync |
| **Cloud LLM** | Page image or extracted text, depending on the provider | Only if you select a cloud provider |
| **Ichigo image service** | Page image and a device fingerprint | Only if you use it |
| **SyncYomi / WebDAV / Drive** | The sync payload you configure | On sync |
| **Discord** | Presence and, if enabled, a webhook payload | Only if enabled |
| **Webhooks** | The configured event payload | Only for enabled events |
| **FlareSolverr** | The challenge request | Only when enabled and needed |
| **Crashlytics** | Crash reports | Only in builds compiled with telemetry |

There is no analytics SDK in the standard release. Logs stay in app-private storage until you share them.

**Source health diagnostics** records failure counts in app-private preferences and never uploads them. The only way those records leave the device is the redacted report you choose to share; it carries source names and statuses, not library titles, URLs or reading history.

## Permissions

Hyoukan requests permissions only for features you use:

- **Notifications** — download, backup, update and library-update progress.
- **Install and delete packages** — extension installation and removal (the Private installer still needs no install permission).
- **Query all packages** — to list installed extensions on Android 11+.
- **Storage** — `MANAGE_EXTERNAL_STORAGE` for the download/local-source tree, media-image read for custom covers, and legacy read/write on older Android versions.
- **Network and Wi-Fi state** — update and download restrictions.
- **Boot completed / wake lock / foreground service** — reliable background updates and downloads.
- **Battery optimization exemption** — optional, for reliable background work.
- **Biometric / device credential** — app lock, provided by the platform.
- **Camera** — only for the QR scanner beside the SyncYomi API-key field. The permission is declared by the bundled ZXing barcode library, and Android asks for it the first time you open the scanner; the rest of the app never opens the camera. It is optional hardware, so the app still installs on devices without a camera.

It does not request contacts, location or microphone access.

## Backups and sync are sensitive

A `.tachibk` backup with **Source settings** or **Private settings** contains logins and cookies. Sync payloads can contain the same. Treat both as credentials:

- Store backups somewhere you control.
- Turn off private settings in backups if you do not need them.
- Remember that a sync host can read the payload; the app does not encrypt it end-to-end.
- Delete old backups when you no longer need them.

## Data locations

| Data | Location |
|---|---|
| Database | App-private `databases/tachiyomi.db` (or encrypted equivalent) |
| Rolling DB backups | App-private `files/database_backup/` |
| Preferences | App-private SharedPreferences |
| Downloads | The chosen storage location |
| Covers / image cache | App-private cache |
| Logs | App-private log folder |
| Translation / upscale caches | App-private cache |

Clearing app data removes all of it, including the database. Take a backup first.

## A realistic threat model

Hyoukan protects against:

- someone picking up an unlocked phone and opening the app (app lock);
- screenshots and recents previews (secure screen);
- casual inspection of the database file (SQLCipher, if enabled);
- accidental history leaks (incognito).

It does not protect against:

- a rooted or compromised device;
- a malicious extension with the app's permissions;
- a cloud or sync provider reading your data;
- a backup file you shared or stored insecurely;
- forensic extraction of an unlocked device.

Choose the controls that match your threat model, and do not treat any single switch as a guarantee.
