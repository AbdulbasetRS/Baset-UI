/* Baset UI — Icons gallery (documentation only). Needs: assets/icons/icons-data.js */
(() => {
  const data = window.BUI_ICONS;
  const grid = document.getElementById('iconGrid');
  if (!data || !grid) return;

  const $ = (id) => document.getElementById(id);
  const search = $('iconSearch'), catSel = $('iconCategory'), weightBox = $('iconWeights');
  const countEl = $('iconCount'), sentinel = $('iconSentinel'), dialog = $('iconDialog');
  const WEIGHTS = data.weights.map(([id, label]) => ({ id, label }));
  const CHUNK = 180;
  const SVG_BASE = (document.currentScript || document.querySelector('script[src*="icons-gallery"]'))?.src.replace(/js\/icons-gallery\.js.*$/, 'icons/svg/') || 'assets/icons/svg/';
  const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">';

  const title = (s) => s.replace(/\b\w/g, (m) => m.toUpperCase());
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const icons = data.icons.map(([n, c, t, code, dcode]) => ({ n, c, t, code, dcode, hay: (n.replace(/-/g, ' ') + ' ' + t.join(' ')).toLowerCase() }));

  let weight = 'regular';
  try { const saved = localStorage.getItem('bui-icon-weight'); if (WEIGHTS.some((w) => w.id === saved)) weight = saved; } catch { /* storage blocked */ }
  let list = icons, shown = 0;

  /* ---------- Toolbar ---------- */
  data.categories.forEach((c, i) => catSel.insertAdjacentHTML('beforeend', `<option value="${i}">${esc(title(c))}</option>`));
  weightBox.innerHTML = WEIGHTS.map((w) => `<button type="button" class="bui-btn bui-btn-sm" data-weight="${w.id}"><i class="bui-icon-${w.id} bui-icon-file"></i> ${w.label}</button>`).join('');
  function syncWeightButtons() {
    weightBox.querySelectorAll('button').forEach((b) => {
      const on = b.dataset.weight === weight;
      b.classList.toggle('bui-btn-primary', on);
      b.classList.toggle('bui-btn-ghost', !on);
      b.setAttribute('aria-pressed', on);
    });
  }
  syncWeightButtons();

  /* ---------- Grid ---------- */
  function appendChunk() {
    if (shown >= list.length) return;
    const frag = document.createDocumentFragment();
    list.slice(shown, shown + CHUNK).forEach((ic) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'bui-gallery-item'; b.dataset.name = ic.n; b.title = ic.n;
      b.innerHTML = `<i class="bui-icon-${weight} bui-icon-${ic.n}"></i><span>${ic.n}</span>`;
      frag.appendChild(b);
    });
    shown += CHUNK;
    grid.appendChild(frag);
  }

  function applyFilter() {
    const q = search.value.trim().toLowerCase(), cat = catSel.value;
    const words = q ? q.split(/\s+/) : [];
    list = icons.filter((i) => (cat === '' || i.c.includes(+cat)) && words.every((w) => i.hay.includes(w)));
    if (q) {
      const rank = (i) => (i.n === q ? 0 : i.n.startsWith(q) ? 1 : i.n.includes(q) ? 2 : 3);
      list = list.map((i, idx) => [i, idx]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map((x) => x[0]);
    }
    grid.innerHTML = ''; shown = 0;
    countEl.textContent = `${list.length} icon${list.length === 1 ? '' : 's'}`;
    if (!list.length) grid.innerHTML = '<div class="bui-gallery-empty">No icons found. Try another word, e.g. “arrow”, “user” or “file”.</div>';
    appendChunk();
  }

  let timer;
  search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(applyFilter, 120); });
  catSel.addEventListener('change', applyFilter);

  weightBox.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-weight]'); if (!b) return;
    weight = b.dataset.weight;
    try { localStorage.setItem('bui-icon-weight', weight); } catch { /* storage blocked */ }
    grid.querySelectorAll('.bui-gallery-item').forEach((el) => { el.firstChild.className = `bui-icon-${weight} bui-icon-${el.dataset.name}`; });
    syncWeightButtons();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((en) => { if (en[0].isIntersecting) appendChunk(); }, { rootMargin: '700px' }).observe(sentinel);
  } else { while (shown < list.length) appendChunk(); }

  /* ---------- SVG data (lazy, loaded per style as <script>, works on file://) ---------- */
  const svgLoading = {};
  function loadSvg(w) {
    window.BUI_SVG = window.BUI_SVG || {};
    if (window.BUI_SVG[w]) return Promise.resolve();
    return (svgLoading[w] ||= new Promise((res) => {
      const s = document.createElement('script');
      s.src = `${SVG_BASE}${w}.js`; s.onload = () => res(); s.onerror = () => res();
      document.head.appendChild(s);
    }));
  }
  const svgInner = (w, n) => window.BUI_SVG?.[w]?.[n];
  const svgFull = (w, n) => { const inner = svgInner(w, n); return inner == null ? null : SVG_OPEN + inner + '</svg>'; };
  function svgPretty(w, n) {
    const inner = svgInner(w, n); if (inner == null) return null;
    return [SVG_OPEN, ...(inner.match(/<[^>]+>/g) || []).map((t) => '  ' + t), '</svg>'].join('\n');
  }

  /* ---------- Tiny highlighter (same colors as the docs code cards) ---------- */
  function hl(code) {
    return code.split('\n').map((line) => line.replace(/<\/?[A-Za-z][^>]*>/g, (tag) => {
      const m = /^<(\/?[A-Za-z][\w-]*)([\s\S]*?)(\/?)>$/.exec(tag);
      const attrs = m[2].replace(/([\w:-]+)(?:=("[^"]*"))?/g, (a, n, v) => `<span class="bui-code-blue">${n}</span>` + (v ? `=<span class="bui-code-green">${esc(v)}</span>` : ''));
      return `<span class="bui-code-pink">&lt;${m[1]}</span>${attrs}<span class="bui-code-pink">${m[3]}&gt;</span>`;
    })).join('\n');
  }
  const plainHl = (code) => esc(code).replace(/(\/\*.*?\*\/)/g, '<span class="bui-code-muted">$1</span>').replace(/(&quot;[^&]*&quot;|"[^"]*")/g, '<span class="bui-code-green">$1</span>');

  /* ---------- Details dialog ---------- */
  const state = { name: null, weight: 'regular', tab: 'html', size: 72 };
  const TABS = [['html', 'HTML'], ['svg', 'SVG'], ['css', 'CSS']];

  dialog.innerHTML = `
    <div class="bui-gallery-card">
      <div class="bui-gallery-head">
        <div><h3 id="imName"></h3><div class="bui-gallery-chips" id="imChips"></div></div>
        <div class="bui-gallery-nav">
          <button type="button" class="bui-icon-btn" id="imPrev" aria-label="Previous icon"><i class="bui-icon-bold bui-icon-caret-left"></i></button>
          <button type="button" class="bui-icon-btn" id="imNext" aria-label="Next icon"><i class="bui-icon-bold bui-icon-caret-right"></i></button>
          <button type="button" class="bui-icon-btn" id="imClose" aria-label="Close"><i class="bui-icon-bold bui-icon-x"></i></button>
        </div>
      </div>
      <div class="bui-gallery-body">
        <div>
          <div class="bui-gallery-preview" id="imBig"></div>
          <label class="bui-gallery-size">Size <input type="range" id="imSize" min="16" max="128" value="72"><output id="imSizeOut">72px</output></label>
        </div>
        <div class="bui-gallery-main">
          <div class="bui-gallery-label">Style</div>
          <div class="bui-gallery-styles" id="imStyles"></div>
          <div class="bui-gallery-label">Code</div>
          <div class="bui-gallery-tabs" id="imTabs"></div>
          <div id="imCode"></div>
          <div class="bui-gallery-actions">
            <button type="button" class="bui-copy" id="imCopyName">Copy name</button>
            <button type="button" class="bui-btn bui-btn-outline bui-btn-sm" id="imDownload"><i class="bui-icon-bold bui-icon-download-simple"></i> Download SVG</button>
          </div>
        </div>
      </div>
    </div>`;
  const el = (id) => $(id);

  function renderDialog() {
    const ic = icons.find((i) => i.n === state.name); if (!ic) return;
    const { name: n, weight: w } = state;
    el('imName').textContent = n;
    el('imChips').innerHTML = ic.c.map((c) => `<span class="bui-badge bui-badge-primary">${esc(title(data.categories[c]))}</span>`).join('') +
      ic.t.slice(0, 6).map((t) => `<span class="bui-badge bui-badge-neutral">${esc(t)}</span>`).join('');
    el('imBig').innerHTML = `<i class="bui-icon-${w} bui-icon-${n}" style="font-size:${state.size}px"></i>`;
    el('imStyles').innerHTML = WEIGHTS.map((x) => `<button type="button" class="bui-gallery-style${x.id === w ? ' active' : ''}" data-w="${x.id}" aria-pressed="${x.id === w}"><i class="bui-icon-${x.id} bui-icon-${n}"></i><span>${x.label}</span></button>`).join('');
    el('imTabs').innerHTML = TABS.map(([id, l]) => `<button type="button" class="bui-gallery-tab${id === state.tab ? ' active' : ''}" data-tab="${id}">${l}</button>`).join('');
    el('imCopyName').dataset.copy = n;
    renderCode(ic);
    el('imDownload').disabled = svgInner(w, n) == null;
  }

  function renderCode(ic) {
    const { name: n, weight: w, tab } = state;
    let label, body;
    if (tab === 'html') {
      label = 'HTML'; body = hl(`<i class="bui-icon-${w} bui-icon-${n}"></i>`);
    } else if (tab === 'svg') {
      label = 'SVG';
      const s = svgPretty(w, n);
      body = s == null ? 'Loading SVG…' : hl(s);
    } else {
      label = 'CSS';
      const fam = `Baset Icons ${WEIGHTS.find((x) => x.id === w).label}`;
      const css = w === 'duotone' && ic.dcode
        ? `.my-icon { font-family: "${fam}"; }\n.my-icon::before { content: "\\${ic.code}"; opacity: .2; }\n.my-icon::after { content: "\\${ic.dcode}"; margin-inline-start: -1em; }`
        : `.my-icon::before {\n  font-family: "${fam}";\n  content: "\\${ic.code}";\n}`;
      body = plainHl(css);
    }
    el('imCode').innerHTML = `<div class="bui-code-card"><div class="bui-code-head"><span><i></i> ${label}</span><button class="bui-copy" type="button">Copy</button></div><pre><code>${body}</code></pre></div>`;
  }

  async function openIcon(name, w) {
    state.name = name; state.weight = w || weight;
    renderDialog();
    if (!dialog.open) { dialog.showModal(); document.body.style.overflow = 'hidden'; }
    await Promise.all(WEIGHTS.map((x) => loadSvg(x.id)));
    if (state.name === name) renderDialog();
  }
  function step(dir) {
    const i = list.findIndex((x) => x.n === state.name);
    const base = i < 0 ? 0 : i;
    const next = list[(base + dir + list.length) % list.length];
    if (next) openIcon(next.n, state.weight);
  }

  grid.addEventListener('click', (e) => { const b = e.target.closest('.bui-gallery-item'); if (b) openIcon(b.dataset.name); });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) return dialog.close();
    const t = e.target.closest('button'); if (!t) return;
    if (t.id === 'imClose') dialog.close();
    else if (t.id === 'imPrev') step(-1);
    else if (t.id === 'imNext') step(1);
    else if (t.dataset.w) { state.weight = t.dataset.w; renderDialog(); }
    else if (t.dataset.tab) { state.tab = t.dataset.tab; renderDialog(); }
    else if (t.id === 'imDownload') {
      const svg = svgFull(state.weight, state.name); if (!svg) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      a.download = `${state.name}${state.weight === 'regular' ? '' : '-' + state.weight}.svg`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
    }
  });
  dialog.addEventListener('input', (e) => {
    if (e.target.id !== 'imSize') return;
    state.size = +e.target.value; el('imSizeOut').textContent = state.size + 'px';
    const big = el('imBig').firstChild; if (big) big.style.fontSize = state.size + 'px';
  });
  // Listen on document: re-rendering the dialog can move focus out of it
  document.addEventListener('keydown', (e) => {
    if (!dialog.open || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft') step(document.dir === 'rtl' ? 1 : -1);
    if (e.key === 'ArrowRight') step(document.dir === 'rtl' ? -1 : 1);
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });

  applyFilter();
})();
