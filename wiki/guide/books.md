---
title: Reading books
description: EPUB and web-novel reading — typography, navigation, highlights, footnotes and read-aloud.
---

Hyoukan treats text as a first-class reading format. An `.epub` is not rendered as a stack of screenshots; it is opened as a **book**, with the publisher's XHTML, stylesheets, fonts and illustrations intact.

## What can be read as a book

| Format | How it gets here |
|---|---|
| **EPUB 2** | Local source, Komga, a text-source extension |
| **EPUB 3** | Same; `nav.xhtml` contents are read as well as `toc.ncx` |
| **Plain text web novels** | A source that returns `Kind.PLAIN` text pages |
| **Downloaded EPUBs** | Stored with the chapter and opened from disk, no network needed |

A book's chapter list is one library chapter per file in the library, but inside the reader the book's own spine is the unit of navigation. A five-hundred-file novel opens immediately because only the current section is read; the rest are loaded as you approach them.

DRM-locked books are detected and refused with an explanation. Font obfuscation (`http://www.idpf.org/2007/embed`) is not DRM and is ignored, because the text is still readable.

## Getting books into the library

### Local files

Put a folder of EPUBs in the local source directory, or use **Settings → Book reading → Import books** to copy one or more EPUBs into a new local-source folder. A folder whose chapters are all EPUBs is detected as a **book**; a mixed folder stays a comic. The detection reads the book's content, not just its extension — a title page and a copyright leaf look like prose to a shape test.

You can override the type per entry with **Render as book** / **Render as comic**. The choice survives library updates and refreshes.

### Komga

A Komga series that contains EPUBs is listed in full, and each EPUB opens in the book reader. Configure the server under **Browse → Sources → Komga → Settings**.

### Extensions

Any extension implementing the `TextSource` interfaces gets the book reader automatically. See [Extensions & source API](/hyoukan/development/extensions/#text-sources).

## Reading modes

The book reader has three layouts, chosen in **Reading appearance → Page mode**:

| Mode | Behaviour |
|---|---|
| **Continuous** | The book scrolls like the continuous manga viewer. The next section is appended before you reach the end, and the previous one is prepended above you. |
| **Paged** | One column per screen, turned like a paper book. |
| **Double** | Two columns per screen — the open spread. |

Pagination is CSS multi-column inside the same WebView. The body becomes the scroll container, so a vertical-writing or right-to-left book can lay its columns right-to-left and scroll toward negative offsets; the reader exposes a normalised position where forward is always `+1`.

**Page-turn animations** (paged mode) are off by default. Choose the page sliding off, a dissolve, or a spine swing, with an adjustable speed.

## Navigating a book

- **Table of contents** — the book's own ToC, indented like a printed contents page and opened at your current position. Entries pointing at another chapter are shown disabled rather than hidden, so the structure stays visible.
- **Previous / next section** — the bottom-bar buttons step the book's own sections; volumes turn only at the ends.
- **Slider** — shows progress through the current chapter as a percentage and is draggable to seek.
- **In-chapter search** — type to search the open chapter, case-insensitively. Results show context snippets and jump straight to the match.
- **Tap zones** — a tap scrolls; at the document's edge it turns the section. Vertical-writing books get the correct axis and tap direction automatically.
- **Long-press an illustration** — opens it full-screen with pinch and double-tap zoom, plus **Set as cover**.

The chapter selector in the bottom bar becomes the book's contents list while a book is open. A book is one library chapter, so the ordinary chapter list would show a single row; the book's own ToC is far more useful.

## Typography

**Settings → Book reading → Reading appearance** is also available from the reader's own settings sheet while a book is open.

### Text

| Setting | Notes |
|---|---|
| **Font size** and **scale** | Independent size and page scale |
| **Font family** | Generic families, bundled families, or fonts you import |
| **Bold text** | Tri-state: follow the book, on, off. Bolding applies to body text, not headings or emphasis |
| **Italic** | Tri-state |
| **Line spacing**, **paragraph spacing**, **letter spacing**, **word spacing** | Typography controls |
| **Paragraph indent** | Tri-state |
| **Margins** | Page margins, applied to the text column rather than the page frame |
| **Justification** | Tri-state: follow, justify, left-align |
| **Hyphenation** | Tri-state |
| **Vertical writing** | Tri-state; a Japanese light novel stays vertical unless you override it |
| **Text outline** | A subtle outline for contrast on busy backgrounds |

The tri-states matter: `null` means *follow the publisher*. A default of "off" would silently restyle a book that depends on its own CSS, and it could not be undone by the book.

### Colours

- **Page colour** and **text colour**, with the text colour auto-derived for contrast when you pick a page colour.
- **Force dark** is a palette rewrite, not a filter: the canvas becomes your chosen dark surface, text is derived from it, classed element backgrounds are neutralised, and illustrations keep their original colours.
- The general reader theme (including AMOLED black) reaches the book too.

### Fonts

Hyoukan bundles a curated set of variable fonts — serif, sans, mono and handwriting — each with its licence. You can also import:

- `.ttf`, `.otf`, `.woff`, `.woff2`;
- files up to the import limit;
- any family from device storage, including files a provider mislabels as `application/octet-stream`.

Imports are validated before acceptance (`NotAFont`, `TooLarge`, `Unreadable` are reported), copied into private storage, and offered in the picker with a delete action. A deleted family that is currently selected resets the setting.

### Ignore publisher styles

Drops the book's own stylesheets and keeps the reader's. This is the escape hatch for books that hardcode pixel font sizes, page-width boxes or paper-tuned spacing. Inline `style` attributes survive on purpose; the switch is about stylesheets, not about rewriting the book's markup.

### Custom CSS and JavaScript

- **Custom CSS** (on by default, empty by default) is injected as the document's last stylesheet, so `!important` ties fall your way. It can only restyle; it cannot remove content.
- **Custom JavaScript** is off by default and carries a security note: an injected script runs with the reader's trust inside every downloaded book. When enabled, it is injected after the reader bridge, so `window.KmkReader` exists.

CSS changes apply live. JavaScript changes apply on the next page turned, because re-running code on every keystroke would double-register listeners.

## Highlights and selection

Select text to get:

- four pen colours;
- **Copy**;
- **Look up** — the system web search, or ColorDict/GoldenDict when installed.

Highlights persist per chapter and are anchored to the quoted text, so they survive font changes, margin changes and reflow. Tapping inside a highlight removes it. The feature can be turned off in Reading appearance.

## Footnotes

Tapping a note reference opens a small popup beside the text, wearing the book's own typography and including images. Notes in another file are read out of the book on the spot. Anything that cannot be shown falls back to the ordinary link behaviour, so a tap never becomes a dead end.

Only notes the book actually labels are treated as footnotes: `epub:type="noteref"` / `footnote` and the usual id/class conventions. Unlabelled links navigate as before.

## Read-aloud

**Reading appearance → Read-aloud** speaks the current document through the system text-to-speech engine:

- sentences are chunked in order;
- the rate is adjustable;
- the queue chains across the book, turning the page when a document is finished;
- it works in continuous and paged modes.

## Auto-scroll

In continuous mode, auto-scroll moves the page at a chosen dp per second — from a slow drift to a brisk walk. Touching the screen pauses it; it self-stops at the end of the book and runs off the end of a chapter exactly as a finger drag would. In paged mode the same row becomes timed page turns.

## Status line

A quiet line at the top or bottom of the page, each field toggleable:

- clock;
- chapter progress;
- chapter name (from the ToC, falling back to the document name);
- battery level.

It has its own size and colour and is off by default. It hides with the menus unless you ask it to stay.

## Positions and progress

Reading position is stored as a **character offset** in a document, plus the document's URL — not a page index. That means:

- changing font size, margins, orientation or device does not lose your place;
- a book reopens on the same paragraph on a phone, a tablet or in landscape;
- a stored position still resolves if the document list is renumbered (for example after toggling the cover page).

Chapters are weighted by character length for the book's overall progress, so a book with two hundred one-paragraph interstitial files does not read as 2% done.

Per-chapter positions live in a private preference, not a database column: a position is a property of how the document happens to lay out today, and losing one costs a single position.

## The cover page

Most EPUBs keep the cover out of the spine. When the book declares a cover and the spine does not already show it, the reader synthesizes a cover page at index 0. Every later document shifts up by one, consistently across search hits, positions and the page list. Turning the cover page off shifts everything back without losing your place, because positions carry the document URL.

## Offline books

Downloading an EPUB chapter stores the book file with the chapter and opens it from disk through the downloaded-book loader. This is how a Komga EPUB stays readable offline. A book chapter is never wrapped in a CBZ — an EPUB inside a CBZ is not a book.

## Troubleshooting

- **A book opens as a comic** — the entry type was overridden, or the folder is mixed. Use **Render as book**.
- **Styles or images are missing** — the book may reference resources outside the archive. The inliner embeds images, CSS and fonts; truly external URLs are not copied.
- **The text is invisible on a dark theme** — enable Force dark, or check that the page and text colours are not both dark.
- **Pages do not turn** — update; paged layout used to be disabled by a script error. If it persists, check that the page mode is actually Paged and that the chapter is text, not images.
- **A downloaded book says "No pages found"** — the chapter is being treated as an image chapter. Downloaded books must use the downloaded-book loader; update the app.
