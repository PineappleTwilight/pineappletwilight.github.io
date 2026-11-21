---
title: All tutorials
description: Step-by-step walkthroughs for Hyoukan's advanced features — translation, upscaling, typography, automation and display tuning.
---

The rest of this wiki explains how each feature works. A tutorial is different: it takes one job, assumes almost nothing, and walks it end to end with a way to check the result.

Pick the outcome you want.

| Tutorial | Time | You need | What you end up with |
|---|---|---|---|
| [Translate a chapter](/hyoukan/tutorials/translate-a-chapter/) | 15–20 min | Internet, a cloud API key or a MangaTranslator account | A chapter that reads in your language, cached and tuned to the series |
| [Translate fully offline](/hyoukan/tutorials/translate-offline/) | 30–45 min plus downloads | A 3 GB+ device and several GB of free storage | Translation that never sends a page anywhere |
| [Upscale a series](/hyoukan/tutorials/upscale-a-series/) | 20 min | A low-resolution series and a Vulkan- or NNAPI-capable device | Sharper pages, with the right model and factor for your hardware |
| [Typeset an EPUB](/hyoukan/tutorials/typeset-an-epub/) | 15 min | An EPUB in the library | A book that looks like a printed page instead of a web page |
| [Library on autopilot](/hyoukan/tutorials/library-autopilot/) | 20 min | A library with entries in categories | Updates, downloads, cleanup and tracker sync that run without you |
| [Calibrate the reader](/hyoukan/tutorials/calibrate-the-reader/) | 15 min | A WebGPU-capable device | Correct brightness, HDR handling and a LUT that suits your panel |

## How to read a tutorial

Each one follows the same shape:

1. **What you'll build** — the finished state in one paragraph.
2. **Before you start** — build, hardware and storage requirements.
3. **Steps** — numbered, with the exact screen path for every setting.
4. **Check it worked** — observable results, not "it should work".
5. **If something goes wrong** — the failures people actually hit.

> [!TIP]
>
> Settings names in tutorials match the English interface. If the app is in another language, the paths are the same but the labels are translated.

## Before any tutorial

- **Know your build.** The standard build ships the on-device translation engine. The `nomtl` build omits it and translates only through the remote MangaTranslator service; upscaling, books and everything else still work.
- **Know your device.** Translation wants 3 GB of RAM and an `arm64-v8a` or `armeabi-v7a` build. Upscaling is fastest with Vulkan or an NNAPI NPU, and falls back to CPU and then simple resampling.
- **Have a backup.** None of these tutorials touch your library data, but a backup before a large download or a provider change is cheap: **More → Settings → Data and storage → Create backup**.

## The reference behind the tutorials

- [AI translation](/hyoukan/guide/translation/) — the pipeline, providers, models and cache in full.
- [AI upscaling](/hyoukan/guide/upscaling/) — model families, backends, plan chains and cache identity.
- [Reading books](/hyoukan/guide/books/) — every typography control and how positions survive reflow.
- [Downloads & storage](/hyoukan/guide/downloads/) — the queue, automatic downloads and cleanup rules.
- [Settings index](/hyoukan/reference/settings/) — the screen-by-screen map of every setting mentioned here.
