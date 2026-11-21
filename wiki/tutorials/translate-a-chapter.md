---
title: Translate a chapter with AI
description: A guided walkthrough from an untranslated page to a readable, cached chapter — provider, key, language, per-series opt-in, prompts and cache.
---

This tutorial sets up **AI translation** (internally **MTL**) for one series and translates a chapter. It uses a cloud provider because that is the shortest path to a good result; the [fully offline tutorial](/hyoukan/tutorials/translate-offline/) covers local models.

| | |
|---|---|
| **Time** | 15–20 minutes |
| **Needs** | Internet, the standard (MTL) build, and an API key for Gemini, OpenRouter or another supported provider — or a MangaTranslator account |
| **Ends with** | A translated chapter on disk, a prompt policy that fits the series, and a cache that makes the second read instant |

## What you'll build

Hyoukan detects the text on each page, reads it, translates it, erases the original glyphs and typesets the translation into the artwork. The translated page replaces the original in the reader. Once the series is opted in, opening a chapter is all you do; translation runs page by page while you read.

## Before you start

| Check | Where | Expected |
|---|---|---|
| Build has the engine | **More → Settings → AI translation** | A status row and a **Models & engine** row. A `nomtl` build says "No-MTL build — enable MangaTranslator for off-device translation" |
| Enough RAM | The same screen | No "This device has too little RAM" warning (the local pipeline is gated at 3 GB) |
| Free space | **Settings → Data and storage → Storage usage** | Room for cached translations; a few hundred MB is usually enough per large series |
| A target language | — | Decide what language you want to read in before tuning prompts |

> [!NOTE]
>
> In the standard build, even a cloud provider still uses the on-device detector, OCR and inpainter. The cloud part is the language model. In a `nomtl` build, MangaTranslator does the whole page remotely; every other provider is unavailable.

## Step 1 — Turn the engine on

1. Open **More → Settings → AI translation**.
2. Turn on **AI Translation**.

The status row now reports the engine, the selected provider, the model and its readiness. Typical readiness values are "ready", "no model yet", "API key missing", "logged in" and "anonymous".

The per-series toggle on the details page stays hidden until this master switch is on.

## Step 2 — Choose where the translation happens

Open **Settings → AI translation → Provider setup → Provider**.

| Provider | Account | Best for |
|---|---|---|
| **MangaTranslator (remote)** | None for anonymous use; an ichigo.moe / mangatranslator.ai account for a larger quota | The fastest setup, and the only provider in a `nomtl` build |
| **Gemini** | Google AI Studio API key | A simple key and vision-aware translation |
| **OpenRouter** | OpenRouter API key | Choosing among many models and comparing their wording |
| **OpenCode Zen** | API key | An alternative hosted cloud |
| **NVIDIA NIM** | API key | An alternative hosted cloud |
| **Custom OpenAI** | Base URL + optional headers + key | A self-hosted or proxied OpenAI-compatible endpoint |
| **Local (On-device LLM)** | None | Full offline operation — see the [offline tutorial](/hyoukan/tutorials/translate-offline/) |

Pick one and stay on this screen.

## Step 3 — Add the credential and model

### Cloud LLM (Gemini, OpenRouter, OpenCode Zen, NVIDIA NIM)

1. Create a key in the provider's console. For example: Google AI Studio for Gemini, or `openrouter.ai/keys` for OpenRouter.
2. Paste it into **API key**. The row shows only the first four characters once saved.
3. Tap **Fetch available models**. If the fetch fails, the app falls back to a built-in list; the error is shown on the row.
4. Choose a model. Use a current general-purpose or vision model; very small models translate dialogue poorly.
5. For **Custom OpenAI**, also fill **Custom API Base URL** (for example `https://api.example.com/v1`) and **Custom Headers** if the endpoint needs them.

Keys and model choices are stored **per provider**, so switching from Gemini to OpenRouter later does not overwrite the first configuration.

### MangaTranslator (remote)

1. Choose **MangaTranslator (remote)** as the provider. On first selection the app turns **AI Translation** on for you.
2. Open **Account — MangaTranslator / ichigo.moe**.
3. Sign in, or close the sheet and stay anonymous.
4. Anonymous use is rate-limited; a signed-in account raises the quota. The app stores a session token, never your password.

The engine, model and prompt controls are hidden for this provider because it returns a finished image instead of text.

## Step 4 — Set the language and the look

Back on **Settings → AI translation**:

| Setting | What to choose |
|---|---|
| **Target language** | The language you read in. Changing it re-translates pages instead of reusing the old language |
| **Translation font** | A font whose glyphs cover the target language. The default is fine for Latin scripts; pick a bundled CJK family for Japanese or Chinese output |
| **Text colour** | Usually black or white, matching the page. A custom hex value is accepted |

## Step 5 — Opt the series in

1. Open the series from the library.
2. On its details page, turn on **Translate Manga**.

This switch is per entry and off by default. With it off, the reader shows the original pages even though the engine is on.

> [!IMPORTANT]
>
> Translation uploads page images to the cloud provider you chose. The app gates translation while **Incognito** or **Censor lewd manga** is active, so pages are not sent in those modes.

## Step 6 — Translate the first chapter

Open a chapter and read normally.

A chip at the bottom of the reader reports the pipeline:

| Chip | Meaning |
|---|---|
| **Translating… 3/18 pages** | Pages are being processed; the count is finished pages |
| **Detecting · OCR** | The page is being analysed |
| **Translating** | The language model is working on the extracted text |
| **Inpainting · Typesetting** | The original glyphs are being removed and the translation drawn in |
| **Finalizing** | The page is nearly ready |
| **Translated** | The visible page is done; the chip hides after a moment |
| **Skipped — no text detected** | The page has no readable text, or OCR found none |
| **Translation failed** + **Retry** | That page did not complete; retry it |

Pages replace themselves as they finish. A page that fails stays visible in its original form rather than turning blank.

To see the original without re-decoding, turn on **Settings → Reader → WebGPU → Compare translation** while the chapter is open.

## Step 7 — Tune the wording

Open **Settings → AI translation → Translation prompts**. These settings apply to every provider and are the difference between a literal scanlation and something readable.

| Setting | Suggested start | Why |
|---|---|---|
| **Custom translation instructions** | "Keep honorifics. Use short, natural English. Do not localise names." | Carries style rules the model would otherwise ignore |
| **Formality** | **Match source** for manga; **Literary** for prose | Prevents a rude character from sounding polite |
| **Sound effects** | **Preserve SFX** when the art contains hand-drawn effects; **Translate descriptive SFX** for text-heavy pages | Stops the pipeline erasing effect art it cannot replace well |
| **Few-shot source / target** | One short line of dialogue and the tone you want | Acts as a style reference for every page |
| **Glossary** | One `term -> translation` mapping per line | Keeps names, spells and factions consistent |

A glossary can be plain lines:

```
先輩 -> senpai
魔法 -> magic
魔女 -> witch
```

or a JSON object:

```json
{ "先輩": "senpai", "魔法": "magic", "魔女": "witch" }
```

Prompt changes are fingerprinted. The next translation uses the new policy, and cached pages that depended on the old prompt are invalidated; pages produced under unrelated settings stay valid.

> [!TIP]
>
> Change one thing at a time and re-read the same page. A glossary fixes names; custom instructions fix tone; formality fixes register. Changing all three at once makes it hard to tell which one helped.

## Step 8 — Make it stick

| Goal | Setting |
|---|---|
| Reuse translated pages while the source, provider and prompt stay the same | **Cache translated pages** (on by default) |
| Translate chapters as they download, before you open them | **Auto-translate on download** |
| Keep translations beside the chapter instead of in the temporary cache | MangaTranslator only: **Cache permanently per chapter** |
| Wipe one series' translations | MangaTranslator only: **Manage per-manga translation cache** |
| Stop, pause, resume or retry chapters in flight | **Settings → AI translation → Manage active translations** |

The page cache is content-addressed and pruned least-recently-used first (about 2,000 pages), so it answers "has this exact page been translated under this exact configuration before" without growing without bound. MangaTranslator additionally offers a permanent per-chapter cache; its temporary cache is the one measured in days.

## Check it worked

- The status row says **ready**, **key set** or **logged in** — not "no model yet" or "API key missing".
- The reader chip advances through pages and the visible page changes language.
- Reopening the chapter is fast, and the chip does not re-run every page (cache hits).
- **Compare translation** shows the original page without a reload.
- **Manage active translations** shows no failed chapters once the chapter finishes.

## If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| Nothing translates | The per-series **Translate Manga** switch is off | Turn it on from the details page |
| "API key missing" | The key was entered for a different provider | Re-enter it under the selected provider |
| Every page fails immediately | Invalid model name or endpoint | Tap **Fetch available models**, pick a listed model, check the base URL for Custom OpenAI |
| Text is erased but not replaced | OCR found no readable text | Install the multilingual OCR add-on under **Models & engine** (needed for Latin scripts), and confirm the source language |
| Translation is tonally wrong | Prompt policy | Adjust formality and custom instructions; re-translate the page |
| A page stays in the original language | It failed or was skipped | Use **Retry** on the chip; if it says "no text detected", the page has no text to translate |
| Anonymous MangaTranslator is slow or refuses | Rate limit | Sign in under **Account** |
| The whole engine is unavailable | Device below the 3 GB gate, or a `nomtl` build | Use MangaTranslator, or a cloud provider on a capable device |

## Where to go next

- [Translate fully offline](/hyoukan/tutorials/translate-offline/) — local GGUF models, on-device stages and Gemini Nano.
- [AI translation reference](/hyoukan/guide/translation/) — every provider, model and cache rule.
- [Privacy & security](/hyoukan/guide/privacy/) — what leaves the device and when.
