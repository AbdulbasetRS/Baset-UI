/* Baset UI Stepper / Wizard v1.0.0 — optional, dependency-free.
 *
 * Markup (see components/stepper.html):
 *   <form class="bui-stepper" data-bui-stepper data-bui-validate novalidate>
 *     <ol class="bui-stepper-list">
 *       <li class="bui-step"><button type="button" class="bui-step-head"><span class="bui-step-marker">1</span>
 *         <span class="bui-step-text"><span class="bui-step-title">Account</span></span></button></li> …
 *     </ol>
 *     <div class="bui-stepper-panel">…step 1…</div> …            (one panel per step, in the same order)
 *     <div class="bui-stepper-actions">
 *       <button type="button" class="bui-btn bui-btn-outline" data-bui-step-prev>Back</button>
 *       <button type="button" class="bui-btn bui-btn-primary" data-bui-step-next>Next</button>
 *       <button type="button" class="bui-btn bui-btn-success" data-bui-step-finish>Finish</button>
 *     </div>
 *   </form>
 *
 * JavaScript:  const wizard = BUI.stepper('#wizard', { linear: true, validate: true, onChange(to, from) {} });
 *   Extra button: [data-bui-step-reset] restarts the wizard and clears the form.
 *   Methods:  next() · prev() · goTo(i) · validate(i) · finish() · complete() · reset(clearForm) · setState(i, 'done' | 'error' | '') · destroy()
 *   Props:    current (index) · count · states (array: '', 'done', 'error')
 *   Options:  start (0) · linear (true) · clickable (true | 'done' | false) · validate (true | false | fn(i, panel, stepper))
 *             beforeChange(to, from, stepper) · onChange(to, from, stepper) · onInvalid(i, stepper) · onFinish(stepper)
 *             animate (true) · focus (true) · enterKey (true) · labels { status: 'Step {n} of {total}: {title}' }
 *   Attributes: data-bui-start · data-bui-linear="false" · data-bui-clickable="done|false" · data-bui-validate="false"
 *               (also on one panel to skip its validation) · data-bui-animate="false" · data-bui-enter-key="false"
 *   Events (bubble from the stepper): bui:stepper-change {from, to} · bui:stepper-invalid {index} · bui:stepper-finish (cancelable)
 *   Validation: .bui-float fields use BUI.float.validate (baset-ui.js); other fields use the browser's constraint validation.
 */
(() => {
  'use strict';
  const BUI = (window.BUI = window.BUI || {});
  if (BUI.stepper) return;
  const doc = document;
  const instances = new WeakMap();
  let uid = 0;

  const DEFAULTS = {
    start: 0, linear: true, clickable: true, validate: true, animate: true, focus: true, enterKey: true,
    beforeChange: null, onChange: null, onInvalid: null, onFinish: null,
    labels: { status: 'Step {n} of {total}: {title}', complete: 'All steps completed' },
  };
  const flag = (v, d) => (v === undefined ? d : v !== 'false');
  const readAttrs = (d) => {
    const a = {};
    if (d.buiStart !== undefined) a.start = parseInt(d.buiStart, 10) || 0;
    if (d.buiLinear !== undefined) a.linear = flag(d.buiLinear);
    if (d.buiClickable !== undefined) a.clickable = d.buiClickable === 'done' ? 'done' : flag(d.buiClickable);
    if (d.buiValidate !== undefined) a.validate = flag(d.buiValidate);
    if (d.buiAnimate !== undefined) a.animate = flag(d.buiAnimate);
    if (d.buiEnterKey !== undefined) a.enterKey = flag(d.buiEnterKey);
    return a;
  };
  const fire = (el, name, detail, cancelable = false) => {
    const e = new CustomEvent(name, { bubbles: true, cancelable, detail });
    el.dispatchEvent(e);
    return !e.defaultPrevented;
  };
  const make = (Cls) => { function f(...args) { return new Cls(...args); } Object.setPrototypeOf(f, Cls); Object.defineProperty(f, 'prototype', { value: Cls.prototype }); f.Class = Cls; return f; };

  /* Checks the fields of one panel. Returns the first invalid control, or null when everything is valid. */
  function checkPanel(panel) {
    let first = null;
    panel.querySelectorAll('.bui-float').forEach((f) => {
      const input = f.querySelector('.bui-float-input');
      if (!input || input.disabled) return;
      input.dataset.touched = ''; // later typing revalidates this field (needs data-bui-validate on the form)
      const ok = BUI.float && BUI.float.validate ? BUI.float.validate(f) : input.checkValidity();
      if (!ok && !first) first = input;
    });
    panel.querySelectorAll('input, select, textarea').forEach((c) => {
      if (c.closest('.bui-float') || c.disabled || c.type === 'hidden' || c.type === 'button' || c.type === 'submit') return;
      const ok = c.checkValidity();
      if (ok) c.removeAttribute('aria-invalid'); else { c.setAttribute('aria-invalid', 'true'); if (!first) first = c; }
    });
    return first;
  }

  class Stepper {
    constructor(target, options = {}) {
      const host = typeof target === 'string' ? doc.querySelector(target) : target;
      if (!host) throw new Error('BUI.stepper: target not found: ' + target);
      if (instances.has(host)) return instances.get(host);
      instances.set(host, this);
      this.el = host;
      this.id = host.id || `bui-stepper-${++uid}`;
      this.o = { ...DEFAULTS, ...readAttrs(host.dataset), ...options, labels: { ...DEFAULTS.labels, ...options.labels } };
      this.steps = [...host.querySelectorAll('.bui-stepper-list > .bui-step')];
      this.heads = this.steps.map((s) => s.querySelector('.bui-step-head'));
      this.panels = [...host.querySelectorAll('.bui-stepper-panel')];
      this.count = this.steps.length;
      if (!this.count) throw new Error('BUI.stepper: no .bui-step found in ' + this.id);
      this.prevBtns = [...host.querySelectorAll('[data-bui-step-prev]')];
      this.nextBtns = [...host.querySelectorAll('[data-bui-step-next]')];
      this.finishBtns = [...host.querySelectorAll('[data-bui-step-finish]')];
      this.doneEl = host.querySelector('[data-bui-stepper-done]');
      this.states = this.steps.map((s) => (s.classList.contains('bui-step-error') ? 'error' : s.classList.contains('bui-step-done') ? 'done' : ''));
      const preset = this.steps.findIndex((s) => s.classList.contains('bui-step-active'));
      this.current = Math.max(0, Math.min(this.count - 1, preset >= 0 && options.start === undefined && host.dataset.buiStart === undefined ? preset : this.o.start));
      for (let i = 0; i < this.current; i++) if (!this.states[i]) this.states[i] = 'done';
      this.busy = false;
      this.completed = false;
      this.ctrl = new AbortController();

      // accessibility: ids, relations and a live region that announces the step
      this.heads.forEach((h, i) => {
        if (!h) return;
        if (!h.id) h.id = `${this.id}-head-${i + 1}`;
        if (this.panels[i]) h.setAttribute('aria-controls', (this.panels[i].id ||= `${this.id}-panel-${i + 1}`));
      });
      this.panels.forEach((p, i) => { p.setAttribute('role', 'group'); p.tabIndex = -1; if (this.heads[i]) p.setAttribute('aria-labelledby', this.heads[i].id); });
      this.live = doc.createElement('div');
      this.live.className = 'bui-sr-only'; this.live.setAttribute('role', 'status'); this.live.setAttribute('aria-live', 'polite');
      host.append(this.live);
      host.noValidate = true;

      const sig = { signal: this.ctrl.signal };
      host.addEventListener('click', (e) => this._click(e), sig);
      host.addEventListener('keydown', (e) => this._key(e), sig);
      this._paint(false);
      host.dispatchEvent(new CustomEvent('bui:stepper-ready', { bubbles: true, detail: { stepper: this } }));
    }

    /* ---- navigation ---- */
    next() { return this.current < this.count - 1 ? this.goTo(this.current + 1) : Promise.resolve(false); }
    prev() { return this.current > 0 ? this.goTo(this.current - 1) : Promise.resolve(false); }

    async goTo(to, { force = false } = {}) {
      to = Math.max(0, Math.min(this.count - 1, Number(to)));
      if (Number.isNaN(to) || this.busy || to === this.current) return to === this.current;
      this.busy = true;
      try {
        const from = this.current;
        if (!force && to > from && this.o.linear) {
          for (let i = from; i < to; i++) {
            if (!(await this.validate(i, { focus: false }))) { // stop on the first step that is not valid and show it
              if (i !== from) await this._show(i, from);
              this._focusInvalid(this._invalid);
              return false;
            }
          }
        }
        if (!force && this.o.beforeChange && (await this.o.beforeChange(to, from, this)) === false) return false;
        await this._show(to, from);
        return true;
      } finally { this.busy = false; }
    }

    async _show(to, from) {
      this.current = to;
      this.completed = false;
      this._paint(true, to > from ? 'forward' : 'back');
      const info = { from, to, stepper: this };
      fire(this.el, 'bui:stepper-change', info);
      if (this.o.onChange) this.o.onChange(to, from, this);
    }

    /* ---- validation ---- */
    async validate(i = this.current, { focus = true } = {}) {
      const panel = this.panels[i];
      let ok = true, first = null;
      if (this.o.validate !== false && !(panel && panel.dataset.buiValidate === 'false')) {
        if (panel) { first = checkPanel(panel); ok = !first; }
        if (ok && typeof this.o.validate === 'function') {
          const r = await this.o.validate(i, panel, this);
          ok = r !== false && typeof r !== 'string';
          if (typeof r === 'string') { // a text result is the error message: show it on the first field and announce it
            const f = panel && panel.querySelector('.bui-float');
            if (f && BUI.float && BUI.float.setState) { BUI.float.setState(f, 'error', r, { open: true }); first = f.querySelector('.bui-float-input'); }
            this._say(r);
          }
        }
      }
      this.states[i] = ok ? 'done' : 'error';
      this._invalid = ok ? null : first;
      this._paint(false);
      if (!ok) {
        if (focus && i === this.current) this._focusInvalid(first);
        fire(this.el, 'bui:stepper-invalid', { index: i, stepper: this });
        if (this.o.onInvalid) this.o.onInvalid(i, this);
      }
      return ok;
    }
    _focusInvalid(control) {
      if (!control) return;
      const f = control.closest('.bui-float');
      if (f && BUI.float && BUI.float.open) BUI.float.open(f, true);
      control.focus({ preventScroll: false });
      if (!f && control.reportValidity) control.reportValidity();
    }

    /* ---- finish, complete, reset ---- */
    async finish() {
      if (this.busy) return false;
      for (let i = 0; i < this.count; i++) {
        if (!(await this.validate(i, { focus: false }))) { if (i !== this.current) await this.goTo(i, { force: true }); this._focusInvalid(this._invalid); return false; }
      }
      if (!fire(this.el, 'bui:stepper-finish', { stepper: this }, true)) return true;
      if (this.o.onFinish) this.o.onFinish(this);
      const form = this.el.matches('form') ? this.el : this.el.closest('form');
      if (form && form.requestSubmit) form.requestSubmit(); else this.complete();
      return true;
    }
    complete() {
      this.states = this.states.map(() => 'done');
      this.completed = true;
      this._paint(false);
      this._say(this.o.labels.complete);
    }
    reset(clearForm = false) {
      this.states = this.states.map(() => '');
      this.completed = false;
      if (clearForm) { const form = this.el.matches('form') ? this.el : this.el.closest('form'); if (form) form.reset(); }
      this.current = Math.max(0, Math.min(this.count - 1, this.o.start));
      this._paint(true, 'back');
    }
    setState(i, state) {
      if (i < 0 || i >= this.count) return;
      this.states[i] = state === 'done' || state === 'error' ? state : '';
      this._paint(false);
    }
    destroy() {
      this.ctrl.abort(); this.live.remove(); instances.delete(this.el);
    }

    /* ---- rendering ---- */
    _say(text) { this.live.textContent = ''; setTimeout(() => { this.live.textContent = text; }, 30); }
    _paint(moved, direction) {
      const { current, states, completed } = this;
      this.steps.forEach((s, i) => {
        const active = i === current && !completed;
        s.classList.toggle('bui-step-active', active);
        s.classList.toggle('bui-step-done', states[i] === 'done' && !(active && states[i] === 'done'));
        s.classList.toggle('bui-step-error', states[i] === 'error');
        const h = this.heads[i];
        if (!h) return;
        if (active) h.setAttribute('aria-current', 'step'); else h.removeAttribute('aria-current');
        if (h.tagName === 'BUTTON') {
          const c = this.o.clickable;
          h.disabled = c === false || (c === 'done' && !(states[i] === 'done' || i === current));
        }
      });
      this.panels.forEach((p, i) => {
        const show = i === current && !completed;
        const was = !p.hidden;
        p.hidden = !show;
        if (show && !was && moved && this.o.animate) {
          p.dataset.buiMotion = direction === 'back' ? 'back' : 'forward';
          p.addEventListener('animationend', () => { delete p.dataset.buiMotion; }, { once: true });
        } else if (!show) delete p.dataset.buiMotion;
      });
      const last = current === this.count - 1;
      this.prevBtns.forEach((b) => { b.hidden = completed || current === 0; });
      this.nextBtns.forEach((b) => { b.hidden = completed || last; });
      this.finishBtns.forEach((b) => { b.hidden = completed || !last; });
      this.el.querySelectorAll('.bui-stepper-count').forEach((c) => { c.textContent = `${current + 1} / ${this.count}`; });
      if (this.doneEl) this.doneEl.hidden = !completed;
      this.el.classList.toggle('bui-stepper-complete', completed);
      if (moved) {
        const title = (this.steps[current].querySelector('.bui-step-title') || {}).textContent || '';
        this._say(this.o.labels.status.replace('{n}', current + 1).replace('{total}', this.count).replace('{title}', title.trim()));
        const p = this.panels[current];
        if (p && this.o.focus && this._started) p.focus({ preventScroll: false });
      }
      this._started = true;
    }

    /* ---- events ---- */
    _own(el) { return el && el.closest('.bui-stepper') === this.el; }
    _click(e) {
      const t = e.target;
      const head = t.closest('.bui-step-head');
      if (head && this._own(head) && head.tagName === 'BUTTON') { const i = this.heads.indexOf(head); if (i >= 0 && !head.disabled) this.goTo(i); return; }
      const btn = t.closest('[data-bui-step-prev], [data-bui-step-next], [data-bui-step-finish], [data-bui-step-reset]');
      if (!btn || !this._own(btn) || btn.disabled) return;
      if ('buiStepPrev' in btn.dataset) this.prev();
      else if ('buiStepNext' in btn.dataset) this.next();
      else if ('buiStepReset' in btn.dataset) this.reset(true);
      else this.finish();
    }
    _key(e) {
      const t = e.target;
      const head = t.closest && t.closest('.bui-step-head');
      if (head && this._own(head) && head.tagName === 'BUTTON') { // arrow keys move between the step buttons
        const vertical = this.el.classList.contains('bui-stepper-vertical'), rtl = getComputedStyle(this.el).direction === 'rtl';
        const list = this.heads.filter((h) => h && h.tagName === 'BUTTON' && !h.disabled), i = list.indexOf(head);
        let n = -1;
        if (e.key === (vertical ? 'ArrowDown' : (rtl ? 'ArrowLeft' : 'ArrowRight'))) n = (i + 1) % list.length;
        else if (e.key === (vertical ? 'ArrowUp' : (rtl ? 'ArrowRight' : 'ArrowLeft'))) n = (i - 1 + list.length) % list.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = list.length - 1;
        if (n >= 0 && list[n]) { e.preventDefault(); list[n].focus(); }
        return;
      }
      if (e.key === 'Enter' && this.o.enterKey && !e.isComposing && t.tagName === 'INPUT' && !/^(button|submit|reset|checkbox|radio|file)$/.test(t.type) && this.panels.some((p) => p.contains(t)) && this._own(t)) {
        e.preventDefault();
        if (this.current === this.count - 1) this.finish(); else this.next();
      }
    }
  }

  const init = (root = doc) => { root.querySelectorAll('[data-bui-stepper]').forEach((el) => { if (!instances.has(el)) new Stepper(el); }); };
  BUI.stepper = Object.assign(make(Stepper), { init, get: (t) => instances.get(typeof t === 'string' ? doc.querySelector(t) : t) || null, defaults: DEFAULTS });
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => init()); else init();
})();
