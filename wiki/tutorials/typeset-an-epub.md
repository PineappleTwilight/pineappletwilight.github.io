---
title: Typeset an EPUB like a printed book
description: A guided walkthrough for font, spacing, justification, dark mode and custom CSS — turning an EPUB into a page that reads like print.
---

This tutorial takes one EPUB from its publisher's defaults to a deliberate page: a font you chose, a measure that fits the screen, justified text with hyphenation, and colours that survive night reading.

| | |
|---|---|
| **Time** | 15 minutes |
| **Needs** | An EPUB, and optionally a `.ttf`, `.otf`, `.woff` or `.woff2` font you like |
| **Ends with** | A reusable reading appearance, with per-book overrides only where the book needs them |

## What you'll build

The book reader is a WebView, not a text widget: the publisher's XHTML, CSS, fonts and illustrations survive. That is good by default and occasionally bad when a book hardcodes paper-sized margins or tiny type. The tutorial teaches both: a house style for most books, and the escape hatches for the ones that fight it.

## Before you start

| Check | Where | Expected |
|---|---|---|
| The book is in the library | Library | Tapping it opens the **book** reader, not the comic viewer |
| Reading appearance is reachable | **Settings → Book reading → Reading appearance** | The typography sheet opens; it is also in the reader's settings while a book is open |
| Optional font is on the device | Files app | A `.ttf`, `.otf`, `.woff` or `.woff2` file; imports are validated and copied into private storage |

## Step 1 — Get the book into the library

1. Open **Settings → Book reading → Import books**.
2. Pick one or more EPUB files.
3. Give the destination folder a name — this becomes the series name.
4. Confirm.

The books are copied into a new folder in the local source and appear as one series. For an existing folder of books, put it in the local source instead and refresh the source.

A folder whose chapters are all EPUBs is detected as a **book**. A mixed folder stays a comic. If a title is detected wrongly, open the entry's menu and choose **Render as book** (or **Render as comic**); the choice survives library updates.

## Step 2 — Choose how the book moves

Open the book, then open reading appearance from the reader's settings sheet (or from **Settings → Book reading → Reading appearance**).

| Setting | Options | Guidance |
|---|---|---|
| **Reading mode** | **Continuous scroll**, **Paged**, **Two pages** | Continuous for web novels and long sessions; Paged for a paper feel; Two pages for a tablet in landscape |
| **Page turn → Animation** | None, Slide, Slide vertical, Fade, Curl | None is the fastest and most readable; Curl is the most physical |
| **Animation speed** | Slider | Slower suits Curl; faster suits Slide |

Reading position is stored as a character offset plus the document URL, so changing mode, font size or orientation will not lose your place.

## Step 3 — Pick the typeface

Under **Font**:

- **Built-in fonts** are grouped into **Serif**, **Sans-serif**, **Monospace** and **Handwriting**.
- **Device fonts** uses the system's generic families.
- **Add a font…** imports your own file.

For long-form prose, a serif at a moderate size is the conventional choice; sans-serif reads better on low-density screens and for short sessions. Import a font when you have a specific book face in mind — the import is validated before acceptance, and a family you delete falls back to the default.

Then set:

| Setting | What it does |
|---|---|
| **Font size** | The base type size |
| **Font scale** | A second multiplier for the whole page |
| **Smooth text** | Anti-aliasing. Off uses LCD subpixels: sharper on light backgrounds, with colour fringing on coloured text |

> [!TIP]
>
> Set **Font size** first and leave **Font scale** at its default. Using both to enlarge type makes the relationship between body text and headings harder to reason about.

## Step 4 — Set the measure and the rhythm

These controls decide whether a page feels typeset or dumped.

| Setting | Suggested direction |
|---|---|
| **Line spacing** | Open it up until lines stop colliding; prose usually wants more than the publisher's default |
| **Paragraph spacing** | A small gap, or none if you prefer indented paragraphs |
| **Paragraph indent** | On for prose; the tri-state follows the publisher unless you override |
| **Indent length** | Match the gap to the type size; too large looks like a form |
| **Margins** (left, right, top, bottom) | Increase the side margins to shorten the line length — the single biggest readability win on a phone |
| **Justified alignment** | **Follow book**, justify or left-align. Justify only with hyphenation on |
| **Hyphenation** | On when justified; it removes the rivers of whitespace |
| **Word spacing** / **Font spacing** | Fine-tuning only; change after the measure is right |
| **Bold text** / **Italic** | Tri-state: follow the book, on, off |
| **Vertical writing** | Tri-state. A Japanese light novel stays vertical unless you override it |
| **Text outline** | A subtle outline for contrast on busy backgrounds |

The tri-states matter: "follow the book" is not the same as "off". A default of off would silently restyle a book that depends on its own CSS.

## Step 5 — Set the colours

1. Set **Background colour** and **Font colour**. Picking a background derives a contrasting text colour automatically.
2. Turn on **Force dark** for night reading.

Force dark is a palette rewrite, not a filter: the canvas becomes your dark surface, text is derived from it, classed element backgrounds are neutralised, and illustrations keep their original colours. That is why it does not turn a colour plate into a negative.

If text becomes invisible, the page and text colours are probably both dark. Reset one of them, or turn Force dark off and choose a light-on-dark pair manually.

## Step 6 — Override a stubborn publisher

Some books hardcode pixel font sizes, fixed page widths or paper-tuned spacing. Two tools, in order of preference:

1. **Ignore publisher styles** — drops the book's stylesheets and keeps the reader's. Inline `style` attributes survive on purpose; the switch is about stylesheets, not rewriting the markup.
2. **Custom CSS** — injected as the document's last stylesheet, so normal cascade ties fall your way.

For a book that resists both, add `!important` to the specific declarations.

### A small custom stylesheet

Open **Custom CSS → Inject custom CSS → Edit custom CSS** and try:

```css
/* A quieter scene break than a full-width rule */
hr {
  border: 0;
  margin: 1.8em 0;
  text-align: center;
}
hr::after {
  content: "❦";
  font-size: 1.1em;
  letter-spacing: 0.3em;
}

/* Do not indent the first paragraph after a heading */
h1 + p,
h2 + p,
h3 + p {
  text-indent: 0 !important;
}

/* Keep very wide tables from forcing a horizontal scroll */
table {
  max-width: 100% !important;
  font-size: 0.9em;
}
```

CSS applies live. It can restyle, but it cannot remove content.

**Custom JavaScript** is a separate switch, off by default. An injected script runs with the reader's trust inside every downloaded book, so enable it only for code you wrote or reviewed. JavaScript changes apply on the next page turn, because re-running code on every keystroke would double-register listeners.

## Step 7 — Add the reading aids

| Aid | Where | Use |
|---|---|---|
| **Highlights & selection actions** | Reading appearance | Four pen colours, copy and dictionary look-up; highlights survive reflow |
| **Footnote popups** | Reading appearance | Tapping a labelled note shows it beside the text, even from another file |
| **Read aloud** | Reading appearance | System TTS in document order, chaining across the book and turning pages |
| **Speech rate** | Reading appearance | Adjust TTS speed |
| **Auto-scroll** | Reading appearance | Continuous drift at a chosen dp/s; timed page turns in paged mode |
| **Status line → Show** | Reading appearance | Clock, chapter progress, chapter name and battery |
| **Status line → Position / Text size / Colour** | Reading appearance | Top or bottom, sized and coloured to stay quiet |

Auto-scroll pauses when you touch the screen and stops at the end of the book. The status line hides with the menus unless you ask it to stay.

## Check it worked

- The body text uses the font you chose, at a line length you set with the margins.
- Justified text has no large white rivers (hyphenation is doing its job).
- Reopening the book lands on the same paragraph, not the same page number.
- Force dark leaves illustrations in colour.
- A footnote opens in place instead of navigating away.
- Custom CSS appears without a restart.

## If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| A book opens as a comic | Entry type was overridden, or the folder is mixed | Use **Render as book** |
| Styles or images are missing | The book references resources outside the archive | The inliner embeds local resources; truly external URLs are not copied |
| Text is invisible on a dark theme | Page and text colours are both dark | Enable Force dark, or pick a contrasting pair |
| The publisher's tiny type survives | Its stylesheet hardcodes sizes | **Ignore publisher styles**, then set size again |
| Custom CSS does nothing | Inline styles or higher specificity win | Target the element more precisely, or use `!important` |
| Pages do not turn in Paged mode | The chapter is not a text book, or an old build | Confirm the book is text and update the app |
| A downloaded book says "No pages found" | It is being treated as an image chapter | Update; downloaded books need the downloaded-book loader |
| Imported font is rejected | Not a recognised font, unreadable, or too large | Try a standard `.ttf` / `.otf`; check the error |

## Where to go next

- [Reading books reference](/hyoukan/guide/books/) — every typography control, positions and footnotes in full.
- [Files & formats](/hyoukan/reference/formats/) — what the local source expects on disk.
- [Calibrate the reader](/hyoukan/tutorials/calibrate-the-reader/) — the same colour and display discipline for image pages.
