---
title: Architecture
description: How the app is assembled — modules, dependency injection, navigation, package roots and the rules that keep the layers apart.
---

Hyoukan is a large Android application: roughly 2,300 files and 190,000 lines of Kotlin and Java. It is built with Jetpack Compose and Material 3, Navigation 3, Metro dependency injection, SQLDelight and Coil 3. The architecture is a fork of Mihon and TachiyomiSY with a long tail of Komikku-specific work, so the codebase deliberately preserves upstream shapes rather than rewriting them into one uniform style.

## Module graph

```
app ──────────────▶ domain ──────────────▶ source-api
 │                    ▲                       ▲
 │                    │                       │
 ├──▶ data ───────────┘                       │
 ├──▶ presentation-core                       │
 ├──▶ presentation-widget                     │
 ├──▶ core:common ────────────────────────────┘
 ├──▶ core:archive
 ├──▶ core-metadata
 ├──▶ source-local
 ├──▶ mtl-spine ◀── yakuyomi-engine / yakuyomi-stub
 ├──▶ upscale
 ├──▶ llamatik-native
 └──▶ i18n / i18n-kmk / i18n-sy
```

| Module | Purpose |
|---|---|
| `app/` | UI, activities, ViewModels, DI assembly, workers, backup, downloads, tracking, sync, settings screens |
| `domain/` | Interactors, models and repository interfaces — the app's business vocabulary |
| `data/` | SQLDelight schema, migrations and repository implementations |
| `source-api/` | The extension-facing `Source` API, including the text/EPUB interfaces (Kotlin Multiplatform) |
| `source-local/` | The local source: folders, archives and EPUBs |
| `core/common/` | Networking, preferences, storage, security, device memory, logging, shared utilities |
| `core/archive/` | CBZ/archive reading, encryption and the EPUB engine |
| `core-metadata/` | ComicInfo and metadata parsing |
| `presentation-core/` | Shared Compose components, Material customisations, the secondary settings-item system |
| `presentation-widget/` | The Glance home-screen widget |
| `mtl-spine/` | Pure translation orchestration shared by both MTL flavours |
| `yakuyomi-engine/` | MTL provider integration and native engine wrapper (`mtl` flavour) |
| `yakuyomi-stub/` | No-op translation stub (`nomtl` flavour) |
| `upscale/` | Standalone upscaling spine plus NCNN/ONNX backends |
| `llamatik-native/` | Vendored llama.cpp JNI runtime with an optional Vulkan backend |
| `i18n/` | Mihon strings (`MR`) |
| `i18n-kmk/` | Hyoukan/Komikku strings (`KMR`) |
| `i18n-sy/` | TachiyomiSY strings (`SYMR`) |
| `flagkit/` | Country-flag drawables |
| `telemetry/` | Firebase/Crashlytics; a no-op unless compiled with telemetry |
| `macrobenchmark/` | Macrobenchmark tests |
| `external/*` | Git submodules: the WebGPU viewer, the MTL native engine and llamatik |

Dependency flow is one-way: `app → domain → source-api`; `data` implements `domain` repositories. The app never reaches into a source's internals; it goes through the API.

## Package roots in `app/`

The `app` module has three top-level directories (`eu/`, `exh/`, `mihon/`), subdivided by **fork origin** rather than by architectural layer:

| Root | Origin | Content |
|---|---|---|
| `eu.kanade.tachiyomi.*` | Original Tachiyomi | Activities, Nav3 routes and screens, ViewModels, data services |
| `eu.kanade.domain.*` | Tachiyomi refactor | App-level interactors and legacy DI modules |
| `eu.kanade.presentation.*` | Compose migration | Screens, components, theme, settings framework |
| `exh.*` | TachiyomiSY / ExHentai | E-Hentai, metadata, recommendations, Komga |
| `mihon.*` | Mihon upstream | App graph, migrations, upcoming, Shizuku, feature modules |

The clean `tachiyomi.*` root lives in the dedicated modules, not in `app/`.

## Dependency injection

**Metro** (`dev.zacsweers.metro`) is the primary DI framework. `AppGraph` (`mihon/app/di/AppGraph.kt`) exposes typed accessors:

- `context.appGraph.foo` from Compose and services;
- `globalAppGraph.foo` from non-Context classes (set in `App.onCreate`);
- constructor `@Inject` for ordinary classes.

ViewModels use `@AssistedInject` with a nested `@AssistedFactory`, resolved through `viewModels<T> { graph.viewModelFactory }`. New bindings go through `@Inject` constructors and `AppBindings`, never through Injekt.

**Legacy Injekt** survives only as an extension-ABI bridge and for a few documented infrastructure sites. It is loaded in `App.onCreate` through five modules:

1. `PreferenceModule` — preference stores.
2. `AppModule` — infrastructure singletons (database, network, downloads).
3. `DomainModule` — core domain interactors and repositories.
4. `KMKDomainModule` — Hyoukan-only interactors.
5. `SYPreferenceModule` / `SYDomainModule` — TachiyomiSY preferences and domain.

Do not add new Injekt usage; the goal is to keep the extension bridge working, not to grow it.

## UI and navigation

The app uses **Navigation 3** (`androidx.navigation3`). Every screen is a `@Serializable` route implementing `NavKey`, rendered by the single `NavDisplay` in `MainActivity`. Screens live in two places:

- `eu/kanade/tachiyomi/ui/*` — routes, screen composables and ViewModels;
- `eu/kanade/presentation/*` — the content composables.

State is held in Metro ViewModels:

- no-argument: `metroViewModel<VM>()`;
- parameterised: `assistedMetroViewModel<VM, VM.Factory> { create(...) }`;
- models extend `mihon.core.viewmodel.StateViewModel<S>` or a plain `ViewModel`.

Cross-screen events go through the Nav3 `ResultEventBus` (`TabEvent`, `ShowBottomEvent`, `LibrarySearchEventKey`). In-tab sub-navigation uses nested Nav3 back stacks inside an `AdaptiveSheet`.

### Activities outside Nav3

A few screens are deliberately activities:

| Activity | Why |
|---|---|
| `MainActivity` | The sole Nav3 host |
| `ReaderActivity` | Fullscreen, `singleTask`, S-Pen remote, container transforms |
| `WebViewActivity` | Login and challenge flows |
| `UnlockActivity` | App lock |
| OAuth login activities | Tracker and Drive logins |
| `DeepLinkActivity` | Trampoline to Nav3's `DeepLinkRoute` |

The reader is *not* a Nav3 route and should not be migrated into one without a redesign; its lifecycle, orientation and input handling depend on being an activity.

### Controller delegation

State-heavy ViewModels hold state and thin intent methods; business logic lives in **controllers** beside them. A controller takes a scope, dependencies and accessor lambdas, never an Android `Context` it does not need. ViewModels construct the controller once with `provide* = { ... }` accessors and keep their public API as one-line delegations.

Large composables split by concern into co-located section files. Marker islands (`// KMK`, `// SY`) move whole; never cut one open.

## Domain and data

- **Domain** has 100+ interactors, 28 models and 18 repository interfaces. One class per operation, named `Get*`, `Set*`, `Insert*`, `Delete*`, `Update*`.
- Interactor methods use `await()` (one-shot), `subscribe()` (Flow) or `invoke()` (single use).
- **Data** implements the repositories with SQLDelight handlers: `handler.await`, `handler.subscribeTo*`, coalesce UPSERTs.
- Schema changes require a new `.sqm` migration and `./gradlew :data:generateSqlDelightInterface`.
- Views require a full drop-and-create in migrations; SQLDelight does not recreate them for you.

See [Data & database](/hyoukan/development/data/) for the schema and patterns.

## Settings

Settings are modular:

- `SettingKey<T>` is the single source of truth for a storage key and default.
- `*SettingKeys` objects group a feature's keys.
- `*SettingsHost` files define their rows.
- `SettingsCatalog` is the searchable-screen list.
- `GenericSettingsScreen` renders definitions with the same `PreferenceItem` composables as hand-built rows.

Adding a setting is a three-step task; adding a screen requires registering it in both `SettingsCatalog.searchableScreens` and `SettingsMainScreen.items`, or search breaks silently. Full guide: [Settings framework](/hyoukan/development/settings/).

## Internationalisation

| String kind | Module | Resource class |
|---|---|---|
| Hyoukan-only | `i18n-kmk/` | `KMR` |
| Shared Mihon/upstream | `i18n/` | `MR` |
| TachiyomiSY-only | `i18n-sy/` | `SYMR` |

Only the `base/` locale files are edited in the repository; Weblate owns translations. Adding a Komikku-specific string to `i18n/` is a review failure.

## Images and memory

- Coil 3 is the only image loader.
- The only decoder is `ca.mpreg:imagedecoder` (libvips). A small `tachiyomi/decoder/ImageDecoder` bridge exists solely for the SSIV tiled decoder's bytecode and must not be deleted as "unused".
- `DeviceTier` and `MemoryPressure` live in `core:common` and are shared by the WebGPU reader, Coil's cache, JXL/AVIF decode limits, fetch parallelism and the MTL gate. There is one answer to "how much memory does this device have", not one per feature.

## Theme

`TachiyomiTheme` selects from named `BaseColorScheme` implementations. Hyoukan adds cover-based dynamic theming through `DynamicMaterialExpressiveTheme`, Material You wallpaper palettes (including a pre-Android-12 sampler) and custom seed colours.

## Fork markers

When editing upstream-derived code, preserve inline blocks:

```kotlin
// KMK -->  ... // KMK <--   Hyoukan/Komikku additions
// SY -->   ... // SY <--    TachiyomiSY additions
// EXH -->  ... // EXH <--   E-Hentai/exh additions
```

New Hyoukan-only code belongs in `// KMK` islands. Keeping the markers intact is what makes upstream merges possible.

## Key files

| File | Role |
|---|---|
| `App.kt` | Injekt bootstrap, logging, app graph installation |
| `MainActivity.kt` | Nav3 host |
| `mihon/app/di/AppGraph.kt` | Metro graph |
| `app/.../di/AppModule.kt` | Core infrastructure bindings |
| `app/.../domain/DomainModule.kt` | Domain interactors |
| `KMKDomainModule.kt`, `SYDomainModule.kt` | Fork-specific domain |
| `buildSrc/.../BuildConfig.kt` | Build flags |
| `AndroidConfig.kt` | SDK versions |
| `app/build.gradle.kts` | Variants, flavours, signing, dependencies |
| `settings.gradle.kts` | Module includes, composite builds, version catalogs |

## Version catalogs

Five catalogs, wired in `settings.gradle.kts`:

- `libs` — `gradle/libs.versions.toml`
- `kotlinx` — `gradle/kotlinx.versions.toml`
- `androidx` — `gradle/androidx.versions.toml`
- `compose` — `gradle/compose.versions.toml`
- `sylibs` — `gradle/sy.versions.toml`

## What to read next

- [Reader & WebGPU](/hyoukan/development/reader/) — the most complex subsystem.
- [Book engine](/hyoukan/development/books-engine/) — EPUB parsing and the novel viewer.
- [Data & database](/hyoukan/development/data/) — schema, migrations and backup.
- [Build & release](/hyoukan/development/build/) — variants, CI and shipping.
