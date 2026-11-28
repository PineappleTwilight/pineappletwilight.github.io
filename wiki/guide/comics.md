---
title: Reading comics
description: Modes, gestures, the WebGPU renderer and every reader setting that changes what you see.
---

The comic reader is a full-screen **Activity**, not an ordinary app screen: it owns the display, the orientation, the volume keys and the S-Pen remote. Opening a chapter from the library, the Updates tab or a series page enters it.

## The reader at a glance

- **Tap the centre** to toggle the menu bars.
- **Tap the sides** to turn pages, according to the tap-zone layout.
- **Long-press** for page actions (save, share, set as cover, search).
- **Bottom bar** — chapter list, previous/next chapter, slider, and configurable action buttons.
- **Top bar** — back, chapter name, page indicator, overflow menu and reader settings.

The bottom buttons are configurable in **Settings → Reader → Reader bottom buttons**.

## Reading modes

| Mode | Behaviour |
|---|---|
| **Left to right (pager)** | One page at a time, advancing left to right |
| **Right to left (pager)** | One page at a time, advancing right to left — the usual manga direction |
| **Vertical (pager)** | Paged vertically |
| **Webtoon** | Continuous vertical scroll, page by page |
| **Continuous vertical** | Continuous vertical scroll with no gaps, built for long strips |
| **Default** | Resolves to the entry's or category's configured mode |

**Automatic webtoon detection** can switch an entry to the continuous viewer when its pages look like a long strip. The **Auto Webtoon Mode** setting controls whether this is allowed.

The reader can also show a brief overlay of the current mode when it opens, and the tap-zone overlay can be shown on first open.

## Pager behaviour

- **Tap zones** — left, right, top, bottom and centre, each assignable. **Invert tap zones** flips left/right for RTL reading.
- **Scale type** — fit width, fit height, fit screen, original size or smart fit.
- **Zoom start position** — where a zoomed page begins.
- **Crop borders** — trims uniform white or black margins before display.
- **Automatically zoom into wide images** — fills the screen with wide pages.
- **Disable zoom in** — caps zoom at the page's fit scale. Zooming out still works.
- **Double tap to zoom** — turns the whole double-tap gesture on or off.
- **Split wide pages** — cuts a spread into two pages, with inverted placement for RTL.
- **Rotate wide pages to fit** — rotates landscape pages into portrait.

## Long strip behaviour

- **Smart scale on wide screens** — keeps the strip at a readable width instead of stretching it.
- **Side padding** — draws the strip in a narrower, centred column.
- **Long strip with gaps** — inserts spacing between pages.
- **Tap scroll by page** — a tap scrolls a screenful instead of a page.
- **Menu-hide sensitivity** — how much scrolling hides the bars.
- **Pinch to zoom** and **disable zoom out**.
- **Auto webtoon** detection and the **preserve reading position on read entries** option.

## The WebGPU renderer

On devices that support WebGPU, Hyoukan uses the hardware renderer by default. It is not a skin over the old viewer: pages are decoded into GPU textures, tiled, and drawn by a dedicated render pipeline.

### What it adds

- **HDR pages** — PQ, HLG and UltraHDR content at full brightness, with SDR tone-mapping for the rest.
- **Colour grading** — brightness, contrast and HLG exposure; built-in LUT presets and custom `.cube` / madVR `.3dlut` files with adjustable intensity.
- **Sharpening** — an unsharp mask for soft or downscaled scans, 0–200%, applied live without a re-decode. It is WebGPU-only and separate from ArtCNN or AI upscaling.
- **Filter presets** — save brightness, contrast, sharpening, LUT and e-ink choices under a name, then reapply all of them in one tap.
- **Smart dark mode** — darkens light pages on a dark reader theme without inverting illustrations.
- **E-ink preset** — grayscale, contrast boost, calm transitions and full-page refreshes instead of tile ripples.
- **Dual-page spreads** — two pages side by side, with deterministic height matching, inversion and a centre margin for foldables.
- **Page transitions** — none, normal or fast; separate dual-page animations; a configurable transition animation.
- **ArtCNN** — an on-GPU super-resolution pass for zoomed tiles. It is display quality only and uses more battery.
- **Fast rendering** — skips the tile cache and draws pages directly: less sharp when zoomed, smoother on weak tablets.
- **WebGPU tile cache** — **Settings → Advanced → Reader → WebGPU tile cache** is on by default; turn it off for a GPU that shows black or flickering pages. PowerVR devices always take the cache-free path.
- **Preload ahead/behind** — separate counts, memory-gated.
- **Cutout handling** — avoid or draw into the display cutout, with a separate choice for dual pages.

The sharpening slider, filter presets, tile-cache switch and the −70% brightness floor are on the current `master` build, not in stable 1.25.3.

### Why it might not be used

`WebGpuProvider` declines, in order, when:

1. **Use high quality renderer** is off.
2. The renderer **cannot initialise**, or a previously dead device cannot be rebuilt.
3. Constructing the viewer **threw**.

Every decline writes a line to the in-app log beginning `WebGPU viewer declined:` or `WebGPU viewer failed`. There is no per-device health latch on current `master`: degraded sessions are logged with diagnostics but never change which viewer opens, and a device left dead by a previous session is rebuilt before the next reader starts. The high-quality switch remains the preference gate; renderer unavailability or construction failure can still use the standard viewer.

A session counts as degraded when it ends with the renderer still dead, has a parked swapchain, loses the device three times with recoveries in between, or decodes at least two pages for five seconds without both a presented frame and a page on screen. A single device loss that recovers — which backgrounding causes on healthy phones — does not count. The strike record is diagnostic only.

### Memory and page quality

The renderer sizes itself to the device and to **live** memory pressure:

- A device tier (TINY → XLARGE) is derived from RAM, the vendor low-RAM flag and the ABI. 32-bit processes are capped at SMALL on purpose.
- The page cache is bounded by **bytes as well as page count**; the byte budget includes the mip chain.
- A page larger than the pixel ceiling is downsampled to what the panel can actually show, with zoom headroom, rather than uploaded whole.
- Under pressure, pages are evicted before the page you are looking at; the drawn page is never evicted.
- Images keep full colour whenever memory allows; RGB_565 is reserved for genuinely tight devices.
- On low-memory signals the tile cache shrinks and later recovers, rather than ratcheting down permanently.

This is why the same high-resolution page behaves consistently on the same device instead of depending on a fixed RAM class.

## Display settings

| Setting | Effect |
|---|---|
| **Default rotation** | Free, force portrait, force landscape, or lock to the device |
| **Background colour** | Black, grey, white or automatic |
| **Fullscreen** | Hide the system bars |
| **Show content in cutout area** | Draw under the display cutout |
| **Keep screen on** | Prevent the display from sleeping while reading |
| **Show page number** | Page indicator in the bottom bar |
| **Flash on page change** | A white or black flash to clear e-ink ghosting; duration and interval configurable |
| **Display cutout mode** | Avoid or ignore the cutout, per single and dual page |

## Reading behaviour

| Setting | Effect |
|---|---|
| **Skip chapters marked read** | Jump over chapters already marked read |
| **Skip filtered chapters** | Skip chapters hidden by the scanlator filter |
| **Skip duplicate chapters** | Skip duplicates from other scanlators |
| **Always show chapter transition** | Show the transition page even when it would be skipped |
| **Preserve reading position** | Keep the last position when reopening a read chapter |
| **NSFW chapter completion sound** | Randomized completion audio (see [Achievements](/hyoukan/guide/achievements/#chapter-completion-sound)) |

## Page downloading and caching

The reader has its own cache, separate from downloaded chapters:

- **Page preload amount** — how many pages to keep ready.
- **Download threads** — concurrent image fetches. 2–3 is a sane default; higher values can trigger rate limits.
- **Reader cache size** — how many images to keep on disk while reading.
- **Aggressively load pages** — slowly fetch the whole chapter in the background instead of only visible pages.
- **Skip queue on retry** — retry a failed page immediately instead of waiting for the download queue.

Downloaded chapters bypass the cache and are read from local files. See [Downloads & storage](/hyoukan/guide/downloads/).

## The chapter list and scanlators

The chapter list is the entry's table of contents. From it you can:

- mark chapters read or unread;
- bookmark a chapter and assign a **colour** to record why;
- download or delete chapters;
- open the **scanlator filter**;
- choose a **definite scanlator priority**;
- filter by bookmark colour.

**Smart scanlator filtering** can show one chapter per number across groups, preferring the most complete source. It is on by default and configurable with chapter-count ranges, per-scanlator toggles, a coverage view and drag-to-reorder priority. Groups that split the work both keep their chapters.

The **Scanlator priority** entry can stay on the entry page or move into the toolbar's ⋮ menu. Under **Settings → Browse**, **Scanlator priority in overflow** is off by default; **Show scanlator priority** controls whether the entry appears at all and is on by default. Hiding **Show scanlator priority** hides it everywhere. These switches are on current `master`.

**Chapter deduplication** works alongside it: duplicate numbers are merged in the list, but the underlying chapters are preserved.

## Translation and upscaling in the reader

- If AI translation is enabled, translated pages replace the original in place. A **Compare translation** action shows the original without re-decoding.
- The upscaler's per-entry toggle is on the entry's details page. The reader asks the upscaler for display bytes before decoding; the cache is shared across sessions.
- WebGPU's **ArtCNN** is separate from the upscaler's page pipeline. It sharpens tiles on screen and never changes the stored page.

For a display-tuning walkthrough, see [Calibrate the comic reader](/hyoukan/tutorials/calibrate-the-reader/).

## Progress and incognito

Reading progress is written per chapter and per entry. Incognito mode (**More → Incognito**) stops history and progress writes entirely; the position is kept only for the current session in memory. It is a reading mode, not an access control.

## E-ink and low-power devices

- Enable the **E-ink preset** in the WebGPU settings.
- Turn on **Flash on page change** for the legacy viewer if ghosting is severe.
- Disable page transitions and ArtCNN to reduce battery use and redraws.
- The reader stops polling memory when the screen is off or the activity is stopped, and only requests the panel's top refresh rate while something is actually moving.
- On very weak devices, **Fast rendering** trades zoom sharpness for smoothness.

## If something goes wrong

- **Blank page / black screen** — see [Troubleshooting](/hyoukan/guide/troubleshooting/#the-webgpu-reader).
- **Pages open at the wrong position** — update first; the split-page and restore paths have had several fixes.
- **A page is stuck loading** — tap it to retry. The reader's stuck-page ladder retries automatically a bounded number of times before giving up.
- **Reader settings seem ignored** — some settings are per reading mode. WebGPU uses its own tap zones, crop and side-padding values; changing the Pager group does not affect it.
