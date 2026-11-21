---
title: Testing & conventions
description: Unit tests, the offline Kotlin harnesses and the conventions a change must satisfy before CI accepts it.
---

Hyoukan's test strategy is unusual: a small set of unit tests, plus a large set of **offline harnesses** that compile the real project sources with a cached Kotlin compiler and assert pure policy. The harnesses exist because much of the risky logic — reader state, memory budgets, EPUB parsing — can be made Android-free and tested in a second.

## Unit tests

There are 22 test files across three modules:

| Module | Count | Notes |
|---|---|---|
| `domain` | 11 | Interactors, search parsing, fetch intervals |
| `app` | 10 | Includes `MigratorTest` |
| `yakuyomi-engine` | 1 | Engine helper logic |

`data`, presentation and core modules have no unit tests. There are no `androidTest` tests and no Robolectric.

### Frameworks

- JUnit Jupiter 6
- Kotest assertions (`shouldBe`)
- MockK (`mockk`, `coEvery`, `coVerifySequence`)
- `kotlinx-coroutines-test` (`runTest`)

Each tested module opts in with `testImplementation(libs.bundles.test)` plus `testRuntimeOnly(junit-platform-launcher)`.

### Conventions

- `@Execution(CONCURRENT)` on every class.
- Backtick test names that read as sentences.
- `.create().copy()` model factories.
- `runTest` for suspend work.
- Assertions with Kotest, mocks with MockK.

```kotlin
@Execution(CONCURRENT)
class FetchIntervalTest {
    @Test
    fun `a missed release keeps counting from the missed date`() = runTest {
        val interval = FetchInterval.toMangaUpdate(chapters = chapters, ...)
        interval shouldBe expected
    }
}
```

## The offline Kotlin check

`scripts/kotlinc-check/check.sh` compiles changed Kotlin files without Gradle:

```bash
scripts/kotlinc-check/check.sh core/archive/src/main/kotlin/mihon/core/archive/Epub*.kt
```

It drives `kotlin-compiler-embeddable` straight from the Gradle dependency cache, so it needs no network, Android SDK or Compose plugin, and finishes in about a second. Dependencies that are not cached (jsoup, libarchive) and platform classes that do not exist off-device (`android.util.Xml`, `org.xmlpull`) are satisfied by deliberate stubs in `stubs/`, never compiled into the app.

**What it catches:**

- syntax errors;
- JVM declaration clashes (a `getPackageHref()` colliding with a `packageHref` property);
- intra-module type errors;
- anything a pure function can be asserted against.

It also catches the **nested-KDoc trap**: Kotlin block comments nest, so a `/*` written inside a KDoc opens a second comment; the file's final `*/` closes that one, and the outer comment runs to EOF and silently swallows every declaration after it. Never write `/*` inside a doc comment, even backticked.

**What it is not:** a build. Unresolved references are suppressed and counted, because most come from the absent classpath. It runs neither Spotless nor ktlint.

## Harnesses

`scripts/kotlinc-check/run-harness.sh` is the behavioural half. Each `*Harness.kt` links the **real** project source (never a copy) and prints `ok:` / `FAIL:` per case.

```bash
scripts/kotlinc-check/run-harness.sh
scripts/kotlinc-check/run-harness.sh UpscaleSpineHarness
```

At the time of writing there are 19 harnesses covering:

| Area | Examples |
|---|---|
| Archive / EPUB | path resolution, OPF metadata, document construction |
| Novel reader | typography, progress, plain-text conversion, footnotes |
| WebGPU | decode priority, stuck ladder, spread geometry, memory budget, image headers, EXIF rotation, preload guard, continuous column width, session diagnostics |
| Translation | page validation, encoding, prompt parsing, status |
| Upscaling | planning, identity, fallbacks |
| Library | search parsing, fetch intervals |

### The rule that makes them possible

> **Policy that decides something a user can see belongs in a file with no Android import.**

That is why `WebGpuDecodePriority`, `WebGpuStuckLadder`, `WebGpuMemoryMath`, `NovelTypography`, `NovelPageLayout`, `UpscalePolicy` and `EpubPaths` are pure. A harness can reach them; a device is not required.

When you change a decision a user can see, extract the policy and add a harness case. Do not assert on a copy of the algorithm.

## Formatting

Spotless + ktlint, configured in `buildSrc/.../mihon.code.lint.gradle.kts`.

```bash
./gradlew spotlessApply
./gradlew spotlessCheck
```

`spotlessCheck` is a CI gate. A change is not done until it passes. If it fails, run `spotlessApply` and re-check.

## Conventions

### Logging

- Hyoukan code: `xLogE()` / `xLog()` from `exh.log`.
- Mihon code: `logcat {}` from `tachiyomi.core.common.util.system`.
- Never raw `android.util.Log`.

### Strings

| Kind | Module | Class |
|---|---|---|
| Hyoukan-only | `i18n-kmk/` | `KMR` |
| Shared upstream | `i18n/` | `MR` |
| TachiyomiSY-only | `i18n-sy/` | `SYMR` |

Only `base/` locale files are edited; Weblate owns the rest. A Hyoukan string in `i18n/` is a review failure.

### Fork markers

Preserve and use:

```kotlin
// KMK -->  … // KMK <--
// SY -->   … // SY <--
// EXH -->  … // EXH <--
```

New Hyoukan-only code goes in `// KMK` islands. Marker islands move whole; never cut one open.

### Release notes

Add a user-facing bullet to `RELEASE_NOTES.md` for anything a user could notice. Skip pure refactors, tests and CI. Use `### New`, `### Improve` or `### Fix`.

### Migrations

A schema change needs a new `.sqm`, any affected views recreated verbatim, and `:data:generateSqlDelightInterface`. A preference rename needs a `Migration`. A backup-format change needs backward-compatible defaults.

## Review checklist

- [ ] The change is in the right layer (UI / domain / data / source API).
- [ ] New Hyoukan code is inside `// KMK` markers.
- [ ] Strings use `KMR`.
- [ ] A new setting has a key, host definition and row.
- [ ] A new settings screen is registered in both lists.
- [ ] A schema change has a migration and regenerated interface.
- [ ] A preference rename has a migration.
- [ ] A user-visible change has a release note.
- [ ] Policy is Android-free and covered by a harness where practical.
- [ ] `spotlessCheck` passes.
- [ ] Both flavours compile.
- [ ] The extension ABI is unchanged, or the change is additive and optional.

## Why this matters

The app ships to devices the maintainers do not own. The harnesses and the offline compiler check are how a change gets meaningful feedback without a full Gradle build or a physical phone. They are not a substitute for a build, but they catch the mistakes that would otherwise only appear in CI or in a field report.
