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

  /* ---------- Floating menus: shared placement (select menu, dropdown menu) ---------- */
  const canPopover = typeof HTMLElement.prototype.showPopover === 'function';
  /* Below the anchor when the whole menu fits there; otherwise on the side with more room (the menu then scrolls).
     st keeps the side chosen at open, so the menu does not jump while it loads more items. */
  function placeFloat(anchor, el, st, { desired, align = 'start', minWidth } = {}) {
    const r = anchor.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return false; // the anchor scrolled out of the window
    const gap = 6, edge = 8;
    el.style.maxHeight = '';
    if (minWidth !== null) el.style.minWidth = `${minWidth ?? r.width}px`;
    const natural = el.offsetHeight, want = desired ?? natural, below = vh - r.bottom - gap - edge, above = r.top - gap - edge;
    let place = st.place;
    if (!place || (place === 'bottom' ? below < 96 && above > below : above < 96 && below > above)) place = want <= below || below >= above ? 'bottom' : 'top';
    st.place = place;
    const room = Math.max(place === 'bottom' ? below : above, 96);
    if (natural > room) el.style.maxHeight = `${room}px`;
    const h = Math.min(natural, room), w = el.offsetWidth, rtl = getComputedStyle(el).direction === 'rtl';
    let left = (align === 'end') !== rtl ? r.right - w : r.left;
    left = Math.min(Math.max(left, edge), Math.max(edge, vw - w - edge));
    el.style.left = `${left}px`;
    el.style.top = `${place === 'bottom' ? r.bottom + gap : r.top - gap - h}px`;
    el.dataset.placement = place;
    return true;
  }

  /* ---------- Select menu: a custom listbox for native <select> elements ----------
     The <select> stays the source of truth (value, change event, form, required, disabled, label).
     Static options are read from <option> / <optgroup> each time the menu opens. Optional: a search box
     (data-bui-search), avatars and descriptions (data-image / data-description), and options loaded from an
     API page by page with infinite scroll (data-bui-url or BUI.select.remote()). */
  const SELECT_QUERY = 'select.bui-float-input, select.bui-input, select.bui-float-prefix, select[data-bui-select]';
  let openSel = null; // the open select menu
  let openDd = null;  // the open dropdown menu
  let selectSeq = 0;
  const remoteConfigs = new WeakMap();
  const isEnhanced = (n) => n instanceof HTMLSelectElement && n.matches(SELECT_QUERY) && !n.multiple && !(n.size > 1) && !n.hasAttribute('data-bui-native');
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const getPath = (obj, path) => (path ? String(path).split('.').reduce((o, k) => o?.[k], obj) : undefined);
  const wantsRich = (s) => s.hasAttribute('data-bui-rich');
  const say = (select, key, fallback) => select.dataset[key] ?? fallback;

  function avatarEl(item, cls = 'bui-select-avatar') {
    const a = document.createElement('span');
    a.className = cls; a.setAttribute('aria-hidden', 'true');
    const fallback = () => {
      a.textContent = String(item.label || '?').trim().split(/\s+/).slice(0, 2).map((w) => [...w][0]).join('').toUpperCase();
      let h = 0; for (const c of String(item.label)) h = (h * 31 + c.charCodeAt(0)) % 360;
      a.style.setProperty('--bui-avatar-hue', h);
    };
    if (item.image) { const img = document.createElement('img'); img.alt = ''; img.src = item.image; img.onerror = () => { img.remove(); fallback(); }; a.append(img); } else fallback();
    return a;
  }
  function setHighlighted(el, text, query) { // wraps the first match of the search in <mark>
    el.textContent = '';
    const t = norm(query).split(/\s+/).filter(Boolean)[0], n = norm(text), i = t && n.length === text.length ? n.indexOf(t) : -1;
    if (i < 0) { el.textContent = text; return; }
    el.append(text.slice(0, i)); add(el, 'mark', 'bui-select-mark', text.slice(i, i + t.length)); el.append(text.slice(i + t.length));
  }
  function renderItem(state, item) {
    const { select, menu } = state;
    const el = document.createElement('div');
    el.className = 'bui-select-option' + (item.label ? '' : ' bui-select-option-empty');
    el.id = `${menu.id}-o${++state.uid}`;
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', String(!!item.selected));
    if (item.disabled) el.setAttribute('aria-disabled', 'true');
    if (item.value !== '' && (wantsRich(select) || item.image)) el.append(avatarEl(item));
    const text = add(el, 'span', 'bui-select-text');
    item.labelEl = add(text, 'span', 'bui-select-label');
    setHighlighted(item.labelEl, item.label || '—', state.query);
    if (item.description) { item.descEl = add(text, 'span', 'bui-select-desc'); setHighlighted(item.descEl, String(item.description), state.query); }
    item.el = el;
    return el;
  }
  function buildStatic(state) { // items from the <option> elements
    const { select, list } = state;
    list.textContent = ''; state.items = [];
    const addOption = (o, parent, group) => {
      if (o.hidden || (o.disabled && o.value === '' && !o.textContent.trim())) return; // a hidden placeholder option
      const item = { option: o, value: o.value, label: (o.label || o.textContent).trim(), description: o.dataset.description, image: o.dataset.image, search: o.dataset.search, selected: o.selected, disabled: o.disabled || !!o.parentElement?.disabled, group };
      parent.append(renderItem(state, item));
      state.items.push(item);
    };
    [...select.children].forEach((c) => {
      if (c.tagName === 'OPTION') addOption(c, list, null);
      else if (c.tagName === 'OPTGROUP' && !c.hidden) {
        const g = add(list, 'div', 'bui-select-group'), label = add(g, 'div', 'bui-select-group-label', c.label);
        label.id = `${state.menu.id}-g${++state.uid}`; g.setAttribute('role', 'group'); g.setAttribute('aria-labelledby', label.id);
        [...c.children].forEach((o) => { if (o.tagName === 'OPTION') addOption(o, g, g); });
      }
    });
  }
  const navigable = (it) => !it.disabled && !it.hidden;
  const firstNav = (state, from = 0, step = 1) => { for (let i = from; i >= 0 && i < state.items.length; i += step) if (navigable(state.items[i])) return i; return -1; };
  function setSelectActive(state, index, scroll = true) {
    state.items[state.active]?.el.classList.remove('bui-select-option-active');
    state.active = index;
    const item = state.items[index], holder = state.search || state.select;
    if (!item) { holder.removeAttribute('aria-activedescendant'); return; }
    item.el.classList.add('bui-select-option-active');
    holder.setAttribute('aria-activedescendant', item.el.id);
    if (scroll) item.el.scrollIntoView({ block: 'nearest' });
  }
  const startIndex = (state) => { const i = state.items.findIndex((it) => it.selected && navigable(it)); return i >= 0 ? i : firstNav(state); };

  function setStatus(state, kind, text) { // loading | more | empty | error, or null to remove it
    if (!kind) { state.status?.remove(); state.status = null; return; }
    const el = state.status ||= document.createElement('div');
    el.className = `bui-select-status bui-select-status-${kind}`; el.setAttribute('role', 'status'); el.textContent = '';
    if (kind === 'loading' || kind === 'more') add(el, 'span', 'bui-spinner bui-spinner-sm');
    add(el, 'span', null, text);
    if (kind === 'error') { const b = add(el, 'button', 'bui-select-retry', say(state.select, 'buiRetry', 'Retry')); b.type = 'button'; b.addEventListener('click', () => loadRemote(state)); }
    state.list.append(el);
  }
  function filterStatic(state) { // the search box hides the options that do not match
    const tokens = norm(state.query).split(/\s+/).filter(Boolean);
    state.items.forEach((it) => {
      const hay = norm(`${it.label} ${it.description ?? ''} ${it.search ?? ''}`);
      it.hidden = !tokens.every((t) => hay.includes(t));
      it.el.hidden = it.hidden;
      setHighlighted(it.labelEl, it.label || '—', state.query);
      if (it.descEl) setHighlighted(it.descEl, String(it.description), state.query);
    });
    state.list.querySelectorAll('.bui-select-group').forEach((g) => { g.hidden = ![...g.querySelectorAll('.bui-select-option')].some((o) => !o.hidden); });
    setStatus(state, state.items.some((it) => !it.hidden) ? null : 'empty', say(state.select, 'buiEmpty', 'No results'));
    setSelectActive(state, startIndex(state));
  }

  /* ---- options from an API ---- */
  function urlLoader(select) {
    const d = select.dataset, per = +d.buiPerPage || 10;
    const K = { value: d.buiValueKey || 'id', label: d.buiLabelKey || 'name', desc: d.buiDescriptionKey, image: d.buiImageKey, disabled: d.buiDisabledKey };
    const P = { search: d.buiParamSearch || 'search', page: d.buiParamPage || 'page', per: d.buiParamPerPage || 'per_page' };
    let all = null, base = new URL(d.buiUrl, location.href);
    const map = (raw) => ({ value: getPath(raw, K.value), label: String(getPath(raw, K.label) ?? ''), description: K.desc ? getPath(raw, K.desc) : undefined, image: K.image && getPath(raw, K.image) ? new URL(getPath(raw, K.image), base).href : null, disabled: K.disabled ? !!getPath(raw, K.disabled) : false });
    return {
      perPage: per,
      async load({ search, page, signal }) {
        if (!all) {
          const url = new URL(d.buiUrl, location.href); base = url;
          url.searchParams.set(P.search, search); url.searchParams.set(P.page, page); url.searchParams.set(P.per, per);
          const res = await fetch(url, { signal, headers: { Accept: 'application/json' }, credentials: 'same-origin' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (Array.isArray(json)) all = json; // a plain file: search and pages are done here, in the browser
          else {
            const list = getPath(json, d.buiResultsPath) ?? json.data ?? json.items ?? json.results ?? [];
            const more = d.buiMorePath ? !!getPath(json, d.buiMorePath) : (json.meta?.last_page != null ? json.meta.current_page < json.meta.last_page : list.length >= per);
            return { items: list.map(map), hasMore: more };
          }
        }
        const keys = (d.buiSearchKeys || [K.label, K.desc].filter(Boolean).join(',')).split(',').map((k) => k.trim());
        const tokens = norm(search).split(/\s+/).filter(Boolean);
        const found = tokens.length ? all.filter((row) => tokens.every((t) => keys.some((k) => norm(getPath(row, k)).includes(t)))) : all;
        return { items: found.slice((page - 1) * per, page * per).map(map), hasMore: page * per < found.length };
      },
    };
  }
  function remoteOf(select) {
    if (remoteConfigs.has(select)) return remoteConfigs.get(select);
    if (!select.dataset.buiUrl) return null;
    const cfg = { debounce: +select.dataset.buiDebounce || 300, minChars: +select.dataset.buiMinChars || 0, ...urlLoader(select) };
    remoteConfigs.set(select, cfg);
    return cfg;
  }
  async function loadRemote(state, { reset = false } = {}) {
    const cfg = state.remote;
    if (reset) {
      state.ctrl?.abort(); state.reqId++; state.page = 0; state.hasMore = true; state.loading = false;
      state.items = state.items.filter((it) => it.keep); state.list.textContent = ''; state.items.forEach((it) => state.list.append(it.el)); state.status = null;
      if (state.query.length < cfg.minChars) { setStatus(state, 'empty', say(state.select, 'buiMin', `Type at least ${cfg.minChars} characters`)); state.hasMore = false; return; }
    }
    if (state.loading || !state.hasMore) return;
    state.loading = true;
    const id = ++state.reqId, ctrl = state.ctrl = new AbortController();
    setStatus(state, state.page ? 'more' : 'loading', say(state.select, state.page ? 'buiMore' : 'buiLoading', state.page ? 'Loading more…' : 'Loading…'));
    placeSelectMenu(state);
    try {
      const res = await cfg.load({ search: state.query, page: state.page + 1, perPage: cfg.perPage, signal: ctrl.signal });
      if (id !== state.reqId || openSel !== state) return;
      state.page++; state.hasMore = !!res.hasMore;
      const cur = state.select.value, first = !state.items.some((it) => !it.keep);
      setStatus(state, null);
      res.items.forEach((raw) => { const item = { ...raw, value: String(raw.value), selected: String(raw.value) === cur }; state.list.append(renderItem(state, item)); state.items.push(item); });
      if (!state.items.some((it) => !it.keep)) setStatus(state, 'empty', say(state.select, 'buiEmpty', 'No results'));
      else if (state.hasMore) setStatus(state, 'more', say(state.select, 'buiMore', 'Loading more…'));
      if (first) setSelectActive(state, startIndex(state), false);
    } catch (e) {
      if (e?.name === 'AbortError' || id !== state.reqId) return;
      setStatus(state, 'error', say(state.select, 'buiError', 'Could not load the list.'));
    } finally {
      if (id === state.reqId) {
        state.loading = false;
        if (openSel === state) { placeSelectMenu(state); if (state.hasMore && state.list.scrollHeight <= state.list.clientHeight + 4 && !state.status?.matches('.bui-select-status-error')) loadRemote(state); }
      }
    }
  }

  function placeSelectMenu(state) {
    const cap = parseFloat(getComputedStyle(state.menu).maxHeight) || 288;
    if (!placeFloat(state.select, state.menu, state, { desired: state.search || state.remote ? cap : undefined, minWidth: Math.max(state.select.getBoundingClientRect().width, 140) })) closeSelectMenu();
  }
  let placeFrame = 0;
  const schedulePlace = () => { if ((openSel || openDd) && !placeFrame) placeFrame = requestAnimationFrame(() => { placeFrame = 0; if (openSel) placeSelectMenu(openSel); if (openDd) placeDropdown(); }); };

  function closeSelectMenu() {
    if (!openSel) return;
    const { select, menu, observer, timer, ctrl, debounce } = openSel;
    openSel = null;
    observer?.disconnect(); clearTimeout(timer); clearTimeout(debounce); ctrl?.abort();
    if (canPopover) { try { menu.hidePopover(); } catch { /* already hidden */ } }
    menu.remove();
    select.setAttribute('aria-expanded', 'false');
    select.removeAttribute('aria-controls'); select.removeAttribute('aria-activedescendant');
    select.dispatchEvent(new CustomEvent('bui:select-close', { bubbles: true }));
  }
  function chooseSelectItem(state, index) {
    const item = state.items[index];
    if (!item || !navigable(item)) return;
    const { select } = state;
    let changed;
    if (item.option) { changed = !item.option.selected; closeSelectMenu(); if (changed) select.selectedIndex = item.option.index; }
    else { // an item from the API becomes a real <option>, so the form and select.value work
      changed = select.value !== item.value; closeSelectMenu();
      let opt = [...select.options].find((o) => o.value === item.value);
      if (!opt) { opt = new Option(item.label, item.value); select.add(opt); }
      opt.textContent = item.label;
      ['image', 'description'].forEach((k) => { if (item[k]) opt.dataset[k] = item[k]; else delete opt.dataset[k]; });
      [...select.options].forEach((o) => { if (o !== opt && o.dataset.buiRemote !== undefined) o.remove(); });
      opt.dataset.buiRemote = '';
      select.selectedIndex = opt.index;
    }
    if (changed) { select.dispatchEvent(new Event('input', { bubbles: true })); select.dispatchEvent(new Event('change', { bubbles: true })); }
    paintSelectValue(select);
    select.focus();
  }
  function openSelectMenu(target) {
    const select = typeof target === 'string' ? document.querySelector(target) : target;
    if (!isEnhanced(select) || select.disabled || openSel?.select === select) return;
    closeSelectMenu();
    const remote = remoteOf(select);
    const searchable = remote ? select.dataset.buiSearch !== 'false' : select.hasAttribute('data-bui-search') && select.dataset.buiSearch !== 'false';
    const menu = document.createElement('div');
    menu.className = 'bui-select-menu'; menu.id = `bui-select-menu-${++selectSeq}`;
    const state = openSel = { select, menu, list: null, search: null, items: [], active: -1, buffer: '', timer: 0, observer: null, query: '', uid: 0, remote, page: 0, hasMore: true, loading: false, reqId: 0, ctrl: null, status: null, debounce: 0, place: null };
    if (searchable) {
      const box = add(menu, 'div', 'bui-select-search');
      const input = state.search = add(box, 'input', 'bui-select-search-input');
      Object.assign(input, { type: 'text', autocomplete: 'off', spellcheck: false, placeholder: say(select, 'buiSearchPlaceholder', 'Search…') });
      input.setAttribute('role', 'combobox'); input.setAttribute('aria-expanded', 'true'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-label', input.placeholder);
    }
    const list = state.list = add(menu, 'div', 'bui-select-list'); list.id = `${menu.id}-list`; list.setAttribute('role', 'listbox');
    const name = select.labels?.[0]?.firstChild?.textContent?.trim() || select.labels?.[0]?.textContent.trim() || select.getAttribute('aria-label');
    if (name) list.setAttribute('aria-label', name);
    if (state.search) state.search.setAttribute('aria-controls', list.id);
    if (remote) { // keep an empty-value option (clear) at the top
      const empty = [...select.options].find((o) => o.value === '' && !o.disabled && !o.hidden);
      if (empty) { const item = { option: empty, value: '', label: (empty.label || empty.textContent).trim(), selected: empty.selected, keep: true }; list.append(renderItem(state, item)); state.items.push(item); }
    } else buildStatic(state);
    const host = select.closest('dialog[open], .bui-float') || document.body; // inherits theme and direction; clickable in a modal
    if (canPopover) menu.setAttribute('popover', 'manual');
    host.appendChild(menu);
    if (canPopover) menu.showPopover();
    select.setAttribute('aria-haspopup', 'listbox'); select.setAttribute('aria-expanded', 'true'); select.setAttribute('aria-controls', list.id);
    setSelectActive(state, startIndex(state));
    placeSelectMenu(state);
    menu.addEventListener('mousedown', (e) => { if (e.target !== state.search) e.preventDefault(); }); // keep the focus
    menu.addEventListener('mousemove', (e) => { const i = state.items.findIndex((it) => it.el === e.target.closest('.bui-select-option')); if (i >= 0 && navigable(state.items[i]) && i !== state.active) setSelectActive(state, i, false); });
    menu.addEventListener('click', (e) => { const i = state.items.findIndex((it) => it.el === e.target.closest('.bui-select-option')); if (i >= 0) chooseSelectItem(state, i); });
    if (state.search) {
      state.search.addEventListener('input', () => {
        state.query = state.search.value.trim();
        if (remote) { clearTimeout(state.debounce); state.debounce = setTimeout(() => loadRemote(state, { reset: true }), remote.debounce); } else filterStatic(state);
        placeSelectMenu(state);
      });
      state.search.addEventListener('keydown', (e) => selectKey(state, e));
    }
    if (remote) { list.addEventListener('scroll', () => { if (list.scrollTop + list.clientHeight >= list.scrollHeight - 48) loadRemote(state); }); loadRemote(state, { reset: true }); }
    else {
      state.observer = new MutationObserver(() => { const cur = state.items[state.active]?.option; buildStatic(state); if (state.query) filterStatic(state); setSelectActive(state, Math.max(0, state.items.findIndex((it) => it.option === cur)), false); placeSelectMenu(state); });
      state.observer.observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'label', 'selected', 'value'] }); // not aria-*: we set those ourselves
    }
    (state.search || select).focus({ preventScroll: true });
    select.dispatchEvent(new CustomEvent('bui:select-open', { bubbles: true }));
  }
  function selectKey(state, event) { // keyboard for an open menu; focus is on the select or on the search box
    const key = event.key, typing = !!state.search, go = (i) => { if (i >= 0) setSelectActive(state, i); };
    if (key === 'Escape') { event.preventDefault(); event.stopPropagation(); const s = state.select; closeSelectMenu(); s.focus(); }
    else if (key === 'Tab') closeSelectMenu();
    else if (key === 'ArrowDown') { event.preventDefault(); go(firstNav(state, state.active + 1)); }
    else if (key === 'ArrowUp') { event.preventDefault(); go(firstNav(state, state.active - 1, -1)); }
    else if (key === 'PageDown') { event.preventDefault(); go(firstNav(state, Math.min(state.active + 8, state.items.length - 1), -1)); }
    else if (key === 'PageUp') { event.preventDefault(); go(firstNav(state, Math.max(state.active - 8, 0))); }
    else if (key === 'Enter') { event.preventDefault(); chooseSelectItem(state, state.active); }
    else if (!typing && key === 'Home') { event.preventDefault(); go(firstNav(state)); }
    else if (!typing && key === 'End') { event.preventDefault(); go(firstNav(state, state.items.length - 1, -1)); }
    else if (!typing && key === ' ' && !state.buffer) { event.preventDefault(); chooseSelectItem(state, state.active); }
    else if (!typing && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) { // type to jump
      event.preventDefault();
      state.buffer += key.toLowerCase(); clearTimeout(state.timer); state.timer = setTimeout(() => { state.buffer = ''; }, 600);
      const n = state.items.length, from = state.buffer.length === 1 ? state.active + 1 : Math.max(state.active, 0);
      for (let k = 0; k < n; k++) { const i = (from + k) % n; if (navigable(state.items[i]) && norm(state.items[i].label).startsWith(state.buffer)) { go(i); break; } }
    }
  }

  /* ---- the selected option shown with its avatar and description (data-bui-rich / remote selects) ---- */
  function paintSelectValue(select) {
    const f = select.closest('.bui-float');
    if (!f || !(wantsRich(select) || remoteOf(select))) return;
    select.classList.add('bui-select-rich');
    let v = f.querySelector(':scope > .bui-select-value');
    if (!v) { v = document.createElement('span'); v.className = 'bui-select-value'; v.setAttribute('aria-hidden', 'true'); select.after(v); }
    v.textContent = '';
    const o = select.selectedOptions[0];
    if (!o || o.value === '') return;
    const item = { label: (o.label || o.textContent).trim(), description: o.dataset.description, image: o.dataset.image };
    if (wantsRich(select) || item.image) v.append(avatarEl(item));
    const t = add(v, 'span', 'bui-select-text'); add(t, 'span', 'bui-select-label', item.label);
    if (item.description) add(t, 'span', 'bui-select-desc', item.description);
  }
  function initRichSelect(select) {
    if (!isEnhanced(select) || select._buiRich || !(wantsRich(select) || remoteOf(select))) return;
    select._buiRich = true;
    ['value', 'selectedIndex'].forEach((prop) => { // select.value = '3' from code repaints the field
      const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, prop);
      Object.defineProperty(select, prop, { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); paintSelectValue(this); } });
    });
    paintSelectValue(select);
  }
  const initRichSelects = (root = document) => root.querySelectorAll?.('select[data-bui-rich], select[data-bui-url]').forEach(initRichSelect);
  initRichSelects();
  new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach((n) => { if (n.nodeType === 1) { if (n.matches('select')) initRichSelect(n); initRichSelects(n); } }))).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('reset', (e) => { setTimeout(() => e.target.querySelectorAll?.('select.bui-select-rich').forEach(paintSelectValue)); });

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
    if (openSel?.select === select) { selectKey(openSel, event); return; }
    const key = event.key;
    if (key === 'Enter' || key === ' ' || ((key === 'ArrowDown' || key === 'ArrowUp') && !event.ctrlKey && !event.metaKey && !event.shiftKey)) { event.preventDefault(); openSelectMenu(select); }
  });
  document.addEventListener('focusout', (event) => {
    if (!openSel) return;
    const t = event.target, rel = event.relatedTarget;
    if ((t === openSel.select || t === openSel.search) && !(rel && (openSel.menu.contains(rel) || rel === openSel.select))) closeSelectMenu();
  });
  document.addEventListener('change', (event) => { // a chosen value validates a floating select right away
    const s = event.target;
    if (s instanceof HTMLSelectElement) paintSelectValue(s);
    if (s instanceof HTMLSelectElement && s.classList.contains('bui-float-input') && s.closest('[data-bui-validate]')) { s.dataset.touched = ''; validateFloat(s); }
  });
  window.addEventListener('resize', schedulePlace);
  window.addEventListener('scroll', (event) => { if ((openSel && !openSel.menu.contains(event.target)) || openDd) schedulePlace(); }, true);
  window.visualViewport?.addEventListener('resize', schedulePlace);

  BUI.select = {
    open: openSelectMenu, close: closeSelectMenu,
    isOpen: (t) => { const s = typeof t === 'string' ? document.querySelector(t) : t; return !!openSel && (!s || openSel.select === s); },
    refresh: (t) => { const s = typeof t === 'string' ? document.querySelector(t) : t; if (s) { initRichSelect(s); paintSelectValue(s); } },
    /* load options from your own code: BUI.select.remote(select, { load({ search, page, signal }) { return { items: [{ value, label, description, image }], hasMore } } }) */
    remote: (t, cfg) => { const s = typeof t === 'string' ? document.querySelector(t) : t; remoteConfigs.set(s, { debounce: 300, perPage: 10, minChars: 0, ...cfg }); initRichSelect(s); return s; },
  };

  /* ---------- Dropdown menu: <div class="bui-dropdown"> toggle + .bui-dropdown-menu ---------- */
  const DD_ITEMS = '.bui-dropdown-item:not([aria-disabled="true"]):not(:disabled)';
  const ddWrap = (n) => n?.closest?.('.bui-dropdown');
  const ddOf = (t) => { const toggle = typeof t === 'string' ? document.querySelector(t) : t, wrap = ddWrap(toggle); return { toggle, wrap, menu: wrap?.querySelector(':scope > .bui-dropdown-menu') }; };
  function placeDropdown() {
    if (!openDd) return;
    if (!placeFloat(openDd.toggle, openDd.menu, openDd, { align: openDd.wrap.dataset.buiAlign || 'start', minWidth: null })) closeDropdown();
  }
  function openDropdown(target, focus = 'menu') {
    const { toggle, wrap, menu } = ddOf(target);
    if (!menu || toggle.disabled || openDd?.menu === menu) return;
    closeDropdown(); closeSelectMenu();
    openDd = { toggle, wrap, menu, place: null, buffer: '', timer: 0 };
    menu.classList.add('bui-dropdown-menu-open');
    if (canPopover) { menu.setAttribute('popover', 'manual'); menu.showPopover(); }
    toggle.setAttribute('aria-expanded', 'true'); wrap.classList.add('bui-dropdown-open');
    placeDropdown();
    const items = [...menu.querySelectorAll(DD_ITEMS)];
    if (focus === 'first' && items.length) items[0].focus(); else if (focus === 'last' && items.length) items[items.length - 1].focus(); else { menu.tabIndex = -1; menu.focus({ preventScroll: true }); }
    wrap.dispatchEvent(new CustomEvent('bui:dropdown-open', { bubbles: true }));
  }
  function closeDropdown(refocus = false) {
    if (!openDd) return;
    const { toggle, wrap, menu, timer } = openDd;
    openDd = null; clearTimeout(timer);
    if (canPopover) { try { menu.hidePopover(); } catch { /* already hidden */ } menu.removeAttribute('popover'); }
    menu.classList.remove('bui-dropdown-menu-open');
    ['left', 'top', 'maxHeight', 'minWidth'].forEach((p) => menu.style.removeProperty(p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)));
    delete menu.dataset.placement;
    toggle.setAttribute('aria-expanded', 'false'); wrap.classList.remove('bui-dropdown-open');
    if (refocus) toggle.focus();
    wrap.dispatchEvent(new CustomEvent('bui:dropdown-close', { bubbles: true }));
  }
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-bui-dropdown-toggle]');
    if (toggle) { // event.detail is 0 for a keyboard click: then focus the first item
      if (openDd?.wrap === ddWrap(toggle)) closeDropdown(); else openDropdown(toggle, event.detail === 0 ? 'first' : 'menu');
      return;
    }
    const item = event.target.closest('.bui-dropdown-item');
    if (!item || !openDd?.menu.contains(item) || item.matches('[aria-disabled="true"], :disabled')) return;
    const role = item.getAttribute('role');
    if (role === 'menuitemcheckbox') item.setAttribute('aria-checked', String(item.getAttribute('aria-checked') !== 'true'));
    if (role === 'menuitemradio') { (item.closest('[role="group"]') || openDd.menu).querySelectorAll('[role="menuitemradio"]').forEach((r) => r.setAttribute('aria-checked', String(r === item))); }
    const { wrap } = openDd;
    wrap.dispatchEvent(new CustomEvent('bui:dropdown-select', { bubbles: true, detail: { item } }));
    if (role !== 'menuitemcheckbox' && role !== 'menuitemradio' && !item.closest('[data-bui-keep-open]')) closeDropdown(true);
  });
  document.addEventListener('mousedown', (event) => { if (openDd && !openDd.wrap.contains(event.target)) closeDropdown(); }, true);
  document.addEventListener('keydown', (event) => {
    const t = event.target, key = event.key;
    const toggle = t.closest?.('[data-bui-dropdown-toggle]');
    if (toggle && !openDd && (key === 'ArrowDown' || key === 'ArrowUp')) { event.preventDefault(); openDropdown(toggle, key === 'ArrowUp' ? 'last' : 'first'); return; }
    if (!openDd || !openDd.wrap.contains(t)) return;
    if (key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeDropdown(true); return; }
    if (key === 'Tab') { closeDropdown(); return; }
    const items = [...openDd.menu.querySelectorAll(DD_ITEMS)], i = items.indexOf(document.activeElement), go = (n) => items[n]?.focus();
    if (!items.length) return;
    if (key === 'ArrowDown') { event.preventDefault(); go(i + 1 < items.length ? i + 1 : 0); }
    else if (key === 'ArrowUp') { event.preventDefault(); go(i > 0 ? i - 1 : items.length - 1); }
    else if (key === 'Home') { event.preventDefault(); go(0); }
    else if (key === 'End') { event.preventDefault(); go(items.length - 1); }
    else if (key === ' ' && document.activeElement.matches('a, [role^="menuitem"]') && !document.activeElement.matches('button')) { event.preventDefault(); document.activeElement.click(); }
    else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) { // type to jump
      openDd.buffer += key.toLowerCase(); clearTimeout(openDd.timer); const st = openDd; st.timer = setTimeout(() => { st.buffer = ''; }, 600);
      const from = openDd.buffer.length === 1 ? i + 1 : Math.max(i, 0);
      for (let k = 0; k < items.length; k++) { const n = (from + k) % items.length; if (norm(items[n].textContent.trim()).startsWith(openDd.buffer)) { go(n); break; } }
    }
  });
  BUI.dropdown = {
    open: (t) => openDropdown(t, 'menu'), close: () => closeDropdown(),
    toggle: (t) => { const { menu } = ddOf(t); if (openDd?.menu === menu) closeDropdown(); else openDropdown(t, 'menu'); },
    isOpen: (t) => { const { menu } = t ? ddOf(t) : {}; return !!openDd && (!t || openDd.menu === menu); },
  };

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

  /* ---------- File upload component ---------- */
  const uploadInstances = new WeakMap();
  const uploadText = {
    en:{type:'File type not allowed: {name}',max:'File exceeds maximum size ({size}).',min:'File is below minimum size ({size}).',count:'You can select up to {count} files.',minimum:'Please select at least {count} file(s).',required:'Please choose at least one file.',selected:'{count} file(s) selected.',empty:'No files selected',cleared:'Selection cleared.',remove:'This browser cannot safely remove one file. Clear the selection and choose again.'},
    ar:{type:'نوع الملف غير مسموح به: {name}',max:'حجم الملف أكبر من الحد المسموح ({size}).',min:'حجم الملف أقل من الحد الأدنى ({size}).',count:'يمكنك اختيار {count} ملفات كحد أقصى.',minimum:'من فضلك اختر {count} ملف على الأقل.',required:'من فضلك اختر ملفا واحدا على الأقل.',selected:'تم اختيار {count} ملف.',empty:'لم يتم اختيار ملفات',cleared:'تم مسح الملفات المختارة.',remove:'المتصفح لا يدعم حذف ملف واحد بأمان. امسح الاختيار واختر الملفات مرة أخرى.'}
  };
  const uMsg=(input,key,data={})=>{const w=input.closest('[data-bui-upload]'),lang=(w?.dataset.errorLanguage||document.documentElement.lang||'en').toLowerCase().startsWith('ar')?'ar':'en';return(uploadText[lang][key]||uploadText.en[key]||key).replace(/\{(\w+)\}/g,(_,k)=>data[k]??'');};
  const uSize=n=>n<1024?n+' B':(n/1024/1024>=1?(n/1024/1024).toFixed(1)+' MB':(n/1024).toFixed(1)+' KB');
  const uExt=n=>n.includes('.')?n.split('.').pop().toLowerCase():'';
  const uGlyph=f=>f.type.startsWith('image/')?'▧':f.type.startsWith('video/')?'▶':f.type.startsWith('audio/')?'♫':({pdf:'PDF',doc:'DOC',docx:'DOC',txt:'TXT',xls:'XLS',xlsx:'XLS',csv:'CSV',zip:'ZIP',rar:'RAR'})[uExt(f.name)]||'FILE';
  const uAccept=(input,f)=>{const rules=(input.accept||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);return !rules.length||rules.some(x=>x.startsWith('.')?('.'+uExt(f.name)===x):x.endsWith('/*')?(f.type||'').startsWith(x.slice(0,-1)):(f.type||'').toLowerCase()===x);};
  const uFeedback=(input,msg,type='error')=>{const w=input.closest('[data-bui-upload]'),el=w?.querySelector('.bui-upload-feedback');if(!el)return;el.textContent=msg||'';el.className='bui-upload-feedback'+(msg?' is-visible is-'+type:'');w.classList.toggle('is-invalid',!!msg&&type==='error');};
  const uRender=(input,files,events=false)=>{const w=input.closest('[data-bui-upload]'),dt=typeof DataTransfer==='function'?new DataTransfer():null;if(!dt&&files.length!==input.files.length){uFeedback(input,uMsg(input,'remove'));return false;}if(dt){files.forEach(f=>dt.items.add(f));try{input.files=dt.files;}catch(_){uFeedback(input,uMsg(input,'remove'));return false;}}
    const chosen=[...input.files],list=w.querySelector('.bui-upload-files');if(list){list.replaceChildren();chosen.forEach((file,i)=>{const card=document.createElement('div');card.className='bui-upload-file';const preview=document.createElement('div');preview.className='bui-upload-preview';preview.setAttribute('aria-hidden','true');if(file.type.startsWith('image/')){const img=document.createElement('img'),url=URL.createObjectURL(file);img.src=url;img.alt='';img.onload=img.onerror=()=>URL.revokeObjectURL(url);preview.append(img);}else preview.textContent=uGlyph(file);const meta=document.createElement('div');meta.className='bui-upload-file-meta';const name=document.createElement('div');name.className='bui-upload-file-name';name.textContent=file.name;name.title=file.name;const detail=document.createElement('div');detail.className='bui-upload-file-detail';detail.textContent=(uExt(file.name)?uExt(file.name).toUpperCase()+' · ':'')+uSize(file.size);const status=document.createElement('div');status.className='bui-upload-file-status';status.dataset.uploadFileStatus='';meta.append(name,detail,status);const rm=document.createElement('button');rm.type='button';rm.className='bui-upload-file-remove';rm.textContent='×';rm.setAttribute('aria-label','Remove '+file.name);rm.dataset.uploadRemove=i;card.append(preview,meta,rm);list.append(card);});}
    const count=w.querySelector('.bui-upload-count');if(count)count.textContent=chosen.length?uMsg(input,'selected',{count:chosen.length}):uMsg(input,'empty');w.classList.toggle('has-files',chosen.length>0);w.classList.toggle('is-disabled',input.disabled);if(events){input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));input.dispatchEvent(new CustomEvent('bui:upload-change',{bubbles:true,detail:{files:[...input.files]}}));}return true;};
  const uValidate=(input,show=true)=>{if(!input)return false;const w=input.closest('[data-bui-upload]');if(!w)return input.checkValidity();const files=[...input.files],max=+w.dataset.maxFiles||0,min=+w.dataset.minFiles||0,maxSize=+w.dataset.maxSize||0,minSize=+w.dataset.minSize||0;let msg='';if(input.required&&!files.length)msg=uMsg(input,'required');else if(min&&files.length<min)msg=uMsg(input,'minimum',{count:min});else if(max&&files.length>max)msg=uMsg(input,'count',{count:max});else for(const f of files){if(!uAccept(input,f)){msg=uMsg(input,'type',{name:f.name});break;}if(maxSize&&f.size>maxSize){msg=uMsg(input,'max',{size:uSize(maxSize)});break;}if(minSize&&f.size<minSize){msg=uMsg(input,'min',{size:uSize(minSize)});break;}}input.setCustomValidity(msg);if(show)uFeedback(input,msg,msg?'error':'success');return !msg;};
  const uInit=w=>{if(uploadInstances.has(w))return uploadInstances.get(w);const input=w.querySelector('input[type=file]');if(!input)return null;const state={files:[...input.files],status:'idle'};uploadInstances.set(w,state);const zone=w.querySelector('.bui-upload-dropzone');w.classList.toggle('is-disabled',input.disabled);zone?.setAttribute('aria-disabled',String(input.disabled));
    input.addEventListener('change',()=>{const selected=input.multiple?state.files.slice():[],seen=new Set(selected.map(f=>f.name+f.size+f.lastModified));let error='';[...input.files].forEach(f=>{const k=f.name+f.size+f.lastModified;if(seen.has(k))return;if(!uAccept(input,f)){error=uMsg(input,'type',{name:f.name});return;}const mx=+w.dataset.maxSize||0,mn=+w.dataset.minSize||0,limit=+w.dataset.maxFiles||0;if(mx&&f.size>mx){error=uMsg(input,'max',{size:uSize(mx)});return;}if(mn&&f.size<mn){error=uMsg(input,'min',{size:uSize(mn)});return;}if(limit&&selected.length>=limit){error=uMsg(input,'count',{count:limit});return;}if(!input.multiple)selected.splice(0);selected.push(f);seen.add(k);});state.files=selected;uRender(input,selected);uValidate(input,false);uFeedback(input,error);});
    w.addEventListener('click',e=>{const rm=e.target.closest('[data-upload-remove]');if(rm){e.preventDefault();e.stopPropagation();const fs=[...input.files];fs.splice(+rm.dataset.uploadRemove,1);if(uRender(input,fs,true)){state.files=[...input.files];input.setCustomValidity('');uFeedback(input,'');}return;}if(e.target.closest('[data-bui-upload-clear]')){input.value='';state.files=[];uRender(input,[],true);input.setCustomValidity('');uFeedback(input,uMsg(input,'cleared'),'success');}});
    w.addEventListener('keydown',e=>{if(zone&&e.target===zone&&['Enter',' '].includes(e.key)){e.preventDefault();if(!input.disabled)input.click();}});
    if(zone){['dragenter','dragover'].forEach(k=>zone.addEventListener(k,e=>{e.preventDefault();if(!input.disabled)w.classList.add('is-dragging');}));['dragleave','dragend'].forEach(k=>zone.addEventListener(k,e=>{if(!zone.contains(e.relatedTarget))w.classList.remove('is-dragging');}));zone.addEventListener('drop',e=>{e.preventDefault();w.classList.remove('is-dragging');if(input.disabled)return;const dt=typeof DataTransfer==='function'?new DataTransfer():null;if(!dt){uFeedback(input,'Drag and drop is not supported by this browser.');return;}const fs=input.multiple?[...input.files]:[];let error='';[...(e.dataTransfer?.files||[])].forEach(f=>{if(!uAccept(input,f)){error=uMsg(input,'type',{name:f.name});return;}const mx=+w.dataset.maxSize||0,mn=+w.dataset.minSize||0,limit=+w.dataset.maxFiles||0;if(mx&&f.size>mx){error=uMsg(input,'max',{size:uSize(mx)});return;}if(mn&&f.size<mn){error=uMsg(input,'min',{size:uSize(mn)});return;}if(limit&&fs.length>=limit){error=uMsg(input,'count',{count:limit});return;}if(!fs.some(x=>x.name===f.name&&x.size===f.size&&x.lastModified===f.lastModified))fs.push(f);});if(!input.multiple)fs.splice(1);fs.forEach(f=>dt.items.add(f));try{input.files=dt.files;state.files=[...input.files];uRender(input,state.files,true);uValidate(input,false);if(error)uFeedback(input,error);}catch(_){uFeedback(input,'Could not read dropped files in this browser.');}});}
    return state;};
  document.querySelectorAll('[data-bui-upload]').forEach(uInit);
  BUI.upload={clear(input){if(!input)return;const w=input.closest('[data-bui-upload]'),s=w&&uInit(w);input.value='';if(s)s.files=[];uRender(input,[],true);input.setCustomValidity('');uFeedback(input,'');},validate(input){return uValidate(input,true);},setStatus(input,status,message=''){const w=input?.closest('[data-bui-upload]');if(!w)return;w.classList.toggle('is-uploading',status==='uploading');uFeedback(input,message,status==='success'?'success':status==='uploading'?'uploading':'error');w.querySelectorAll('[data-upload-file-status]').forEach(n=>{n.textContent=status==='uploading'?'Uploading…':status==='success'?'Uploaded':status==='error'?'Upload failed':'';n.className='bui-upload-file-status'+(status==='success'?' is-success':status==='error'?' is-error':'');});const s=uploadInstances.get(w);if(s)s.status=status;}};
  document.addEventListener('click',e=>{const trigger=e.target.closest('[data-bui-upload-trigger]');if(!trigger)return;const input=document.querySelector(trigger.getAttribute('data-bui-upload-trigger'));if(input&&!input.disabled)input.click();});
  document.addEventListener('submit',e=>{const inputs=[...e.target.querySelectorAll('[data-bui-upload] input[type=file]')];for(const input of inputs){if(!uValidate(input,true)){e.preventDefault();input.focus();break;}}},true);
  document.addEventListener('reset',e=>setTimeout(()=>e.target.querySelectorAll('[data-bui-upload] input[type=file]').forEach(input=>BUI.upload.clear(input)),0));

})();
