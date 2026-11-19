/*
 * Documentation Playground framework ONLY (Task 08). Not part of the BUI library API.
 *
 * A component page defines a SCHEMA (a plain JS object) and this file builds everything else:
 * the option controls, a live preview, the code output with Copy, the Reset buttons, the Light/Dark
 * and RTL/LTR switches for the preview container, and the responsive width controls.
 * The options themselves belong to each component. This file has no knowledge of any component.
 *
 * Contract and schema reference: instructions/CUSTOMIZATION_AND_PLAYGROUND.md
 *
 * USAGE (in a docs page, after docs.js)
 *   <div data-docs-playground="my-widget"></div>
 *   <script src="../../documentation/assets/js/playground.js"></script>
 *   <script>BUI_DOCS_PLAYGROUND.define('my-widget', { controls: [...], template: function (state, h) {...} });</script>
 *
 * Decisions (reasons in CUSTOMIZATION_AND_PLAYGROUND.md):
 *   - Light/Dark and RTL/LTR are set ONLY on the preview container (data-bui-mode, data-bui-theme and dir),
 *     never on <html>. The container also mirrors the page theme, because a theme's Dark block needs
 *     data-bui-theme and data-bui-mode on the same element (RTL_LTR_AND_THEMES.md).
 *   - The preview is a container, not an iframe: its width changes, but CSS media queries still follow the
 *     browser viewport. This is a known limit and it is documented.
 *   - Controls are native HTML elements styled with bui-docs-* classes (Form Controls are not built yet).
 *   - No external libraries. Highlighting and Copy come from docs.js (window.BUI_DOCS_HELPERS).
 */
(function () {
    'use strict';

    var doc = document;
    var root = doc.documentElement;
    var PREFIX = '[BUI docs playground]';
    var CLS = 'bui-docs-playground';

    /* Smallest width tested by RESPONSIVE_DESIGN.md. The other widths come from the --bui-bp-* tokens. */
    var BASE_WIDTH = 320;
    var BP_NAMES = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'];
    var KEY_STEP = 10;
    var KEY_STEP_LARGE = 50;
    var CODE_ANNOUNCE_DELAY = 700;

    var CONTROL_TYPES = ['select', 'radio-group', 'checkbox', 'switch', 'range', 'text', 'number', 'color'];
    var NAME_RE = /^[A-Za-z_][\w-]*$/;
    var HEX_RE = /^#[0-9a-f]{6}$/i;
    var ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

    var uid = 0;
    var mounted = new WeakMap();

    function warn(msg) { if (window.console) console.warn(PREFIX + ' ' + msg); }
    function fail(msg) { if (window.console) console.error(PREFIX + ' ' + msg); }

    function el(tag, cls, text) {
        var n = doc.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined && text !== null) n.textContent = text;
        return n;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (c) { return ENTITIES[c]; });
    }

    /* Removes the common indentation and the blank edges, so a template written inside source code shows tidy code. */
    function dedent(text) {
        var lines = String(text).replace(/\r\n?/g, '\n').replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
        var min = Infinity;
        lines.forEach(function (l) {
            if (!l.trim()) return;
            var indent = l.match(/^[ \t]*/)[0].length;
            if (indent < min) min = indent;
        });
        if (!isFinite(min) || min === 0) return lines.join('\n');
        return lines.map(function (l) { return l.slice(min); }).join('\n');
    }

    function decimals(n) {
        var s = String(n);
        var dot = s.indexOf('.');
        return dot === -1 ? 0 : s.length - dot - 1;
    }

    /* ------------------------------------------------------------------ */
    /* Schema validation                                                   */
    /* ------------------------------------------------------------------ */

    function isNum(v) { return typeof v === 'number' && isFinite(v); }

    function normalizeOptions(raw, where) {
        if (!Array.isArray(raw) || !raw.length) {
            fail(where + ': "options" must be a non-empty array.');
            return null;
        }
        var out = [];
        var seen = {};
        for (var i = 0; i < raw.length; i++) {
            var o = raw[i];
            var value;
            var label;
            if (typeof o === 'string' || isNum(o)) {
                value = String(o);
                label = value;
            } else if (o && typeof o === 'object' && (typeof o.value === 'string' || isNum(o.value))) {
                value = String(o.value);
                label = typeof o.label === 'string' && o.label ? o.label : value;
            } else {
                fail(where + ': options[' + i + '] must be a string or { value, label }.');
                return null;
            }
            if (seen[value]) {
                fail(where + ': duplicate option value "' + value + '".');
                return null;
            }
            seen[value] = true;
            out.push({ value: value, label: label });
        }
        return out;
    }

    function normalizeControl(raw, index, seenNames) {
        var where = 'controls[' + index + ']';
        if (!raw || typeof raw !== 'object') { fail(where + ' must be an object.'); return null; }
        if (CONTROL_TYPES.indexOf(raw.type) === -1) {
            fail(where + ': unknown type "' + raw.type + '". Use one of: ' + CONTROL_TYPES.join(', ') + '.');
            return null;
        }
        if (typeof raw.name !== 'string' || !NAME_RE.test(raw.name)) {
            fail(where + ': "name" must be a string that starts with a letter or "_" (letters, digits, "_" and "-" only).');
            return null;
        }
        if (seenNames[raw.name]) { fail(where + ': duplicate name "' + raw.name + '".'); return null; }
        if (typeof raw.label !== 'string' || !raw.label.trim()) {
            fail(where + ' ("' + raw.name + '"): "label" is required, every control needs a visible label.');
            return null;
        }
        where += ' ("' + raw.name + '")';

        var c = { type: raw.type, name: raw.name, label: raw.label };
        var hasDefault = raw.default !== undefined;

        switch (c.type) {
            case 'select':
            case 'radio-group':
                c.options = normalizeOptions(raw.options, where);
                if (!c.options) return null;
                c.values = c.options.map(function (o) { return o.value; });
                c.defaultValue = c.values[0];
                if (hasDefault) {
                    if (c.values.indexOf(String(raw.default)) > -1) c.defaultValue = String(raw.default);
                    else warn(where + ': default "' + raw.default + '" is not one of the options. Using the first option.');
                }
                break;

            case 'checkbox':
            case 'switch':
                c.defaultValue = false;
                if (hasDefault) {
                    if (typeof raw.default === 'boolean') c.defaultValue = raw.default;
                    else warn(where + ': default must be true or false. Using false.');
                }
                break;

            case 'range':
                if (!isNum(raw.min) || !isNum(raw.max) || raw.min >= raw.max) {
                    fail(where + ': "min" and "max" are required numbers and min must be lower than max.');
                    return null;
                }
                c.min = raw.min;
                c.max = raw.max;
                c.step = isNum(raw.step) && raw.step > 0 ? raw.step : 1;
                c.unit = typeof raw.unit === 'string' ? raw.unit : '';
                c.defaultValue = c.min;
                if (hasDefault) {
                    if (isNum(raw.default) && raw.default >= c.min && raw.default <= c.max) c.defaultValue = raw.default;
                    else warn(where + ': default is not a number inside min and max. Using min.');
                }
                break;

            case 'number':
                c.min = isNum(raw.min) ? raw.min : undefined;
                c.max = isNum(raw.max) ? raw.max : undefined;
                if (c.min !== undefined && c.max !== undefined && c.min > c.max) {
                    fail(where + ': min must not be greater than max.');
                    return null;
                }
                c.step = isNum(raw.step) && raw.step > 0 ? raw.step : 1;
                c.defaultValue = c.min !== undefined ? c.min : 0;
                if (hasDefault) {
                    if (isNum(raw.default) && (c.min === undefined || raw.default >= c.min) && (c.max === undefined || raw.default <= c.max)) {
                        c.defaultValue = raw.default;
                    } else {
                        warn(where + ': default is not a number inside min and max. Using ' + c.defaultValue + '.');
                    }
                }
                break;

            case 'text':
                c.maxLength = isNum(raw.maxLength) && raw.maxLength > 0 ? Math.floor(raw.maxLength) : undefined;
                c.placeholder = typeof raw.placeholder === 'string' ? raw.placeholder : '';
                c.defaultValue = '';
                if (hasDefault) {
                    if (typeof raw.default === 'string') c.defaultValue = c.maxLength ? raw.default.slice(0, c.maxLength) : raw.default;
                    else warn(where + ': default must be a string. Using an empty string.');
                }
                break;

            case 'color':
                c.defaultValue = '#000000';
                if (hasDefault) {
                    if (typeof raw.default === 'string' && HEX_RE.test(raw.default)) c.defaultValue = raw.default.toLowerCase();
                    else warn(where + ': default must be a color like "#0b5fff" (6 hex digits). Using #000000.');
                }
                break;
        }
        seenNames[c.name] = true;
        return c;
    }

    function normalizeSchema(schema) {
        if (!schema || typeof schema !== 'object') { fail('The schema must be an object.'); return null; }
        if (typeof schema.template !== 'function') { fail('The schema needs a "template" function: template(state, helpers) returns HTML or { html, js }.'); return null; }
        var rawControls = schema.controls === undefined ? [] : schema.controls;
        if (!Array.isArray(rawControls)) { fail('"controls" must be an array.'); return null; }
        var seen = {};
        var controls = [];
        rawControls.forEach(function (raw, i) {
            var c = normalizeControl(raw, i, seen);
            if (c) controls.push(c);
        });
        return {
            title: typeof schema.title === 'string' && schema.title ? schema.title : 'Playground',
            controls: controls,
            template: schema.template,
            beforeRender: typeof schema.beforeRender === 'function' ? schema.beforeRender : null,
            afterRender: typeof schema.afterRender === 'function' ? schema.afterRender : null
        };
    }

    /* Returns a valid value for the control, or undefined when raw is not acceptable. */
    function coerce(c, raw) {
        switch (c.type) {
            case 'select':
            case 'radio-group':
                if (typeof raw !== 'string' && !isNum(raw)) return undefined;
                return c.values.indexOf(String(raw)) > -1 ? String(raw) : undefined;
            case 'checkbox':
            case 'switch':
                return typeof raw === 'boolean' ? raw : undefined;
            case 'range':
            case 'number':
                if (raw === '' || raw === null || raw === undefined || typeof raw === 'boolean') return undefined;
                var n = Number(raw);
                if (!isFinite(n)) return undefined;
                if (c.min !== undefined && n < c.min) n = c.min;
                if (c.max !== undefined && n > c.max) n = c.max;
                if (c.type === 'range') {
                    n = c.min + Math.round((n - c.min) / c.step) * c.step;
                    n = Number(n.toFixed(Math.max(decimals(c.step), decimals(c.min))));
                    if (n > c.max) n = c.max;
                }
                return n;
            case 'text':
                if (typeof raw !== 'string' && !isNum(raw)) return undefined;
                var t = String(raw);
                return c.maxLength && t.length > c.maxLength ? t.slice(0, c.maxLength) : t;
            case 'color':
                return typeof raw === 'string' && HEX_RE.test(raw) ? raw.toLowerCase() : undefined;
        }
        return undefined;
    }

    /* Text used in the screen reader message after a change. */
    function valueText(c, value) {
        if (c.type === 'select' || c.type === 'radio-group') {
            for (var i = 0; i < c.options.length; i++) if (c.options[i].value === value) return c.options[i].label;
        }
        if (c.type === 'checkbox' || c.type === 'switch') return value ? 'on' : 'off';
        if (c.type === 'range') return value + (c.unit ? ' ' + c.unit : '');
        var s = String(value);
        return s.length > 40 ? s.slice(0, 40) + '...' : (s === '' ? 'empty' : s);
    }

    /* ------------------------------------------------------------------ */
    /* Control builders (native HTML elements, bui-docs-* classes)         */
    /* Each returns { el, set(value) } and marks its inputs with data-pg-name. */
    /* ------------------------------------------------------------------ */

    function field(extra) { return el('div', CLS + '__field' + (extra ? ' ' + extra : '')); }

    function buildSelect(c, id) {
        var wrap = field();
        var label = el('label', CLS + '__label', c.label);
        label.htmlFor = id;
        var select = el('select', 'bui-docs-select');
        select.id = id;
        select.setAttribute('data-pg-name', c.name);
        c.options.forEach(function (o) {
            var opt = el('option', '', o.label);
            opt.value = o.value;
            select.appendChild(opt);
        });
        wrap.appendChild(label);
        wrap.appendChild(select);
        return { el: wrap, set: function (v) { select.value = v; } };
    }

    function buildRadioGroup(c, id) {
        var wrap = el('fieldset', CLS + '__field ' + CLS + '__group');
        wrap.appendChild(el('legend', CLS + '__label', c.label));
        var list = el('div', CLS + '__choices');
        var inputs = [];
        c.options.forEach(function (o, i) {
            var label = el('label', CLS + '__choice');
            var input = el('input');
            input.type = 'radio';
            input.name = id;
            input.value = o.value;
            input.id = id + '-' + i;
            input.setAttribute('data-pg-name', c.name);
            label.appendChild(input);
            label.appendChild(el('span', '', o.label));
            list.appendChild(label);
            inputs.push(input);
        });
        wrap.appendChild(list);
        return { el: wrap, set: function (v) { inputs.forEach(function (i) { i.checked = i.value === v; }); } };
    }

    function buildCheck(c, id) {
        var wrap = field();
        var label = el('label', CLS + '__check');
        var input = el('input', c.type === 'switch' ? CLS + '__switch' : '');
        input.type = 'checkbox';
        input.id = id;
        input.setAttribute('data-pg-name', c.name);
        if (c.type === 'switch') input.setAttribute('role', 'switch');
        label.appendChild(input);
        label.appendChild(el('span', '', c.label));
        wrap.appendChild(label);
        return { el: wrap, set: function (v) { input.checked = v; } };
    }

    function buildRange(c, id) {
        var wrap = field();
        var label = el('label', CLS + '__label', c.label);
        label.htmlFor = id;
        var row = el('div', CLS + '__row');
        var input = el('input', CLS + '__range');
        input.type = 'range';
        input.id = id;
        input.min = String(c.min);
        input.max = String(c.max);
        input.step = String(c.step);
        input.setAttribute('data-pg-name', c.name);
        /* The input announces its own value. The output is visual only, so it must not be a second live region. */
        var out = el('output', CLS + '__output');
        out.htmlFor = id;
        out.setAttribute('aria-live', 'off');
        row.appendChild(input);
        row.appendChild(out);
        wrap.appendChild(label);
        wrap.appendChild(row);
        return {
            el: wrap,
            set: function (v) {
                input.value = String(v);
                out.textContent = v + (c.unit ? ' ' + c.unit : '');
                input.setAttribute('aria-valuetext', out.textContent);
            }
        };
    }

    function buildText(c, id) {
        var wrap = field();
        var label = el('label', CLS + '__label', c.label);
        label.htmlFor = id;
        var input = el('input', 'bui-docs-input');
        input.type = 'text';
        input.id = id;
        input.autocomplete = 'off';
        input.spellcheck = false;
        if (c.maxLength) input.maxLength = c.maxLength;
        if (c.placeholder) input.placeholder = c.placeholder;
        input.setAttribute('data-pg-name', c.name);
        wrap.appendChild(label);
        wrap.appendChild(input);
        return { el: wrap, set: function (v) { input.value = v; } };
    }

    function buildNumber(c, id) {
        var wrap = field();
        var label = el('label', CLS + '__label', c.label);
        label.htmlFor = id;
        var input = el('input', 'bui-docs-input');
        input.type = 'number';
        input.id = id;
        input.step = String(c.step);
        if (c.min !== undefined) input.min = String(c.min);
        if (c.max !== undefined) input.max = String(c.max);
        input.setAttribute('data-pg-name', c.name);
        wrap.appendChild(label);
        wrap.appendChild(input);
        if (c.min !== undefined || c.max !== undefined) {
            var hint = el('span', CLS + '__hint', c.min !== undefined && c.max !== undefined
                ? 'Allowed: ' + c.min + ' to ' + c.max
                : (c.min !== undefined ? 'Minimum: ' + c.min : 'Maximum: ' + c.max));
            hint.id = id + '-hint';
            input.setAttribute('aria-describedby', hint.id);
            wrap.appendChild(hint);
        }
        return { el: wrap, set: function (v) { input.value = String(v); input.removeAttribute('aria-invalid'); } };
    }

    function buildColor(c, id) {
        var wrap = field();
        var label = el('label', CLS + '__label', c.label);
        label.htmlFor = id;
        var row = el('div', CLS + '__row');
        var input = el('input', CLS + '__color');
        input.type = 'color';
        input.id = id;
        input.setAttribute('data-pg-name', c.name);
        var out = el('output', CLS + '__output');
        out.htmlFor = id;
        out.setAttribute('aria-live', 'off');
        row.appendChild(input);
        row.appendChild(out);
        wrap.appendChild(label);
        wrap.appendChild(row);
        return { el: wrap, set: function (v) { input.value = v; out.textContent = v; } };
    }

    var BUILDERS = {
        'select': buildSelect,
        'radio-group': buildRadioGroup,
        'checkbox': buildCheck,
        'switch': buildCheck,
        'range': buildRange,
        'text': buildText,
        'number': buildNumber,
        'color': buildColor
    };

    /* ------------------------------------------------------------------ */
    /* Instance                                                            */
    /* ------------------------------------------------------------------ */

    function create(target, schema) {
        var helpers = window.BUI_DOCS_HELPERS || {};
        if (!helpers.highlight || !helpers.copyText) warn('docs.js helpers are missing: load docs.js before playground.js. Code is shown without highlighting.');

        var id = 'bui-docs-pg-' + (++uid);
        var destroyed = false;
        var controls = schema.controls;
        var byName = {};
        var ui = {};
        var state = {};
        var rendered = false;

        controls.forEach(function (c) { byName[c.name] = c; state[c.name] = c.defaultValue; });

        /* ---- Page-level facts the preview starts from ---- */
        function pageMode() { return root.getAttribute('data-bui-mode') === 'dark' ? 'dark' : 'light'; }
        function pageDir() { return root.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr'; }
        function pageTheme() { return root.getAttribute('data-bui-theme') || 'default'; }

        var preview = { mode: pageMode(), dir: pageDir(), width: null };

        /* ---- Skeleton ---- */
        var box = el('div', CLS);
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', schema.title);

        function title(text) {
            /* role=heading, not <h3>: docs.js builds "On this page" from h2/h3 and the playground must not add entries. */
            var t = el('div', CLS + '__title', text);
            t.setAttribute('role', 'heading');
            t.setAttribute('aria-level', '3');
            return t;
        }

        /* Options */
        var optionsSection = el('div', CLS + '__section ' + CLS + '__options');
        var controlsEl = el('div', CLS + '__controls');
        var resetOptionsBtn = null;
        if (controls.length) {
            optionsSection.appendChild(title('Options'));
            controls.forEach(function (c) {
                var built = BUILDERS[c.type](c, id + '-' + c.name);
                ui[c.name] = built;
                controlsEl.appendChild(built.el);
            });
            optionsSection.appendChild(controlsEl);
            var optActions = el('div', CLS + '__actions');
            resetOptionsBtn = el('button', 'bui-docs-btn ' + CLS + '__btn', 'Reset options');
            resetOptionsBtn.type = 'button';
            optActions.appendChild(resetOptionsBtn);
            optionsSection.appendChild(optActions);
            box.appendChild(optionsSection);
        }

        /* Preview */
        var previewSection = el('div', CLS + '__section ' + CLS + '__preview');
        previewSection.appendChild(title('Preview'));

        var toolbar = el('div', CLS + '__toolbar');

        function segmented(legend, name, items) {
            var set = el('fieldset', CLS + '__seg-group');
            set.appendChild(el('legend', CLS + '__seg-legend', legend));
            var seg = el('div', CLS + '__seg');
            var inputs = items.map(function (item) {
                var label = el('label', CLS + '__seg-item');
                var input = el('input');
                input.type = 'radio';
                input.name = id + '-' + name;
                input.value = item.value;
                input.setAttribute('data-pg-preview', name);
                label.appendChild(input);
                label.appendChild(el('span', '', item.label));
                seg.appendChild(label);
                return input;
            });
            set.appendChild(seg);
            toolbar.appendChild(set);
            return inputs;
        }

        var modeInputs = segmented('Mode', 'mode', [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]);
        var dirInputs = segmented('Direction', 'dir', [{ value: 'ltr', label: 'LTR' }, { value: 'rtl', label: 'RTL' }]);

        /* Width buttons: Full, Base, then the --bui-bp-* tokens (the unified breakpoints). */
        var widths = [{ key: 'full', label: 'Full', width: null }, { key: 'base', label: 'Base ' + BASE_WIDTH, width: BASE_WIDTH }];
        BP_NAMES.forEach(function (n) {
            var px = parseInt(window.getComputedStyle(root).getPropertyValue('--bui-bp-' + n), 10);
            if (px > 0) widths.push({ key: n, label: n.toUpperCase() + ' ' + px, width: px });
            else warn('Token --bui-bp-' + n + ' is missing: its width button is skipped. Load assets/css/baset-ui.css.');
        });
        var widthSet = el('fieldset', CLS + '__seg-group');
        widthSet.appendChild(el('legend', CLS + '__seg-legend', 'Preview width'));
        var widthBtns = el('div', CLS + '__widths');
        var widthButtons = widths.map(function (w) {
            var b = el('button', 'bui-docs-btn ' + CLS + '__btn', w.label);
            b.type = 'button';
            b.setAttribute('aria-pressed', 'false');
            b.setAttribute('data-pg-width', w.key);
            widthBtns.appendChild(b);
            return b;
        });
        widthSet.appendChild(widthBtns);
        toolbar.appendChild(widthSet);

        var resetPreviewBtn = el('button', 'bui-docs-btn ' + CLS + '__btn ' + CLS + '__reset-preview', 'Reset preview');
        resetPreviewBtn.type = 'button';
        toolbar.appendChild(resetPreviewBtn);
        previewSection.appendChild(toolbar);

        /* stage scrolls sideways when the container is wider than the page column; track keeps room for the handle. */
        var stage = el('div', CLS + '__stage');
        var track = el('div', CLS + '__track');
        var sizer = el('div', CLS + '__sizer');
        var frame = el('div', CLS + '__frame');
        frame.setAttribute('role', 'group');
        frame.setAttribute('aria-label', 'Preview');
        var handle = el('div', CLS + '__handle');
        handle.setAttribute('role', 'separator');
        handle.setAttribute('aria-orientation', 'vertical');
        handle.setAttribute('aria-label', 'Resize preview width');
        handle.tabIndex = 0;
        sizer.appendChild(frame);
        sizer.appendChild(handle);
        track.appendChild(sizer);
        stage.appendChild(track);
        previewSection.appendChild(stage);

        var readout = el('div', CLS + '__readout');
        previewSection.appendChild(readout);

        var errorEl = el('div', CLS + '__error');
        errorEl.setAttribute('role', 'alert');
        errorEl.hidden = true;
        previewSection.appendChild(errorEl);
        box.appendChild(previewSection);

        /* Code output */
        var codeSection = el('div', CLS + '__section ' + CLS + '__code');
        codeSection.appendChild(title('Code output'));
        function codeBlock(lang, label) {
            var block = el('div', 'bui-docs-codeblock');
            var bar = el('div', 'bui-docs-codeblock__bar');
            bar.appendChild(el('span', 'bui-docs-codeblock__lang', label));
            var btn = el('button', 'bui-docs-btn bui-docs-copy', 'Copy');
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Copy ' + label + ' code');
            bar.appendChild(btn);
            var pre = el('pre', 'bui-docs-code');
            pre.setAttribute('dir', 'ltr');
            pre.setAttribute('data-lang', lang);
            pre.setAttribute('data-docs-label', label + ' code');
            var code = el('code');
            pre.appendChild(code);
            block.appendChild(bar);
            block.appendChild(pre);
            codeSection.appendChild(block);
            return { block: block, code: code, button: btn, lang: lang, label: label, source: '', timer: null };
        }
        var htmlBlock = codeBlock('html', 'HTML');
        var jsBlock = codeBlock('javascript', 'JavaScript');
        jsBlock.block.hidden = true;
        box.appendChild(codeSection);

        /* Polite live region: short messages only, never the code itself. */
        var live = el('div', 'bui-docs-sr-only');
        live.setAttribute('role', 'status');
        live.setAttribute('aria-live', 'polite');
        box.appendChild(live);

        var liveTimer = null;
        var codeTimer = null;
        function announce(msg) {
            window.clearTimeout(liveTimer);
            live.textContent = '';
            liveTimer = window.setTimeout(function () { live.textContent = msg; }, 30);
        }
        function announceCodeLater(msg) {
            window.clearTimeout(codeTimer);
            codeTimer = window.setTimeout(function () { announce(msg); }, CODE_ANNOUNCE_DELAY);
        }

        /* ---- Code output ---- */
        function setCode(b, text) {
            b.source = dedent(text);
            b.code.textContent = '';
            if (helpers.highlight) b.code.appendChild(helpers.highlight(b.source, b.lang));
            else b.code.textContent = b.source;
        }

        function selectContents(node) {
            var sel = window.getSelection();
            if (!sel) return;
            var range = doc.createRange();
            range.selectNodeContents(node);
            sel.removeAllRanges();
            sel.addRange(range);
        }

        function copyText(text) {
            if (helpers.copyText) return helpers.copyText(text);
            if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
                return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
            }
            return Promise.resolve(false);
        }

        function wireCopy(b) {
            b.button.addEventListener('click', function () {
                copyText(b.source).then(function (ok) {
                    if (destroyed) return;
                    b.button.textContent = ok ? 'Copied' : 'Copy failed';
                    window.clearTimeout(codeTimer);
                    announce(ok ? b.label + ' code copied to clipboard' : 'Copy failed. The code is selected: press Ctrl+C or Command+C.');
                    if (!ok) selectContents(b.code);
                    window.clearTimeout(b.timer);
                    b.timer = window.setTimeout(function () { b.button.textContent = 'Copy'; }, 2000);
                });
            });
        }
        wireCopy(htmlBlock);
        wireCopy(jsBlock);

        /* ---- Render ---- */
        function callHook(fn, a, b) {
            if (!fn) return;
            try { fn(a, b); } catch (e) { fail('A schema hook threw: ' + (e && e.message ? e.message : e)); }
        }

        /* Overflowing regions become keyboard-focusable named regions (WCAG 2.1.1), like docs.js does for code and tables. */
        function updateScrollable() {
            if (frame.scrollWidth > frame.clientWidth + 1) {
                frame.tabIndex = 0;
                frame.setAttribute('aria-label', 'Preview, scrollable');
            } else {
                frame.removeAttribute('tabindex');
                frame.setAttribute('aria-label', 'Preview');
            }
            if (stage.scrollWidth > stage.clientWidth + 1) {
                stage.tabIndex = 0;
                stage.setAttribute('role', 'region');
                stage.setAttribute('aria-label', 'Preview area, scrollable sideways');
            } else {
                stage.removeAttribute('tabindex');
                stage.removeAttribute('role');
                stage.removeAttribute('aria-label');
            }
        }

        function render() {
            var out;
            try {
                out = schema.template(Object.assign({}, state), { escape: escapeHtml });
                if (typeof out === 'string') out = { html: out };
                if (!out || typeof out.html !== 'string') throw new Error('template() must return a string or { html: string, js?: string }.');
            } catch (e) {
                fail('template() failed: ' + (e && e.message ? e.message : e));
                errorEl.textContent = 'The preview could not be rendered: the template threw an error. See the console.';
                errorEl.hidden = false;
                return false;
            }
            errorEl.hidden = true;
            errorEl.textContent = '';
            if (rendered) callHook(schema.beforeRender, frame);
            frame.innerHTML = out.html;
            rendered = true;
            callHook(schema.afterRender, frame, Object.assign({}, state));
            setCode(htmlBlock, out.html);
            if (typeof out.js === 'string' && out.js.trim()) {
                setCode(jsBlock, out.js);
                jsBlock.block.hidden = false;
            } else {
                jsBlock.block.hidden = true;
                jsBlock.source = '';
                jsBlock.code.textContent = '';
            }
            updateScrollable();
            return true;
        }

        /* ---- Options ---- */
        function syncControls() {
            controls.forEach(function (c) { ui[c.name].set(state[c.name]); });
        }

        function setValue(name, value, fromInput) {
            var c = byName[name];
            state[name] = value;
            if (!fromInput) ui[name].set(value);
            else if (c.type === 'range' || c.type === 'color') ui[name].set(value); /* refresh the value readout only */
            if (render()) announceCodeLater('Code updated. ' + c.label + ': ' + valueText(c, value) + '.');
        }

        function onControlEvent(e) {
            var t = e.target;
            var name = t && t.getAttribute && t.getAttribute('data-pg-name');
            if (!name || !byName[name]) return;
            var c = byName[name];
            var raw;
            if (c.type === 'checkbox' || c.type === 'switch') raw = t.checked;
            else raw = t.value;

            if (c.type === 'number') {
                var n = t.value === '' ? NaN : Number(t.value);
                var inRange = isFinite(n) && (c.min === undefined || n >= c.min) && (c.max === undefined || n <= c.max);
                if (e.type === 'input' && !inRange) {
                    /* While typing, an empty or out-of-range number keeps the last valid state. */
                    t.setAttribute('aria-invalid', 'true');
                    return;
                }
                if (e.type === 'change' && !isFinite(n)) {
                    ui[name].set(state[name]);
                    return;
                }
                t.removeAttribute('aria-invalid');
                var v = coerce(c, n);
                if (v === undefined) return;
                var changed = v !== state[name];
                if (e.type === 'change') ui[name].set(v); /* normalizes the displayed value (clamp) */
                if (changed) setValue(name, v, true);
                return;
            }

            /* Radios, checkboxes, selects and ranges fire both input and change: the second one finds no difference and stops. */
            var value = coerce(c, raw);
            if (value === undefined || value === state[name]) return;
            setValue(name, value, true);
        }

        controlsEl.addEventListener('input', onControlEvent);
        controlsEl.addEventListener('change', onControlEvent);

        function resetOptions() {
            controls.forEach(function (c) { state[c.name] = c.defaultValue; });
            syncControls();
            render();
            window.clearTimeout(codeTimer);
            announce('Options reset to defaults. Code updated.');
        }
        if (resetOptionsBtn) resetOptionsBtn.addEventListener('click', resetOptions);

        /* ---- Preview container: mode, direction, theme ---- */
        function applyFrameAttrs() {
            frame.setAttribute('data-bui-mode', preview.mode);
            frame.setAttribute('dir', preview.dir);
            frame.setAttribute('data-bui-theme', pageTheme());
            modeInputs.forEach(function (i) { i.checked = i.value === preview.mode; });
            dirInputs.forEach(function (i) { i.checked = i.value === preview.dir; });
        }

        toolbar.addEventListener('change', function (e) {
            var t = e.target;
            var kind = t && t.getAttribute && t.getAttribute('data-pg-preview');
            if (!kind) return;
            if (kind === 'mode') {
                preview.mode = t.value === 'dark' ? 'dark' : 'light';
                announce('Preview mode: ' + (preview.mode === 'dark' ? 'Dark' : 'Light') + '.');
            } else if (kind === 'dir') {
                preview.dir = t.value === 'rtl' ? 'rtl' : 'ltr';
                announce('Preview direction: ' + preview.dir.toUpperCase() + '.');
            }
            applyFrameAttrs();
            updateScrollable();
        });

        /* The page theme can change: the container follows it so a theme's Dark block still applies. */
        function onThemeChange() { if (!destroyed) applyFrameAttrs(); }
        root.addEventListener('bui:theme:change', onThemeChange);

        /* ---- Preview container: width ---- */
        function stageRtl() { return window.getComputedStyle(stage).direction === 'rtl'; }

        function frameWidth() { return Math.round(frame.getBoundingClientRect().width); }

        /* Limits: from the smallest tested width up to the largest breakpoint token. The stage scrolls when the container is wider than the page. */
        function widthLimits() {
            var top = Math.max.apply(null, widths.map(function (w) { return w.width || 0; }));
            return { min: BASE_WIDTH, max: top };
        }

        function updateWidthState() {
            if (destroyed) return;
            var actual = frameWidth();
            var lim = widthLimits();
            handle.setAttribute('aria-valuemin', String(lim.min));
            handle.setAttribute('aria-valuemax', String(lim.max));
            handle.setAttribute('aria-valuenow', String(actual));
            handle.setAttribute('aria-valuetext', actual + ' pixels');
            readout.textContent = 'Preview width: ' + actual + 'px';
            widthButtons.forEach(function (b, i) {
                b.setAttribute('aria-pressed', String(widths[i].width === preview.width));
            });
            updateScrollable();
        }

        function setWidth(w) {
            preview.width = w;
            sizer.style.width = w ? w + 'px' : '';
            updateWidthState();
        }

        function clampWidth(w) {
            var lim = widthLimits();
            return Math.max(lim.min, Math.min(lim.max, Math.round(w)));
        }

        widthBtns.addEventListener('click', function (e) {
            var b = e.target.closest && e.target.closest('[data-pg-width]');
            if (!b || !widthBtns.contains(b)) return;
            var w = widths[widthButtons.indexOf(b)];
            setWidth(w.width);
            announce(w.width ? 'Preview width: ' + w.width + ' pixels.' : 'Preview width: full width.');
        });

        /* Drag (pointer events) and keyboard on the resize handle. */
        var drag = null;
        function endDrag(e) {
            if (!drag) return;
            drag = null;
            stage.classList.remove('is-dragging');
            if (e && e.pointerId !== undefined && handle.hasPointerCapture && handle.hasPointerCapture(e.pointerId)) {
                try { handle.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
            }
        }
        handle.addEventListener('pointerdown', function (e) {
            if (e.button !== 0) return;
            e.preventDefault();
            handle.focus();
            drag = { x: e.clientX, w: frameWidth(), rtl: stageRtl() };
            stage.classList.add('is-dragging');
            try { handle.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events have no active pointer */ }
        });
        handle.addEventListener('pointermove', function (e) {
            if (!drag) return;
            var dx = e.clientX - drag.x;
            if (drag.rtl) dx = -dx;
            setWidth(clampWidth(drag.w + dx));
        });
        handle.addEventListener('pointerup', endDrag);
        handle.addEventListener('pointercancel', endDrag);
        handle.addEventListener('lostpointercapture', endDrag);

        handle.addEventListener('keydown', function (e) {
            var key = e.key;
            var lim = widthLimits();
            var current = frameWidth();
            var next = null;
            var grow = stageRtl() ? 'ArrowLeft' : 'ArrowRight';
            var shrink = stageRtl() ? 'ArrowRight' : 'ArrowLeft';
            var step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
            if (key === grow) next = current + step;
            else if (key === shrink) next = current - step;
            else if (key === 'Home') next = lim.min;
            else if (key === 'End') next = lim.max;
            if (next === null) return;
            e.preventDefault();
            setWidth(clampWidth(next));
        });

        var observer = null;
        if (window.ResizeObserver) {
            observer = new ResizeObserver(updateWidthState);
            observer.observe(frame);
            observer.observe(stage);
        }
        window.addEventListener('resize', updateWidthState);

        /* ---- Reset preview: back to the page's mode and direction, full width ---- */
        resetPreviewBtn.addEventListener('click', function () {
            preview.mode = pageMode();
            preview.dir = pageDir();
            applyFrameAttrs();
            setWidth(null);
            announce('Preview reset: ' + (preview.mode === 'dark' ? 'Dark' : 'Light') + ', ' + preview.dir.toUpperCase() + ', full width.');
        });

        /* ---- Start ---- */
        target.textContent = '';
        target.appendChild(box);
        target.setAttribute('data-docs-playground-ready', '');
        syncControls();
        applyFrameAttrs();
        render();
        updateWidthState();

        /* ---- Public instance ---- */
        var instance = {
            element: box,
            getState: function () { return Object.assign({}, state); },
            setState: function (partial) {
                if (destroyed || !partial || typeof partial !== 'object') return;
                var touched = false;
                Object.keys(partial).forEach(function (name) {
                    var c = byName[name];
                    if (!c) { warn('setState: unknown option "' + name + '".'); return; }
                    var v = coerce(c, partial[name]);
                    if (v === undefined) { warn('setState: invalid value for "' + name + '".'); return; }
                    state[name] = v;
                    ui[name].set(v);
                    touched = true;
                });
                if (touched && render()) announceCodeLater('Code updated.');
            },
            reset: function () { if (!destroyed) resetOptions(); },
            resetPreview: function () { if (!destroyed) resetPreviewBtn.click(); },
            destroy: function () {
                if (destroyed) return;
                destroyed = true;
                window.clearTimeout(liveTimer);
                window.clearTimeout(codeTimer);
                window.clearTimeout(htmlBlock.timer);
                window.clearTimeout(jsBlock.timer);
                if (observer) observer.disconnect();
                window.removeEventListener('resize', updateWidthState);
                root.removeEventListener('bui:theme:change', onThemeChange);
                endDrag();
                if (rendered) callHook(schema.beforeRender, frame);
                target.textContent = '';
                target.removeAttribute('data-docs-playground-ready');
                mounted.delete(target);
            }
        };
        return instance;
    }

    /* ------------------------------------------------------------------ */
    /* Public API                                                          */
    /* ------------------------------------------------------------------ */

    function mount(target, schema) {
        if (!target || target.nodeType !== 1) { fail('mount(): the target must be an element.'); return null; }
        if (mounted.has(target)) { warn('mount(): this element already has a playground. Call destroy() first to replace it.'); return mounted.get(target); }
        var normalized = normalizeSchema(schema);
        if (!normalized) return null;
        var instance = create(target, normalized);
        mounted.set(target, instance);
        return instance;
    }

    /* Mounts the schema into every [data-docs-playground="name"] element. Returns the instances. */
    function define(name, schema) {
        var instances = [];
        if (typeof name !== 'string' || !name) { fail('define(): the first argument is the playground name (a string).'); return instances; }
        function run() {
            var found = 0;
            Array.prototype.forEach.call(doc.querySelectorAll('[data-docs-playground]'), function (node) {
                if (node.getAttribute('data-docs-playground') !== name) return;
                found += 1;
                var inst = mount(node, schema);
                if (inst) instances.push(inst);
            });
            if (!found) warn('define("' + name + '"): no element has data-docs-playground="' + name + '".');
        }
        if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', run);
        else run();
        return instances;
    }

    window.BUI_DOCS_PLAYGROUND = { define: define, mount: mount, escape: escapeHtml };
})();
