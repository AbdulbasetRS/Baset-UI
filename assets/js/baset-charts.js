/* Baset UI — Charts & Data Visualization (optional, no dependencies)
 *
 * SVG charts drawn with plain JavaScript. Needs section 20 of baset-ui.css (colors, fonts, tooltip, legend).
 *   const chart = new BasetChart('#sales', {
 *     type: 'line',                       // line · bar · area · pie · doughnut · radar · scatter · mixed · radial · gauge
 *     data: { labels: ['Jan', 'Feb'], datasets: [{ label: 'Sales', data: [120, 190], color: '#6658e8' }] },
 *     options: { animation: true, showLegend: true, showGrid: true }
 *   });
 *   chart.update(newData);  chart.setOptions({ smooth: true });  chart.destroy();
 *
 * Or without JavaScript:
 *   <div data-bui-chart="bar" data-bui-labels="Mon,Tue,Wed" data-bui-data="12,19,7" data-bui-height="240"></div>
 *   <div data-bui-chart="line" data-bui-config='{"data":{...},"options":{...}}'></div>
 *
 * Options (all optional): responsive, width, height, animation, duration, showLegend, legendPosition ('top'|'bottom'),
 *   legendValues, showGrid, showGridX, showLabels, showTooltip, showValues, smooth, points, fill, stacked, horizontal,
 *   rounded, colors, maxPoints, min, max, locale, format ('number'|'compact'|'currency'|'percent'|{Intl options, prefix,
 *   suffix}|function), axisFormat, formatRight, formatX, cutout, centerText, thickness, thresholds, xTitle, yTitle,
 *   emptyText, ariaLabel
 * Dataset: { label, data, color, colors (pie), type ('bar'|'line'|'area', mixed), axis ('left'|'right'), fill, smooth,
 *   points, dash, hidden }
 * JavaScript: BasetChart · BUI.chart.init(root) · BUI.chart.get(el) · chart.update(data) · chart.setOptions(o)
 *   chart.setColors([..]) · chart.toggle(i, visible?) · chart.resize() · chart.destroy()
 * Events on the container: bui:chart-render · bui:chart-click
 */
(() => {
  'use strict';
  const BUI = (window.BUI = window.BUI || {});
  if (BUI.Chart) return;

  const NS = 'http://www.w3.org/2000/svg';
  const TYPES = ['line', 'bar', 'area', 'pie', 'doughnut', 'radar', 'scatter', 'mixed', 'radial', 'gauge'];
  const SINGLE = ['pie', 'doughnut', 'radial', 'gauge'];
  const PALETTE = Array.from({ length: 8 }, (_, i) => `var(--bui-chart-${i + 1})`);
  const HEIGHTS = { line: 300, bar: 300, area: 300, mixed: 320, scatter: 320, radar: 340, pie: 280, doughnut: 280, radial: 260, gauge: 220 };
  const DEFAULTS = {
    responsive: true, width: null, height: null, animation: true, duration: 700,
    showLegend: true, legendPosition: 'bottom', legendValues: null,
    showGrid: true, showGridX: false, showLabels: true, showTooltip: true, showValues: false,
    smooth: false, points: null, fill: null, stacked: false, horizontal: false, rounded: false,
    colors: null, maxPoints: null, min: null, max: null, locale: null,
    format: 'number', axisFormat: null, formatRight: null, formatX: null,
    cutout: 62, centerText: null, thickness: null, thresholds: null, xTitle: null, yTitle: null,
    emptyText: 'No data to display', ariaLabel: null,
  };
  const PRESETS = {
    number: { maximumFractionDigits: 2 },
    compact: { notation: 'compact', maximumFractionDigits: 1 },
    currency: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    percent: { maximumFractionDigits: 1, suffix: '%' },
  };
  const ATTRS = {
    height: ['height', 'a'], width: ['width', 'a'], animation: ['animation', 'b'], duration: ['duration', 'n'],
    legend: ['showLegend', 'b'], 'legend-position': ['legendPosition', 's'], grid: ['showGrid', 'b'], labels: ['showLabels', 'b'],
    tooltip: ['showTooltip', 'b'], values: ['showValues', 'b'], smooth: ['smooth', 'b'], points: ['points', 'b'], fill: ['fill', 'b'],
    stacked: ['stacked', 'b'], horizontal: ['horizontal', 'b'], rounded: ['rounded', 'b'], locale: ['locale', 's'], format: ['format', 's'],
    cutout: ['cutout', 'n'], min: ['min', 'n'], max: ['max', 'n'], 'max-points': ['maxPoints', 'n'], colors: ['colors', 'l'],
    responsive: ['responsive', 'b'], empty: ['emptyText', 's'],
  };

  const instances = new WeakMap();
  const live = new Set();
  let uidCount = 0;

  /* ---------- Small helpers ---------- */
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const num = (v) => { if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null; const n = typeof v === 'number' ? v : parseFloat(v); return Number.isFinite(n) ? n : null; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const f = (n) => +n.toFixed(2);
  const P = (x, y) => `${f(x)} ${f(y)}`;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const S = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) { const v = attrs[k]; if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v === true ? '' : v); }
    if (parent) parent.append(n);
    return n;
  };
  const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const toXY = (p) => {
    const a = Array.isArray(p) ? { x: p[0], y: p[1], r: p[2] } : isObj(p) ? p : null;
    if (!a) return null;
    const x = num(a.x), y = num(a.y);
    return x === null || y === null ? null : { x, y, r: num(a.r) };
  };
  const trunc = (s, max) => (max > 0 && s.length > max ? `${s.slice(0, Math.max(1, max - 1))}…` : s);

  function niceNum(r, round) {
    const e = Math.floor(Math.log10(r)), fr = r / 10 ** e;
    const n = round ? (fr < 1.5 ? 1 : fr < 3 ? 2 : fr < 7 ? 5 : 10) : (fr <= 1 ? 1 : fr <= 2 ? 2 : fr <= 5 ? 5 : 10);
    return n * 10 ** e;
  }
  function niceScale(lo, hi, count, fixLo, fixHi) {
    if (fixLo != null) lo = fixLo;
    if (fixHi != null) hi = fixHi;
    if (!(hi > lo)) { if (lo === 0 && hi === 0) hi = 1; else { const p = Math.abs(hi) * 0.1 || 1; lo -= p; hi += p; } }
    const step = niceNum(niceNum(hi - lo, false) / Math.max(2, count - 1), true);
    const a = fixLo != null ? fixLo : Math.floor(lo / step) * step;
    const b = fixHi != null ? fixHi : Math.ceil(hi / step) * step;
    const ticks = [];
    const total = Math.min(60, Math.round((b - a) / step));
    for (let i = 0; i <= total; i++) ticks.push(+(a + i * step).toFixed(10));
    return { lo: a, hi: b > a ? b : a + step, ticks };
  }

  function makeFormatter(fmt, loc, extra) {
    if (typeof fmt === 'function') return fmt;
    const base = typeof fmt === 'string' ? (PRESETS[fmt] || PRESETS.number) : isObj(fmt) ? fmt : PRESETS.number;
    const opt = { ...base, ...(extra || {}) };
    const prefix = opt.prefix || '', suffix = opt.suffix || '';
    delete opt.prefix; delete opt.suffix;
    let nf;
    try { nf = new Intl.NumberFormat(loc, opt); } catch { nf = new Intl.NumberFormat('en', { maximumFractionDigits: 2 }); }
    return (v) => (v < 0 && prefix ? `-${prefix}${nf.format(-v)}${suffix}` : `${prefix}${nf.format(v)}${suffix}`);
  }

  /* Smooth (monotone cubic) or straight path through points; `first` is 'M' or 'L' */
  function pathOf(pts, smooth, first) {
    if (!pts.length) return '';
    let d = `${first || 'M'}${P(pts[0].x, pts[0].y)}`;
    const n = pts.length;
    if (!smooth || n < 3) { for (let i = 1; i < n; i++) d += `L${P(pts[i].x, pts[i].y)}`; return d; }
    const dx = [], m = [], t = new Array(n);
    for (let k = 0; k < n - 1; k++) { dx[k] = pts[k + 1].x - pts[k].x || 1e-6; m[k] = (pts[k + 1].y - pts[k].y) / dx[k]; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let k = 1; k < n - 1; k++) t[k] = m[k - 1] * m[k] <= 0 ? 0 : (m[k - 1] + m[k]) / 2;
    for (let k = 0; k < n - 1; k++) {
      if (m[k] === 0) { t[k] = 0; t[k + 1] = 0; continue; }
      const a = t[k] / m[k], b = t[k + 1] / m[k], s = a * a + b * b;
      if (s > 9) { const tau = 3 / Math.sqrt(s); t[k] = tau * a * m[k]; t[k + 1] = tau * b * m[k]; }
    }
    for (let k = 0; k < n - 1; k++) {
      const h = dx[k] / 3;
      d += `C${P(pts[k].x + h, pts[k].y + t[k] * h)} ${P(pts[k + 1].x - h, pts[k + 1].y - t[k + 1] * h)} ${P(pts[k + 1].x, pts[k + 1].y)}`;
    }
    return d;
  }
  function rrect(x, y, w, h, r) {
    const [a, b, c, d] = r.map((v) => Math.max(0, Math.min(v, w / 2, h / 2)));
    return `M${f(x + a)} ${f(y)}H${f(x + w - b)}${b ? `A${f(b)} ${f(b)} 0 0 1 ${f(x + w)} ${f(y + b)}` : ''}V${f(y + h - c)}${c ? `A${f(c)} ${f(c)} 0 0 1 ${f(x + w - c)} ${f(y + h)}` : ''}H${f(x + d)}${d ? `A${f(d)} ${f(d)} 0 0 1 ${f(x)} ${f(y + h - d)}` : ''}V${f(y + a)}${a ? `A${f(a)} ${f(a)} 0 0 1 ${f(x + a)} ${f(y)}` : ''}Z`;
  }
  const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  function sector(cx, cy, R, r, a0, a1, sgn) {
    const span = Math.abs(a1 - a0), large = span > Math.PI ? 1 : 0, sf = sgn > 0 ? 1 : 0;
    const [x0, y0] = polar(cx, cy, R, a0), [x1, y1] = polar(cx, cy, R, a1);
    let d = `M${P(x0, y0)}A${f(R)} ${f(R)} 0 ${large} ${sf} ${P(x1, y1)}`;
    if (r > 0) { const [x2, y2] = polar(cx, cy, r, a1), [x3, y3] = polar(cx, cy, r, a0); d += `L${P(x2, y2)}A${f(r)} ${f(r)} 0 ${large} ${sf ? 0 : 1} ${P(x3, y3)}Z`; } else d += `L${P(cx, cy)}Z`;
    return d;
  }
  function arcLine(cx, cy, r, a0, sgn, frac) {
    const span = clamp(frac, 0, 1) * Math.PI * 2;
    if (span < 1e-3) return '';
    const s = Math.min(span, Math.PI * 2 - 1e-3), a1 = a0 + sgn * s;
    const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
    return `M${P(x0, y0)}A${f(r)} ${f(r)} 0 ${s > Math.PI ? 1 : 0} ${sgn > 0 ? 1 : 0} ${P(x1, y1)}`;
  }

  /* ---------- Reading the HTML attributes ---------- */
  function readAttrs(node) {
    const d = node.dataset, out = { type: d.buiChart || undefined, data: undefined, options: {} };
    if (d.buiConfig) {
      try { const c = JSON.parse(d.buiConfig); if (isObj(c)) { out.type = c.type || out.type; out.data = c.data; out.options = isObj(c.options) ? { ...c.options } : {}; } }
      catch { console.warn('[BasetChart] data-bui-config is not valid JSON', node); }
    }
    for (const a in ATTRS) {
      const key = 'bui' + a.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
      if (d[key] === undefined) continue;
      const [opt, kind] = ATTRS[a], v = d[key];
      out.options[opt] = kind === 'b' ? v !== 'false' : kind === 'n' ? num(v) : kind === 'l' ? v.split(',').map((s) => s.trim()).filter(Boolean) : kind === 'a' ? (num(v) !== null && /^[\d.]+$/.test(v) ? +v : v) : v;
    }
    if (!out.data && d.buiData !== undefined) {
      const list = (s) => s.split(',').map((x) => x.trim());
      out.data = { labels: d.buiLabels ? list(d.buiLabels) : [], datasets: [{ label: d.buiLabel || 'Series', data: list(d.buiData).map(num), color: d.buiColor || undefined }] };
    }
    return out;
  }

  /* ---------- The chart ---------- */
  class BasetChart {
    constructor(target, config = {}) {
      const node = typeof target === 'string' ? document.querySelector(target) : target;
      this.el = node instanceof Element ? node : null;
      this.destroyed = false;
      if (!this.el) { console.error('[BasetChart] container not found:', target); this.destroyed = true; return; }
      const old = instances.get(this.el);
      if (old) old.destroy();
      const attr = readAttrs(this.el);
      this.type = config.type || attr.type;
      this.data = config.data || attr.data || { labels: [], datasets: [] };
      this.options = { ...DEFAULTS, ...attr.options, ...(isObj(config.options) ? config.options : {}) };
      instances.set(this.el, this);
      live.add(this);
      this._uid = `bc${++uidCount}`;
      this._hidden = new Set();
      this._off = [];
      this._from = null; this._cur = null; this._pFrom = null; this._pTo = null;
      this._anim = false; this._hit = null; this._w = 0; this._h = 0; this._lastSize = '';
      (Array.isArray(this.data.datasets) ? this.data.datasets : []).forEach((d, i) => { if (isObj(d) && d.hidden) this._hidden.add(i); });
      this._build();
      this._prepare();
      this._refresh(true);
    }

    /* --- public API --- */
    update(next, opts = {}) {
      if (this.destroyed) return this;
      if (Array.isArray(next)) next = next.length && isObj(next[0]) ? { datasets: next } : { datasets: [{ ...((this.data.datasets || [])[0] || {}), data: next }] };
      if (!isObj(next)) return this;
      this.data = { ...this.data, ...next };
      this._from = this._cur;
      this._prepare();
      const count = SINGLE.includes(this.type) ? this.state.n : this.state.ds.length;
      [...this._hidden].forEach((i) => { if (i >= count) this._hidden.delete(i); });
      this._refresh(false, opts.animate !== false);
      return this;
    }
    setOptions(opts = {}, cfg = {}) {
      if (this.destroyed || !isObj(opts)) return this;
      const { type, ...rest } = opts;
      if (type && TYPES.includes(type)) this.type = type;
      this.options = { ...this.options, ...rest };
      this._from = this._cur;
      this._prepare();
      this._refresh(false, !!cfg.animate);
      return this;
    }
    setColors(colors) { return this.setOptions({ colors: Array.isArray(colors) ? colors : null }); }
    toggle(i, visible) {
      if (this.destroyed || !this.state || i < 0 || i >= (SINGLE.includes(this.type) ? this.state.n : this.state.ds.length)) return this;
      const show = visible === undefined ? this._hidden.has(i) : !!visible;
      if (show) this._hidden.delete(i); else this._hidden.add(i);
      this._from = this._cur ? this._cur.map((v, k) => (k === i ? null : v)) : null;
      this._refresh(false, true);
      return this;
    }
    resize() { if (!this.destroyed) { this._lastSize = ''; this._refresh(false, false); } return this; }
    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      cancelAnimationFrame(this._raf);
      this._ro?.disconnect();
      this._off.forEach((fn) => fn());
      this.el.replaceChildren();
      this.el.classList.remove('bui-chart');
      this.el.removeAttribute('data-type');
      this.el.style.width = '';
      instances.delete(this.el);
      live.delete(this);
    }

    /* --- DOM --- */
    _on(t, ev, fn) { t.addEventListener(ev, fn); this._off.push(() => t.removeEventListener(ev, fn)); }
    _build() {
      const root = this.el;
      root.classList.add('bui-chart');
      root.replaceChildren();
      this._legendEl = el('div', 'bui-chart-legend');
      this._body = el('div', 'bui-chart-body');
      this._svg = S('svg', { class: 'bui-chart-svg', role: 'img', preserveAspectRatio: 'none' });
      this._tipEl = el('div', 'bui-chart-tooltip'); this._tipEl.hidden = true; this._tipEl.setAttribute('role', 'status');
      this._emptyEl = el('div', 'bui-chart-empty'); this._emptyEl.hidden = true;
      this._sr = el('p', 'bui-sr-only');
      this._body.append(this._svg, this._tipEl, this._emptyEl);
      root.append(this._body, this._sr, this._legendEl);
      this._on(this._svg, 'pointermove', (e) => this._move(e));
      this._on(this._svg, 'pointerleave', (e) => { if (e.pointerType !== 'touch') this._clearHover(); });
      this._on(this._svg, 'click', (e) => this._click(e));
      this._on(document, 'pointerdown', (e) => { if (!this.el.contains(e.target)) this._clearHover(); });
      if (typeof ResizeObserver === 'function') {
        this._ro = new ResizeObserver(() => {
          if (this.destroyed || !this.options.responsive) return;
          const s = `${this._body.clientWidth}x${this._body.clientHeight}`;
          if (s === this._lastSize) return;
          cancelAnimationFrame(this._rz);
          this._rz = requestAnimationFrame(() => { if (!this.destroyed && !this._anim) this._refresh(false, false); });
        });
        this._ro.observe(this._body);
      }
    }
    _chrome() {
      const o = this.options, root = this.el;
      root.dataset.type = this.type || '';
      root.style.width = o.width == null ? '' : typeof o.width === 'number' ? `${o.width}px` : String(o.width);
      const h = o.height == null ? HEIGHTS[this.type] || 300 : o.height;
      this._body.style.height = typeof h === 'number' ? `${h}px` : String(h);
      const top = o.legendPosition === 'top';
      if (top && this._legendEl.nextSibling !== this._body) root.insertBefore(this._legendEl, this._body);
      if (!top && this._legendEl !== root.lastElementChild) root.append(this._legendEl);
    }

    /* --- data --- */
    _prepare() {
      const o = this.options, type = this.type, raw = isObj(this.data) ? this.data : {};
      const single = SINGLE.includes(type), scatter = type === 'scatter';
      const pal = Array.isArray(o.colors) && o.colors.length ? o.colors : PALETTE;
      let sets = (Array.isArray(raw.datasets) ? raw.datasets : []).filter(isObj);
      if (single) sets = sets.slice(0, 1);
      let n = 0;
      const ds = sets.map((s, i) => {
        const arr = Array.isArray(s.data) ? s.data : [];
        const d = {
          label: s.label == null ? `Series ${i + 1}` : String(s.label), color: s.color || pal[i % pal.length],
          axis: s.axis === 'right' ? 'right' : 'left', fill: s.fill, smooth: s.smooth, points: s.points, dash: s.dash,
          kind: ['bar', 'line', 'area'].includes(s.type) ? s.type : type === 'mixed' || type === 'bar' ? 'bar' : type === 'area' ? 'area' : 'line',
        };
        d.data = scatter ? arr.map(toXY).filter(Boolean) : arr.map(num).map((v) => (single && type !== 'gauge' && v !== null && v < 0 ? null : v));
        if (!scatter) n = Math.max(n, d.data.length);
        return d;
      });
      let labels = Array.isArray(raw.labels) ? raw.labels.map((l) => (l == null ? '' : String(l))) : [];
      if (!scatter) {
        if (type === 'gauge') n = 1;
        n = Math.max(n, labels.length);
        while (labels.length < n) labels.push(String(labels.length + 1));
        labels.length = n;
        ds.forEach((d) => { while (d.data.length < n) d.data.push(null); });
        if (o.maxPoints >= 1 && n > o.maxPoints) {
          const k = Math.floor(o.maxPoints);
          labels = labels.slice(-k); ds.forEach((d) => { d.data = d.data.slice(-k); }); n = k;
          /* keep our own copy of the data short too (the caller's arrays are not changed), so a live feed does not grow forever */
          this.data = { ...raw, labels: labels.slice(), datasets: sets.map((s) => ({ ...s, data: (Array.isArray(s.data) ? s.data : []).slice(-k) })) };
        }
      } else labels = [];
      if (single && ds[0]) ds[0].colors = labels.map((_, i) => (Array.isArray(sets[0].colors) && sets[0].colors[i]) || pal[i % pal.length]);
      let empty = true, msg = o.emptyText, error = false;
      if (!TYPES.includes(type)) { empty = true; error = true; msg = `Unknown chart type "${type}"`; }
      else if (scatter) empty = !ds.some((d) => d.data.length);
      else if (single) empty = !ds[0] || !ds[0].data.some((v) => v !== null && (type === 'gauge' || type === 'radial' || v > 0));
      else empty = !ds.some((d) => d.data.some((v) => v !== null));
      if (!empty && type === 'radar' && n < 3) { empty = true; msg = 'A radar chart needs at least 3 labels'; }
      this.state = { ds, labels, n, empty, msg, error };
      this._cur = ds.map((d) => d.data);
      const sum = ds.slice(0, 20).map((d) => `${d.label}: ${d.data.slice(0, 40).map((v) => (v && typeof v === 'object' ? `${v.x}/${v.y}` : v)).join(', ')}`).join('. ');
      this._sr.textContent = empty ? msg : `${o.ariaLabel || `${type} chart`}. ${labels.length ? `${labels.slice(0, 40).join(', ')}. ` : ''}${sum}`;
      this._svg.setAttribute('aria-label', o.ariaLabel || `${type} chart`);
    }
    _visible(i) { return !this._hidden.has(i); }
    _vals(i, p, initial) {
      const d = this.state.ds[i].data, from = this._from && this._from[i];
      if (p >= 1 || (initial && SINGLE.includes(this.type))) return d;
      const b = this._base || 0;
      return d.map((v, j) => (v === null ? null : lerp(from && from[j] != null ? from[j] : b, v, p)));
    }

    /* --- legend --- */
    _legend() {
      const o = this.options, st = this.state, box = this._legendEl, type = this.type;
      box.replaceChildren();
      const pie = SINGLE.includes(type);
      let items = [];
      if (!st.empty && o.showLegend && type !== 'gauge') {
        if (pie) {
          const d = st.ds[0], vis = d.data.map((v, i) => (this._visible(i) && v ? v : 0)), total = vis.reduce((a, b) => a + b, 0);
          const pct = new Intl.NumberFormat(this._loc, { style: 'percent', maximumFractionDigits: 1 });
          const showVals = o.legendValues === null ? true : !!o.legendValues;
          items = st.labels.map((l, i) => {
            const v = d.data[i];
            let value = '';
            if (showVals && v !== null) value = type === 'radial' ? this._fmtPct(v) : `${this._fmt(v)} · ${this._visible(i) && total ? pct.format(v / total) : '—'}`;
            return { label: l, color: d.colors[i], value };
          });
        } else items = st.ds.map((d) => ({ label: d.label, color: d.color, value: '' }));
      }
      box.hidden = !items.length;
      items.forEach((it, i) => {
        const b = el('button', 'bui-chart-legend-item'); b.type = 'button';
        b.setAttribute('aria-pressed', String(this._visible(i)));
        b.style.setProperty('--c', it.color);
        b.append(el('span', 'bui-chart-swatch'), el('span', 'bui-chart-legend-label', it.label));
        if (it.value) b.append(el('span', 'bui-chart-legend-value', it.value));
        b.addEventListener('click', () => this.toggle(i));
        box.append(b);
      });
    }
    _fmtPct(v) { const r = [this.options.min == null ? 0 : this.options.min, this.options.max == null ? 100 : this.options.max]; return `${new Intl.NumberFormat(this._loc, { maximumFractionDigits: 1 }).format(clamp((v - r[0]) / ((r[1] - r[0]) || 1), 0, 1) * 100)}%`; }

    /* --- render cycle --- */
    _refresh(initial, animate = true) {
      if (this.destroyed) return;
      cancelAnimationFrame(this._raf);
      this._chrome();
      this._loc = (() => { const l = this.options.locale || this.el.closest('[lang]')?.getAttribute('lang') || navigator.language || 'en'; try { Intl.NumberFormat.supportedLocalesOf(l); return l; } catch { return 'en'; } })();
      this._rtl = getComputedStyle(this.el).direction === 'rtl';
      this._fmt = makeFormatter(this.options.format, this._loc);
      this._legend();
      this._layout();
      this._lastSize = `${this._body.clientWidth}x${this._body.clientHeight}`;
      const go = this.options.animation && animate && !reduced() && !this.state.empty && this._w > 0;
      if (!go) { this._anim = false; this._draw(1, initial); this._done(); return; }
      this._anim = true;
      const t0 = performance.now(), dur = Math.max(100, this.options.duration || 700);
      const step = (now) => {
        const t = clamp((now - t0) / dur, 0, 1);
        this._anim = t < 1;
        this._draw(ease(t), initial);
        if (t < 1) this._raf = requestAnimationFrame(step); else this._done();
      };
      this._raf = requestAnimationFrame(step);
    }
    _done() {
      this._anim = false;
      this._from = null;
      this.el.dispatchEvent(new CustomEvent('bui:chart-render', { bubbles: true, detail: { chart: this } }));
    }
    _layout() {
      const st = this.state, svg = this._svg, body = this._body;
      this._clearHover();
      svg.replaceChildren();
      this._hit = null;
      this._emptyEl.hidden = !st.empty;
      svg.style.visibility = st.empty ? 'hidden' : '';
      if (st.empty) { this._emptyEl.textContent = ''; this._emptyEl.append(el('span', `bui-chart-empty-text${st.error ? ' is-error' : ''}`, st.msg)); }
      let w = Math.round(body.clientWidth), h = Math.round(body.clientHeight);
      if (!w) w = typeof this.options.width === 'number' ? this.options.width : 480;
      if (!h) h = typeof this.options.height === 'number' ? this.options.height : HEIGHTS[this.type] || 300;
      this._w = w; this._h = h;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      this._defs = S('defs', null, svg);
      this._stat = S('g', { class: 'bui-chart-static' }, svg);
      this._dataG = S('g', { class: 'bui-chart-data' }, svg);
      this._ovG = S('g', { class: 'bui-chart-overlay' }, svg);
      this._geo = null;
      if (st.empty) return;
      const t = this.type;
      this._sweep = SINGLE.includes(t);
      if (t === 'pie' || t === 'doughnut') this._layPie();
      else if (t === 'radial') this._layRadial();
      else if (t === 'gauge') this._layGauge();
      else if (t === 'radar') this._layRadar();
      else if (t === 'scatter') this._layScatter();
      else this._layCart();
    }
    _draw(p, initial) {
      if (this.state.empty || !this._geo) return;
      this._dataG.replaceChildren();
      const t = this.type;
      if (t === 'pie' || t === 'doughnut') this._drawPie(p, initial);
      else if (t === 'radial') this._drawRadial(p, initial);
      else if (t === 'gauge') this._drawGauge(p, initial);
      else if (t === 'radar') this._drawRadar(p);
      else if (t === 'scatter') this._drawScatter(p);
      else this._drawCart(p);
    }
    _text(parent, x, y, str, cls, anchor, extra) {
      const t = S('text', { x: f(x), y: f(y), class: `bui-chart-text ${cls || ''}`, 'text-anchor': anchor || 'middle', ...(extra || {}) }, parent);
      t.textContent = str;
      return t;
    }
    _axisFmt(sc, fmt) {
      const o = this.options;
      if (o.axisFormat) return makeFormatter(o.axisFormat, this._loc);
      if (typeof fmt === 'function') return fmt;
      const big = Math.max(Math.abs(sc.lo), Math.abs(sc.hi)) >= 10000;
      return makeFormatter(fmt, this._loc, big ? { notation: 'compact', maximumFractionDigits: 1 } : null);
    }

    /* ================= Cartesian: line · bar · area · mixed ================= */
    _stacks(vals) {
      const ds = this.state.ds, out = ds.map(() => null);
      if (!this.options.stacked) return out;
      const pick = (kind) => ds.map((d, i) => i).filter((i) => this._visible(i) && ds[i].kind === kind && ds[i].axis === 'left');
      [pick('bar'), pick('area')].forEach((g, gi) => {
        if (!g.length) return;
        g.forEach((i) => { out[i] = { lo: [], hi: [] }; });
        for (let j = 0; j < this.state.n; j++) {
          let pos = 0, neg = 0, acc = 0;
          g.forEach((i) => {
            const v = vals[i][j], o = out[i];
            if (v === null) { o.lo[j] = null; o.hi[j] = null; return; }
            if (gi === 0) { if (v >= 0) { o.lo[j] = pos; pos += v; o.hi[j] = pos; } else { o.hi[j] = neg; neg += v; o.lo[j] = neg; } }
            else { o.lo[j] = acc; acc += v; o.hi[j] = acc; }
          });
        }
      });
      return out;
    }
    _layCart() {
      const o = this.options, st = this.state, ds = st.ds, n = st.n, w = this._w, h = this._h, rtl = this._rtl;
      const hor = !!o.horizontal && this.type === 'bar';
      const labels = o.showLabels;
      const stacks = this._stacks(ds.map((d) => d.data));
      const ext = { left: [Infinity, -Infinity], right: [Infinity, -Infinity] };
      const add = (s, v) => { if (v == null || !Number.isFinite(v)) return; if (v < ext[s][0]) ext[s][0] = v; if (v > ext[s][1]) ext[s][1] = v; };
      ds.forEach((d, i) => {
        if (!this._visible(i)) return;
        d.data.forEach((v, j) => { if (stacks[i]) { add(d.axis, stacks[i].lo[j]); add(d.axis, stacks[i].hi[j]); } else add(d.axis, v); });
        if (d.kind === 'bar' || d.kind === 'area' || (d.fill ?? o.fill)) add(d.axis, 0);
      });
      const hasRight = ds.some((d, i) => this._visible(i) && d.axis === 'right');
      const count = hor ? clamp(Math.floor((w * 0.6) / 70), 3, 8) : clamp(Math.floor((h - 60) / 48), 3, 7);
      const mk = (side) => { let [lo, hi] = ext[side]; if (lo === Infinity) { lo = 0; hi = 1; } return niceScale(lo, hi, count, side === 'left' ? o.min : null, side === 'left' ? o.max : null); };
      const sc = { left: mk('left'), right: hasRight ? mk('right') : null };
      const fm = { left: this._fmt, right: o.formatRight ? makeFormatter(o.formatRight, this._loc) : this._fmt };
      const af = { left: this._axisFmt(sc.left, o.format), right: sc.right ? this._axisFmt(sc.right, o.formatRight || o.format) : null };
      const tl = sc.left.ticks.map((v) => af.left(v)), tr = sc.right ? sc.right.ticks.map((v) => af.right(v)) : [];
      const lw = (arr) => (labels ? Math.max(...arr.map((s) => s.length), 1) * 6.4 + 14 : 0);
      const hasBarKind = ds.some((d) => d.kind === 'bar');
      let mL, mR, mT = 12, mB = labels ? 28 : 10;
      if (hor) {
        const catW = labels ? Math.min(Math.max(...st.labels.map((s) => s.length), 1) * 6.4 + 14, w * 0.34) : 0;
        const vw = o.showValues ? 40 : 0;
        mL = rtl ? 12 + vw : Math.max(catW, 10); mR = rtl ? Math.max(catW, 10) : 14 + vw; mB = labels ? 26 : 10;
      } else {
        const sw = lw(tl), ew = hasRight ? lw(tr) : 0;
        mL = Math.max(rtl ? ew : sw, 10); mR = Math.max(rtl ? sw : ew, hasRight ? 10 : 14);
      }
      if (o.showValues && !hor) mT += 14;
      const x0 = mL, x1 = Math.max(mL + 40, w - mR), y0 = mT, y1 = Math.max(mT + 40, h - mB);
      const pw = x1 - x0, ph = y1 - y0, center = hasBarKind || hor;
      const inset = Math.min(12, pw / (n * 2 || 1));
      const g = (this._geo = { hor, x0, x1, y0, y1, pw, ph, sc, fm, n, center, stacks });
      this._base = clamp(0, sc.left.lo, sc.left.hi);
      /* coordinates */
      const frac = (side, v) => (v - sc[side].lo) / ((sc[side].hi - sc[side].lo) || 1);
      g.vx = (v) => (rtl ? x1 - frac('left', v) * pw : x0 + frac('left', v) * pw);
      g.vy = (side, v) => y1 - frac(side, v) * ph;
      g.catAt = (j) => {
        if (hor) return y0 + ((j + 0.5) / n) * ph;
        const fr = center ? (j + 0.5) / n : n === 1 ? 0.5 : (inset + (j * (pw - 2 * inset)) / (n - 1)) / pw;
        return rtl ? x1 - fr * pw : x0 + fr * pw;
      };
      g.band = (hor ? ph : pw) / n;
      /* defs: clip + gradients */
      const cid = `${this._uid}-clip`;
      S('rect', { x: x0 - 14, y: y0 - 14, width: pw + 28, height: ph + 28 }, S('clipPath', { id: cid }, this._defs));
      this._dataG.setAttribute('clip-path', `url(#${cid})`);
      ds.forEach((d, i) => {
        const gr = S('linearGradient', { id: `${this._uid}-g${i}`, x1: 0, y1: 0, x2: 0, y2: 1 }, this._defs);
        S('stop', { offset: 0, style: `stop-color:${d.color};stop-opacity:.34` }, gr);
        S('stop', { offset: 1, style: `stop-color:${d.color};stop-opacity:.02` }, gr);
      });
      /* static: grid, axes, labels */
      const sg = this._stat;
      const grid = o.showGrid, tickFn = (v) => (hor ? g.vx(v) : g.vy('left', v));
      sc.left.ticks.forEach((v, k) => {
        const p = tickFn(v);
        if (grid || (v === 0 && sc.left.lo < 0)) S('line', { class: `bui-chart-grid${v === 0 && sc.left.lo < 0 ? ' is-zero' : ''}`, x1: hor ? p : x0, x2: hor ? p : x1, y1: hor ? y0 : p, y2: hor ? y1 : p }, sg);
        if (labels) {
          if (hor) this._text(sg, p, y1 + 18, tl[k], 'bui-chart-tick');
          else this._text(sg, rtl ? x1 + 8 : x0 - 8, p + 3.5, tl[k], 'bui-chart-tick', rtl ? 'start' : 'end');
        }
      });
      if (sc.right && labels) sc.right.ticks.forEach((v, k) => this._text(sg, rtl ? x0 - 8 : x1 + 8, g.vy('right', v) + 3.5, tr[k], 'bui-chart-tick', rtl ? 'end' : 'start'));
      S('line', { class: 'bui-chart-axis', x1: x0, x2: x1, y1: y1, y2: y1 }, sg);
      if (o.showGridX && !hor) for (let j = 0; j < n; j++) S('line', { class: 'bui-chart-grid', x1: g.catAt(j), x2: g.catAt(j), y1: y0, y2: y1 }, sg);
      if (labels) {
        if (hor) st.labels.forEach((l, j) => this._text(sg, rtl ? x1 + 8 : x0 - 8, g.catAt(j) + 3.5, trunc(l, Math.floor((rtl ? mR : mL) / 6.2)), 'bui-chart-tick', rtl ? 'start' : 'end'));
        else {
          const maxLen = Math.max(...st.labels.map((s) => s.length), 1);
          const per = Math.max(1, Math.floor(pw / (Math.min(maxLen, 12) * 5.6 + 12))), stepN = Math.ceil(n / per);
          st.labels.forEach((l, j) => { if (j % stepN === 0) this._text(sg, g.catAt(j), y1 + 18, trunc(l, 12), 'bui-chart-tick'); });
        }
      }
    }
    _drawCart(p) {
      const o = this.options, st = this.state, ds = st.ds, g = this._geo, n = g.n, rtl = this._rtl, hor = g.hor, dg = this._dataG;
      const vals = ds.map((d, i) => this._vals(i, p, false));
      const stacks = this._stacks(vals);
      const cats = Array.from({ length: n }, (_, j) => ({ pos: g.catAt(j), rows: [] }));
      const surf = 'var(--bui-chart-surface)';
      const base = (side) => clamp(g.vy(side, 0), g.y0, g.y1);
      const idx = (kind) => ds.map((d, i) => i).filter((i) => this._visible(i) && ds[i].kind === kind);
      /* areas */
      idx('area').concat(idx('line').filter((i) => ds[i].fill ?? o.fill)).forEach((i) => {
        const d = ds[i], stk = stacks[i], sm = d.smooth ?? o.smooth;
        let run = [];
        const flush = () => {
          if (run.length > 1) {
            const top = run.map((r) => ({ x: r.x, y: r.yt })), bot = run.map((r) => ({ x: r.x, y: r.yb })).reverse();
            S('path', { class: 'bui-chart-area', d: pathOf(top, sm, 'M') + pathOf(bot, sm, 'L') + 'Z', style: stk ? `fill:${d.color};fill-opacity:.72` : `fill:url(#${this._uid}-g${i})` }, dg);
          }
          run = [];
        };
        vals[i].forEach((v, j) => {
          if (v === null) { flush(); return; }
          run.push({ x: cats[j].pos, yt: g.vy(d.axis, stk ? stk.hi[j] : v), yb: stk ? g.vy(d.axis, stk.lo[j]) : base(d.axis) });
        });
        flush();
      });
      /* bars */
      const bars = idx('bar');
      if (bars.length) {
        const stackedBars = o.stacked && bars.some((i) => stacks[i]);
        const k = stackedBars ? 1 : bars.length, groupW = g.band * (k === 1 ? 0.6 : 0.74), gap = k > 1 ? 3 : 0;
        const bw = Math.max(2, (groupW - gap * (k - 1)) / k);
        const rad = o.rounded ? (o.rounded === true ? Math.min(7, bw / 2) : +o.rounded) : 0;
        bars.forEach((i, gi) => {
          const d = ds[i], stk = stacks[i], pos = stackedBars ? 0 : gi;
          vals[i].forEach((v, j) => {
            if (v === null) return;
            const lo = stk ? stk.lo[j] : Math.min(0, v), hi = stk ? stk.hi[j] : Math.max(0, v);
            const off = (g.band - groupW) / 2 + pos * (bw + gap);
            let x, y, bwid, bhei, r = [0, 0, 0, 0];
            const a = hor ? g.vx(lo) : g.vy(d.axis, lo), b = hor ? g.vx(hi) : g.vy(d.axis, hi);
            if (hor) { x = Math.min(a, b); bwid = Math.abs(a - b); y = g.y0 + j * g.band + off; bhei = bw; }
            else { y = Math.min(a, b); bhei = Math.abs(a - b); bwid = bw; x = rtl ? g.x1 - j * g.band - off - bw : g.x0 + j * g.band + off; }
            if (rad) {
              let outer = true;
              if (stk) outer = v >= 0 ? !bars.some((q) => q > i && stacks[q] && vals[q][j] !== null && vals[q][j] >= 0) : !bars.some((q) => q > i && stacks[q] && vals[q][j] !== null && vals[q][j] < 0);
              if (outer) {
                if (hor) { const toRight = rtl ? v < 0 : v >= 0; r = toRight ? [0, rad, rad, 0] : [rad, 0, 0, rad]; }
                else r = v >= 0 ? [rad, rad, 0, 0] : [0, 0, rad, rad];
              }
            }
            const path = rad ? rrect(x, y, bwid, bhei, r) : `M${P(x, y)}h${f(bwid)}v${f(bhei)}h${f(-bwid)}Z`;
            S('path', { class: 'bui-chart-bar', d: path, style: `fill:${d.color}` }, dg);
            cats[j].rows.push({ i, v, color: d.color });
            if (o.showValues && !stk && bw >= 18 && p >= 1) {
              if (hor) this._text(dg, v >= 0 !== rtl ? x + bwid + 6 : x - 6, y + bw / 2 + 3.5, this._fmt(v), 'bui-chart-value', v >= 0 !== rtl ? 'start' : 'end');
              else this._text(dg, x + bw / 2, v >= 0 ? y - 6 : y + bhei + 13, this._fmt(v), 'bui-chart-value');
            }
          });
        });
      }
      /* lines */
      ds.forEach((d, i) => {
        if (!this._visible(i) || d.kind === 'bar') return;
        const stk = stacks[i], sm = d.smooth ?? o.smooth, showPts = d.points ?? o.points;
        const runs = []; let run = [];
        vals[i].forEach((v, j) => {
          if (v === null) { if (run.length) runs.push(run); run = []; return; }
          const pt = { x: cats[j].pos, y: g.vy(d.axis, stk ? stk.hi[j] : v), j, v };
          run.push(pt);
          cats[j].rows.push({ i, v: this.state.ds[i].data[j], y: pt.y, color: d.color, line: true });
        });
        if (run.length) runs.push(run);
        runs.forEach((r) => {
          if (r.length > 1) S('path', { class: 'bui-chart-line', d: pathOf(r, sm, 'M'), style: `stroke:${d.color}`, 'stroke-dasharray': d.dash ? (Array.isArray(d.dash) ? d.dash.join(' ') : '6 5') : null }, dg);
          if (showPts || r.length === 1) r.forEach((pt) => S('circle', { class: 'bui-chart-point', cx: f(pt.x), cy: f(pt.y), r: 4, style: `fill:${d.color};stroke:${surf}` }, dg));
        });
      });
      cats.forEach((c) => c.rows.sort((a, b) => a.i - b.i));
      this._hit = { kind: 'cat', cats, hor, band: g.band, stacked: o.stacked };
    }

    /* ================= Pie · doughnut ================= */
    _layPie() {
      const o = this.options, w = this._w, h = this._h, dn = this.type === 'doughnut';
      const R = Math.max(10, Math.min(w, h) / 2 - 8), inner = dn ? R * clamp(o.cutout, 30, 90) / 100 : 0;
      this._geo = { cx: w / 2, cy: h / 2, R, inner };
      this._base = 0;
      if (o.centerText && inner > 20) {
        const fs = clamp(inner * 0.36, 14, 34);
        this._cv = this._text(this._stat, w / 2, h / 2 + fs * 0.12, '', 'bui-chart-center-value', 'middle', { style: `font-size:${f(fs)}px` });
        this._cl = this._text(this._stat, w / 2, h / 2 + fs * 0.12 + Math.max(14, fs * 0.5), '', 'bui-chart-center-label');
      } else { this._cv = null; this._cl = null; }
    }
    _centerText(i) {
      const o = this.options;
      if (!this._cv) return;
      const ct = isObj(o.centerText) ? o.centerText : {};
      const d = this.state.ds[0], total = d.data.reduce((a, v, k) => a + (this._visible(k) && v ? v : 0), 0);
      if (i != null && d.data[i] != null) { this._cv.textContent = this._fmt(d.data[i]); this._cl.textContent = this.state.labels[i]; return; }
      const v = typeof ct.value === 'function' ? ct.value(total) : ct.value == null || ct.value === 'auto' ? this._fmt(total) : String(ct.value);
      this._cv.textContent = v;
      this._cl.textContent = ct.label == null ? 'Total' : ct.label;
    }
    _drawPie(p, initial) {
      const st = this.state, g = this._geo, d = st.ds[0], rtl = this._rtl, sgn = rtl ? -1 : 1;
      const vals = this._vals(0, p, initial);
      const total = vals.reduce((a, v, k) => a + (this._visible(k) && v ? v : 0), 0);
      const target = d.data.reduce((a, v, k) => a + (this._visible(k) && v ? v : 0), 0);
      const to = []; let acc = 0;
      (initial ? d.data : vals).forEach((v, k) => { const fr = this._visible(k) && v && (initial ? target : total) ? v / (initial ? target : total) : 0; to.push([acc, acc + fr]); acc += fr; });
      const from = !initial && this._pFrom && this._pFrom.length === to.length ? this._pFrom : null;
      const items = [];
      to.forEach((t, k) => {
        if (t[1] - t[0] <= 0 && !(from && from[k] && from[k][1] - from[k][0] > 0)) return;
        const a = from ? [lerp(from[k][0], t[0], p), lerp(from[k][1], t[1], p)] : initial ? [t[0] * p, t[1] * p] : t;
        const span = clamp(a[1] - a[0], 0, 0.9999);
        if (span <= 0.0005) return;
        const a0 = -Math.PI / 2 + sgn * a[0] * Math.PI * 2, a1 = a0 + sgn * span * Math.PI * 2, mid = (a0 + a1) / 2;
        const path = S('path', { class: 'bui-chart-slice', d: sector(g.cx, g.cy, g.R, g.inner, a0, a1, sgn), style: `fill:${d.colors[k]};--tx:${f(Math.cos(mid) * 6)}px;--ty:${f(Math.sin(mid) * 6)}px`, 'data-i': k }, this._dataG);
        items.push({ i: k, label: st.labels[k], value: d.data[k], color: d.colors[k], pct: target ? d.data[k] / target : 0 });
      });
      if (p >= 1) this._pFrom = to;
      this._hit = { kind: 'slice', items };
      this._centerText(null);
    }

    /* ================= Radial progress ================= */
    _rings() { const d = this.state.ds[0]; return d.data.map((v, i) => i).filter((i) => this._visible(i) && d.data[i] !== null); }
    _layRadial() {
      const o = this.options, w = this._w, h = this._h, rings = this._rings();
      this._range = [o.min == null ? 0 : o.min, o.max == null ? 100 : o.max];
      const R = Math.max(20, Math.min(w, h) / 2 - 6), nR = Math.max(1, rings.length);
      const gap = nR > 1 ? 6 : 0, th = o.thickness || clamp((R * 0.62) / nR - gap / 2, 6, 20);
      this._geo = { cx: w / 2, cy: h / 2, R, th, gap, rings };
      this._base = 0;
      rings.forEach((i, k) => S('circle', { class: 'bui-chart-track', cx: w / 2, cy: h / 2, r: f(R - th / 2 - k * (th + gap)), 'stroke-width': th }, this._stat));
      const inner = R - th - (nR - 1) * (th + gap);
      if (inner > 36 && (o.centerText || nR === 1)) {
        const fs = clamp(inner * 0.4, 14, 36);
        this._cv = this._text(this._stat, w / 2, h / 2 + fs * 0.12, '', 'bui-chart-center-value', 'middle', { style: `font-size:${f(fs)}px` });
        this._cl = this._text(this._stat, w / 2, h / 2 + fs * 0.12 + Math.max(14, fs * 0.5), '', 'bui-chart-center-label');
      } else { this._cv = null; this._cl = null; }
    }
    _drawRadial(p, initial) {
      const st = this.state, g = this._geo, d = st.ds[0], sgn = this._rtl ? -1 : 1, [lo, hi] = this._range;
      const vals = this._vals(0, p, initial), items = [];
      g.rings.forEach((i, k) => {
        const v = d.data[i], cur = initial ? v : vals[i];
        const fr = clamp((cur - lo) / ((hi - lo) || 1), 0, 1) * (initial ? p : 1);
        const r = g.R - g.th / 2 - k * (g.th + g.gap), dd = arcLine(g.cx, g.cy, r, -Math.PI / 2, sgn, fr);
        if (dd) S('path', { class: 'bui-chart-ring', d: dd, 'stroke-width': g.th, style: `stroke:${d.colors[i]}`, 'data-i': i }, this._dataG);
        items.push({ i, label: st.labels[i], value: v, color: d.colors[i], text: this._fmtPct(v) });
      });
      this._hit = { kind: 'slice', ring: true, items };
      if (this._cv) {
        const ct = isObj(this.options.centerText) ? this.options.centerText : {};
        if (g.rings.length === 1 && !this.options.centerText) { this._cv.textContent = this._fmtPct(d.data[g.rings[0]]); this._cl.textContent = st.labels[g.rings[0]]; }
        else { this._cv.textContent = ct.value == null ? '' : String(ct.value); this._cl.textContent = ct.label == null ? '' : ct.label; }
      }
    }

    /* ================= Gauge ================= */
    _layGauge() {
      const o = this.options, w = this._w, h = this._h;
      const lo = o.min == null ? 0 : o.min, hi = o.max == null ? 100 : o.max;
      this._range = [lo, hi];
      const th = o.thickness || clamp(Math.min(w, h * 2) * 0.07, 10, 26);
      const cy = h - (o.showLabels ? 30 : 16), R = Math.max(30, Math.min(w / 2 - th / 2 - 10, cy - th / 2 - 10)), cx = w / 2;
      this._geo = { cx, cy, R, th, lo, hi };
      this._base = lo;
      const ang = (fr) => Math.PI + (this._rtl ? 1 - fr : fr) * Math.PI;
      this._ang = ang;
      const seg = (a, b, cls, style) => {
        const x0 = polar(cx, cy, R, ang(a)), x1 = polar(cx, cy, R, ang(b));
        const lead = this._rtl ? [x1, x0] : [x0, x1];
        return S('path', { class: cls, d: `M${P(...lead[0])}A${f(R)} ${f(R)} 0 0 1 ${P(...lead[1])}`, 'stroke-width': th, style }, this._stat);
      };
      const th_ = Array.isArray(o.thresholds) ? o.thresholds.filter((t) => isObj(t) && num(t.to) !== null).sort((a, b) => a.to - b.to) : [];
      if (th_.length) {
        let prev = lo;
        th_.forEach((t, i) => { const a = clamp((prev - lo) / ((hi - lo) || 1), 0, 1), b = clamp((t.to - lo) / ((hi - lo) || 1), 0, 1); if (b > a) seg(a, b, `bui-chart-seg${i === 0 ? ' is-first' : ''}`, `stroke:${t.color || PALETTE[i % 8]}`); prev = t.to; });
        this._thr = th_;
      } else { seg(0, 1, 'bui-chart-track', null); this._thr = null; }
      if (o.showLabels) {
        const f1 = this._fmt;
        this._text(this._stat, cx - R, cy + th / 2 + 16, f1(this._rtl ? hi : lo), 'bui-chart-tick');
        this._text(this._stat, cx + R, cy + th / 2 + 16, f1(this._rtl ? lo : hi), 'bui-chart-tick');
      }
      const fs = clamp(R * 0.4, 18, 40);
      this._cv = this._text(this._stat, cx, cy - R * 0.18, '', 'bui-chart-center-value', 'middle', { style: `font-size:${f(fs)}px` });
      this._cl = this._text(this._stat, cx, cy - R * 0.18 + 20, '', 'bui-chart-center-label');
    }
    _drawGauge(p, initial) {
      const st = this.state, g = this._geo, d = st.ds[0], v = d.data[0] === null ? g.lo : d.data[0];
      const from = this._from && this._from[0] && this._from[0][0] != null ? this._from[0][0] : g.lo;
      const cur = initial ? lerp(g.lo, v, p) : lerp(from, v, p);
      const fr = clamp((cur - g.lo) / ((g.hi - g.lo) || 1), 0, 1), a = this._ang(fr);
      if (this._thr) {
        const [mx, my] = polar(g.cx, g.cy, g.R, a);
        S('circle', { class: 'bui-chart-hub', cx: f(mx), cy: f(my), r: f(g.th / 2 + 2) }, this._dataG);
      } else {
        const dd = fr > 0.002 ? `M${P(...polar(g.cx, g.cy, g.R, ang0(this._rtl)))}A${f(g.R)} ${f(g.R)} 0 0 ${this._rtl ? 0 : 1} ${P(...polar(g.cx, g.cy, g.R, a))}` : '';
        if (dd) S('path', { class: 'bui-chart-ring', d: dd, 'stroke-width': g.th, style: `stroke:${d.color}` }, this._dataG);
      }
      const color = this._thr ? (this._thr.find((t) => v <= t.to) || this._thr[this._thr.length - 1]).color : null;
      this._cv.textContent = this._fmt(v);
      if (color) this._cv.style.fill = color; else this._cv.style.fill = '';
      this._cl.textContent = d.label;
      this._hit = { kind: 'none' };
    }

    /* ================= Radar ================= */
    _layRadar() {
      const o = this.options, st = this.state, w = this._w, h = this._h, n = st.n, sgn = this._rtl ? -1 : 1;
      let lo = Infinity, hi = -Infinity;
      st.ds.forEach((d, i) => { if (this._visible(i)) d.data.forEach((v) => { if (v !== null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }); });
      if (lo === Infinity) { lo = 0; hi = 1; }
      const sc = niceScale(Math.min(0, lo), Math.max(hi, 0), 5, o.min, o.max);
      const R = Math.max(30, Math.min(w, h) / 2 - (o.showLabels ? 44 : 14)), cx = w / 2, cy = h / 2;
      this._geo = { sc, R, cx, cy, n };
      this._base = sc.lo;
      const ang = (j) => -Math.PI / 2 + sgn * (j / n) * Math.PI * 2;
      this._ang = ang;
      const ring = (fr) => Array.from({ length: n }, (_, j) => P(...polar(cx, cy, R * fr, ang(j)))).join('L');
      if (o.showGrid) sc.ticks.slice(1).forEach((v) => S('path', { class: 'bui-chart-grid', d: `M${ring((v - sc.lo) / (sc.hi - sc.lo))}Z` }, this._stat));
      if (o.showGrid) for (let j = 0; j < n; j++) S('line', { class: 'bui-chart-grid', x1: cx, y1: cy, x2: f(polar(cx, cy, R, ang(j))[0]), y2: f(polar(cx, cy, R, ang(j))[1]) }, this._stat);
      if (o.showLabels) {
        const af = this._axisFmt(sc, o.format);
        sc.ticks.slice(1).forEach((v) => this._text(this._stat, cx + 4, cy - R * ((v - sc.lo) / (sc.hi - sc.lo)) + 3, af(v), 'bui-chart-tick bui-chart-tick-small', 'start'));
        st.labels.forEach((l, j) => {
          const [x, y] = polar(cx, cy, R + 16, ang(j)), c = Math.cos(ang(j));
          this._text(this._stat, x, y + 4, trunc(l, 16), 'bui-chart-tick', Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end');
        });
      }
    }
    _drawRadar(p) {
      const st = this.state, g = this._geo, o = this.options, pts = [];
      st.ds.forEach((d, i) => {
        if (!this._visible(i)) return;
        const vals = this._vals(i, p, false);
        const poly = vals.map((v, j) => { const r = g.R * clamp(((v === null ? g.sc.lo : v) - g.sc.lo) / ((g.sc.hi - g.sc.lo) || 1), 0, 1); return { x: polar(g.cx, g.cy, r, this._ang(j))[0], y: polar(g.cx, g.cy, r, this._ang(j))[1] }; });
        const dd = poly.map((q) => P(q.x, q.y)).join('L');
        S('path', { class: 'bui-chart-radar-area', d: `M${dd}Z`, style: `fill:${d.color};stroke:${d.color}` }, this._dataG);
        if (d.points ?? o.points ?? true) poly.forEach((q) => S('circle', { class: 'bui-chart-point', cx: f(q.x), cy: f(q.y), r: 3.5, style: `fill:${d.color};stroke:var(--bui-chart-surface)` }, this._dataG));
        pts.push({ i, poly });
      });
      this._hit = { kind: 'radar', n: g.n };
    }

    /* ================= Scatter ================= */
    _layScatter() {
      const o = this.options, st = this.state, w = this._w, h = this._h, rtl = this._rtl;
      const X = [Infinity, -Infinity], Y = [Infinity, -Infinity];
      st.ds.forEach((d, i) => { if (this._visible(i)) d.data.forEach((q) => { X[0] = Math.min(X[0], q.x); X[1] = Math.max(X[1], q.x); Y[0] = Math.min(Y[0], q.y); Y[1] = Math.max(Y[1], q.y); }); });
      if (X[0] === Infinity) { X[0] = 0; X[1] = 1; Y[0] = 0; Y[1] = 1; }
      const sy = niceScale(Y[0], Y[1], clamp(Math.floor((h - 80) / 48), 3, 7), o.min, o.max), sx = niceScale(X[0], X[1], clamp(Math.floor(w / 90), 3, 8));
      const fy = this._axisFmt(sy, o.format), fx = o.formatX ? makeFormatter(o.formatX, this._loc) : this._axisFmt(sx, 'number');
      const labels = o.showLabels, ty = sy.ticks.map(fy);
      const lw = labels ? Math.max(...ty.map((s) => s.length), 1) * 6.4 + 14 : 0, yt = o.yTitle ? 18 : 0, xt = o.xTitle ? 18 : 0;
      const mL = Math.max(rtl ? 12 : lw + yt, 10), mR = Math.max(rtl ? lw + yt : 14, 10);
      const x0 = mL, x1 = Math.max(mL + 40, w - mR), y0 = 14, y1 = Math.max(y0 + 40, h - (labels ? 30 : 10) - xt), pw = x1 - x0, ph = y1 - y0;
      const gx = (v) => { const fr = (v - sx.lo) / ((sx.hi - sx.lo) || 1); return rtl ? x1 - fr * pw : x0 + fr * pw; }, gy = (v) => y1 - ((v - sy.lo) / ((sy.hi - sy.lo) || 1)) * ph;
      this._geo = { x0, x1, y0, y1, gx, gy, pw, ph };
      this._base = 0;
      const cid = `${this._uid}-clip`;
      S('rect', { x: x0 - 14, y: y0 - 14, width: pw + 28, height: ph + 28 }, S('clipPath', { id: cid }, this._defs));
      this._dataG.setAttribute('clip-path', `url(#${cid})`);
      const sg = this._stat;
      sy.ticks.forEach((v, k) => {
        if (o.showGrid) S('line', { class: 'bui-chart-grid', x1: x0, x2: x1, y1: gy(v), y2: gy(v) }, sg);
        if (labels) this._text(sg, rtl ? x1 + 8 : x0 - 8, gy(v) + 3.5, ty[k], 'bui-chart-tick', rtl ? 'start' : 'end');
      });
      sx.ticks.forEach((v) => {
        if (o.showGrid) S('line', { class: 'bui-chart-grid', x1: gx(v), x2: gx(v), y1: y0, y2: y1 }, sg);
        if (labels) this._text(sg, gx(v), y1 + 18, fx(v), 'bui-chart-tick');
      });
      S('line', { class: 'bui-chart-axis', x1: x0, x2: x1, y1: y1, y2: y1 }, sg);
      if (o.xTitle) this._text(sg, (x0 + x1) / 2, h - 6, o.xTitle, 'bui-chart-title');
      if (o.yTitle) { const tx = rtl ? w - 8 : 10; this._text(sg, tx, (y0 + y1) / 2, o.yTitle, 'bui-chart-title', 'middle', { transform: `rotate(-90 ${tx} ${f((y0 + y1) / 2)})` }); }
    }
    _drawScatter(p) {
      const st = this.state, g = this._geo, list = [];
      st.ds.forEach((d, i) => {
        if (!this._visible(i)) return;
        d.data.forEach((q) => {
          const r = (q.r != null ? clamp(q.r, 2, 40) : 5.5) * p, cx = g.gx(q.x), cy = g.gy(q.y);
          S('circle', { class: 'bui-chart-dot', cx: f(cx), cy: f(cy), r: f(r), style: `fill:${d.color};stroke:${d.color}` }, this._dataG);
          list.push({ i, x: cx, y: cy, q, color: d.color, r });
        });
      });
      this._hit = { kind: 'scatter', list };
    }

    /* ================= Hover, tooltip, click ================= */
    _local(e) {
      const r = this._svg.getBoundingClientRect(), k = this._w / (r.width || 1);
      return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k, bx: e.clientX - r.left, by: e.clientY - r.top };
    }
    _tip(bx, by, title, rows) {
      const t = this._tipEl;
      t.replaceChildren();
      if (title) t.append(el('div', 'bui-chart-tip-title', title));
      rows.forEach((r) => {
        const row = el('div', 'bui-chart-tip-row');
        const sw = el('span', 'bui-chart-tip-swatch'); sw.style.background = r.color;
        row.append(sw, el('span', 'bui-chart-tip-name', r.name), el('strong', 'bui-chart-tip-value', r.value));
        t.append(row);
      });
      t.hidden = false;
      const bw = this._body.clientWidth, bh = this._body.clientHeight, tw = t.offsetWidth, th = t.offsetHeight;
      let left = bx + 14;
      if (left + tw > bw - 4) left = bx - 14 - tw;
      let top = by - th - 12;
      if (top < 4) top = by + 16;
      t.style.transform = `translate(${f(clamp(left, 4, Math.max(4, bw - tw - 4)))}px,${f(clamp(top, 4, Math.max(4, bh - th - 4)))}px)`;
    }
    _clearHover() {
      if (!this._tipEl) return;
      this._tipEl.hidden = true;
      this._ovG?.replaceChildren();
      this._hov = null;
      if (this._cv && (this.type === 'pie' || this.type === 'doughnut') && this.state && !this.state.empty) this._centerText(null);
    }
    _move(e) {
      const o = this.options, hit = this._hit;
      if (!o.showTooltip || this._anim || !hit || this.state.empty) return;
      const { x, y, bx, by } = this._local(e), g = this._geo, st = this.state;
      if (hit.kind === 'cat') {
        if (x < g.x0 - 4 || x > g.x1 + 4 || y < g.y0 - 4 || y > g.y1 + 4) { this._clearHover(); return; }
        const c = hit.hor ? y : x;
        let best = 0, bd = Infinity;
        hit.cats.forEach((q, j) => { const dd = Math.abs(q.pos - c); if (dd < bd) { bd = dd; best = j; } });
        const cat = hit.cats[best];
        if (!cat.rows.length) { this._clearHover(); return; }
        this._hov = { index: best };
        const ov = this._ovG; ov.replaceChildren();
        const hasBars = cat.rows.some((r) => !r.line);
        if (hasBars) S('rect', hit.hor ? { class: 'bui-chart-band', x: g.x0, y: f(cat.pos - hit.band / 2), width: g.pw, height: f(hit.band) } : { class: 'bui-chart-band', x: f(cat.pos - hit.band / 2), y: g.y0, width: f(hit.band), height: g.ph }, ov);
        else S('line', { class: 'bui-chart-guide', x1: f(cat.pos), x2: f(cat.pos), y1: g.y0, y2: g.y1 }, ov);
        cat.rows.forEach((r) => { if (r.line) S('circle', { class: 'bui-chart-hdot', cx: f(cat.pos), cy: f(r.y), r: 5.5, style: `fill:${r.color}` }, ov); });
        const rows = cat.rows.map((r) => ({ name: st.ds[r.i].label, color: r.color, value: g.fm[st.ds[r.i].axis](r.v, { dataset: st.ds[r.i], index: best }) }));
        if (hit.stacked && rows.length > 1) { const tot = cat.rows.filter((r) => st.ds[r.i].axis === 'left').reduce((a, r) => a + r.v, 0); rows.push({ name: 'Total', color: 'transparent', value: g.fm.left(tot) }); }
        this._tip(bx, by, st.labels[best], rows);
      } else if (hit.kind === 'scatter') {
        let best = null, bd = 32 * 32;
        hit.list.forEach((q) => { const dd = (q.x - x) ** 2 + (q.y - y) ** 2; if (dd < bd) { bd = dd; best = q; } });
        const ov = this._ovG; ov.replaceChildren();
        if (!best) { this._tipEl.hidden = true; return; }
        this._hov = { index: best.i, point: best.q };
        S('circle', { class: 'bui-chart-hdot', cx: f(best.x), cy: f(best.y), r: f(best.r + 3), style: `fill:none;stroke:${best.color};stroke-width:2` }, ov);
        const fx = this.options.formatX ? makeFormatter(this.options.formatX, this._loc) : makeFormatter('number', this._loc);
        this._tip(bx, by, st.ds[best.i].label, [{ name: 'x', color: best.color, value: fx(best.q.x) }, { name: 'y', color: best.color, value: this._fmt(best.q.y) }].concat(best.q.r != null ? [{ name: 'size', color: best.color, value: String(best.q.r) }] : []));
      } else if (hit.kind === 'radar') {
        let a = Math.atan2(y - g.cy, x - g.cx) + Math.PI / 2;
        if (this._rtl) a = -a;
        const j = Math.round((((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * g.n) % g.n;
        const ov = this._ovG; ov.replaceChildren();
        const [ex, ey] = polar(g.cx, g.cy, g.R, this._ang(j));
        S('line', { class: 'bui-chart-guide', x1: f(g.cx), y1: f(g.cy), x2: f(ex), y2: f(ey) }, ov);
        this._hov = { index: j };
        const rows = st.ds.map((d, i) => ({ d, i })).filter(({ d, i }) => this._visible(i) && d.data[j] !== null).map(({ d }) => ({ name: d.label, color: d.color, value: this._fmt(d.data[j]) }));
        this._tip(bx, by, st.labels[j], rows);
      } else if (hit.kind === 'slice') {
        const node = e.target.closest ? e.target.closest('[data-i]') : null;
        if (!node) { this._clearHover(); return; }
        const it = hit.items.find((q) => q.i === +node.getAttribute('data-i'));
        if (!it) return;
        this._hov = { index: it.i };
        if (hit.ring) this._tip(bx, by, it.label, [{ name: 'Progress', color: it.color, value: it.text }]);
        else {
          const pct = new Intl.NumberFormat(this._loc, { style: 'percent', maximumFractionDigits: 1 }).format(it.pct);
          this._tip(bx, by, it.label, [{ name: pct, color: it.color, value: this._fmt(it.value) }]);
          this._centerText(it.i);
        }
      }
    }
    _click(e) {
      if (!this._hov || this.destroyed) return;
      const i = this._hov.index, st = this.state;
      this.el.dispatchEvent(new CustomEvent('bui:chart-click', { bubbles: true, detail: { chart: this, index: i, label: st.labels[i], point: this._hov.point } }));
    }
  }
  const ang0 = (rtl) => (rtl ? 2 * Math.PI : Math.PI);

  /* ---------- Public namespace ---------- */
  function init(root = document) {
    const list = root.matches && root.matches('[data-bui-chart]') ? [root] : [];
    root.querySelectorAll && root.querySelectorAll('[data-bui-chart]').forEach((n) => list.push(n));
    return list.filter((n) => !instances.has(n)).map((n) => new BasetChart(n));
  }
  BUI.Chart = BasetChart;
  BUI.chart = { init, get: (t) => instances.get(typeof t === 'string' ? document.querySelector(t) : t) || null, defaults: DEFAULTS, palette: PALETTE, types: TYPES };
  window.BasetChart = BasetChart;

  const start = () => {
    init(document);
    if (typeof MutationObserver !== 'function') return;
    new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) init(n); }))).observe(document.body, { childList: true, subtree: true });
    /* The page switched between RTL and LTR (or the language changed): draw again, without animation */
    const redraw = () => live.forEach((c) => { if (!c.destroyed && c._rtl !== (getComputedStyle(c.el).direction === 'rtl')) c.resize(); });
    new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['dir', 'lang'] });
    new MutationObserver(redraw).observe(document.body, { attributes: true, attributeFilter: ['dir'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
