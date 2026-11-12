/* Baset UI — Calendar & Scheduler (optional, no dependencies)
 *
 *   <div id="calendar"></div>
 *   const cal = BUI.calendar('#calendar', { view: 'month', events: [...], locale: 'ar', direction: 'rtl' });
 *
 * Month, week and day views · add / edit / delete in a dialog · all-day events · colors and categories · overlapping events
 * side by side · "+N more" · drag to move · drag an edge to resize · drag on an empty slot to create · touch (long-press) ·
 * keyboard · light and dark · LTR and RTL · names and formats from the native Intl API. Needs baset-ui.css (section 23).
 *
 * Event (all times are local, there is no time zone):
 *   { id, title, description, start: '2026-11-04T10:00:00', end: '2026-11-04T11:30:00', allDay: false, color: 'primary', category: 'work' }
 *   All-day: date-only strings, the end day is included:  { start: '2026-11-06', end: '2026-11-08', allDay: true }
 *   color: primary · secondary · success · danger · warning · info, or any CSS color ('#e91e63'). Extra properties are kept.
 *
 * Options (all optional)
 *   view 'month'|'week'|'day'   date (Date or string)   events []   editable true   selectable true   draggable true   resizable true
 *   locale 'en'|'ar'|any BCP-47 tag (default: the page lang)   direction 'auto'|'rtl'|'ltr'   firstDay 0–6 (0 = Sunday; default from the locale)
 *   hour12 true|false|null   views ['month','week','day']   toolbar true   addButton true   categories [{ value, label, color }]
 *   monthMaxEvents 3   hourHeight 52   dayStart 0   dayEnd 24   snap 15   scrollTime '07:00'   height null|px|css length (week/day scroll area)
 *   defaultDuration 60   defaultStartHour 9   confirmDelete true   nowIndicator true   animate true   labels {}   colors [...]
 *   Callbacks (return false from the first four to cancel):
 *   onEventClick(event, jsEvent) · onEventCreate(event) · onEventUpdate(event, oldEvent, { source }) · onEventDelete(event)
 *   onDateClick(date, jsEvent) · onViewChange(view, { start, end, date, title }) · onNavigate(date, view, range)
 *
 * Methods: addEvent(event) · updateEvent(id, data) · removeEvent(id) · getEvents() · getEventById(id) · setEvents(list) ·
 *   setDate(date) · getDate() · setView(view) · getView() · next() · prev() · today() · getRange() · select(date) ·
 *   openEditor(defaults) · showEvent(id) · setOptions(opts) · refresh() · on(name, fn) · off(name, fn) · destroy()
 * Events (DOM, on the container): bui:cal-eventclick · eventcreate · eventupdate · eventdelete · dateclick · viewchange · navigate · change
 * Declarative: <div data-bui-calendar data-bui-view="week" data-bui-locale="ar" data-bui-events='[...]'></div>
 */
(() => {
  'use strict';
  const BUI = (window.BUI = window.BUI || {});
  if (BUI.calendar) return;
  /* BUI.calendar(target, options) creates an instance (new is optional); statics such as BUI.calendar.locales live on the same function */
  const make = (Cls) => { function f(...args) { return new Cls(...args); } Object.setPrototypeOf(f, Cls); Object.defineProperty(f, 'prototype', { value: Cls.prototype }); f.Class = Cls; return f; };

  /* ---------- Labels: add a language with BUI.calendar.locales.fr = { ... } (missing keys fall back to English) ---------- */
  const locales = {
    en: {
      today: 'Today', month: 'Month', week: 'Week', day: 'Day', allDay: 'All day', more: '+{n} more', prev: 'Previous', next: 'Next',
      add: 'Add event', newEvent: 'New event', editEvent: 'Edit event', details: 'Event details', untitled: '(No title)',
      title: 'Title', description: 'Description', startDate: 'Start date', startTime: 'Start time', endDate: 'End date', endTime: 'End time',
      color: 'Color', customColor: 'Custom color', category: 'Category', none: 'None', save: 'Save', cancel: 'Cancel', delete: 'Delete',
      confirmDelete: 'Click again to confirm', edit: 'Edit', close: 'Close', when: 'When', required: 'Please enter a title.',
      badRange: 'The end must be after the start.', badDate: 'Please enter a valid date.', viewLabel: 'Calendar view', navLabel: 'Calendar navigation',
      dayEvents: 'Events on {d}', weekOf: 'Week of {d}', noDescription: 'No description.',
      colors: { primary: 'Primary', secondary: 'Secondary', success: 'Success', danger: 'Danger', warning: 'Warning', info: 'Info' },
    },
    ar: {
      today: 'اليوم', month: 'شهر', week: 'أسبوع', day: 'يوم', allDay: 'طوال اليوم', more: '+{n} أخرى', prev: 'السابق', next: 'التالي',
      add: 'إضافة حدث', newEvent: 'حدث جديد', editEvent: 'تعديل الحدث', details: 'تفاصيل الحدث', untitled: '(بدون عنوان)',
      title: 'العنوان', description: 'الوصف', startDate: 'تاريخ البدء', startTime: 'وقت البدء', endDate: 'تاريخ الانتهاء', endTime: 'وقت الانتهاء',
      color: 'اللون', customColor: 'لون مخصص', category: 'التصنيف', none: 'بدون', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف',
      confirmDelete: 'اضغط مرة أخرى للتأكيد', edit: 'تعديل', close: 'إغلاق', when: 'الموعد', required: 'من فضلك أدخل عنوانًا.',
      badRange: 'يجب أن يكون الانتهاء بعد البدء.', badDate: 'من فضلك أدخل تاريخًا صحيحًا.', viewLabel: 'عرض التقويم', navLabel: 'التنقل في التقويم',
      dayEvents: 'أحداث {d}', weekOf: 'أسبوع {d}', noDescription: 'لا يوجد وصف.',
      colors: { primary: 'أساسي', secondary: 'ثانوي', success: 'نجاح', danger: 'خطر', warning: 'تحذير', info: 'معلومة' },
    },
  };

  const NAMED = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
  const RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ckb'];
  const DEFAULTS = {
    view: 'month', date: null, events: [], editable: true, selectable: true, draggable: true, resizable: true,
    firstDay: null, locale: null, direction: 'auto', hour12: null, views: ['month', 'week', 'day'], toolbar: true, addButton: true,
    categories: null, monthMaxEvents: 3, hourHeight: 52, dayStart: 0, dayEnd: 24, snap: 15, scrollTime: '07:00', height: null,
    defaultDuration: 60, defaultStartHour: 9, confirmDelete: true, nowIndicator: true, animate: true, labels: {}, colors: NAMED,
  };

  /* ---------- Date helpers (local dates) ---------- */
  const DAY = 864e5;
  const pad = (n) => String(n).padStart(2, '0');
  const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes(), d.getSeconds());
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const tstr = (d) => `${key(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const dayDiff = (a, b) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY);
  const dim = (y, m) => new Date(y, m + 1, 0).getDate();
  const parseDate = (v) => {
    if (v instanceof Date) return isNaN(v) ? null : new Date(v);
    if (typeof v === 'number') return new Date(v);
    if (typeof v !== 'string') return null;
    const m = /^(\d{4})-(\d\d)-(\d\d)(?:[T ](\d\d):(\d\d)(?::(\d\d))?)?/.exec(v.trim());
    if (!m) { const d = new Date(v); return isNaN(d) ? null : d; }
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  };
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const sub = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- Tiny DOM helper: text is always set as text, never as HTML ---------- */
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (v === true) n.setAttribute(k, '');
      else n.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) n.append(c);
    return n;
  };

  const chev = (prev) => {
    const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
    s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('width', '14'); s.setAttribute('height', '14'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'bui-cal-flip');
    p.setAttribute('d', prev ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '2'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    s.append(p); return s;
  };
  const instances = new WeakMap();
  let uid = 0;

  class BasetCalendar {
    constructor(target, options = {}) {
      const root = typeof target === 'string' ? document.querySelector(target) : target;
      if (!root) throw new Error('BUI.calendar: container not found');
      if (instances.has(root)) instances.get(root).destroy();
      instances.set(root, this);
      this.el = root;
      this.uid = 'bui-cal-' + ++uid;
      this.o = Object.assign({}, DEFAULTS, options);
      this._ev = [];
      this._h = {};
      this._hidden = new Set();
      this._nextId = 1;
      this.view = ['month', 'week', 'day'].includes(this.o.view) ? this.o.view : 'month';
      this.date = sod(parseDate(this.o.date) || new Date());
      this.selected = null;
      this._seedDirAttr = root.getAttribute('dir');
      this._bind();
      this._setup();
      (this.o.events || []).forEach((e) => this._add(e));
      this.render();
    }

    /* ======================= setup, locale ======================= */
    _setup() {
      const o = this.o, r = this.el;
      this._applyLocale();
      r.classList.add('bui-cal');
      r.style.setProperty('--bui-cal-hour', (+o.hourHeight || 52) + 'px');
      r.style.setProperty('--bui-cal-body-h', o.height == null ? '' : typeof o.height === 'number' ? o.height + 'px' : o.height);
      if (!o.height) r.style.removeProperty('--bui-cal-body-h');
      r.replaceChildren();
      this._buildToolbar();
      this.viewEl = el('div', { class: 'bui-cal-view', id: this.uid + '-view' });
      r.append(this.viewEl);
    }

    _applyLocale() {
      const o = this.o;
      this.loc = o.locale || document.documentElement.lang || 'en';
      let lang = 'en';
      try { lang = new Intl.Locale(this.loc).language; } catch (e) { lang = String(this.loc).split('-')[0]; }
      this.lang = lang;
      this.tdir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'; // direction of the locale's own text (times, dates)
      const base = locales[lang] || locales.en;
      this.L = Object.assign({}, locales.en, base, o.labels || {});
      this.L.colors = Object.assign({}, locales.en.colors, base.colors || {}, (o.labels || {}).colors || {});

      let dir = o.direction;
      if (dir === 'auto' || !dir) dir = o.locale ? (RTL_LANGS.includes(lang) ? 'rtl' : 'ltr') : null;
      if (dir === 'rtl' || dir === 'ltr') this.el.setAttribute('dir', dir);
      else if (this._seedDirAttr == null) this.el.removeAttribute('dir');

      let first = o.firstDay;
      if (first == null) {
        try {
          const li = new Intl.Locale(this.loc), wi = li.weekInfo || (li.getWeekInfo && li.getWeekInfo());
          if (wi && wi.firstDay) first = wi.firstDay % 7;
        } catch (e) { /* older browser */ }
        if (first == null) first = lang === 'ar' ? 6 : 0;
      }
      this.first = clamp(Math.floor(+first) || 0, 0, 6);

      const f = (opt) => { try { return new Intl.DateTimeFormat(this.loc, Object.assign({ calendar: 'gregory' }, opt)); } catch (e) { return new Intl.DateTimeFormat('en', opt); } };
      const h12 = o.hour12 == null ? {} : { hour12: !!o.hour12 };
      this.f = {
        monthYear: f({ month: 'long', year: 'numeric' }),
        dayFull: f({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        dateShort: f({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        dateMid: f({ day: 'numeric', month: 'short', year: 'numeric' }),
        dateBrief: f({ day: 'numeric', month: 'short' }),
        time: f(Object.assign({ hour: 'numeric', minute: '2-digit' }, h12)),
        hour: f(Object.assign({ hour: 'numeric' }, h12)),
        num: (() => { try { return new Intl.NumberFormat(this.loc, { useGrouping: false }); } catch (e) { return new Intl.NumberFormat('en', { useGrouping: false }); } })(),
      };
      const names = (w) => Array.from({ length: 7 }, (_, i) => f({ weekday: w }).format(new Date(2023, 0, 1 + i)));
      this.wd = { short: names('short'), long: names('long'), narrow: names('narrow') };
      const cats = (o.categories || []).map((c) => (typeof c === 'string' ? { value: c, label: c } : { label: c.value, ...c }));
      this.cats = cats;
    }

    _isRtl() { return getComputedStyle(this.el).direction === 'rtl'; }
    _can(what) {
      const o = this.o;
      if (!o.editable) return false;
      if (what === 'drag') return o.draggable !== false;
      if (what === 'resize') return o.resizable !== false;
      if (what === 'select') return o.selectable !== false;
      return true;
    }
    _num(n) { return this.f.num.format(n); }
    _t(d) { return this.f.time.format(d); }

    /* ======================= events: normalise and store ======================= */
    _norm(raw, base) {
      const r = Object.assign({}, raw);
      const ps = parseDate(r.start);
      if (!ps) throw new Error('BUI.calendar: an event needs a valid "start"');
      const dateOnly = typeof r.start === 'string' && /^\d{4}-\d\d-\d\d$/.test(r.start.trim());
      const allDay = r.allDay != null ? !!r.allDay : dateOnly;
      let start, end;
      const pe = r.end != null && r.end !== '' ? parseDate(r.end) : null;
      if (allDay) {
        start = sod(ps);
        let last = pe ? sod(pe) : start;
        if (last < start) last = start;
        end = addDays(last, 1);
      } else {
        start = ps;
        end = pe || new Date(start.getTime() + (+this.o.defaultDuration || 60) * 60000);
        if (end <= start) end = new Date(start.getTime() + (+this.o.snap || 15) * 60000);
      }
      const ev = Object.assign({}, r, { start, end, allDay });
      ev.id = r.id != null && r.id !== '' ? r.id : base ? base.id : this._uniqueId();
      ev.title = r.title == null ? '' : String(r.title);
      ev.description = r.description == null ? '' : String(r.description);
      ev.color = r.color || '';
      ev.category = r.category == null ? '' : r.category;
      return ev;
    }
    _uniqueId() { let id; do { id = 'ev-' + this._nextId++; } while (this._ev.some((e) => e.id === id)); return id; }
    _pub(ev) {
      const o = Object.assign({}, ev);
      if (ev.allDay) { o.start = key(ev.start); o.end = key(addDays(ev.end, -1)); } else { o.start = tstr(ev.start); o.end = tstr(ev.end); }
      return o;
    }
    _get(id) { return this._ev.find((e) => String(e.id) === String(id)); }
    _add(raw) {
      const ev = this._norm(raw);
      const old = this._get(ev.id);
      if (old) ev.id = this._uniqueId();
      this._ev.push(ev);
      return ev;
    }
    _color(ev) {
      if (ev.color) return ev.color;
      const c = this.cats.find((x) => x.value === ev.category);
      return (c && c.color) || 'primary';
    }
    _catLabel(ev) { const c = this.cats.find((x) => x.value === ev.category); return c ? c.label : ev.category || ''; }
    _visible() { return this._hidden.size ? this._ev.filter((e) => !this._hidden.has(e.category)) : this._ev; }

    /* ======================= public API ======================= */
    addEvent(raw) {
      if (Array.isArray(raw)) return raw.map((e) => this.addEvent(e));
      const ev = this._add(raw); this.render(); this._fire('change', [{ type: 'add', event: this._pub(ev) }]);
      return this._pub(ev);
    }
    updateEvent(id, data) {
      const old = this._get(id); if (!old) return null;
      const ev = this._merge(old, data);
      this._ev[this._ev.indexOf(old)] = ev; this.render(); this._fire('change', [{ type: 'update', event: this._pub(ev) }]);
      return this._pub(ev);
    }
    _merge(old, data) {
      const p = this._pub(old), d = Object.assign({}, data);
      if ('start' in d && !('end' in d) && !old.allDay && d.allDay !== true) {
        const ns = parseDate(d.start); if (ns) d.end = new Date(ns.getTime() + (old.end - old.start));
      }
      return this._norm(Object.assign(p, d, { id: old.id }), old);
    }
    removeEvent(id) {
      const ev = this._get(id); if (!ev) return false;
      this._ev.splice(this._ev.indexOf(ev), 1); this.render(); this._fire('change', [{ type: 'remove', event: this._pub(ev) }]);
      return true;
    }
    getEvents() { return this._ev.map((e) => this._pub(e)); }
    getEventById(id) { const e = this._get(id); return e ? this._pub(e) : null; }
    setEvents(list) {
      this._ev = []; (list || []).forEach((e) => this._add(e)); this.render(); this._fire('change', [{ type: 'set' }]);
    }
    getDate() { return new Date(this.date); }
    getView() { return this.view; }
    setDate(d) { const p = parseDate(d); if (!p) return; this._go(p, null); }
    setView(v) {
      if (!['month', 'week', 'day'].includes(v) || v === this.view) return;
      this.view = v; this.render(); this._fire('viewChange', [v, this._info()]);
    }
    next() { this._shift(1); }
    prev() { this._shift(-1); }
    today() { const t = sod(new Date()); this._go(t, t > this.date ? 'next' : t < this.date ? 'prev' : null); }
    select(d) { const p = parseDate(d); if (!p) return; this._pick(sod(p), null, false); }
    refresh() { this.render(); }
    setOptions(opts) {
      Object.assign(this.o, opts || {});
      if (opts && opts.view) this.view = opts.view;
      if (opts && opts.date) this.date = sod(parseDate(opts.date) || this.date);
      this._closeDialog(); this._setup(); this.render();
    }
    on(name, fn) { (this._h[name] = this._h[name] || []).push(fn); return this; }
    off(name, fn) { if (this._h[name]) this._h[name] = fn ? this._h[name].filter((f) => f !== fn) : []; return this; }
    getRange() {
      const d = this.date;
      if (this.view === 'day') return { start: sod(d), end: addDays(sod(d), 1) };
      if (this.view === 'week') { const s = this._weekStart(d); return { start: s, end: addDays(s, 7) }; }
      const first = new Date(d.getFullYear(), d.getMonth(), 1), s = this._weekStart(first);
      const weeks = Math.ceil((dayDiff(s, first) + dim(d.getFullYear(), d.getMonth())) / 7);
      return { start: s, end: addDays(s, weeks * 7) };
    }
    _info() { return Object.assign({ date: this.getDate(), title: this._title() }, this.getRange()); }
    _weekStart(d) { return addDays(sod(d), -((d.getDay() - this.first + 7) % 7)); }

    _shift(n) {
      const d = this.date;
      let t;
      if (this.view === 'month') { const m = d.getMonth() + n; t = new Date(d.getFullYear(), m, Math.min(d.getDate(), dim(d.getFullYear(), m))); }
      else t = addDays(d, (this.view === 'week' ? 7 : 1) * n);
      this._go(t, n > 0 ? 'next' : 'prev');
    }
    _go(d, anim) {
      this.date = sod(d); this.render(anim);
      this._fire('navigate', [this.getDate(), this.view, this.getRange()]);
    }

    _fire(name, args) {
      const cb = this.o['on' + cap(name)];
      let res;
      if (typeof cb === 'function') res = cb.apply(this, args);
      (this._h[name] || []).slice().forEach((fn) => { const r = fn.apply(this, args); if (r === false) res = false; });
      try { this.el.dispatchEvent(new CustomEvent('bui:cal-' + name.toLowerCase(), { bubbles: true, detail: { calendar: this, args } })); } catch (e) { /* ignore */ }
      return res;
    }

    destroy() {
      this._cancelGesture(true);
      clearInterval(this._tick);
      this._closeDialog();
      document.removeEventListener('pointerdown', this._docDown, true);
      document.removeEventListener('keydown', this._docKey, true);
      const r = this.el;
      r.removeEventListener('click', this._onClick); r.removeEventListener('keydown', this._onKey);
      r.removeEventListener('pointerdown', this._onDown); r.removeEventListener('dragstart', this._noDrag);
      r.replaceChildren(); r.classList.remove('bui-cal'); r.style.removeProperty('--bui-cal-hour'); r.style.removeProperty('--bui-cal-body-h');
      if (this._seedDirAttr == null) r.removeAttribute('dir');
      instances.delete(r);
      this._ev = []; this._h = {};
    }

    /* ======================= toolbar ======================= */
    _buildToolbar() {
      const L = this.L, o = this.o;
      if (!o.toolbar) { this.titleEl = el('span', { class: 'bui-cal-title', hidden: true }); this.el.append(this.titleEl); this.tb = null; return; }
      const nav = el('div', { class: 'bui-cal-nav', role: 'group', 'aria-label': L.navLabel },
        el('button', { class: 'bui-cal-btn bui-cal-icon', type: 'button', 'data-act': 'prev', 'aria-label': L.prev, title: L.prev }, chev(true)),
        el('button', { class: 'bui-cal-btn bui-cal-icon', type: 'button', 'data-act': 'next', 'aria-label': L.next, title: L.next }, chev(false)),
        el('button', { class: 'bui-cal-btn', type: 'button', 'data-act': 'today', text: L.today }));
      this.titleEl = el('h2', { class: 'bui-cal-title', 'aria-live': 'polite' });
      const views = (o.views || []).filter((v) => ['month', 'week', 'day'].includes(v));
      const seg = views.length > 1 ? el('div', { class: 'bui-cal-seg', role: 'group', 'aria-label': L.viewLabel }, views.map((v) => el('button', { class: 'bui-cal-btn', type: 'button', 'data-view': v, text: L[v] }))) : null;
      const add = this._can('select') && o.addButton ? el('button', { class: 'bui-cal-btn bui-cal-btn-primary', type: 'button', 'data-act': 'add' }, el('span', { 'aria-hidden': 'true', text: '+ ' }), L.add) : null;
      this.tb = el('div', { class: 'bui-cal-toolbar' }, nav, this.titleEl, el('div', { class: 'bui-cal-tools' }, seg, add));
      this.el.append(this.tb);
      if (this.cats.length) {
        this.legend = el('div', { class: 'bui-cal-legend', role: 'group', 'aria-label': L.category },
          this.cats.map((c) => { const b = el('button', { class: 'bui-cal-legend-item', type: 'button', 'data-act': 'cat', 'data-cat': c.value, 'aria-pressed': this._hidden.has(c.value) ? 'false' : 'true' }, el('i', { class: 'bui-cal-dot' }), c.label); this._paint(b, c.color || 'primary'); return b; }));
        this.el.append(this.legend);
      }
    }
    _title() {
      const d = this.date, f = this.f;
      if (this.view === 'month') return f.monthYear.format(d);
      if (this.view === 'day') return f.dayFull.format(d);
      const r = this.getRange(), e = addDays(r.end, -1);
      try { return f.dateMid.formatRange(r.start, e); } catch (err) { return `${f.dateMid.format(r.start)} – ${f.dateMid.format(e)}`; }
    }
    _paint(node, color) {
      const c = color || 'primary';
      node.style.setProperty('--ev', NAMED.includes(c) ? `var(--bui-${c}-base)` : c);
    }

    /* ======================= render ======================= */
    render(anim) {
      this._closeMore();
      const old = this.viewEl.querySelector('.bui-cal-tg');
      const scroll = old ? old.scrollTop : null;
      this.titleEl.textContent = this._title(); this.titleEl.setAttribute('dir', this.tdir);
      if (this.tb) this.tb.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === this.view ? 'true' : 'false'));
      const body = this.view === 'month' ? this._month() : this._timeGrid(this.view === 'week' ? 7 : 1);
      this.viewEl.dataset.mode = this.view;
      this.viewEl.replaceChildren(body);
      if (anim && this.o.animate) {
        this.viewEl.dataset.anim = anim; void this.viewEl.offsetWidth;
        this.viewEl.classList.remove('is-anim'); void this.viewEl.offsetWidth; this.viewEl.classList.add('is-anim');
      }
      const tg = this.viewEl.querySelector('.bui-cal-tg');
      if (tg) {
        if (scroll != null) tg.scrollTop = scroll;
        else { const m = /^(\d+):(\d+)/.exec(this.o.scrollTime || ''); const mins = m ? +m[1] * 60 + +m[2] : 0; tg.scrollTop = Math.max(0, (mins - this.o.dayStart * 60) / 60 * this.o.hourHeight); }
      }
      clearInterval(this._tick);
      if (this.o.nowIndicator && this.viewEl.querySelector('.bui-cal-now')) this._tick = setInterval(() => this._placeNow(), 30000);
      this._placeNow();
    }

    _index(from, n, only) {
      const map = new Map(), end = addDays(from, n);
      this._visible().forEach((ev) => {
        if (only === 'allDay' && !ev.allDay) return;
        if (only === 'timed' && ev.allDay) return;
        if (ev.end <= from || ev.start >= end) return;
        for (let d = sod(ev.start < from ? from : ev.start); d < ev.end && d < end; d = addDays(d, 1)) {
          const k = key(d); if (!map.has(k)) map.set(k, []); map.get(k).push(ev);
        }
      });
      map.forEach((list) => list.sort((a, b) => (b.allDay - a.allDay) || (a.start - b.start) || ((b.end - b.start) - (a.end - a.start))));
      return map;
    }

    _when(ev, short) {
      const f = this.f, df = short ? f.dateMid : f.dateShort;
      if (ev.allDay) {
        const last = addDays(ev.end, -1);
        return key(ev.start) === key(last) ? `${df.format(ev.start)} · ${this.L.allDay}` : `${df.format(ev.start)} – ${df.format(last)}`;
      }
      if (key(ev.start) === key(addDays(ev.end, 0)) || (ev.end.getHours() === 0 && ev.end.getMinutes() === 0 && key(addDays(ev.end, -1)) === key(ev.start))) return `${df.format(ev.start)} · ${this._t(ev.start)} – ${this._t(ev.end)}`;
      return `${df.format(ev.start)} ${this._t(ev.start)} – ${df.format(ev.end)} ${this._t(ev.end)}`;
    }

    _chip(ev, day) {
      const startsBefore = ev.start < day, endsAfter = ev.end > addDays(day, 1);
      const showTime = !ev.allDay && !startsBefore;
      const n = el('div', {
        class: 'bui-cal-ev bui-cal-chip' + (ev.allDay ? ' is-allday' : '') + (startsBefore ? ' is-cont-prev' : '') + (endsAfter ? ' is-cont-next' : ''),
        role: 'button', tabindex: '0', 'data-id': ev.id, 'data-kind': 'cell', 'data-day': key(day), 'aria-label': `${ev.title || this.L.untitled}, ${this._when(ev)}`, title: ev.title,
      }, ev.allDay ? null : el('i', { class: 'bui-cal-dot' }), el('span', { class: 'bui-cal-ev-time', dir: this.tdir, text: showTime ? this._t(ev.start) : '' }), el('span', { class: 'bui-cal-ev-title', dir: 'auto', text: ev.title || this.L.untitled }));
      this._paint(n, this._color(ev));
      return n;
    }
    _chips(list, day, max) {
      const out = [], shown = list.slice(0, max);
      shown.forEach((ev) => out.push(this._chip(ev, day)));
      if (list.length > shown.length) out.push(el('button', { class: 'bui-cal-more-btn', type: 'button', 'data-act': 'more', 'data-date': key(day), text: sub(this.L.more, { n: this._num(list.length - shown.length) }) }));
      return out;
    }

    /* ----- month ----- */
    _month() {
      const r = this.getRange(), weeks = dayDiff(r.start, r.end) / 7, today = key(new Date()), cur = this.date.getMonth();
      const byDay = this._index(r.start, weeks * 7);
      const tabKey = this.selected && this.selected >= r.start && this.selected < r.end ? key(this.selected) : today >= key(r.start) && today < key(r.end) && new Date().getMonth() === cur ? today : key(new Date(this.date.getFullYear(), cur, 1));
      const head = el('div', { class: 'bui-cal-wdrow', role: 'row' });
      for (let i = 0; i < 7; i++) {
        const w = (this.first + i) % 7;
        head.append(el('div', { class: 'bui-cal-wd', role: 'columnheader', 'aria-label': this.wd.long[w] }, el('span', { class: 'bui-cal-wd-s', text: this.wd.short[w] }), el('span', { class: 'bui-cal-wd-n', text: this.wd.narrow[w] })));
      }
      const grid = el('div', { class: 'bui-cal-grid', role: 'grid', 'aria-label': this.f.monthYear.format(this.date), style: `--rows:${weeks}` });
      for (let i = 0; i < weeks * 7; i++) {
        const d = addDays(r.start, i), k = key(d), list = byDay.get(k) || [];
        const cell = el('div', {
          class: 'bui-cal-cell' + (d.getMonth() !== cur ? ' is-outside' : '') + (k === today ? ' is-today' : '') + (this.selected && key(this.selected) === k ? ' is-selected' : '') + (d.getDay() === 0 || d.getDay() === 6 ? ' is-weekend' : ''),
          role: 'gridcell', 'data-date': k,
        });
        const btn = el('button', { class: 'bui-cal-daybtn', type: 'button', tabindex: k === tabKey ? '0' : '-1', 'data-date': k, 'aria-label': this.f.dayFull.format(d) + (list.length ? ', ' + sub(this.L.dayEvents, { d: '' }).trim() + ' ' + this._num(list.length) : ''), 'aria-current': k === today ? 'date' : null, text: this._num(d.getDate()) });
        cell.append(el('div', { class: 'bui-cal-cellhead' }, btn, list.length > this.o.monthMaxEvents ? el('span', { class: 'bui-cal-count', 'aria-hidden': 'true', text: this._num(list.length) }) : null));
        const wrap = el('div', { class: 'bui-cal-cellevs' }, this._chips(list, d, this.o.monthMaxEvents));
        cell.append(wrap);
        grid.append(cell);
      }
      return el('div', { class: 'bui-cal-month' }, head, grid);
    }

    /* ----- week / day ----- */
    _timeGrid(n) {
      const o = this.o, start = n === 7 ? this._weekStart(this.date) : sod(this.date), days = Array.from({ length: n }, (_, i) => addDays(start, i));
      const today = key(new Date()), cols = `--cols:${n}`;
      const ds = clamp(Math.floor(+o.dayStart) || 0, 0, 23), de = clamp(Math.ceil(+o.dayEnd) || 24, ds + 1, 24), H = +o.hourHeight || 52;
      const allMap = this._index(start, n, 'allDay'), timedMap = this._index(start, n, 'timed');
      const sel = this.selected ? key(this.selected) : '';

      const headRow = el('div', { class: 'bui-cal-tg-row bui-cal-tg-head', style: cols }, el('div', { class: 'bui-cal-gutter' }));
      days.forEach((d) => {
        const k = key(d);
        headRow.append(el('div', { class: 'bui-cal-dayh' + (k === today ? ' is-today' : '') + (k === sel ? ' is-selected' : '') + (d.getDay() === 0 || d.getDay() === 6 ? ' is-weekend' : ''), 'data-date': k },
          el('button', { class: 'bui-cal-daybtn bui-cal-dayhead', type: 'button', 'data-date': k, 'aria-label': this.f.dayFull.format(d), 'aria-current': k === today ? 'date' : null },
            el('span', { class: 'bui-cal-dayh-name', text: this.wd.short[d.getDay()] }), el('span', { class: 'bui-cal-dayh-num', text: this._num(d.getDate()) }))));
      });
      const adRow = el('div', { class: 'bui-cal-tg-row bui-cal-allday', style: cols }, el('div', { class: 'bui-cal-gutter bui-cal-gutter-label', text: this.L.allDay }));
      days.forEach((d) => {
        const k = key(d);
        adRow.append(el('div', { class: 'bui-cal-adcell' + (k === today ? ' is-today' : '') + (k === sel ? ' is-selected' : ''), 'data-date': k }, this._chips(allMap.get(k) || [], d, n === 1 ? 6 : o.monthMaxEvents)));
      });
      const top = el('div', { class: 'bui-cal-tg-top' }, headRow, adRow);

      const gutter = el('div', { class: 'bui-cal-gutter bui-cal-hours', 'aria-hidden': 'true' });
      for (let h = ds; h < de; h++) gutter.append(el('span', { class: 'bui-cal-hour-label', dir: this.tdir, style: `top:${(h - ds) * H}px`, text: h === ds ? '' : this.f.hour.format(new Date(2000, 0, 1, h)) }));
      const inner = el('div', { class: 'bui-cal-tg-inner', style: `${cols};height:${(de - ds) * H}px` }, gutter);
      days.forEach((d) => {
        const k = key(d), col = el('div', { class: 'bui-cal-col' + (k === today ? ' is-today' : '') + (k === sel ? ' is-selected' : ''), 'data-date': k, role: 'group', 'aria-label': this.f.dayFull.format(d) });
        const segs = this._layout(this._segments(timedMap.get(k) || [], d, ds, de));
        segs.forEach((s) => col.append(this._timedEl(s, d, ds, H)));
        if (k === today && o.nowIndicator) col.append(el('div', { class: 'bui-cal-now', 'aria-hidden': 'true' }));
        inner.append(col);
      });
      this._tgMeta = { ds, de, H };
      return el('div', { class: 'bui-cal-tg' + (n === 1 ? ' is-day' : '') }, top, inner);
    }

    _segments(list, day, ds, de) {
      const d0 = sod(day), next = addDays(d0, 1), out = [];
      list.forEach((ev) => {
        if (ev.allDay || ev.end <= d0 || ev.start >= next) return;
        const s = ev.start < d0 ? 0 : ev.start.getHours() * 60 + ev.start.getMinutes();
        const sameEnd = ev.end <= next;
        const e = !sameEnd ? 1440 : ev.end.getTime() === next.getTime() ? 1440 : ev.end.getHours() * 60 + ev.end.getMinutes();
        const s2 = Math.max(s, ds * 60), e2 = Math.min(e, de * 60);
        if (e2 <= s2) return;
        out.push({ ev, s: s2, e: e2, startsHere: ev.start >= d0 && s >= ds * 60, endsHere: sameEnd && e <= de * 60 });
      });
      return out;
    }
    /* Overlaps: events that touch share one cluster; each gets a column in it, so nothing is ever hidden. */
    _layout(segs) {
      segs.sort((a, b) => (a.s - b.s) || (b.e - a.e));
      const minLen = 20;
      let cluster = [], colsEnd = [], clusterEnd = -1;
      const flush = () => { cluster.forEach((x) => { x.cols = colsEnd.length; }); cluster = []; colsEnd = []; clusterEnd = -1; };
      segs.forEach((sg) => {
        const eff = Math.max(sg.e, sg.s + minLen);
        if (cluster.length && sg.s >= clusterEnd) flush();
        let c = colsEnd.findIndex((end) => end <= sg.s);
        if (c < 0) { c = colsEnd.length; colsEnd.push(0); }
        colsEnd[c] = eff; sg.col = c; clusterEnd = Math.max(clusterEnd, eff); cluster.push(sg);
      });
      flush();
      return segs;
    }
    _timedEl(sg, day, ds, H) {
      const ev = sg.ev, top = (sg.s - ds * 60) / 60 * H, h = (sg.e - sg.s) / 60 * H, w = 100 / sg.cols;
      const locked = ev.editable === false;
      const n = el('div', {
        class: 'bui-cal-ev bui-cal-tev' + (sg.startsHere ? '' : ' is-cont-prev') + (sg.endsHere ? '' : ' is-cont-next') + (h < 34 ? ' is-short' : ''),
        role: 'button', tabindex: '0', 'data-id': ev.id, 'data-kind': 'timed', 'data-day': key(day), 'data-s': sg.s, 'data-e': sg.e,
        'aria-label': `${ev.title || this.L.untitled}, ${this._when(ev)}`, title: `${ev.title}\n${this._t(ev.start)} – ${this._t(ev.end)}`,
        style: `top:${top}px;height:${Math.max(h, 18)}px;inset-inline-start:${sg.col * w}%;inline-size:${w}%`,
      }, el('span', { class: 'bui-cal-ev-title', dir: 'auto', text: ev.title || this.L.untitled }), el('span', { class: 'bui-cal-ev-time', dir: this.tdir, text: `${this._t(ev.start)} – ${this._t(ev.end)}` }));
      this._paint(n, this._color(ev));
      if (this._can('resize') && !locked) {
        if (sg.startsHere) n.append(el('span', { class: 'bui-cal-handle bui-cal-handle-start', 'data-edge': 'start', 'aria-hidden': 'true' }));
        if (sg.endsHere) n.append(el('span', { class: 'bui-cal-handle bui-cal-handle-end', 'data-edge': 'end', 'aria-hidden': 'true' }));
      }
      return n;
    }
    _placeNow() {
      const now = this.viewEl.querySelector('.bui-cal-now'); if (!now || !this._tgMeta) return;
      const d = new Date(), m = d.getHours() * 60 + d.getMinutes(), { ds, de, H } = this._tgMeta;
      now.hidden = m < ds * 60 || m > de * 60;
      now.style.top = (m - ds * 60) / 60 * H + 'px';
    }

    /* ======================= "+N more" popover ======================= */
    _openMore(k, btn) {
      this._closeMore();
      const day = fromKey(k), list = (this._index(day, 1).get(k) || []).filter((e) => !this._hidden.has(e.category));
      const pop = el('div', { class: 'bui-cal-more', role: 'dialog', 'aria-label': this.f.dayFull.format(day) },
        el('div', { class: 'bui-cal-more-head' }, el('strong', { text: this.f.dayFull.format(day) }), el('button', { class: 'bui-cal-x', type: 'button', 'data-act': 'close-more', 'aria-label': this.L.close, text: '×' })),
        el('div', { class: 'bui-cal-more-list' }, list.map((ev) => this._chip(ev, day))));
      this.el.append(pop);
      const rr = this.el.getBoundingClientRect(), br = btn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
      let left = br.left - rr.left + br.width / 2 - w / 2, topPos = br.top - rr.top - 6;
      left = clamp(left, 4, Math.max(4, rr.width - w - 4));
      topPos = clamp(topPos, 4, Math.max(4, rr.height - h - 4));
      pop.style.left = left + 'px'; pop.style.top = topPos + 'px';
      this._more = pop; this._moreBtn = btn;
      const first = pop.querySelector('.bui-cal-ev'); (first || pop.querySelector('button')).focus();
    }
    _closeMore(restore) {
      if (!this._more) return;
      this._more.remove(); this._more = null;
      if (restore && this._moreBtn && this._moreBtn.isConnected) this._moreBtn.focus();
    }

    /* ======================= listeners ======================= */
    _bind() {
      this._onClick = (e) => this._click(e);
      this._onKey = (e) => this._key(e);
      this._onDown = (e) => this._down(e);
      this._noDrag = (e) => { if (e.target.closest && e.target.closest('.bui-cal-ev')) e.preventDefault(); };
      this._docDown = (e) => { if (this._more && !this._more.contains(e.target)) this._closeMore(); };
      this._docKey = (e) => { if (e.key === 'Escape' && this._more && !(this._dlg && this._dlg.open)) { e.stopPropagation(); this._closeMore(true); } };
      const r = this.el;
      r.addEventListener('click', this._onClick); r.addEventListener('keydown', this._onKey);
      r.addEventListener('pointerdown', this._onDown); r.addEventListener('dragstart', this._noDrag);
      document.addEventListener('pointerdown', this._docDown, true);
      document.addEventListener('keydown', this._docKey, true);
    }

    _click(e) {
      if (this._suppress) { e.preventDefault(); return; }
      const t = e.target;
      const view = t.closest('[data-view]');
      if (view && this.el.contains(view)) { this.setView(view.dataset.view); return; }
      const act = t.closest('[data-act]');
      if (act && this.el.contains(act)) {
        const a = act.dataset.act;
        if (a === 'prev') this.prev(); else if (a === 'next') this.next(); else if (a === 'today') this.today();
        else if (a === 'add') this.openEditor({});
        else if (a === 'more') this._openMore(act.dataset.date, act);
        else if (a === 'close-more') this._closeMore(true);
        else if (a === 'cat') {
          const c = act.dataset.cat; if (this._hidden.has(c)) this._hidden.delete(c); else this._hidden.add(c);
          act.setAttribute('aria-pressed', this._hidden.has(c) ? 'false' : 'true'); this.render();
        }
        return;
      }
      const evEl = t.closest('.bui-cal-ev');
      if (evEl && this.el.contains(evEl)) {
        const ev = this._get(evEl.dataset.id); if (!ev) return;
        if (this._fire('eventClick', [this._pub(ev), e]) !== false) { this._closeMore(); this.showEvent(ev.id); }
        return;
      }
      const dayBtn = t.closest('.bui-cal-daybtn');
      if (dayBtn) { const d = fromKey(dayBtn.dataset.date); this._pick(d, e, this.view === 'month'); return; }
      const cell = t.closest('.bui-cal-cell');
      if (cell) { this._pick(fromKey(cell.dataset.date), e, true); return; }
      const ad = t.closest('.bui-cal-adcell');
      if (ad) { const d = fromKey(ad.dataset.date); this._pick(d, e, false); if (this._can('select')) this.openEditor({ start: key(d), end: key(d), allDay: true }); }
    }

    /* A date was clicked: highlight it, tell the app, and (month cells) open "new event" for that day. */
    _pick(d, e, create) {
      if (!this._can('select') && this.o.selectable === false) { this._fire('dateClick', [new Date(d), e]); return; }
      this._setSelected(d);
      const r = this._fire('dateClick', [new Date(d), e, { view: this.view }]);
      if (create && r !== false && this._can('select')) {
        const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), this.o.defaultStartHour, 0);
        this.openEditor({ start: tstr(s), end: tstr(new Date(s.getTime() + this.o.defaultDuration * 60000)) });
      }
    }
    _setSelected(d) {
      this.selected = sod(d);
      const k = key(d);
      this.el.querySelectorAll('.is-selected').forEach((n) => n.classList.remove('is-selected'));
      this.el.querySelectorAll(`[data-date="${k}"]`).forEach((n) => { if (n.matches('.bui-cal-cell,.bui-cal-dayh,.bui-cal-adcell,.bui-cal-col')) n.classList.add('is-selected'); });
      this.el.querySelectorAll('.bui-cal-month .bui-cal-daybtn').forEach((b) => b.setAttribute('tabindex', b.dataset.date === k ? '0' : '-1'));
    }

    _key(e) {
      const t = e.target;
      const evEl = t.closest && t.closest('.bui-cal-ev');
      if (evEl && !t.closest('.bui-cal-more')) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); evEl.click(); return; }
        if (e.altKey && e.key.startsWith('Arrow') && this._can('drag')) {
          const ev = this._get(evEl.dataset.id); if (!ev || ev.editable === false) return;
          e.preventDefault();
          const rtl = this._isRtl(); let dd = 0, mm = 0;
          if (e.key === 'ArrowRight') dd = rtl ? -1 : 1; else if (e.key === 'ArrowLeft') dd = rtl ? 1 : -1;
          else { const dir = e.key === 'ArrowDown' ? 1 : -1; if (evEl.dataset.kind === 'timed') mm = dir * this.o.snap; else dd = dir * 7; }
          const ns = this._shiftEv(ev, dd, mm);
          if (this._commit(ev, ns.start, ns.end, 'keyboard')) { const f = this.el.querySelector(`.bui-cal-ev[data-id="${CSS.escape(String(ev.id))}"]`); if (f) f.focus(); }
        }
        return;
      }
      const btn = t.closest && t.closest('.bui-cal-daybtn');
      if (btn && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const rtl = this._isRtl(), month = this.view === 'month'; let n = 0;
        if (e.key === 'ArrowRight') n = rtl ? -1 : 1; else if (e.key === 'ArrowLeft') n = rtl ? 1 : -1; else if (month) n = e.key === 'ArrowDown' ? 7 : -7; else return;
        const target = addDays(fromKey(btn.dataset.date), n), r = this.getRange();
        if (target < r.start || target >= r.end) { this.date = target; this.render(); this._fire('navigate', [this.getDate(), this.view, this.getRange()]); }
        this._setSelected(target);
        const nb = this.el.querySelector(`.bui-cal-daybtn[data-date="${key(target)}"]`); if (nb) nb.focus();
      }
    }

    _shiftEv(ev, dd, mm) {
      const s = addDays(ev.start, dd), e = addDays(ev.end, dd);
      s.setMinutes(s.getMinutes() + mm); e.setMinutes(e.getMinutes() + mm);
      return { start: s, end: e };
    }

    /* Apply a user change (drag, resize, keyboard) after asking onEventUpdate; false from the callback cancels it. */
    _commit(ev, start, end, source) {
      if (+start === +ev.start && +end === +ev.end) return false;
      const upd = Object.assign({}, ev, { start, end });
      const r = this._fire('eventUpdate', [this._pub(upd), this._pub(ev), { source }]);
      if (r === false) return false;
      this._ev[this._ev.indexOf(ev)] = upd; this.render(); this._fire('change', [{ type: 'update', event: this._pub(upd), source }]);
      return true;
    }

    /* ======================= drag, resize, drag-to-create ======================= */
    _down(e) {
      if (this._g || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const t = e.target, evEl = t.closest('.bui-cal-ev');
      let g = null;
      if (evEl && this.el.contains(evEl) && !evEl.closest('.bui-cal-more')) {
        const ev = this._get(evEl.dataset.id); if (!ev || ev.editable === false) return;
        const handle = t.closest('.bui-cal-handle');
        if (!this._can(handle ? 'resize' : 'drag')) return;
        g = { kind: handle ? 'resize' : 'move', edge: handle && handle.dataset.edge, ev, node: evEl, tkind: evEl.dataset.kind, dayKey: evEl.dataset.day, s: +evEl.dataset.s, e: +evEl.dataset.e };
      } else if (!evEl && this._can('select') && t.closest('.bui-cal-col')) {
        const p = this._timeAt(e.clientX, e.clientY); if (!p) return;
        g = { kind: 'select', anchor: p, ev: null };
      } else return;
      Object.assign(g, { x: e.clientX, y: e.clientY, pid: e.pointerId, ptype: e.pointerType, active: false });
      this._g = g;
      if (g.kind !== 'select' && e.pointerType !== 'mouse') {
        if (g.kind === 'resize') this._activate();
        else g.timer = setTimeout(() => { if (this._g === g && !g.active) { this._activate(); if (navigator.vibrate) { try { navigator.vibrate(12); } catch (x) { /* ignore */ } } } }, 330);
      }
      this._mv = (ev2) => this._move(ev2); this._up = (ev2) => this._end(ev2, false); this._cx = (ev2) => this._end(ev2, true);
      this._tm = (ev2) => { if (this._g && this._g.active && ev2.cancelable) ev2.preventDefault(); };
      this._ss = (ev2) => { if (this._g && (this._g.active || this._g.ptype === 'mouse')) ev2.preventDefault(); };
      this._esc = (ev2) => { if (ev2.key === 'Escape') this._cancelGesture(); };
      document.addEventListener('pointermove', this._mv); document.addEventListener('pointerup', this._up); document.addEventListener('pointercancel', this._cx);
      document.addEventListener('touchmove', this._tm, { passive: false }); document.addEventListener('selectstart', this._ss); document.addEventListener('keydown', this._esc, true);
    }

    _activate() {
      const g = this._g; if (!g || g.active) return;
      g.active = true; this.el.classList.add('is-dragging');
      document.documentElement.classList.add('bui-cal-noselect');
      if (g.kind !== 'select') {
        g.node.classList.add('is-source');
        const c = el('div', { class: 'bui-cal-clone', 'aria-hidden': 'true' }, el('strong', { dir: 'auto', text: g.ev.title || this.L.untitled }), el('span', { class: 'bui-cal-clone-when', dir: this.tdir }));
        this._paint(c, this._color(g.ev)); document.body.append(c); g.clone = c;
        if (g.kind === 'move' && g.tkind === 'timed') { const p = this._timeAt(g.x, g.y); g.grab = p ? p.min - g.s : 0; }
        try { g.node.setPointerCapture(g.pid); } catch (x) { /* ignore */ }
      }
    }

    _move(e) {
      const g = this._g; if (!g || e.pointerId !== g.pid) return;
      if (!g.active) {
        const dist = Math.hypot(e.clientX - g.x, e.clientY - g.y);
        if (g.ptype === 'mouse' || g.ptype === 'pen') { if (dist > 4) this._activate(); else return; }
        else if (g.kind === 'select') { if (dist > 8) this._cancelGesture(); return; }
        else { if (dist > 8) this._cancelGesture(); return; }
      }
      if (e.cancelable) e.preventDefault();
      if (g.clone) { g.clone.style.left = e.clientX + 14 + 'px'; g.clone.style.top = e.clientY + 14 + 'px'; }
      const sc = this.viewEl.querySelector('.bui-cal-tg');
      if (sc) { const r = sc.getBoundingClientRect(); if (e.clientY < r.top + 36) sc.scrollTop -= 14; else if (e.clientY > r.bottom - 36) sc.scrollTop += 14; }
      this._update(e.clientX, e.clientY);
    }

    /* Which day (and minute) is under the pointer in the time grid? */
    _timeAt(x, y) {
      const cols = [...this.el.querySelectorAll('.bui-cal-col')]; if (!cols.length || !this._tgMeta) return null;
      let best = null, bd = Infinity;
      cols.forEach((c) => { const r = c.getBoundingClientRect(), d = x < r.left ? r.left - x : x > r.right ? x - r.right : 0; if (d < bd) { bd = d; best = c; } });
      const inner = this.el.querySelector('.bui-cal-tg-inner').getBoundingClientRect(), { ds, H } = this._tgMeta;
      return { key: best.dataset.date, min: clamp(ds * 60 + (y - inner.top) / H * 60, 0, 1440) };
    }
    _cellAt(x, y, sel) {
      const cells = [...this.el.querySelectorAll(sel)]; let best = null, bd = Infinity;
      cells.forEach((c) => {
        const r = c.getBoundingClientRect(), dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0, dy = sel === '.bui-cal-cell' ? (y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0) : 0;
        const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = c; }
      });
      return best && best.dataset.date;
    }
    _snap(m) { const s = +this.o.snap || 15; return Math.round(m / s) * s; }

    _update(x, y) {
      const g = this._g, ev = g.ev;
      let start, end;
      if (g.kind === 'select') {
        const p = this._timeAt(x, y), s = +this.o.snap || 15;
        const a = fromKey(g.anchor.key), ak = a.getTime() + Math.floor(g.anchor.min / s) * s * 60000;
        const c = fromKey(p.key), ck = c.getTime() + Math.floor(p.min / s) * s * 60000;
        const at = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 0, Math.floor(g.anchor.min / s) * s), ct = new Date(c.getFullYear(), c.getMonth(), c.getDate(), 0, Math.floor(p.min / s) * s);
        void ak; void ck;
        start = at <= ct ? at : ct; end = new Date((at <= ct ? ct : at).getTime() + s * 60000);
        g.range = { start, end };
        this._preview(start, end, false);
        return;
      }
      if (g.kind === 'move') {
        if (g.tkind === 'timed') {
          const p = this._timeAt(x, y); if (!p) return;
          const dd = dayDiff(fromKey(g.dayKey), fromKey(p.key)), mm = this._snap(p.min - g.grab) - g.s;
          ({ start, end } = this._shiftEv(ev, dd, mm));
        } else {
          const k = this._cellAt(x, y, this.view === 'month' ? '.bui-cal-cell' : '.bui-cal-adcell'); if (!k) return;
          ({ start, end } = this._shiftEv(ev, dayDiff(fromKey(g.dayKey), fromKey(k)), 0));
        }
      } else {
        const p = this._timeAt(x, y); if (!p) return;
        const c = fromKey(p.key), at = new Date(c.getFullYear(), c.getMonth(), c.getDate(), 0, this._snap(p.min)), min = (+this.o.snap || 15) * 60000;
        if (g.edge === 'end') { start = ev.start; end = at.getTime() - ev.start.getTime() < min ? new Date(ev.start.getTime() + min) : at; }
        else { end = ev.end; start = ev.end.getTime() - at.getTime() < min ? new Date(ev.end.getTime() - min) : at; }
      }
      g.result = { start, end };
      this._preview(start, end, ev.allDay);
      if (g.clone) g.clone.querySelector('.bui-cal-clone-when').textContent = ev.allDay || g.tkind === 'cell' ? (key(start) === key(addDays(end, ev.allDay ? -1 : 0)) ? this.f.dateMid.format(start) : `${this.f.dateBrief.format(start)} – ${this.f.dateBrief.format(ev.allDay ? addDays(end, -1) : end)}`) + (ev.allDay ? '' : ' · ' + this._t(start)) : `${this.f.dateBrief.format(start)} · ${this._t(start)} – ${this._t(end)}`;
    }

    /* The ghost: a dashed box where the event will land (time grid) or highlighted days (month / all-day row). */
    _preview(start, end, allDay) {
      this.el.querySelectorAll('.bui-cal-ghost').forEach((n) => n.remove());
      this.el.querySelectorAll('.is-drop').forEach((n) => n.classList.remove('is-drop'));
      const g = this._g, timedGrid = g && (g.kind === 'select' || g.tkind === 'timed' || g.kind === 'resize');
      if (timedGrid && this._tgMeta) {
        const { ds, de, H } = this._tgMeta, ev = g.ev;
        this.el.querySelectorAll('.bui-cal-col').forEach((col) => {
          const d = fromKey(col.dataset.date), segs = this._segments([{ allDay: false, start, end }], d, ds, de);
          segs.forEach((sg) => {
            const n = el('div', { class: 'bui-cal-ghost', 'aria-hidden': 'true', style: `top:${(sg.s - ds * 60) / 60 * H}px;height:${(sg.e - sg.s) / 60 * H}px` },
              el('span', { dir: this.tdir, text: `${this._t(start)} – ${this._t(end)}` }));
            this._paint(n, ev ? this._color(ev) : 'primary'); col.append(n);
          });
        });
        return;
      }
      const last = allDay ? addDays(end, -1) : (end.getHours() === 0 && end.getMinutes() === 0 ? addDays(end, -1) : end);
      this.el.querySelectorAll('.bui-cal-cell,.bui-cal-adcell').forEach((c) => { const k = c.dataset.date; if (k >= key(start) && k <= key(last) && (this.view === 'month' ? c.classList.contains('bui-cal-cell') : c.classList.contains('bui-cal-adcell'))) c.classList.add('is-drop'); });
    }

    _end(e, cancelled) {
      const g = this._g; if (!g || (e && e.pointerId !== g.pid)) return;
      const active = g.active;
      this._cancelGesture(true);
      if (cancelled) return;
      if (active) {
        this._suppress = true; setTimeout(() => { this._suppress = false; }, 60);
        if (g.kind === 'select') { if (g.range) this.openEditor({ start: tstr(g.range.start), end: tstr(g.range.end) }); }
        else if (g.result) this._commit(g.ev, g.result.start, g.result.end, g.kind === 'move' ? 'drag' : 'resize');
      } else if (g.kind === 'select') {
        const s = +this.o.snap || 15, d = fromKey(g.anchor.key), st = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, Math.floor(g.anchor.min / s) * s);
        this._setSelected(d);
        const r = this._fire('dateClick', [new Date(st), e, { view: this.view }]);
        if (r !== false) this.openEditor({ start: tstr(st), end: tstr(new Date(st.getTime() + this.o.defaultDuration * 60000)) });
      }
    }
    _cancelGesture(silent) {
      const g = this._g; if (!g) return;
      clearTimeout(g.timer);
      document.removeEventListener('pointermove', this._mv); document.removeEventListener('pointerup', this._up); document.removeEventListener('pointercancel', this._cx);
      document.removeEventListener('touchmove', this._tm); document.removeEventListener('selectstart', this._ss); document.removeEventListener('keydown', this._esc, true);
      if (g.clone) g.clone.remove();
      if (g.node) g.node.classList.remove('is-source');
      try { if (g.node) g.node.releasePointerCapture(g.pid); } catch (x) { /* ignore */ }
      this.el.classList.remove('is-dragging'); document.documentElement.classList.remove('bui-cal-noselect');
      this.el.querySelectorAll('.bui-cal-ghost').forEach((n) => n.remove());
      this.el.querySelectorAll('.is-drop').forEach((n) => n.classList.remove('is-drop'));
      this._g = null;
      void silent;
    }

    /* ======================= dialog: details and editor ======================= */
    _dialog(content, label) {
      if (!this._dlg) {
        const d = el('dialog', { class: 'bui-cal-dialog' });
        d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
        d.addEventListener('cancel', () => { this._cleanDlg = true; });
        this.el.append(d); this._dlg = d;
      }
      this._dlg.setAttribute('aria-label', label);
      this._dlg.replaceChildren(content);
      if (!this._dlg.open) { if (typeof this._dlg.showModal === 'function') this._dlg.showModal(); else this._dlg.setAttribute('open', ''); }
    }
    _closeDialog() {
      const d = this._dlg; if (!d) return;
      if (d.open && typeof d.close === 'function') d.close(); else d.removeAttribute('open');
      d.remove(); this._dlg = null;
    }
    _closeDlgOnly() { if (this._dlg && this._dlg.open) this._dlg.close(); }

    _armDelete(btn, run) {
      btn.addEventListener('click', () => {
        if (!this.o.confirmDelete || btn.dataset.armed) { run(); return; }
        btn.dataset.armed = '1'; btn.textContent = this.L.confirmDelete; btn.classList.add('is-armed');
        setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = this.L.delete; btn.classList.remove('is-armed'); } }, 4000);
      });
    }

    showEvent(id) {
      const ev = this._get(id); if (!ev) return;
      const L = this.L, canEdit = this._can('edit') && ev.editable !== false, tid = this.uid + '-dt';
      const cat = this._catLabel(ev);
      const head = el('div', { class: 'bui-cal-dlg-head' },
        el('span', { class: 'bui-cal-dlg-bar', 'aria-hidden': 'true' }),
        el('div', { class: 'bui-cal-dlg-titlewrap' }, el('small', { text: L.details }), el('h3', { id: tid, dir: 'auto', text: ev.title || L.untitled })),
        el('button', { class: 'bui-cal-x', type: 'button', 'aria-label': L.close, text: '×', onclick: '' }));
      head.lastChild.addEventListener('click', () => this._closeDlgOnly());
      this._paint(head, this._color(ev));
      const rows = el('dl', { class: 'bui-cal-dl' },
        el('dt', { text: L.when }), el('dd', { dir: this.tdir, text: this._when(ev) }),
        cat ? [el('dt', { text: L.category }), el('dd', {}, el('i', { class: 'bui-cal-dot' }), ' ' + cat)] : null,
        el('dt', { text: L.description }), el('dd', { class: 'bui-cal-desc' + (ev.description ? '' : ' is-empty'), dir: ev.description ? 'auto' : null, text: ev.description || L.noDescription }));
      const foot = el('div', { class: 'bui-cal-dlg-foot' });
      if (canEdit) {
        const del = el('button', { class: 'bui-cal-btn bui-cal-btn-danger', type: 'button', text: L.delete });
        this._armDelete(del, () => this._userDelete(ev.id));
        const edit = el('button', { class: 'bui-cal-btn bui-cal-btn-primary', type: 'button', text: L.edit });
        edit.addEventListener('click', () => this.openEditor({ id: ev.id }));
        foot.append(del, el('span', { class: 'bui-cal-spacer' }), edit);
      }
      const close = el('button', { class: 'bui-cal-btn', type: 'button', text: L.close }); close.addEventListener('click', () => this._closeDlgOnly());
      foot.append(close);
      const box = el('div', { class: 'bui-cal-dlg' }, head, rows, foot);
      this._dialog(box, ev.title || L.details);
    }

    /* openEditor({}) creates; openEditor({ id }) edits; openEditor({ start, end, allDay, color, ... }) creates with these values. */
    openEditor(def = {}) {
      const L = this.L, editing = def.id != null ? this._get(def.id) : null;
      if (def.id != null && !editing) return;
      if (editing && editing.editable === false) return;
      const base = editing ? this._pub(editing) : Object.assign({ allDay: false }, def);
      if (!editing && !def.start) {
        const s = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.o.defaultStartHour, 0);
        base.start = tstr(s); base.end = tstr(new Date(s.getTime() + this.o.defaultDuration * 60000));
      }
      if (!editing && !base.end) { const ps = parseDate(base.start); base.end = base.allDay ? key(ps) : tstr(new Date(ps.getTime() + this.o.defaultDuration * 60000)); }
      const sd0 = parseDate(base.start), ed0 = parseDate(base.end) || sd0, allDay0 = !!base.allDay || (typeof base.start === 'string' && /^\d{4}-\d\d-\d\d$/.test(base.start) && base.allDay !== false);
      const id = this.uid + '-f';
      const state = { color: base.color || '', touched: !!base.color };
      const inp = (name, type, value, extra) => el('input', Object.assign({ class: 'bui-input', type, name, id: id + '-' + name, value: value == null ? '' : value }, extra));
      const field = (label, name, control) => el('label', { class: 'bui-field', for: id + '-' + name }, label, control);

      const title = inp('title', 'text', base.title || '', { required: true, autocomplete: 'off', maxlength: 160 });
      const desc = el('textarea', { class: 'bui-input bui-cal-textarea', name: 'description', id: id + '-description', rows: 3, text: base.description || '' });
      const sd = inp('sd', 'date', key(sd0)), st = inp('st', 'time', `${pad(sd0.getHours())}:${pad(sd0.getMinutes())}`);
      const ed = inp('ed', 'date', key(allDay0 ? ed0 : ed0)), et = inp('et', 'time', `${pad(ed0.getHours())}:${pad(ed0.getMinutes())}`);
      const allDay = el('input', { type: 'checkbox', name: 'allDay', id: id + '-allDay' }); allDay.checked = allDay0;
      const err = el('p', { class: 'bui-cal-err', role: 'alert', hidden: true });
      const timeBoxes = [field(L.startTime, 'st', st), field(L.endTime, 'et', et)];
      const syncAll = () => { timeBoxes.forEach((b) => { b.hidden = allDay.checked; }); st.disabled = et.disabled = allDay.checked; };

      let catCtl;
      if (this.cats.length) {
        catCtl = el('select', { class: 'bui-input', name: 'category', id: id + '-category' }, el('option', { value: '', text: L.none }), this.cats.map((c) => el('option', { value: c.value, text: c.label })));
        catCtl.value = base.category == null ? '' : base.category;
        catCtl.addEventListener('change', () => { const c = this.cats.find((x) => x.value === catCtl.value); if (c && c.color && !state.touched) { state.color = c.color; paintSw(); } });
      } else {
        const dl = el('datalist', { id: id + '-cats' }, [...new Set(this._ev.map((e) => e.category).filter(Boolean))].map((c) => el('option', { value: c })));
        catCtl = el('span', { class: 'bui-cal-inline' }, inp('category', 'text', base.category || '', { list: id + '-cats', autocomplete: 'off', maxlength: 40 }), dl);
      }

      const sw = el('div', { class: 'bui-cal-swatches', role: 'group', 'aria-label': L.color });
      const custom = el('input', { type: 'color', class: 'bui-cal-colorpick', 'aria-label': L.customColor, title: L.customColor, value: /^#[0-9a-f]{6}$/i.test(state.color) ? state.color : '#6658e8' });
      const paintSw = () => {
        sw.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.c === state.color || (!state.color && b.dataset.c === 'primary') ? 'true' : 'false'));
        custom.classList.toggle('is-on', !NAMED.includes(state.color) && !!state.color);
      };
      (this.o.colors || NAMED).forEach((c) => {
        const b = el('button', { class: 'bui-cal-swatch', type: 'button', 'data-c': c, 'aria-pressed': 'false', title: L.colors[c] || c, 'aria-label': L.colors[c] || c });
        this._paint(b, c); b.addEventListener('click', () => { state.color = c; state.touched = true; paintSw(); }); sw.append(b);
      });
      custom.addEventListener('input', () => { state.color = custom.value; state.touched = true; paintSw(); });
      sw.append(custom);
      allDay.addEventListener('change', syncAll);

      const form = el('form', { class: 'bui-cal-form', novalidate: true },
        el('div', { class: 'bui-cal-dlg-head' }, el('span', { class: 'bui-cal-dlg-bar', 'aria-hidden': 'true' }),
          el('div', { class: 'bui-cal-dlg-titlewrap' }, el('small', { text: editing ? L.editEvent : L.newEvent }), el('h3', { text: editing ? (base.title || L.untitled) : L.newEvent })),
          el('button', { class: 'bui-cal-x', type: 'button', 'aria-label': L.close, text: '×', 'data-x': '' })),
        el('div', { class: 'bui-cal-fields' },
          field(L.title, 'title', title), field(L.description, 'description', desc),
          el('label', { class: 'bui-checkline', for: id + '-allDay' }, allDay, ' ' + L.allDay),
          el('div', { class: 'bui-cal-row2' }, field(L.startDate, 'sd', sd), timeBoxes[0], field(L.endDate, 'ed', ed), timeBoxes[1]),
          el('div', { class: 'bui-cal-row2' }, field(L.category, 'category', catCtl), el('div', { class: 'bui-field' }, el('span', { text: L.color }), sw)),
          err),
        el('div', { class: 'bui-cal-dlg-foot' }));
      const foot = form.querySelector('.bui-cal-dlg-foot');
      if (editing) { const del = el('button', { class: 'bui-cal-btn bui-cal-btn-danger', type: 'button', text: L.delete }); this._armDelete(del, () => this._userDelete(editing.id)); foot.append(del); }
      foot.append(el('span', { class: 'bui-cal-spacer' }), el('button', { class: 'bui-cal-btn', type: 'button', 'data-x': '', text: L.cancel }), el('button', { class: 'bui-cal-btn bui-cal-btn-primary', type: 'submit', text: L.save }));
      form.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => this._closeDlgOnly()));
      this._paint(form.querySelector('.bui-cal-dlg-head'), state.color || 'primary');
      const repaintHead = () => this._paint(form.querySelector('.bui-cal-dlg-head'), state.color || 'primary');
      sw.addEventListener('click', repaintHead); custom.addEventListener('input', repaintHead);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fail = (msg, node) => { err.textContent = msg; err.hidden = false; if (node) node.focus(); };
        const t = title.value.trim();
        if (!t) return fail(L.required, title);
        const ad = allDay.checked, sdv = sd.value, edv = ed.value || sdv;
        if (!sdv || !parseDate(sdv)) return fail(L.badDate, sd);
        const raw = { title: t, description: desc.value, allDay: ad, color: state.color, category: catCtl.value != null ? catCtl.value : (catCtl.querySelector('input') || {}).value || '' };
        if (ad) { if (edv < sdv) return fail(L.badRange, ed); raw.start = sdv; raw.end = edv; }
        else {
          raw.start = `${sdv}T${st.value || '00:00'}`; raw.end = `${edv}T${et.value || st.value || '00:00'}`;
          if (parseDate(raw.end) <= parseDate(raw.start)) return fail(L.badRange, ed);
        }
        const ok = editing ? this._userUpdate(editing, raw, 'edit') : this._userCreate(raw);
        if (ok !== false) this._closeDlgOnly();
      });
      paintSw(); syncAll();
      this._dialog(form, editing ? L.editEvent : L.newEvent);
      setTimeout(() => title.focus(), 0);
    }

    _userCreate(raw) {
      let ev; try { ev = this._norm(raw); } catch (e) { return false; }
      if (this._fire('eventCreate', [this._pub(ev)]) === false) return false;
      this._add(ev); this._ev[this._ev.length - 1].id = ev.id; this.render(); this._fire('change', [{ type: 'add', event: this._pub(ev), source: 'user' }]);
      return true;
    }
    _userUpdate(old, raw, source) {
      let ev; try { ev = this._merge(old, raw); } catch (e) { return false; }
      if (this._fire('eventUpdate', [this._pub(ev), this._pub(old), { source }]) === false) return false;
      this._ev[this._ev.indexOf(old)] = ev; this.render(); this._fire('change', [{ type: 'update', event: this._pub(ev), source }]);
      return true;
    }
    _userDelete(id) {
      const ev = this._get(id); if (!ev) return;
      if (this._fire('eventDelete', [this._pub(ev)]) === false) return;
      this._ev.splice(this._ev.indexOf(ev), 1); this._closeDlgOnly(); this.render(); this._fire('change', [{ type: 'remove', event: this._pub(ev), source: 'user' }]);
    }
  }

  BasetCalendar.locales = locales;
  BasetCalendar.instance = (node) => instances.get(typeof node === 'string' ? document.querySelector(node) : node) || null;
  BasetCalendar.init = (root = document) => {
    root.querySelectorAll('[data-bui-calendar]').forEach((n) => {
      if (instances.has(n)) return;
      const d = n.dataset, o = {};
      if (d.buiView) o.view = d.buiView;
      if (d.buiLocale) o.locale = d.buiLocale;
      if (d.buiDirection) o.direction = d.buiDirection;
      if (d.buiFirstDay) o.firstDay = +d.buiFirstDay;
      if (d.buiEditable) o.editable = d.buiEditable !== 'false';
      if (d.buiEvents) { try { o.events = JSON.parse(d.buiEvents); } catch (e) { console.error('BUI.calendar: data-bui-events is not valid JSON'); } }
      new BasetCalendar(n, o);
    });
  };
  BUI.calendar = make(BasetCalendar);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => BasetCalendar.init()); else BasetCalendar.init();
})();
