/*
 * Baset UI docs — live token values, measured contrast and scoped-override
 * demo (docs-only). Loaded by css-variables.html and accessibility.html.
 *
 * 1. Fills the "Light", "Dark" and "Value" cells of the token tables with the
 *    values the browser actually computes from assets/css/baset-ui.css, using
 *    hidden probe elements carrying .bui-light and .bui-dark.
 * 2. Fills the contrast tables (rows with data-fg / data-bg) with ratios
 *    computed from those same values using the WCAG 2.x formula.
 * 3. Powers the small sandbox that overrides tokens on one wrapper element
 *    only. It validates every value before applying it and never evaluates
 *    user input as code.
 */
(function () {
  var D = (window.BUIDocs = window.BUIDocs || {});
  var root = document.documentElement;
  var TOKEN_RE = /^--bui-[a-z0-9-]+$/;
  var HEX_RE = /^#[0-9a-fA-F]{6}$/;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }

  function makeProbe(cls) {
    var p = document.createElement('div');
    p.className = cls;
    p.style.display = 'none';
    p.setAttribute('aria-hidden', 'true');
    document.body.appendChild(p);
    return p;
  }

  function supports(prop, value) {
    return !!(window.CSS && CSS.supports && CSS.supports(prop, value));
  }

  function tokenValue(probe, name) {
    return getComputedStyle(probe).getPropertyValue(name).trim();
  }

  /* ------------------------------------------------------- Token tables */

  function fillCell(cell, kind, value) {
    cell.textContent = '';
    if (!value) { cell.appendChild(el('span', '', '—')); return; }
    if (kind === 'color' && supports('color', value)) {
      var sw = el('span', 'docs-swatch');
      sw.style.setProperty('--docs-swatch', value);
      sw.setAttribute('aria-hidden', 'true');
      cell.appendChild(sw);
    } else if (kind === 'space' && supports('width', value)) {
      var bar = el('span', 'docs-token-bar');
      bar.style.setProperty('inline-size', value);
      bar.setAttribute('aria-hidden', 'true');
      cell.appendChild(bar);
    } else if (kind === 'radius' && supports('border-radius', value)) {
      var box = el('span', 'docs-token-box');
      box.style.setProperty('border-radius', value);
      box.setAttribute('aria-hidden', 'true');
      cell.appendChild(box);
    } else if (kind === 'shadow' && supports('box-shadow', value)) {
      var sh = el('span', 'docs-token-box');
      sh.style.setProperty('box-shadow', value);
      sh.setAttribute('aria-hidden', 'true');
      cell.appendChild(sh);
    }
    cell.appendChild(el('code', 'docs-token-value', value));
  }

  function fillTables() {
    var light = makeProbe('bui-light');
    var dark = makeProbe('bui-dark');
    Array.prototype.forEach.call(document.querySelectorAll('tr[data-token]'), function (row) {
      var name = row.getAttribute('data-token');
      if (!TOKEN_RE.test(name)) { return; }
      var kind = row.getAttribute('data-kind') || 'other';
      var l = row.querySelector('[data-slot="light"]');
      var d = row.querySelector('[data-slot="dark"]');
      var v = row.querySelector('[data-slot="value"]');
      if (l) { fillCell(l, kind, tokenValue(light, name)); }
      if (d) { fillCell(d, kind, tokenValue(dark, name)); }
      if (v) { fillCell(v, kind, tokenValue(light, name)); }
    });
    document.body.removeChild(light);
    document.body.removeChild(dark);
  }

  /* ------------------------------------------------------------ Sandbox */

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function luminance(rgb) {
    var c = rgb.map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var la = luminance(hexToRgb(a));
    var lb = luminance(hexToRgb(b));
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  D.contrastRatio = contrast;

  function initSandbox() {
    var preview = document.getElementById('sbx-preview');
    var colorInput = document.getElementById('sbx-primary');
    var radiusSelect = document.getElementById('sbx-radius');
    var themeSelect = document.getElementById('sbx-theme');
    var resetBtn = document.getElementById('sbx-reset');
    var codeEl = document.querySelector('#sbx-code code');
    var result = document.getElementById('sbx-result');
    if (!preview || !colorInput || !radiusSelect || !themeSelect || !resetBtn) { return; }

    var RADII = ['0', '0.25rem', '0.5rem', '0.75rem', '1rem', '1.5rem'];
    var THEMES = ['page', 'light', 'dark'];
    var DEFAULT_RADIUS = '0.5rem';

    var probe = makeProbe('bui-light');
    var defaultPrimary = tokenValue(probe, '--bui-color-primary');
    document.body.removeChild(probe);
    if (!HEX_RE.test(defaultPrimary)) { defaultPrimary = '#0f766e'; }

    function message(ratio, ok) {
      var text = {
        en: 'Contrast between --bui-color-on-primary and your primary color: ' + ratio.toFixed(2) + ':1 — ' +
          (ok ? 'meets 4.5:1 for normal text.' : 'below 4.5:1 for normal text; also override --bui-color-on-primary.'),
        ar: 'التباين بين --bui-color-on-primary ولونك الأساسي: ' + ratio.toFixed(2) + ':1 — ' +
          (ok ? 'يحقق 4.5:1 للنص العادي.' : 'أقل من 4.5:1 للنص العادي؛ غيّر --bui-color-on-primary أيضًا.')
      };
      result.textContent = '';
      ['en', 'ar'].forEach(function (l) {
        var s = document.createElement('span');
        s.setAttribute('lang', l);
        s.textContent = text[l];
        result.appendChild(s);
      });
    }

    function apply() {
      var color = HEX_RE.test(colorInput.value) ? colorInput.value.toLowerCase() : defaultPrimary;
      var radius = RADII.indexOf(radiusSelect.value) !== -1 ? radiusSelect.value : DEFAULT_RADIUS;
      var theme = THEMES.indexOf(themeSelect.value) !== -1 ? themeSelect.value : 'page';

      preview.style.setProperty('--bui-color-primary', color);
      preview.style.setProperty('--bui-radius-md', radius);
      preview.classList.toggle('bui-light', theme === 'light');
      preview.classList.toggle('bui-dark', theme === 'dark');

      var onPrimary = getComputedStyle(preview).getPropertyValue('--bui-color-on-primary').trim();
      if (HEX_RE.test(onPrimary)) {
        var ratio = contrast(color, onPrimary);
        message(ratio, ratio >= 4.5);
      }

      if (codeEl) {
        var css = '.my-scope {\n  --bui-color-primary: ' + color + ';\n  --bui-radius-md: ' + radius + ';\n}\n';
        codeEl.innerHTML = D.highlight ? D.highlight(css, 'css') : '';
        if (!D.highlight) { codeEl.textContent = css; }
      }
    }

    colorInput.value = defaultPrimary;
    colorInput.addEventListener('input', apply);
    radiusSelect.addEventListener('change', apply);
    themeSelect.addEventListener('change', apply);
    resetBtn.addEventListener('click', function () {
      colorInput.value = defaultPrimary;
      radiusSelect.value = DEFAULT_RADIUS;
      themeSelect.value = 'page';
      apply();
    });
    document.addEventListener('buidocs:prefchange', function () { apply(); });
    apply();
  }

  /* ------------------------------------------------------ Contrast table */

  function fillRatio(cell, fg, bg, min) {
    cell.textContent = '';
    if (!HEX_RE.test(fg) || !HEX_RE.test(bg)) { cell.appendChild(el('span', '', '—')); return; }
    var ratio = contrast(fg, bg);
    var pass = ratio >= min;
    cell.appendChild(el('code', 'docs-token-value', ratio.toFixed(2) + ':1'));
    cell.appendChild(document.createTextNode(' '));
    var badge = el('span', 'docs-badge ' + (pass ? 'docs-badge--available' : 'docs-badge--missing'));
    [['en', pass ? 'Pass' : 'Fail'], ['ar', pass ? 'ناجح' : 'غير ناجح']].forEach(function (pair) {
      var s = el('span', '', pair[1]);
      s.setAttribute('lang', pair[0]);
      badge.appendChild(s);
    });
    cell.appendChild(badge);
  }

  function fillContrast() {
    var rows = document.querySelectorAll('tr[data-fg][data-bg]');
    if (!rows.length) { return; }
    var light = makeProbe('bui-light');
    var dark = makeProbe('bui-dark');
    Array.prototype.forEach.call(rows, function (row) {
      var fg = row.getAttribute('data-fg');
      var bg = row.getAttribute('data-bg');
      var min = parseFloat(row.getAttribute('data-min')) || 4.5;
      if (!TOKEN_RE.test(fg) || !TOKEN_RE.test(bg)) { return; }
      var l = row.querySelector('[data-slot="ratio-light"]');
      var d = row.querySelector('[data-slot="ratio-dark"]');
      if (l) { fillRatio(l, tokenValue(light, fg), tokenValue(light, bg), min); }
      if (d) { fillRatio(d, tokenValue(dark, fg), tokenValue(dark, bg), min); }
    });
    document.body.removeChild(light);
    document.body.removeChild(dark);
  }

  /** <option> cannot contain markup, so its label is swapped from data-en / data-ar when the language changes. */
  function labelOptions() {
    var l = root.getAttribute('lang') === 'ar' ? 'ar' : 'en';
    Array.prototype.forEach.call(document.querySelectorAll('option[data-en][data-ar]'), function (o) {
      o.textContent = o.getAttribute('data-' + l);
    });
  }

  function init() {
    fillTables();
    fillContrast();
    initSandbox();
    labelOptions();
    document.addEventListener('buidocs:prefchange', function (e) {
      if (e.detail && e.detail.type === 'lang') { labelOptions(); }
    });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
