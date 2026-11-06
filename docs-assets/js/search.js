/*
 * Baset UI docs — documentation search (docs-only).
 *
 * - The index starts with one entry per page, built from nav-data.js.
 * - On first open it fetches every page and adds one entry per h2/h3 section
 *   (title, text and code of that section, in both languages).
 * - If pages cannot be fetched (for example when opened from file://), search
 *   keeps working on page titles/descriptions and says so in the dialog.
 * - Arabic and English are both searchable regardless of the current language.
 *
 * Results are rendered with DOM APIs and textContent only.
 */
(function () {
  var D = (window.BUIDocs = window.BUIDocs || {});
  var root = document.documentElement;

  /** Lower-cases and strips Latin accents, Arabic diacritics and tatweel; unifies common Arabic letter variants. */
  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ًͯ-ٰٟـ]/g, '')
      .replace(/ٱ/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim();
  }
  D.searchNorm = norm;

  var UI = {
    title: { en: 'Search documentation', ar: 'البحث في التوثيق' },
    placeholder: { en: 'Search documentation…', ar: 'ابحث في التوثيق…' },
    close: { en: 'Close search', ar: 'إغلاق البحث' },
    none: { en: 'No results found.', ar: 'لا توجد نتائج.' },
    loading: { en: 'Indexing pages…', ar: 'جارٍ فهرسة الصفحات…' },
    titlesOnly: {
      en: 'Full-text search needs the docs to be served over HTTP. Showing page titles and descriptions only.',
      ar: 'البحث في النص الكامل يتطلب تشغيل التوثيق عبر HTTP. تُعرض عناوين الصفحات وأوصافها فقط.'
    },
    count: { en: ' results', ar: ' نتيجة' }
  };

  function lang() { return root.getAttribute('lang') === 'ar' ? 'ar' : 'en'; }
  function t(key) { return UI[key][lang()]; }

  var state = { entries: [], full: 'idle', base: '', dialog: null, input: null, list: null, status: null, active: -1, results: [] };

  /* ------------------------------------------------------------- Indexing */

  function pageEntry(page) {
    var en = page.description.en + ' ' + page.keywords.en;
    var ar = page.description.ar + ' ' + page.keywords.ar;
    return {
      kind: 'page',
      url: state.base + page.path,
      title: page.title,
      crumb: null,
      text: { en: page.description.en, ar: page.description.ar },
      titleHay: norm(page.title.en + ' ' + page.title.ar),
      bodyHay: norm(en + ' ' + ar),
      boost: 3
    };
  }

  function gather(node, wanted) {
    if (node.nodeType === 3) { return node.nodeValue; }
    if (node.nodeType !== 1) { return ''; }
    var tag = node.nodeName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'svg') { return ''; }
    var l = node.getAttribute('lang');
    if (l && l !== wanted) { return ''; }
    var out = '';
    for (var i = 0; i < node.childNodes.length; i++) { out += gather(node.childNodes[i], wanted); }
    return out + ' ';
  }

  function clean(s) { return s.replace(/\s+/g, ' ').trim(); }

  function sectionsFromHtml(html, page) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var article = doc.querySelector('.docs-article');
    if (!article) { return []; }
    var sections = [];
    var current = null;
    Array.prototype.forEach.call(article.children, function (child) {
      var name = child.nodeName;
      if (name === 'H2' || name === 'H3') {
        if (current) { sections.push(current); }
        current = {
          id: child.getAttribute('id') || '',
          title: { en: clean(gather(child, 'en')), ar: clean(gather(child, 'ar')) },
          en: '',
          ar: ''
        };
      } else if (current && name !== 'H1' && name !== 'NAV') {
        current.en += ' ' + gather(child, 'en');
        current.ar += ' ' + gather(child, 'ar');
      }
    });
    if (current) { sections.push(current); }

    return sections.filter(function (s) { return s.id; }).map(function (s) {
      var en = clean(s.en);
      var ar = clean(s.ar);
      return {
        kind: 'section',
        url: state.base + page.path + '#' + s.id,
        title: s.title,
        crumb: page.title,
        text: { en: en, ar: ar },
        titleHay: norm(s.title.en + ' ' + s.title.ar),
        bodyHay: norm(en + ' ' + ar),
        boost: 0
      };
    });
  }

  function loadFullText() {
    if (state.full !== 'idle') { return; }
    state.full = 'loading';
    if (typeof window.fetch !== 'function' || typeof window.DOMParser !== 'function') {
      state.full = 'unavailable';
      return;
    }
    var pages = D.navPages();
    var loaded = 0;
    Promise.all(pages.map(function (page) {
      return window.fetch(state.base + page.path)
        .then(function (res) {
          if (!res.ok) { throw new Error('HTTP ' + res.status); }
          return res.text();
        })
        .then(function (html) {
          sectionsFromHtml(html, page).forEach(function (e) { state.entries.push(e); });
          loaded += 1;
        })
        .catch(function () { /* handled below */ });
    })).then(function () {
      state.full = loaded > 0 ? 'ready' : 'unavailable';
      render();
    });
  }

  /* -------------------------------------------------------------- Ranking */

  function search(query) {
    var tokens = norm(query).split(' ').filter(Boolean);
    if (!tokens.length) { return []; }
    var scored = [];
    state.entries.forEach(function (entry) {
      var score = entry.boost;
      for (var i = 0; i < tokens.length; i++) {
        var tk = tokens[i];
        if (entry.titleHay.indexOf(tk) !== -1) {
          score += entry.titleHay.indexOf(tk) === 0 ? 15 : 10;
        } else if (entry.bodyHay.indexOf(tk) !== -1) {
          score += 2;
        } else {
          return;
        }
      }
      scored.push({ entry: entry, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 12).map(function (s) { return s.entry; });
  }
  D.searchRank = search;

  /* ------------------------------------------------------------ Rendering */

  function bilingual(parent, tag, cls, pair) {
    ['en', 'ar'].forEach(function (l) {
      var el = document.createElement(tag);
      el.setAttribute('lang', l);
      if (cls) { el.className = cls; }
      el.textContent = pair[l];
      parent.appendChild(el);
    });
  }

  function snippet(text) {
    return text.length > 150 ? text.slice(0, 150).replace(/\s+\S*$/, '') + '…' : text;
  }

  function render() {
    if (!state.dialog) { return; }
    var q = state.input.value;
    var results = q.trim() ? search(q) : D.navPages().map(pageEntry);
    state.results = results;
    state.active = results.length ? 0 : -1;
    state.list.textContent = '';

    results.forEach(function (entry, index) {
      var li = document.createElement('li');
      li.id = 'docs-search-opt-' + index;
      li.setAttribute('role', 'option');
      li.className = 'docs-search__item';
      var a = document.createElement('a');
      a.href = entry.url;
      a.tabIndex = -1;
      bilingual(a, 'span', 'docs-search__title', entry.title);
      if (entry.crumb) { bilingual(a, 'span', 'docs-search__crumb', entry.crumb); }
      if (entry.text.en || entry.text.ar) {
        bilingual(a, 'span', 'docs-search__snippet', { en: snippet(entry.text.en), ar: snippet(entry.text.ar) });
      }
      li.appendChild(a);
      state.list.appendChild(li);
    });

    var msg = '';
    if (state.full === 'loading') { msg = t('loading'); }
    else if (q.trim() && !results.length) { msg = t('none'); }
    else if (state.full === 'unavailable') { msg = t('titlesOnly'); }
    else if (q.trim()) { msg = results.length + t('count'); }
    state.status.textContent = msg;
    setActive(state.active);
  }

  function setActive(index) {
    var items = state.list.children;
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('aria-selected', i === index ? 'true' : 'false');
    }
    state.active = index;
    if (index >= 0 && items[index]) {
      state.input.setAttribute('aria-activedescendant', items[index].id);
      if (items[index].scrollIntoView) { items[index].scrollIntoView({ block: 'nearest' }); }
    } else {
      state.input.removeAttribute('aria-activedescendant');
    }
  }

  function go(index) {
    var entry = state.results[index];
    if (!entry) { return; }
    var target = new URL(entry.url, location.href);
    state.dialog.close();
    if (target.pathname === location.pathname && target.hash) {
      location.hash = target.hash;
    } else {
      location.href = target.href;
    }
  }

  /* ------------------------------------------------------------- Dialog UI */

  function buildDialog() {
    var dlg = document.createElement('dialog');
    dlg.className = 'docs-search';
    dlg.setAttribute('aria-labelledby', 'docs-search-title');

    var h = document.createElement('h2');
    h.id = 'docs-search-title';
    h.className = 'docs-sr-only';
    bilingual(h, 'span', '', UI.title);
    dlg.appendChild(h);

    var bar = document.createElement('div');
    bar.className = 'docs-search__bar';
    var input = document.createElement('input');
    input.type = 'search';
    input.className = 'docs-search__input';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-controls', 'docs-search-results');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('enterkeyhint', 'go');
    bar.appendChild(input);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'docs-search__close';
    close.textContent = 'Esc';
    close.addEventListener('click', function () { dlg.close(); });
    bar.appendChild(close);
    dlg.appendChild(bar);

    var list = document.createElement('ul');
    list.id = 'docs-search-results';
    list.className = 'docs-search__list';
    list.setAttribute('role', 'listbox');
    dlg.appendChild(list);

    var status = document.createElement('p');
    status.className = 'docs-search__status';
    status.setAttribute('role', 'status');
    dlg.appendChild(status);

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      var n = state.results.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); if (n) { setActive((state.active + 1) % n); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (n) { setActive((state.active - 1 + n) % n); } }
      else if (e.key === 'Enter') { e.preventDefault(); if (state.active >= 0) { go(state.active); } }
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest ? e.target.closest('li') : null;
      if (!li) { return; }
      e.preventDefault();
      go(Array.prototype.indexOf.call(list.children, li));
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { dlg.close(); } });

    document.body.appendChild(dlg);
    state.dialog = dlg;
    state.input = input;
    state.list = list;
    state.status = status;
    refreshLabels();
  }

  function refreshLabels() {
    if (!state.dialog) { return; }
    state.input.setAttribute('aria-label', t('title'));
    state.input.setAttribute('placeholder', t('placeholder'));
    state.dialog.querySelector('.docs-search__close').setAttribute('aria-label', t('close'));
    if (state.dialog.open) { render(); }
  }

  function open() {
    if (!state.dialog) { buildDialog(); }
    if (!state.dialog.open) {
      if (typeof state.dialog.showModal === 'function') { state.dialog.showModal(); }
      else { state.dialog.setAttribute('open', ''); }
    }
    state.input.value = '';
    loadFullText();
    render();
    state.input.focus();
  }

  function init(base) {
    state.base = base || '';
    state.entries = D.navPages().map(pageEntry);
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.nodeName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        open();
      } else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        open();
      }
    });
    document.addEventListener('buidocs:prefchange', function (e) {
      if (e.detail && e.detail.type === 'lang') { refreshLabels(); }
    });
  }

  D.search = { init: init, open: open, rank: search };
})();
