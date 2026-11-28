---
title: Extensions & source API
description: The contract third-party sources implement, the text/EPUB interfaces, and how extension APKs are built and published.
---

Hyoukan's extension API is the Tachiyomi/Mihon `Source` API plus Hyoukan's text-source additions. Extensions are separate APKs loaded through a classloader; they are not linked into the app, and the app cannot see their implementations at R8 time. That fact drives every rule on this page.

## The contract

Package: `eu.kanade.tachiyomi.source.*` (Kotlin Multiplatform, `commonMain`).

| Interface | Purpose |
|---|---|
| `Source` | The base: id, name, language, browse/search, details/chapters, page list |
| `CatalogueSource` | Sources with browse and search |
| `HttpSource` | An OkHttp-backed source with request/response helpers |
| `ConfigurableSource` | Per-source preferences (`source_$id`) |
| `MetadataSource<M, R>` | Structured metadata |
| `UrlImportableSource` | URL import |
| `NamespaceSource` | Tag namespaces |
| `PagePreviewSource` | Page-preview thumbnails |
| `UnmeteredSource` | Exempt from metered-connection restrictions |

### `Source` in brief

```kotlin
interface Source {
    val id: Long
    val name: String
    val lang: String get() = ""
    val supportsLatest: Boolean

    fun getFilterList(): FilterList = FilterList()
    suspend fun getPopularManga(page: Int): MangasPage
    suspend fun getLatestUpdates(page: Int): MangasPage
    suspend fun getSearchManga(page: Int, query: String, filters: FilterList): MangasPage
    suspend fun getMangaUpdate(
        manga: SManga,
        chapters: List<SChapter>,
        fetchDetails: Boolean,
        fetchChapters: Boolean,
    ): SMangaUpdate
    suspend fun getPageList(chapter: SChapter): List<Page>
}
```

The suspend API is the current one. The old `Observable` methods remain only as deprecated stubs for binary compatibility.

A source returns `SManga`, `SChapter` and `Page` models. Pages carry a status machine and a stream; the app handles loading, retries, splitting and caching.

## ABI rules

The extension API is a **binary contract**. These rules are not style preferences:

1. **Never add an abstract member to an existing interface.** Extensions loaded through a classloader implement it; a new member breaks every extension that predates it, and R8 cannot see across the dex boundary to warn you.
2. **Add a new optional interface instead.** Hosts check for it. `TextBaseUrlSource` exists for exactly this reason: `TextResourceSource` can open an absolute URL, but only the source knows the base its relative references should resolve against.
3. **Adding a field to a model is safe; adding a parameter without a default is not.** Models are `@Serializable` data classes with defaults.
4. **Keep `consumer-proguard.pro` covering every class here.** Extension APKs are compiled separately.
5. **Do not change method signatures or return types.** A source compiled against an older API must keep loading.

The app's own `Source` interface is versioned by the `tachiyomix.extensionLib` metadata float; a source declares the API level it was built against, and the app refuses incompatible ones with an explanation.

## Writing an image source

A minimal HTTP source:

```kotlin
class ExampleSource : HttpSource() {
    override val id = 1234567890L
    override val name = "Example"
    override val lang = "en"
    override val supportsLatest = true

    override val baseUrl = "https://example.com"

    override fun popularMangaRequest(page: Int) =
        GET("$baseUrl/popular?page=$page", headers)

    override fun popularMangaParse(response: Response): MangasPage {
        val document = response.asJsoup()
        val entries = document.select(".series").map { element ->
            SManga.create().apply {
                title = element.selectFirst(".title")!!.text()
                url = element.selectFirst("a")!!.attr("href")
                thumbnail_url = element.selectFirst("img")?.absUrl("src")
            }
        }
        return MangasPage(entries, hasNextPage = true)
    }

    override fun searchMangaRequest(page: Int, query: String, filters: FilterList) =
        GET("$baseUrl/search?q=${query.urlEncode()}&page=$page", headers)

    override fun searchMangaParse(response: Response) = popularMangaParse(response)

    override fun latestUpdatesRequest(page: Int) =
        GET("$baseUrl/latest?page=$page", headers)

    override fun latestUpdatesParse(response: Response) = popularMangaParse(response)

    override fun mangaDetailsParse(response: Response): SManga = SManga.create().apply {
        val document = response.asJsoup()
        title = document.selectFirst("h1")!!.text()
        description = document.selectFirst(".description")?.text()
        genre = document.select(".tags a").joinToString(", ") { it.text() }
    }

    override fun chapterListParse(response: Response): List<SChapter> =
        response.asJsoup().select(".chapter").map { element ->
            SChapter.create().apply {
                name = element.text()
                url = element.absUrl("href")
                date_upload = element.attr("data-date").toLongOrNull() ?: 0L
            }
        }

    override fun pageListParse(response: Response): List<Page> =
        response.asJsoup().select(".reader img").mapIndexed { index, img ->
            Page(index, imageUrl = img.absUrl("src"))
        }

    override fun imageUrlParse(response: Response): String = ""
}
```

The real API offers more: filters, paging, metadata, URL import, preferences. Use the existing extension template in a repository as a starting point rather than the abbreviated example above.

### Preferences

`ConfigurableSource` stores preferences in a per-source SharedPreferences file named `source_$id`. The file is separate from the app's preference store by design; do not migrate it into `SettingKey`s. A source's settings screen is declared with `PreferenceScreen` and rendered by the app.

## Text sources

The text API sits **beside** the image `Page` model. A text source implements `getTextPageList`; the host builds the novel reader instead of a pager.

| File | Contract |
|---|---|
| `TextPage.kt` | One unit of text. `kind` is `HTML` or `PLAIN`; `baseHref` resolves relative references |
| `TextSource.kt` | `getTextPageList` + `textCapabilities` |
| `TextCapabilities.kt` | Declares what the source implements |
| `TextTocSource.kt` | `getTableOfContents` → nested `TocEntry` |
| `TextSearchSource.kt` | `searchInChapter` → `TextSearchHit` |
| `TextAnnotationSource.kt` | Highlights, bookmarks and notes persistence |
| `TextResourceSource.kt` | Streams images, CSS and fonts |
| `TextBaseUrlSource.kt` | The URL each page must be loaded at |
| `TextIncrementalSource.kt` | `getTextPageIndex` + `getTextPageText` for lazy loading |
| `EpubArchiveSource.kt` | An EPUB archive opened directly |

### What a text source must guarantee

- **Stable `TextPage.url`** — it is the identity for reading position and annotations. No timestamps, no array indexes.
- **Self-contained `TextPage.text`** — the host hands it straight to a WebView. Inline the styles the page needs.
- **`baseHref` whenever resources are referenced** — otherwise relative image and CSS paths break.
- **Natural units** — EPUB spine items, one webnovel chapter per page. Never pre-paginate by character count.

### Why `TextPage` is not `Page`

An image has progressive states, a progress flow and a retry path. Text arrives with the chapter list. Modelling it as a `Page` would make every host carry a status machine for a failure mode that cannot occur.

### Optional capabilities

`TextCapabilities` is a set of booleans (`TOC`, `SEARCH`, `IMAGES`, `ANNOTATIONS`, `INCREMENTAL`, …). A host hides controls a source cannot honour rather than showing a button that opens an empty sheet.

Adding a new optional interface is the correct way to extend this surface. Adding a member to `TextSource` is an ABI break.

## Extension APK metadata

An extension's manifest declares:

```xml
<meta-data android:name="tachiyomi.extension" android:value="true" />
<meta-data android:name="tachiyomi.extension.class" android:value=".ExampleSource" />
<meta-data android:name="tachiyomix.name" android:value="Example" />
<meta-data android:name="tachiyomix.extensionLib" android:value="1.6" />
<meta-data android:name="tachiyomix.contentWarning" android:value="0" />
```

| Key | Meaning |
|---|---|
| `tachiyomi.extension` | Marks the APK as an extension |
| `tachiyomi.extension.class` | Source class name(s) |
| `tachiyomi.extension.factory` | Optional source factory |
| `tachiyomi.extension.nsfw` | Legacy NSFW flag |
| `tachiyomix.name` | Display name |
| `tachiyomix.extensionLib` | API level the extension was built against |
| `tachiyomix.contentWarning` | 0 = safe, 1 = mixed, 2 = NSFW |

The Private installer stores the APK as `<package>.ext` after verifying the repository's signing key. A staging file is renamed on success; a partial install is never loaded.

## Repository index

A repository publishes a JSON index — commonly `index.min.json` — with entries such as:

```json
[
  {
    "name": "Example",
    "pkg": "eu.kanade.tachiyomi.extension.en.example",
    "apk": "example-v1.4.2.apk",
    "lang": "en",
    "code": 14,
    "version": "1.4.2",
    "nsfw": 0
  }
]
```

The app resolves `apk` against the store's base URL, verifies the download against the store's signing key, and installs. A store can also provide a legacy repository format with separate extension-list and APK URLs.

## Delegated sources

An installed extension can be **delegated** to an in-app implementation under the same source id. The main case is Komga: the app's built-in source takes over an installed Komga extension's id so library entries, settings, URLs and tracker links carry over. Delegation is enabled under Developer tools and read at source-map build time, so it requires a restart.

The built-in Komga source mirrors Keiyoushi Komga preference keys — `Chapter name template`, `Scanlator seperator` (sic), `Default libraries`, plus the `library_list` cache filled by **Reload libraries** — so values set in the extension apply unchanged under delegation.

Delegation is an app-side decision; an extension does not opt in.

## The local source

The local source is an in-repo implementation of the same interfaces. It reads:

- folders of images;
- CBZ/CBR/ZIP/RAR/7z archives;
- EPUB files (as books or as image chapters);
- optional `cover.jpg`, `details.json` and `ComicInfo.xml`.

See [Files & formats](/hyoukan/reference/formats/#local-source) for the folder layout.

## Novel plugins (QuickJS)

Novel plugins do not use the APK ABI. A plugin is one `.js` file, validated from a header without executing it, stored in `files/novel_plugins/<id>.js` and run in a **fresh QuickJS context per call**. The only injected object exposes `fetch`, `postJson`, `postForm`, `log` and `now`; there is no filesystem, classloader, `require`, DOM or direct network. Calls are synchronous; scripts are capped at 2 MiB, responses at 8 MiB and URLs at 8,192 characters. Source ids derive stably from `@id`, so reimporting keeps library rows. Plugins are not LNReader-compatible. See [Novel plugins](/hyoukan/guide/novel-plugins/) and `docs/novel-plugins.md` in the app repository.

## Testing an extension

1. Build the APK with the same `applicationId` and signing key you will publish.
2. Install it through the app (Private installer is fastest).
3. Check Browse, search, details, chapters, pages, downloads and a WebView login.
4. Exercise the failure path: a 404, a Cloudflare challenge, an empty chapter.
5. Confirm the content warning and language.
6. Test on a release build, not only debug — R8 and the classloader behave differently.

## Publishing checklist

- [ ] Unique package name and source id.
- [ ] Correct `tachiyomix.extensionLib` for the API you compiled against.
- [ ] Content warning set honestly.
- [ ] Icon and name present.
- [ ] APK signed with the repository key.
- [ ] Index entry updated (code, version, APK, language).
- [ ] No new abstract members added to app interfaces.
- [ ] Tested through a cold app start and a library update.

## Compatibility policy

The app aims to keep every previously published extension working. When the API must change:

- add an optional interface rather than a member;
- add model fields with defaults;
- keep deprecated methods as functional stubs;
- document the minimum API level in the extension's metadata.

Breaking the ABI is treated as a release-blocking regression, not a cleanup opportunity.
