---
title: Build & release
description: Variants, flavours, native submodules, CI workflows, the beta channel and the release-note cycle.
---

Hyoukan is a Gradle Android project with a lot of native code behind optional features. A clean build is not just `assembleDebug`; the flavour, the submodules and the NDK all matter.

## Toolchain

| Tool | Version / note |
|---|---|
| JDK | 21 in CI; the app targets JVM 17 |
| Android SDK | compile 37, target 36, min 26 |
| NDK | r28c for the native builds (see `llamatik-native/BUILD.md`) |
| Gradle | wrapper, configuration cache enabled |
| Kotlin | 2.x |

`local.properties` must contain `sdk.dir`. Never edit or commit it.

## Variants and flavours

### Build types

| Type | Application ID suffix | Notes |
|---|---|---|
| `debug` | `.dev` | Debug signing, unminified |
| `release` | — | Unsigned at build time; CI signs |
| `releaseTest` | `.rt` | Release-like, test channel |
| `foss` | `.foss` | FOSS build |
| `preview` | `.beta` | Minified preview; debug signing |
| `benchmark` | `.benchmark` | Benchmark build |

`preview` and `benchmark` use the **debug signing key**; `release` is unsigned until CI signs it with `r0adkll/sign-android-release`. There is no `signingConfigs` block in `app/build.gradle.kts`.

### Flavours

| Flavour | Module | Suffix | Notes |
|---|---|---|---|
| `mtl` (default) | `:yakuyomi` | — | Full translation engine, llama.cpp runtime |
| `nomtl` | `:yakuyomi-stub` | `.nomtl` | No translation, no telemetry |

The no-MTL build still upscales; the upscale pipeline is not flavour-gated.

## Build flags

From `buildSrc/.../BuildConfig.kt`:

| Flag | Effect |
|---|---|
| `-Pinclude-telemetry` | Include Firebase/Crashlytics |
| `-Penable-updater` | Include the in-app updater |
| `-Pdisable-code-shrink` | Skip R8 |
| `-Pinclude-dependency-info` | Include dependency metadata |
| `-Pmtl.gpuOffload=true` | Vulkan llama.cpp (default on) |
| `-Pmtl.wslNdkDir=...` | Linux NDK for the WSL native build |
| `-Pmtl.wslVulkanHeaders=...` | Staged Vulkan headers |
| `-PmalClientId=...` | Fork-specific MyAnimeList application |
| `-PgoogleDriveRedirect=...` | Fork-specific Drive redirect |

## Commands

```bash
./gradlew spotlessApply                 # format
./gradlew spotlessCheck                 # required by CI
./gradlew assembleDebug                 # quick compile + APK
./gradlew assemblePreview               # minified preview (CI default)
./gradlew assemblePreview -Pinclude-telemetry -Penable-updater
./gradlew testReleaseUnitTest           # CI unit tests
./gradlew test                          # all modules
./gradlew installDebug                  # device install
./gradlew :data:generateSqlDelightInterface  # after .sq/.sqm changes
```

On a cloud VM, export `ANDROID_HOME` and `JAVA_HOME` first. First builds download around 1 GB of dependencies.

## Submodules

Three external projects are git submodules:

| Submodule | Used for |
|---|---|
| `external/yakuyomi-engine` | Native translation pipeline |
| `external/llamatik` | llama.cpp runtime; **has nested submodules** |
| `external/webgpuviewer-houri` | The WebGPU viewer library (composite build) |

Clone recursively:

```bash
git submodule update --init --recursive
```

**Commit the submodule pointer before the superproject commit.** A commit that references an unpushed submodule commit makes fresh clones and CI fail with `upload-pack: not our ref`.

When removing a submodule, also unset its `submodule.<name>.*` entries in `.git/config`; worktrees share that config.

### Native builds on Windows

`llamatik-native` has no MSYS2 fallback. A Windows host must use WSL:

1. `wsl -e bash llamatik-native/wsl-setup.sh`
2. Build with the default `wslNativeBuild` task.
3. Wipe `.cxx` + configuration cache after changing CMake or `-Pmtl.*` properties:

```bash
llamatik-native/wipe-cache.sh
```

The WSL task is never up-to-date; ninja provides incrementality inside it.

## CI workflows

Ten workflows in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|---|---|---|
| `build_push` | Push to `master` | Format check, both flavours, tests, sign, upload, publish beta, notify Discord |
| `build_pull_request` | PRs | Same checks, path-filtered; ignores Weblate-owned non-base locales |
| `build_preview` | Manual | Tag and publish a preview release |
| `build_release` | Manual / tag | Tag and publish a stable release |
| `build_benchmark` | Manual | Benchmark build |
| `auto_release` | Push to `master` | Tags `v<versionName>`, publishes the release, cuts release notes |
| `sync_extensions` | Schedule/manual | Keeps extension-related metadata in sync |
| `todo_discord` | Schedule | Posts TODO state |
| `delete_merged_branch` | PR close | Cleans merged branches |
| `pr_label` | PR events | Labels PRs |

All actions are SHA-pinned. Every build workflow gates on `spotlessCheck`.

### The beta channel

Every `master` push in `build_push`:

1. Builds `mtl` and `nomtl` preview APKs (minified, `initWith(release)`).
2. Signs them with the debug key.
3. Publishes to `PineappleTwilight/houri-beta` as release `r<commitCount>`.
4. Uploads four MTL ABIs (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) and two no-MTL ABIs (`arm64-v8a`, `armeabi-v7a`).
5. Sends a Discord ping to the beta-testers role, gated on the release actually being published.

The beta repository is a **separate repo**: the default `GITHUB_TOKEN` cannot write there. It needs `BETA_RELEASE_TOKEN` (release write access) and `BETA_DISCORD_WEBHOOK` (a beta-channel webhook). Without the token, the job warns and skips so master stays green.

Asset names retain the legacy `Houri-<abi>-r<count>.apk` shape; the updater matches on the `-<abi>-` segment.

## Release notes

`RELEASE_NOTES.md` is the curated, human-readable staging area for the next release. It is what `auto_release` renders into the GitHub release and the Discord announcement.

### The cycle

1. Append bullets under `### New`, `### Improve` or `### Fix` as work lands.
2. Bump `versionName` in `app/build.gradle.kts` — the notes stay in the file, because CI reads them at that commit.
3. Push. `auto_release` validates the notes **before** creating the tag; an empty file fails the run with nothing tagged.
4. After publishing, the `cut-notes` job archives the notes into `CHANGELOG.md` and resets the file for the next cycle.

Never run `--cut` yourself; the job cuts at the tag and refuses if the notes changed after the tag was made.

### The commands

```bash
python3 .github/scripts/release_notes.py --check    # validate
python3 .github/scripts/release_notes.py --render   # preview the body
python3 .github/scripts/release_notes.py --cut v1.23.0  # CI only
```

Write for someone deciding whether to update: what changed for them, not which files moved.

## Versioning

`versionName` is semantic-ish (`1.25.3`); the preview build appends the commit count (`-<count>`). The beta channel compares against that count, so every master push is a distinct update.

## A local release build

```bash
export ANDROID_HOME=/path/to/sdk
./gradlew spotlessApply spotlessCheck
./gradlew assembleRelease
```

The APK is unsigned. Sign it with `apksigner` using your own key if you are testing a release build; do not publish a build signed with the debug key.

## Build health checklist

- [ ] `spotlessCheck` passes.
- [ ] Both flavours compile.
- [ ] Unit tests pass.
- [ ] Submodule pointers are pushed.
- [ ] Native caches are clean after a CMake change.
- [ ] `RELEASE_NOTES.md` has a user-facing entry for every noticeable change.
- [ ] `versionName` is bumped for a release.
- [ ] No `local.properties` or signing material is staged.
