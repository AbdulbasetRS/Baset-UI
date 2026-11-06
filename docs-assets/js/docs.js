/*
 * Baset UI docs shell (docs-only, not part of the library runtime).
 *
 * Builds the navbar, sidebar, breadcrumbs, table of contents, previous/next
 * links, code-block toolbar and footer around the static page content, and
 * manages the theme / language / direction preferences.
 *
 * Page content itself is static HTML. Bilingual text is authored twice, as
 * elements carrying lang="en" or lang="ar"; the stylesheet shows the one that
 * matches <html lang>, so switching language needs no re-render.
 *
 * Requires: init.js, nav-data.js. Uses highlight.js and search.js when present.
 */
(function () {
  'use strict';

  var D = (window.BUIDocs = window.BUIDocs || {});
  var NAV = D.nav;
  var root = document.documentElement;
  if (!NAV) { return; }

  var base = root.getAttribute('data-docs-root') || '';
  var pageId = root.getAttribute('data-page') || 'index';
  var KEYS = { theme: 'bui-theme', lang: 'bui-docs-lang', dir: 'bui-docs-dir' };
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* ------------------------------------------------------------ Utilities */

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable: preference lasts for this page only */ }
  }
  function load(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function currentLang() { return root.getAttribute('lang') === 'ar' ? 'ar' : 'en'; }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] === false || attrs[k] == null) { return; }
        if (k === 'class') { node.className = attrs[k]; }
        else if (k === 'text') { node.textContent = attrs[k]; }
        else { node.setAttribute(k, attrs[k] === true ? '' : attrs[k]); }
      });
    }
    (children || []).forEach(function (c) { if (c) { node.appendChild(c); } });
    return node;
  }

  /** Two sibling spans, one per language; CSS shows the active one. */
  function bi(pair, tag, cls) {
    var frag = document.createDocumentFragment();
    ['en', 'ar'].forEach(function (l) {
      frag.appendChild(el(tag || 'span', { lang: l, class: cls, text: pair[l] }));
    });
    return frag;
  }

  function icon(markup, cls) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (cls) { svg.setAttribute('class', cls); }
    svg.innerHTML = markup; // constant, trusted markup defined in this file only
    return svg;
  }

  var ICONS = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };

  /* Strings used by the shell itself (page content is authored in the HTML). */
  var UI = {
    menuOpen: { en: 'Open navigation', ar: 'فتح قائمة التنقل' },
    menuClose: { en: 'Close navigation', ar: 'إغلاق قائمة التنقل' },
    search: { en: 'Search', ar: 'بحث' },
    searchAria: { en: 'Search documentation', ar: 'البحث في التوثيق' },
    docs: { en: 'Docs', ar: 'التوثيق' },
    mainNav: { en: 'Main', ar: 'الرئيسية' },
    sideNav: { en: 'Documentation', ar: 'التوثيق' },
    prefs: { en: 'Preferences', ar: 'التفضيلات' },
    themeLabel: { en: 'Dark mode', ar: 'الوضع الداكن' },
    dirLabel: { en: 'Right-to-left layout', ar: 'تخطيط من اليمين إلى اليسار' },
    langSwitch: { en: 'Switch language to Arabic', ar: 'التبديل إلى اللغة الإنجليزية' },
    onThisPage: { en: 'On this page', ar: 'في هذه الصفحة' },
    breadcrumb: { en: 'Breadcrumb', ar: 'مسار التنقل' },
    pager: { en: 'Previous and next pages', ar: 'الصفحة السابقة والتالية' },
    prev: { en: 'Previous', ar: 'السابق' },
    next: { en: 'Next', ar: 'التالي' },
    copy: { en: 'Copy', ar: 'نسخ' },
    copied: { en: 'Copied', ar: 'تم النسخ' },
    copyFailed: { en: 'Copy failed', ar: 'تعذّر النسخ' },
    copyAria: { en: 'Copy code to clipboard', ar: 'نسخ الشيفرة إلى الحافظة' },
    anchor: { en: 'Link to this section', ar: 'رابط إلى هذا القسم' },
    github: { en: 'GitHub', ar: 'GitHub' },
    editPage: { en: 'Edit this page on GitHub', ar: 'عدّل هذه الصفحة على GitHub' },
    footer: {
      en: 'Pre-release documentation. Anything marked Planned or Not implemented yet does not exist today.',
      ar: 'توثيق لإصدار تمهيدي. أي شيء موسوم Planned أو Not implemented yet غير موجود اليوم.'
    }
  };

  function label(key) { return UI[key][currentLang()]; }

  /** Elements declare their translatable ARIA/title text with data-i18n-* attributes. */
  function applyLabels() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-label]'), function (n) {
      n.setAttribute('aria-label', label(n.getAttribute('data-i18n-label')));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-title]'), function (n) {
      n.setAttribute('title', label(n.getAttribute('data-i18n-title')));
    });
  }

  function announce(message) {
    var live = document.getElementById('docs-live');
    if (!live) { return; }
    live.textContent = '';
    window.setTimeout(function () { live.textContent = message; }, 20);
  }

  function emit(type) {
    document.dispatchEvent(new CustomEvent('buidocs:prefchange', { detail: { type: type } }));
  }

  function pageInfo() {
    var all = D.navPages();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === pageId) { return { page: all[i], index: i, all: all }; }
    }
    return { page: null, index: -1, all: all };
  }

  /* ------------------------------------------------------------ Preferences */

  function isDark() { return root.classList.contains('bui-dark'); }

  function updateTitle() {
    var info = pageInfo();
    var l = currentLang();
    var name = info.page && info.page.id !== 'index' ? info.page.title[l] + ' · Baset UI' : NAV.siteTitle[l];
    document.title = name;
  }

  function refreshPrefs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-pref="theme"]'), function (b) {
      b.setAttribute('aria-pressed', String(isDark()));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-pref="dir"]'), function (b) {
      b.setAttribute('aria-pressed', String(root.getAttribute('dir') === 'rtl'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-pref="lang"] .docs-keep-lang'), function (s) {
      var target = currentLang() === 'en' ? 'ar' : 'en';
      s.setAttribute('lang', target);
      s.textContent = target === 'ar' ? 'العربية' : 'English';
    });
  }

  function setTheme(mode) {
    root.classList.toggle('bui-dark', mode === 'dark');
    store(KEYS.theme, mode);
    refreshPrefs();
    emit('theme');
  }

  function setLang(lang) {
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    store(KEYS.lang, lang);
    store(KEYS.dir, root.getAttribute('dir'));
    applyLabels();
    updateTitle();
    refreshPrefs();
    emit('lang');
    emit('dir');
  }

  function setDir(dir) {
    root.setAttribute('dir', dir);
    store(KEYS.dir, dir);
    refreshPrefs();
    emit('dir');
  }

  function buildPrefs() {
    var langBtn = el('button', { type: 'button', class: 'docs-pref', 'data-pref': 'lang', 'data-i18n-label': 'langSwitch' }, [
      el('span', { class: 'docs-keep-lang' })
    ]);
    var dirBtn = el('button', { type: 'button', class: 'docs-pref', 'data-pref': 'dir', 'data-i18n-label': 'dirLabel', 'aria-pressed': 'false' }, [
      el('span', { text: 'RTL', dir: 'ltr' })
    ]);
    var themeBtn = el('button', { type: 'button', class: 'docs-pref docs-pref--icon', 'data-pref': 'theme', 'data-i18n-label': 'themeLabel', 'aria-pressed': 'false' }, [
      icon(ICONS.sun, 'docs-icon-sun'),
      icon(ICONS.moon, 'docs-icon-moon')
    ]);

    langBtn.addEventListener('click', function () { setLang(currentLang() === 'en' ? 'ar' : 'en'); });
    dirBtn.addEventListener('click', function () { setDir(root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl'); });
    themeBtn.addEventListener('click', function () { setTheme(isDark() ? 'light' : 'dark'); });

    return el('div', { class: 'docs-prefs', role: 'group', 'data-i18n-label': 'prefs' }, [langBtn, dirBtn, themeBtn]);
  }

  /* ----------------------------------------------------------------- Navbar */

  function buildNavbar() {
    var host = document.getElementById('docs-navbar');
    if (!host) { return null; }
    var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');

    var menuBtn = el('button', {
      type: 'button', class: 'docs-iconbtn docs-menu-btn', id: 'docs-menu-btn',
      'aria-controls': 'docs-sidebar', 'aria-expanded': 'false', 'data-i18n-label': 'menuOpen'
    }, [icon(ICONS.menu)]);

    var mark = document.createElementNS(SVG_NS, 'svg');
    mark.setAttribute('viewBox', '0 0 32 32');
    mark.setAttribute('width', '28');
    mark.setAttribute('height', '28');
    mark.setAttribute('aria-hidden', 'true');
    mark.setAttribute('focusable', 'false');
    mark.setAttribute('class', 'docs-brand__mark');
    mark.innerHTML = '<rect width="32" height="32" rx="8" class="docs-brand__bg"/><rect x="7" y="8" width="18" height="3.6" rx="1.8" class="docs-brand__bar"/><rect x="7" y="14.2" width="12" height="3.6" rx="1.8" class="docs-brand__bar"/><rect x="7" y="20.4" width="15" height="3.6" rx="1.8" class="docs-brand__bar"/>';

    var brand = el('a', { class: 'docs-brand', href: base + 'index.html' }, [
      mark, el('span', { class: 'docs-brand__name', text: 'Baset UI', dir: 'ltr' })
    ]);

    var links = el('nav', { class: 'docs-navbar__links', 'data-i18n-label': 'mainNav' }, [
      el('a', { href: base + 'getting-started/introduction.html' }, [bi(UI.docs)]),
      el('a', { href: NAV.repoUrl, rel: 'noopener' }, [bi(UI.github)])
    ]);

    var searchBtn = el('button', {
      type: 'button', class: 'docs-search-btn', id: 'docs-search-btn', 'data-i18n-label': 'searchAria'
    }, [
      icon(ICONS.search),
      el('span', { class: 'docs-search-btn__text' }, [bi(UI.search)]),
      el('kbd', { class: 'docs-search-btn__kbd', dir: 'ltr', text: isMac ? '⌘K' : 'Ctrl K' })
    ]);
    searchBtn.addEventListener('click', function () { if (D.search) { D.search.open(); } });

    var inner = el('div', { class: 'docs-navbar__inner' }, [
      menuBtn, brand, links, el('span', { class: 'docs-navbar__spacer' }), searchBtn, buildPrefs()
    ]);
    host.appendChild(inner);
    return menuBtn;
  }

  /* ---------------------------------------------------------------- Sidebar */

  function buildSidebar(menuBtn) {
    var host = document.getElementById('docs-sidebar');
    if (!host) { return; }
    var info = pageInfo();

    function link(page) {
      var a = el('a', { href: base + page.path }, [bi(page.title)]);
      if (info.page && page.id === info.page.id) { a.setAttribute('aria-current', 'page'); }
      return el('li', null, [a]);
    }

    var list = el('ul', { class: 'docs-sidebar__list' }, [link(NAV.home)]);
    NAV.groups.forEach(function (group) {
      var sub = el('ul', { class: 'docs-sidebar__list' });
      group.pages.forEach(function (p) { sub.appendChild(link(p)); });
      list.appendChild(el('li', { class: 'docs-sidebar__group' }, [
        el('p', { class: 'docs-sidebar__heading' }, [bi(group.title)]),
        sub
      ]));
    });

    var nav = el('nav', { 'data-i18n-label': 'sideNav' }, [list]);
    var prefs = el('div', { class: 'docs-sidebar__prefs' }, [buildPrefs()]);
    host.appendChild(prefs);
    host.appendChild(nav);

    var backdrop = document.getElementById('docs-backdrop');
    var layoutQuery = window.matchMedia ? window.matchMedia('(max-width: 59.99rem)') : null;

    function drawerMode() { return !!(layoutQuery && layoutQuery.matches); }
    function main() { return document.getElementById('content'); }

    function setOpen(open, restoreFocus) {
      var drawer = drawerMode();
      var isOpen = drawer && open;
      host.toggleAttribute('data-open', isOpen);
      if (backdrop) { backdrop.hidden = !isOpen; }
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.setAttribute('data-i18n-label', isOpen ? 'menuClose' : 'menuOpen');
      applyLabels();
      document.body.classList.toggle('docs-lock', isOpen);
      host.inert = drawer && !isOpen;
      if (main()) { main().inert = isOpen; }
      if (isOpen) {
        var first = host.querySelector('a, button');
        if (first) { first.focus(); }
      } else if (restoreFocus) {
        menuBtn.focus();
      }
    }

    menuBtn.addEventListener('click', function () { setOpen(!host.hasAttribute('data-open'), true); });
    if (backdrop) { backdrop.addEventListener('click', function () { setOpen(false, true); }); }
    host.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (a && host.hasAttribute('data-open')) { setOpen(false, false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && host.hasAttribute('data-open') && !(document.querySelector('dialog[open]'))) {
        setOpen(false, true);
      }
    });
    if (layoutQuery) {
      var onChange = function () { setOpen(false, false); };
      if (layoutQuery.addEventListener) { layoutQuery.addEventListener('change', onChange); }
      else if (layoutQuery.addListener) { layoutQuery.addListener(onChange); }
    }
    setOpen(false, false);
  }

  /* ------------------------------------------------------- Article features */

  function buildBreadcrumbs(article) {
    var info = pageInfo();
    if (!info.page || info.page.id === 'index') { return; }
    var group = null;
    NAV.groups.forEach(function (g) {
      g.pages.forEach(function (p) { if (p.id === info.page.id) { group = g; } });
    });
    var items = [
      el('li', null, [el('a', { href: base + 'index.html' }, [bi(UI.docs)])]),
      group ? el('li', null, [el('span', null, [bi(group.title)])]) : null,
      el('li', null, [el('span', { 'aria-current': 'page' }, [bi(info.page.title)])])
    ];
    var nav = el('nav', { class: 'docs-breadcrumbs', 'data-i18n-label': 'breadcrumb' }, [el('ol', null, items)]);
    article.insertBefore(nav, article.firstChild);
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
  }

  function enhanceHeadings(article) {
    var headings = Array.prototype.slice.call(article.querySelectorAll('h2, h3'));
    var seen = {};
    headings.forEach(function (h) {
      if (!h.id) {
        var en = h.querySelector('[lang="en"]');
        h.id = slugify((en || h).textContent);
      }
      if (seen[h.id]) { h.id += '-' + (seen[h.id] += 1); } else { seen[h.id] = 1; }
      var a = el('a', { class: 'docs-anchor', href: '#' + h.id, 'data-i18n-label': 'anchor', text: '#' });
      h.appendChild(a);
    });
    return headings;
  }

  function buildToc(article, headings) {
    var entries = headings.filter(function (h) { return h.nodeName === 'H2' || h.nodeName === 'H3'; });
    if (entries.length < 2) { return; }

    function makeList() {
      var ul = el('ul', { class: 'docs-toc__list' });
      entries.forEach(function (h) {
        var a = el('a', { href: '#' + h.id });
        Array.prototype.forEach.call(h.children, function (child) {
          if (child.hasAttribute('lang')) { a.appendChild(child.cloneNode(true)); }
        });
        var li = el('li', { class: h.nodeName === 'H3' ? 'docs-toc__sub' : '' }, [a]);
        ul.appendChild(li);
      });
      return ul;
    }

    var rail = document.getElementById('docs-toc');
    if (rail) {
      rail.appendChild(el('nav', { 'data-i18n-label': 'onThisPage' }, [
        el('p', { class: 'docs-toc__title' }, [bi(UI.onThisPage)]),
        makeList()
      ]));
    }

    var details = el('details', { class: 'docs-toc-inline' }, [
      el('summary', null, [bi(UI.onThisPage)]),
      makeList()
    ]);
    var anchor = article.querySelector('.docs-lead') || article.querySelector('h1');
    if (anchor && anchor.parentNode === article) { article.insertBefore(details, anchor.nextSibling); }

    if ('IntersectionObserver' in window) {
      var links = {};
      Array.prototype.forEach.call(document.querySelectorAll('.docs-toc__list a'), function (a) {
        var id = a.getAttribute('href').slice(1);
        (links[id] = links[id] || []).push(a);
      });
      var visible = {};
      var io = new IntersectionObserver(function (changes) {
        changes.forEach(function (c) { visible[c.target.id] = c.isIntersecting; });
        var current = null;
        for (var i = 0; i < entries.length; i++) {
          if (visible[entries[i].id]) { current = entries[i].id; break; }
        }
        if (!current) { return; }
        Object.keys(links).forEach(function (id) {
          links[id].forEach(function (a) {
            if (id === current) { a.setAttribute('aria-current', 'location'); }
            else { a.removeAttribute('aria-current'); }
          });
        });
      }, { rootMargin: '-72px 0px -65% 0px' });
      entries.forEach(function (h) { io.observe(h); });
    }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = el('textarea', { readonly: true, 'aria-hidden': 'true', tabindex: '-1' });
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) { resolve(); } else { reject(new Error('copy failed')); }
    });
  }

  function enhanceCode(pre) {
    var code = pre.querySelector('code');
    if (!code || pre.parentNode.classList.contains('docs-codeblock')) { return; }
    var source = code.textContent.replace(/\n$/, '');
    var language = pre.getAttribute('data-lang') || 'text';
    var title = pre.getAttribute('data-title');

    if (D.highlight) { code.innerHTML = D.highlight(source, language); } // highlighter escapes all text
    else { code.textContent = source; }

    pre.setAttribute('tabindex', '0');
    pre.setAttribute('dir', 'ltr');

    var copyBtn = el('button', { type: 'button', class: 'docs-codeblock__copy', 'data-i18n-label': 'copyAria' }, [
      icon(ICONS.copy, 'docs-codeblock__icon'),
      el('span', { class: 'docs-codeblock__copy-text' }, [bi(UI.copy)])
    ]);
    var timer = null;
    copyBtn.addEventListener('click', function () {
      var textSource = pre.querySelector('code').textContent.replace(/\n$/, '');
      copyText(textSource).then(function () {
        showCopyState(copyBtn, 'copied');
      }, function () {
        showCopyState(copyBtn, 'copyFailed');
      });
    });

    function showCopyState(btn, key) {
      var textHost = btn.querySelector('.docs-codeblock__copy-text');
      textHost.textContent = '';
      textHost.appendChild(bi(UI[key]));
      btn.setAttribute('data-state', key);
      announce(label(key));
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        textHost.textContent = '';
        textHost.appendChild(bi(UI.copy));
        btn.removeAttribute('data-state');
      }, 1800);
    }

    var bar = el('div', { class: 'docs-codeblock__bar' }, [
      el('span', { class: 'docs-codeblock__name', dir: 'ltr', text: title || language.toUpperCase() }),
      copyBtn
    ]);
    var figure = el('figure', { class: 'docs-codeblock' });
    pre.parentNode.insertBefore(figure, pre);
    figure.appendChild(bar);
    figure.appendChild(pre);
  }

  function enhanceTables(article) {
    Array.prototype.forEach.call(article.querySelectorAll('.docs-table-wrap'), function (w) {
      w.setAttribute('tabindex', '0');
    });
  }

  function buildPager(article) {
    var info = pageInfo();
    if (info.index < 0) { return; }
    var prev = info.all[info.index - 1];
    var next = info.all[info.index + 1];
    if (!prev && !next) { return; }

    function card(page, kind) {
      var a = el('a', { class: 'docs-pager__link docs-pager__link--' + kind, href: base + page.path, rel: kind }, [
        el('span', { class: 'docs-pager__kicker' }, [
          kind === 'next' ? el('span', null, [bi(UI.next)]) : icon(ICONS.arrow, 'docs-pager__arrow docs-pager__arrow--prev'),
          kind === 'prev' ? el('span', null, [bi(UI.prev)]) : icon(ICONS.arrow, 'docs-pager__arrow')
        ]),
        el('span', { class: 'docs-pager__title' }, [bi(page.title)])
      ]);
      return a;
    }

    var nav = el('nav', { class: 'docs-pager', 'data-i18n-label': 'pager' }, [
      prev ? card(prev, 'prev') : el('span'),
      next ? card(next, 'next') : el('span')
    ]);
    article.appendChild(nav);
  }

  function buildFooter() {
    var host = document.getElementById('docs-footer');
    if (!host) { return; }
    var info = pageInfo();
    host.appendChild(el('p', null, [bi(UI.footer, 'span')]));
    var links = el('p', { class: 'docs-footer__links' }, [
      el('a', { href: NAV.repoUrl, rel: 'noopener' }, [bi(UI.github)])
    ]);
    if (info.page) {
      links.appendChild(el('a', { href: NAV.editBase + info.page.path, rel: 'noopener' }, [bi(UI.editPage)]));
    }
    host.appendChild(links);
  }

  /* ------------------------------------------------------------------- Init */

  function init() {
    var menuBtn = buildNavbar();
    if (menuBtn) { buildSidebar(menuBtn); }

    var article = document.querySelector('.docs-article');
    if (article) {
      var headings = enhanceHeadings(article);
      buildBreadcrumbs(article);
      buildToc(article, headings);
      Array.prototype.forEach.call(article.querySelectorAll('pre.docs-code'), enhanceCode);
      enhanceTables(article);
      buildPager(article);
    }
    buildFooter();

    applyLabels();
    updateTitle();
    refreshPrefs();
    if (D.search) { D.search.init(base); }

    // Follow the operating system theme until the reader makes an explicit choice.
    if (window.matchMedia && !load(KEYS.theme)) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var follow = function (e) {
        if (!load(KEYS.theme)) {
          root.classList.toggle('bui-dark', e.matches);
          refreshPrefs();
          emit('theme');
        }
      };
      if (mq.addEventListener) { mq.addEventListener('change', follow); }
    }

    // Offset for the hash target on first load (sticky navbar).
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target && target.scrollIntoView) {
        // The page layout changes after scripts run, so re-apply the hash position without smooth scrolling.
        root.style.scrollBehavior = 'auto';
        target.scrollIntoView();
        root.style.scrollBehavior = '';
      }
    }
  }

  D.setTheme = setTheme;
  D.setLang = setLang;
  D.setDir = setDir;
  D.currentLang = currentLang;
  D.announce = announce;

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
