---
title: Novel plugins
description: Sandboxed JavaScript novel sources — installation, the QuickJS sandbox, limits and the author contract.
---

A **novel plugin** is a single JavaScript file that adds a text source. Plugin sources appear in Browse like ordinary sources, and their chapters open in the book reader. Plugin support is on the current `master` build, not in the stable 1.25.3 release.

> [!WARNING]
>
> Plugins are code from wherever you got the file. The sandbox limits what that code can reach, but there is no signature check, repository review or content warning for plugins. Install only files from a source you trust.

## Installing a plugin

**Settings → Advanced → Novel plugins → Import plugin file.** Pick a `.js` file whose first 40 lines contain an `@id` and `@name` header. The file is **validated but not executed** on import; it first runs when you browse with it. The picker accepts any file type, but the stored file must parse as a plugin.

- The script is capped at **2 MiB**; larger files and unreadable files are refused.
- `@id` is 1–64 characters from `A-Za-z0-9._-`; `@name` must be non-empty. `@lang` defaults to `en`, `@version` to `1`, and `@site` must begin with `http://` or `https://`.
- Plugins are stored in app-private `files/novel_plugins/<id>.js`. That directory is the source of truth: a file copied there appears without any bookkeeping, and a file removed from disk disappears on the next scan, without a restart.
- **Delete plugin** removes the file. Library entries remain but stop updating until the plugin is reinstalled; the same `@id` yields the same source id, so reimporting keeps those rows.

## The sandbox

Every plugin method call runs in a **fresh QuickJS context** that is closed when the call finishes. The script has no filesystem, database or class access and no direct network API. The only injected object is `host`, with `fetch(url)`, `postJson(url, body)`, `postForm(url, body)`, `log(message)` and `now()`; `console.log` is routed to the same host log. There is no `fetch` global, no `require` and no DOM.

Calls are synchronous. Response bodies are capped at **8 MiB**, scripts at **2 MiB**, and URLs at **8,192 characters** beginning with `http`. Requests go through the app's own HTTP client, so they inherit its cookies, user agent and Cloudflare handling. The URL check is a prefix test, not a host allowlist.

## Using a plugin source

A plugin implements the same source and text-source contracts as a Kotlin source, so browse, search, library updates, tracking, downloads and the book reader work without special handling. Browse results end when a page returns an empty list. If a plugin is deleted, a stub remains so its library rows still explain themselves.

## For plugin authors

Declare the header directives, then export methods from `module.exports`:

| Method | Returns |
|---|---|
| `popular(page)`, `latest(page)` | Catalogue entries; `latest` is optional |
| `search(query, page)` | Catalogue entries |
| `manga(url)` | Entry details |
| `chapters(url)` | Chapter list |
| `text(url)` | An HTML string or array of HTML strings |

A catalogue entry needs `title` and a stable `url`; `cover` (an absolute URL), `author`, `artist`, `description` and `genre` are optional. Calls are synchronous and errors become empty results with a line in the in-app log.

These plugins are **not LNReader-compatible**: there are no async `fetch` promises and no `cheerio` DOM, so an LNReader plugin needs a rewrite of its source logic. The full author contract lives in [`docs/novel-plugins.md`](https://github.com/PineappleTwilight/hyoukan/blob/master/docs/novel-plugins.md) in the app repository.

## Where to go next

- [Sources & extensions](/hyoukan/guide/sources/) — APK extensions, installers and source health.
- [Reading books](/hyoukan/guide/books/) — the reader plugin chapters open in.
- [Extensions & source API](/hyoukan/development/extensions/) — the Kotlin ABI that plugins sit beside.
