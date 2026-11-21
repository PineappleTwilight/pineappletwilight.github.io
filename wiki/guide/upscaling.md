---
title: AI upscaling
description: Sharpen low-resolution pages with native models, ONNX or a simple resample — on-device and per collection.
---

Upscaling is a separate pipeline from translation. It takes a decoded page, runs it through a super-resolution model (or a resampling filter), and returns a sharper image to the reader. It is not gated behind AI translation and works in every build, including `nomtl`.

> [!TIP]
>
> New to the feature? [Upscale a low-resolution series](/hyoukan/tutorials/upscale-a-series/) walks through model choice, backend checks, the enablement ladder and the live status counters.

## What it can do

| Model family | Character | Factors |
|---|---|---|
| **Real-CUGAN** | Denoise-oriented, good for clean line art | 2×, 3×, 4× |
| **Real-ESRGAN** | Sharper, more detail | 2×, 4× |
| **Waifu2x** | Light and fast | 2× |
| **Imported ONNX** | Any compatible super-resolution model you provide | Model-defined |
| **Simple resample** | Bicubic, bilinear or nearest neighbour | Configurable |

## Backends

The planner builds a **chain**, not a single choice. A page may be served by the first backend that is actually available at that moment:

```
Vulkan (NCNN) → NPU (NNAPI) → CPU → simple resample
```

- **Vulkan** uses NCNN prebuilts and is usually the fastest on a capable GPU.
- **NPU** uses ONNX Runtime with NNAPI.
- **CPU** is the universal fallback.
- **Simple resample** needs no model and never fails.

Demotions are recorded and visible in the live status. A plan is never collapsed to one step at plan time, because availability is per-session and racy.

## Enabling it

The enablement ladder is deliberately explicit:

```
global switch
  → per-entry toggle
    → category default (inherit / always / never)
      → default for new entries
```

- **Global switch** — master on/off.
- **Per-entry toggle** — on the entry's details page; the most specific answer wins.
- **Category default** — set on each library category. "Inherit" leaves the entry's own value; "Always" and "Never" override it.
- **Upscale new entries by default** — new library entries start opted in.

The per-entry toggle appears whenever the global switch is on, even in `nomtl` builds.

## Settings

**Settings → AI upscaling:**

| Group | Setting | Effect |
|---|---|---|
| **General** | Enable AI upscaling | Master switch |
| | Upscale new entries by default | Opt-in for new library entries |
| | Upscale mode | Auto, native models or simple resample |
| | Resampling algorithm | Bicubic, bilinear or nearest (simple mode) |
| **Quality** | Quality preset | Fast, balanced, high or quality |
| | Model | Real-CUGAN, Real-ESRGAN, Waifu2x or imported ONNX |
| | Upscale factor | 1.5× fixed (lowest memory), 1.2× up to 4×, or a fixed multiplier |
| **Performance** | Backend | Best available, Vulkan, NPU or CPU |
| | Prefetch pages ahead | Off, or warm the cache for the next 0–5 pages |
| | WebGPU tile refinement (ArtCNN) | Sharper tiles in the WebGPU viewer; display quality only |
| **Cache** | Cache upscaled pages | Keep results in a 200 MB, 30-day cache |
| | Clear upscaled cache | Remove all cached pages |
| **Models** | Download / clear models | Manage the native weights |
| | Import ONNX model | Pick a `.onnx` file; the runtime probes it before acceptance |
| **Library categories** | Inherit / Always / Never | Per-category defaults |

The live status line reports:

- pages served;
- cache hits;
- fallbacks;
- failures;
- average inference time;
- per-backend readiness.

## Cache identity

A cached page is keyed by everything that can change the result:

- upscale factor;
- model id;
- preset;
- backend;
- output format;
- artifact hashes.

Changing the model, backend or factor therefore invalidates the cache automatically; there is no stale-cache switch to remember.

## WebGPU ArtCNN is not the upscaler

The reader's **ArtCNN** toggle registers a GPU tile sampler that sharpens tiles as they are displayed. It is display quality only: it never enters a page pipeline and never writes to the upscale cache. The settings screen lists it for discoverability, and `UpscaleController.useGpuTileSampler()` is the only place that consults it.

## Performance and battery

- Inference is the expensive part. Prefetching moves that cost off the page turn, at the cost of doing work for pages you may not reach.
- The 1.5× fixed factor is the lowest-memory option; higher factors and 4× models multiply the output pixels.
- On a device without Vulkan or an NPU, CPU inference can be slow enough that simple resampling is the better choice.
- The reader's memory budget accounts for the larger decoded page; a page that exceeds the ceiling is downsampled before upload.
- Upscaling is skipped for pages that are already at or above the target resolution (near-identity).

## Importing an ONNX model

1. **Settings → AI upscaling → Import ONNX model**.
2. Pick a `.onnx` file from storage.
3. The runtime probes it. A model that cannot be loaded is rejected with an error; it is not silently added to the list.

An imported model joins the fallback chain like a built-in one. The app does not train or convert models; it expects an ONNX super-resolution graph with the input/output shape the runtime probes for.

## Troubleshooting

- **Pages look unchanged** — check the global switch, the per-entry toggle and the category default, in that order. The live status shows whether pages were served, cached or fell back.
- **Everything falls back to resample** — no model is installed, or the selected backend is unavailable. Download the models or choose another backend.
- **It is slow** — lower the factor or preset, disable prefetch, or switch to simple resampling for that shelf.
- **It uses too much space** — clear the upscale cache or disable caching; the cache is capped at 200 MB but old entries still count until evicted.
- **A model will not import** — the file is not a compatible ONNX graph. The probe rejects it before it reaches the cache.
