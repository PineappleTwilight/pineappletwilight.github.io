---
title: Book engine
description: The EPUB parser, the text-source API and the WebView-based novel viewer that renders real books.
---

The book reader is two layers: a pure-Kotlin EPUB engine in `core:archive`, and a WebView-based viewer in `ui/reader/viewer/novel/`. The split is deliberate — the parser can be tested without Android, and the viewer can be changed without re-parsing a book.

## Why a WebView

An EPUB **is** an XHTML document with the publisher's stylesheet. Drop caps, ruby, columns, vertical writing and tables are browser features. Re-implementing them in Compose means re-implementing a browser. The reader therefore builds a self-contained HTML document and hands it to a WebView, layering the reader's preferences on as an injected stylesheet.

## The EPUB engine

Package root: `mihon.core.archive.*`.

| Class | Purpose |
|---|---|
| `ArchiveReader` | Memory-mapped archive reading via libarchive (JNI); detects encryption |
| `ArchiveInputStream` | Stream over the mmap'd archive with passphrase support |
| `EpubReader` | Parses a book into `EpubBook` and streams documents |
| `EpubBook` | Metadata, manifest, spine, TOC, encryption state |
| `EpubXmlReader` | Namespace-aware pull parser for structural documents |
| `EpubOpfParser` | One pass over `content.opf` |
| `EpubTocParser` | EPUB 2 `toc.ncx` and EPUB 3 `nav.xhtml` |
| `EpubEncryptionParser` | `encryption.xml` |
| `EpubPaths` | Pure reference resolution (relative, absolute, `..`, percent-encoding) |
| `EpubArchiveUrls` | Translation to and from the reserved `https://book.internal/` origin |
| `EpubFootnotes` | Bounded extraction of a note element by id/name |
| `EpubTextSource` | Presents a book as a `TextSource` |

### Namespace-aware parsing

Jsoup's XML mode keeps the literal prefix in the tag name, so `dc:title` is not `title` when a book binds Dublin Core to `dcterms:`. Every match is on the **namespace URI**, not the prefix.

### What the parser handles that a naive one does not

- **Both TOC formats** — EPUB 3 `nav.xhtml` (only when `epub:type="toc"`; a plain `<nav>` is a landmarks list) and EPUB 2 `toc.ncx`.
- **DRM** — `encryption.xml` distinguishes font obfuscation (`http://www.idpf.org/2007/embed`, harmless) from real DRM (`EpubReader.hasDrm`).
- **Percent-encoding** — stored zip names and manifest hrefs do not always match byte for byte. Decoded and re-encoded spellings are offered as *fallbacks*, never inside `resolve`, so `%2E%2E` cannot become a directory escape.
- **Charset** from the XML prolog, not assumed UTF-8.
- **Byte-order mark** — a leading `\uFEFF` is stripped from every decoded document.
- **Authority case** — a renderer can hand back `HTTPS://Book.Internal/…`; URL matching is case-insensitive.
- **Missing manifest items** — a spine idref with no manifest entry is dropped, because a placeholder would be a chapter that can never open.

### The parser's one rule

`EpubXmlReader.textContent()` must stop on the element's **own** end tag: `depth <= startDepth`, not `< startDepth`. Stopping one tag too far made `EpubTocParser` lose every other `<li>` and `EpubOpfParser` re-enter its `when` on an end tag, consuming the rest of `<metadata>`.

The general rule: a pull-parser walk that calls a consuming helper must advance afterwards, and the helper must stop where its contract says.

### Two spines, two meanings

- `textDocuments()` — the book as prose, one page per spine item. **The reader uses this.**
- `getImagesFromPages()` — every `<img>` in every spine document. The local source uses this to treat an EPUB as an art book.

Do not confuse them.

### Cover page

Most EPUBs keep the cover out of the spine. `EpubTextSource` prepends a **synthesized cover page at index 0** when:

- the reader's `wantsCoverPage` says so (the app combines the cover toggle with "show illustrations");
- the archive actually contains the declared cover;
- the first spine document does not already embed it.

Every later document shifts up by one. Search hits, positions and the page list all speak the shifted coordinates; `NovelProgress.Position` carries the document **URL** as well as its index, so a stored position still resolves after renumbering.

The cover is a complete document naming the image by archive path, resolved against the archive-root base. Its markup is styled by the reader's injected CSS (`body.kmk-cover`, `img#kmk-cover-img`).

### Series metadata

`EpubBook.metadata` carries `series` and `seriesIndex` from either convention:

- **Calibre** — `calibre:series` / `calibre:series_index` attribute metas; no confirmation needed.
- **EPUB 3** — `belongs-to-collection`, confirmed by a `collection-type` meta containing `series`. A book with one collection may omit the refine. `group-position` stands in for the index when Calibre's is absent.

The local source leads the chapter name with `"Series: Volume"` when the book declares one, skipping the prefix if the title already opens with the series name.

## The text source API

The book reader is source-agnostic. Any extension implementing `TextSource` gets it. See [Extensions & source API](/hyoukan/development/extensions/#text-sources) for the interface list. The contracts that matter here:

- `TextPage.url` must be stable across refreshes — it is the identity for positions and annotations.
- `TextPage.text` must be self-contained.
- `TextPage.baseHref` is the directory the document sits in, not the archive root.
- Return natural units (spine items, one webnovel chapter per page), never pre-paginated chunks.

## The novel viewer

Package `ui/reader/viewer/novel/`, one concern per file:

| File | Concern |
|---|---|
| `NovelWebViewer.kt` | WebView, taps/keys, document and chapter turning, continuous window orchestration, the provider |
| `NovelDocument.kt` | Builds one spine item into a document the engine can load |
| `NovelPageLayout.kt` | Column CSS, `KmkPaged` bridge, pure parsers |
| `NovelContinuous.kt` | Segment markers, probe, append/prepend/trim/seek scripts |
| `NovelInline.kt` | Rewrites images and stylesheets to `data:` URIs |
| `NovelPlainText.kt` | Webnovel plain text → paragraph HTML, cleanup passes, speech chunking |
| `NovelFootnotes.kt` | Footnote click detection and the JS receiver |
| `NovelAutoScroll.kt` | rAF-based auto-scroll |
| `NovelPageTurn.kt` | Snapshot-based page-turn animation |
| `NovelStatusLine.kt` | Status-line formatting |
| `NovelHighlights.kt` | Highlight model, re-marking engine, selection watcher |
| `NovelTts.kt` | Text-to-speech controller |
| `NovelFonts.kt` | Imported fonts |
| `NovelBuiltinFonts.kt` | Bundled variable fonts, grouped by kind |
| `NovelScrollBridge.kt` | `window.KmkReader`, flow probe, JS quoting |
| `NovelNavigation.kt` | ToC/search model mapping |
| `NovelReaderScreenModels.kt` | ToC and search view models |
| `NovelTypography.kt` | The settings value (pure) |
| `NovelReaderTheme.kt` | The general theme's background |
| `NovelTypographyCss.kt` | Value → stylesheet, cover styling |
| `NovelProgress.kt` | Character-offset position and percentage |

### Document construction

`NovelDocument.build` injects, in order:

1. `<base>` and the charset at the **top** of the head.
2. The reader's stylesheet at the **end** of the head — `!important` against `!important` is decided by source order.
3. Custom CSS as the last `<style id="kmk-custom-css">`.
4. Custom JS in its own `<script>` after the bridge.

A publisher's own `<base>` is stripped first: the first one wins, so theirs would silently outrank ours.

The document build runs on `Dispatchers.Default`; inlining megabytes of base64 must not block the frame that turns the page. Only the `loadDataWithBaseURL` hop and the visible state land on main.

### Page modes

- **Continuous** — sections live in `kmk-seg` markers. A throttled probe reports which section the viewport is over. Near the bottom the next section is appended; near the top the previous one is prepended with scroll compensation in the same synchronous script. The window is trimmed to two sections either side.
- **Paged** — CSS multi-column inside the same WebView: `body { overflow: hidden; height: <viewport> }` plus `column-count`. The body is the scroll container. `KmkPaged` measures margins, sizes the column box and exposes a normalised position where forward is `+1`; the sign of `scrollLeft` stays in the bridge because vertical writing and RTL lay columns right-to-left.
- **Double** — two columns per screen.

A mode change re-renders the open document, carrying the reader's place as the document fraction — the one quantity that survives a reflow.

### Turning is decided natively

A tap scrolls `WebView.scrollBy` and reads `scrollY` back after a `post`. No movement means the document ran out of room and the section turns. The bridge is used only for what a laid-out document alone can answer: the fraction for a position and the element a contents entry names. Both degrade to nothing without the bridge; turning does not.

A document that has not laid out yet (`contentHeight` 0) answers every scroll with "no movement", so turning is guarded on it.

### The URL space

Books are served under the real `https://book.internal/` origin, the `WebViewAssetLoader` pattern. An invented custom scheme fails because WebView restricts subresource requests on non-HTTP schemes before `shouldInterceptRequest` is ever consulted. Missing resources answer **404**, not null: returning null hands the URL to the platform, which waits on a request nothing answers.

For the references a document actually reads, the inliner embeds them as `data:` URIs: `<img>`, SVG `<image>`, and `<link rel="stylesheet">` with the `url()`s inside it. The interception path remains for over-ceiling files and anything the inliner does not cover.

Inlining results are cached per document (`INLINE_CACHE_DOCUMENTS` per chapter), because the continuous window's trim-and-regrow re-looks at documents it already built. A relative reference that cannot be inlined is re-spelled **absolute**, so it does not resolve against the live document's directory inside an appended fragment.

### Fonts

- Imported fonts are copied into private storage; a SAF grant is not the document's to inherit.
- The family is stored as `user/<name>`; the `@font-face` rides in the document head as a `data:` URI.
- Bundled families store as `builtin/<Family>`, a prefix that cannot collide with a CSS generic. The value doubles as the CSS family name, so the declaration and the chosen family cannot disagree.
- Family lookup is case-insensitive.
- Faces are decoded once per family and kept behind a four-entry LRU.
- An import is validated (`Success`, `NotAFont`, `TooLarge`, `Unreadable`).

### Typography

The stylesheet is never empty, even at defaults — that is the only way a user can turn **off** a publisher's justification. Tri-state properties (`justified`, `hyphenation`, `verticalWriting`, `paragraphIndent`, `boldText`, `forceDark`) are `Boolean?`; `null` means follow the publisher and the property is omitted entirely.

`!important` is used on purpose. A publisher's `body { font-size }` otherwise outranks the host rule and the user's font size silently does nothing.

**Force dark** rewrites the palette before any rule is emitted:

- the canvas is the appearance tab's background or `#121212`;
- text colour is derived from the canvas with `contrastingForeground`;
- every element except `html`, `body` and image containers becomes transparent;
- illustrations keep their colours.

### Progress

`NovelProgress.Position` is `(documentIndex, characterOffset, characterLength)`, plus the document URL. Chapters are weighted by character length. Positions are persisted per chapter in a `__PRIVATE_` preference, not a database column.

### Contents and search

- `TextTocSource` and `TextSearchSource` are optional interfaces; the bottom-bar buttons appear only when the loader can answer.
- A contents jump passes its destination **into** `showDocument`, because the target document's markup may be read asynchronously after the call. Setting the position after the call was wiped by the render.
- A contents entry for another chapter renders disabled rather than disappearing.
- A search hit carries a document offset and a document length in the source's **plain text**, and the host uses only the ratio; markup and plain text otherwise land tens of percent apart.
- Fragment ids from the book are untrusted and pass through `quoteForJs`, including `</`, U+2028 and U+2029.

### Footnotes

The injected script recognises only notes the book **labels** (`epub:type`, the usual id/class conventions). Cross-document notes are read out of the archive, bounded, and rendered at the notes document's base URL. Every failure path falls through to ordinary link handling.

### Highlights

Highlights are anchored to the quoted text and stored per chapter. Re-marking re-wraps the text on every render, so changing font size or margins does not lose them. Tap inside a highlight to remove it. The engine script and the selection watcher are hand-rolled to stay harness-safe.

### Read-aloud

`NovelTts` queues sentence-aware chunks from `chunkForSpeech` and chains across documents through the viewer's advance path. It works in continuous and paged modes.

### Security

- Custom CSS is trusted and injected as the last stylesheet.
- Custom JS is **off by default** and runs with the reader's trust inside every downloaded book.
- Only element-sequence escaping is applied (`</` → `<\/`), because it is meaning-preserving in both languages.
- The book origin is reserved; external URLs are never copied into a document.

## Harnesses

`scripts/kotlinc-check/run-harness.sh` compiles the real sources and asserts:

- path resolution (`PathHarness`);
- OPF metadata including both series conventions (`OpfMetadataHarness`);
- document construction, escaping and style placement (`DocumentHarness`);
- novel typography and progress;
- archive handling.

The parser and the document builder are Android-free precisely so these can run without a device.

## Known gaps

- A long-press on an inline-SVG `<image>` or a CSS background does not open the image viewer, because the WebView hit test does not classify them as images.
- An external image link opens no viewer at all.
- A publisher `<base>` is stripped, not honoured; the reader's base is authoritative.
