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

  /* ---------- Modal: <dialog class="bui-modal"> ---------- */
  const MODAL_SYMBOLS = { success: '✓', info: 'i', warning: '!', danger: '!' };
  let modalSeq = 0;
  const getModal = (t) => (typeof t === 'string' ? document.getElementById(t.replace(/^#/, '')) : t);
  const syncLock = () => root.classList.toggle('bui-modal-open', !!document.querySelector('dialog.bui-modal[open]'));
  const isModal = (n) => n instanceof HTMLDialogElement && n.classList.contains('bui-modal');

  function openModal(target) {
    const d = getModal(target);
    if (!d || d.open) return d;
    d.classList.remove('bui-modal-closing');
    d.showModal();
    syncLock();
    d.dispatchEvent(new CustomEvent('bui:modal-open', { bubbles: true }));
    return d;
  }
  function closeModal(target, value = '') {
    const d = getModal(target);
    if (!d || !d.open || d.classList.contains('bui-modal-closing')) return d;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; d.classList.remove('bui-modal-closing'); d.returnValue = String(value); d.close(); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return d; }
    d.classList.add('bui-modal-closing');
    d.addEventListener('animationend', (e) => { if (e.target === d) finish(); });
    setTimeout(finish, 320);
    return d;
  }
  const bump = (d) => { d.classList.remove('bui-modal-bump'); void d.offsetWidth; d.classList.add('bui-modal-bump'); setTimeout(() => d.classList.remove('bui-modal-bump'), 300); };

  /* Build and show a modal from options. Resolves with the value of the clicked action, or null when dismissed. */
  function showModal(o = {}) {
    const d = document.createElement('dialog');
    const id = `bui-modal-auto-${++modalSeq}`;
    d.className = ['bui-modal', o.size && `bui-modal-${o.size}`, o.position && `bui-modal-${o.position}`, o.icon && 'bui-modal-center'].filter(Boolean).join(' ');
    if (o.static) d.dataset.buiStatic = '';
    if (o.title) d.setAttribute('aria-labelledby', `${id}-title`);
    if (o.message) d.setAttribute('aria-describedby', `${id}-text`);
    const closable = o.closable ?? !o.icon;
    let result = null, input = null, content = null;

    if (!o.icon && (o.title || closable)) {
      const head = add(d, 'div', 'bui-modal-header');
      const h = add(head, 'h3', 'bui-modal-title', o.title || ''); h.id = `${id}-title`;
      if (closable) { const x = add(head, 'button', 'bui-modal-close', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.dataset.buiModalClose = ''; }
    }
    const body = add(d, 'div', 'bui-modal-body');
    if (o.icon) {
      const ic = add(body, 'span', `bui-modal-icon bui-modal-icon-${o.type || o.icon}`); ic.setAttribute('aria-hidden', 'true');
      glyph(ic, MODAL_SYMBOLS[o.icon] || o.icon);
      if (o.title) { const h = add(body, 'h3', 'bui-modal-title', o.title); h.id = `${id}-title`; }
    }
    if (o.message) { const p = add(body, 'p', null, o.message); p.id = `${id}-text`; }
    if (o.body instanceof Node) body.append(o.body);
    if (o.input) {
      const label = add(body, 'label', 'bui-field', o.input.label || '');
      input = add(label, o.input.rows ? 'textarea' : 'input', 'bui-input');
      Object.assign(input, { type: o.input.type || 'text', placeholder: o.input.placeholder || '', value: o.input.value || '', autofocus: true });
      if (o.input.required) input.required = true;
    }
    const foot = add(d, 'div', 'bui-modal-footer' + (o.icon ? '' : o.footer ? ` bui-modal-footer-${o.footer}` : ''));
    const buttons = [];
    const setBusy = (btn, on) => {
      buttons.forEach((b) => { b.disabled = on; });
      btn.setAttribute('aria-busy', String(on));
      btn.querySelector('.bui-spinner')?.remove();
      if (on) btn.prepend(Object.assign(document.createElement('span'), { className: 'bui-spinner bui-spinner-sm' }));
    };
    (o.actions || []).forEach((a) => {
      const b = add(foot, 'button', `bui-btn bui-btn-${a.variant || 'outline'}`, a.label); b.type = 'button';
      if (a.autofocus) b.autofocus = true;
      b.addEventListener('click', async () => {
        if (a.input && input && !input.reportValidity()) return;
        if (a.onClick) {
          setBusy(b, true);
          try { if ((await a.onClick(d)) === false) { setBusy(b, false); return; } } catch (err) { console.error(err); setBusy(b, false); return; }
          setBusy(b, false);
        }
        result = a.input && input ? input.value : (a.value ?? null);
        closeModal(d, 'action');
      });
      buttons.push(b);
      if (a.input) content = b;
    });
    if (input && content) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); content.click(); } });
    if (!buttons.length) foot.remove();

    const promise = new Promise((resolve) => {
      d.addEventListener('close', () => { resolve(result); d.remove(); o.onClose?.(result); }, { once: true });
    });
    document.body.appendChild(d);
    openModal(d);
    promise.dialog = d;
    return promise;
  }

  const confirmModal = ({ type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, ...o } = {}) => showModal({
    icon: type, ...o,
    actions: [{ label: cancelText, value: false }, { label: confirmText, value: true, variant: type === 'danger' ? 'danger' : 'primary', onClick: onConfirm, autofocus: true }],
  }).then((v) => v === true);
  const alertModal = ({ type = 'info', okText = 'OK', ...o } = {}) => showModal({ icon: type, ...o, actions: [{ label: okText, value: true, variant: 'primary', autofocus: true }] }).then(() => undefined);
  const promptModal = ({ label, placeholder, value, inputType, required, rows, confirmText = 'OK', cancelText = 'Cancel', onConfirm, ...o } = {}) => showModal({
    ...o, input: { label, placeholder, value, type: inputType, required, rows },
    actions: [{ label: cancelText, value: null }, { label: confirmText, variant: 'primary', input: true, onClick: onConfirm }],
  });

  BUI.modal = { open: openModal, close: closeModal, show: showModal, confirm: confirmModal, alert: alertModal, prompt: promptModal };

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-bui-modal-open]');
    if (opener) { openModal(opener.dataset.buiModalOpen); return; }
    const closer = event.target.closest('[data-bui-modal-close]');
    if (closer) { closeModal(closer.closest('dialog.bui-modal'), closer.dataset.buiModalClose || closer.value || 'close'); return; }
    const d = event.target;
    if (isModal(d) && d.open) { // a click on the backdrop targets the dialog element itself
      const r = d.getBoundingClientRect();
      const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
      if (!inside) { if (d.hasAttribute('data-bui-static')) bump(d); else closeModal(d, 'backdrop'); }
    }
  });
  document.addEventListener('cancel', (event) => { // Esc key
    if (!isModal(event.target)) return;
    event.preventDefault();
    if (event.target.hasAttribute('data-bui-static')) bump(event.target); else closeModal(event.target, 'cancel');
  }, true);
  document.addEventListener('submit', (event) => { // <form method="dialog"> inside a modal
    const form = event.target, d = form.closest?.('dialog.bui-modal');
    if (d && form.getAttribute('method') === 'dialog') { event.preventDefault(); closeModal(d, event.submitter?.value ?? ''); }
  });
  document.addEventListener('close', (event) => { // native close event does not bubble, so listen while capturing
    if (!isModal(event.target)) return;
    syncLock();
    event.target.dispatchEvent(new CustomEvent('bui:modal-close', { bubbles: true, detail: { returnValue: event.target.returnValue } }));
  }, true);

  /* ---------- Floating labels: "i" message toggle + validation ---------- */
  const FLOAT_STATES = ['error', 'success', 'warning', 'notice', 'loading'];
  const ERROR_KEYS = { valueMissing: 'required', typeMismatch: 'type', badInput: 'type', patternMismatch: 'pattern', tooShort: 'minlength', tooLong: 'maxlength', rangeUnderflow: 'min', rangeOverflow: 'max', stepMismatch: 'step' };
  let floatSeq = 0;
  const floatOf = (t) => (typeof t === 'string' ? document.querySelector(t) : t)?.closest?.('.bui-float') ?? null;
  const floatInput = (f) => f.querySelector('.bui-float-input');
  const setOpen = (f, on) => { f.classList.toggle('bui-float-open', on); f.querySelector(':scope > .bui-float-info')?.setAttribute('aria-expanded', String(on)); };

  /* state: 'error' | 'success' | 'warning' | 'info' | 'loading' | null (clear). A message adds the "i" button. */
  function setFloatState(target, state, message, opts = {}) {
    const f = floatOf(target);
    if (!f) return null;
    const input = floatInput(f);
    FLOAT_STATES.forEach((s) => f.classList.remove(`bui-float-${s}`));
    input.removeAttribute('aria-invalid');
    let msg = f.querySelector(':scope > .bui-float-message'), btn = f.querySelector(':scope > .bui-float-info');
    if (state) f.classList.add(`bui-float-${state === 'info' ? 'notice' : state}`);
    if (state === 'error') input.setAttribute('aria-invalid', 'true');
    if (state && state !== 'loading' && message) {
      if (!msg) { msg = add(f, 'div', 'bui-float-message'); msg.dataset.buiAuto = ''; msg.setAttribute('role', 'status'); msg.id = `${input.id || `bui-float-${++floatSeq}`}-msg`; }
      if (!btn) { btn = add(f, 'button', 'bui-float-info', 'i'); btn.type = 'button'; btn.dataset.buiAuto = ''; btn.setAttribute('aria-label', 'Show message'); btn.setAttribute('aria-expanded', 'false'); }
      msg.textContent = message;
      btn.setAttribute('aria-controls', msg.id);
      input.setAttribute('aria-describedby', msg.id);
      if (opts.open) setOpen(f, true);
    } else if (!state || (msg && msg.dataset.buiAuto !== undefined)) {
      f.querySelectorAll(':scope > [data-bui-auto]').forEach((n) => n.remove());
      input.removeAttribute('aria-describedby');
      f.classList.remove('bui-float-open');
    }
    return f;
  }

  /* Validate one field with the browser's constraint validation. Messages come from data attributes:
     data-error, data-error-required | -type | -pattern | -minlength | -maxlength | -min | -max | -step, data-error-match, data-success */
  function validateFloat(target) {
    const f = floatOf(target), input = f && floatInput(f);
    if (!input || input.disabled || input.readOnly) return true;
    const d = input.dataset;
    if (d.match) { const other = document.querySelector(d.match); input.setCustomValidity(other && input.value !== other.value ? (d.errorMatch || 'Values do not match') : ''); }
    const v = input.validity;
    if (!v.valid) {
      const bad = Object.keys(ERROR_KEYS).find((k) => v[k]);
      const text = v.customError || !bad ? input.validationMessage : (d[`error${ERROR_KEYS[bad][0].toUpperCase()}${ERROR_KEYS[bad].slice(1)}`] ?? d.error ?? input.validationMessage);
      setFloatState(f, 'error', text);
      return false;
    }
    if (input.value !== '') setFloatState(f, 'success', d.success); else setFloatState(f, null);
    return true;
  }
  function validateFloatForm(form) {
    let first = null;
    form.querySelectorAll('.bui-float').forEach((f) => { floatInput(f).dataset.touched = ''; if (!validateFloat(f) && !first) first = f; });
    if (first) { floatInput(first).focus(); setOpen(first, true); }
    return !first;
  }

  BUI.float = {
    setState: setFloatState,
    clear: (t) => setFloatState(t, null),
    open: (t, on = true) => { const f = floatOf(t); if (f) setOpen(f, on); },
    validate: (t) => { const el = typeof t === 'string' ? document.querySelector(t) : t; return el?.matches?.('form') ? validateFloatForm(el) : validateFloat(el); },
    reset: (form) => form.querySelectorAll('.bui-float').forEach((f) => { delete floatInput(f).dataset.touched; setFloatState(f, null); }),
  };

  document.querySelectorAll('[data-bui-validate]').forEach((form) => { form.noValidate = true; }); // no native bubbles, we show our own
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.bui-float-info'), inside = event.target.closest('.bui-float');
    document.querySelectorAll('.bui-float-open').forEach((f) => { if (f !== inside) setOpen(f, false); });
    if (btn) { const f = btn.closest('.bui-float'); setOpen(f, !f.classList.contains('bui-float-open')); }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.querySelectorAll('.bui-float-open').forEach((f) => setOpen(f, false));
  });
  document.addEventListener('focusout', (event) => {
    const input = event.target;
    if (input.classList?.contains('bui-float-input') && input.closest('[data-bui-validate]')) { input.dataset.touched = ''; validateFloat(input); }
  });
  document.addEventListener('input', (event) => {
    const input = event.target;
    if (!input.classList?.contains('bui-float-input') || !input.closest('[data-bui-validate]')) return;
    if ('touched' in input.dataset) validateFloat(input);
    if (input.id) document.querySelectorAll(`[data-match="#${input.id}"]`).forEach((o) => { if ('touched' in o.dataset) validateFloat(o); });
  });
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!form.matches?.('[data-bui-validate]')) return;
    form.noValidate = true;
    if (!validateFloatForm(form)) {
      event.preventDefault();
      form.dispatchEvent(new CustomEvent('bui:invalid', { bubbles: true, detail: { field: form.querySelector('.bui-float-error .bui-float-input') } }));
    } else if (!form.dispatchEvent(new CustomEvent('bui:valid', { bubbles: true, cancelable: true }))) event.preventDefault();
  });
  document.addEventListener('reset', (event) => { if (event.target.matches?.('[data-bui-validate]')) setTimeout(() => BUI.float.reset(event.target)); });

  /* ---------- Floating labels: password toggle, strength meter, rules list, input filters, Caps Lock ---------- */
  const FILTERS = { digits: /[^0-9]/g, alnum: /[^A-Za-z0-9]/g, username: /[^A-Za-z0-9_.]/g, letters: /[^\p{L}\s'-]/gu };
  const STRENGTH = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const RULES = { upper: (v) => /[A-Z]/.test(v), lower: (v) => /[a-z]/.test(v), digit: (v) => /\d/.test(v), symbol: (v) => /[^A-Za-z0-9]/.test(v) };

  function revealFloat(target, on) { // show or hide a password; on = true | false, or toggle when omitted
    const f = floatOf(target), input = f && floatInput(f);
    if (!input) return;
    const show = on ?? input.type === 'password', a = input.selectionStart, b = input.selectionEnd;
    input.type = show ? 'text' : 'password';
    try { input.setSelectionRange(a, b); } catch { /* not supported for this type */ }
    const btn = f.querySelector(':scope > .bui-float-toggle');
    if (btn) { btn.setAttribute('aria-pressed', String(show)); btn.setAttribute('aria-label', show ? (btn.dataset.labelHide || 'Hide password') : (btn.dataset.labelShow || 'Show password')); }
  }
  const passwordScore = (v) => {
    if (!v) return 0;
    const s = (v.length >= 8) + (v.length >= 12) + (/[a-z]/.test(v) && /[A-Z]/.test(v)) + /\d/.test(v) + /[^A-Za-z0-9]/.test(v);
    return s <= 1 ? 1 : s === 2 ? 2 : s === 3 ? 3 : 4;
  };
  function updateStrength(input) { // <input data-bui-strength>: fills a .bui-float-meter (created when missing)
    if (!('buiStrength' in input.dataset)) return;
    const f = floatOf(input);
    let meter = f.querySelector(':scope > .bui-float-meter');
    if (!meter) { meter = add(f, 'div', 'bui-float-meter'); meter.setAttribute('aria-live', 'polite'); for (let i = 0; i < 4; i++) add(meter, 'i'); add(meter, 'span'); }
    const level = passwordScore(input.value);
    meter.dataset.level = level;
    meter.lastElementChild.textContent = level ? (input.dataset[`strength-${level}`] ?? STRENGTH[level]) : '';
  }
  function updateRules(input) { // <ul data-bui-rules="#password"><li data-rule="min:8">...
    if (!input.id) return;
    document.querySelectorAll(`[data-bui-rules="#${input.id}"] [data-rule]`).forEach((li) => {
      const text = li.dataset.rule, i = text.indexOf(':'), name = i < 0 ? text : text.slice(0, i), arg = i < 0 ? '' : text.slice(i + 1);
      const ok = name === 'min' ? input.value.length >= +arg : name === 'regex' ? new RegExp(arg).test(input.value) : RULES[name]?.(input.value);
      li.classList.toggle('bui-float-rule-ok', !!ok);
    });
  }
  BUI.float.reveal = revealFloat;
  const resetFloat = BUI.float.reset;
  BUI.float.reset = (form) => {
    resetFloat(form);
    form.querySelectorAll('.bui-float-toggle').forEach((t) => revealFloat(t, false));
    form.querySelectorAll('.bui-float-meter').forEach((m) => { m.dataset.level = 0; m.lastElementChild.textContent = ''; });
    document.querySelectorAll('[data-bui-rules] .bui-float-rule-ok').forEach((li) => li.classList.remove('bui-float-rule-ok'));
  };

  document.addEventListener('click', (event) => {
    const t = event.target.closest('.bui-float-toggle');
    if (t) { revealFloat(t); floatInput(t.closest('.bui-float')).focus(); }
  });
  document.addEventListener('input', (event) => { // capture phase: filter first, then validate
    const input = event.target;
    if (!input.classList?.contains('bui-float-input')) return;
    const d = input.dataset, filter = FILTERS[d.buiFilter];
    if (filter) { const v = input.value.replace(filter, ''); if (v !== input.value) { const pos = (input.selectionStart ?? v.length) - (input.value.length - v.length); input.value = v; try { input.setSelectionRange(pos, pos); } catch { /* ignore */ } } }
    if (d.buiCase) input.value = d.buiCase === 'upper' ? input.value.toUpperCase() : input.value.toLowerCase();
    updateStrength(input);
    updateRules(input);
  }, true);
  const capsLock = (event) => { // <input data-bui-caps="Caps Lock is on">
    const input = event.target;
    if (!input.matches?.('.bui-float-input[data-bui-caps]') || !event.getModifierState) return;
    const f = floatOf(input), on = event.getModifierState('CapsLock');
    if (on && !f.classList.contains('bui-float-error')) { input.dataset.capsWarn = ''; setFloatState(f, 'warning', input.dataset.buiCaps || 'Caps Lock is on', { open: true }); }
    else if (!on && 'capsWarn' in input.dataset) { delete input.dataset.capsWarn; if (input.closest('[data-bui-validate]') && 'touched' in input.dataset) validateFloat(input); else setFloatState(f, null); }
  };
  document.querySelectorAll('.bui-float-input[data-bui-strength]').forEach(updateStrength);   // values already in the markup
  document.querySelectorAll('[data-bui-rules]').forEach((ul) => { const i = document.querySelector(ul.dataset.buiRules); if (i) updateRules(i); });
  document.addEventListener('keydown', capsLock);
  document.addEventListener('keyup', capsLock);

  /* ---------- Select menu: a custom listbox for native <select> elements ----------
     The <select> stays the source of truth (value, change event, form, required, disabled, label).
     The menu is built from its <option> / <optgroup> items every time it opens, and it is placed below or above
     the field by measuring the free space in the viewport. No direction is set by the developer. */
  const SELECT_QUERY = 'select.bui-float-input, select.bui-input, select.bui-float-prefix, select[data-bui-select]';
  const canPopover = typeof HTMLElement.prototype.showPopover === 'function';
  let openSel = null; // { select, menu, items, active, buffer, timer, observer }
  let selectSeq = 0;
  const isEnhanced = (n) => n instanceof HTMLSelectElement && n.matches(SELECT_QUERY) && !n.multiple && !(n.size > 1) && !n.hasAttribute('data-bui-native');

  function buildSelectMenu(state) {
    const { select, menu } = state;
    menu.textContent = '';
    state.items = [];
    const addOption = (o, parent) => {
      if (o.hidden || (o.disabled && o.value === '' && !o.textContent.trim())) return; // a hidden placeholder option
      const text = (o.label || o.textContent).trim();
      const el = add(parent, 'div', 'bui-select-option' + (text ? '' : ' bui-select-option-empty'), text || '—');
      el.id = `${menu.id}-o${o.index}`;
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', String(o.selected));
      const disabled = o.disabled || !!o.parentElement?.disabled;
      if (disabled) el.setAttribute('aria-disabled', 'true');
      state.items.push({ el, option: o, disabled });
    };
    [...select.children].forEach((c, gi) => {
      if (c.tagName === 'OPTION') addOption(c, menu);
      else if (c.tagName === 'OPTGROUP' && !c.hidden) {
        const g = add(menu, 'div', 'bui-select-group'), label = add(g, 'div', 'bui-select-group-label', c.label);
        label.id = `${menu.id}-g${gi}`; g.setAttribute('role', 'group'); g.setAttribute('aria-labelledby', label.id);
        [...c.children].forEach((o) => { if (o.tagName === 'OPTION') addOption(o, g); });
      }
    });
  }
  function setSelectActive(state, index, scroll = true) {
    state.items[state.active]?.el.classList.remove('bui-select-option-active');
    state.active = index;
    const item = state.items[index];
    if (!item) { state.select.removeAttribute('aria-activedescendant'); return; }
    item.el.classList.add('bui-select-option-active');
    state.select.setAttribute('aria-activedescendant', item.el.id);
    if (scroll) item.el.scrollIntoView({ block: 'nearest' });
  }
  const firstEnabled = (state, from = 0, step = 1) => { for (let i = from; i >= 0 && i < state.items.length; i += step) if (!state.items[i].disabled) return i; return -1; };
  const startIndex = (state) => { const i = state.items.findIndex((it) => it.option.selected && !it.disabled); return i >= 0 ? i : firstEnabled(state); };

  /* Below the field when the menu fits there; otherwise on the side with more room (it scrolls when needed). */
  function placeSelectMenu(state) {
    const { select, menu } = state;
    const r = select.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) { closeSelectMenu(); return; }
    const gap = 6, edge = 8;
    menu.style.maxHeight = ''; menu.style.minWidth = `${Math.max(r.width, 140)}px`;
    const natural = menu.offsetHeight, below = vh - r.bottom - gap - edge, above = r.top - gap - edge;
    const place = natural <= below || below >= above ? 'bottom' : 'top';
    const room = Math.max(place === 'bottom' ? below : above, 96);
    if (natural > room) menu.style.maxHeight = `${room}px`;
    const h = Math.min(natural, room), w = menu.offsetWidth;
    let left = getComputedStyle(menu).direction === 'rtl' ? r.right - w : r.left;
    left = Math.min(Math.max(left, edge), Math.max(edge, vw - w - edge));
    menu.style.left = `${left}px`;
    menu.style.top = `${place === 'bottom' ? r.bottom + gap : r.top - gap - h}px`;
    menu.dataset.placement = place;
  }
  let placeFrame = 0;
  const schedulePlace = () => { if (openSel && !placeFrame) placeFrame = requestAnimationFrame(() => { placeFrame = 0; if (openSel) placeSelectMenu(openSel); }); };

  function closeSelectMenu() {
    if (!openSel) return;
    const { select, menu, observer, timer } = openSel;
    openSel = null;
    observer.disconnect(); clearTimeout(timer);
    if (canPopover) { try { menu.hidePopover(); } catch { /* already hidden */ } }
    menu.remove();
    select.setAttribute('aria-expanded', 'false');
    select.removeAttribute('aria-controls'); select.removeAttribute('aria-activedescendant');
    select.dispatchEvent(new CustomEvent('bui:select-close', { bubbles: true }));
  }
  function chooseSelectItem(state, index) {
    const item = state.items[index];
    if (!item || item.disabled) return;
    const { select } = state, changed = !item.option.selected;
    closeSelectMenu();
    if (changed) {
      select.selectedIndex = item.option.index;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    select.focus();
  }
  function openSelectMenu(target) {
    const select = typeof target === 'string' ? document.querySelector(target) : target;
    if (!isEnhanced(select) || select.disabled || openSel?.select === select) return;
    closeSelectMenu();
    const menu = document.createElement('div');
    menu.className = 'bui-select-menu'; menu.id = `bui-select-menu-${++selectSeq}`;
    menu.setAttribute('role', 'listbox');
    const name = select.labels?.[0]?.firstChild?.textContent?.trim() || select.labels?.[0]?.textContent.trim() || select.getAttribute('aria-label');
    if (name) menu.setAttribute('aria-label', name);
    const state = openSel = { select, menu, items: [], active: -1, buffer: '', timer: 0, observer: null };
    buildSelectMenu(state);
    // Inside the field (or a modal) so it inherits the theme, direction and tokens, and stays clickable in a modal
    const host = select.closest('dialog[open], .bui-float') || document.body;
    if (canPopover) menu.setAttribute('popover', 'manual');
    host.appendChild(menu);
    if (canPopover) menu.showPopover();
    select.setAttribute('aria-haspopup', 'listbox'); select.setAttribute('aria-expanded', 'true'); select.setAttribute('aria-controls', menu.id);
    setSelectActive(state, startIndex(state));
    placeSelectMenu(state);
    menu.addEventListener('mousedown', (e) => e.preventDefault()); // keep the focus on the select
    menu.addEventListener('mousemove', (e) => { const i = state.items.findIndex((it) => it.el === e.target.closest('.bui-select-option')); if (i >= 0 && !state.items[i].disabled && i !== state.active) setSelectActive(state, i, false); });
    menu.addEventListener('click', (e) => { const i = state.items.findIndex((it) => it.el === e.target.closest('.bui-select-option')); if (i >= 0) chooseSelectItem(state, i); });
    state.observer = new MutationObserver(() => { const cur = state.items[state.active]?.option; buildSelectMenu(state); setSelectActive(state, Math.max(0, state.items.findIndex((it) => it.option === cur)), false); placeSelectMenu(state); });
    state.observer.observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'label', 'selected', 'value'] }); // not aria-*: we set those ourselves
    select.focus({ preventScroll: true });
    select.dispatchEvent(new CustomEvent('bui:select-open', { bubbles: true }));
  }

  document.addEventListener('mousedown', (event) => {
    const select = event.target.closest?.('select');
    if (select && isEnhanced(select)) {
      if (event.button !== 0 || select.disabled) return;
      event.preventDefault(); // no native popup
      select.focus();
      if (openSel?.select === select) closeSelectMenu(); else openSelectMenu(select);
    } else if (openSel && !openSel.menu.contains(event.target)) closeSelectMenu();
  }, true);
  document.addEventListener('keydown', (event) => {
    const select = event.target;
    if (!isEnhanced(select) || event.isComposing) return;
    const state = openSel?.select === select ? openSel : null, key = event.key;
    if (!state) {
      if (key === 'Enter' || key === ' ' || ((key === 'ArrowDown' || key === 'ArrowUp') && !event.ctrlKey && !event.metaKey && !event.shiftKey)) { event.preventDefault(); openSelectMenu(select); }
      return;
    }
    const go = (i) => { if (i >= 0) setSelectActive(state, i); };
    if (key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeSelectMenu(); }
    else if (key === 'Tab') closeSelectMenu();
    else if (key === 'ArrowDown') { event.preventDefault(); go(firstEnabled(state, state.active + 1)); }
    else if (key === 'ArrowUp') { event.preventDefault(); go(firstEnabled(state, state.active - 1, -1)); }
    else if (key === 'Home') { event.preventDefault(); go(firstEnabled(state)); }
    else if (key === 'End') { event.preventDefault(); go(firstEnabled(state, state.items.length - 1, -1)); }
    else if (key === 'PageDown') { event.preventDefault(); go(firstEnabled(state, Math.min(state.active + 8, state.items.length - 1), -1)); }
    else if (key === 'PageUp') { event.preventDefault(); go(firstEnabled(state, Math.max(state.active - 8, 0))); }
    else if (key === 'Enter' || (key === ' ' && !state.buffer)) { event.preventDefault(); chooseSelectItem(state, state.active); }
    else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) { // type to search
      event.preventDefault();
      state.buffer += key.toLowerCase(); clearTimeout(state.timer); state.timer = setTimeout(() => { state.buffer = ''; }, 600);
      const n = state.items.length, from = state.buffer.length === 1 ? state.active + 1 : Math.max(state.active, 0);
      for (let k = 0; k < n; k++) { const i = (from + k) % n; if (!state.items[i].disabled && state.items[i].el.textContent.trim().toLowerCase().startsWith(state.buffer)) { go(i); break; } }
    }
  });
  document.addEventListener('focusout', (event) => { if (openSel && event.target === openSel.select) closeSelectMenu(); });
  document.addEventListener('change', (event) => { // a chosen value validates a floating select right away
    const s = event.target;
    if (s instanceof HTMLSelectElement && s.classList.contains('bui-float-input') && s.closest('[data-bui-validate]')) { s.dataset.touched = ''; validateFloat(s); }
  });
  window.addEventListener('resize', schedulePlace);
  window.addEventListener('scroll', (event) => { if (openSel && !openSel.menu.contains(event.target)) schedulePlace(); }, true);
  window.visualViewport?.addEventListener('resize', schedulePlace);

  BUI.select = { open: openSelectMenu, close: closeSelectMenu, isOpen: (t) => { const s = typeof t === 'string' ? document.querySelector(t) : t; return !!openSel && (!s || openSel.select === s); } };

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
