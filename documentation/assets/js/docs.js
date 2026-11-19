/*
 * Documentation shell behavior ONLY. Not part of the BUI library API.
 *
 * What this file does (see instructions/COMPONENT_DOCUMENTATION.md for the markup contract):
 *   1. Resolves the SITE ROOT so one page template works at any folder depth
 *      (file://, local server, and the /Baset-UI/ sub-path on GitHub Pages).
 *   2. Builds the shell (Navbar, Sidebar, Footer) around <main id="bui-docs-main">
 *      when the page does not already contain one (index.html keeps a static shell).
 *   3. Renders the Sidebar from documentation/assets/js/nav.js, marks the active page,
 *      opens its section and scrolls it into view.
 *   4. Page widgets: Breadcrumb, heading anchors, "On this page" table of contents
 *      with scroll spy, Previous/Next links, Example blocks, Code blocks (Copy + light
 *      highlighting without external libraries), and scrollable regions for wide content.
 *
 *   5. Live token widgets (Task 03): [data-docs-token] cells show the RESOLVED value of a token
 *      read from hidden light/dark probe elements; tr[data-docs-contrast] rows compute WCAG
 *      contrast ratios from those same values; [data-docs-current-bp] shows the active breakpoint.
 *      Values are never typed into the pages, so the docs cannot drift from baset-ui.css.
 *
 *   6. Shell controls (Task 06): the mode button and the theme select call BUI.theme (keys bui-theme and
 *      bui-mode are saved by the library). The RTL/LTR button sets <html dir> directly and saves the
 *      docs-only key bui-docs-dir. The controls follow the state through the bui:theme:change event and
 *      a MutationObserver on the dir attribute, so BUI.theme and BUI.locale stay the source of truth.
 *
 * Docs UI strings are English on purpose: the documentation site language is English
 * until a multilingual docs system is decided (COMPONENT_DOCUMENTATION.md). The shell is not translated
 * with BUI.locale (no data-bui-i18n attributes in it); the Internationalization page demonstrates BUI.locale.
 */
(function () {
    'use strict';

    /* Keep in sync with CHANGELOG.md and the headers of baset-ui.css / baset-ui.js. */
    var DOCS_VERSION = '0.0.0-foundation';
    var GITHUB_URL = 'https://github.com/AbdulbasetRS/Baset-UI';
    /* Themes offered by the shell's theme select. Each one needs its stylesheet linked in every page head. */
    var THEMES = [{ name: 'default', label: 'Default' }, { name: 'ocean', label: 'Ocean' }];

    var doc = document;
    var root = doc.documentElement;
    var SCRIPT_SRC = doc.currentScript && doc.currentScript.src;

    function el(tag, cls, text) {
        var n = doc.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
    }

    /* ------------------------------------------------------------------ */
    /* 1. Site root + current page                                         */
    /* ------------------------------------------------------------------ */

    /*
     * Decision: <html data-root="../../"> (relative to the page) is the primary source.
     * If it is missing, the root is derived from this script's own URL
     * (documentation/assets/js/docs.js is always three levels below the root).
     * Absolute paths ("/assets/...") are never used because of the /Baset-UI/ sub-path.
     */
    function resolveRoot() {
        var attr = root.getAttribute('data-root');
        var url;
        if (attr) {
            url = new URL(attr, location.href);
        } else if (SCRIPT_SRC) {
            url = new URL('../../../', SCRIPT_SRC);
        } else {
            url = new URL('./', location.href);
        }
        if (url.pathname.charAt(url.pathname.length - 1) !== '/') url.pathname += '/';
        url.search = '';
        url.hash = '';
        return url;
    }

    var rootUrl = resolveRoot();

    function siteUrl(path) {
        return new URL(path, rootUrl).href;
    }

    /* Normalizes a path so "a/b.html", "a/b" and "a/b/" compare equal; index pages become "". */
    function pageKey(p) {
        return p.replace(/[?#].*$/, '')
            .replace(/^(\.\/)+/, '')
            .replace(/^\/+/, '')
            .replace(/\.html?$/i, '')
            .replace(/(^|\/)index$/, '');
    }

    function currentKey() {
        var path = location.pathname;
        if (path.indexOf(rootUrl.pathname) !== 0) return null;
        var rel = path.slice(rootUrl.pathname.length);
        try { rel = decodeURIComponent(rel); } catch (e) { /* keep encoded */ }
        return pageKey(rel);
    }

    /* ------------------------------------------------------------------ */
    /* 2. Navigation model (from nav.js)                                   */
    /* ------------------------------------------------------------------ */

    var navData = window.BUI_DOCS_NAV || [];
    var pages = []; /* linkable items in Sidebar order: drives Previous/Next */

    function validHref(item) {
        var href = item.href;
        if (href === undefined || href === null || href === '') return null;
        if (typeof href !== 'string' || /^(\/|\.\.|[a-z][a-z0-9+.-]*:)/i.test(href)) {
            if (window.console) console.warn('[BUI docs] nav.js: href of "' + item.title + '" must be relative to the site root (no leading "/", no "../", no protocol).');
            return null;
        }
        return href.replace(/^(\.\/)+/, '');
    }

    var sections = navData.map(function (sec, si) {
        return {
            title: sec.title,
            items: (sec.items || []).map(function (item) {
                var entry = typeof item === 'string' ? { title: item } : item;
                var rec = { title: entry.title, href: validHref(entry), section: sec.title, sectionIndex: si };
                if (rec.href) pages.push(rec);
                return rec;
            })
        };
    });

    var curKey = currentKey();
    var currentIndex = -1;
    if (curKey !== null) {
        for (var pi = 0; pi < pages.length; pi++) {
            if (pageKey(pages[pi].href) === curKey) { currentIndex = pi; break; }
        }
    }
    var currentPage = currentIndex > -1 ? pages[currentIndex] : null;

    /* ------------------------------------------------------------------ */
    /* 3. Shell                                                            */
    /* ------------------------------------------------------------------ */

    function buildShell() {
        var main = doc.getElementById('bui-docs-main');
        if (!main || doc.querySelector('.bui-docs-navbar')) return; /* static shell (index.html) */

        if (!doc.querySelector('.bui-docs-skip')) {
            var skip = el('a', 'bui-docs-skip', 'Skip to content');
            skip.href = '#bui-docs-main';
            doc.body.insertBefore(skip, doc.body.firstChild);
        }

        var header = el('header', 'bui-docs-navbar');
        header.setAttribute('role', 'banner');

        var toggle = el('button', 'bui-docs-navbar__toggle');
        toggle.type = 'button';
        toggle.id = 'bui-docs-sidebar-toggle';
        toggle.setAttribute('aria-controls', 'bui-docs-sidebar');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Toggle navigation');
        var burger = el('span', 'bui-docs-burger');
        burger.setAttribute('aria-hidden', 'true');
        toggle.appendChild(burger);

        var brand = el('a', 'bui-docs-navbar__brand', 'Baset-UI');
        brand.href = siteUrl('index.html');

        var searchWrap = el('div', 'bui-docs-navbar__search');
        var search = el('input');
        search.type = 'search';
        search.placeholder = 'Search (coming soon)';
        search.setAttribute('aria-label', 'Search documentation');
        search.disabled = true;
        searchWrap.appendChild(search);

        var actions = el('div', 'bui-docs-navbar__actions');
        var themeSelect = el('select', 'bui-docs-select');
        themeSelect.id = 'bui-docs-theme-select';
        themeSelect.setAttribute('aria-label', 'Theme');
        THEMES.forEach(function (t) {
            var option = el('option', '', t.label);
            option.value = t.name;
            themeSelect.appendChild(option);
        });
        var dirBtn = el('button', 'bui-docs-btn', 'RTL');
        dirBtn.type = 'button';
        dirBtn.id = 'bui-docs-dir-toggle';
        dirBtn.setAttribute('aria-label', 'Right-to-left layout');
        dirBtn.setAttribute('aria-pressed', 'false');
        var modeBtn = el('button', 'bui-docs-btn');
        modeBtn.type = 'button';
        modeBtn.id = 'bui-docs-mode-toggle';
        modeBtn.setAttribute('aria-label', 'Dark mode');
        modeBtn.setAttribute('aria-pressed', 'false');
        modeBtn.appendChild(doc.createTextNode('Dark'));
        modeBtn.appendChild(el('span', 'bui-docs-btn__extra', ' mode'));
        var gh = el('a', 'bui-docs-btn', 'GitHub');
        gh.href = GITHUB_URL;
        gh.rel = 'noopener';
        gh.target = '_blank';
        actions.appendChild(themeSelect);
        actions.appendChild(dirBtn);
        actions.appendChild(modeBtn);
        actions.appendChild(gh);

        header.appendChild(toggle);
        header.appendChild(brand);
        header.appendChild(searchWrap);
        header.appendChild(actions);

        var layout = el('div', 'bui-docs-layout');
        var backdrop = el('div', 'bui-docs-backdrop');
        backdrop.id = 'bui-docs-backdrop';
        backdrop.hidden = true;
        var sidebar = el('nav', 'bui-docs-sidebar');
        sidebar.id = 'bui-docs-sidebar';
        sidebar.setAttribute('aria-label', 'Documentation navigation');

        var footer = el('footer', 'bui-docs-footer');
        footer.appendChild(el('span', '', '© 2026 Baset-UI'));
        var ver = el('span', '', 'Version ');
        var verValue = el('span', '', DOCS_VERSION);
        verValue.setAttribute('data-docs-version', '');
        ver.appendChild(verValue);
        footer.appendChild(ver);
        var fgh = el('a', '', 'GitHub');
        fgh.href = GITHUB_URL;
        fgh.rel = 'noopener';
        fgh.target = '_blank';
        footer.appendChild(fgh);

        main.parentNode.insertBefore(header, main);
        main.parentNode.insertBefore(layout, main);
        layout.appendChild(backdrop);
        layout.appendChild(sidebar);
        layout.appendChild(main);
        layout.parentNode.insertBefore(footer, layout.nextSibling);
    }

    buildShell();

    var sidebar = doc.getElementById('bui-docs-sidebar');
    var toggle = doc.getElementById('bui-docs-sidebar-toggle');
    var backdrop = doc.getElementById('bui-docs-backdrop');
    var modeBtn = doc.getElementById('bui-docs-mode-toggle');
    var dirBtn = doc.getElementById('bui-docs-dir-toggle');
    var themeSelect = doc.getElementById('bui-docs-theme-select');
    var navbar = doc.querySelector('.bui-docs-navbar');
    if (!sidebar || !toggle || !backdrop || !modeBtn || !dirBtn || !themeSelect) {
        if (window.console) console.warn('[BUI docs] Shell elements are missing: add <main id="bui-docs-main"> (see DOC_PAGE_TEMPLATE.html).');
        return;
    }

    /* Polite live region used for Copy feedback. */
    var live = el('div', 'bui-docs-sr-only');
    live.id = 'bui-docs-live';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    doc.body.appendChild(live);

    function announce(msg) {
        live.textContent = '';
        window.setTimeout(function () { live.textContent = msg; }, 30);
    }

    /* ---- Render navigation ---- */
    var activeLink = null;

    sections.forEach(function (section, i) {
        var id = 'bui-docs-sec-' + i;
        var wrap = el('div', 'bui-docs-nav-section');
        var btn = el('button', 'bui-docs-nav-section__btn', section.title);
        btn.type = 'button';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', id);
        var list = el('ul', 'bui-docs-nav-list');
        list.id = id;
        list.hidden = true;
        var hasActive = false;

        section.items.forEach(function (item) {
            var li = doc.createElement('li');
            var node;
            if (item.href) {
                node = el('a', 'bui-docs-nav-link', item.title);
                node.href = siteUrl(item.href);
                if (item === currentPage) {
                    node.setAttribute('aria-current', 'page');
                    hasActive = true;
                    activeLink = node;
                }
            } else {
                node = el('span', 'bui-docs-nav-link is-disabled', item.title);
                node.setAttribute('aria-disabled', 'true');
            }
            li.appendChild(node);
            list.appendChild(li);
        });

        function setOpen(open) {
            btn.setAttribute('aria-expanded', String(open));
            list.hidden = !open;
        }
        btn.addEventListener('click', function () {
            setOpen(btn.getAttribute('aria-expanded') !== 'true');
        });
        /* Open the active page's section; with no active page, open the first one. */
        setOpen(hasActive || (!currentPage && i === 0));
        wrap.appendChild(btn);
        wrap.appendChild(list);
        sidebar.appendChild(wrap);
    });

    /* Scrolls the Sidebar (never the page) so the active link is centered. */
    function revealActiveLink() {
        if (!activeLink) return;
        var lr = activeLink.getBoundingClientRect();
        var sr = sidebar.getBoundingClientRect();
        if (!sr.height) return;
        sidebar.scrollTop += (lr.top - sr.top) - (sr.height - lr.height) / 2;
    }

    /* ---- Mobile sidebar ---- */
    function setSidebar(open) {
        sidebar.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        backdrop.hidden = !open;
        if (open) revealActiveLink();
    }
    toggle.addEventListener('click', function () {
        setSidebar(!sidebar.classList.contains('is-open'));
    });
    backdrop.addEventListener('click', function () { setSidebar(false); });
    doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
            setSidebar(false);
            toggle.focus();
        }
    });
    window.matchMedia('(min-width: 992px)').addEventListener('change', function (e) {
        if (e.matches) { setSidebar(false); revealActiveLink(); }
    });
    revealActiveLink();

    /* ---- Mode, theme and direction controls (docs shell only; the state lives in BUI.theme and <html dir>) ---- */
    var BUI = window.BUI;
    if (BUI && BUI.theme) {
        var syncTheme = function () {
            modeBtn.setAttribute('aria-pressed', String(BUI.theme.getMode() === 'dark'));
            themeSelect.value = BUI.theme.get();
        };
        modeBtn.addEventListener('click', function () { BUI.theme.toggleMode(); });
        themeSelect.addEventListener('change', function () { BUI.theme.set(themeSelect.value); });
        root.addEventListener('bui:theme:change', syncTheme);
        syncTheme();
    } else {
        modeBtn.disabled = true;
        themeSelect.disabled = true;
        if (window.console) console.warn('[BUI docs] BUI.theme is missing: load assets/js/baset-ui.js before docs.js.');
    }

    var syncDir = function () { dirBtn.setAttribute('aria-pressed', String(root.getAttribute('dir') === 'rtl')); };
    dirBtn.addEventListener('click', function () {
        var next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
        root.setAttribute('dir', next);
        try { localStorage.setItem('bui-docs-dir', next); } catch (e) { /* storage is optional */ }
    });
    if (window.MutationObserver) new MutationObserver(syncDir).observe(root, { attributes: true, attributeFilter: ['dir'] });
    syncDir();

    /* ------------------------------------------------------------------ */
    /* 4. Page widgets                                                     */
    /* ------------------------------------------------------------------ */

    var main = doc.getElementById('bui-docs-main');
    var pageEl = main.querySelector('.bui-docs-page');
    var bodyEl = main.querySelector('.bui-docs-page__body');
    var contentEl = main.querySelector('.bui-docs-content');

    /* ---- Breadcrumb: Home / Section / Page (only for pages registered in nav.js) ---- */
    var crumb = main.querySelector('[data-docs-breadcrumb]');
    if (crumb && currentPage) {
        var ol = el('ol');
        var home = doc.createElement('li');
        var homeLink = el('a', '', 'Home');
        homeLink.href = siteUrl('index.html');
        home.appendChild(homeLink);
        var secLi = doc.createElement('li');
        secLi.appendChild(el('span', '', currentPage.section));
        var pageLi = doc.createElement('li');
        var pageSpan = el('span', '', currentPage.title);
        pageSpan.setAttribute('aria-current', 'page');
        pageLi.appendChild(pageSpan);
        ol.appendChild(home);
        ol.appendChild(secLi);
        ol.appendChild(pageLi);
        crumb.textContent = '';
        crumb.appendChild(ol);
        crumb.hidden = false;
    }

    /* ---- Headings: ids, anchors, table of contents ---- */
    function slugify(text) {
        var s = text.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
        return s || 'section';
    }

    var headings = [];
    if (contentEl) {
        headings = Array.prototype.slice.call(contentEl.querySelectorAll('h2, h3')).filter(function (h) {
            return !h.closest('.bui-docs-example');
        });
    }
    var headingTexts = headings.map(function (h) { return h.textContent.trim(); });

    headings.forEach(function (h, i) {
        if (!h.id) {
            var base = slugify(headingTexts[i]);
            var id = base;
            var n = 2;
            while (doc.getElementById(id)) { id = base + '-' + n; n += 1; }
            h.id = id;
        }
        var a = el('a', 'bui-docs-anchor', '#');
        a.href = '#' + h.id;
        a.setAttribute('aria-label', 'Link to section: ' + headingTexts[i]);
        h.appendChild(a);
    });

    var tocLinks = [];
    var tocNav = null;
    if (pageEl && headings.length > 1) {
        tocNav = el('nav', 'bui-docs-toc');
        tocNav.setAttribute('aria-label', 'On this page');
        tocNav.appendChild(el('p', 'bui-docs-toc__title', 'On this page'));
        var tocList = el('ul', 'bui-docs-toc__list');
        headings.forEach(function (h, i) {
            var li = doc.createElement('li');
            var a = el('a', 'bui-docs-toc__link' + (h.tagName === 'H3' ? ' bui-docs-toc__link--sub' : ''), headingTexts[i]);
            a.href = '#' + h.id;
            li.appendChild(a);
            tocList.appendChild(li);
            tocLinks.push(a);
        });
        tocNav.appendChild(tocList);
        pageEl.appendChild(tocNav);
    }

    /* Scroll spy: the active heading is the last one above the sticky navbar line. */
    var spyActive = -1;
    var spyTicking = false;

    function setSpy(idx) {
        if (idx === spyActive) return;
        spyActive = idx;
        tocLinks.forEach(function (a, i) {
            if (i === idx) {
                a.classList.add('is-active');
                a.setAttribute('aria-current', 'true');
            } else {
                a.classList.remove('is-active');
                a.removeAttribute('aria-current');
            }
        });
        /* Keep the active entry visible inside the (scrollable) TOC. */
        if (idx > -1 && tocNav && tocNav.scrollHeight > tocNav.clientHeight) {
            var ar = tocLinks[idx].getBoundingClientRect();
            var tr = tocNav.getBoundingClientRect();
            if (ar.top < tr.top || ar.bottom > tr.bottom) {
                tocNav.scrollTop += (ar.top - tr.top) - (tr.height - ar.height) / 2;
            }
        }
    }

    function spyUpdate() {
        spyTicking = false;
        if (!tocNav || tocNav.offsetParent === null) return; /* TOC is hidden below XL */
        var line = (navbar ? navbar.offsetHeight : 0) + 24;
        var idx = 0;
        for (var i = 0; i < headings.length; i++) {
            if (headings[i].getBoundingClientRect().top - line <= 0) idx = i; else break;
        }
        if (window.innerHeight + window.pageYOffset >= root.scrollHeight - 2) idx = headings.length - 1;
        setSpy(idx);
    }

    function requestSpy() {
        if (spyTicking) return;
        spyTicking = true;
        window.requestAnimationFrame(spyUpdate);
    }

    if (tocNav) {
        window.addEventListener('scroll', requestSpy, { passive: true });
        window.addEventListener('resize', requestSpy);
    }

    /* ---- Previous / Next (order comes from nav.js) ---- */
    if (bodyEl && currentPage) {
        var pn = el('nav', 'bui-docs-pagenav');
        pn.setAttribute('aria-label', 'Previous and next pages');

        var addLink = function (target, dir) {
            var a = el('a', 'bui-docs-pagenav__link bui-docs-pagenav__link--' + dir);
            a.href = siteUrl(target.href);
            a.rel = dir;
            a.appendChild(el('span', 'bui-docs-pagenav__label', dir === 'prev' ? 'Previous' : 'Next'));
            a.appendChild(el('span', 'bui-docs-pagenav__title', target.title));
            a.appendChild(el('span', 'bui-docs-pagenav__section', target.section));
            pn.appendChild(a);
        };
        if (currentIndex > 0) addLink(pages[currentIndex - 1], 'prev');
        if (currentIndex < pages.length - 1) addLink(pages[currentIndex + 1], 'next');
        if (pn.firstChild) bodyEl.appendChild(pn);
    }

    /* ---- Copy (no external library; Clipboard API with a legacy fallback) ---- */
    function legacyCopy(text) {
        var prev = doc.activeElement;
        var ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.setAttribute('aria-hidden', 'true');
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.opacity = '0';
        ta.style.pointerEvents = 'none';
        doc.body.appendChild(ta);
        var ok = false;
        try {
            ta.select();
            ta.setSelectionRange(0, text.length);
            ok = doc.execCommand('copy');
        } catch (e) { ok = false; }
        doc.body.removeChild(ta);
        if (prev && prev.focus) prev.focus();
        return ok;
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
        }
        return Promise.resolve(legacyCopy(text));
    }

    function selectContents(node) {
        var sel = window.getSelection();
        if (!sel) return;
        var range = doc.createRange();
        range.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    /* ---- Light syntax highlighting (own tokenizer, DOM-built, no innerHTML) ---- */
    var STRING_RE = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y;
    var JS_WORDS = { 'const': 1, 'let': 1, 'var': 1, 'function': 1, 'return': 1, 'if': 1, 'else': 1, 'for': 1, 'while': 1, 'do': 1, 'switch': 1, 'case': 1, 'break': 1, 'continue': 1, 'new': 1, 'delete': 1, 'typeof': 1, 'instanceof': 1, 'in': 1, 'of': 1, 'this': 1, 'class': 1, 'extends': 1, 'try': 1, 'catch': 1, 'finally': 1, 'throw': 1, 'async': 1, 'await': 1, 'true': 1, 'false': 1, 'null': 1, 'undefined': 1 };

    var RULES = {
        javascript: [
            { re: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y, type: 'comment' },
            { re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\[\s\S])*`/y, type: 'string' },
            { re: /[A-Za-z_$][\w$]*/y, type: function (w) { return JS_WORDS[w] === 1 ? 'keyword' : 'plain'; } },
            { re: /\d+(?:\.\d+)?/y, type: 'number' }
        ],
        css: [
            { re: /\/\*[\s\S]*?(?:\*\/|$)/y, type: 'comment' },
            { re: STRING_RE, type: 'string' },
            { re: /@[\w-]+/y, type: 'keyword' },
            { re: /--[\w-]+/y, type: 'attr' },
            { re: /[A-Za-z_-][\w-]*/y, type: 'plain' },
            { re: /#[0-9a-fA-F]{3,8}\b|\d*\.?\d+(?:px|rem|em|%|vh|vw|ms|s|deg|fr)?/y, type: 'number' }
        ],
        json: [
            { re: STRING_RE, type: 'string' },
            { re: /[A-Za-z_]+/y, type: function (w) { return (w === 'true' || w === 'false' || w === 'null') ? 'keyword' : 'plain'; } },
            { re: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y, type: 'number' }
        ],
        bash: [
            { re: STRING_RE, type: 'string' }
        ]
    };
    RULES.js = RULES.javascript;

    function lexGeneric(code, rules) {
        var out = [];
        var buf = '';
        var pos = 0;
        var n = code.length;
        while (pos < n) {
            var hit = null;
            for (var r = 0; r < rules.length; r++) {
                rules[r].re.lastIndex = pos;
                var m = rules[r].re.exec(code);
                if (m && m[0].length) {
                    hit = { text: m[0], type: typeof rules[r].type === 'function' ? rules[r].type(m[0]) : rules[r].type };
                    break;
                }
            }
            if (!hit) { buf += code.charAt(pos); pos += 1; continue; }
            if (hit.type === 'plain') {
                buf += hit.text;
            } else {
                if (buf) { out.push(['plain', buf]); buf = ''; }
                out.push([hit.type, hit.text]);
            }
            pos += hit.text.length;
        }
        if (buf) out.push(['plain', buf]);
        return out;
    }

    function lexHtml(code) {
        var out = [];
        var buf = '';
        var pos = 0;
        var n = code.length;
        var inTag = false;

        function take(re) {
            re.lastIndex = pos;
            var m = re.exec(code);
            return m && m[0].length ? m[0] : null;
        }
        function push(type, text) {
            if (type === 'plain') { buf += text; } else {
                if (buf) { out.push(['plain', buf]); buf = ''; }
                out.push([type, text]);
            }
            pos += text.length;
        }

        while (pos < n) {
            var t;
            if (!inTag) {
                if ((t = take(/<!--[\s\S]*?(?:-->|$)/y))) push('comment', t);
                else if ((t = take(/<![^>]*>?/y))) push('keyword', t);
                else if ((t = take(/<\/?[A-Za-z][\w:-]*/y))) { push('tag', t); inTag = true; }
                else if ((t = take(/[^<]+|</y))) push('plain', t);
                else push('plain', code.charAt(pos));
            } else {
                if ((t = take(/\/?>/y))) { push('tag', t); inTag = false; }
                else if ((t = take(/\s+/y))) push('plain', t);
                else if ((t = take(STRING_RE))) push('string', t);
                else if ((t = take(/[^\s=>"'\/]+/y))) push('attr', t);
                else push('plain', code.charAt(pos));
            }
        }
        if (buf) out.push(['plain', buf]);
        return out;
    }

    function highlight(code, lang) {
        var tokens;
        if (lang === 'html') tokens = lexHtml(code);
        else if (RULES[lang]) tokens = lexGeneric(code, RULES[lang]);
        else tokens = [['plain', code]];
        var frag = doc.createDocumentFragment();
        tokens.forEach(function (tk) {
            if (tk[0] === 'plain') {
                frag.appendChild(doc.createTextNode(tk[1]));
            } else {
                frag.appendChild(el('span', 'bui-docs-tok bui-docs-tok--' + tk[0], tk[1]));
            }
        });
        return frag;
    }

    /*
     * Shared with playground.js (Task 08), so the Playground code output highlights and copies exactly like every other
     * code block without a second tokenizer or a second clipboard routine. Docs-only; not part of the BUI library.
     */
    window.BUI_DOCS_HELPERS = { highlight: highlight, copyText: copyText };

    var LANG_LABELS = { html: 'HTML', css: 'CSS', javascript: 'JavaScript', js: 'JavaScript', json: 'JSON', bash: 'Shell', text: 'Text' };

    /* Wraps <pre class="bui-docs-code"> with a header bar (language + Copy) and highlights it. */
    function enhanceCode(pre) {
        if (pre.getAttribute('data-docs-enhanced')) return;
        pre.setAttribute('data-docs-enhanced', 'true');

        var codeEl = pre.querySelector('code');
        if (!codeEl) {
            codeEl = doc.createElement('code');
            codeEl.textContent = pre.textContent;
            pre.textContent = '';
            pre.appendChild(codeEl);
        }
        var lang = (pre.getAttribute('data-lang') || 'text').toLowerCase();
        var label = LANG_LABELS[lang] || lang.toUpperCase();
        var source = codeEl.textContent.replace(/^\n+/, '').replace(/\s+$/, '');
        codeEl.textContent = '';
        codeEl.appendChild(highlight(source, lang));

        /* Code is always left-to-right, also inside RTL pages. */
        pre.setAttribute('dir', 'ltr');

        var block = el('div', 'bui-docs-codeblock');
        var bar = el('div', 'bui-docs-codeblock__bar');
        bar.appendChild(el('span', 'bui-docs-codeblock__lang', label));
        var btn = el('button', 'bui-docs-btn bui-docs-copy', 'Copy');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Copy ' + label + ' code');
        bar.appendChild(btn);

        pre.parentNode.insertBefore(block, pre);
        block.appendChild(bar);
        block.appendChild(pre);
        pre.setAttribute('data-docs-label', label + ' code');

        var timer = null;
        btn.addEventListener('click', function () {
            copyText(source).then(function (ok) {
                btn.textContent = ok ? 'Copied' : 'Copy failed';
                announce(ok ? label + ' code copied to clipboard' : 'Copy failed. The code is selected: press Ctrl+C or Command+C.');
                if (!ok) selectContents(codeEl);
                window.clearTimeout(timer);
                timer = window.setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
            });
        });
    }

    /* ---- Example blocks ---- */
    function dedent(text) {
        var lines = text.replace(/\r\n?/g, '\n').replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
        var min = Infinity;
        lines.forEach(function (l) {
            if (!l.trim()) return;
            var indent = l.match(/^[ \t]*/)[0].length;
            if (indent < min) min = indent;
        });
        if (!isFinite(min) || min === 0) return lines.join('\n');
        return lines.map(function (l) { return l.slice(min); }).join('\n');
    }

    /*
     * An Example block is a live preview plus its code. When the block has no explicit
     * <pre class="bui-docs-code">, the HTML code is generated from the preview markup as it
     * is at load time, so the shown code is exactly what runs.
     */
    function enhanceExample(example) {
        var preview = example.querySelector('.bui-docs-example__preview');
        if (!preview || example.querySelector('.bui-docs-code')) return;
        var pre = el('pre', 'bui-docs-code');
        pre.setAttribute('data-lang', 'html');
        var code = doc.createElement('code');
        code.textContent = dedent(preview.innerHTML);
        pre.appendChild(code);
        example.appendChild(pre);
    }

    Array.prototype.forEach.call(main.querySelectorAll('.bui-docs-example'), enhanceExample);
    Array.prototype.forEach.call(main.querySelectorAll('pre.bui-docs-code'), enhanceCode);

    /* ---- Tables: wrap so wide tables scroll inside their own container ---- */
    Array.prototype.forEach.call(main.querySelectorAll('table.bui-docs-table'), function (table) {
        if (table.parentNode.classList.contains('bui-docs-table-wrap')) return;
        var wrap = el('div', 'bui-docs-table-wrap');
        var cap = table.querySelector('caption');
        wrap.setAttribute('data-docs-label', cap ? cap.textContent.trim() : 'Table');
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
    });
    Array.prototype.forEach.call(main.querySelectorAll('.bui-docs-table-wrap:not([data-docs-label])'), function (w) {
        w.setAttribute('data-docs-label', 'Table');
    });
    Array.prototype.forEach.call(main.querySelectorAll('.bui-docs-example__preview'), function (p) {
        p.setAttribute('data-docs-label', 'Example preview');
    });

    /* Overflowing regions become keyboard-focusable named regions (WCAG 2.1.1). */
    var scrollTicking = false;
    function updateScrollables() {
        scrollTicking = false;
        Array.prototype.forEach.call(main.querySelectorAll('.bui-docs-table-wrap, pre.bui-docs-code, .bui-docs-example__preview'), function (n) {
            var overflows = n.scrollWidth > n.clientWidth + 1;
            var managed = n.getAttribute('data-docs-scroll') === 'true';
            if (overflows && !managed) {
                n.setAttribute('data-docs-scroll', 'true');
                n.setAttribute('tabindex', '0');
                n.setAttribute('role', 'region');
                n.setAttribute('aria-label', 'Scrollable ' + (n.getAttribute('data-docs-label') || 'content'));
            } else if (!overflows && managed) {
                n.removeAttribute('data-docs-scroll');
                n.removeAttribute('tabindex');
                n.removeAttribute('role');
                n.removeAttribute('aria-label');
            }
        });
    }
    function requestScrollables() {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(updateScrollables);
    }
    window.addEventListener('resize', requestScrollables);
    window.addEventListener('load', requestScrollables);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(requestScrollables);
    updateScrollables();


    /* ---- Live token values, contrast checks, current breakpoint (docs-only) ---- */
    /*
     * Hidden probes carry data-bui-mode AND data-bui-theme on the same element (a theme's Dark block needs both),
     * so tokens are read for BOTH modes whatever the page mode is. The theme is the page's current theme unless
     * the cell sets data-docs-theme.
     */
    function probe(mode, theme) {
        var key = mode + '|' + theme;
        var p = null;
        Array.prototype.forEach.call(doc.querySelectorAll('[data-docs-probe]'), function (n) {
            if (n.getAttribute('data-docs-probe') === key) p = n;
        });
        if (!p) {
            p = doc.createElement('div');
            p.setAttribute('data-bui-mode', mode);
            p.setAttribute('data-bui-theme', theme);
            p.setAttribute('data-docs-probe', key);
            p.hidden = true;
            doc.body.appendChild(p);
        }
        return p;
    }

    function tokenValue(name, mode, theme) {
        var t = theme || root.getAttribute('data-bui-theme') || 'default';
        return window.getComputedStyle(probe(mode || 'light', t)).getPropertyValue(name).trim();
    }

    function parseColor(v) {
        var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
        if (m) {
            var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
            return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
        }
        m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(v);
        return m ? [+m[1], +m[2], +m[3]] : null;
    }

    function luminance(c) {
        var l = c.map(function (x) {
            x /= 255;
            return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
    }

    function contrastRatio(a, b) {
        var la = luminance(a);
        var lb = luminance(b);
        return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    }

    /* Fills token cells and contrast rows. Runs again on bui:theme:change so the values follow the active theme. */
    function renderLive() {
        Array.prototype.forEach.call(main.querySelectorAll('[data-docs-token]'), function (cell) {
            cell.textContent = tokenValue(cell.getAttribute('data-docs-token'), cell.getAttribute('data-docs-mode'), cell.getAttribute('data-docs-theme')) || 'not defined';
        });

        var contrastStats = { light: [0, 0], dark: [0, 0] };
        Array.prototype.forEach.call(main.querySelectorAll('tr[data-docs-contrast]'), function (row) {
            var min = parseFloat(row.getAttribute('data-min'));
            ['light', 'dark'].forEach(function (mode) {
                var cell = row.querySelector('[data-docs-cell="' + mode + '"]');
                if (!cell) return;
                var theme = row.getAttribute('data-docs-theme');
                var fg = parseColor(tokenValue(row.getAttribute('data-fg'), mode, theme));
                var bg = parseColor(tokenValue(row.getAttribute('data-bg'), mode, theme));
                if (!fg || !bg) { cell.textContent = 'not computable'; return; }
                var r = contrastRatio(fg, bg);
                var ok = r >= min;
                cell.textContent = (Math.floor(r * 100) / 100).toFixed(2) + ':1 ' + (ok ? 'Pass' : 'Fail');
                contrastStats[mode][1] += 1;
                if (ok) contrastStats[mode][0] += 1;
            });
        });
        Array.prototype.forEach.call(main.querySelectorAll('[data-docs-contrast-summary]'), function (n) {
            n.textContent = 'Light: ' + contrastStats.light[0] + ' of ' + contrastStats.light[1] + ' checks pass. Dark: ' +
                contrastStats.dark[0] + ' of ' + contrastStats.dark[1] + ' checks pass.';
        });
    }
    renderLive();
    root.addEventListener('bui:theme:change', renderLive);

    var bpOut = main.querySelector('[data-docs-current-bp]');
    var BP_NAMES = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'];
    function updateBp() {
        var w = window.innerWidth;
        var cur = 'Base (below 480px)';
        BP_NAMES.forEach(function (n) {
            var px = parseInt(tokenValue('--bui-bp-' + n), 10);
            if (px && w >= px) cur = n.toUpperCase() + ' (from ' + px + 'px)';
        });
        bpOut.textContent = cur + ', viewport ' + w + 'px';
    }
    if (bpOut) {
        window.addEventListener('resize', updateBp);
        updateBp();
    }

    /* ---- Initial hash: headings got their ids after load, so scroll again ---- */
    if (location.hash.length > 1) {
        try {
            var target = doc.getElementById(decodeURIComponent(location.hash.slice(1)));
            if (target) target.scrollIntoView();
        } catch (e) { /* ignore malformed hash */ }
    }
    spyUpdate();
})();
