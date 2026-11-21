# pineappletwilight.github.io

Static site for the **Hyoukan** wiki.

- **Wiki:** <https://pineappletwilight.github.io/hyoukan/>
- **App source:** <https://github.com/PineappleTwilight/hyoukan>

## Editing the wiki

The source is Markdown in `wiki/`, with navigation in `tools/wiki-nav.json`.
Build the site with:

```bash
node tools/build-wiki.mjs
```

The generated site is written to `hyoukan/` and is committed directly; GitHub Pages
serves it as-is. No build step runs on Pages.
