#!/usr/bin/env node
/**
 * Hyoukan wiki generator.
 *
 * Reads Markdown from wiki/ plus the navigation in tools/wiki-nav.json and writes a
 * self-contained static site into hyoukan/. No runtime dependencies beyond the
 * vendored marked build, and no network access.
 *
 *   node tools/build-wiki.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { marked } = require('./vendor/marked.umd.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'wiki');
const OUT = path.join(ROOT, 'hyoukan');
const BASE = '/hyoukan';
const SITE = 'https://pineappletwilight.github.io';
const REPO = 'https://github.com/PineappleTwilight/hyoukan';
const SITE_REPO = 'https://github.com/PineappleTwilight/pineappletwilight.github.io';
const VERSION = '1.25.3';
const UPDATED = 'November 2026';

const nav = JSON.parse(fs.readFileSync(path.join(__dirname, 'wiki-nav.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTags(s) {
  return String(s)
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(s) {
  return stripTags(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'section';
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    data[kv[1]] = v;
  }
  return { data, body: raw.slice(m[0].length) };
}

function pageUrl(file) {
  if (file === 'index') return `${BASE}/`;
  if (file.endsWith('/index')) return `${BASE}/${file.slice(0, -'/index'.length)}/`;
  return `${BASE}/${file}/`;
}

function pageOut(file) {
  if (file === 'index') return path.join(OUT, 'index.html');
  if (file.endsWith('/index')) return path.join(OUT, file.slice(0, -'/index'.length), 'index.html');
  return path.join(OUT, file, 'index.html');
}

function relRoot(url) {
  // Absolute URLs are fine for a user/organisation GitHub Pages site.
  return url;
}

function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/');
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

marked.setOptions({ gfm: true, breaks: false, mangle: false, headerIds: false });

marked.use({
  renderer: {
    link(token) {
      const href = token.href;
      const title = token.title;
      const text = this.parser.parseInline(token.tokens);
      if (!href) return text;
      let out = href;
      let external = false;

      if (!/^(https?:|mailto:|#|\/)/.test(href)) {
        const [rawPath, hash] = href.split('#');
        if (rawPath.endsWith('.md')) {
          const f = rawPath.replace(/\.md$/, '').replace(/^\.\//, '');
          out = pageUrl(f) + (hash ? `#${hash}` : '');
        }
      } else if (/^https?:/.test(href)) {
        external = true;
      }

      const titleAttr = title ? ` title="${esc(title)}"` : '';
      const ext = external ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${esc(relRoot(out))}"${titleAttr}${ext}>${text}</a>`;
    },
  },
});

function renderMarkdown(md) {
  let html = marked.parse(md);

  // Callouts: > [!NOTE] followed by a blank quote line and the body.
  html = html.replace(
    /<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]<\/p>/g,
    (_, kind) => {
      const k = kind.toLowerCase();
      const labels = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };
      return `<blockquote class="callout callout-${k}"><p class="callout-title">${labels[k]}</p>`;
    },
  );

  // Heading IDs + anchors + TOC collection.
  const toc = [];
  const seen = new Map();
  html = html.replace(/<h([2-6])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    let id = slugify(inner);
    if (seen.has(id)) {
      const n = seen.get(id) + 1;
      seen.set(id, n);
      id = `${id}-${n}`;
    } else {
      seen.set(id, 1);
    }
    const text = stripTags(inner);
    if (Number(level) <= 3) toc.push({ level: Number(level), id, text });
    return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">#</a>${inner}</h${level}>`;
  });

  // Tables scroll sideways on narrow screens.
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>');
  html = html.replace(/<\/table>/g, '</table></div>');

  return { html, toc };
}

function plainTextFromHtml(html) {
  return stripTags(
    html
      .replace(/<pre[\s\S]*?<\/pre>/g, ' ')
      .replace(/<code[\s\S]*?<\/code>/g, ' ')
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' '),
  );
}

// ---------------------------------------------------------------------------
// Page template
// ---------------------------------------------------------------------------

const allPages = [];
for (const section of nav.sections) {
  for (const item of section.items) {
    allPages.push({ ...item, section: section.title, sectionId: section.id });
  }
}

function findPage(file) {
  return allPages.find((p) => p.file === file);
}

function sidebarHtml(currentFile) {
  return nav.sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          const active = item.file === currentFile;
          return `<li><a href="${pageUrl(item.file)}"${active ? ' aria-current="page"' : ''}>${esc(item.title)}</a></li>`;
        })
        .join('\n');
      return `<div class="nav-section">
  <p class="nav-heading">${esc(section.title)}</p>
  <ul>${items}</ul>
</div>`;
    })
    .join('\n');
}

function tocHtml(toc) {
  if (toc.length < 2) return '';
  const items = toc
    .filter((h) => h.level <= 3)
    .map((h) => `<li class="toc-l${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`)
    .join('\n');
  return `<p class="toc-heading">On this page</p>
<ul class="toc-list">${items}</ul>`;
}

function pagerHtml(currentFile) {
  const i = allPages.findIndex((p) => p.file === currentFile);
  const prev = i > 0 ? allPages[i - 1] : null;
  const next = i >= 0 && i < allPages.length - 1 ? allPages[i + 1] : null;
  const parts = [];
  if (prev) {
    parts.push(`<a class="pager-link pager-prev" href="${pageUrl(prev.file)}"><span class="pager-dir">Previous</span><span class="pager-title">${esc(prev.title)}</span></a>`);
  }
  if (next) {
    parts.push(`<a class="pager-link pager-next" href="${pageUrl(next.file)}"><span class="pager-dir">Next</span><span class="pager-title">${esc(next.title)}</span></a>`);
  }
  return parts.length ? `<nav class="pager" aria-label="Page navigation">${parts.join('')}</nav>` : '';
}

function breadcrumbsHtml(page) {
  if (page.file === 'index') return '';
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">
  <a href="${BASE}/">Wiki</a><span aria-hidden="true">/</span><span>${esc(page.section)}</span><span aria-hidden="true">/</span><span aria-current="page">${esc(page.title)}</span>
</nav>`;
}

const CSS = fs.readFileSync(path.join(__dirname, 'assets', 'wiki.css'), 'utf8');
const JS = fs.readFileSync(path.join(__dirname, 'assets', 'wiki.js'), 'utf8');

function renderPage(page, bodyHtml, toc) {
  const title = page.title;
  const description = page.description || `${title} — Hyoukan wiki`;
  const isHome = page.file === 'index';
  const editPath = `https://github.com/PineappleTwilight/pineappletwilight.github.io/edit/main/wiki/${page.file}.md`;
  const articleHeader = isHome
    ? ''
    : `<h1>${esc(title)}</h1>${description ? `<p class="page-lede">${esc(description)}</p>` : ''}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title === 'Hyoukan Wiki' ? title : `${title} · Hyoukan Wiki`)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230e7490'/%3E%3Cpath d='M32 12l5 14h15l-12 9 4 15-12-9-12 9 4-15-12-9h15z' fill='%23fff'/%3E%3C/svg%3E">
<link rel="stylesheet" href="${BASE}/assets/wiki.css">
<script>
(function(){
  try {
    var t = localStorage.getItem('hyoukan-theme');
    if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
  } catch (e) { document.documentElement.dataset.theme = 'light'; }
})();
</script>
</head>
<body>
<a class="skip-link" href="#content">Skip to content</a>
<div class="progress-bar" id="progress-bar" aria-hidden="true"></div>
<header class="topbar">
  <button class="icon-btn menu-btn" id="menu-btn" aria-label="Open navigation" aria-expanded="false" aria-controls="sidebar">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
  </button>
  <a class="brand" href="${BASE}/">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32"><path d="M16 3l3.2 8.1L28 14l-8.8 2.9L16 25l-3.2-8.1L4 14l8.8-2.9z" fill="currentColor"/></svg>
    </span>
    <span class="brand-name">Hyoukan</span><span class="brand-sub">Wiki</span>
  </a>
  <div class="topbar-spacer"></div>
  <button class="search-trigger" id="search-trigger" aria-label="Search the wiki">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
    <span class="search-label">Search</span>
    <kbd>Ctrl K</kbd>
  </button>
  <a class="icon-btn" href="${REPO}" target="_blank" rel="noopener" aria-label="Hyoukan on GitHub">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.6.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5 4-1.3 6.8-5.1 6.8-9.6C22 6.6 17.5 2 12 2z"/></svg>
  </a>
  <button class="icon-btn" id="theme-toggle" aria-label="Switch colour theme">
    <svg class="theme-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    <svg class="theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/></svg>
  </button>
</header>

<div class="layout">
  <div class="sidebar-backdrop" id="sidebar-backdrop" hidden></div>
  <aside class="sidebar" id="sidebar">
    <nav aria-label="Wiki navigation">
      ${sidebarHtml(page.file)}
    </nav>
    <div class="sidebar-foot">
      <span class="version-pill">v${VERSION}</span>
      <span>Updated ${UPDATED}</span>
    </div>
  </aside>

  <main class="main" id="content">
    <div class="page${isHome ? ' page-home' : ''}">
      ${breadcrumbsHtml(page)}
      <article class="prose">
        ${articleHeader}
        ${bodyHtml}
      </article>
      ${pagerHtml(page.file)}
      <footer class="page-foot">
        <p>Hyoukan is free and open source under the Apache-2.0 licence. The app hosts no content.</p>
        <p><a href="${editPath}" target="_blank" rel="noopener">Edit this page</a> · <a href="${REPO}" target="_blank" rel="noopener">Source code</a> · <a href="${BASE}/contributing/">Contributing</a></p>
      </footer>
    </div>
  </main>

  <aside class="toc" aria-label="On this page">
    ${tocHtml(toc)}
  </aside>
</div>

<div class="search-overlay" id="search-overlay" role="dialog" aria-modal="true" aria-label="Search the Hyoukan wiki" hidden>
  <div class="search-panel">
    <div class="search-input-row">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="search-input" type="search" placeholder="Search the wiki…" autocomplete="off" spellcheck="false" aria-label="Search query">
      <button class="icon-btn" id="search-close" aria-label="Close search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <div class="search-results" id="search-results" aria-live="polite">
      <p class="search-hint">Type to search ${allPages.length} pages. Use ↑ ↓ to move and Enter to open.</p>
    </div>
  </div>
</div>

<script>window.HYOUKAN_BASE = ${JSON.stringify(BASE)};</script>
<script>${JS}</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

const searchIndex = [];
const rendered = new Map();

for (const page of allPages) {
  const file = path.join(SRC, `${page.file}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  missing source: ${page.file}.md`);
    continue;
  }
  const raw = fs.readFileSync(file, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const meta = {
    ...page,
    title: data.title || page.title,
    description: data.description || '',
  };
  const { html, toc } = renderMarkdown(body);
  rendered.set(page.file, { meta, html, toc, body });

  const out = pageOut(page.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, renderPage(meta, html, toc));

  searchIndex.push({
    title: meta.title,
    section: meta.section,
    description: meta.description,
    url: pageUrl(page.file),
    headings: toc.map((h) => h.text),
    text: plainTextFromHtml(html).slice(0, 5000),
  });
}

// The settings index is generated from the app source when it is reachable, so the
// reference page always describes the build it documents rather than a stale copy.
fs.writeFileSync(path.join(OUT, 'assets', 'wiki.css'), CSS);
fs.writeFileSync(path.join(OUT, 'assets', 'wiki.js'), JS);
fs.writeFileSync(path.join(OUT, 'search-index.json'), JSON.stringify(searchIndex));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((p) => `  <url><loc>${SITE}${pageUrl(p.file)}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');

const missing = allPages.filter((p) => !rendered.has(p.file));
console.log(`Built ${rendered.size} pages into hyoukan/`);
if (missing.length) console.log(`Missing: ${missing.map((p) => p.file).join(', ')}`);
