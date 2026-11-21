/* Hyoukan wiki — theme, navigation, search, TOC and reading progress. */
(function () {
  'use strict';

  var BASE = window.HYOUKAN_BASE || '/hyoukan';
  var root = document.documentElement;

  // --- Theme ---------------------------------------------------------------
  var themeBtn = document.getElementById('theme-toggle');
  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('hyoukan-theme', theme); } catch (e) {}
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }
  setTheme(root.dataset.theme || 'light');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  // --- Mobile sidebar ------------------------------------------------------
  var menuBtn = document.getElementById('menu-btn');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');

  function setMenu(open) {
    if (!sidebar) return;
    sidebar.classList.toggle('is-open', open);
    if (backdrop) backdrop.hidden = !open;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(!sidebar.classList.contains('is-open'));
    });
  }
  if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });
  if (sidebar) {
    sidebar.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }

  // --- Reading progress ----------------------------------------------------
  var progress = document.getElementById('progress-bar');
  if (progress) {
    var ticking = false;
    function updateProgress() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      progress.style.width = pct.toFixed(2) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }

  // --- TOC scroll spy ------------------------------------------------------
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc-list a'));
  var tocTargets = tocLinks
    .map(function (link) {
      var id = decodeURIComponent(link.getAttribute('href').slice(1));
      var el = document.getElementById(id);
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  if (tocTargets.length && 'IntersectionObserver' in window) {
    var visible = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
        else visible.delete(entry.target.id);
      });
      var best = null;
      tocTargets.forEach(function (t) {
        if (visible.has(t.el.id)) {
          var top = visible.get(t.el.id);
          if (best === null || top < best.top) best = { top: top, link: t.link };
        }
      });
      if (best) {
        tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
        best.link.classList.add('is-active');
      }
    }, { rootMargin: '-88px 0px -65% 0px', threshold: [0, 1] });
    tocTargets.forEach(function (t) { observer.observe(t.el); });
  }

  // --- Copy code buttons ---------------------------------------------------
  document.querySelectorAll('.prose pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-code';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code');
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;
      var done = function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(area);
      }
    });
    pre.appendChild(btn);
  });

  // --- Search --------------------------------------------------------------
  var overlay = document.getElementById('search-overlay');
  var trigger = document.getElementById('search-trigger');
  var closeBtn = document.getElementById('search-close');
  var input = document.getElementById('search-input');
  var resultsEl = document.getElementById('search-results');
  var index = null;
  var loading = null;
  var selected = -1;
  var currentResults = [];
  var lastFocus = null;

  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(BASE + '/search-index.json', { cache: 'no-cache' })
      .then(function (res) { return res.json(); })
      .then(function (data) { index = data; return data; })
      .catch(function () { index = []; return index; });
    return loading;
  }

  function tokenize(q) {
    return q.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 0; });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function highlight(text, tokens) {
    var safe = escapeHtml(text);
    tokens.forEach(function (token) {
      if (!token) return;
      var re = new RegExp('(' + token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      safe = safe.replace(re, '<mark>$1</mark>');
    });
    return safe;
  }

  function snippet(text, tokens) {
    if (!text) return '';
    var lower = text.toLowerCase();
    var at = -1;
    for (var i = 0; i < tokens.length; i++) {
      var p = lower.indexOf(tokens[i]);
      if (p !== -1 && (at === -1 || p < at)) at = p;
    }
    if (at === -1) at = 0;
    var start = Math.max(0, at - 70);
    var end = Math.min(text.length, at + 190);
    return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
  }

  function score(page, tokens) {
    var title = page.title.toLowerCase();
    var headings = (page.headings || []).join(' ').toLowerCase();
    var description = (page.description || '').toLowerCase();
    var text = (page.text || '').toLowerCase();
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var s = 0;
      if (title === t) s = 120;
      else if (title.indexOf(t) === 0) s = 80;
      else if (title.indexOf(t) !== -1) s = 55;
      else if (headings.indexOf(t) !== -1) s = 24;
      else if (description.indexOf(t) !== -1) s = 14;
      else if (text.indexOf(t) !== -1) s = 6;
      if (s === 0) return 0;

      // Repeated mentions are a useful relevance hint once the token matches at all.
      var count = 0;
      var at = text.indexOf(t);
      while (at !== -1 && count < 8) {
        count++;
        at = text.indexOf(t, at + t.length);
      }
      total += s + count;
    }
    return total;
  }

  function renderResults(query) {
    var tokens = tokenize(query);
    if (!tokens.length) {
      resultsEl.innerHTML = '<p class="search-hint">Type to search ' + (index ? index.length : '') +
        ' pages. Use ↑ ↓ to move and Enter to open.</p>';
      currentResults = [];
      selected = -1;
      return;
    }
    if (!index) {
      resultsEl.innerHTML = '<p class="search-hint">Loading index…</p>';
      return;
    }
    var scored = index.map(function (page) {
      return { page: page, score: score(page, tokens) };
    }).filter(function (r) { return r.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score || a.page.title.localeCompare(b.page.title); });
    currentResults = scored.slice(0, 18);
    selected = currentResults.length ? 0 : -1;

    if (!currentResults.length) {
      resultsEl.innerHTML = '<p class="search-empty">No pages match <strong>' + escapeHtml(query) + '</strong>.</p>';
      return;
    }

    resultsEl.innerHTML = currentResults.map(function (r, i) {
      var p = r.page;
      return '<a class="search-result' + (i === 0 ? ' is-selected' : '') + '" href="' + p.url + '">' +
        '<span class="search-result-title">' + highlight(p.title, tokens) +
        '<span class="search-result-section">' + escapeHtml(p.section || '') + '</span></span>' +
        '<span class="search-result-text">' + highlight(snippet(p.description || p.text, tokens), tokens) + '</span>' +
        '</a>';
    }).join('');
  }

  function moveSelection(delta) {
    if (!currentResults.length) return;
    selected = (selected + delta + currentResults.length) % currentResults.length;
    Array.prototype.forEach.call(resultsEl.querySelectorAll('.search-result'), function (el, i) {
      el.classList.toggle('is-selected', i === selected);
      if (i === selected) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function openSearch() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    input.value = '';
    renderResults('');
    loadIndex().then(function () { renderResults(input.value); });
    setTimeout(function () { input.focus(); }, 0);
  }

  function closeSearch() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (trigger) trigger.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  if (overlay) {
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) closeSearch();
    });
  }
  if (input) {
    input.addEventListener('input', function () {
      loadIndex().then(function () { renderResults(input.value); });
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
      else if (e.key === 'Enter') {
        var link = resultsEl.querySelector('.search-result.is-selected');
        if (link) { e.preventDefault(); window.location.href = link.getAttribute('href'); }
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openSearch();
    } else if (e.key === '/' && !typing) {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape' && overlay && !overlay.hidden) {
      closeSearch();
    }
  });

  // --- External links get a quiet marker ----------------------------------
  document.querySelectorAll('.prose a[target="_blank"]').forEach(function (a) {
    a.setAttribute('rel', 'noopener');
  });
})();
