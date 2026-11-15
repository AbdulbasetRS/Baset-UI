/* ==========================================================================
   Code block component (documentation shell only, NOT part of the BUI library).
   One reusable component that tokenizes and colors every code block.
   - Own tokenizer, no third party library. Languages: html, css, js, json, php.
   - Never changes the text: tokens are wrapped in <span>, so selection and the
     Copy button (which reads textContent) behave exactly as before.
   - Language: data-docs-lang on <code>, <pre> or .bui-docs-code ("plain" disables),
     otherwise detected from the content.
   - Public API (for the future Playground / Code Generator):
       BUI_DOCS_CODE.detect(source)              -> language name
       BUI_DOCS_CODE.tokenize(source, lang)      -> [[type, text], ...]
       BUI_DOCS_CODE.highlight(codeElement, lang?) -> language used, or "" when skipped
       BUI_DOCS_CODE.enhance(root?)              -> highlights every .bui-docs-code pre code
   Colors: --bui-docs-syntax-* tokens in docs.css (VS Code Dark+).
   ========================================================================== */
(function () {
    'use strict';

    function set(words) {
        var o = {};
        words.split(' ').forEach(function (w) { o[w] = true; });
        return o;
    }
    /* Sticky regex helpers: match exactly at index i */
    function eatM(re, s, i) {
        re.lastIndex = i;
        var m = re.exec(s);
        return m && m[0].length ? m : null;
    }
    function eat(re, s, i) {
        var m = eatM(re, s, i);
        return m ? m[0] : null;
    }
    function Out() { this.list = []; }
    Out.prototype.add = function (type, text) {
        if (!text) return;
        var last = this.list[this.list.length - 1];
        if (last && last[0] === type) last[1] += text; else this.list.push([type, text]);
    };

    var RE_WS = /\s+/y;
    var RE_LINE = /\/\/[^\n]*/y;
    var RE_BLOCK = /\/\*[\s\S]*?(?:\*\/|$)/y;
    var RE_HASH = /#[^\n]*/y;
    var RE_DQ = /"(?:[^"\\]|\\[\s\S])*(?:"|$)/y;
    var RE_SQ = /'(?:[^'\\]|\\[\s\S])*(?:'|$)/y;
    var RE_TPL = /`(?:[^`\\]|\\[\s\S])*(?:`|$)/y;
    var RE_NUM = /(?:0[xX][\da-fA-F_]+|(?:\d[\d_]*\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/y;
    var RE_REGEX = /\/(?![*\/])(?:[^\/\\\n\[]|\\.|\[(?:[^\]\\\n]|\\.)*\])+\/[a-z]*/y;
    var RE_IDENT_JS = /[A-Za-z_$][\w$]*/y;
    var RE_IDENT_PHP = /[A-Za-z_]\w*/y;
    var RE_PHPVAR = /\$[A-Za-z_]\w*/y;

    /* ---- JavaScript and PHP (shared scanner) ---- */
    var JS_OPTS = {
        ident: RE_IDENT_JS, regex: true, template: true, hash: false, dollarVar: false, arrow: false, lower: false,
        control: set('if else for while do return switch case break continue try catch finally throw import export default await async yield'),
        storage: set('var let const function class extends static new typeof instanceof in void delete this super'),
        consts: set('true false null undefined NaN Infinity')
    };
    var PHP_OPTS = {
        ident: RE_IDENT_PHP, regex: false, template: false, hash: true, dollarVar: true, arrow: true, lower: true,
        control: set('if else elseif endif for foreach endforeach while endwhile do return switch case break continue default try catch finally throw require require_once include include_once use namespace match yield'),
        storage: set('function fn class interface trait extends implements public private protected static abstract final new const var global echo print isset unset empty array list instanceof as self parent'),
        consts: set('true false null')
    };

    function lexCode(s, out, o) {
        var i = 0, n = s.length, m, c, prev = '', dot = false;
        while (i < n) {
            c = s.charAt(i);
            if ((m = eat(RE_WS, s, i))) { out.add('plain', m); i += m.length; continue; }
            if ((m = eat(RE_LINE, s, i) || eat(RE_BLOCK, s, i) || (o.hash && eat(RE_HASH, s, i)))) {
                out.add('comment', m); i += m.length; continue;
            }
            if ((m = eat(RE_DQ, s, i) || eat(RE_SQ, s, i) || (o.template && eat(RE_TPL, s, i)))) {
                out.add('string', m); i += m.length; prev = 'id'; dot = false; continue;
            }
            if (o.regex && c === '/' && prev !== 'id' && prev !== 'close' && (m = eat(RE_REGEX, s, i))) {
                out.add('regexp', m); i += m.length; prev = 'id'; dot = false; continue;
            }
            if (o.dollarVar && (m = eat(RE_PHPVAR, s, i))) {
                out.add('variable', m); i += m.length; prev = 'id'; dot = false; continue;
            }
            if ((m = eat(RE_NUM, s, i))) {
                out.add('number', m); i += m.length; prev = 'id'; dot = false; continue;
            }
            if ((m = eat(o.ident, s, i))) {
                var j = i + m.length, nxt, type, key = o.lower ? m.toLowerCase() : m;
                while (j < n && /\s/.test(s.charAt(j))) j++;
                nxt = s.charAt(j);
                if (dot) type = nxt === '(' ? 'function' : 'variable';
                else if (o.control[key]) type = 'control';
                else if (o.storage[key] || o.consts[key]) type = 'keyword';
                else if (nxt === '(') type = 'function';
                else if (/^[A-Z]/.test(m)) type = 'type';
                else type = 'variable';
                out.add(type, m);
                i += m.length;
                dot = false;
                prev = (type === 'control' || (type === 'keyword' && !o.consts[key] && key !== 'this')) ? '' : 'id';
                continue;
            }
            if (o.arrow && s.substr(i, 2) === '->') {
                out.add('plain', '->'); i += 2; dot = true; prev = ''; continue;
            }
            out.add('plain', c);
            i++;
            dot = c === '.';
            prev = (c === ')' || c === ']' || c === '}') ? 'close' : '';
        }
    }

    /* ---- JSON ---- */
    var RE_JSON_STR = /"(?:[^"\\\n]|\\.)*"?/y;
    var RE_JSON_NUM = /-?\d+\.?\d*(?:[eE][+-]?\d+)?/y;
    var RE_JSON_LIT = /(?:true|false|null)\b/y;
    function lexJSON(s, out) {
        var i = 0, n = s.length, m, j;
        while (i < n) {
            if ((m = eat(RE_WS, s, i))) { out.add('plain', m); i += m.length; continue; }
            if ((m = eat(RE_JSON_STR, s, i))) {
                j = i + m.length;
                while (j < n && /\s/.test(s.charAt(j))) j++;
                out.add(s.charAt(j) === ':' ? 'variable' : 'string', m);
                i += m.length;
                continue;
            }
            if ((m = eat(RE_JSON_NUM, s, i))) { out.add('number', m); i += m.length; continue; }
            if ((m = eat(RE_JSON_LIT, s, i))) { out.add('keyword', m); i += m.length; continue; }
            out.add('plain', s.charAt(i));
            i++;
        }
    }

    /* ---- CSS ---- */
    var RE_CSS_LOOK = /[^{};]*([{};])/y;
    var RE_AT = /@[\w-]+/y;
    var RE_CSS_IDENT = /-{0,2}[A-Za-z_][\w-]*/y;
    var RE_CSS_NUM = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?[A-Za-z%]*/y;
    var RE_CSS_HEX = /#[0-9A-Fa-f]{3,8}\b/y;
    var RE_CSS_WORD = /[\w-]+/y;
    var RE_CSS_SEL = /(?:[.#]|::?)?[\w-]+|\*/y;
    var RE_IMPORTANT = /!\s*important/y;
    var AT_CONTROL = set('and or not only');
    var AT_MEDIA = set('screen print all speech');

    function lexCSS(s, out) {
        var i = 0, n = s.length, m, c, state = 'stmt', j;
        while (i < n) {
            if ((m = eat(RE_WS, s, i))) { out.add('plain', m); i += m.length; continue; }
            if ((m = eat(RE_BLOCK, s, i))) { out.add('comment', m); i += m.length; continue; }
            c = s.charAt(i);

            if (state === 'stmt') {
                if (c === '}') { out.add('plain', c); i++; continue; }
                if (c === '@' && (m = eat(RE_AT, s, i))) { out.add('control', m); i += m.length; state = 'at'; continue; }
                m = eatM(RE_CSS_LOOK, s, i);
                state = (m && m[1] === '{') ? 'selector' : 'prop';
                continue;
            }

            if (state === 'at') {
                if (c === '{' || c === ';') { out.add('plain', c); i++; state = 'stmt'; continue; }
                if ((m = eat(RE_DQ, s, i) || eat(RE_SQ, s, i))) { out.add('string', m); i += m.length; continue; }
                if (/[\d.]/.test(c) && (m = eat(RE_CSS_NUM, s, i))) { out.add('number', m); i += m.length; continue; }
                if ((m = eat(RE_CSS_WORD, s, i))) {
                    j = i + m.length;
                    while (j < n && /\s/.test(s.charAt(j))) j++;
                    out.add(s.charAt(j) === ':' ? 'variable' : AT_CONTROL[m] ? 'control' : AT_MEDIA[m] ? 'string' : 'plain', m);
                    i += m.length;
                    continue;
                }
                out.add('plain', c); i++;
                continue;
            }

            if (state === 'selector') {
                if (c === '{') { out.add('plain', c); i++; state = 'stmt'; continue; }
                if ((m = eat(RE_DQ, s, i) || eat(RE_SQ, s, i))) { out.add('string', m); i += m.length; continue; }
                if ((m = eat(RE_CSS_SEL, s, i))) { out.add('selector', m); i += m.length; continue; }
                out.add('plain', c); i++;
                continue;
            }

            if (state === 'prop') {
                if (c === '}') { out.add('plain', c); i++; state = 'stmt'; continue; }
                if ((m = eat(RE_CSS_IDENT, s, i))) {
                    out.add('variable', m); i += m.length;
                    j = i;
                    while (j < n && /\s/.test(s.charAt(j))) j++;
                    if (s.charAt(j) === ':') { out.add('plain', s.slice(i, j + 1)); i = j + 1; }
                    state = 'value';
                    continue;
                }
                out.add('plain', c); i++;
                continue;
            }

            /* value */
            if (c === ';') { out.add('plain', c); i++; state = 'stmt'; continue; }
            if (c === '}') { out.add('plain', c); i++; state = 'stmt'; continue; }
            if ((m = eat(RE_DQ, s, i) || eat(RE_SQ, s, i))) { out.add('string', m); i += m.length; continue; }
            if ((m = eat(RE_CSS_HEX, s, i))) { out.add('number', m); i += m.length; continue; }
            if ((m = eat(RE_IMPORTANT, s, i))) { out.add('keyword', m); i += m.length; continue; }
            if ((m = eat(RE_CSS_IDENT, s, i))) {
                out.add(s.charAt(i + m.length) === '(' ? 'function' : (m.indexOf('--') === 0 ? 'variable' : 'string'), m);
                i += m.length;
                continue;
            }
            if ((m = eat(RE_CSS_NUM, s, i))) { out.add('number', m); i += m.length; continue; }
            out.add('plain', c); i++;
        }
    }

    /* ---- HTML (with embedded <script> and <style>) ---- */
    var RE_TAG = /<\/?[A-Za-z][\w:-]*/y;
    var RE_DOCTYPE = /<!([A-Za-z]+)([^>]*)(>?)/y;
    var RE_ATTR = /[^\s=\/>"'<]+/y;
    var RE_ATTR_VALUE = /"[^"]*"?|'[^']*'?|[^\s>"']+/y;
    function addText(out, text) {
        text.split(/(&#?\w+;)/).forEach(function (part, k) { out.add(k % 2 ? 'keyword' : 'plain', part); });
    }
    function lexHTML(s, out) {
        var i = 0, n = s.length, m, k, low = null;
        while (i < n) {
            if (s.charAt(i) !== '<') {
                k = s.indexOf('<', i);
                if (k < 0) k = n;
                addText(out, s.slice(i, k));
                i = k;
                continue;
            }
            if (s.substr(i, 4) === '<!--') {
                k = s.indexOf('-->', i + 4);
                k = k < 0 ? n : k + 3;
                out.add('comment', s.slice(i, k));
                i = k;
                continue;
            }
            if ((m = eatM(RE_DOCTYPE, s, i))) {
                out.add('tagpunct', '<!'); out.add('keyword', m[1]); out.add('variable', m[2]); out.add('tagpunct', m[3]);
                i += m[0].length;
                continue;
            }
            if ((m = eat(RE_TAG, s, i))) {
                var closing = m.charAt(1) === '/', name = m.replace(/^<\/?/, '').toLowerCase(), selfClose = false;
                out.add('tagpunct', closing ? '</' : '<');
                out.add('keyword', m.replace(/^<\/?/, ''));
                i += m.length;
                while (i < n) {
                    var a;
                    if ((a = eat(RE_WS, s, i))) { out.add('plain', a); i += a.length; continue; }
                    if (s.charAt(i) === '>') { out.add('tagpunct', '>'); i++; break; }
                    if (s.substr(i, 2) === '/>') { out.add('tagpunct', '/>'); i += 2; selfClose = true; break; }
                    if (s.charAt(i) === '<') break;
                    if ((a = eat(RE_ATTR, s, i))) { out.add('variable', a); i += a.length; continue; }
                    if (s.charAt(i) === '=') {
                        out.add('plain', '='); i++;
                        if ((a = eat(RE_ATTR_VALUE, s, i))) { out.add('string', a); i += a.length; }
                        continue;
                    }
                    out.add('plain', s.charAt(i)); i++;
                }
                if (!closing && !selfClose && (name === 'script' || name === 'style')) {
                    if (low === null) low = s.toLowerCase();
                    k = low.indexOf('</' + name, i);
                    if (k < 0) k = n;
                    if (name === 'script') lexCode(s.slice(i, k), out, JS_OPTS); else lexCSS(s.slice(i, k), out);
                    i = k;
                }
                continue;
            }
            out.add('plain', '<');
            i++;
        }
    }

    /* ---- PHP: <?php ... ?> blocks, HTML outside them ---- */
    function lexPHP(s, out) {
        var i = 0, n = s.length, open, close, m;
        if (!/<\?(?:php|=)/.test(s)) { lexCode(s, out, PHP_OPTS); return; }
        while (i < n) {
            open = /<\?(?:php|=)?/g;
            open.lastIndex = i;
            m = open.exec(s);
            if (!m) { lexHTML(s.slice(i), out); return; }
            lexHTML(s.slice(i, m.index), out);
            out.add('keyword', m[0]);
            i = m.index + m[0].length;
            close = s.indexOf('?>', i);
            if (close < 0) { lexCode(s.slice(i), out, PHP_OPTS); return; }
            lexCode(s.slice(i, close), out, PHP_OPTS);
            out.add('keyword', '?>');
            i = close + 2;
        }
    }

    /* ---- Language detection (used only when data-docs-lang is absent) ---- */
    function detect(src) {
        var t = String(src).replace(/^\s+/, '');
        if (!t) return 'plain';
        if (/<\?(?:php|=)/.test(t)) return 'php';
        if (/^<(?:!|\/?[A-Za-z])/.test(t)) return 'html';
        if (/^[\[{]/.test(t)) {
            try { JSON.parse(t); return 'json'; } catch (e) { /* not JSON */ }
        }
        var jsLike = /(?:^|[\s;(])(?:var|let|const)\s+[A-Za-z_$][\w$]*\s*(?:=|;)|\bfunction\b\s*[\w$]*\s*\(|=>|\b(?:document|window|console|BUI)\.|\b(?:if|for|while)\s*\(/m.test(t);
        var cssLike = /^(?:\/\*[\s\S]*?\*\/\s*)*(?:@[\w-]+[^{;]*|[^{};@]+)\{[\s\S]*\}/.test(t);
        if (jsLike) return 'js';
        if (cssLike) return 'css';
        return 'plain';
    }

    var ALIASES = { javascript: 'js', mjs: 'js', htm: 'html', markup: 'html', text: 'plain', txt: 'plain', none: 'plain' };

    function tokenize(src, lang) {
        var out = new Out();
        lang = ALIASES[lang] || lang;
        if (lang === 'html') lexHTML(src, out);
        else if (lang === 'css') lexCSS(src, out);
        else if (lang === 'js') lexCode(src, out, JS_OPTS);
        else if (lang === 'json') lexJSON(src, out);
        else if (lang === 'php') lexPHP(src, out);
        else out.add('plain', src);
        return out.list;
    }

    function highlight(code, lang) {
        var src = code.textContent;
        var chosen = lang || code.getAttribute('data-docs-lang') ||
            (code.parentNode && code.parentNode.getAttribute && code.parentNode.getAttribute('data-docs-lang')) ||
            (code.closest && code.closest('[data-docs-lang]') && code.closest('[data-docs-lang]').getAttribute('data-docs-lang')) ||
            detect(src);
        chosen = ALIASES[chosen] || chosen;
        if (chosen === 'plain') return '';
        var tokens = tokenize(src, chosen);
        var joined = tokens.map(function (t) { return t[1]; }).join('');
        if (joined !== src) {
            /* Safety net: a tokenizer bug must never alter the code the user copies */
            if (window.console) console.warn('[BUI docs] Code block left unhighlighted: tokenizer changed the text (' + chosen + ')');
            return '';
        }
        var frag = document.createDocumentFragment();
        tokens.forEach(function (t) {
            if (t[0] === 'plain') { frag.appendChild(document.createTextNode(t[1])); return; }
            var span = document.createElement('span');
            span.className = 'bui-docs-tok-' + t[0];
            span.textContent = t[1];
            frag.appendChild(span);
        });
        code.textContent = '';
        code.appendChild(frag);
        code.setAttribute('data-docs-highlighted', chosen);
        return chosen;
    }

    function enhance(root) {
        var list = (root || document).querySelectorAll('.bui-docs-code pre code:not([data-docs-highlighted])');
        Array.prototype.forEach.call(list, function (code) {
            try { highlight(code); } catch (e) {
                if (window.console) console.warn('[BUI docs] Code block left unhighlighted:', e);
            }
        });
    }

    window.BUI_DOCS_CODE = { detect: detect, tokenize: tokenize, highlight: highlight, enhance: enhance };
})();

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
    /* Brand files: documentation/assets/images/brand/baset-ui-{mark|logo}-{light|dark}.svg */
    var brandPath = siteRoot + 'documentation/assets/images/brand/baset-ui-';

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
    }

    /* ---- Brand logo (navbar mark, footer full logo) ----
       Two <img> per slot (light and dark file). CSS shows the one matching data-bui-mode,
       the hidden one is display:none so screen readers only get one "Baset-UI". */
    function logoPair(kind, width, height) {
        var frag = document.createDocumentFragment();
        ['light', 'dark'].forEach(function (mode) {
            var img = el('img', 'bui-docs-logo bui-docs-logo--' + kind + ' bui-docs-logo--' + mode);
            img.src = brandPath + kind + '-' + mode + '.svg';
            img.alt = 'Baset-UI';
            img.width = width;
            img.height = height;
            frag.appendChild(img);
        });
        return frag;
    }
    var navBrand = document.querySelector('.bui-docs-navbar__brand');
    if (navBrand) {
        navBrand.textContent = '';
        navBrand.appendChild(logoPair('mark', 280, 300));
    }
    var footer = document.querySelector('.bui-docs-footer');
    if (footer) {
        var footBrand = el('a', 'bui-docs-footer__brand');
        footBrand.setAttribute('href', siteRoot || './');
        footBrand.appendChild(logoPair('logo', 1200, 300));
        footer.insertBefore(footBrand, footer.firstChild);
    }

    /* Favicon follows the docs mode (the mark files are mid-tone, readable on any tab color) */
    var favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';
        document.head.appendChild(favicon);
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

    /* ---- Code blocks: color every .bui-docs-code block (component above) ---- */
    window.BUI_DOCS_CODE.enhance(document);

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
        favicon.setAttribute('href', brandPath + 'mark-' + (dark ? 'dark' : 'light') + '.svg');
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
