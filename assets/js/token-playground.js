/* Baset UI — Token playground (documentation only)
 * Controls: theme colors · neutrals (light + dark) · radius 1-6 · spacer · font size · fonts · shadow · chart tokens.
 * Everything is applied to #tpPreview only, and the generated CSS lists just what differs from the defaults. */
(() => {
  const preview = document.getElementById('tpPreview');
  if (!preview) return;
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const rootStyle = getComputedStyle(root);
  const fmt = (n) => String(+n.toFixed(4)).replace(/^0\./, '.');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ---------- What can be controlled ---------- */
  const COLORS = [['primary', 'violet'], ['secondary', 'slate'], ['success', 'green'], ['danger', 'red'], ['warning', 'amber'], ['info', 'blue']];
  const HUES = ['violet', 'slate', 'green', 'red', 'amber', 'blue'];
  const DEF_FONTS = { body: "'DM Sans', sans-serif", heading: 'Manrope, sans-serif' };

  /* tokens with a light and a dark value: [name, label, light, dark] */
  const PAIRS = {
    tpNeutrals: [
      ['ink', 'Text', '#20213a', '#eff0ff'], ['muted', 'Muted text', '#777b91', '#a5a8c0'], ['bg', 'Page background', '#f8f9fc', '#1c1d30'],
      ['surface', 'Surface', '#ffffff', '#25263d'], ['soft', 'Soft background', '#f5f5fa', '#2f3049'], ['line', 'Border', '#e9eaf2', '#36374f'],
      ['input-border', 'Input border', '#e1e3ed', '#41425a'], ['inverse', 'Inverse', '#20213a', '#eff0ff'], ['inverse-on', 'Text on inverse', '#ffffff', '#20213a'],
    ],
    tpCharts: [
      ['chart-1', 'Series 1', '#6658e8', '#8b80ee'], ['chart-2', 'Series 2', '#20ad7c', '#56c19b'], ['chart-3', 'Series 3', '#f2a33a', '#f5b969'],
      ['chart-4', 'Series 4', '#368de5', '#66a8eb'], ['chart-5', 'Series 5', '#d84b5d', '#e17684'], ['chart-6', 'Series 6', '#8f92ab', '#b2b5c5'],
      ['chart-7', 'Series 7', '#afa8f3', '#574bc5'], ['chart-8', 'Series 8', '#167957', '#1b9369'],
    ],
  };
  const PAIR_LIST = Object.values(PAIRS).flat();

  /* number tokens: c = container, token = the CSS variable (null = part of the shadow) */
  const R = (n, def) => ({ c: 'tpShape', k: `r${n}`, label: `Radius ${n}${n === 3 ? ' (buttons, inputs)' : n === 5 ? ' (cards)' : ''}`, token: `--bui-radius-${n}`, unit: 'rem', min: 0, max: 2, step: 0.0625, def });
  const SLIDERS = [
    R(1, 0.25), R(2, 0.375), R(3, 0.5), R(4, 0.75), R(5, 1), R(6, 1.5),
    { c: 'tpSpacing', k: 'spacer', label: 'Spacer', token: '--bui-spacer', unit: 'rem', min: 0.75, max: 1.5, step: 0.0625, def: 1 },
    { c: 'tpSpacing', k: 'font', label: 'Font size', token: '--bui-font-size', unit: 'rem', min: 0.75, max: 1.125, step: 0.03125, def: 0.875 },
    { c: 'tpShadow', k: 'shY', label: 'Offset Y', token: null, unit: 'px', min: 0, max: 40, step: 1, def: 12 },
    { c: 'tpShadow', k: 'shBlur', label: 'Blur', token: null, unit: 'px', min: 0, max: 80, step: 1, def: 32 },
    { c: 'tpShadow', k: 'shAl', label: 'Opacity (light)', token: null, unit: '', min: 0, max: 0.4, step: 0.01, def: 0.06 },
    { c: 'tpShadow', k: 'shAd', label: 'Opacity (dark)', token: null, unit: '', min: 0, max: 0.5, step: 0.01, def: 0.09 },
    { c: 'tpCharts', k: 'cLine', label: 'Line width', token: '--bui-chart-line-width', unit: 'px', min: 1, max: 6, step: 0.5, def: 2.5 },
    { c: 'tpCharts', k: 'cFont', label: 'Text size', token: '--bui-chart-font-size', unit: 'px', min: 9, max: 15, step: 1, def: 11 },
  ];
  /* custom properties that the library resolves on :root: they are re-declared inside the preview so they follow the edits */
  const DERIVED = [
    ['--bui-radius', 'var(--bui-radius-5)'], ['--bui-chart-surface', 'var(--bui-surface)'], ['--bui-chart-text', 'var(--bui-muted)'],
    ['--bui-chart-strong', 'var(--bui-ink)'], ['--bui-chart-grid', 'var(--bui-line)'], ['--bui-chart-axis', 'var(--bui-input-border)'],
    ['--bui-chart-track', 'var(--bui-soft)'], ['--bui-chart-font', 'var(--bui-font-body)'],
  ];

  const fresh = () => {
    const s = { colors: {}, pairs: {}, num: {}, text: { ...DEF_FONTS } };
    COLORS.forEach(([t, h]) => { s.colors[t] = { mode: 'hue', hue: h, hex: '' }; });
    PAIR_LIST.forEach(([k, , l, d]) => { s.pairs[k] = [l, d]; });
    SLIDERS.forEach((x) => { s.num[x.k] = x.def; });
    return s;
  };
  let state = fresh();

  /* ---------- Theme color token sets ---------- */
  const hueHex = (h) => rootStyle.getPropertyValue(`--bui-${h}-500`).trim();
  const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  function tokens(t) {
    const c = state.colors[t];
    if (c.mode === 'hue') {
      const h = c.hue, fgL = h === 'amber' ? 700 : 600;
      return {
        base: `var(--bui-${h}-500)`,
        'bg-subtle': `light-dark(var(--bui-${h}-100), var(--bui-${h}-900))`,
        fg: `light-dark(var(--bui-${h}-${fgL}), var(--bui-${h}-400))`,
        border: `light-dark(var(--bui-${h}-300), var(--bui-${h}-600))`,
        contrast: h === 'amber' ? '#3a2706' : '#fff',
      };
    }
    const b = `var(--bui-${t}-base)`;
    return {
      base: c.hex,
      'bg-subtle': `light-dark(color-mix(in srgb, ${b} 12%, #fff), color-mix(in srgb, ${b} 28%, #14152a))`,
      fg: `light-dark(color-mix(in srgb, ${b} 78%, #000), color-mix(in srgb, ${b} 62%, #fff))`,
      border: `light-dark(color-mix(in srgb, ${b} 45%, #fff), color-mix(in srgb, ${b} 70%, #000))`,
      contrast: lum(c.hex) > 0.6 ? '#1a1a1a' : '#fff',
    };
  }
  const isDefault = (t, def) => { const c = state.colors[t]; return c.mode === 'hue' && c.hue === def; };
  const ALIAS = {
    primary: { '--bui-primary': 'base', '--bui-primary-soft': 'bg-subtle', '--bui-primary-text': 'fg' },
    secondary: { '--bui-secondary': 'base' },
    success: { '--bui-success': 'base', '--bui-success-text': 'fg' },
    danger: { '--bui-danger': 'base', '--bui-danger-text': 'fg' },
    warning: { '--bui-warning': 'base', '--bui-warning-text': 'fg' },
    info: { '--bui-info': 'base', '--bui-info-text': 'fg' },
  };

  /* ---------- Shadow ---------- */
  const shadowChanged = () => ['shY', 'shBlur', 'shAl', 'shAd'].some((k) => state.num[k] !== SLIDERS.find((x) => x.k === k).def);
  const shadowColor = () => `light-dark(rgb(39 35 92 / ${fmt(state.num.shAl)}), rgb(0 0 0 / ${fmt(state.num.shAd)}))`;
  const shadowValue = () => `0 ${state.num.shY}px ${state.num.shBlur}px var(--bui-shadow-color)`;
  const numText = (x) => `${fmt(state.num[x.k])}${x.unit}`;
  const pairChanged = ([k, , l, d]) => state.pairs[k][0] !== l || state.pairs[k][1] !== d;

  /* ---------- Apply to the preview ---------- */
  function apply() {
    const set = (k, v) => preview.style.setProperty(k, v);
    COLORS.forEach(([t]) => {
      const tk = tokens(t);
      set(`--bui-${t}-base`, tk.base);
      set(`--bui-${t}-bg`, `var(--bui-${t}-base)`);
      set(`--bui-${t}-bg-subtle`, tk['bg-subtle']);
      set(`--bui-${t}-fg`, tk.fg);
      set(`--bui-${t}-border`, tk.border);
      set(`--bui-${t}-contrast`, tk.contrast);
      Object.entries(ALIAS[t]).forEach(([a, key]) => set(a, `var(--bui-${t}-${key})`));
    });
    set('--bui-primary-dark', 'color-mix(in srgb, var(--bui-primary-base) 85%, #000)');
    PAIR_LIST.forEach(([k]) => set(`--bui-${k}`, `light-dark(${state.pairs[k][0]}, ${state.pairs[k][1]})`));
    SLIDERS.filter((x) => x.token).forEach((x) => set(x.token, numText(x)));
    set('--bui-shadow-color', shadowColor());
    set('--bui-shadow', shadowValue());
    set('--bui-font-body', state.text.body || DEF_FONTS.body);
    set('--bui-font-heading', state.text.heading || DEF_FONTS.heading);
    DERIVED.forEach(([k, v]) => set(k, v));
    preview.style.fontFamily = 'var(--bui-font-body)';
    preview.style.fontSize = 'var(--bui-font-size)';
    paintCode();
  }

  /* ---------- Generated CSS ---------- */
  function paintCode() {
    const L = [];
    const section = (name, arr) => { if (!arr.length) return; if (L.length) L.push(''); L.push(`  /* ${name} */`, ...arr); };
    const sliders = (c) => SLIDERS.filter((x) => x.c === c && x.token && state.num[x.k] !== x.def).map((x) => `  ${x.token}: ${numText(x)};`);
    const pairs = (c) => PAIRS[c].filter(pairChanged).map(([k]) => `  --bui-${k}: light-dark(${state.pairs[k][0]}, ${state.pairs[k][1]});`);

    const colors = [];
    COLORS.forEach(([t, def]) => {
      if (isDefault(t, def)) return;
      const tk = tokens(t);
      colors.push(`  --bui-${t}-base: ${tk.base};`, `  --bui-${t}-bg-subtle: ${tk['bg-subtle']};`, `  --bui-${t}-fg: ${tk.fg};`, `  --bui-${t}-border: ${tk.border};`, `  --bui-${t}-contrast: ${tk.contrast};`);
    });
    section('Theme colors', colors);
    section('Neutrals (light, dark)', pairs('tpNeutrals'));
    section('Radius', sliders('tpShape'));
    section('Spacing and type', [...sliders('tpSpacing'),
      ...(state.text.body !== DEF_FONTS.body ? [`  --bui-font-body: ${state.text.body};`] : []),
      ...(state.text.heading !== DEF_FONTS.heading ? [`  --bui-font-heading: ${state.text.heading};`] : [])]);
    section('Shadow', shadowChanged() ? [`  --bui-shadow-color: ${shadowColor()};`, `  --bui-shadow: ${shadowValue()};`] : []);
    section('Charts', [...pairs('tpCharts'), ...sliders('tpCharts')]);

    const body = L.length ? [':root {', ...L, '}'] : ['/* No changes yet: these are the defaults. */', ':root {', '}'];
    const out = ['/* load this AFTER baset-ui.css */', ...body];
    $('tpCode').innerHTML = out.map((l) => {
      const e = esc(l);
      if (l.trim().startsWith('/*')) return `<span class="bui-code-muted">${e}</span>`;
      if (l.startsWith(':root') || l === '}') return `<span class="bui-code-pink">${e}</span>`;
      return e.replace(/^(\s*)([\w-]+)(:\s*)(.*?)(;)$/, '$1<span class="bui-code-blue">$2</span>$3<span class="bui-code-green">$4</span>$5');
    }).join('\n');
  }

  /* ---------- Build the controls ---------- */
  const sliderHtml = (x) => `<div class="bui-tp-slider"><div><span>${x.label}</span><code>${x.token ? `${x.token}: ` : ''}<span data-out="${x.k}"></span></code></div><input type="range" data-k="${x.k}" min="${x.min}" max="${x.max}" step="${x.step}" aria-label="${x.label}"></div>`;
  const pairRows = (c) => `<div class="bui-tp-row"><span></span><small>Light</small><small>Dark</small></div>` + PAIRS[c].map(([k, label]) =>
    `<div class="bui-tp-row" data-pair="${k}"><span>${label}</span><input type="color" data-m="0" aria-label="${label} light"><input type="color" data-m="1" aria-label="${label} dark"></div>`).join('');

  const colorsBox = $('tpColors');
  colorsBox.innerHTML = COLORS.map(([t]) => `
    <div class="bui-tp-row" data-t="${t}">
      <span>${t[0].toUpperCase() + t.slice(1)}</span>
      <select class="bui-input" aria-label="${t} hue">${HUES.map((h) => `<option value="${h}">${h}</option>`).join('')}<option value="custom">custom</option></select>
      <input type="color" aria-label="${t} custom color">
    </div>`).join('');
  ['tpShape', 'tpSpacing', 'tpShadow'].forEach((c) => { $(c).insertAdjacentHTML('afterbegin', SLIDERS.filter((x) => x.c === c).map(sliderHtml).join('')); });
  $('tpNeutrals').innerHTML = pairRows('tpNeutrals');
  $('tpCharts').innerHTML = pairRows('tpCharts') + SLIDERS.filter((x) => x.c === 'tpCharts').map(sliderHtml).join('');

  /* ---------- Keep the controls in step with the state ---------- */
  function syncRow(t) {
    const row = colorsBox.querySelector(`[data-t="${t}"]`), c = state.colors[t];
    row.querySelector('select').value = c.mode === 'hue' ? c.hue : 'custom';
    row.querySelector('input').value = c.mode === 'hue' ? hueHex(c.hue) : c.hex;
  }
  function syncAll() {
    COLORS.forEach(([t]) => syncRow(t));
    SLIDERS.forEach((x) => {
      document.querySelector(`input[data-k="${x.k}"]`).value = state.num[x.k];
      document.querySelector(`[data-out="${x.k}"]`).textContent = numText(x);
    });
    PAIR_LIST.forEach(([k]) => document.querySelectorAll(`[data-pair="${k}"] input`).forEach((i) => { i.value = state.pairs[k][+i.dataset.m]; }));
    $('tpFontBody').value = state.text.body;
    $('tpFontHeading').value = state.text.heading;
  }

  /* ---------- Events ---------- */
  colorsBox.addEventListener('change', (e) => {
    const row = e.target.closest('[data-t]'); if (!row || e.target.tagName !== 'SELECT') return;
    const t = row.dataset.t, c = state.colors[t];
    if (e.target.value === 'custom') { c.mode = 'custom'; c.hex = row.querySelector('input').value; } else { c.mode = 'hue'; c.hue = e.target.value; }
    syncRow(t); apply();
  });
  colorsBox.addEventListener('input', (e) => {
    const row = e.target.closest('[data-t]'); if (!row || e.target.type !== 'color') return;
    const c = state.colors[row.dataset.t]; c.mode = 'custom'; c.hex = e.target.value;
    row.querySelector('select').value = 'custom'; apply();
  });
  document.querySelector('.bui-tp-panel').addEventListener('input', (e) => {
    const i = e.target;
    if (i.type === 'range' && i.dataset.k) {
      const x = SLIDERS.find((s) => s.k === i.dataset.k); state.num[x.k] = +i.value;
      document.querySelector(`[data-out="${x.k}"]`).textContent = numText(x); apply();
    } else if (i.type === 'color' && i.closest('[data-pair]')) {
      state.pairs[i.closest('[data-pair]').dataset.pair][+i.dataset.m] = i.value; apply();
    } else if (i.dataset.font) { state.text[i.dataset.font] = i.value.trim(); apply(); }
  });

  $('tpMode').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mode]'); if (!b) return;
    preview.style.colorScheme = b.dataset.mode;
    $('tpMode').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
  });
  $('tpReset').addEventListener('click', () => { state = fresh(); syncAll(); apply(); });

  const dark = root.classList.contains('bui-dark');
  preview.style.colorScheme = dark ? 'dark' : 'light';
  $('tpMode').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.dataset.mode === (dark ? 'dark' : 'light')));
  syncAll();
  apply();
})();
