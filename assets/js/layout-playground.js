/* Baset UI — Layout playground (documentation only)
 * Build a navbar, sidebar and footer (together or apart), preview them live, copy the generated HTML.
 * Needs baset-ui.js (toggles, dropdowns, clock, theme button) and baset-icons.css. State lives in memory. */
(() => {
  const stage = document.getElementById('lpPreview');
  if (!stage) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const I = (n) => `<i class="bui-icon-regular bui-icon-${n}"></i>`;
  const ind = (s, n) => s.split('\n').map((l) => ' '.repeat(n) + l).join('\n');
  const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const DEF = {
    mode: 'light', dir: 'ltr', nav: true, side: true, foot: true, sMode: 'fixed',
    nVar: '', nFlat: false, brand: 'Baset', links: 'Home,Features,Pricing,Docs', center: 'search',
    aClock: true, aTz: false, aLang: false, aTheme: true, aBell: true, aUser: true, uName: true, aButtons: false,
    sMini: false, sLabels: true, sGroups: true, sBadges: true, sUser: false, sBottom: true, sW: 260, items: 'Dashboard,Projects,Team,Reports,Settings',
    fStyle: 'status', fInv: false, fSocial: false, fClock: true, fTz: true, fLang: true, fTheme: true,
  };
  let S = { ...DEF }, tab = 'all';

  /* ---------- Pieces ---------- */
  const SEARCH = '<label class="bui-navbar-search"><input class="bui-input" type="search" placeholder="Search…" aria-label="Search"></label>';
  const clock = (id) => `<time class="bui-navbar-clock" data-bui-clock${id ? ` data-bui-clock-tz="#${id}"` : ''}>12:00:00</time>`;
  const tz = (id) => `<label class="bui-navbar-select"><select class="bui-input" id="${id}" aria-label="Time zone"><option value="Africa/Cairo" selected>Cairo</option><option value="UTC">UTC</option><option value="America/New_York">New York</option><option value="Asia/Tokyo">Tokyo</option></select></label>`;
  const THEME = `<button type="button" class="bui-btn bui-btn-ghost bui-btn-icon bui-btn-sm" data-bui-theme-toggle aria-label="Toggle theme">${I('moon')}</button>`;
  const LANG = `<div class="bui-dropdown" data-bui-align="end">
  <button type="button" class="bui-btn bui-btn-ghost bui-btn-icon bui-btn-sm" data-bui-dropdown-toggle aria-haspopup="menu" aria-expanded="false" aria-label="Language">${I('translate')}</button>
  <div class="bui-dropdown-menu" role="menu">
    <button type="button" class="bui-dropdown-item" role="menuitemradio" aria-checked="true" data-bui-dir="ltr">English</button>
    <button type="button" class="bui-dropdown-item" role="menuitemradio" aria-checked="false" data-bui-dir="rtl">العربية</button>
  </div>
</div>`;
  const BELL = `<div class="bui-dropdown" data-bui-align="end">
  <button type="button" class="bui-btn bui-btn-ghost bui-btn-icon bui-btn-sm bui-navbar-iconbtn" data-bui-dropdown-toggle aria-haspopup="dialog" aria-expanded="false" aria-label="Notifications">${I('bell')}<span class="bui-navbar-dot">2</span></button>
  <div class="bui-dropdown-menu bui-dropdown-panel" role="dialog" aria-label="Notifications">
    <div class="bui-notification-list" style="border:0;border-radius:0;box-shadow:none">
      <div class="bui-notification bui-notification-unread"><span class="bui-notification-media bui-notification-media-info">${I('chart-bar')}</span><div class="bui-notification-content"><div class="bui-notification-head"><strong class="bui-notification-title">Report ready</strong><time class="bui-notification-time">1h ago</time></div><p class="bui-notification-text">Your weekly report is ready to download.</p></div></div>
      <div class="bui-notification"><span class="bui-notification-media bui-notification-media-success">${I('check')}</span><div class="bui-notification-content"><div class="bui-notification-head"><strong class="bui-notification-title">Backup completed</strong><time class="bui-notification-time">Yesterday</time></div><p class="bui-notification-text">All files were backed up.</p></div></div>
    </div>
  </div>
</div>`;
  const USER = (name) => `<div class="bui-dropdown" data-bui-align="end">
  <button type="button" class="bui-btn bui-btn-ghost bui-btn-sm bui-navbar-user${name ? '' : ' bui-navbar-user-icon'}" data-bui-dropdown-toggle aria-haspopup="menu" aria-expanded="false" aria-label="Account menu"><span class="bui-select-avatar">AB</span>${name ? 'Abdulbaset' : ''}</button>
  <div class="bui-dropdown-menu" role="menu">
    <div class="bui-dropdown-profile" role="presentation"><span class="bui-select-avatar">AB</span><span><strong>Abdulbaset</strong><small>admin@baset.dev</small></span></div>
    <div class="bui-dropdown-divider" role="separator"></div>
    <a class="bui-dropdown-item" role="menuitem" href="#">${I('user')}Profile</a>
    <a class="bui-dropdown-item" role="menuitem" href="#">${I('gear')}Settings</a>
    <div class="bui-dropdown-divider" role="separator"></div>
    <button type="button" class="bui-dropdown-item bui-dropdown-item-danger" role="menuitem">${I('sign-out')}Log out</button>
  </div>
</div>`;
  const SOCIAL = '<div class="bui-site-footer-social"><a href="#" aria-label="GitHub">G</a><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="X">X</a></div>';

  /* ---------- Parts ---------- */
  function navbar() {
    const cls = ['bui-navbar', S.nVar, S.nFlat && 'bui-navbar-flat'].filter(Boolean).join(' ');
    const clk = clock(S.aTz ? 'lp-tz' : null), act = [];
    if (S.aClock && S.center !== 'clock') act.push(clk);
    if (S.aTz) act.push(tz('lp-tz'));
    if (S.aLang) act.push(LANG);
    if (S.aTheme) act.push(THEME);
    if (S.aBell) act.push(BELL);
    if (S.aUser) act.push(USER(S.uName));
    if (S.aButtons) act.push(`<a class="bui-btn ${S.nVar ? 'bui-btn-light' : 'bui-btn-outline'} bui-btn-sm" href="#">Sign in</a>`, '<a class="bui-btn bui-btn-primary bui-btn-sm" href="#">Get started</a>');
    const mid = S.center === 'search' ? `<div class="bui-navbar-center">${SEARCH}</div>` : S.center === 'clock' ? `<div class="bui-navbar-center">${clk}</div>` : '';
    const actions = act.length ? `<div class="bui-navbar-actions">\n${ind(act.join('\n'), 2)}\n</div>` : '';
    if (S.side) {
      const p = ['<button class="bui-shell-toggle" type="button" data-bui-shell-toggle aria-expanded="false" aria-label="Open menu"><span></span></button>'];
      if (S.sMode === 'fixed') p.push(`<button class="bui-btn bui-btn-ghost bui-btn-icon bui-btn-sm" type="button" data-bui-sidenav-collapse="#lp-side" aria-pressed="false" aria-label="Collapse sidebar">${I('sidebar-simple')}</button>`);
      if (mid) p.push(mid);
      if (actions) p.push(actions);
      return `<header class="${cls}">\n${ind(p.join('\n'), 2)}\n</header>`;
    }
    const links = list(S.links).map((t, k) => `<li><a class="bui-navbar-link${k ? '' : ' active'}" href="#"${k ? '' : ' aria-current="page"'}>${esc(t)}</a></li>`).join('\n');
    const inner = [`<ul class="bui-navbar-nav">\n${ind(links, 2)}\n</ul>`, mid, actions].filter(Boolean).join('\n');
    return `<nav class="${cls}" aria-label="Main">
  <a class="bui-navbar-brand" href="#"><span class="bui-navbar-mark">${esc(S.brand.charAt(0) || 'B')}</span>${esc(S.brand)}</a>
  <button class="bui-navbar-toggle" type="button" data-bui-navbar-toggle aria-expanded="false" aria-controls="lp-nav" aria-label="Toggle navigation"><span></span></button>
  <div class="bui-navbar-collapse" id="lp-nav">
${ind(inner, 4)}
  </div>
</nav>`;
  }
  function sidebar() {
    const ic = ['house', 'folder-open', 'users', 'chart-bar', 'gear', 'envelope-simple'];
    const link = (t, k, on) => `<a class="bui-sidenav-link${on ? ' active' : ''}" href="#">${I(ic[k % 6])}<span class="bui-sidenav-text">${esc(t)}</span>${S.sBadges && k === 1 && !S.sGroups ? '<span class="bui-sidenav-badge">12</span>' : ''}</a>`;
    const rows = ['<button class="bui-sidenav-close" type="button" data-bui-shell-toggle aria-label="Close menu"></button>', `<a class="bui-sidenav-brand" href="#"><span class="bui-navbar-mark">${esc(S.brand.charAt(0) || 'B')}</span><span class="bui-sidenav-text">${esc(S.brand)}</span></a>`];
    if (S.sLabels) rows.push('<div class="bui-sidenav-label">Main</div>');
    list(S.items).forEach((t, k) => {
      if (S.sGroups && k === 1) rows.push(`<details class="bui-sidenav-group" open>
  <summary class="bui-sidenav-link">${I(ic[1])}<span class="bui-sidenav-text">${esc(t)}</span></summary>
  <div class="bui-sidenav-sub">
    <a class="bui-sidenav-link" href="#"><span class="bui-sidenav-text">Active</span>${S.sBadges ? '<span class="bui-sidenav-badge">8</span>' : ''}</a>
    <a class="bui-sidenav-link" href="#"><span class="bui-sidenav-text">Archived</span></a>
  </div>
</details>`);
      else rows.push(link(t, k, k === 0));
    });
    if (S.sBottom) rows.push(`<div class="bui-sidenav-bottom">
  <a class="bui-sidenav-link" href="#">${I('question')}<span class="bui-sidenav-text">Help</span></a>
  <a class="bui-sidenav-link bui-sidenav-link-danger" href="#">${I('sign-out')}<span class="bui-sidenav-text">Log out</span></a>
</div>`);
    if (S.sUser) rows.push('<div class="bui-sidenav-user"><span class="bui-select-avatar">AB</span><div><strong>Abdulbaset</strong><small>Admin</small></div></div>');
    const w = !S.sMini && +S.sW !== 260 ? ` style="--sn-w:${S.sW}px"` : '';
    return `<aside class="bui-sidenav${S.sMini ? ' bui-sidenav-mini' : ''}" id="lp-side" aria-label="Menu"${w}>\n${ind(rows.join('\n'), 2)}\n</aside>`;
  }
  function footer() {
    const cls = ['bui-site-footer', S.fInv && 'bui-site-footer-inverse', S.fStyle === 'center' && 'bui-site-footer-center'].filter(Boolean).join(' ');
    const brand = `<a class="bui-navbar-brand" href="#"><span class="bui-navbar-mark">${esc(S.brand.charAt(0) || 'B')}</span>${esc(S.brand)}</a>`;
    const col = (t, a) => `<div><h4 class="bui-site-footer-title">${t}</h4><ul class="bui-site-footer-links">${a.map((x) => `<li><a href="#">${x}</a></li>`).join('')}</ul></div>`;
    const body = S.fStyle === 'columns'
      ? `<div class="bui-site-footer-cols">\n${ind([`<div>${brand}<p>A lightweight UI library built with plain HTML, CSS and JavaScript.</p></div>`, col('Product', ['Features', 'Pricing']), col('Company', ['About', 'Blog']), col('Support', ['Docs', 'Contact'])].join('\n'), 2)}\n</div>`
      : S.fStyle === 'center' ? `${brand}\n<p>Build beautiful interfaces. Keep it simple.</p>` : '';
    const tools = [];
    if (S.fClock) tools.push(clock(S.fTz ? 'lp-tz-f' : null));
    if (S.fTz) tools.push(tz('lp-tz-f'));
    if (S.fLang) tools.push(LANG);
    if (S.fTheme) tools.push(THEME);
    const left = S.fStyle === 'status' ? '<span style="display:inline-flex;align-items:center;gap:8px"><span class="bui-pulse" style="width:8px;height:8px"></span>All systems operational · v1.0.0</span>' : `<span>© 2026 ${esc(S.brand)}. All rights reserved.</span>`;
    const bottom = [left];
    if (S.fStyle === 'simple') bottom.push('<nav class="bui-site-footer-nav" aria-label="Footer"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a></nav>');
    if (S.fSocial) bottom.push(SOCIAL);
    if (tools.length) bottom.push(`<div class="bui-site-footer-tools">\n${ind(tools.join('\n'), 2)}\n</div>`);
    const flat = body ? '' : ' style="margin:0;padding:0;border:0"';
    return `<footer class="${cls}">\n${body ? ind(body, 2) + '\n' : ''}  <div class="bui-site-footer-bottom"${flat}>\n${ind(bottom.join('\n'), 4)}\n  </div>\n</footer>`;
  }
  function all() {
    const content = `<main class="bui-shell-content">
  <div class="bui-grid bui-grid-auto" style="--bui-grid-min:9rem">
    <div class="bui-stat-card"><span class="bui-stat-label">Revenue</span><strong>$24.8k</strong><div class="bui-progress"><span style="width:68%"></span></div></div>
    <div class="bui-stat-card"><span class="bui-stat-label">Orders</span><strong>1,284</strong><div class="bui-progress"><span style="width:44%"></span></div></div>
  </div>
</main>`;
    const main = [S.nav && navbar(), content, S.foot && footer()].filter(Boolean).join('\n');
    const cls = !S.side ? 'bui-shell bui-shell-single' : { fixed: 'bui-shell', push: 'bui-shell bui-shell-drawer', overlay: 'bui-shell bui-shell-overlay' }[S.sMode];
    const parts = [S.side && sidebar(), S.side && S.sMode === 'overlay' && '<div class="bui-shell-backdrop" data-bui-shell-toggle></div>', `<div class="bui-shell-main">\n${ind(main, 2)}\n</div>`].filter(Boolean);
    return `<div class="${cls}">\n${ind(parts.join('\n'), 2)}\n</div>`;
  }
  const BUILD = { all, navbar, sidebar, footer };

  /* ---------- Highlight ---------- */
  function hl(c) {
    let o = '', p = 0, m;
    const re = /<(\/?)([A-Za-z][\w-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>/g;
    while ((m = re.exec(c))) {
      o += esc(c.slice(p, m.index));
      let t = `<span class="bui-code-pink">&lt;${m[1]}${m[2]}</span>`;
      for (const a of m[3].matchAll(/(\s+)([^\s=>/]+)(?:=("[^"]*"))?/g)) t += a[1] + `<span class="bui-code-blue">${a[2]}</span>` + (a[3] ? `=<span class="bui-code-green">${esc(a[3])}</span>` : '');
      o += t + `<span class="bui-code-pink">${m[4]}&gt;</span>`; p = m.index + m[0].length;
    }
    return o + esc(c.slice(p));
  }

  /* ---------- Controls ---------- */
  const G = [
    ['Preview', null, [['seg', 'mode', 'Mode', [['light', 'Light'], ['dark', 'Dark']]], ['seg', 'dir', 'Direction', [['ltr', 'LTR'], ['rtl', 'RTL']]]]],
    ['Parts (use any mix)', null, [['chk', 'nav', 'Navbar'], ['chk', 'side', 'Sidebar'], ['chk', 'foot', 'Footer']]],
    ['Navbar', 'nav', [['sel', 'nVar', 'Color', [['', 'Default'], ['bui-navbar-inverse', 'Inverse'], ['bui-navbar-primary', 'Primary']]], ['chk', 'nFlat', 'Flat (no radius)'], ['txt', 'brand', 'Brand'], ['txt', 'links', 'Links (comma separated, hidden when a sidebar is used)'],
      ['sel', 'center', 'Center element', [['', 'None'], ['search', 'Search'], ['clock', 'Clock']]], ['chk', 'aClock', 'Clock'], ['chk', 'aTz', 'Time zone'], ['chk', 'aLang', 'Language'], ['chk', 'aTheme', 'Theme toggle'], ['chk', 'aBell', 'Notifications'], ['chk', 'aUser', 'User menu'], ['chk', 'uName', 'User: show the name (off = avatar only)'], ['chk', 'aButtons', 'Sign in buttons']]],
    ['Sidebar', 'side', [['sel', 'sMode', 'Open / close', [['fixed', 'Always visible'], ['push', 'Burger menu: push content'], ['overlay', 'Burger menu: overlay + backdrop']]], ['chk', 'sMini', 'Mini rail (icons only)'], ['txt', 'items', 'Items (comma separated)'], ['chk', 'sLabels', 'Section label'], ['chk', 'sGroups', 'Group (2nd item)'], ['chk', 'sBadges', 'Badges'], ['chk', 'sBottom', 'Help and Log out'], ['chk', 'sUser', 'User card'], ['rng', 'sW', 'Width (px)', [200, 340, 10]]]],
    ['Footer', 'foot', [['sel', 'fStyle', 'Style', [['status', 'Status'], ['simple', 'Simple'], ['columns', 'Columns'], ['center', 'Centered']]], ['chk', 'fInv', 'Inverse'], ['chk', 'fSocial', 'Social links'], ['chk', 'fClock', 'Clock'], ['chk', 'fTz', 'Time zone'], ['chk', 'fLang', 'Language'], ['chk', 'fTheme', 'Theme toggle']]],
  ];
  const ctl = ([t, k, l, o]) => {
    if (t === 'chk') return `<label class="bui-checkline"><input type="checkbox" data-k="${k}"> ${l}</label>`;
    if (t === 'txt') return `<label class="bui-field">${l}<input class="bui-input" type="text" data-k="${k}"></label>`;
    if (t === 'sel') return `<div class="bui-tp-field"><label>${l}</label><select class="bui-input" data-k="${k}">${o.map(([v, x]) => `<option value="${v}">${x}</option>`).join('')}</select></div>`;
    if (t === 'rng') return `<div class="bui-tp-slider"><div><span>${l}</span><code data-out="${k}"></code></div><input type="range" data-k="${k}" min="${o[0]}" max="${o[1]}" step="${o[2]}" aria-label="${l}"></div>`;
    return `<div class="bui-tp-label">${l}</div><div class="bui-gallery-tabs" data-seg="${k}">${o.map(([v, x]) => `<button type="button" class="bui-gallery-tab" data-v="${v}">${x}</button>`).join('')}</div>`;
  };
  $('lpControls').innerHTML = G.map(([h, g, items]) => `<div class="bui-tp-group" ${g ? `data-group="${g}"` : ''}><h3>${h}</h3>${items.map(ctl).join('')}</div>`).join('');

  const sync = () => {
    document.querySelectorAll('[data-k]').forEach((i) => { if (i.type === 'checkbox') i.checked = !!S[i.dataset.k]; else if (i !== document.activeElement) i.value = S[i.dataset.k]; });
    document.querySelectorAll('[data-seg]').forEach((b) => b.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.dataset.v === S[b.dataset.seg])));
    document.querySelectorAll('[data-group]').forEach((g) => { g.hidden = !S[g.dataset.group]; });
    document.querySelectorAll('[data-out]').forEach((o) => { o.textContent = S[o.dataset.out] + 'px'; });
    $('lpDrawerNote').hidden = !(S.sMode !== 'fixed' && S.side);
  };
  const paint = () => {
    stage.style.colorScheme = S.mode; stage.dir = S.dir; stage.lang = S.dir === 'rtl' ? 'ar' : 'en';
    stage.innerHTML = all();
    const part = tab === 'all' ? all() : BUILD[tab]();
    $('lpCode').innerHTML = hl(part);
    $('lpFile').textContent = tab === 'all' ? 'layout.html' : `${tab}.html`;
    document.querySelectorAll('#lpTabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  };
  const update = () => { sync(); paint(); };

  let timer;
  const panel = $('lpControls');
  panel.addEventListener('input', (e) => {
    const i = e.target, k = i.dataset.k; if (!k) return;
    S[k] = i.type === 'checkbox' ? i.checked : i.type === 'range' ? +i.value : i.value;
    if (i.type === 'text') { clearTimeout(timer); timer = setTimeout(update, 150); } else update();
  });
  panel.addEventListener('change', (e) => { const i = e.target, k = i.dataset.k; if (k && i.tagName === 'SELECT') { S[k] = i.value; update(); } });
  panel.addEventListener('click', (e) => { const b = e.target.closest('[data-seg] button'); if (b) { S[b.parentElement.dataset.seg] = b.dataset.v; update(); } });
  $('lpTabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-tab]'); if (b) { tab = b.dataset.tab; paint(); } });
  $('lpReset').addEventListener('click', () => { S = { ...DEF }; update(); });
  stage.addEventListener('click', (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });
  update();
})();
