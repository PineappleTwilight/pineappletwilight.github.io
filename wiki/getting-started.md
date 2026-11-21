---
title: Getting started
description: Install Hyoukan, add sources, build a library and take your first backup.
---

Hyoukan is distributed as an Android APK. There is no Play Store listing; the project publishes signed builds on GitHub, and the app can update itself from the same channel.

## Requirements

| Requirement | Detail |
|---|---|
| Android | **8.0 (API 26)** or newer |
| Architecture | `arm64-v8a` recommended. `armeabi-v7a`, `x86` and `x86_64` builds also ship |
| Storage | The app is large because of its native libraries; allow a few hundred MB plus whatever you download |
| Network | Needed for online sources, sync and extension installation; local reading works offline |
| Optional | A WebGPU-capable GPU for the high-quality reader; 3 GB+ RAM for AI translation; Vulkan or an NPU for the fastest upscaling |

> [!NOTE]
>
> The **no-MTL** (`nomtl`) build omits the translation engine and the bundled llama.cpp runtime. Reading, downloads, tracking, books and upscaling all still work. Choose it if you want a smaller APK or your device cannot run the translation stack.

## Install

1. Open the [latest release](https://github.com/PineappleTwilight/hyoukan/releases/latest) on the device.
2. Download the APK that matches the device's architecture — most phones want `arm64-v8a`.
3. Open the file. Android will ask you to allow installs from that app or browser; accept, then install.
4. Launch Hyoukan.

If Android blocks the install with "app not installed", the usual causes are a conflicting signature from an older fork, insufficient free space, or a package installer restriction from the manufacturer. Uninstall the older copy **after taking a backup** if you are switching from a differently signed build.

### Stable and beta

| Channel | Source | Notes |
|---|---|---|
| **Stable** | GitHub Releases on `PineappleTwilight/hyoukan` | Tagged versions such as `v1.25.3` |
| **Beta** | The beta repository named by the app's updater (`PineappleTwilight/houri-beta` at the time of writing) | Published from every `master` push as `r<commitCount>`; minified preview builds |

Beta builds have a different application ID, signing key and update channel. Moving from stable to beta (or back) is a one-time manual install; the two can coexist, but they do not share a library database.

The in-app updater is under **More → About → Check for updates**. Update checks use the channel the installed build was compiled for.

## First launch

The onboarding flow covers the essentials and nothing else:

1. **Theme** — light, dark, system, or one of the named colour schemes.
2. **Storage** — choose the folder used for downloads, backups and the local source.
3. **Permissions** — notifications, battery-optimisation exemption and, if you plan to use the legacy installers, install unknown apps.
4. **Guides** — a short tour of where things live.
5. **Achievements** — opt in only after onboarding. Nothing unlocks before you explicitly decide to have them.

After onboarding you land on an empty **Library**.

> [!TIP]
>
> You can re-run the onboarding guide later from **More → Settings → Advanced → Onboarding guide**. It explains the interface without wiping anything.

## Add sources

Hyoukan itself ships with only a few sources:

- **Local source** — folders and archives on your device.
- **E-Hentai / ExHentai** — 36 language-specific source IDs, with login, favourites sync and metadata.
- **Komga** — a built-in client for a self-hosted Komga server.

Everything else comes from **extensions**. To install some:

1. Go to **Browse → Extensions**.
2. Open the store manager (the ⚙ or "Extension stores" row).
3. Add a repository URL — for example the Keiyoushi repository — and confirm.
4. Browse the store, install the extensions you want, and grant the install permission the chosen installer needs.

The **Private installer** is recommended: it needs no install permission and verifies each extension against the repository's signing key. **Shizuku** also works without the per-app install prompt. The legacy and package-installer modes go through Android's normal install UI.

> [!IMPORTANT]
>
> Extensions are third-party software. They can see the sites they connect to and the credentials you enter into them. Install extensions from repositories you trust, and read [Sources & extensions](/hyoukan/guide/sources/) before adding an unknown store.

## Find something to read

- **Browse** a source: **Browse → Sources → (source) → Browse**, then search or page through the catalogue.
- **Global search** searches every enabled source at once from the Browse tab.
- **Add to library** from a series page. Choose categories, and optionally fetch metadata and chapters immediately.
- **Local content**: put folders or archives in the local source directory and refresh **Browse → Sources → Local source**.

Your library is the centre of the app: it aggregates chapters, download state, tracking, reading progress and categories. See [Library & categories](/hyoukan/guide/library/).

## Take a backup now

Before you invest hours in a library, create a backup:

1. **More → Settings → Data and storage → Create backup**.
2. Choose a location and what to include. For a first backup, keep the defaults: library entries, categories, chapters, tracking, history, settings, extension stores, source settings and custom covers.
3. Optionally enable **Automatic backup frequency** (hourly to weekly; the app keeps the four most recent automatic backups).

Backups are `.tachibk` files. They contain your library database and settings, not the downloaded manga pages or the extension APKs themselves. See [Backup & sync](/hyoukan/guide/backup-sync/) for the full contents and restore rules.

> [!WARNING]
>
> Backups can contain sensitive data, including stored passwords for sources and trackers when **Private settings** is enabled. Store them accordingly.

## Updating

- **Stable users** get a notification when a newer tagged release exists. The updater downloads the matching APK and hands it to Android.
- **Beta users** are updated from the beta repository; each `master` push publishes a new `r<number>` release.
- The **About** screen shows the version and build number. Tapping the version copies a full device-info block for bug reports.

Manual updates are always possible: download the APK from GitHub and install it over the existing app. The signing key must match, so only install builds from the same channel.

## Migrating from another reader

Hyoukan reads **Mihon/Komikku/Tachiyomi `.tachibk` backups**:

1. In the old app, create a backup that includes library entries and categories.
2. In Hyoukan, open **More → Settings → Data and storage → Restore backup**.
3. Choose the file and what to restore.
4. Install any missing extensions afterwards, then log back into trackers.

Restore is streaming and resumable; a large library does not need to fit in memory. See [Backup & sync](/hyoukan/guide/backup-sync/#restoring) for the details and the "update library after restore" option.

## Where things live

| Thing | Default location |
|---|---|
| Downloads | The folder chosen under **Settings → Data and storage** (Android asks for one before the first download) |
| Local source | A folder you choose; conventionally `Hyoukan/local` on shared storage |
| Backups | Anywhere you pick, plus the automatic-backup folder |
| Covers and image cache | App-private cache; cleared from **Data and storage** |
| Logs | App-private log folder; browsable from **Settings → Advanced → View logs** |

## Next steps

- [Tutorials](/hyoukan/tutorials/) — guided walkthroughs for translation, upscaling, books and automation.
- [Feature tour](/hyoukan/features/) — everything the app can do, grouped by area.
- [Library & categories](/hyoukan/guide/library/) — make a large collection manageable.
- [Reading comics](/hyoukan/guide/comics/) — get the reader set up properly.
- [Reading books](/hyoukan/guide/books/) — EPUB, web novels and typography.
- [Troubleshooting](/hyoukan/guide/troubleshooting/) — when something does not work.
