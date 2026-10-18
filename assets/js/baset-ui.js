/* Baset UI v1.0.0 — tiny optional interactions (no dependencies) */
(() => {
  const root = document.documentElement;
  const THEME_KEY = 'bui-theme';

  /* ---------- Theme toggle (persisted) ---------- */
  const themeButton = document.getElementById('themeToggle');
  const isDark = () => root.classList.contains('bui-dark');
  const syncIcon = () => { if (themeButton) themeButton.textContent = isDark() ? '☾' : '☼'; };

  try { if (localStorage.getItem(THEME_KEY) === 'dark') root.classList.add('bui-dark'); } catch { /* storage blocked */ }
  syncIcon();

  themeButton?.addEventListener('click', () => {
    root.classList.toggle('bui-dark');
    try { localStorage.setItem(THEME_KEY, isDark() ? 'dark' : 'light'); } catch { /* storage blocked */ }
    syncIcon();
  });

  /* ---------- Direction (RTL / LTR, persisted) ---------- */
  const DIR_KEY = 'bui-dir';
  const dirToggle = document.getElementById('dirToggle');
  const syncDirButtons = () => {
    if (dirToggle) dirToggle.textContent = root.dir === 'rtl' ? 'LTR' : 'RTL'; // label = direction you switch to
    document.querySelectorAll('[data-bui-dir]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.buiDir === root.dir));
    });
  };
  const setDir = (dir) => {
    root.dir = dir === 'rtl' ? 'rtl' : 'ltr';
    try { localStorage.setItem(DIR_KEY, root.dir); } catch { /* storage blocked */ }
    syncDirButtons();
  };

  try { const saved = localStorage.getItem(DIR_KEY); if (saved === 'rtl' || saved === 'ltr') root.dir = saved; } catch { /* storage blocked */ }
  syncDirButtons();

  document.addEventListener('click', (event) => {
    if (event.target.closest('#dirToggle')) { setDir(root.dir === 'rtl' ? 'ltr' : 'rtl'); return; }
    const btn = event.target.closest('[data-bui-dir]');
    if (btn) setDir(btn.dataset.buiDir);
  });

  /* ---------- Clipboard helper (with fallback) ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* ignore */ }
      area.remove();
      return ok;
    }
  }

  /* ---------- Delegated clicks: alert dismiss + copy code ---------- */
  document.addEventListener('click', async (event) => {
    const dismiss = event.target.closest('.bui-dismiss');
    if (dismiss) {
      dismiss.closest('.bui-alert')?.remove();
      return;
    }

    const replay = event.target.closest('.bui-replay');
    if (replay) { // restart CSS animations of the success icons in this demo card
      replay.closest('.bui-demo-card')?.querySelectorAll('.bui-success-icon').forEach((el) => el.replaceWith(el.cloneNode(true)));
      return;
    }

    const copy = event.target.closest('.bui-copy');
    if (!copy) return;

    // Priority: data-copy attribute, otherwise the text of the sibling <code> block
    const text = copy.dataset.copy ?? copy.closest('.bui-code-card')?.querySelector('code')?.textContent ?? '';
    const original = copy.dataset.label ?? (copy.dataset.label = copy.textContent);
    const ok = await copyText(text);
    copy.textContent = ok ? 'Copied!' : 'Select code to copy';
    clearTimeout(copy._t);
    copy._t = setTimeout(() => { copy.textContent = original; }, 1300);
  });

  /* ---------- Toasts and notifications: BUI.toast() / BUI.notify() ---------- */
  const BUI = (window.BUI = window.BUI || {});
  const POSITIONS = ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'];
  const baseOpts = { position: 'top-end', max: 5, closable: true, pauseOnHover: true, sound: true, soundVolume: 0.5 };
  const defaults = {
    toast: { ...baseOpts, duration: 5000, progress: true },
    notify: { ...baseOpts, duration: 8000, progress: false },
  };
  const SYMBOLS = { success: '✓', info: 'i', warning: '!', danger: '×' };
  const boxes = {};

  /* ---------- Sounds (single place to change them) ----------
     Put your audio files in assets/sounds/ (mp3, ogg or wav). A sound is a file name inside that folder
     ('success.mp3') or a path / URL that contains "/" ('/media/pop.mp3', 'https://...').
     A type without its own sound falls back to "default" (toasts) or "notify" (notifications).
     Change them here, or at runtime:  BUI.sounds.success = 'my-success.mp3';  */
  const SOUND_DIR = document.currentScript?.src ? new URL('../sounds/', document.currentScript.src).href : 'assets/sounds/';
  BUI.sounds = Object.assign({
    default: 'notification.mp3',
    notify: 'notification.mp3',
    // success: 'success.mp3',
    // info: 'info.mp3',
    // warning: 'warning.mp3',
    // danger: 'error.mp3',
  }, BUI.sounds);
  let soundOff = false;
  try { soundOff = localStorage.getItem('bui-sound') === 'off'; } catch { /* storage blocked */ }
  const files = {};
  const toUrl = (s) => (s.includes('/') ? s : SOUND_DIR + s);
  const pickSound = (kind, o) => {
    if (o.sound === false) return null;
    const s = typeof o.sound === 'string' ? (BUI.sounds[o.sound] ?? o.sound) : (BUI.sounds[o.type] ?? BUI.sounds[kind === 'notify' ? 'notify' : 'default']);
    return s ? toUrl(s) : null;
  };
  const play = (src, volume = 0.5) => {
    if (soundOff || !src) return;
    try { const a = (files[src] ||= new Audio(src)); a.volume = volume; a.currentTime = 0; a.play().catch(() => {}); } catch { /* audio blocked or file missing */ }
  };

  const getBox = (pos) => {
    if (!boxes[pos]) {
      const box = document.createElement('div');
      box.className = 'bui-toast-container';
      box.dataset.position = pos;
      box.setAttribute('role', 'region');
      box.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(box);
      boxes[pos] = box;
    }
    return boxes[pos];
  };
  const ago = (ts) => {
    const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 45) return 'now';
    const m = Math.round(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
  };
  const add = (parent, tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    parent.append(n);
    return n;
  };
  const glyph = (parent, sym) => { // icon class ("bui-icon-solid bui-icon-bell") or plain text / emoji
    if (String(sym).includes('bui-icon')) add(parent, 'i', sym); else parent.append(String(sym));
  };

  function make(kind, input) {
    const o = { ...defaults[kind], ...(typeof input === 'string' ? { message: input } : input) };
    const pos = POSITIONS.includes(o.position) ? o.position : defaults[kind].position;
    const el = document.createElement('div');
    el.setAttribute('role', o.type === 'danger' || o.type === 'warning' ? 'alert' : 'status');

    if (kind === 'toast') {
      el.className = 'bui-toast' + (o.type ? ` bui-toast-${o.type}` : '') + (o.variant ? ` bui-toast-${o.variant}` : '');
      const sym = o.icon === false ? null : (o.icon || SYMBOLS[o.type]);
      if (sym) glyph(add(el, 'span', 'bui-toast-icon'), sym);
      const body = add(el, 'div', 'bui-toast-body');
      if (o.title) add(body, 'strong', null, o.title);
      if (o.message) add(body, 'p', null, o.message);
    } else {
      el.className = 'bui-notification' + (o.type ? ` bui-notification-${o.type}` : '') + (o.unread ? ' bui-notification-unread' : '');
      if (o.image || o.logo || o.icon) {
        const media = add(el, 'span', 'bui-notification-media' + (o.type ? ` bui-notification-media-${o.type}` : '') + (o.round ? ' bui-notification-media-round' : ''));
        if (o.image) { const img = add(media, 'img'); img.src = o.image; img.alt = o.alt || ''; } else glyph(media, o.logo || o.icon);
      }
      const content = add(el, 'div', 'bui-notification-content');
      const head = add(content, 'div', 'bui-notification-head');
      add(head, 'strong', 'bui-notification-title', o.title || '');
      if (o.time !== false) {
        const t = add(head, 'time', 'bui-notification-time');
        const when = o.time === undefined || o.time === true ? Date.now() : o.time;
        if (typeof when === 'string') t.textContent = when;
        else { const ts = +new Date(when); t.dataset.ts = ts; t.textContent = ago(ts); }
      }
      if (o.message) add(content, 'p', 'bui-notification-text', o.message);
      if (o.actions?.length) {
        const row = add(content, 'div', 'bui-notification-actions');
        o.actions.forEach((a) => {
          const b = add(row, 'button', `bui-btn bui-btn-sm bui-btn-${a.variant || 'soft-primary'}`, a.label);
          b.type = 'button';
          b.addEventListener('click', (e) => { e.stopPropagation(); a.onClick?.(inst); if (!a.keep) inst.close('action'); });
        });
      }
    }
    if (o.closable) {
      const x = add(el, 'button', kind === 'toast' ? 'bui-toast-close' : 'bui-notification-close', '×');
      x.type = 'button'; x.setAttribute('aria-label', 'Close');
    }

    const sticky = !(o.duration > 0) || o.duration === Infinity;
    let bar = null, left = o.duration, started = 0, timer = null, gone = false;
    if (o.progress && !sticky && kind === 'toast') { bar = add(el, 'span', 'bui-toast-progress'); bar.style.animationDuration = `${o.duration}ms`; }
    const resume = () => { if (sticky || timer || gone) return; started = Date.now(); timer = setTimeout(() => close('timeout'), left); if (bar) bar.style.animationPlayState = 'running'; };
    const pause = () => { if (!timer) return; clearTimeout(timer); timer = null; left -= Date.now() - started; if (bar) bar.style.animationPlayState = 'paused'; };
    function close(reason = 'api') {
      if (gone) return;
      gone = true; clearTimeout(timer);
      el.classList.add('bui-toast-leave');
      let done = false;
      const finish = () => { if (done) return; done = true; el.remove(); o.onClose?.(reason); };
      el.addEventListener('animationend', finish, { once: true });
      setTimeout(finish, 350);
    }
    const inst = { el, close, pause, resume };
    el._bui = inst;

    el.addEventListener('click', (e) => { if (e.target.closest('.bui-toast-close, .bui-notification-close')) close('close'); else o.onClick?.(e, inst); });
    if (o.pauseOnHover) { ['mouseenter', 'focusin'].forEach((n) => el.addEventListener(n, pause)); ['mouseleave', 'focusout'].forEach((n) => el.addEventListener(n, resume)); }

    const box = getBox(pos);
    if (pos.startsWith('bottom')) box.append(el); else box.prepend(el);
    const live = [...box.children].filter((n) => !n.classList.contains('bui-toast-leave'));
    const extra = live.length - o.max;
    if (extra > 0) (pos.startsWith('bottom') ? live.slice(0, extra) : live.slice(-extra)).forEach((n) => n._bui?.close('overflow'));
    resume();
    if (o.sound !== false) play(pickSound(kind, o), o.soundVolume);
    return inst;
  }

  BUI.toast = (o) => make('toast', o);
  BUI.notify = (o) => make('notify', o);
  ['primary', 'success', 'info', 'warning', 'danger'].forEach((type) => {
    BUI.toast[type] = (message, o) => make('toast', { ...o, type, message });
    BUI.notify[type] = (title, message, o) => make('notify', { ...o, type, title, message });
  });
  BUI.play = (sound, volume) => { const s = BUI.sounds[sound] ?? sound; play(s && toUrl(s), volume ?? 0.5); };
  BUI.mute = (off = true) => { soundOff = !!off; try { localStorage.setItem('bui-sound', soundOff ? 'off' : 'on'); } catch { /* storage blocked */ } };
  BUI.isMuted = () => soundOff;
  BUI.clear = (pos) => (pos ? [boxes[pos]] : Object.values(boxes)).forEach((b) => b && [...b.children].forEach((n) => n._bui?.close('clear')));
  BUI.config = (o, kind) => (kind ? [kind] : ['toast', 'notify']).forEach((k) => Object.assign(defaults[k], o)); // kind: 'toast' | 'notify'

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-bui-toast], [data-bui-notify], [data-bui-clear]');
    if (trigger) { // declarative use: <button data-bui-toast='{"type":"success","message":"Saved"}'>
      if ('buiClear' in trigger.dataset) { BUI.clear(trigger.dataset.buiClear || undefined); return; }
      const kind = 'buiToast' in trigger.dataset ? 'toast' : 'notify';
      try { BUI[kind](JSON.parse(trigger.dataset[kind === 'toast' ? 'buiToast' : 'buiNotify'])); } catch { /* invalid JSON */ }
      return;
    }
    const x = event.target.closest('.bui-toast-close, .bui-notification-close'); // static (non-JS) cards
    if (x && !x.closest('.bui-toast-container')) x.closest('.bui-toast, .bui-notification')?.remove();
  });
  setInterval(() => document.querySelectorAll('.bui-notification-time[data-ts]').forEach((t) => { t.textContent = ago(+t.dataset.ts); }), 30000);

  /* ---------- Scroll-spy for in-page sidebar links (#section) ---------- */
  const spyLinks = [...document.querySelectorAll('.bui-nav[href^="#"]')];
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(spyLinks.map((link) => [link.getAttribute('href').slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        spyLinks.forEach((link) => link.classList.remove('active'));
        byId.get(entry.target.id)?.classList.add('active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
  }
})();
