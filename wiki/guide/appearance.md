---
title: Appearance & identity
description: Themes, dynamic colour, launcher icons, app names and the interface options that make Hyoukan yours.
---

Hyoukan's look is set by two layers: the **app theme**, which colours the interface, and **reader appearance**, which colours the page. They are configured separately because reading wants different answers from browsing.

## Themes

**Settings → Appearance → Theme.**

### Colour schemes

Hyoukan ships named schemes plus a custom one:

| Family | Schemes |
|---|---|
| Classic | Tachiyomi, Monochrome, Yin Yang, Yotsuba |
| Dark and moody | Doom, Matrix, Midnight Dusk, Nord |
| Soft and pastel | Catppuccin, Cottoncandy, Lavender, Mocha, Strawberry |
| Vivid | Cloudflare, Green Apple, Sapphire, Tako, Teal Turquoise, Tidal Wave |
| Adaptive | Monet (Material You), Custom |

**App theme** chooses light, dark or system. **Pure black dark mode** makes the dark theme AMOLED-black.

### Dynamic colour

- **Theme based on cover** derives a palette from the entry's cover.
- **Cover based theme style** selects how that palette is built — tonal spot, neutral, vibrant, expressive, rainbow, fruit salad, monochrome, fidelity or content.
- **Monet** derives a palette from the wallpaper on Android 12+, and the app's own sampler makes wallpaper palettes work below Android 12 too.
- **Palette Personalizer** lets you pick a seed colour and a style for the custom scheme.

Dynamic colour is optional; a named scheme stays stable regardless of what you open.

## App icon and name

**Settings → Appearance → App icon & name.**

Android does not allow an installed app to replace its own launcher icon or label at runtime. Hyoukan works within that rule:

### Built-in icons

Six stock icons are declared as activity aliases:

**Forest · Midnight · Sakura · Ocean · Ember · Paper**

Switching takes effect immediately; some launchers need a moment to redraw. Exactly one alias is enabled at a time.

### Custom image and name

A custom image cannot replace the installed icon, so the app **pins a home-screen shortcut** that carries your image and name. The flow:

1. **Choose image** — any image from storage.
2. **Crop** fills the square by trimming the edges; **Fit** keeps the whole image on a transparent square.
3. **Custom app name** — shown on the shortcut and in the About screen.
4. **Add home-screen shortcut** — the launcher may ask for confirmation.
5. **Remove image** — deletes the stored image and shortcut.

The source image is stored at up to 1024 px, and the square icon is derived from it, so changing Crop/Fit does not require picking the image again. The custom name is in-app and on the shortcut only; it does not rename the installed app.

> [!NOTE]
>
> If your launcher shows both the stock icon and the custom shortcut, that is expected: the shortcut is a separate launcher entry, not a replacement.

## Language and formatting

- **App language** — follow the system or pick a language from the translated catalogue.
- **Date format** — choose the pattern used across the app.
- **Relative timestamps** — "2 hours ago" instead of an absolute date.
- **Statistics cover style** — square/compact or book/full.

## Interface options

**Settings → Appearance:**

| Setting | Effect |
|---|---|
| **Tablet UI** | Automatic, always on or always off; the two-pane layout uses a rail |
| **Rail button alignment** | Start, centre or end |
| **Panorama cover** | Show a wide cover in landscape |
| **Align cover to top** | Cover at the top of the details page |
| **Cover loading spinner** | Spinner or plain placeholder while a cover loads |
| **Render images in descriptions** | Show remote images inside entry descriptions |
| **Censor lewd manga** | Blur thumbnails and redact titles, tags and descriptions |
| **Expand all search filters by default** | Open source filters expanded |
| **Recommendations / Merge in overflow** | Move those actions into the overflow menu |
| **Previews row count** | How many related/preview items appear |
| **Show updates in the nav** | Show or hide the Updates tab |
| **Show history in the nav** | Show or hide the History tab |
| **Always show nav labels** | Keep labels visible under the tab icons |

## Reader appearance

The comic reader's display settings are under **Settings → Reader** and the in-reader settings sheet:

- background colour, fullscreen, cutout handling;
- page number, flash on page change, keep screen on;
- tap zones, zoom, crop, dual-page layout, side padding;
- WebGPU brightness, contrast, LUTs, smart dark, e-ink, transitions;
- preload and cache.

The book reader has its own **Reading appearance** tab: typography, colours, spacing, fonts, highlights, footnotes, read-aloud, status line, auto-scroll, page mode and custom CSS/JS. See [Reading books](/hyoukan/guide/books/#typography).

## What's new

After an update, the app can show a **What's new** dialog with the release highlights. It is also available from **About → What's new**. The dialog is informational; it does not change settings.

## Keeping a consistent look

- Named themes are the stable choice: they do not change with the content you open.
- Cover-based theming is the lively choice: the interface follows the current entry.
- For e-ink, combine the e-ink reader preset with a high-contrast monochrome scheme and no page transitions.
- For AMOLED, enable pure black and keep cover-based theming off if you want true black everywhere.
