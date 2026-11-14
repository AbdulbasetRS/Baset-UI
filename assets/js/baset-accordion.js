/* Baset UI Accordion v1.0.0 — optional, dependency-free.
 *
 * Markup (see components/accordion.html):
 *   <div class="bui-accordion" data-bui-accordion>
 *     <div class="bui-accordion-item bui-accordion-open">
 *       <h3 class="bui-accordion-header">
 *         <button type="button" class="bui-accordion-trigger">
 *           <span class="bui-accordion-icon"><i class="bui-icon-light bui-icon-user"></i></span>   <!-- optional -->
 *           <span class="bui-accordion-title">Account</span>
 *           <span class="bui-accordion-indicator"></span>
 *         </button>
 *       </h3>
 *       <div class="bui-accordion-panel"><div class="bui-accordion-body"><div class="bui-accordion-content">…</div></div></div>
 *     </div> …
 *   </div>
 *
 * JavaScript:  const acc = BUI.accordion('#faq', { multiple: true, open: [0], onToggle(index, open, acc) {} });
 *   Methods:   open(i) · close(i) · toggle(i) · openAll() · closeAll() · enable(i) · disable(i) · isOpen(i) · destroy()
 *   Props:     items · openIndexes (array) · count
 *   Options:   multiple (false: opening one closes the others) · collapsible (true: in single mode the open item may be closed)
 *              open (index, array of indexes or 'all'; default: the items that have .bui-accordion-open) · animate (true) · onToggle(index, open, accordion)
 *   Attributes: data-bui-multiple · data-bui-collapsible="false" · data-bui-animate="false" · data-bui-open="0,2" | "all"
 *   Buttons:   [data-bui-accordion-expand="#id"] and [data-bui-accordion-collapse="#id"] (document-wide, no JavaScript to write)
 *   Disabled:  .bui-accordion-disabled on the item (or disabled on its button), or enable() / disable()
 *   Events (bubble from the item): bui:accordion-toggle { index, open, accordion }
 *   Nesting:   an accordion may sit inside another one's content; each one only manages its own items.
 */
(() => {
  'use strict';
  const BUI = (window.BUI = window.BUI || {});
  if (BUI.accordion) return;
  const doc = document;
  const instances = new WeakMap();
  let uid = 0;

  const DEFAULTS = { multiple: false, collapsible: true, animate: true, open: null, onToggle: null };
  const flag = (v, d) => (v === undefined ? d : v !== 'false');
  const readAttrs = (d) => {
    const a = {};
    if (d.buiMultiple !== undefined) a.multiple = flag(d.buiMultiple);
    if (d.buiCollapsible !== undefined) a.collapsible = flag(d.buiCollapsible);
    if (d.buiAnimate !== undefined) a.animate = flag(d.buiAnimate);
    if (d.buiOpen !== undefined) a.open = d.buiOpen === 'all' ? 'all' : d.buiOpen.split(',').map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n));
    return a;
  };
  const make = (Cls) => { function f(...args) { return new Cls(...args); } Object.setPrototypeOf(f, Cls); Object.defineProperty(f, 'prototype', { value: Cls.prototype }); f.Class = Cls; return f; };

  class Accordion {
    constructor(target, options = {}) {
      const host = typeof target === 'string' ? doc.querySelector(target) : target;
      if (!host) throw new Error('BUI.accordion: target not found: ' + target);
      if (instances.has(host)) return instances.get(host);
      instances.set(host, this);
      this.el = host;
      this.id = host.id || `bui-accordion-${++uid}`;
      this.o = { ...DEFAULTS, ...readAttrs(host.dataset), ...options };
      this.items = [...host.querySelectorAll(':scope > .bui-accordion-item')];
      this.triggers = this.items.map((it) => it.querySelector(':scope > .bui-accordion-header .bui-accordion-trigger'));
      this.panels = this.items.map((it) => it.querySelector(':scope > .bui-accordion-panel'));
      this.count = this.items.length;
      if (!this.count) throw new Error('BUI.accordion: no .bui-accordion-item found in ' + this.id);
      this.ctrl = new AbortController();

      this.items.forEach((it, i) => {
        const t = this.triggers[i], p = this.panels[i];
        if (!t || !p) return;
        t.id ||= `${this.id}-trigger-${i + 1}`;
        p.id ||= `${this.id}-panel-${i + 1}`;
        t.setAttribute('aria-controls', p.id);
        p.setAttribute('role', 'region');
        p.setAttribute('aria-labelledby', t.id);
        if (it.classList.contains('bui-accordion-disabled') || t.disabled) this._setDisabled(i, true);
      });

      // initial state: the option, the data attribute, or the items marked open in the markup
      let start = this.o.open;
      if (start == null) start = this.items.map((it, i) => (it.classList.contains('bui-accordion-open') ? i : -1)).filter((i) => i >= 0);
      if (start === 'all') start = this.items.map((_, i) => i);
      if (typeof start === 'number') start = [start];
      if (!this.o.multiple) start = start.slice(0, 1);
      this.state = this.items.map((_, i) => start.includes(i));
      host.classList.toggle('bui-accordion-static', !this.o.animate);
      this._paint();

      const sig = { signal: this.ctrl.signal };
      host.addEventListener('click', (e) => {
        const t = e.target.closest('.bui-accordion-trigger');
        if (!t || t.closest('.bui-accordion') !== host || t.disabled) return;
        const i = this.triggers.indexOf(t);
        if (i >= 0) this.toggle(i);
      }, sig);
      host.addEventListener('keydown', (e) => this._key(e), sig);
    }

    get openIndexes() { return this.state.map((on, i) => (on ? i : -1)).filter((i) => i >= 0); }
    isOpen(i) { return !!this.state[i]; }
    isDisabled(i) { return this.items[i] ? this.items[i].classList.contains('bui-accordion-disabled') : false; }

    open(i) { return this._set(i, true); }
    close(i) { return this._set(i, false); }
    toggle(i) { return this._set(i, !this.state[i]); }
    openAll() { if (!this.o.multiple) return false; this.items.forEach((_, i) => { if (!this.isDisabled(i)) this._set(i, true); }); return true; }
    closeAll() { this.items.forEach((_, i) => this._set(i, false, true)); }
    enable(i) { this._setDisabled(i, false); this._paint(); }
    disable(i) { this._setDisabled(i, true); this._paint(); }
    destroy() { this.ctrl.abort(); instances.delete(this.el); }

    _set(i, on, force = false) {
      if (i < 0 || i >= this.count || this.state[i] === on || this.isDisabled(i)) return false;
      if (!on && !force && !this.o.multiple && !this.o.collapsible) return false; // one item has to stay open
      const changed = [];
      if (on && !this.o.multiple) this.state.forEach((v, k) => { if (v && k !== i) { this.state[k] = false; changed.push(k); } });
      this.state[i] = on;
      changed.push(i);
      this._paint();
      changed.forEach((k) => this._announce(k));
      return true;
    }
    _announce(i) {
      const open = this.state[i];
      this.items[i].dispatchEvent(new CustomEvent('bui:accordion-toggle', { bubbles: true, detail: { index: i, open, accordion: this } }));
      if (this.o.onToggle) this.o.onToggle(i, open, this);
    }
    _setDisabled(i, on) {
      const it = this.items[i], t = this.triggers[i];
      if (!it) return;
      it.classList.toggle('bui-accordion-disabled', on);
      if (t) { t.disabled = on; if (on) t.setAttribute('aria-disabled', 'true'); else t.removeAttribute('aria-disabled'); }
    }
    _paint() {
      const locked = !this.o.multiple && !this.o.collapsible; // the one open item cannot be closed by the person
      this.items.forEach((it, i) => {
        const on = this.state[i], t = this.triggers[i];
        it.classList.toggle('bui-accordion-open', on);
        if (!t) return;
        t.setAttribute('aria-expanded', String(on));
        if (!this.isDisabled(i)) { if (locked && on) t.setAttribute('aria-disabled', 'true'); else t.removeAttribute('aria-disabled'); }
      });
    }
    _key(e) {
      const t = e.target.closest && e.target.closest('.bui-accordion-trigger');
      if (!t || t.closest('.bui-accordion') !== this.el) return;
      const list = this.triggers.filter((x) => x && !x.disabled), i = list.indexOf(t);
      let n = -1;
      if (e.key === 'ArrowDown') n = (i + 1) % list.length;
      else if (e.key === 'ArrowUp') n = (i - 1 + list.length) % list.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = list.length - 1;
      if (n >= 0 && list[n]) { e.preventDefault(); list[n].focus(); }
    }
  }

  const init = (root = doc) => { root.querySelectorAll('[data-bui-accordion]').forEach((el) => { if (!instances.has(el)) new Accordion(el); }); };
  const get = (t) => instances.get(typeof t === 'string' ? doc.querySelector(t) : t) || null;
  BUI.accordion = Object.assign(make(Accordion), { init, get, defaults: DEFAULTS });

  // declarative buttons: <button data-bui-accordion-expand="#faq">Expand all</button>
  doc.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bui-accordion-expand], [data-bui-accordion-collapse]');
    if (!b) return;
    const expand = b.hasAttribute('data-bui-accordion-expand');
    const acc = get(b.getAttribute(expand ? 'data-bui-accordion-expand' : 'data-bui-accordion-collapse'));
    if (acc) { if (expand) acc.openAll(); else acc.closeAll(); }
  });

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => init()); else init();
})();
