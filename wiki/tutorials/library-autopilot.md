---
title: Put your library on autopilot
description: A guided walkthrough for scheduled updates, auto-download, delete-after-reading, tracker sync, the feed and a backup safety net.
---

This tutorial wires the library so it keeps itself current: updates run on a schedule, new chapters download before you ask, finished chapters clean themselves up, and progress reaches your tracker without a manual edit.

| | |
|---|---|
| **Time** | 20 minutes |
| **Needs** | A library with entries, at least one category, and (optionally) a tracker login |
| **Ends with** | A repeatable weekly rhythm: update → download → read → sync → clean up |

## What you'll build

Nothing here changes how a page renders. The result is behavioural: fewer taps, less storage drift, and a library that reflects what you are actually reading.

## Before you start

| Check | Where | Expected |
|---|---|---|
| Storage location is set | **Settings → Data and storage → Storage location** | A valid folder. Downloads cannot start without it |
| Battery optimisation is off for Hyoukan | **Settings → Advanced → Disable battery optimization** | Scheduled work is allowed to run |
| A backup exists | **Settings → Data and storage → Create backup** | A recent `.tachibk` file |
| Tracker (optional) | **Settings → Tracking → Trackers** | At least one service logged in, or an enhanced tracker discovered |

## Step 1 — Build the shelves first

Automation follows categories, so the categories have to mean something.

1. Open **More → Categories** (or **Settings → Library → Edit categories**).
2. Create shelves you will actually use — for example **Reading**, **On hold**, **Completed**, **Scans**, **Webtoons**.
3. Nest subcategories where it helps. A category is a label, not a folder; an entry can be in several.
4. For each category, open its settings and set **Update interval**. Leave it on **Use the global setting** unless that shelf needs a different rhythm.

A category can also pin a reading mode and orientation for everything on it. That is how a webtoon shelf opens in continuous mode without per-entry fiddling.

### Make status shelves move themselves

A **smart category** is bound to a tracker status. When an entry's status changes on a tracker — or you finish the first chapter of something in *Wish to read* — it moves into the matching category.

- Only categories you explicitly bind are touched.
- The move is one-way and idempotent; it never removes an entry from unrelated shelves.
- Unbound categories are never modified.

This is the difference between a category you maintain and a shelf that stays current.

## Step 2 — Schedule updates

Open **Settings → Library → Global update**.

| Setting | Recommended for autopilot |
|---|---|
| **Automatic updates** | Daily, or every 12 hours for fast-release series |
| **Automatic updates device restrictions** | Wi-Fi only and charging only, if battery matters |
| **Launch behaviour** | "Launch global updates only for ungrouped, category updates for others" once categories have their own intervals |
| **Skip entries with unread chapter(s)** | On, if you do not want updates to pile up chapters you have not read |
| **Skip unstarted entries** | On, if a large "Plan to read" shelf should stay quiet |
| **Skip entries with "Completed" status** | On, for a finished-series shelf |
| **Smart update** | On — predicts the next release from the series' calendar instead of counting days |
| **Refresh metadata** | Optional; it re-fetches covers and details during updates |

The shortest interval among an entry's categories wins. A category with no interval follows the global one.

> [!TIP]
>
> Leave **Launch global updates** off once every shelf has an interval. The category schedule then does the work, and a cold start is not spent refreshing the whole library.

## Step 3 — Decide what downloads itself

Open **Settings → Downloads**.

| Setting | Effect | Watch out for |
|---|---|---|
| **Download new chapters** | Downloads chapters fetched by library updates | Turns every update into network traffic and storage use |
| **Download ahead** | Pre-downloads the next chapters of what you are reading | Works only when the current chapter and the next one are already downloaded |
| **Auto download while reading** | Downloads the current and next chapter as you read | Only starts when both are already partially available |
| **Skip downloading duplicate read chapters** | Avoids re-downloading a chapter you read elsewhere | Leave on |
| **Excluded categories** | Entries here are never auto-downloaded | An entry in both an included and an excluded category is excluded |

Set **Concurrent source downloads**, **Concurrent page downloads** and **Download threads** conservatively. Two or three threads is a sane default; higher values trigger rate limits on some sources.

The queue survives leaving the app and a full close; **More → Download queue** shows it.

## Step 4 — Decide what cleans itself up

Still under **Settings → Downloads**:

| Setting | Effect |
|---|---|
| **Delete chapters after reading** | Off, after the last read chapter, or the second/third/fourth/fifth to last |
| **After reading automatically delete** | Delete a chapter once it is read |
| **Allow deleting bookmarked chapters** | Whether a bookmark protects a chapter from automatic cleanup |

The safe pattern is: keep bookmarked chapters, delete only what you have read, and leave a buffer of one or two chapters behind the current position. If you re-read often, set the buffer larger or turn automatic deletion off and clean up monthly.

## Step 5 — Let tracking keep up

Open **Settings → Tracking**.

1. Log in to at least one tracker under **Trackers**.
2. Turn on **Update progress after reading**.
3. Turn on **Update progress when marked as read** if you also mark chapters manually.
4. Turn on **Auto sync progress from trackers** to pull changes made on the service.
5. For an entry that exists on several services, set a **definitive tracker** on the entry or its category. That is the record used for status updates and smart-category moves, which prevents two trackers from tugging the shelf in different directions.

Progress updates are rate-limited and retried. A tracker that is offline does not block reading; the update is queued.

## Step 6 — Build a feed from searches you trust

1. Run a search on a source and **save** it.
2. Open **Browse → Feed**.
3. Add the saved searches you want in the stream.
4. Turn on **Hide entries already in the library**.
5. Optionally move the Feed to the front of Browse, or hide the tab if you prefer the library.

The feed is not a recommendation engine; it is the set of searches you already trust, evaluated together.

## Step 7 — Add the offline safety net

| Goal | Setting |
|---|---|
| Read only what is on the device | **Downloaded only** in the library filter |
| Keep recently read chapters around | **Settings → Data and storage → Chapter cache retention** (12 hours to 30 days) |
| See what is taking space | **Data and storage → Downloaded and cached content** |
| Remove downloads for entries you removed | **Data and storage → Delete downloads not in library** |
| Recover from a bad week | **Automatic backup frequency** — hourly to weekly, keeps the four most recent |
| Catch corruption automatically | The app's rolling local database backup and startup check run without configuration |

Downloaded chapters and the chapter cache are different things. Downloads are explicit and kept until deleted; the cache is evictable and can be cleared without losing anything you deliberately saved.

## Step 8 — Optional: make events visible

**Settings → Connections → Webhooks** can send a Discord webhook or a generic JSON payload when something happens:

- chapter started or read;
- entry added, removed, finished, started or migrated;
- library update finished;
- downloads finished;
- backup created or restored;
- achievement unlocked.

Paste the URL, select the events, exclude categories you do not want announced, and use **Send test notification** before trusting it.

## Check it worked

- The next scheduled update adds chapters without prompting.
- New chapters for opted-in entries appear in the download queue.
- A chapter you finish disappears after the configured buffer, while a bookmarked one stays.
- Tracker progress matches the last chapter you read.
- The feed shows new entries from your saved searches.
- **Downloaded and cached content** shows a stable, explainable size rather than unbounded growth.
- A recent automatic backup exists.

## If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| Updates never run | Battery optimisation, wrong interval, or device restrictions | Exempt Hyoukan from optimisation; check the category interval and Wi-Fi/charging requirements |
| New chapters do not download | **Download new chapters** off, category excluded, or no storage location | Check all three |
| Nothing downloads at all | Storage location unset or invalid | Re-select it under **Data and storage** |
| Delete-after-reading removed something you wanted | Buffer too small or bookmark protection off | Increase the buffer; bookmark the chapter; disallow deleting bookmarked chapters |
| Tracker progress does not update | Entry not linked, setting off, or rate limit | Link the tracker, check both update settings, wait for the retry |
| Smart category never moves | Category not bound, or the tracker reports no status | Bind the category and confirm the tracker status |
| Storage keeps growing | Downloads are kept independently of the cache | Use **Downloaded and cached content**, then delete orphans |
| A webhook fires for the wrong shelf | Excluded categories incomplete | Add the category to the exclusion list |

## Where to go next

- [Library & categories](/hyoukan/guide/library/) — categories, smart shelves and update rules in full.
- [Downloads & storage](/hyoukan/guide/downloads/) — the queue, cache retention and cleanup.
- [Backup & sync](/hyoukan/guide/backup-sync/) — automatic backups, restore and multi-device sync.
- [Tracking](/hyoukan/guide/tracking/) — every service and the definitive-tracker rules.
