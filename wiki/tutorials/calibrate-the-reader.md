---
title: Calibrate the comic reader
description: A guided walkthrough for the WebGPU renderer — brightness, sharpening, named filter presets, HDR, smart dark mode, LUT grading and display-performance trade-offs.
---

This tutorial tunes the image reader for one screen. It covers the WebGPU renderer's colour pipeline, not the library or source settings: how a page is toned, graded and sharpened before it reaches your eyes.

| | |
|---|---|
| **Time** | 15 minutes |
| **Needs** | A WebGPU-capable device for the full set; the legacy viewer still reads pages without it |
| **Ends with** | A reference page that looks right in daylight and at night, and a LUT you can turn down instead of removing |

## What you'll build

The reader decodes pages into GPU textures, tiles them, and draws them through a render pipeline. On top of that pipeline sit brightness, contrast, sharpening, HDR tone mapping, smart dark mode and LUT colour grading, alongside two other ways to make pages sharper: ArtCNN tile refinement and the AI upscaler. The goal is a stable setup you do not have to revisit for every series.

## Before you start

| Check | Where | Expected |
|---|---|---|
| WebGPU is allowed | **Settings → Advanced → Reader → Use high quality renderer (WebGPU)** | On. It is the default on supported devices |
| The reader uses it | Open a chapter, then **Settings → Reader → WebGPU** | The WebGPU group is present and its settings take effect |
| A test page | Any colour page with both dark and light areas | Use the same page for every comparison |
| A second test page | A night scene or a page with near-black art | Reveals crushed shadows |

## Step 1 — Confirm which renderer is running

The WebGPU viewer is not a skin over the old viewer; it is a separate render path. It declines in a fixed order:

1. **Use high quality renderer** is off.
2. The renderer cannot initialise, or a previously dead device cannot be rebuilt.
3. Constructing the viewer threw.

Every decline writes a line to the in-app log beginning `WebGPU viewer declined:` or `WebGPU viewer failed`. If the reader looks like the old viewer, check **Settings → Advanced → View logs** for those lines before changing colour settings that are not being used.

There is no health latch or per-device strike gate. Degraded sessions are recorded in the in-app log with diagnostics but never change which viewer opens; a single recovered device loss is not degraded, and a device left dead by a previous session is rebuilt before the next reader starts.

## Step 2 — Start from a neutral picture

Before grading, make the base display correct.

1. Set **Background colour** (black, grey, white or automatic) to what you actually read against.
2. Turn on **Fullscreen** if the system bars are distracting.
3. Open the test page and adjust **Brightness** and then **Contrast**:
   - Brightness shifts the whole page up or down.
   - Contrast stretches tones around mid-gray.

Both apply live with no re-decode, so compare on the same page rather than reopening the chapter. The WebGPU brightness slider bottoms out at **−70%**: lower values used to clamp every colour channel to black. A stored value at or below −50% writes a warning to the in-app log.

> [!TIP]
>
> Set brightness before contrast. Raising contrast first makes the brightness control feel wrong, and you end up with a crushed page that needs a second correction.

## Step 3 — Tune night reading

Under **Settings → Reader → WebGPU**:

| Setting | What it does | Starting point |
|---|---|---|
| **Dark mode filter** | Smart-inverts pages: white becomes black, art stays readable | On at night, off in daylight |
| **True black (AMOLED)** | Crushes near-blacks to pure black to save OLED power | On for OLED, off for LCD |
| **Gray tolerance** | How much colour a pixel may carry and still count as grey | Raise to catch tinted paper; lower to protect coloured art |
| **Color dimming** | How much kept colours are darkened | Raise for night reading; lower if art looks muddy |

The filter is not a simple inversion. Grey tolerance decides what counts as page paper, and colour dimming decides how much of the remaining colour survives. If a colour page turns into a negative, grey tolerance is too high; if white speech bubbles stay blinding, it is too low.

## Step 4 — Handle HDR pages

The renderer displays PQ, HLG and UltraHDR content at full brightness and tone-maps the rest to SDR.

| Setting | Effect |
|---|---|
| **HLG tone mapping** | A hybrid log-gamma pass for HDR-ish pages; applies live |
| **HLG exposure** | An exposure shift in EV applied before the HLG curve |
| **Brightness** / **Contrast** | Global, and still applied after the HDR path |

If an HDR page looks washed out, adjust HLG exposure before touching global contrast. If SDR pages look fine and only HDR pages look wrong, the HLG pass is the control that matters.

## Step 5 — Grade with a LUT

A LUT is a colour table applied to the page. Presets are built in; custom files are supported.

1. Set **Color LUT preset** to **Grayscale**, **Sepia**, **Warm**, **Cool** or **Custom file**.
2. Adjust **LUT intensity**. Lower blends toward the original page; higher applies the table fully.
3. For a custom look, set **Custom LUT file** to the full path of a `.cube` or madVR `.3dlut` file. It is parsed off the main thread.

A light touch is usually right: **Warm** at moderate intensity takes the blue cast off a cheap panel; **Grayscale** is for focus, not for e-ink (use the e-ink preset for that).

> [!NOTE]
>
> The LUT is display-side grading. It does not modify the stored page, the upscale cache or the translation output. **Compare translation** still shows the original page through the same display pipeline.

## Step 6 — Use the e-ink preset on an e-ink panel

Turn on **E-ink preset**. It applies:

- grayscale pages;
- boosted contrast;
- calm transitions;
- tiled-refresh handling instead of tile ripples.

On an e-ink device, also consider **Flash on page change** in the legacy reader settings for ghosting, and turn off ArtCNN and page transitions to reduce redraws.

## Step 7 — Choose the sharpening path

There are two different sharpening features, and they are easy to confuse.

| Feature | Where | What it changes | Persists? |
|---|---|---|---|
| **WebGPU sharpening** | Settings → Reader → WebGPU | Unsharp mask on soft or downscaled scans, 0–200%, live | Yes — a preference, and captured in presets |
| **ArtCNN upscaling** | Settings → Reader → WebGPU | Sharpens zoomed tiles on the GPU | No — display only |
| **AI upscaling** | Settings → AI Upscaler | Runs a super-resolution model on the page bytes | Yes — writes to the upscale cache |

Use the unsharp mask for scans that are soft at their source resolution; start at 0% and raise it in small steps until halftones or lettering start to ring. Use ArtCNN for on-screen zoom quality and AI upscaling when the source itself is low-resolution. Enabling all three is valid: the page pipeline runs first, the unsharp mask sits between brightness/contrast and HDR in the display chain, and ArtCNN sharpens the result on screen. A value of 0 detaches the unsharp pass entirely.

## Step 8 — Save a filter preset

Under **Settings → Reader → WebGPU → Filter presets**, tap **Save current look** and give it a name. Names are trimmed and capped at 48 characters, and up to 20 looks can be stored; saving under an existing name replaces that look. A preset captures exactly six controls — brightness, contrast, sharpening, LUT preset, LUT intensity and the e-ink flag. **Apply** rewrites those six in one tap; **Delete** removes the look. HLG, dark mode, compare translation and the performance HUD are not part of a preset, so set those separately.

> [!NOTE]
>
> Sharpening, filter presets and the −70% brightness floor are on the current `master` build, not in the stable 1.25.3 release.

**Fast rendering** skips the tile cache and draws pages directly. It is less sharp when zoomed and smoother on weak tablets. If page turns stutter, try Fast rendering before lowering image quality.

## Step 9 — Set the reading buffer

| Setting | Effect |
|---|---|
| **Pages preloaded ahead** | Pages decoded before you turn to them |
| **Pages preloaded behind** | Pages kept ready when you turn back |
| **Fast rendering** | Skips the tile cache |

The renderer sizes its cache to the device and to live memory pressure. A page larger than the pixel ceiling is downsampled to what the panel can actually show, with zoom headroom, rather than uploaded whole. That is why a very high-resolution page may not reveal more detail when zoomed: the limit is the panel, not the file.

## Check it worked

- The in-app log has no `WebGPU viewer declined:` or `WebGPU viewer failed:` line for the current session.
- Brightness and contrast changes apply without reopening the page.
- At night, page paper is dark and coloured art is still recognisable.
- An HDR page is not washed out, and an SDR page is not overly dim.
- The LUT changes the page at 100% and still blends at low intensity.
- Zoomed tiles look sharper with ArtCNN on, and the improvement disappears when it is off.
- Soft scans sharpen live as the slider rises, and 0% restores the unsharpened page.
- A saved preset reapplies all six captured controls after you change them.
- Page turns are smooth with the chosen preload counts.

## If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| The reader looks like the old viewer | WebGPU switch off, renderer unavailable, or viewer construction failed | Check `WebGPU viewer declined:` / `WebGPU viewer failed`; there is no health-latch reset |
| WebGPU still declines after that | The device cannot initialise the renderer or cannot rebuild a dead device | Update the app; the legacy viewer remains usable |
| White pages stay bright at night | Dark mode filter off, or grey tolerance too low | Turn on the filter; raise tolerance |
| Coloured art turns into a negative | Grey tolerance too high | Lower it until colour survives |
| Art becomes muddy at night | Colour dimming too high | Lower it |
| HDR pages look flat | HLG tone mapping off, or exposure wrong | Enable HLG and adjust exposure |
| A custom LUT does nothing | Wrong path, unsupported file, or intensity at zero | Use a `.cube` or madVR `.3dlut` full path; raise intensity |
| Zoomed pages are soft | Fast rendering on, or ArtCNN off | Turn Fast rendering off and ArtCNN on |
| A soft scan stays soft | Sharpening at 0%, or the legacy viewer is running | Raise **Sharpening**; confirm the WebGPU group is active |
| A preset does not restore HDR or dark mode | Presets capture six controls only | Reapply HLG and dark mode separately |
| Page turns stutter | Preload too high, ArtCNN on, weak GPU | Lower preload, enable Fast rendering, disable ArtCNN |
| E-ink screen ghosts | Tiled refresh without the preset | Enable the E-ink preset; add page-change flashes in the legacy settings |

## Where to go next

- [Reading comics](/hyoukan/guide/comics/) — modes, gestures, WebGPU memory behaviour and the reader's other settings.
- [AI upscaling](/hyoukan/guide/upscaling/) — the page pipeline behind the sharper source bytes.
- [Appearance & identity](/hyoukan/guide/appearance/) — themes, dynamic colour and the app's own palette.
