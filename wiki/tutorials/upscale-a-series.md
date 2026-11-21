---
title: Upscale a low-resolution series
description: A guided walkthrough for choosing a model, backend and factor, enabling upscaling at the right level, and proving it is actually serving pages.
---

This tutorial sets up **AI upscaling** for one series, chooses a model and factor that match the artwork and the device, and verifies that pages are being served by the native pipeline rather than quietly falling back to a resample.

| | |
|---|---|
| **Time** | 20 minutes, plus model download |
| **Needs** | A low-resolution series and, ideally, Vulkan or an NNAPI NPU; CPU and simple resampling work everywhere |
| **Ends with** | Per-category or per-entry upscaling, a warm cache and a realistic idea of the per-page cost |

## What you'll build

Hyoukan's upscaler is a separate pipeline from translation. It takes a decoded page, runs it through a super-resolution model or a resampling filter, and hands a sharper image to the reader. It works in every build, including `nomtl`, and it is enabled per entry — not globally for the whole library by accident.

## Before you start

| Check | Where | Expected |
|---|---|---|
| Free storage | **Settings → Data and storage → Storage usage** | The native model weights plus up to 200 MB of page cache |
| GPU / NPU | **Settings → AI Upscaler → Live status** | **Vulkan ready** or **NPU ready** is the fast path; CPU ready is the universal fallback |
| The series is low-resolution | Open a page and zoom | If it already looks sharp at 100%, upscaling will mostly waste battery |
| Build | — | Any build. Upscaling is not gated behind the translation engine |

## Step 1 — Turn it on

1. Open **More → Settings → AI Upscaler**.
2. Turn on **Enable AI upscaling**.

The master switch reveals the per-entry toggle on details pages. It does not upscale anything by itself; the enablement ladder below decides which entries run.

## Step 2 — Download the models

1. Scroll to **Models**.
2. Tap **Download models**.
3. Wait for the row to report the installed size. The screen lists each model family with its installed and total MB.

**Simple resample** needs no model at all. If you only want a fast bicubic enlargement, skip this step and choose that mode in Step 3.

## Step 3 — Choose mode, model and factor

Under **Quality**:

| Setting | Options | Guidance |
|---|---|---|
| **Upscale mode** | **Auto**, **Native models**, **Simple resample** | **Auto** runs a native model and falls back to resampling. **Native models** never resamples: with no usable runtime it skips the page. **Simple resample** never downloads anything |
| **Quality preset** | **Fast**, **Balanced**, **High** | Fast is fixed at 1.5× and uses the least memory. Balanced uses the factor below. High multiplies the factor by 1.2, capped at 4× |
| **Model** | Real-CUGAN, Real-ESRGAN, Waifu2x, Imported ONNX | See the table below |
| **Upscale factor** | 1.0×–4.0× in 0.1 steps | 2.0× is a sensible start. The app skips near-identity scales (under 2% change) |
| **Backend** | Auto, Vulkan, NPU, CPU | Auto orders Vulkan → NPU → CPU and falls through |

### Which model for which artwork

| Artwork | Model | Why |
|---|---|---|
| Clean black-and-white line art, older scans | **Real-CUGAN** | Denoise-oriented; cleans JPEG noise without inventing detail |
| Soft or blurry scans, colour pages | **Real-ESRGAN** | Sharper and more willing to reconstruct edges |
| Weak device, short battery life | **Waifu2x** | Light and fast at 2× |
| A specific model you trust | **Imported ONNX** | Runs through ONNX Runtime; probed before it is accepted |

A practical first configuration is:

```
Mode: Auto
Preset: Balanced
Model: Real-CUGAN
Factor: 2.0×
Backend: Auto
```

Then change one variable at a time while looking at the same page.

> [!NOTE]
>
> In **Native models** mode, an unavailable backend means the page is skipped, not resampled. If you want a guaranteed result on every device, use **Auto**.

## Step 4 — Enable it at the right level

The enablement ladder is explicit, most specific first:

```
global switch
  → per-entry toggle
    → category default (Inherit / Always / Never)
      → default for new entries
```

1. **Per entry** — open a series, and turn on **Upscale Manga** on its details page.
2. **Per category** — under **Library categories**, set a category to **Always upscale**, **Never upscale** or **Inherit**. Inherit leaves each entry's own value alone.
3. **New entries** — turn on **Upscale new entries by default** if most of your library benefits.

For a single old series, use the per-entry toggle. For a "Scans" category, use the category default.

## Step 5 — Read a chapter and read the status

Open the series and read a few pages. Then return to **Settings → AI Upscaler → Live status**.

| Value | What it means |
|---|---|
| **Served** | Pages that went through the upscale pipeline |
| **… from cache** | Pages reused from the 200 MB, 30-day cache |
| **… fell back** | Pages served by a lower backend or by resampling |
| **… failed** | Pages that could not be upscaled; they still display at original size |
| **Average inference … ms** | Per-page native inference time |
| **Vulkan ready / NPU ready / CPU ready** | Backend readiness at this moment |

If **Served** stays at zero, the entry is not opted in or the page was skipped. If **fell back** climbs for every page, no model is installed or the selected backend is unavailable.

## Step 6 — Tune performance

| Setting | Effect | When to change it |
|---|---|---|
| **Prefetch pages ahead** | Off, or warm the cache for the next 1–5 pages | On for a smooth page turn; off to stop work on pages you may never reach |
| **Fast** preset | 1.5× fixed, lowest memory | Low-RAM devices and long sessions |
| **High** preset | Factor × 1.2, capped at 4× | When you have headroom and want maximum detail |
| **Backend** | Auto / Vulkan / NPU / CPU | Pin Vulkan or NPU to test a specific path; pin CPU to compare quality |

Watch **Average inference … ms** after each change. A 2× model at 4× output is roughly four times the pixels, so factor increases cost much faster than the slider suggests.

## Step 7 — Verify the cache behaves

1. Read a chapter once. Note **Served** and **from cache**.
2. Close and reopen the chapter. The second pass should hit the cache; inference time should not grow.
3. Change the model or factor, then read again. The cache is keyed by factor, model, preset, backend, output format and artifact hashes, so old entries stop matching automatically.

There is no stale-cache switch to remember. If you want to reclaim space, use **Clear upscaled cache**.

## Step 8 — Know what ArtCNN is

**WebGPU tile refinement (ArtCNN)** is not the upscaler. It registers a GPU tile sampler that sharpens tiles as they are displayed. It is display quality only: it never enters a page pipeline and never writes to the upscale cache.

- Use it when you zoom into pages and want sharper tiles on screen.
- Leave it off when battery matters, or when pages are already upscaled.
- It never changes the stored page or the cache identity.

## Check it worked

- **Live status** shows a rising **Served** count with mostly cache hits after the first pass.
- **Average inference** is plausible for the device — tens of ms on a good GPU, hundreds on CPU.
- The same page at 100% zoom looks cleaner than before, especially around line edges.
- Changing the factor from 2.0× to 1.5× or 3.0× visibly changes the result and invalidates cache hits.
- In **Native models** mode, disabling the model makes pages skip rather than resample.

## If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| Pages look unchanged | Not enabled at any level | Check global switch, per-entry toggle and category default, in that order |
| Everything falls back to resample | No model installed, or the backend is unavailable | Download models, or choose **Auto** instead of **Native models** |
| It is slow | Factor or preset too high; CPU backend | Lower the factor, use **Fast**, disable prefetch, or switch that shelf to simple resampling |
| It uses too much space | Cache plus model weights | Clear the upscale cache; models are separate and can be cleared too |
| A model will not import | The ONNX graph is incompatible | The probe rejects it with an error; convert to a super-resolution graph with matching input/output shapes |
| The reader is janky while turning pages | Prefetch competing with page loads | Set prefetch to Off or 1 |
| Battery drains quickly | Native inference plus ArtCNN | Use Waifu2x or simple resample, disable ArtCNN and prefetch |

## Where to go next

- [AI upscaling reference](/hyoukan/guide/upscaling/) — model families, plan chains and cache identity.
- [Calibrate the reader](/hyoukan/tutorials/calibrate-the-reader/) — brightness, HDR, LUTs and display-quality sharpening.
- [Reading comics](/hyoukan/guide/comics/) — the viewer settings that surround the upscale pipeline.
