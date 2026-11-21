---
title: AI translation
description: The on-device and cloud pipeline that turns raw pages into readable ones — providers, models, prompts and cache.
---

Hyoukan's translation engine (internally **MTL**, "machine translation") is not a text overlay. It detects the text on a page, reads it, translates it, erases the original glyphs and typesets the translation back into the artwork. It can run entirely on the device or use a cloud model, and every stage is replaceable.

## Requirements

| Requirement | Detail |
|---|---|
| **Ram** | 3 GB or more for the local engine |
| **ABI** | `arm64-v8a` or `armeabi-v7a`; `x86` reports "not ready" |
| **Build** | The standard build ships the engine; the `nomtl` build does not |
| **Models** | Detection, OCR and inpainting models are downloaded once |
| **Optional** | A cloud API key, a Gemini Nano-capable device, or a local GGUF model |

The translation screen tells you which of these is missing rather than failing silently.

## The pipeline

Every page goes through the same ordered stages:

```
detect → OCR → group → translate → inpaint → typeset
```

| Stage | What happens |
|---|---|
| **Detect** | DBNet (NCNN, 1024 px) finds text regions |
| **OCR** | An ONNX CTC model reads the glyphs; PaddleOCR v5 is an optional add-on for Latin scripts |
| **Group** | Union-find plus a minimum spanning tree merge lines into speech bubbles and blocks |
| **Translate** | An LLM provider translates the grouped text |
| **Inpaint** | AOT-GAN (NCNN) removes the original glyph strokes |
| **Typeset** | A Canvas renderer lays the translation into the bubble |

Two rules make the output readable:

- **Removal covers every detected region**, including text OCR could not read, so raw source script never survives beside the translation.
- **Translation covers only OCR-readable regions**, so false detections are not blanketed out of the artwork.

Inpainting masks glyph strokes, not whole boxes: masking a full bubble hands the network a hole several times the glyph area, which comes back as a flat patch over the art.

## Providers

The provider is chosen in **Settings → AI translation → Provider**, with an automatic fallback chain.

| Provider | Where it runs | Notes |
|---|---|---|
| **Ichigo / MangaTranslator** | Remote image service | Sends the page image and receives a translated image. Works anonymously with a limited quota, or signed in for more. |
| **Gemini Nano** | On-device (ML Kit) | Vision-aware; uses the page image as context. Falls back to cloud when unavailable. |
| **Local GGUF** | On-device (llama.cpp) | Bundled runtime with a Vulkan backend on 64-bit devices; CPU otherwise. Models + optional mmproj for vision. |
| **Cloud LLM** | Remote | Gemini, OpenRouter or any OpenAI-compatible endpoint with a base URL and API key. |

**Auto** picks the best available provider in order and falls through when one is unavailable. A **manual** pick is honoured: if you choose a provider, the selector keeps it and uses the fallbacks only when it cannot serve.

Provider readiness is shown live: "ready", "no model yet", "downloading", "API key missing", "logged in", "anonymous".

## Models

**Settings → AI translation → Models & engine** downloads and manages:

- **Detector** — DBNet.
- **OCR** — the base CTC model, plus an optional **PaddleOCR v5** add-on (~16 MB) that adds Latin-script reading. Japanese and Chinese work without it.
- **Inpainter** — AOT-GAN.
- **Local LLM** — one or more GGUF models, with resumable downloads.
- **Custom URLs** — override the detector, OCR, inpainter or model manifest with your own HTTPS URLs.

Models can be cleared individually or all at once. A download is staged and only accepted when complete.

## Translation settings

**Settings → AI translation:**

| Setting | Effect |
|---|---|
| **Target language** | The language translations are written in |
| **Translation font** | Font used for the typeset text |
| **Text colour** | Colour of translated text; a custom hex value is accepted |
| **Offline ML Kit fallback** | Use Gemini Nano when the cloud is unavailable |
| **Cache translated pages** | Keep translations for reuse |
| **Auto-translate on download** | Translate pages as they are downloaded |
| **Advanced engine tuning** | Low-level knobs, explicitly unsupported |

The engine tuning screen contains quality and speed trade-offs (uniform fast cleanup, long-page slicing, detection/OCR thresholds). The defaults are measured on real devices; changing them can degrade quality.

## Prompts and glossaries

**Settings → AI translation → Translation prompts** controls how every text provider is asked:

- **Custom instructions** — style, tone or terminology guidance applied to every translation.
- **Formality** — follow the source, casual, polite, formal or literary.
- **Sound effects** — preserve, mixed policy or translate descriptive SFX.
- **Few-shot examples** — an optional source/target pair used as a style reference.
- **Glossary** — a JSON object or one `term -> translation` mapping per line.
- **Reset prompt policy** — restore the defaults.

The prompt policy is fingerprinted. Changing it invalidates cached translations that depended on the old prompt; translations that do not depend on it stay valid.

## Caching and sessions

- **Page cache** — translated pages are content-addressed and reused while the source, provider and prompt policy stay the same.
- **Permanent per-chapter cache** — an option to keep translations forever alongside the chapter, rather than the default temporary cache (about 14 days).
- **Per-entry cache management** — **Manage per-manga translation cache** wipes one entry's translations, even after it was removed from the library.
- **Sessions** — **Settings → AI translation → Sessions** lists active translations with progress and errors. You can stop, pause, resume or retry each chapter.

## Reading with translation

- Translated pages replace the original in the reader.
- **Compare translation** shows the original page without re-decoding.
- A page that fails stays visible in its original form; it does not become a blank.
- Translation can run while you read or ahead of time via download.

## Titles and descriptions

The entry's title and description can be translated too. Cached results are validated against the entry's current metadata and provider settings, so editing a title or changing providers re-translates instead of showing stale text.

An optional **English grammar/vocabulary fixer** post-processes English output.

## Privacy

- The local pipeline never leaves the device.
- A cloud provider receives the page image or extracted text, depending on the provider; that is the point of choosing it.
- The Ichigo service receives the page image and identifies the device with a stored fingerprint/client id. It stores only a session token, never an API key.
- Translation caches live in app-private storage and can be wiped per entry or globally.

## Troubleshooting

- **"This device has too little RAM"** — the local engine is gated at 3 GB. A cloud provider or Ichigo can still work; the gate is about the native pipeline.
- **Pages fail with no provider** — install models or set an API key. In the `nomtl` build, enable the remote Ichigo provider instead.
- **Text is erased but not replaced** — OCR found no readable text. Check the OCR model and the optional PaddleOCR add-on for Latin scripts.
- **Translations are cached too long** — clear the per-entry cache or disable permanent caching, then re-run.
- **A translated page looks wrong** — try a different provider or model, and reset the prompt policy to defaults before changing individual knobs.
