---
title: Achievements
description: Ranks, tiers, secret and shame achievements, rotating challenges and the completion sound.
---

Hyoukan has a collectible achievement system with more than 150 achievements. It is entirely optional: nothing unlocks until you finish onboarding and explicitly decide to have achievements.

## Turning it on

Achievements live under **More → Settings → Achievements**:

| Setting | Effect |
|---|---|
| **Enable achievements** | Master switch |
| **Achievement popups** | Show a toast when one unlocks |
| **Achievement sounds** | Play a sound on unlock |
| **Wipe achievement data** | Reset everything, behind a double confirmation |

If you never opt in, the tracker stays out of your way and no progress is recorded.

## Tiers and ranks

Achievements have seven tiers:

**Bronze → Silver → Gold → Platinum → Legendary → Mythic → Ultimate**

Tiers drive the card colour and the animated gradient. Your overall **rank** is computed from the number of unlocked achievements, chapters read and series finished:

| Rank | Requirements |
|---|---|
| **Novice** | Default |
| **Apprentice** | 8 unlocked |
| **Explorer** | 18 unlocked |
| **Veteran** | 35 unlocked and 250 chapters read |
| **Master** | 60 unlocked, 500 chapters read, 8 finished |
| **Legend** | 90 unlocked, 1,000 chapters read, 15 finished |
| **Mythic** | 120 unlocked, 2,000 chapters read, 25 finished |
| **Ultimate** | 150 unlocked, 5,000 chapters read, 50 finished |

**Negative achievements** never count toward rank or progress. **Secret achievements** show as `???` until unlocked.

## Categories

| Category | Examples |
|---|---|
| **Reading** | Chapter milestones, streaks, binge days, completion, rereads, reading modes, reading time |
| **Library** | Library size, custom covers, categories and subcategories, backlog, merges, backups |
| **Tracker** | Connecting services, scoring, status updates, filling metadata, definitive trackers |
| **Translation** | Pages and chapters translated, offline/local providers, glossaries, metadata translation |
| **Social** | Discord RPC, webhooks, completion sounds, easter eggs |
| **Exploration** | Downloads, sources, E-Hentai, WebGPU, data saver, search, restore |
| **Rotating** | Daily and weekly challenges drawn from a pool |

Examples from the catalogue: *First Steps* (read one chapter), *Marathon* (500 chapters), *Unbreakable* (100-day streak), *Ink Drinker* (10,000 chapters), *Hoarder Backup*, *Omni-Tracker* (8+ trackers), *Babel Fish* (100 translated chapters), *Pixel Purist* (100 upscaled pages), *GPU Reader*, *Phoenix* (restore a backup), *Mango Found* (a secret), and the Ultimate-tier *Ink God*, *Eternal Library*, *Time Dilation* and *Absolute Perfection*.

## Rotating achievements

The rotating pool gives you a small set of **daily** and **weekly** challenges:

- The pool rotates on a fixed daily/weekly boundary.
- Each challenge has a real progress bar, not just a yes/no.
- The achievements tab puts active rotating challenges first.
- Progress is persisted; a restart does not lose it.
- Rotating achievements include reading, library, tracker, translation, cover art, backup, upscale and reading-mode challenges.

## Shame achievements

Negative achievements record the things readers admit to:

- *Binge Guilt* — 100 chapters in a day, then nothing for three days.
- *Abandoned* — 50 entries added, none finished.
- *Burnt Out* — reading past 3 AM five times.
- *Spoiler Alert* — skipping to the last chapter without reading the middle.
- *Hoarder's Shame* — 500 entries, zero finished.
- *Rage Quit* — ten dropped series.
- *Do Not Disturb* — ignoring 20 update notifications.

They are collectible, but they do not advance your rank. The stats screen shows a separate negative count.

## The stats screen

The achievements screen summarises:

- unlocked / total;
- rank;
- chapters read;
- series finished;
- library size;
- reading hours;
- negative achievements;
- backlog count.

It also has the **All achievements** grid, which scrolls as one list rather than trapping the page in an inner scroller.

## No-MTL builds

Achievements that require the translation engine are filtered out of `nomtl` builds entirely — lists, counts, stats totals and unlock lookups stay consistent. Upscaling achievements remain, because upscaling is not MTL-gated.

## Chapter completion sound

Separate from achievements, the reader can play a randomized sound when a chapter finishes:

- **60% common, 30% rare, 10% legendary**;
- **50/50 placement**: half on the last page, half between chapters;
- user-provided sound packs;
- a dedicated **NSFW chapter completion sound** toggle.

The *Audible Joy* and *Legendary Moan* achievements track enabling it and hearing the rare tier.

## Persistence

Achievement progress is stored in ordinary preferences (not a private store), so it travels with **App settings** in a backup and through sync. A restore therefore keeps your unlocks, counters and streaks; wiping achievement data resets them deliberately.

> [!NOTE]
>
> Achievements are a single-player record. Nothing is uploaded, compared or shared unless you share a screenshot yourself.

## Tips

- Long streaks and reading-time achievements count **organic** reading — opening a chapter and actually reading it, not just marking it read.
- Completion achievements count a series once, no matter how often you reopen its last page.
- Rotating challenges are the fastest way to earn tiers you have not reached yet.
- Secret achievements are hidden until unlocked; several are tied to unusual reading modes and settings.
