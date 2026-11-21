---
title: Reader & WebGPU
description: The reader's activity model, page pipeline and the state machines behind the hardware renderer.
---

The reader is the largest and most failure-sensitive subsystem in the app. This page is the map for changing it: the entry points, the viewer contract, the page-loading path, and the WebGPU pipeline's threads, states, retries and memory rules.

> [!NOTE]
>
> The WebGPU folder carries its own `AGENTS.md` that is kept current by the people debugging it. This page summarises that knowledge; when the two disagree, the source and that file win.

## Entry points

| File | Role |
|---|---|
| `ReaderActivity.kt` | `singleTask` activity; `newIntent(context, mangaId, chapterId, page)` |
| `ReaderViewModel.kt` | AndroidX ViewModel holding chapter and page state |
| `ui/reader/viewer/` | `Viewer` / `ViewerConfig` contracts, pager and webtoon viewers |
| `ui/reader/loader/` | `PageLoaderFactory` and the loaders |
| `ui/reader/model/` | `ReaderChapter`, `ReaderPage`, `ViewerChapters`, transitions |
| `ui/reader/setting/` | `ReaderPreferences`, modes, orientation, settings models |
| `ui/reader/viewer/webgpu/` | The hardware renderer's app-side half |
| `ui/reader/viewer/novel/` | The book renderer (see [Book engine](/hyoukan/development/books-engine/)) |

The activity is the only thing that knows when the reader stops, so `Viewer` declares three audience hooks, all default no-ops:

- `onActivityStop()` / `onActivityStart()` — fired from `onPause`/`onResume`.
- `onMemoryPressure()` — fired from a `ComponentCallbacks2` for severe trim levels.

Only WebGPU and the novel viewer implement them. The WebGPU viewer uses the first pair to park its memory monitor and the last to shed caches; the novel viewer drops its inlined-document and font-rule caches. The legacy viewers deliberately shed nothing: their only derived data is a next-chapter transition map that is content, not a cache.

## Viewer selection

`ViewerRegistry` asks each provider whether it claims a chapter. A `null` from a provider means "not my kind of chapter", not "not this instance".

- `NovelViewerProvider` claims a chapter whose **loader** is a `TextPageLoader` — exactly what the registry picks for a `TextSource`.
- Image viewers decline text chapters explicitly (`declinesTextChapters`), so an EPUB can never reach a pager that would render it blank.
- If no provider claims a text chapter, `create` throws rather than falling back silently.
- `ReaderActivity.updateViewer` guards on `currentChapter?.pageLoader == null`, not on pages, because a text chapter has no image page list to inspect.

The chosen renderer and whether the chapter was text are logged. A wrong choice is invisible in the UI — the app bar looks right and the page is blank — so that line is the only diagnosis.

## Page loading

`PageLoaderFactory` chooses a loader from the source and chapter:

| Loader | Used for |
|---|---|
| `HttpPageLoader` | Online image chapters |
| `ArchivePageLoader` | CBZ/CBR downloads |
| `DirectoryPageLoader` | Local folders |
| `DownloadPageLoader` | Downloaded chapters |
| `EpubPageLoader` | EPUB-as-comic (art books) |
| `TextPageLoader` | EPUB / web novels (the book reader) |

A page has a status (`Queue`, `LoadPage`, `DownloadImage`, `Ready`, `Error`) and a stream. Loaders expose `loadPage`, `retryPage` and a status flow.

### Page splitting

A page too tall for the decoder is cut into segments by `HttpPageLoader` and **replaces its parent in the chapter's page list, mid-session**.

- `ReaderChapter.pageListVersion` is the change signal.
- `PageListWatch` holds prev/current/next chapter slots.
- `syncPageList` runs from preload **and** from continuous-page changes.
- Anything walking the page chain must handle a page that is no longer in the list.
- A split segment's slice identity lives in its synthetic index, not only in the URL suffix, because a retry can clear the URL.

## The two WebGPU halves

| Half | Where | Owns |
|---|---|---|
| **App** | `app/.../viewer/webgpu/` | Page shells, residency, decode scheduling, GPU upload |
| **Library** | `external/webgpuviewer-houri` (`:webgpuviewer`) | Device, render thread, tile grids, transitions, filters |

The app never decodes or draws. It hands the library an `ImagePage` per page; the library draws it. "The page is blank" is therefore a question about which `ImagePage` the shell holds. "Nothing renders at all" is almost always the device.

The library is an `includeBuild`. Its `embed(libs.androidx.webgpu)` does **not** reach the app's runtime classpath, so `app/build.gradle.kts` pins the matching `androidx.webgpu` version itself. The two must stay equal; a drift ships an older Dawn than the library was compiled against.

## Threads

| Thread | Name | Work |
|---|---|---|
| **Render** | `WebGPU-Render-Thread` | `render()`, render passes, tile grids, spreads. Guarded by `WebGpuRenderer.mutex`. |
| **Decode** | `WebGpuViewer-Decode-N` | A pool of 1–2 workers; each owns the page it popped under `lock`. All decode, preload and byte transforms. |
| **Main** | `MainScope` | Stuck sweep, progress spinner, device-loss handler, trim callbacks, memory monitor. |
| **Default** | — | Chapter preload and retry only. |

A field read by both render and main must be `@Volatile`. The viewer's `lock` covers `pageCache`, `decodeQueue`, `stuckRecords` and the `currentPage` swap — not the shell fields.

The decode pool keeps the single-flight invariant: a page in a state `queueForDecode` treats as in-flight has a worker actually on it. The pop happens under the lock, so N workers pop N distinct pages, and every exit path resets its own page. Small devices run one worker on purpose, because two concurrent decodes double the transient bitmap spike.

## Page state machine

```
IDLE ──queueForDecode──▶ QUEUED ──worker pops──▶ DECODING ──▶ imagePage = ImageSingle
  ▲                        │                        │
  │                        │                        ├─ fails ─▶ ErrorPage, back to IDLE
  └────────────────────────┴────────────────────────┘
                     LOOPING (bytes absent) ──startPageLoad──▶ LOADING ──Ready──▶ QUEUED
```

The invariant: a page is never in a state treated as "someone is already on it" while nothing is. `ensureDecoding` is the one producer; `requeueStuckPage` is the only thing allowed to break the tie.

`ensureDecoding` is **one-shot**: it sets `wantedByRender` and queues at most once per shell. A failed shell is therefore never re-queued by the render walk; an `ErrorPage` is recovered by **tap**, not by re-demand. This is deliberate — otherwise a failing page becomes a frame-rate retry loop.

## Decode priority

The queue is a **priority queue**, not a two-ended deque. Priorities are computed at enqueue from five facts (current, on screen, renderer-demanded, signed distance, scroll direction):

| Class | Priority |
|---|---|
| Current page | 1000 |
| On screen | 900 |
| Renderer-demanded | 800 |
| Travelling preload (ahead) | 750 − distance |
| Travelling preload (behind) | 740 − distance |
| Idle preload (ahead) | 730 − distance |
| Idle preload (behind) | 720 − distance |
| Other | 100 |

Direction genuinely flips the race: scrolling up, the nearest page above outranks the nearest below. Distances clamp at 64, so a far preload still outranks an unrelated shell. Ties resolve LIFO among renderer-demanded pages and FIFO among preloads.

The policy is a pure function in `WebGpuDecodePriority.kt`, asserted offline by `DecodePriorityHarness`; the queue itself is generic and covered by `DecodeQueueHarness`.

## Pipeline stages

`WebGpuPagePipeline.kt` names the decode path:

```
FETCH → LOAD → READ → VALIDATE → ENHANCE → METADATA → DECODE → PREPARE → UPLOAD → ADOPT
```

Each stage is entered through `enterPipelineStage`, which does exactly two things: records the trace stage and publishes the label onto the page placeholder under the percentage (`43%` over `Decoding`). The stage line is diagnostic plumbing with a reader-facing face; it adds no work and disappears when the placeholder is replaced.

## The stuck-page ladder

`startStuckPageSweep` is signal-driven, not a timer. It recognises three orphan shapes:

- **queued-but-absent** — queued but not in the decode queue;
- **loading-done** — loading but the bytes already arrived;
- **idle-placeholder** — idle, demanded, still a progress placeholder.

`requeueStuckPage` then acts:

| Attempts | Action |
|---|---|
| ≤ 3 | Reset to IDLE and re-queue (`REDRIVEN`) |
| ≤ 9 | Tear down the shell and tiles entirely (`REBUILT`) |
| > 9 | Give up, clear `wantedByRender`, hand it back to the render walk (`GONE`) |
| Inside the 1.5 s cooldown | Defer without logging |

`last=<outcome>` records **how the previous decode ended**, not why the page is stuck. Outcomes include `no-stream`, `no-bytes`, `rejected:*`, `abandoned`, `not-adopted`, `loading`, `decoded`, `threw`, `unfinished`. Several are normal returns; a return that skips its own trace completion is recorded as `threw`, which makes the ladder lie.

Loading has a deadline (`STUCK_LOAD_DEADLINE_MS`): a page stranded at `LoadPage`/`DownloadImage` used to be invisible, because `queueForDecode` treats LOADING as in-flight.

## Retry semantics

- `retryPage` is the first `no-stream` recovery.
- A repeat `no-stream` escalates to `requerySuspectPage`, which evicts the cache entry **before** re-queuing; cached bytes that are themselves the defect never heal otherwise.
- A page's re-query is limited to one per page (`MAX_SOURCE_REQUERIES`).
- Re-querying clears the cooldown but **not** the attempt count: escalation and cooldown are separate dials. Deleting the record would restart at attempt 1 forever.

## Device lifecycle

`WebGpuRenderer` is a companion singleton: instance → adapter → device, plus one render dispatcher and mutex.

**Never reuse an adapter.** A `GPUAdapter` is consumed by the first successful `requestDevice`; Dawn rejects a second one. After a loss the app must `requestAdapter` again. Reusing the old adapter latched `initError` for the process and made every later decode throw `WebGPU not available`.

**After a loss:**

1. Rebuild the device.
2. Clean filters and device-bound caches.
3. Rebuild the swapchain from the retained surface.
4. The app's `deviceLostListener` calls `resetDecodedPagesAfterDeviceLoss()`: every decoded page is destroyed, tile grids clear, and the viewer re-anchors on the current page.

**Recovery is bounded:**

- The app makes 3 attempts with linear backoff (250/500/750 ms).
- The library counts consecutive failed recoveries; early ones run inside the app's pacing, deeper ones get longer cooldowns, and 12 consecutive failures stop self-retries until a fresh loss event.
- A recovery resets its dial only after the new device has stayed alive 15 seconds.
- A failed recovery self-retries once per cooldown.
- A recovery that loses its device at birth reports failure rather than returning true.

**Device upgrades itself to core.** If the adapter lists `core-features-and-limits`, the library requests it; Compatibility mode only added restrictions and produced silent black frames when a pipeline exceeded one of them. A driver that lists the feature but rejects the request retries compat-only.

## Fallback and health

`WebGpuProvider.create` is the only place that can hand the reader to the legacy pager. It stops at the first reason:

1. The user's high-quality switch is off.
2. This build recorded two degraded sessions.
3. The renderer cannot initialise or lost its device.
4. Constructing the viewer threw.

Rows 2–4 are logged, both on the `ViewerRegistry` line and in the in-app log.

A **strike** is a session verdict, not a sample at exit:

- One strike per session that closes with the renderer still dead.
- Or a session that loses the device three times even with recoveries.
- A clean close clears the count.
- Strikes are scoped to the build (`VERSION_NAME` + `BUILD_TIME`), so a fix gets a fresh try.
- Turning the high-quality switch off and on clears them.
- A session that lost the device once and recovered is not a strike; backgrounding does that on healthy phones.

The verdict is computed from facts accumulated over the session (`anyPageDrawn()`), never from the page named at `destroy()` — closing on a chapter transition used to record a false strike.

## Memory budget

The reader sizes itself to the device and to live pressure.

- **Device tier** comes from total RAM, the vendor low-RAM mark and the ABI. A 32-bit process is capped at SMALL; that also pins decode parallelism to one.
- **Pressure** is ROOMY / TIGHT / CRITICAL, derived from the system verdict, Java heap headroom and available memory.
- **Headroom is `availMem - threshold`**, not `availMem`; swap makes the raw number lie.
- The **page cache is bounded by bytes and by page count**. `decodedBytes` is a measurement set at adoption, including the mip chain.
- The **pixel ceiling** is the tighter of the device tier and the panel (`displayPixels * 4`, floored at 2 MP). Pages above it are downsampled before upload.
- The **drawn page and anchor are never evicted**, even under a tight budget; the cache stops at "visible window plus what fits".
- Eviction is distance-based, with drawn-page immunity and preload-window membership; ties prefer the cheaper page, then oldest insertion.

The monitor's cadence:

| Situation | Interval |
|---|---|
| Idle (activity stopped, pager detached) | 10 s |
| ROOMY / TIGHT | 4 s / 2 s |
| CRITICAL, sustained | backs off from 1 s toward 16 s |

Recovery from a shrink needs **all three**: a 12 s cooldown, ROOMY pressure, and an 8 s stable reading. The cooldown measures how long ago the last shed was; the stability gate decides whether this reading has settled. Escalation to worse pressure is ungated.

`isLowRamDevice` is gone from the reader. Every old boolean now asks the budget.

## Cache and eviction

```
cacheSize = 1 + preloadAhead + preloadBehind + (dualPage ? 3 : 1)
```

- `evictFarthestPage` measures distance by chapter/index arithmetic, never by walking the cache chain.
- Drawn pages are immune; preload-window pages survive while anything outside exists.
- A page superseded by a split measures `distance == null` and sorts farthest — exactly what the replacement is about to replace.
- Tile-cache shedding on low memory records the pre-shrink value and restores it later; the old 0.8 ratchet was a permanent downgrade.

## Restore and progress

There are three coordinate systems:

| Source | Coordinates |
|---|---|
| `WebGpuReadingPositionStore` | The full strip, camera-page relative |
| DB `last_page_read` | The next-open (persisted, unsplit) list |
| `SavedStateHandle` `page_index` | The live list at write time, including split segments |

A process-death restore used to index the fresh list with the live coordinate, opening several pages forward past a tall page's split. It is now clamped to `chapter.last_page_read` when that value sits inside `1 until chapterPageIndex`.

A saved index is only valid in the list it was written against. Every restore site says which list its coordinate belongs to.

Progress writes are unconditional even when a page failed to load; only completion side-effects (read sync) are gated on the page having rendered. In continuous mode, `onPageChange` resolves what the strip actually showed, not an independent chapter walk.

## Resource ownership

`releasePageResources(page)` is the single owner and the only place that releases a `ViewerReaderPage`. It frees:

- the spread image;
- the height-match retry job;
- comparison originals;
- retained source bytes;
- the rescale-in-flight flag;
- `wantedByRender`;
- the image page itself.

If you add a GPU resource or coroutine to the viewer page, add it there. Six hand-copied subsets used to exist and had already drifted.

## What to test

The policy files are deliberately Android-free so `scripts/kotlinc-check/run-harness.sh` can assert them:

- decode priority;
- stuck ladder;
- spread geometry;
- memory budget;
- image-header validation;
- EXIF rotation;
- chapter-preload guard;
- continuous column width;
- session diagnostics.

When changing a decision a user can see, extract the policy into a file with no Android import and add a harness case. That is the rule that keeps this pipeline testable without a device.
