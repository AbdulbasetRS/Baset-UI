/* Baset UI — Component playground engine (documentation only)
 * Every component page has <div data-bui-playground="name"></div> as its first section. This file reads the config
 * registered under that name (assets/js/component-playground-configs.js), draws the controls, renders the live
 * preview and writes the code to copy. It is not part of the library: do not ship it in your project.
 * State lives in memory only. Needs baset-ui.js (copy button, toasts, modals, dropdowns). */
(() => {
  'use strict';
  const PG = (window.BUIPlayground = window.BUIPlayground || { configs: {} });
  PG.add = (name, config) => { PG.configs[name] = config; };

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const tag = (cls, text) => `<span class="bui-code-${cls}">${text}</span>`;
  const el = (parent, name, cls, text) => {
    const n = document.createElement(name);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.append(n);
    return n;
  };
  let uid = 0;

  /* ---------- Code coloring (same look as the static code cards) ---------- */
  function colorHTML(src) {
    const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      last = re.lastIndex;
      if (m[0].startsWith('<!--')) { out += tag('muted', esc(m[0])); continue; }
      if (m[1]) { out += tag('pink', `&lt;/${m[2]}`) + tag('pink', '&gt;'); continue; }
      let attrs = '';
      const ar = /([^\s=/>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
      let a;
      while ((a = ar.exec(m[3]))) {
        attrs += ' ' + tag('blue', esc(a[1])) + (a[2] !== undefined ? '=' + tag('green', esc(a[2])) : '');
      }
      out += tag('pink', `&lt;${m[2]}`) + attrs + tag('pink', '&gt;');
    }
    return out + esc(src.slice(last));
  }
  const JS_WORDS = new Set(['const', 'let', 'var', 'new', 'function', 'return', 'true', 'false', 'null', 'undefined', 'await', 'async', 'if', 'else', 'for', 'of', 'in']);
  function colorJS(src) {
    const re = /(\/\/[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|([A-Za-z_$][\w$]*)(\s*:)?/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      last = re.lastIndex;
      if (m[1]) out += tag('muted', esc(m[1]));
      else if (m[2]) out += tag('green', esc(m[2]));
      else if (JS_WORDS.has(m[3]) && !m[4]) out += tag('pink', m[3]);
      else if (m[4]) out += tag('blue', m[3]) + m[4];
      else out += m[3];
    }
    return out + esc(src.slice(last));
  }

  /* ---------- Controls ---------- */
  const optList = (c) => (c.opts || []).map((o) => (Array.isArray(o) ? o : [o, o]));

  function buildControl(root, c, S, onChange) {
    const id = `pg${++uid}`;
    let wrap;
    if (c.t === 'select') {
      wrap = el(null, 'div', 'bui-tp-field');
      const lab = el(wrap, 'label', null, c.label); lab.htmlFor = id;
      const sel = el(wrap, 'select', 'bui-input'); sel.id = id;
      optList(c).forEach(([v, l]) => { const o = el(sel, 'option', null, l); o.value = v; });
      sel.value = S[c.k];
      sel.addEventListener('change', () => { S[c.k] = sel.value; onChange(c.k); });
      wrap._sync = () => { sel.value = S[c.k]; };
    } else if (c.t === 'tabs') {
      wrap = el(null, 'div', 'bui-tp-field');
      el(wrap, 'div', 'bui-tp-label', c.label).id = id;
      const row = el(wrap, 'div', 'bui-gallery-tabs bui-tp-chips');
      row.setAttribute('role', 'group'); row.setAttribute('aria-labelledby', id);
      const btns = optList(c).map(([v, l]) => {
        const b = el(row, 'button', 'bui-gallery-tab', l); b.type = 'button'; b.dataset.v = v;
        b.addEventListener('click', () => { S[c.k] = v; paint(); onChange(c.k); });
        return b;
      });
      const paint = () => btns.forEach((b) => { const on = b.dataset.v === String(S[c.k]); b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
      paint(); wrap._sync = paint;
    } else if (c.t === 'check') {
      wrap = el(null, 'label', 'bui-checkline');
      const box = el(wrap, 'input'); box.type = 'checkbox'; box.checked = !!S[c.k];
      wrap.append(' ' + c.label);
      box.addEventListener('change', () => { S[c.k] = box.checked; onChange(c.k); });
      wrap._sync = () => { box.checked = !!S[c.k]; };
      wrap._check = true;
    } else if (c.t === 'range') {
      wrap = el(null, 'div', 'bui-tp-slider');
      const head = el(wrap, 'div');
      const lab = el(head, 'span', null, c.label); lab.id = id;
      const out = el(el(head, 'code'), 'span');
      const r = el(wrap, 'input'); r.type = 'range'; r.min = c.min; r.max = c.max; r.step = c.step || 1;
      r.setAttribute('aria-labelledby', id);
      const fmt = () => { out.textContent = (c.fmt ? c.fmt(Number(S[c.k])) : S[c.k]) + (c.unit || ''); };
      r.value = S[c.k]; fmt();
      r.addEventListener('input', () => { S[c.k] = Number(r.value); fmt(); onChange(c.k); });
      wrap._sync = () => { r.value = S[c.k]; fmt(); };
    } else { // text
      wrap = el(null, 'div', 'bui-tp-field');
      const lab = el(wrap, 'label', null, c.label); lab.htmlFor = id;
      const inp = el(wrap, 'input', 'bui-input'); inp.id = id; inp.type = 'text'; inp.value = S[c.k]; inp.spellcheck = false;
      inp.addEventListener('input', () => { S[c.k] = inp.value; onChange(c.k); });
      wrap._sync = () => { inp.value = S[c.k]; };
    }
    root.append(wrap);
    return wrap;
  }

  /* ---------- One playground ---------- */
  function mountPlayground(host) {
    const name = host.dataset.buiPlayground;
    const cfg = PG.configs[name];
    if (!cfg) { host.textContent = `Playground "${name}" is not configured.`; return; }
    const controls = cfg.controls || [];
    const DEF = Object.fromEntries(controls.map((c) => [c.k, c.v]));
    const S = { ...DEF };
    const view = { mode: 'auto', dir: 'auto' };
    let tab = null, raf = 0;

    host.classList.add('bui-tp', 'bui-pg');

    /* Panel */
    const panel = el(host, 'aside', 'bui-tp-panel'); panel.setAttribute('aria-label', 'Customize options');
    const groups = new Map(), wraps = [];
    controls.forEach((c) => {
      const g = c.group || 'Options';
      if (!groups.has(g)) { const box = el(panel, 'div', 'bui-tp-group'); el(box, 'h3', null, g); groups.set(g, { box, checks: null }); }
      const G = groups.get(g);
      let target = G.box;
      if (c.t === 'check') { if (!G.checks) G.checks = el(G.box, 'div', 'bui-tp-checks'); target = G.checks; } else G.checks = null;
      const w = buildControl(target, c, S, () => schedule());
      w._c = c; wraps.push(w);
    });
    const reset = el(panel, 'button', 'bui-btn bui-btn-outline', 'Reset all'); reset.type = 'button';
    reset.addEventListener('click', () => { Object.assign(S, DEF); wraps.forEach((w) => w._sync()); schedule(); });

    /* Main column */
    const main = el(host, 'div', 'bui-tp-main');
    const bar = el(main, 'div', 'bui-pg-bar');
    const seg = (label, key, opts) => {
      const box = el(bar, 'div', 'bui-pg-seg');
      el(box, 'span', 'bui-pg-bar-label', label);
      const row = el(box, 'div', 'bui-gallery-tabs'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', label);
      const btns = opts.map(([v, l]) => {
        const b = el(row, 'button', 'bui-gallery-tab', l); b.type = 'button';
        b.addEventListener('click', () => { view[key] = v; paint(); applyView(); });
        return [v, b];
      });
      const paint = () => btns.forEach(([v, b]) => { const on = v === view[key]; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
      paint();
    };
    seg('Theme', 'mode', [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]);
    seg('Direction', 'dir', [['auto', 'Auto'], ['ltr', 'LTR'], ['rtl', 'RTL']]);
    (cfg.actions || []).forEach((a) => {
      const b = el(bar, 'button', 'bui-btn bui-btn-soft-primary bui-btn-sm', a.label); b.type = 'button';
      b.addEventListener('click', () => a.run(stage, S));
    });

    const stage = el(main, 'div', 'bui-tp-preview bui-pg-stage' + (cfg.stretch ? ' bui-pg-stretch' : ''));
    stage.setAttribute('role', 'region'); stage.setAttribute('aria-label', 'Live preview');
    if (cfg.stage) stage.style.cssText += cfg.stage;
    const applyView = () => {
      stage.style.colorScheme = view.mode === 'auto' ? '' : view.mode;
      if (view.dir === 'auto') { stage.removeAttribute('dir'); stage.removeAttribute('lang'); }
      else { stage.dir = view.dir; stage.lang = view.dir === 'rtl' ? 'ar' : 'en'; }
    };

    const outs = [];
    const tabsRow = el(main, 'div', 'bui-gallery-tabs'); tabsRow.setAttribute('role', 'group'); tabsRow.setAttribute('aria-label', 'Code to copy');
    const card = el(main, 'div', 'bui-code-card');
    const head = el(card, 'div', 'bui-code-head');
    const fileLabel = el(el(head, 'span'), 'span'); head.firstChild.prepend(el(null, 'i'), ' ');
    const copy = el(head, 'button', 'bui-copy', 'Copy'); copy.type = 'button';
    const pre = el(card, 'pre'), code = el(pre, 'code');
    if (cfg.note) { const p = el(main, 'p', 'bui-doc-note'); p.innerHTML = cfg.note; }

    const outputs = () => {
      const list = [];
      if (cfg.html) list.push({ id: 'html', label: 'HTML', file: 'index.html', gen: cfg.html, paint: colorHTML });
      if (cfg.js) list.push({ id: 'js', label: 'JavaScript', file: 'script.js', gen: cfg.js, paint: colorJS });
      return list;
    };
    const OUT = outputs();
    tab = (cfg.tab && OUT.some((o) => o.id === cfg.tab) ? cfg.tab : OUT[0].id);
    OUT.forEach((o) => {
      const b = el(tabsRow, 'button', 'bui-gallery-tab', o.label); b.type = 'button';
      b.addEventListener('click', () => { tab = o.id; schedule(); });
      o.btn = b;
    });
    if (OUT.length < 2) tabsRow.hidden = true;

    function render() {
      raf = 0;
      wraps.forEach((w) => { const on = !w._c.show || w._c.show(S); w.hidden = !on; });
      // a group with nothing visible is hidden too
      groups.forEach((G) => { G.box.hidden = ![...G.box.children].slice(1).some((n) => !n.hidden && (n.className !== 'bui-tp-checks' || [...n.children].some((x) => !x.hidden))); });
      const html = cfg.html ? cfg.html(S) : '';
      stage.innerHTML = cfg.preview ? cfg.preview(S) : html;
      applyView();
      try { cfg.mount && cfg.mount(stage, S); } catch (e) { console.error('[playground]', e); }
      const o = OUT.find((x) => x.id === tab) || OUT[0];
      OUT.forEach((x) => { const on = x === o; x.btn.classList.toggle('active', on); x.btn.setAttribute('aria-pressed', String(on)); });
      fileLabel.textContent = o.file;
      code.innerHTML = o.paint(o.gen(S));
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(render); }
    render();
  }

  const start = () => document.querySelectorAll('[data-bui-playground]').forEach(mountPlayground);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
