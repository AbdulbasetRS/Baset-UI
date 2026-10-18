/* Baset UI — Token playground (documentation only) */
(() => {
  const preview = document.getElementById('tpPreview');
  if (!preview) return;
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const rootStyle = getComputedStyle(root);

  const COLORS = [['primary', 'violet'], ['secondary', 'slate'], ['success', 'green'], ['danger', 'red'], ['warning', 'amber'], ['info', 'blue']];
  const HUES = ['violet', 'slate', 'green', 'red', 'amber', 'blue'];
  const DEFAULTS = { radius3: 0.5, radius5: 1, spacer: 1, font: 0.875 };
  const state = { colors: {}, ...DEFAULTS };
  COLORS.forEach(([t, h]) => { state.colors[t] = { mode: 'hue', hue: h, hex: '' }; });

  const hueHex = (h) => rootStyle.getPropertyValue(`--bui-${h}-500`).trim();
  const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const fmt = (n) => String(+n.toFixed(4)).replace(/^0\./, '.');

  /* ----- token sets for a theme color ----- */
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

  /* ----- apply to the preview scope ----- */
  const ALIAS = {
    primary: { '--bui-primary': 'base', '--bui-primary-soft': 'bg-subtle', '--bui-primary-text': 'fg' },
    secondary: { '--bui-secondary': 'base' },
    success: { '--bui-success': 'base', '--bui-success-text': 'fg' },
    danger: { '--bui-danger': 'base', '--bui-danger-text': 'fg' },
    warning: { '--bui-warning': 'base', '--bui-warning-text': 'fg' },
    info: { '--bui-info': 'base', '--bui-info-text': 'fg' },
  };
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
      Object.entries(ALIAS[t]).forEach(([a, key]) => set(a, `var(--bui-${t}-${key})`)); // re-resolve aliases inside the scope
    });
    set('--bui-primary-dark', 'color-mix(in srgb, var(--bui-primary-base) 85%, #000)');
    set('--bui-radius-3', fmt(state.radius3) + 'rem');
    set('--bui-radius-5', fmt(state.radius5) + 'rem');
    set('--bui-radius', 'var(--bui-radius-5)');
    set('--bui-spacer', fmt(state.spacer) + 'rem');
    set('--bui-font-size', fmt(state.font) + 'rem');
    paintCode();
  }

  /* ----- generated CSS ----- */
  function paintCode() {
    const lines = [];
    COLORS.forEach(([t, def]) => {
      if (isDefault(t, def)) return;
      const tk = tokens(t);
      lines.push(`  --bui-${t}-base: ${tk.base};`, `  --bui-${t}-bg-subtle: ${tk['bg-subtle']};`, `  --bui-${t}-fg: ${tk.fg};`,
        `  --bui-${t}-border: ${tk.border};`, `  --bui-${t}-contrast: ${tk.contrast};`, '');
    });
    if (state.radius3 !== DEFAULTS.radius3) lines.push(`  --bui-radius-3: ${fmt(state.radius3)}rem;`);
    if (state.radius5 !== DEFAULTS.radius5) lines.push(`  --bui-radius-5: ${fmt(state.radius5)}rem;`);
    if (state.spacer !== DEFAULTS.spacer) lines.push(`  --bui-spacer: ${fmt(state.spacer)}rem;`);
    if (state.font !== DEFAULTS.font) lines.push(`  --bui-font-size: ${fmt(state.font)}rem;`);
    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    const body = lines.length ? [':root {', ...lines, '}'] : ['/* No changes yet: these are the defaults. */', ':root {', '}'];
    const out = ['/* load this AFTER baset-ui.css */', ...body];
    $('tpCode').innerHTML = out.map((l) => {
      const e = l.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      if (l.startsWith('/*')) return `<span class="bui-code-muted">${e}</span>`;
      if (l.startsWith(':root') || l === '}') return `<span class="bui-code-pink">${e}</span>`;
      return e.replace(/^(\s*)([\w-]+)(:\s*)(.*?)(;)$/, '$1<span class="bui-code-blue">$2</span>$3<span class="bui-code-green">$4</span>$5');
    }).join('\n');
  }

  /* ----- controls ----- */
  const colorsBox = $('tpColors');
  colorsBox.innerHTML = COLORS.map(([t]) => `
    <div class="bui-tp-row" data-t="${t}">
      <span>${t[0].toUpperCase() + t.slice(1)}</span>
      <select class="bui-input" aria-label="${t} hue">${HUES.map((h) => `<option value="${h}">${h}</option>`).join('')}<option value="custom">custom</option></select>
      <input type="color" aria-label="${t} custom color">
    </div>`).join('');
  function syncRow(t) {
    const row = colorsBox.querySelector(`[data-t="${t}"]`), c = state.colors[t];
    row.querySelector('select').value = c.mode === 'hue' ? c.hue : 'custom';
    row.querySelector('input').value = c.mode === 'hue' ? hueHex(c.hue) : c.hex;
  }
  COLORS.forEach(([t]) => syncRow(t));

  colorsBox.addEventListener('change', (e) => {
    const row = e.target.closest('[data-t]'); if (!row) return;
    const t = row.dataset.t, c = state.colors[t];
    if (e.target.tagName === 'SELECT') {
      if (e.target.value === 'custom') { c.mode = 'custom'; c.hex = row.querySelector('input').value; }
      else { c.mode = 'hue'; c.hue = e.target.value; }
      syncRow(t); apply();
    }
  });
  colorsBox.addEventListener('input', (e) => {
    const row = e.target.closest('[data-t]'); if (!row || e.target.type !== 'color') return;
    const c = state.colors[row.dataset.t]; c.mode = 'custom'; c.hex = e.target.value;
    row.querySelector('select').value = 'custom'; apply();
  });

  const sliders = [['tpRadius3', 'radius3'], ['tpRadius5', 'radius5'], ['tpSpacer', 'spacer'], ['tpFont', 'font']];
  const syncSlider = (id, key) => { $(id).value = state[key]; $(id + 'Out').textContent = fmt(state[key]) + 'rem'; };
  sliders.forEach(([id, key]) => {
    syncSlider(id, key);
    $(id).addEventListener('input', (e) => { state[key] = +e.target.value; syncSlider(id, key); apply(); });
  });

  $('tpMode').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mode]'); if (!b) return;
    preview.style.colorScheme = b.dataset.mode;
    $('tpMode').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
  });

  $('tpReset').addEventListener('click', () => {
    COLORS.forEach(([t, h]) => { state.colors[t] = { mode: 'hue', hue: h, hex: '' }; syncRow(t); });
    Object.assign(state, DEFAULTS);
    sliders.forEach(([id, key]) => syncSlider(id, key));
    apply();
  });

  preview.style.colorScheme = isDarkPage() ? 'dark' : 'light';
  function isDarkPage() { return root.classList.contains('bui-dark'); }
  const modeBtn = $('tpMode').querySelector(`[data-mode="${isDarkPage() ? 'dark' : 'light'}"]`);
  $('tpMode').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === modeBtn));
  apply();
})();
