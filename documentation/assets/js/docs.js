/* Documentation shell behavior only. Not part of the BUI library API. */
(function () {
    'use strict';
    var root = document.documentElement;
    var sidebar = document.getElementById('bui-docs-sidebar');
    var toggle = document.getElementById('bui-docs-sidebar-toggle');
    var backdrop = document.getElementById('bui-docs-backdrop');
    var modeBtn = document.getElementById('bui-docs-mode-toggle');
    var current = location.pathname.split('/').pop() || 'index.html';

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
                node.href = entry.href;
                if (entry.href.split('/').pop() === current) {
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
        setOpen(hasActive || i === 0);
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
})();
