/* Documentation shell behavior only. Not part of the BUI library API. */
(function () {
    'use strict';
    var root = document.documentElement;
    var sidebar = document.getElementById('bui-docs-sidebar');
    var toggle = document.getElementById('bui-docs-sidebar-toggle');
    var backdrop = document.getElementById('bui-docs-backdrop');
    var modeBtn = document.getElementById('bui-docs-mode-toggle');
    /* Relative path from the current page to the site root: "" (index.html) or "../../" (documentation/x/page.html) */
    var siteRoot = document.body.getAttribute('data-docs-root') || '';

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
    }

    /* ---- Render navigation ---- */
    (window.BUI_DOCS_NAV || []).forEach(function (section, i) {
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
            var entry = typeof item === 'string' ? { title: item } : item;
            var li = document.createElement('li');
            var node;
            if (entry.href) {
                node = el('a', 'bui-docs-nav-link', entry.title);
                node.setAttribute('href', siteRoot + entry.href);
                if (node.pathname === location.pathname) {
                    node.setAttribute('aria-current', 'page');
                    hasActive = true;
                }
            } else {
                node = el('span', 'bui-docs-nav-link is-disabled', entry.title);
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
        setOpen(hasActive || (i === 0 && !document.querySelector('.bui-docs-article')));
        wrap.appendChild(btn);
        wrap.appendChild(list);
        sidebar.appendChild(wrap);
    });

    /* ---- Mobile sidebar ---- */
    function setSidebar(open) {
        sidebar.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        backdrop.hidden = !open;
    }
    toggle.addEventListener('click', function () {
        setSidebar(!sidebar.classList.contains('is-open'));
    });
    backdrop.addEventListener('click', function () { setSidebar(false); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
            setSidebar(false);
            toggle.focus();
        }
    });
    window.matchMedia('(min-width: 992px)').addEventListener('change', function (e) {
        if (e.matches) setSidebar(false);
    });

    /* ---- Light / Dark toggle (docs shell only) ---- */
    function syncMode() {
        var dark = root.getAttribute('data-bui-mode') === 'dark';
        modeBtn.setAttribute('aria-pressed', String(dark));
        modeBtn.textContent = dark ? 'Light mode' : 'Dark mode';
    }
    modeBtn.addEventListener('click', function () {
        var next = root.getAttribute('data-bui-mode') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-bui-mode', next);
        try { localStorage.setItem('bui-docs-mode', next); } catch (e) {}
        syncMode();
    });
    syncMode();

    /* ---- Copy buttons (event delegation; works for content swapped in later) ---- */
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.insetBlockStart = '-100px';
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            ok ? resolve() : reject(new Error('copy failed'));
        });
    }
    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('[data-docs-copy]');
        if (!btn) return;
        var code = btn.parentNode.querySelector('pre code');
        if (!code) return;
        var status = document.getElementById('bui-docs-status');
        copyText(code.textContent).then(function () {
            btn.textContent = 'Copied';
            if (status) status.textContent = 'Code copied to clipboard';
        }, function () {
            btn.textContent = 'Press Ctrl+C';
            if (status) status.textContent = 'Copy failed. Select the code and copy it manually';
        }).then(function () {
            setTimeout(function () { btn.textContent = 'Copy'; if (status) status.textContent = ''; }, 1600);
        });
    });

    /* ---- Live read-outs (documentation pages) ----
       [data-docs-viewport]        -> viewport width in px
       [data-docs-breakpoint]      -> name of the current breakpoint (from --bui-bp-* tokens)
       [data-docs-width-of="#id"]  -> rendered width of that element in px
       [data-docs-css-var="--x"]   -> computed value of a CSS variable on <html> */
    function breakpoints() {
        var cs = getComputedStyle(root), list = [];
        ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'].forEach(function (n) {
            var v = parseFloat(cs.getPropertyValue('--bui-bp-' + n));
            if (!isNaN(v)) list.push({ name: n.toUpperCase(), min: v });
        });
        return list;
    }
    function updateLive() {
        var w = window.innerWidth, cs = getComputedStyle(root);
        Array.prototype.forEach.call(document.querySelectorAll('[data-docs-viewport]'), function (n) {
            n.textContent = w + 'px';
        });
        var current = 'Base (below XS)';
        breakpoints().forEach(function (b) { if (w >= b.min) current = b.name; });
        Array.prototype.forEach.call(document.querySelectorAll('[data-docs-breakpoint]'), function (n) {
            n.textContent = current;
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-docs-width-of]'), function (n) {
            var t = document.querySelector(n.getAttribute('data-docs-width-of'));
            n.textContent = t ? Math.round(t.getBoundingClientRect().width) + 'px' : 'n/a';
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-docs-css-var]'), function (n) {
            n.textContent = cs.getPropertyValue(n.getAttribute('data-docs-css-var')).trim() || 'n/a';
        });
    }
    var raf = 0;
    window.addEventListener('resize', function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(updateLive);
    });
    updateLive();
})();
