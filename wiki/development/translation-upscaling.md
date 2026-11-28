---
title: Translation & upscaling internals
description: The MTL and upscale spines — decision sites, provider/backend seams, native runtimes and the rules that keep them testable.
---

Translation and upscaling share a design pattern: a **pure-Kotlin spine** makes every decision, and thin platform providers execute it. The spines have no Android imports, so their policy can be asserted offline; the native and network edges are replaceable.

## MTL (translation)

Package root: `mtl.*`, split across two modules:

- `:mtl-spine` — all orchestration, shared verbatim by both flavours.
- `:yakuyomi` — native engine integration and real providers (`mtl` flavour).
- `:yakuyomi-stub` — an empty component set (`nomtl` flavour).

The flavour swap point is the app's dependency: `app → :yakuyomi | :yakuyomi-stub`, each `api()`-ing the spine.

### Assembly

`MtlBootstrap` assembles everything once. The app's only entry is `controller`.

```
MtlBootstrap
├── ConfigSource        preferences → MtlConfig (including prompt fingerprint)
├── PolicySource        preferences → SelectionPolicy
├── PagePipeline        prepare → detect → OCR → group → translate → inpaint → render → store
├── MtlScheduler        chapter-ordered queue, per-provider lanes
├── ProviderSelector    registry + selection
└── StatusHub           per-page progress for UI and settings
```

### Three decisions, made once

| Decision | Owner |
|---|---|
| Which backend translates (image service → Gemini Nano → local GGUF → cloud) | `mtl.select.ProviderSelector` |
| Prompt / parse / align / offline-fallback protocol | `mtl.provider.Prompt.kt` |
| Which pages are translatable and at what sample size | `mtl.provider.PageCodec` / `PagePipeline` |
| Page lifecycle, caching and status | `mtl.sched.PagePipeline` / `mtl.store.PageStore` / `mtl.status.StatusHub` |

Do not re-derive any of these at a call site. A manual provider pick is honoured; the selector uses fallbacks only when the pick cannot serve.

### Providers

A provider implements `mtl.core.MtlProvider` and is registered in `RealMtlComponents.providers()`:

- `CloudLlmProvider` — Gemini/OpenRouter/OpenAI-compatible.
- `GeminiNanoProvider` — ML Kit GenAI, vision-aware.
- `LocalGgufProvider` — llama.cpp, text or multimodal.
- `IchigoProvider` — remote image translation.

Registration order is the selector's tie-break. Readiness flows drive the settings screens' "Available / Not available" copy; the app does not contain flavour-specific probes.

### Adding a provider

1. Implement `MtlProvider`.
2. Hand raw output to `Prompt.kt` for parsing and alignment — do not re-implement prompt building.
3. Register it in `RealMtlComponents.providers()`.
4. Let cache identity come from the pipeline (`promptPolicy.fingerprint` + `modelId()`).

### Adding an engine knob

1. Map it in `EngineConfigFactory.defaultConfig()`.
2. Add it to `EngineConfigFactory.configChanges()` **in the same edit**, or the native session will not rebuild and the setting will silently do nothing until restart.

Render settings are read per page and do not need an entry.

### Adding a page rule

Limits, sample sizes and encodings belong in `PageImageValidator` or `PageImageEncoder`, not inline in the manager.

### The native engine

The native vision pipeline lives in `external/yakuyomi-engine` (submodule, `li.joye.yakuyomi.engine.*`):

- DBNet detection (NCNN, 1024 px);
- ONNX CTC OCR;
- AOT-GAN inpainting (NCNN);
- union-find + MST grouping;
- Canvas typesetting.

`BubbleUniformity` samples a slightly expanded ring to classify uniform backgrounds. Zero-area quads (a dot or a collapsed line) contribute no ring points, and a region with no usable corners reports "not uniform" instead of treating four copies of one pixel as a perfectly uniform bubble. Removal covers every detected region; translation covers only OCR-readable ones. Inpainting masks glyph strokes, not whole boxes. Render text is capped at the original glyph size unless a fixed colour/size is requested.

The engine config is rebuilt when a tuning knob changes; render settings are per page.

### Local LLM runtime

`llamatik-native` builds llama.cpp from the `external/llamatik` fork:

- Vulkan is compiled in on 64-bit ABIs (API 29+), CPU-only on 32-bit.
- `GGML_BACKEND_DL=OFF` links the backend statically into `libllama_jni.so`.
- `LlamatikBuildInfo` reports whether GPU offload is real; the backend forces `gpuLayers` to 0 unless `LocalLlmAccelerator` says otherwise.
- `updateGenerateParams(...)` must be called or models output nothing.
- The runtime is not the published CPU-only `com.llamatik:library` AAR.

### Facades

Two former god classes are now facades with unchanged public APIs:

- `MangaTranslatorService` — Ichigo image translation. Collaborators: `MangaTranslatorFingerprint`, `MangaTranslatorAuth`.
- `LocalLlmManager` — GGUF provider. Collaborators: `ImportedGgufModels`, `LocalLlmSampling`, `LocalLlmSession`.

A split must not widen an API. The collaborators are `internal` and held privately.

### Gotchas

- ML Kit GenAI beta APIs differ from the docs: `Generation.getClient()`, `checkStatus(): Int`, `download(): Flow<DownloadStatus>`, `generateContentRequest(...)`.
- `FEATURE_VULKAN` was removed in API 36; use `FEATURE_VULKAN_HARDWARE_COMPUTE`.
- A GPU offload that llama.cpp cannot perform logs "compiled without support" and silently runs on the CPU.
- Custom GGUF imports stage into `.tmp` and drop the partial file on any failure.
- Prompt/parse helpers are shared; do not fork per-provider copies.

## Upscaling

Module `:upscale`, not flavour-gated. One module, two halves: a pure spine (`upscale.*`) and native backends.

| Path | Purpose |
|---|---|
| `upscale/core/` | SPI: `UpscalerBackend`, `UpscaleRequest`, `UpscaleOutcome`, `Readiness`, enums |
| `upscale/policy/` | `UpscalePolicy.plan(config, input)` — the single decision site |
| `upscale/identity/` | `UpscaleIdentity` — byte-compatible cache keys |
| `upscale/status/` | `UpscaleStatusHub` — per-page state machine and totals |
| `upscale/model/` | `UpscaleModelManager` — manifest, verified downloads, ONNX probes |
| `upscale/native/` | NCNN JNI, ONNX Runtime, simple resample, device probe |
| `upscale/src/main/cpp/` | `upscale_jni.cpp`; NCNN prebuilts from the engine submodule |
| `app/.../upscale/app/` | Preferences, config source, bootstrap, bindings, reader bridge |

### Rules

- **The spine never reads a pref store or an Android class.** Config and resolver lambdas in, plan out.
- **Plans are chains, not choices.** `plan()` returns every step that may serve the page; the executor records demotions and falls through.
- **`RENDER_TILE` backends are display quality, not page pipelines.** ArtCNN registers through `UpscaleGpuBridge` and is never part of a byte plan.
- **MTL is decoupled.** No translation preference dependency, no MTL gate.
- **The enablement ladder is one implementation:** global → per-entry → category → new-entry default.
- **Cache identity includes everything that can change the result:** factor, model, preset, backend, format and artifact hashes.

### Adding a backend or model

1. Implement `UpscalerBackend` and report `Readiness`.
2. Add the model family to the manifest and `UpscaleModelManager`.
3. Extend `UpscalePolicy` only if the new backend changes the ordering rules — otherwise it composes through the existing chain.
4. Add a `UpscaleSpineHarness` case for the new policy branch.

### Constructor ordering landmine

A coroutine launched from `init` can run before the constructor returns. Kotlin initialises properties in declaration order, so a collector that touches a property declared below `init` sees it as `null`. `PrefsUpscaleConfigSource` crashed the reader this way. Any state a constructor coroutine touches belongs above its `init` block.

## Harnesses

Both spines are covered by `scripts/kotlinc-check/run-harness.sh`:

- `UpscaleSpineHarness` — 46 assertions over planning, identity and fallbacks.
- MTL harnesses cover page validation, encoding, prompt parsing and status.
- The native sides are exercised on-device; the policy is exercised offline.

## Build flags

| Flag | Effect |
|---|---|
| `-Pinclude-telemetry` | Include Firebase/Crashlytics |
| `-Penable-updater` | Include the in-app updater |
| `-Pdisable-code-shrink` | Skip R8 |
| `-Pinclude-dependency-info` | Include dependency metadata |
| `-Pmtl.gpuOffload=true` | Build llama.cpp with Vulkan (default on) |
| `-Pmtl.wslNdkDir=...` | Linux NDK path for the WSL build |
| `-Pmtl.wslVulkanHeaders=...` | Staged Vulkan headers for WSL |

The MTL flavour is the default; `nomtl` swaps `:yakuyomi` for `:yakuyomi-stub`, adds the `.nomtl` application-id suffix and drops telemetry.

## Testing checklist

- Translate a page with each provider you changed.
- Check cache invalidation after a prompt or provider change.
- Upscale a page with each backend, then force a fallback by disabling the model.
- Confirm the reader still opens when the engine is unavailable.
- Run the harnesses; they are the fastest way to catch a broken plan or a bad cache key.
