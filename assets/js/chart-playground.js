/* Baset UI — Chart playground (documentation only)
 * Pick a chart type, animation style, colors and options; the chart updates and the generated code matches it.
 * Needs baset-charts.js. Keeps all state in memory; nothing is stored. */
(() => {
  const chartEl = document.getElementById('cpChart');
  if (!chartEl || !window.BasetChart) return;
  const $ = (id) => document.getElementById(id);
  const panel = document.querySelector('.bui-tp-panel');
  const preview = $('cpPreview');
  const META = window.BUI.chart;

  /* ---------- Sample data ---------- */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const cart = (title, sets, extra) => ({ title, labels: MONTHS, sets, ...extra });
  const PRESETS = {
    cart: {
      revenue: cart('Monthly revenue', [{ label: 'Revenue', data: [18400, 21250, 19800, 24600, 27300, 26100, 29800, 32400, 31200, 35600, 38900, 42500] }]),
      vs: cart('Revenue vs expenses', [
        { label: 'Revenue', data: [42, 48, 45, 56, 61, 68, 64, 72, 70, 78, 84, 91] },
        { label: 'Expenses', data: [30, 33, 31, 38, 40, 44, 43, 47, 46, 51, 54, 58], color: '#f2a33a' }]),
      devices: cart('Sessions by device', [
        { label: 'Desktop', data: [5200, 5600, 5400, 6100, 6500, 6300, 6900, 7200, 7000, 7600, 7900, 8300] },
        { label: 'Mobile', data: [3800, 4400, 4900, 5600, 6200, 6800, 7600, 8100, 8400, 9200, 9800, 10600] },
        { label: 'Tablet', data: [900, 880, 950, 910, 980, 940, 1020, 1000, 1060, 1090, 1120, 1180] }]),
      profit: cart('Profit and loss', [
        { label: 'Profit', data: [12.4, 8.1, null, 6.9, null, 14.2, 9.8, null, 11.3, 15.6, null, 18.2], color: 'var(--bui-success)' },
        { label: 'Loss', data: [null, null, -3.6, null, -1.8, null, null, -2.7, null, null, -4.1, null], color: 'var(--bui-danger)' }], { stacked: true }),
    },
    mixed: {
      rate: cart('Revenue and conversion', [
        { label: 'Revenue', type: 'bar', data: [42, 48, 45, 56, 61, 68, 64, 72, 70, 78, 84, 91] },
        { label: 'Conversion rate', type: 'line', axis: 'right', data: [2.1, 2.4, 2.2, 2.9, 3.1, 3.4, 3.2, 3.6, 3.5, 3.9, 4.1, 4.4], color: '#f2a33a', points: true }], { formatRight: { suffix: '%' } }),
      orders: cart('Orders and refund rate', [
        { label: 'Orders', type: 'bar', data: [320, 410, 385, 470, 520, 610, 585, 640, 690, 720, 810, 880] },
        { label: 'Refund rate', type: 'line', axis: 'right', data: [2.4, 2.1, 2.6, 2.2, 1.9, 2.0, 1.7, 1.8, 1.6, 1.5, 1.7, 1.4], color: '#d84b5d', points: true }], { formatRight: { suffix: '%' } }),
    },
    part: {
      traffic: { title: 'Traffic sources', labels: ['Organic search', 'Direct', 'Social', 'Email', 'Referral'], sets: [{ label: 'Visits', data: [4120, 2340, 1680, 960, 740] }] },
      regions: { title: 'Customers by region', labels: ['Middle East', 'Europe', 'North America', 'Asia', 'Africa'], sets: [{ label: 'Customers', data: [4200, 3100, 2800, 1900, 700] }] },
      phases: { title: 'Project phases (%)', labels: ['Design', 'Development', 'Testing', 'Launch'], sets: [{ label: 'Progress', data: [92, 68, 41, 15] }] },
    },
    radar: {
      teams: { title: 'Two teams', labels: ['Speed', 'Reliability', 'Support', 'Security', 'Usability', 'Scalability'], sets: [{ label: 'Team A', data: [85, 78, 92, 70, 88, 64] }, { label: 'Team B', data: [70, 90, 75, 86, 72, 80] }], min: 0, max: 100 },
      skills: { title: 'One profile', labels: ['HTML', 'CSS', 'JavaScript', 'Accessibility', 'Testing'], sets: [{ label: 'Skills', data: [90, 85, 78, 70, 60] }], min: 0, max: 100 },
    },
    scatter: {
      price: { title: 'Price vs units sold', labels: [], sets: [
        { label: 'Accessories', data: [{ x: 9, y: 920 }, { x: 12, y: 840 }, { x: 15, y: 760, r: 7 }, { x: 18, y: 700 }, { x: 22, y: 610, r: 9 }, { x: 26, y: 540 }, { x: 34, y: 390, r: 6 }, { x: 38, y: 340 }] },
        { label: 'Devices', data: [{ x: 60, y: 310 }, { x: 80, y: 280, r: 8 }, { x: 99, y: 250 }, { x: 129, y: 205, r: 11 }, { x: 179, y: 150, r: 7 }, { x: 249, y: 98, r: 9 }] }], xTitle: 'Price ($)', yTitle: 'Units sold' },
      height: { title: 'Height vs weight', labels: [], sets: [
        { label: 'Players', data: [{ x: 168, y: 62 }, { x: 172, y: 68 }, { x: 175, y: 70 }, { x: 178, y: 75 }, { x: 181, y: 79 }, { x: 184, y: 83 }, { x: 188, y: 88 }, { x: 192, y: 94 }] }], xTitle: 'Height (cm)', yTitle: 'Weight (kg)' },
    },
    gauge: {
      cpu: { title: 'CPU load', labels: ['CPU'], sets: [{ label: 'CPU load', data: [64] }], format: { suffix: '%' } },
      score: { title: 'Performance score', labels: ['Score'], sets: [{ label: 'Performance score', data: [78] }] },
    },
  };
  const kindOf = (t) => (['line', 'bar', 'area'].includes(t) ? 'cart' : ['pie', 'doughnut', 'radial'].includes(t) ? 'part' : t);

  const PALETTES = {
    default: null,
    ocean: ['#0ea5e9', '#14b8a6', '#6366f1', '#f59e0b', '#ec4899'],
    sunset: ['#f97316', '#e11d48', '#a855f7', '#facc15', '#fb7185'],
    forest: ['#16a34a', '#65a30d', '#0d9488', '#ca8a04', '#84cc16'],
    mono: ['#312e81', '#6366f1', '#a5b4fc', '#4338ca', '#818cf8'],
  };
  const BANDS = [{ to: 50, color: 'var(--bui-success)' }, { to: 80, color: 'var(--bui-warning)' }, { to: 100, color: 'var(--bui-danger)' }];

  /* ---------- State ---------- */
  const DEFAULTS = {
    type: 'line', data: 'revenue', points: 12, height: null, mode: 'light', dir: 'ltr', out: 'full',
    animation: true, animationStyle: 'grow', easing: 'ease-out', duration: 700,
    palette: 'default', format: 'number', legendPosition: 'bottom', cutout: 62,
    showLegend: true, showTooltip: true, showGrid: true, showGridX: false, showLabels: true, showValues: false,
    smooth: false, pts: false, fill: false, stacked: false, rounded: false, horizontal: false, centerText: false, thresholds: false,
  };
  const state = { ...DEFAULTS };
  const OPT_DEFAULTS = { // what the library does when the option is not given (points depends on the type, see below)
    animation: true, animationStyle: 'grow', easing: 'ease-out', duration: 700, showLegend: true, showTooltip: true, showGrid: true, showGridX: false,
    showLabels: true, showValues: false, smooth: false, fill: false, stacked: false, rounded: false, horizontal: false, legendPosition: 'bottom', cutout: 62,
  };
  const RELEVANT = { // which options matter for which type (also drives which controls are shown)
    showLegend: 'line bar area pie doughnut radar scatter mixed radial', showTooltip: 'line bar area pie doughnut radar scatter mixed radial',
    legendPosition: 'line bar area pie doughnut radar scatter mixed radial',
    showGrid: 'line bar area radar scatter mixed', showGridX: 'line area scatter mixed', showLabels: 'line bar area pie doughnut radar scatter mixed radial gauge',
    showValues: 'bar mixed', smooth: 'line area mixed', points: 'line area radar mixed', fill: 'line', stacked: 'bar area mixed', rounded: 'bar mixed',
    horizontal: 'bar', centerText: 'doughnut radial', thresholds: 'gauge', cutout: 'doughnut',
  };
  const relevant = (key, type = state.type) => RELEVANT[key].split(' ').includes(type);
  const pointsDefault = (type) => type === 'radar';

  /* ---------- Build the data and options ---------- */
  function preset() {
    const list = PRESETS[kindOf(state.type)];
    return list[state.data] || list[Object.keys(list)[0]];
  }
  function buildData() {
    const p = preset(), kind = kindOf(state.type);
    const n = kind === 'cart' || kind === 'mixed' ? state.points : null;
    const cut = (a) => (n ? a.slice(0, n) : a);
    const data = { datasets: p.sets.map((s) => ({ ...s, data: cut(s.data) })) };
    if (kind !== 'scatter') data.labels = cut(p.labels);
    return data;
  }
  function centerText(p, t) {
    if (t !== 'radial') return { label: p.sets[0].label };
    const v = p.sets[0].data, avg = Math.round(v.reduce((a, b) => a + b, 0) / v.length);
    return { value: `${avg}%`, label: 'Overall' };
  }
  /* options the chart receives: every option, so switching one off really switches it off */
  function chartOptions() {
    const p = preset(), t = state.type, o = {
      animation: state.animation, animationStyle: state.animationStyle, easing: state.easing, duration: state.duration,
      height: state.height || META.heights[t], format: state.format, colors: PALETTES[state.palette],
    };
    ['showLegend', 'showTooltip', 'showGrid', 'showGridX', 'showLabels', 'showValues', 'smooth', 'fill', 'stacked', 'rounded', 'horizontal', 'legendPosition', 'cutout']
      .forEach((k) => { o[k] = relevant(k) ? state[k] : OPT_DEFAULTS[k]; });
    o.points = relevant('points') ? state.pts : null;
    o.centerText = relevant('centerText') && state.centerText ? centerText(p, t) : null;
    o.thresholds = relevant('thresholds') && state.thresholds ? BANDS : null;
    ['formatRight', 'min', 'max', 'xTitle', 'yTitle'].forEach((k) => { if (p[k] !== undefined) o[k] = p[k]; });
    if (p.format && state.format === 'number') o.format = p.format;
    return o;
  }
  /* options shown in the code: only what differs from the defaults */
  function codeOptions() {
    const o = chartOptions(), t = state.type, p = preset(), out = {};
    const put = (k, v) => { out[k] = v; };
    if (state.height) put('height', state.height);
    ['animation', 'animationStyle', 'easing', 'duration'].forEach((k) => { if (o[k] !== OPT_DEFAULTS[k]) put(k, o[k]); });
    if (!state.animation) { delete out.animationStyle; delete out.easing; delete out.duration; }
    ['showLegend', 'showTooltip', 'showGrid', 'showGridX', 'showLabels', 'showValues', 'smooth', 'fill', 'stacked', 'rounded', 'horizontal', 'legendPosition', 'cutout'].forEach((k) => {
      if (relevant(k) && o[k] !== OPT_DEFAULTS[k]) put(k, o[k]);
    });
    if (relevant('points') && state.pts !== pointsDefault(t)) put('points', state.pts);
    if (o.centerText) put('centerText', o.centerText);
    if (o.thresholds) { put('thresholds', BANDS); }
    if (o.colors) put('colors', o.colors);
    if (state.format !== 'number') put('format', state.format);
    else if (p.format) put('format', p.format);
    ['formatRight', 'min', 'max', 'xTitle', 'yTitle'].forEach((k) => { if (p[k] !== undefined) put(k, p[k]); });
    return out;
  }

  /* ---------- Code generation ---------- */
  const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k));
  function lit(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'string') return q(v);
    if (Array.isArray(v)) return `[${v.map(lit).join(', ')}]`;
    if (typeof v === 'object') return `{ ${Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => `${key(k)}: ${lit(x)}`).join(', ')} }`;
    return String(v);
  }
  function wrapArray(items, pad) { // an array on one line when short, otherwise several lines
    const one = `[${items.join(', ')}]`;
    if (one.length + pad.length <= 104) return one;
    const lines = []; let cur = '';
    items.forEach((it) => { if (cur && (cur + ', ' + it).length + pad.length > 92) { lines.push(cur); cur = it; } else cur = cur ? cur + ', ' + it : it; });
    lines.push(cur);
    return `[\n${lines.map((l) => `${pad}  ${l}`).join(',\n')}\n${pad}]`;
  }
  function dataCode(pad) {
    const d = preset2data(), L = [], base = `${pad}    `;
    L.push(`${pad}data: {`);
    if (d.labels) L.push(`${pad}  labels: ${wrapArray(d.labels.map(q), `${pad}  `)},`);
    L.push(`${pad}  datasets: [`);
    d.datasets.forEach((s, i) => {
      const fields = Object.entries(s).filter(([k, v]) => k !== 'data' && v !== undefined).map(([k, v]) => `${key(k)}: ${lit(v)}`);
      const items = s.data.map(lit);
      const one = `{ ${[...fields, `data: [${items.join(', ')}]`].join(', ')} }`;
      const body = (base + one).length <= 92 ? one
        : `{\n${base}  ${fields.join(', ')},\n${base}  data: ${wrapArray(items, `${base}  `)}\n${base}}`;
      L.push(`${base}${body}${i < d.datasets.length - 1 ? ',' : ''}`);
    });
    L.push(`${pad}  ]`, `${pad}}`);
    return L.join('\n');
  }
  const preset2data = () => buildData();
  function optionsCode(pad) {
    const o = codeOptions(), keys = Object.keys(o);
    if (!keys.length) return null;
    return `${pad}options: {\n${keys.map((k, i) => `${pad}  ${key(k)}: ${lit(o[k])}${i < keys.length - 1 ? ',' : ''}`).join('\n')}\n${pad}}`;
  }
  function fullCode() {
    const opt = optionsCode('    ');
    return ['<div id="my-chart"></div>', '<script src="assets/js/baset-charts.js"></script>', '<script>', "  new BasetChart('#my-chart', {", `    type: ${q(state.type)},`,
      dataCode('    ') + (opt ? ',' : ''), ...(opt ? [opt] : []), '  });', '</script>'].join('\n');
  }
  function optionsOnly() {
    const body = optionsCode('') || 'options: {}';
    return `// pass this as the "options" of new BasetChart(...), or to chart.setOptions({ ... })\n${body.replace(/^options: /, 'const options = ')};`;
  }

  /* ---------- Syntax colors (same classes the other pages use) ---------- */
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const span = (c, t) => `<span class="bui-code-${c}">${esc(t)}</span>`;
  const JS_TOK = /(\/\/[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\b(const|let|var|new|function|return|if|else|true|false|null|undefined)\b|([A-Za-z_$][\w$]*)(?=\s*:(?!:))/g;
  function hlJs(t) {
    let out = '', pos = 0, m;
    JS_TOK.lastIndex = 0;
    while ((m = JS_TOK.exec(t))) {
      out += esc(t.slice(pos, m.index));
      out += m[1] ? span('muted', m[1]) : m[2] ? span('green', m[2]) : m[3] ? span('pink', m[3]) : span('blue', m[4]);
      pos = m.index + m[0].length;
    }
    return out + esc(t.slice(pos));
  }
  function highlight(code) {
    const TAG = /<(\/?)([A-Za-z][\w-]*)((?:\s+[^\s=>/]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g;
    let out = '', pos = 0, js = false, m;
    while ((m = TAG.exec(code))) {
      const chunk = code.slice(pos, m.index);
      out += js ? hlJs(chunk) : esc(chunk);
      let tag = span('pink', `<${m[1]}${m[2]}`);
      (m[3].match(/\s+[^\s=>/]+(?:=(?:"[^"]*"|'[^']*'))?/g) || []).forEach((a) => {
        const [, sp, name, val] = a.match(/^(\s+)([^\s=>/]+)(?:=(.*))?$/s);
        tag += esc(sp) + span('blue', name) + (val !== undefined ? '=' + span('green', val) : '');
      });
      out += tag + span('pink', `${m[4]}>`);
      if (m[2].toLowerCase() === 'script') js = !m[1];
      pos = m.index + m[0].length;
    }
    const rest = code.slice(pos);
    return out + (js ? hlJs(rest) : esc(rest));
  }
  function paintCode() {
    const full = state.out === 'full';
    $('cpFile').textContent = full ? 'index.html' : 'options.js';
    $('cpCode').innerHTML = highlight(full ? fullCode() : optionsOnly());
  }

  /* ---------- The chart ---------- */
  let chart = null, lastKey = '';
  const dataKey = () => `${state.type}|${state.data}|${state.points}`;
  function render(mode) { // mode: 'new' (new chart), 'data' (update values), 'options' (no animation), 'replay'
    const data = buildData(), opts = chartOptions();
    if (mode === 'new' || !chart) {
      chart?.destroy();
      chart = new BasetChart(chartEl, { type: state.type, data, options: opts });
    } else if (mode === 'data') { chart.setOptions(opts); chart.update(data); }
    else { chart.setOptions(opts); if (mode === 'replay') chart.replay(); }
    lastKey = dataKey();
    paintCode();
  }

  /* ---------- Controls ---------- */
  const presetLabels = () => Object.entries(PRESETS[kindOf(state.type)]).map(([k, v]) => [k, v.title]);
  function syncControls() {
    const t = state.type, kind = kindOf(t);
    $('cpType').value = t;
    const sel = $('cpData'), list = presetLabels();
    if (!list.some(([k]) => k === state.data)) state.data = list[0][0];
    sel.innerHTML = list.map(([k, title]) => `<option value="${k}">${title}</option>`).join('');
    sel.value = state.data;
    $('cpPointsBox').hidden = !(kind === 'cart' || kind === 'mixed');
    $('cpPoints').value = state.points; $('cpPointsOut').textContent = state.points;
    const h = state.height || META.heights[t];
    $('cpHeight').value = h; $('cpHeightOut').textContent = h + 'px';
    $('cpDuration').value = state.duration; $('cpDurationOut').textContent = state.duration + 'ms';
    $('cpCutout').value = state.cutout; $('cpCutoutOut').textContent = state.cutout + '%';
    $('cpEasing').value = state.easing; $('cpPalette').value = state.palette; $('cpFormat').value = state.format; $('cpLegendPos').value = state.legendPosition;
    $('cpStyles').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.style === state.animationStyle));
    panel.querySelectorAll('input[data-opt]').forEach((c) => {
      const k = c.dataset.opt;
      c.checked = k === 'points' ? state.pts : !!state[k];
      const box = c.closest('.bui-checkline');
      if (RELEVANT[k]) box.hidden = !relevant(k);
    });
    panel.querySelectorAll('[data-for]').forEach((n) => { n.hidden = !n.dataset.for.split(' ').includes(t); });
    const off = !state.animation;
    ['cpEasing', 'cpDuration', 'cpReplay'].forEach((id) => { $(id).disabled = off; });
    $('cpStyles').querySelectorAll('button').forEach((b) => { b.disabled = off; });
    $('cpSwatches').innerHTML = (PALETTES[state.palette] || META.palette).slice(0, 5).map((c) => `<i style="background:${c}"></i>`).join('');
    $('cpMode').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.mode === state.mode));
    $('cpDir').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.dir === state.dir));
    $('cpOut').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.out === state.out));
    preview.style.colorScheme = state.mode;
    preview.dir = state.dir;
  }
  // the preview theme is its own: keep the chart text readable on the preview background
  preview.style.background = 'var(--bui-surface)';

  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('cpType', 'change', (e) => {
    state.type = e.target.value; state.height = null; state.pts = pointsDefault(state.type); state.centerText = false; state.thresholds = false;
    syncControls(); render('new');
  });
  on('cpData', 'change', (e) => {
    state.data = e.target.value;
    if (state.data === 'profit') state.stacked = true;   // positive and negative values read best stacked
    syncControls(); render('data');
  });
  on('cpPoints', 'input', (e) => { state.points = +e.target.value; $('cpPointsOut').textContent = state.points; render('data'); });
  on('cpHeight', 'input', (e) => { state.height = +e.target.value; $('cpHeightOut').textContent = state.height + 'px'; render('options'); });
  on('cpDuration', 'input', (e) => { state.duration = +e.target.value; $('cpDurationOut').textContent = state.duration + 'ms'; });
  on('cpDuration', 'change', () => render('replay'));
  on('cpEasing', 'change', (e) => { state.easing = e.target.value; render('replay'); });
  on('cpPalette', 'change', (e) => { state.palette = e.target.value; syncControls(); render('options'); });
  on('cpFormat', 'change', (e) => { state.format = e.target.value; render('options'); });
  on('cpLegendPos', 'change', (e) => { state.legendPosition = e.target.value; render('options'); });
  on('cpCutout', 'input', (e) => { state.cutout = +e.target.value; $('cpCutoutOut').textContent = state.cutout + '%'; render('options'); });
  on('cpReplay', 'click', () => render('replay'));
  on('cpStyles', 'click', (e) => {
    const b = e.target.closest('button[data-style]'); if (!b || b.disabled) return;
    state.animationStyle = b.dataset.style; syncControls(); render('replay');
  });
  panel.addEventListener('change', (e) => {
    const c = e.target.closest('input[data-opt]'); if (!c) return;
    const k = c.dataset.opt, v = c.checked;
    if (k === 'points') state.pts = v; else state[k] = v;
    syncControls();
    render(k === 'animation' && v ? 'replay' : 'options');
  });
  on('cpMode', 'click', (e) => { const b = e.target.closest('button[data-mode]'); if (b) { state.mode = b.dataset.mode; syncControls(); } });
  on('cpDir', 'click', (e) => { const b = e.target.closest('button[data-dir]'); if (b) { state.dir = b.dataset.dir; syncControls(); chart?.resize(); } });
  on('cpOut', 'click', (e) => { const b = e.target.closest('button[data-out]'); if (b) { state.out = b.dataset.out; syncControls(); paintCode(); } });
  on('cpReset', 'click', () => {
    const keep = { mode: state.mode, dir: state.dir };
    Object.assign(state, DEFAULTS, keep);
    syncControls(); render('new');
  });

  syncControls();
  render('new');
})();
