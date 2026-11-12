/* Baset UI — DataTable playground (documentation only; do not ship it).
 * Turn DataTable features on and off from a panel; the table is rebuilt and the generated code lists only
 * what differs from the library defaults. Needs baset-datatable.js and datatable-docs.js (sample data).
 * Keeps all state in memory; nothing is stored. */
(() => {
  const host = document.getElementById('dpTable');
  if (!host || !window.BUI?.dataTable || !window.BUIDocs) return;
  const $ = (id) => document.getElementById(id);
  const preview = $('dpPreview');
  const users = BUIDocs.users;

  /* ---------- Columns (one source for the live table and the generated code) ---------- */
  const roles = ['Frontend Developer', 'Backend Developer', 'UI Designer', 'QA Engineer', 'Product Manager', 'Support Agent', 'Data Analyst', 'DevOps Engineer'];
  const departments = ['Engineering', 'Design', 'Product', 'Support', 'Marketing', 'Operations'];
  const countries = ['Egypt', 'Jordan', 'France', 'Japan', 'Brazil', 'India', 'Kenya', 'Germany'];
  const statuses = ['active', 'away', 'offline'];
  const money = (v, type) => (type === 'display' ? '$' + Number(v).toLocaleString('en-US') : v);
  const badge = (v, type) => (type === 'display' ? `<span class="bui-badge bui-badge-${v === 'active' ? 'success' : v === 'away' ? 'warning' : 'secondary'}">${v}</span>` : v);
  const COLS = [
    { data: 'name', title: 'Name', required: true },
    { data: 'email', title: 'Email', editor: { type: 'email' } },
    { data: 'role', title: 'Role', list: 'roles' },
    { data: 'department', title: 'Department', list: 'departments' },
    { data: 'country', title: 'Country', list: 'countries' },
    { data: 'salary', title: 'Salary', type: 'num', editor: { type: 'number' }, render: money },
    { data: 'joined', title: 'Joined', type: 'date', editor: { type: 'date' } },
    { data: 'status', title: 'Status', list: 'statuses', render: badge },
  ];
  const LISTS = { roles, departments, countries, statuses };

  /* ---------- Profile modal (optional "view" content) ---------- */
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const profile = (u) => `<div style="display:flex;gap:14px;align-items:center">
  <img src="${esc(u.avatar)}" alt="" width="64" height="64" style="border-radius:50%">
  <div><strong>${esc(u.name)}</strong><br>${esc(u.role)} · ${esc(u.department)}<br>${esc(u.email)}</div>
</div>
<p>${esc(u.description)}</p>`;

  /* ---------- Controls ---------- */
  const T = (k, label, opts, init, extra) => ({ k, label, t: 'tabs', opts, init, ...extra });
  const S = (k, label, opts, init, extra) => ({ k, label, t: 'select', opts, init, ...extra });
  const B = (k, label, init, extra) => ({ k, label, t: 'bool', init, ...extra });
  const hasSel = (s) => s.select !== 'none';
  const GROUPS = [
    { title: 'Preview and data', open: true, items: [
      T('dir', 'Direction', [['ltr', 'LTR'], ['rtl', 'RTL']], 'ltr', { key: 'dir' }),
      T('theme', 'Theme', [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], 'auto', { key: 'theme' }),
      T('lang', 'Language', [['en', 'English'], ['ar', 'العربية']], 'en', { key: 'language' }),
      T('source', 'Data', [['client', 'In the browser'], ['server', 'Server-side (API)']], 'client', { key: 'serverSide' }),
      { k: 'rows', label: 'Rows in the demo data', t: 'range', min: 5, max: 96, step: 1, init: 96 },
    ] },
    { title: 'Pagination and info', open: true, items: [
      B('pagination', 'Pagination', true, { key: 'pagination' }),
      S('paginationType', 'Pager style', ['numbers', 'simple', 'full_numbers', 'compact', 'first_last'].map((x) => [x, x]), 'numbers', { key: 'paginationType', dep: (s) => s.pagination }),
      S('pageLength', 'Rows per page', [5, 10, 25, 50, 100].map((x) => [x, String(x)]), 5, { key: 'pageLength', num: true, dep: (s) => s.pagination }),
      B('showLength', 'Rows-per-page control', true, { key: 'showLength', dep: (s) => s.pagination }),
      B('lengthInput', '…with a custom-number input', false, { key: 'lengthInput', dep: (s) => s.pagination && s.showLength }),
      B('pageJump', 'Go-to-page box', false, { key: 'pageJump', dep: (s) => s.pagination }),
      B('showInfo', '"Showing 1 to 5 of 96 entries"', true, { key: 'showInfo' }),
    ] },
    { title: 'Search, sort and filter', open: true, items: [
      B('searching', 'Global search box', true, { key: 'searching' }),
      B('searchHighlight', 'Highlight matches', true, { key: 'searchHighlight', dep: (s) => s.searching }),
      B('ordering', 'Column sorting', true, { key: 'ordering' }),
      B('orderMulti', 'Multi-column sort (Shift + click)', true, { key: 'orderMulti', dep: (s) => s.ordering }),
      B('columnSearch', 'Search box under each header', false, { key: 'columnSearch' }),
      B('filters', 'Filters panel', false, { key: 'filters' }),
      B('searchBuilder', 'Search builder', false, { key: 'searchBuilder' }),
    ] },
    { title: 'Columns and layout', items: [
      { k: 'cols', label: 'Visible columns', t: 'cols' },
      B('colReorder', 'Drag headers to reorder', false, { key: 'colReorder' }),
      B('colResize', 'Drag edges to resize', false, { key: 'colResize' }),
      S('scrollY', 'Fixed height + sticky header', [['', 'Off'], ['240px', '240px'], ['320px', '320px']], '', { key: 'scrollY' }),
      B('responsive', 'Responsive (hide columns that do not fit)', true, { key: 'responsive' }),
      S('cardView', 'Card view on small screens', [['auto', 'auto'], ['always', 'always'], ['never', 'never']], 'auto', { key: 'cardView', dep: (s) => s.responsive }),
      B('rowGroup', 'Group rows by department', false, { key: 'rowGroup' }),
    ] },
    { title: 'Selection', items: [
      S('select', 'Row selection', [['none', 'Off'], ['single', 'Single'], ['multi', 'Multiple (click)'], ['checkbox', 'Checkbox column']], 'none', { key: 'select' }),
      B('selectionToggle', 'Show / hide the checkbox column from the Columns menu', false, { key: 'selectionToggle', dep: hasSel }),
      B('bulkBar', '"N selected" bar', true, { key: 'bulkBar', dep: hasSel }),
    ] },
    { title: 'Editing and row actions', items: [
      S('editor', 'Add / edit / delete', [['off', 'Off'], ['modal', 'In a modal'], ['inline', 'Inline in the row']], 'off', { key: 'editor' }),
      S('actions', 'Actions column', [['none', 'None'], ['buttons', 'Text buttons'], ['icons', 'Icon buttons'], ['menu', 'One kebab menu'], ['dropdown', 'Icon + Actions dropdown']], 'none', { key: 'rowActions' }),
      B('profile', 'Profile modal for "View"', false, { key: 'view', dep: (s) => s.actions !== 'none' }),
    ] },
    { title: 'Toolbar buttons', items: [
      S('icons', 'Button icons', [['false', 'Text only'], ['true', 'Icon + text'], ['only', 'Icon only']], 'false', { key: 'buttonIcons' }),
      B('groupExport', 'Group exports in one "Export" menu', false, {}),
      { k: 'btns', label: 'Buttons', t: 'btns' },
    ] },
    { title: 'Appearance', items: [
      S('variant', 'Variant', [['', 'default'], ['striped', 'striped'], ['bordered', 'bordered'], ['minimal', 'minimal'], ['modern', 'modern']], '', { key: 'variant' }),
      S('density', 'Density', [['comfortable', 'comfortable'], ['compact', 'compact']], 'comfortable', { key: 'density' }),
      B('hover', 'Highlight row on hover', true, { key: 'hover' }),
    ] },
  ];
  const BTN_LIST = [['copy', 'Copy'], ['csv', 'CSV'], ['excel', 'Excel'], ['pdf', 'PDF'], ['print', 'Print'], ['json', 'JSON'], ['create', 'New'], ['colvis', 'Columns'], ['refresh', 'Refresh'], ['fullscreen', 'Full screen'], ['reset', 'Reset']];
  const EXPORTS = ['copy', 'csv', 'excel', 'pdf', 'print', 'json'];

  const INIT = {};
  GROUPS.forEach((g) => g.items.forEach((it) => { if (it.init !== undefined) INIT[it.k] = it.init; }));
  INIT.cols = COLS.map(() => true); INIT.btns = Object.fromEntries(BTN_LIST.map(([k]) => [k, false])); INIT.out = 'full';
  const state = { ...INIT, cols: INIT.cols.slice(), btns: { ...INIT.btns } };
  const reset = (patch = {}) => { Object.assign(state, INIT, { cols: INIT.cols.slice(), btns: { ...INIT.btns } }, patch); if (patch.btns) state.btns = { ...INIT.btns, ...patch.btns }; };

  const PRESETS = {
    minimal: { showLength: false, showInfo: false, searching: false, ordering: false },
    standard: { btns: { csv: true, excel: true, colvis: true } },
    everything: {
      lengthInput: true, pageJump: true, columnSearch: true, filters: true, searchBuilder: true, colReorder: true, colResize: true, rowGroup: false,
      select: 'checkbox', selectionToggle: true, bulkBar: false, editor: 'modal', actions: 'dropdown', profile: true, icons: 'only', groupExport: true, variant: 'modern',
      btns: { copy: true, csv: true, excel: true, pdf: true, print: true, json: true, create: true, colvis: true, refresh: true, fullscreen: true },
    },
  };

  /* ---------- Build the options (live objects) ---------- */
  const raw = (s) => ({ __raw: s });
  const colSpec = (c) => {
    const o = { data: c.data, title: c.title };
    if (c.type) o.type = c.type;
    if (c.list && (state.filters || state.searchBuilder)) o.filter = 'select';
    if (c.list && (state.editor !== 'off' || state.filters || state.searchBuilder)) o.options = raw(c.list);
    if (c.render) o.render = c.render;
    if (state.editor !== 'off') o.editor = c.list ? { type: 'select' } : c.required ? { required: true } : c.editor || true;
    return o;
  };
  function build() {
    const opts = []; const put = (k, v) => opts.push([k, v]);
    const s = state;
    GROUPS.forEach((g) => g.items.forEach((it) => {
      if (!it.key || ['dir', 'theme', 'lang', 'source', 'select', 'editor', 'actions', 'profile', 'icons', 'rowGroup', 'scrollY', 'cardView', 'variant', 'pageLength'].includes(it.k)) return;
      if (s[it.k] !== it.init && (!it.dep || it.dep(s))) put(it.key, s[it.k]);
    }));
    if (s.theme !== 'auto') put('theme', s.theme);
    if (s.lang === 'ar') put('language', { locale: 'ar' });
    if (s.pageLength !== 10) put('pageLength', Number(s.pageLength));
    if (s.pagination && (s.lengthInput || Number(s.pageLength) < 10)) put('lengthMenu', [5, 10, 25, 50, 100]);
    if (s.scrollY) put('scrollY', s.scrollY);
    if (s.cardView !== 'auto' && s.responsive) put('cardView', s.cardView);
    if (s.variant) put('variant', s.variant);
    if (s.density !== 'comfortable') put('density', s.density);
    if (s.rowGroup) put('rowGroup', { dataSrc: 'department' });
    if (s.select !== 'none') put('select', s.select);
    if (s.icons !== 'false') put('buttonIcons', s.icons === 'true' ? true : 'only');
    /* editor */
    if (s.editor !== 'off') {
      const e = s.editor === 'inline' ? { mode: 'inline' } : true;
      put('editor', s.source === 'server' ? { mode: s.editor, onCreate: raw('async (row) => { /* POST /api/users */ }'), onUpdate: raw('async (row) => { /* PUT /api/users/:id */ }'), onDelete: raw('async (rows) => { /* DELETE /api/users */ }') } : e);
    }
    /* actions */
    const ed = s.editor !== 'off'; const base = ed ? ['view', 'edit', 'delete'] : ['view'];
    if (s.actions === 'buttons') put('rowActions', base);
    if (s.actions === 'menu') { put('rowActions', base); put('rowActionsMode', 'menu'); }
    if (s.actions === 'icons') put('rowActions', base.map((n) => ({ name: n, icon: n === 'view' ? 'eye' : n === 'edit' ? 'edit' : 'trash', iconOnly: true })));
    if (s.actions === 'dropdown') put('rowActions', [{ name: 'view', icon: 'eye', iconOnly: true }, { name: 'actions', text: 'Actions', icon: 'dots', iconOnly: true, menu: base }]);
    if (s.actions !== 'none' && s.profile) put('view', { title: (u) => u.name, render: profile });
    /* buttons */
    const on = (k) => state.btns[k]; const list = [];
    const ex = EXPORTS.filter(on);
    if (s.groupExport && ex.length) list.push({ extend: 'collection', text: 'Export', icon: 'download', ...(s.icons === 'only' ? { iconOnly: false } : {}), className: 'bui-btn-primary', buttons: ex });
    else ex.forEach((n) => list.push(n));
    ['create', 'colvis', 'refresh', 'fullscreen', 'reset'].filter(on).forEach((n) => list.push(n));
    if (list.length) put('buttons', list);
    if (s.select !== 'none' || true) { /* keep order stable */ }
    /* columns */
    const cols = COLS.map((c, i) => ({ c, i })).filter(({ i }) => state.cols[i] || true).map(({ c, i }) => { const o = colSpec(c); if (!state.cols[i]) o.visible = false; return o; });
    const out = [];
    out.push(['data', s.source === 'server' ? null : raw('users')]);
    if (s.source === 'server') out.push(['serverSide', true], ['ajax', { url: '/api/users' }]);
    out.push(['columns', cols]);
    return out.filter(([, v]) => v !== null).concat(opts);
  }

  /* ---------- Code text ---------- */
  const q = (x) => `'${String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k));
  const dedent = (src, pad) => { const L = String(src).split('\n'); if (L.length === 1) return L[0]; const ind = Math.min(...L.slice(1).filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return L.map((l, i) => (i ? pad + l.slice(Math.min(ind, l.match(/^ */)[0].length)) : l)).join('\n'); };
  function lit(v, pad = '') {
    if (v && v.__raw !== undefined) return v.__raw;
    if (typeof v === 'function') return dedent(v, pad);
    if (typeof v === 'string') return q(v);
    if (v === null || typeof v !== 'object') return String(v);
    const hasFn = (x) => typeof x === 'function' || (x && typeof x === 'object' && Object.values(x).some(hasFn));
    if (Array.isArray(v)) {
      const items = v.map((x) => lit(x, pad + '  ')); const one = '[' + items.join(', ') + ']';
      if (one.length < 78 && !one.includes('\n')) return one;
      return '[\n' + items.map((x) => pad + '  ' + x + ',').join('\n') + '\n' + pad + ']';
    }
    const ents = Object.entries(v).map(([k, x]) => `${key(k)}: ${lit(x, pad + '  ')}`); const one = '{ ' + ents.join(', ') + ' }';
    if (one.length < 90 && !one.includes('\n') && !hasFn(v)) return one;
    return '{\n' + ents.map((x) => pad + '  ' + x + ',').join('\n') + '\n' + pad + '}';
  }
  const listsNeeded = (o) => { const t = JSON.stringify(o.filter(([k]) => k === 'columns').map(([, v]) => v.map((c) => c.options && c.options.__raw))); return Object.keys(LISTS).filter((n) => t.includes('"' + n + '"')); };
  function optionsOnly(entries, pad = '') { return '{\n' + entries.map(([k, v]) => `${pad}  ${key(k)}: ${lit(v, pad + '  ')},`).join('\n') + '\n' + pad + '}'; }
  function fullCode(entries) {
    const needs = listsNeeded(entries); const usesProfile = entries.some(([k]) => k === 'view'); const usesMoney = JSON.stringify(entries.filter(([k]) => k === 'columns')).length >= 0;
    const lines = [];
    lines.push('<link rel="stylesheet" href="assets/css/baset-ui.css">', '<script src="assets/js/baset-datatable.js"></script>', '', `<div id="users"${state.dir === 'rtl' ? ' dir="rtl"' : ''}></div>`, '', '<script>');
    if (state.source === 'client') lines.push('  const users = [ /* your rows: [{ id: 1, name: \'Sara\', ... }] */ ];', '');
    needs.forEach((n) => lines.push(`  const ${n} = ${lit(LISTS[n], '  ')};`));
    if (needs.length) lines.push('');
    const usesRender = (n) => entries.some(([k, v]) => k === 'columns' && v.some((c) => c.render === n));
    if (usesRender(money)) lines.push('  const money = ' + dedent(money, '  ') + ';');
    if (usesRender(badge)) lines.push('  const badge = ' + dedent(badge, '  ') + ';');
    if (usesProfile) lines.push('  const esc = ' + dedent(esc, '  ') + ';', '  const profile = ' + dedent(profile, '  ') + ';');
    if (usesRender(money) || usesRender(badge) || usesProfile) lines.push('');
    // show helpers by name inside the options
    const named = entries.map(([k, v]) => {
      if (k === 'columns') return [k, v.map((c) => ({ ...c, ...(c.render === money ? { render: raw('money') } : c.render === badge ? { render: raw('badge') } : {}) }))];
      if (k === 'view') return [k, { title: v.title, render: raw('profile') }];
      return [k, v];
    });
    lines.push('  const table = BUI.dataTable(\'#users\', ' + optionsOnly(named, '  ') + ');', '</script>');
    return lines.join('\n');
  }
  const namedOptions = (entries) => optionsOnly(entries.map(([k, v]) => {
    if (k === 'columns') return [k, v.map((c) => ({ ...c, ...(c.render === money ? { render: raw('money') } : c.render === badge ? { render: raw('badge') } : {}) }))];
    if (k === 'view') return [k, { title: v.title, render: raw('profile') }];
    return [k, v];
  }));

  /* ---------- Highlight ---------- */
  const escH = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const span = (c, t) => `<span class="bui-code-${c}">${escH(t)}</span>`;
  const JS_TOK = /(\/\/[^\n]*|\/\*.*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(const|let|var|new|function|async|await|return|if|else|true|false|null|undefined)\b|([A-Za-z_$][\w$]*)(?=\s*:(?!:))/g;
  function hlJs(t) { let out = ''; let pos = 0; let m; JS_TOK.lastIndex = 0; while ((m = JS_TOK.exec(t))) { out += escH(t.slice(pos, m.index)); out += m[1] ? span('muted', m[1]) : m[2] ? span('green', m[2]) : m[3] ? span('pink', m[3]) : span('blue', m[4]); pos = m.index + m[0].length; } return out + escH(t.slice(pos)); }
  function highlight(code) {
    const TAG = /<(\/?)([A-Za-z][\w-]*)((?:\s+[^\s=>/]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g; let out = ''; let pos = 0; let js = false; let m;
    while ((m = TAG.exec(code))) {
      if (js && m[2].toLowerCase() !== 'script') continue; // "<" inside the script text
      const chunk = code.slice(pos, m.index); out += js ? hlJs(chunk) : escH(chunk);
      let tag = span('pink', `<${m[1]}${m[2]}`);
      (m[3].match(/\s+[^\s=>/]+(?:=(?:"[^"]*"|'[^']*'))?/g) || []).forEach((a) => { const [, sp, name, val] = a.match(/^(\s+)([^\s=>/]+)(?:=(.*))?$/s); tag += escH(sp) + span('blue', name) + (val !== undefined ? '=' + span('green', val) : ''); });
      out += tag + span('pink', `${m[4]}>`); if (m[2].toLowerCase() === 'script') js = !m[1]; pos = m.index + m[0].length;
    }
    const rest = code.slice(pos); return out + (js ? hlJs(rest) : escH(rest));
  }

  /* ---------- Live table ---------- */
  let table = null; let hostWrap = null;
  function liveOptions(entries) {
    const rows = users.slice(0, Number(state.rows)).map((u) => ({ ...u })); const o = {};
    entries.forEach(([k, v]) => {
      if (k === 'data') o.data = rows;
      else if (k === 'columns') o.columns = v.map((c) => ({ ...c, ...(c.options && c.options.__raw ? { options: LISTS[c.options.__raw] } : {}) }));
      else if (k === 'ajax') o.ajax = { url: v.url, fetch: BUIDocs.fakeApi(rows, 450) };
      else if (k === 'editor' && v && v.onCreate) {
        o.editor = { mode: v.mode, onCreate: async (r) => { const id = Math.max(0, ...rows.map((x) => x.id)) + 1; rows.unshift({ ...r, id }); return { id }; }, onUpdate: async (r) => { const i = rows.findIndex((x) => x.id === r.id); rows[i] = { ...rows[i], ...r }; }, onDelete: async (d) => { const ids = [].concat(d).map((x) => x.id); rows.splice(0, rows.length, ...rows.filter((x) => !ids.includes(x.id))); } };
      } else o[k] = v;
    });
    return o;
  }
  const count = (entries) => entries.filter(([k]) => !['data', 'columns', 'serverSide', 'ajax'].includes(k)).length;
  function render() {
    const entries = build();
    if (table) { try { table.destroy(); } catch (e) { /* ignore */ } table = null; }
    host.textContent = '';
    preview.dir = state.dir; preview.style.colorScheme = state.theme === 'auto' ? '' : state.theme;
    preview.classList.toggle('is-dark', state.theme === 'dark');
    try { table = BUI.dataTable(host, liveOptions(entries)); } catch (err) { host.textContent = 'Could not build the table: ' + err.message; }
    window.dpTable = table;
    $('dpCode').innerHTML = highlight(state.out === 'full' ? fullCode(entries) : '// only what differs from the defaults\nconst options = ' + namedOptions(entries) + ';');
    $('dpFile').textContent = state.out === 'full' ? 'index.html' : 'options.js';
    $('dpCount').textContent = String(count(entries));
    $('dpOut').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.out === state.out));
  }

  /* ---------- Panel ---------- */
  const panel = $('dpPanel');
  const html = [];
  GROUPS.forEach((g, gi) => {
    html.push(`<details class="bui-dp-group"${g.open ? ' open' : ''}><summary><span>${g.title}</span><i aria-hidden="true"></i></summary><div class="bui-dp-body">`);
    g.items.forEach((it) => {
      const id = 'dp_' + it.k; const hint = it.key ? `<code>${it.key}</code>` : '';
      if (it.t === 'bool') html.push(`<label class="bui-checkline bui-dp-row" data-item="${it.k}"><input type="checkbox" id="${id}" data-k="${it.k}"><span>${it.label}</span>${hint}</label>`);
      else if (it.t === 'select') html.push(`<div class="bui-tp-field" data-item="${it.k}"><label for="${id}">${it.label} ${hint}</label><select class="bui-input" id="${id}" data-k="${it.k}">${it.opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div>`);
      else if (it.t === 'tabs') html.push(`<div class="bui-tp-field" data-item="${it.k}"><div class="bui-tp-label">${it.label} ${hint}</div><div class="bui-gallery-tabs" role="group" aria-label="${it.label}" data-tabs="${it.k}">${it.opts.map(([v, l]) => `<button type="button" class="bui-gallery-tab" data-v="${v}">${l}</button>`).join('')}</div></div>`);
      else if (it.t === 'range') html.push(`<div class="bui-tp-slider" data-item="${it.k}"><div><span>${it.label}</span><code id="${id}_o"></code></div><input type="range" id="${id}" data-k="${it.k}" min="${it.min}" max="${it.max}" step="${it.step}"></div>`);
      else if (it.t === 'cols') html.push(`<div class="bui-tp-label">${it.label}</div><div class="bui-tp-checks" id="dpCols">${COLS.map((c, i) => `<label class="bui-checkline"><input type="checkbox" data-col="${i}"> ${c.title}</label>`).join('')}</div>`);
      else if (it.t === 'btns') html.push(`<div class="bui-tp-label">${it.label}</div><div class="bui-tp-checks" id="dpBtns">${BTN_LIST.map(([k, l]) => `<label class="bui-checkline"><input type="checkbox" data-btn="${k}"> ${l}</label>`).join('')}</div>`);
    });
    html.push('</div></details>');
  });
  panel.innerHTML = html.join('');

  function sync() {
    GROUPS.forEach((g) => g.items.forEach((it) => {
      const row = panel.querySelector(`[data-item="${it.k}"]`); if (!row) return;
      const off = it.dep ? !it.dep(state) : false; row.classList.toggle('is-off', off);
      row.querySelectorAll('input,select,button').forEach((n) => { n.disabled = off; });
      if (it.t === 'bool') row.querySelector('input').checked = !!state[it.k];
      else if (it.t === 'select') row.querySelector('select').value = String(state[it.k]);
      else if (it.t === 'tabs') row.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.v === String(state[it.k])));
      else if (it.t === 'range') { row.querySelector('input').value = state[it.k]; $('dp_' + it.k + '_o').textContent = `rows: ${state[it.k]}`; }
    }));
    panel.querySelectorAll('[data-col]').forEach((c) => { c.checked = !!state.cols[Number(c.dataset.col)]; });
    panel.querySelectorAll('[data-btn]').forEach((c) => { c.checked = !!state.btns[c.dataset.btn]; });
  }
  const itemOf = (k) => { let r; GROUPS.forEach((g) => g.items.forEach((it) => { if (it.k === k) r = it; })); return r; };
  const change = () => { sync(); render(); };

  panel.addEventListener('change', (e) => {
    const t = e.target; const k = t.dataset.k;
    if (t.dataset.col !== undefined) { const on = t.checked; state.cols[Number(t.dataset.col)] = on; if (!state.cols.some(Boolean)) { state.cols[Number(t.dataset.col)] = true; } return change(); }
    if (t.dataset.btn) { state.btns[t.dataset.btn] = t.checked; return change(); }
    if (!k) return; const it = itemOf(k);
    state[k] = it.t === 'bool' ? t.checked : it.t === 'range' ? Number(t.value) : it.num ? Number(t.value) : t.value; change();
  });
  panel.addEventListener('input', (e) => { const t = e.target; if (t.type === 'range') { state[t.dataset.k] = Number(t.value); $('dp_' + t.dataset.k + '_o').textContent = `rows: ${t.value}`; } });
  panel.addEventListener('click', (e) => { const b = e.target.closest('[data-tabs] button'); if (!b) return; const k = b.parentElement.dataset.tabs; state[k] = b.dataset.v; change(); });
  $('dpOut').addEventListener('click', (e) => { const b = e.target.closest('button[data-out]'); if (b) { state.out = b.dataset.out; render(); } });
  $('dpPresets').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.preset) { const out = state.out; const keep = { dir: state.dir, theme: state.theme, lang: state.lang }; reset(PRESETS[b.dataset.preset]); Object.assign(state, keep, { out }); change(); }
    if (b.dataset.act === 'reset') { const out = state.out; reset(); state.out = out; change(); }
    if (b.dataset.act === 'toggle') { const ds = [...panel.querySelectorAll('details')]; const open = ds.some((d) => !d.open); ds.forEach((d) => { d.open = open; }); b.textContent = open ? 'Collapse all' : 'Expand all'; }
  });
  reset(PRESETS.standard); sync(); render();
})();
