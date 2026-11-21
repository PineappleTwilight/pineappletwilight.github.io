---
title: Translate fully offline
description: Set up on-device detection, OCR, inpainting and a local GGUF model so no page ever leaves the device — with Gemini Nano as a second offline path.
---

This tutorial configures **on-device translation**: the detector, OCR model, inpainter and language model all run on the phone. It is the privacy-preserving path and the one that works on a plane.

| | |
|---|---|
| **Time** | 30–45 minutes, dominated by downloads |
| **Needs** | A 3 GB+ device, an `arm64-v8a` (recommended) build, and several GB of free storage |
| **Ends with** | A local translation stack that works in airplane mode, with a model that fits the device |

## What you'll build

The full pipeline — detect → OCR → group → translate → inpaint → typeset — runs locally. Local GGUF models do the language step; the engine models do everything else. Once configured, selecting **Local (On-device LLM)** as the provider means translation generates no network traffic at all.

## Before you start

| Check | Where | Expected |
|---|---|---|
| Standard MTL build | **Settings → AI translation** | Local model controls are not hidden and the screen does not say "No-MTL build" |
| RAM | The same screen | No low-RAM warning. Local LLMs are offered by what the device can actually load |
| Storage | **Settings → Data and storage → Storage usage** | Several GB free: engine models plus one local LLM |
| 64-bit ABI | **More → About** → tap the version to copy device info | `arm64-v8a` gets the Vulkan build of llama.cpp; 32-bit falls back to CPU |

> [!NOTE]
>
> The local engine models and the local LLM are separate downloads. The engine models (detector, OCR, inpainter) are a few hundred MB; a local LLM is usually one to several GB. Both are required for the fully offline path.

## Step 1 — Choose the offline path

There are two genuinely offline language models in Hyoukan, plus a hybrid arrangement.

| Path | What it uses | Choose it when |
|---|---|---|
| **Local GGUF** | Bundled llama.cpp with a downloaded or imported model | You want full control and the most consistent offline behaviour |
| **Gemini Nano** | Android ML Kit GenAI / AICore | The device supports it (for example Pixel 8+ or Galaxy S24+) and you want a smaller download |
| **Hybrid** | Local GGUF for translation, Gemini Nano as a second on-device model | You want a fallback that is still offline |

Gemini Nano availability depends on the device and on AICore finishing provisioning. Local GGUF works on any device that passes the RAM gate, so it is the safer choice when portability matters.

## Step 2 — Point the provider at the device

1. Open **More → Settings → AI translation**.
2. Turn on **AI Translation**.
3. Open **Provider setup → Provider** and choose **Local (On-device LLM)**.

The cloud-only rows disappear: there is no API key or cloud model to configure. The local model controls live under **Models & engine**.

## Step 3 — Download the engine models

1. Open **Settings → AI translation → Models & engine**.
2. Tap **Download AI models**.
3. Wait for the detector (DBNet), OCR and inpainter (AOT-GAN) downloads to finish. The row reports a percentage and the installed size.

If you read **English or another Latin-script source**, also install **Install multilingual OCR add-on** (PP-OCRv5, about 16 MB). Japanese and Chinese pages are read by the base OCR model; Latin scripts need the add-on.

> [!TIP]
>
> The download is staged and only accepted when complete. If it is interrupted, start it again; a partial file is not treated as a working model.

## Step 4 — Get a local language model

Under **Models & engine → Local (On-device LLM)**:

1. Open **Local model**. **Auto** resolves to the best model the device can load.
2. Read the subtitle: quality tier, parameter count, vision support, translation fine-tune and download size.
3. Tap **Download model** and wait. The row shows percentage, MB downloaded, speed and an ETA; **Cancel download** stops it.

To use a model you already have:

1. Tap **Import GGUF from device**.
2. Pick a `.gguf` file. It is copied into private storage and appears in the model list.
3. Select it under **Local model**.

Imported models are treated like built-in ones, but you manage their deletion yourself.

### Which model to pick

| Priority | Choice |
|---|---|
| **Best translation quality** | A larger model marked **TL finetune**, if the device can load it |
| **Balanced** | The **Auto** pick — the catalog chooses by available RAM |
| **Vision-aware pages** | A model marked **vision**, with its mmproj available; it can see the page image as context |
| **Lowest storage / fastest** | The smallest model that still produces readable dialogue; expect more literal phrasing |

Bigger is not automatically better on a phone. A model that does not fit stays in RAM at the expense of the reader and the rest of the system.

## Step 5 — Start the engine

1. In the same group, tap **Start engine**. The subtitle changes from "Stopped" to "Running — *(model)*".
2. Turn on **Start engine on app launch**. This preloads the model so the first page of a chapter does not wait for a cold start.

If the runtime is missing (a `nomtl` build), the row says **Runtime not bundled** and no local model can run.

## Step 6 — Set the language and opt the series in

1. Back on **Settings → AI translation**, set **Target language**.
2. Pick a **Translation font** that covers the target script.
3. Open a series, and turn on **Translate Manga** on its details page.
4. Open a chapter.

The bottom chip reports **Detecting · OCR**, **Translating**, **Inpainting · Typesetting** and **Finalizing**. On a local model the "Translating" stage is the slow one; the other stages are native code.

## Step 7 — Add Gemini Nano as a second offline model

1. Open **Provider setup** and turn on **Use Gemini Nano (on-device)**.
2. Read **Gemini Nano device status**:
   - **Available — on-device translation active** means it is ready.
   - **Not available on this device right now** means AICore is missing or still provisioning. Update **Google AI Core**, restart the phone, then tap **Recheck**.
   - **AICore is still setting up (601/606…)** is the same situation with a more specific error code.
3. Turn on **Offline ML Kit fallback** under **Behavior & cache** so Nano is used when the cloud provider cannot serve.

Nano is vision-aware: it receives the page image as context. It is a good companion to a local GGUF model, but it does not replace the engine models; detection, OCR and inpainting are still the on-device pipeline.

## Step 8 — Prove it is actually offline

1. Turn on airplane mode (or disable Wi-Fi and mobile data).
2. Open a chapter of an opted-in series.
3. Read at least three pages.

Pages should translate normally. If they do, nothing in the pipeline is reaching the network.

> [!IMPORTANT]
>
> Fully offline means the **Local** provider (and optionally Gemini Nano). MangaTranslator and every cloud provider send data off the device by design. Incognito and censor modes gate translation uploads, but they do not turn a cloud provider into a local one.

## Step 9 — Tune speed and storage

| Symptom | Adjustment |
|---|---|
| First page of every chapter is slow | Turn on **Start engine on app launch**; the model stays loaded |
| Every page is slow | Pick a smaller model, or a lower quantization if you import your own |
| The phone gets hot | Expect this during long chapters; native inference is the expensive stage. Translate shorter sessions, or use Nano |
| GPU offload is not used | 64-bit builds include Vulkan; a device without Vulkan hardware compute runs on the CPU. The log says "compiled without support" when llama.cpp silently falls back |
| Storage is tight | **Clear local model** removes the LLM; **Clear downloaded models** removes the engine models. Both must be downloaded again |
| Output is empty or repeats | Reload the engine (**Stop engine**, then **Start engine**). If it persists, try another model |

Advanced sampling, context and thread settings live under **Advanced (llama.cpp)**. They are unsupported knobs: the defaults are chosen for the device, and changing them can make output worse.

## Check it worked

- **Local model** shows a model and **Download** reports "Installed: … MB".
- **Start engine** reports **Running — *(model)***.
- The provider status says the local model is installed, not "no model yet".
- A chapter translates with airplane mode on.
- The engine stays warm: opening a second chapter starts translating without a long pause.

## If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| "No model fits this device" | The device is below the RAM needed for catalog models | Import a smaller GGUF, or use Gemini Nano / MangaTranslator |
| "Runtime not bundled" | `nomtl` build | Install the standard build |
| Engine will not start | Model file missing or incomplete | Re-download the local model, then start again |
| Pages are erased but empty | The OCR model is missing, or the page has no readable text | Download the engine models; install PP-OCRv5 for Latin scripts |
| Latin-script pages translate as gibberish | Base OCR does not cover the script | Install **Install multilingual OCR add-on** |
| Gemini Nano never becomes available | AICore not installed or not provisioned | Update Google AI Core, restart, **Recheck** |
| Everything falls back to cloud | The cloud provider is still selected | Select **Local (On-device LLM)** — the provider, not just the model, decides where translation runs |

## Where to go next

- [Translate a chapter with AI](/hyoukan/tutorials/translate-a-chapter/) — the cloud path and prompt tuning.
- [AI translation reference](/hyoukan/guide/translation/) — pipeline stages, model management and cache identity.
- [Privacy & security](/hyoukan/guide/privacy/) — the on-device guarantees in context.
