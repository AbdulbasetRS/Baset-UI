/* Baset UI — Date & time pickers (optional, no dependencies)
 *
 * Adds a custom picker to the native date / time / datetime-local / month / week inputs:
 *   <input type="date" class="bui-input" data-bui-datetime>
 * The native <input> stays in the page and stays the source of truth: id, name, value, min, max, step, required,
 * disabled, readonly, validation and form submit work as before, and you can still type into it. The picker only
 * writes the value (in the native format) and fires `input` and `change`. Needs baset-ui.css (section 18).
 *
 * Attributes (all optional)
 *   data-bui-click-open="false"   open only from the button (default: a click anywhere on the field opens it)
 *   data-bui-datetime            enable; on a text input give the type: data-bui-datetime="week"
 *   data-bui-locale="ar-EG"      names and digits (default: nearest lang attribute)
 *   data-bui-first-day="6"       first weekday, 0 = Sunday … 6 = Saturday (default: from the locale; week = Monday)
 *   data-bui-hour12="true"       12-hour clock (default: from the locale)
 *   data-bui-week-numbers        show ISO week numbers next to the days
 *   data-bui-size="sm|lg"        calendar size
 *   data-bui-mode="popover|sheet" force one layout (default: popover, a bottom sheet on narrow screens)
 *   data-bui-popup-class="x"     extra class on the popup, for custom colors
 *
 * JavaScript: BUI.datetime.init(root) · open(input) · close() · isOpen(input) · locales
 * Events (on the input): bui:datetime-open · bui:datetime-close
 */
(() => {
  'use strict';
  const BUI = (window.BUI = window.BUI || {});
  if (BUI.datetime) return;

  const TYPES = ['date', 'time', 'datetime-local', 'month', 'week'];
  const HINT = { date: 'YYYY-MM-DD', time: 'HH:MM', 'datetime-local': 'YYYY-MM-DDTHH:MM', month: 'YYYY-MM', week: 'YYYY-Www' };
  const SELECTOR = 'input[data-bui-datetime]';

  /* ---------- Labels: add a language with BUI.datetime.locales.fr = { ... } (missing keys fall back to English) ---------- */
  const locales = {
    en: {
      open: { date: 'Choose date', time: 'Choose time', 'datetime-local': 'Choose date and time', month: 'Choose month', week: 'Choose week' },
      prevMonth: 'Previous month', nextMonth: 'Next month', prevYear: 'Previous year', nextYear: 'Next year', prevYears: 'Previous years', nextYears: 'Next years',
      month: 'Month', year: 'Year', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', period: 'AM / PM', time: 'Time', weekN: 'Week {n}', weekHead: 'Wk',
      today: 'Today', thisMonth: 'This month', thisWeek: 'This week', now: 'Now', clear: 'Clear', done: 'Done',
      invalid: 'Use the format {f}.', min: 'Value must be {v} or later.', max: 'Value must be {v} or earlier.', step: 'Please choose a valid value.',
    },
    ar: {
      open: { date: 'اختيار التاريخ', time: 'اختيار الوقت', 'datetime-local': 'اختيار التاريخ والوقت', month: 'اختيار الشهر', week: 'اختيار الأسبوع' },
      prevMonth: 'الشهر السابق', nextMonth: 'الشهر التالي', prevYear: 'السنة السابقة', nextYear: 'السنة التالية', prevYears: 'السنوات السابقة', nextYears: 'السنوات التالية',
      month: 'الشهر', year: 'السنة', hours: 'الساعات', minutes: 'الدقائق', seconds: 'الثواني', period: 'صباحًا / مساءً', time: 'الوقت', weekN: 'الأسبوع {n}', weekHead: 'أس',
      today: 'اليوم', thisMonth: 'هذا الشهر', thisWeek: 'هذا الأسبوع', now: 'الآن', clear: 'مسح', done: 'تم',
      invalid: 'استخدم الصيغة {f}.', min: 'يجب أن تكون القيمة {v} أو بعده.', max: 'يجب أن تكون القيمة {v} أو قبله.', step: 'اختر قيمة صالحة.',
    },
  };
  const sub = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);

  /* ---------- Date math on whole days: no time zones, so there are no daylight-saving surprises ---------- */
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const mod = (a, n) => ((a % n) + n) % n;
  const serial = (y, m, d) => { const t = new Date(0); t.setUTCFullYear(y, m - 1, d); return Math.round(t.getTime() / 864e5); }; // days since 1970-01-01
  const ymd = (s) => { const t = new Date(s * 864e5); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
  const dow = (s) => mod(s + 4, 7); // 0 = Sunday
  const dim = (y, m) => serial(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, 1) - serial(y, m, 1);
  const mIdx = (y, m) => y * 12 + m - 1;
  const fromMIdx = (i) => ({ y: Math.floor(i / 12), m: mod(i, 12) + 1 });
  const monOf = (s) => s - mod(dow(s) + 6, 7); // Monday of the ISO week
  const isoWeek = (s) => { const th = monOf(s) + 3, y = ymd(th).y; return { y, w: Math.floor((th - serial(y, 1, 1)) / 7) + 1 }; };
  const weekMon = (y, w) => monOf(serial(y, 1, 4)) + (w - 1) * 7;
  const weeksIn = (y) => isoWeek(serial(y, 12, 28)).w;
  const addMonths = (s, n) => { const { y, m, d } = ymd(s), r = fromMIdx(mIdx(y, m) + n); return serial(r.y, r.m, Math.min(d, dim(r.y, r.m))); };
  const todayS = () => { const n = new Date(); return serial(n.getFullYear(), n.getMonth() + 1, n.getDate()); };
  const nowT = () => { const n = new Date(); return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds(); };

  /* ---------- One table per input type: parse the native value, format it back, and give it a number to compare ----------
     ord = the value as one whole number: date = day, month = month, week = week, time = second, datetime-local = second */
  const parseTime = (v) => { const m = /^(\d\d):(\d\d)(?::(\d\d)(?:\.\d{1,3})?)?$/.exec(v); if (!m || +m[1] > 23 || +m[2] > 59 || +(m[3] || 0) > 59) return null; return +m[1] * 3600 + +m[2] * 60 + +(m[3] || 0); };
  const fmtTime = (t, sec) => `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}${sec || t % 60 ? `:${pad(t % 60)}` : ''}`;
  const KIND = {
    date: {
      parse(v) { const m = /^(\d{4,})-(\d\d)-(\d\d)$/.exec(v); if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > dim(+m[1], +m[2])) return null; return { s: serial(+m[1], +m[2], +m[3]) }; },
      fmt: (p) => { const { y, m, d } = ymd(p.s); return `${pad(y, 4)}-${pad(m)}-${pad(d)}`; },
      ord: (p) => p.s, step: 1, epoch: 0,
    },
    month: {
      parse(v) { const m = /^(\d{4,})-(\d\d)$/.exec(v); if (!m || +m[2] < 1 || +m[2] > 12) return null; return { mi: mIdx(+m[1], +m[2]) }; },
      fmt: (p) => { const { y, m } = fromMIdx(p.mi); return `${pad(y, 4)}-${pad(m)}`; },
      ord: (p) => p.mi, step: 1, epoch: 1970 * 12,
    },
    week: {
      parse(v) { const m = /^(\d{4,})-W(\d\d)$/.exec(v); if (!m || +m[2] < 1 || +m[2] > weeksIn(+m[1])) return null; return { s: weekMon(+m[1], +m[2]) }; },
      fmt: (p) => { const { y, w } = isoWeek(p.s); return `${pad(y, 4)}-W${pad(w)}`; },
      ord: (p) => (p.s + 3) / 7, step: 1, epoch: 0,
    },
    time: {
      parse(v) { const t = parseTime(v); return t === null ? null : { t }; },
      fmt: (p, sec) => fmtTime(p.t, sec),
      ord: (p) => p.t, step: 60, epoch: 0,
    },
    'datetime-local': {
      parse(v) { const m = /^(.+?)[T ](.+)$/.exec(v); const d = m && KIND.date.parse(m[1]), t = m && parseTime(m[2]); return d && t !== null ? { s: d.s, t } : null; },
      fmt: (p, sec) => `${KIND.date.fmt(p)}T${fmtTime(p.t, sec)}`,
      ord: (p) => p.s * 86400 + p.t, step: 60, epoch: 0,
    },
  };

  /* ---------- Locale formatters (cached) ---------- */
  const fmtCache = new Map();
  function formats(loc) {
    if (fmtCache.has(loc)) return fmtCache.get(loc);
    const dt = (o) => new Intl.DateTimeFormat(loc, { timeZone: 'UTC', ...o });
    const per = (h) => dt({ hour: 'numeric', hour12: true }).formatToParts(new Date(Date.UTC(2000, 0, 1, h))).find((p) => p.type === 'dayPeriod')?.value || (h < 12 ? 'AM' : 'PM');
    const f = {
      nf: new Intl.NumberFormat(loc, { useGrouping: false }),
      nf2: new Intl.NumberFormat(loc, { useGrouping: false, minimumIntegerDigits: 2 }),
      month: dt({ month: 'long' }), monthShort: dt({ month: 'short' }), year: dt({ year: 'numeric' }),
      full: dt({ dateStyle: 'full' }), wdShort: dt({ weekday: 'short' }), wdLong: dt({ weekday: 'long' }),
      hour12: dt({ hour: 'numeric' }).resolvedOptions().hour12 === true,
      am: per(1), pm: per(13),
      first: 0,
    };
    try { const L = new Intl.Locale(loc), w = L.getWeekInfo ? L.getWeekInfo() : L.weekInfo; if (w) f.first = w.firstDay % 7; else if (/^ar/i.test(loc)) f.first = 6; } catch { /* old browser: Sunday */ }
    fmtCache.set(loc, f);
    return f;
  }
  const on = (s, f) => f.format(new Date(s * 864e5));

  /* ---------- Everything the picker needs to know about one input right now (read each time it opens) ---------- */
  function localeOf(input) {
    const loc = input.dataset.buiLocale || input.closest('[lang]')?.getAttribute('lang') || navigator.language || 'en';
    try { Intl.DateTimeFormat.supportedLocalesOf(loc); return loc; } catch { return 'en'; }
  }
  const labelsFor = (loc) => ({ ...locales.en, ...(locales[loc.split('-')[0].toLowerCase()] || {}) });

  function context(input, type) {
    const loc = localeOf(input);
    const lang = loc.split('-')[0].toLowerCase(), F = formats(loc), K = KIND[type];
    const T = labelsFor(loc);
    const get = (n) => input.getAttribute(n);
    const ordOf = (v) => { const p = v ? K.parse(v) : null; return p ? K.ord(p) : null; };
    const min = ordOf(get('min')), max = ordOf(get('max'));
    const clock = type === 'time' || type === 'datetime-local';
    let step = K.step, any = false;
    const sa = get('step');
    if (sa !== null) { if (sa.trim().toLowerCase() === 'any') any = true; else { const n = parseFloat(sa); if (n > 0 && Number.isFinite(n)) step = Math.max(1, Math.round(n)); } }
    const base = min ?? K.epoch;
    const wrap = type === 'time' && min !== null && max !== null && min > max; // 22:00 → 06:00 is allowed for time
    const inRange = (o) => (wrap ? o >= min || o <= max : (min === null || o >= min) && (max === null || o <= max));
    const aligned = (o) => any || mod(o - base, step) === 0;
    const showSec = clock && !any && (step % 60 !== 0 || mod(base, 60) !== 0);
    const h12attr = input.dataset.buiHour12;
    const c = {
      input, type, K, loc, F, T, min, max, step, any, base, showSec,
      hour12: h12attr === undefined ? F.hour12 : h12attr !== 'false',
      first: type === 'week' ? 1 : input.dataset.buiFirstDay !== undefined ? mod(parseInt(input.dataset.buiFirstDay, 10) || 0, 7) : F.first,
      weekNums: input.hasAttribute('data-bui-week-numbers') || type === 'week',
      g: showSec ? 1 : 60, // granularity (seconds) of the time lists
      ok: (o) => inRange(o) && aligned(o),
      aligned, inRange,
      dayOrd(s) { return type === 'week' ? (monOf(s) + 3) / 7 : s; },
    };
    // Is any selectable value inside the days [a, b]?  (days of the calendar → values of this input type)
    c.hasDays = (a, b) => {
      let lo, hi;
      if (type === 'date') { lo = a; hi = b; }
      else if (type === 'datetime-local') { lo = a * 86400; hi = b * 86400 + 86399; }
      else if (type === 'week') { lo = (monOf(a) + 3) / 7; hi = (monOf(b) + 3) / 7; }
      else { lo = mIdx(ymd(a).y, ymd(a).m); hi = mIdx(ymd(b).y, ymd(b).m); }
      if (!wrap) { if (min !== null) lo = Math.max(lo, min); if (max !== null) hi = Math.min(hi, max); }
      return lo <= hi && (any ? lo : lo + mod(base - lo, step)) <= hi;
    };
    c.okDay = (s) => (type === 'datetime-local' ? c.hasDays(s, s) : c.ok(c.dayOrd(s)));
    // The calendar days at the ends of the allowed range (null = no limit)
    const dayOf = (o) => (type === 'date' ? o : type === 'datetime-local' ? Math.floor(o / 86400) : type === 'week' ? o * 7 - 3 : serial(fromMIdx(o).y, fromMIdx(o).m, 1));
    c.minDay = type === 'time' || min === null ? null : dayOf(min);
    c.maxDay = type === 'time' || max === null ? null : type === 'week' ? max * 7 - 3 + 6 : type === 'month' ? serial(fromMIdx(max + 1).y, fromMIdx(max + 1).m, 1) - 1 : dayOf(max);
    c.okT = (day, t) => c.ok(type === 'time' ? t : day * 86400 + t);
    // Nearest allowed time of day to `target` while keeping the fixed hour / minute
    c.nearestT = (day, target, fixed = {}) => {
      let a = 0, b = 86399;
      if (fixed.h != null) { a = fixed.h * 3600; b = a + 3599; if (fixed.m != null) { a += fixed.m * 60; b = a + 59; } }
      let best = null, bd = Infinity;
      for (let t = a; t <= b; t += c.g) if (c.okT(day, t) && Math.abs(t - target) < bd) { best = t; bd = Math.abs(t - target); }
      return best;
    };
    // { aligned, allowed } for the times from t0 to t1 on `day`
    c.scan = (day, t0, t1) => {
      let al = false, ok = false;
      for (let t = t0; t <= t1; t += c.g) { if (aligned(type === 'time' ? t : day * 86400 + t)) { al = true; if (c.okT(day, t)) { ok = true; break; } } }
      return { aligned: al, allowed: ok };
    };
    return c;
  }

  /* ---------- DOM helpers ---------- */
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const button = (cls, act, label, text) => { const b = el('button', cls, text); b.type = 'button'; if (act) b.dataset.act = act; if (label) b.setAttribute('aria-label', label); return b; };
  const labelOf = (input) => (input.labels?.[0]?.firstChild?.textContent?.trim() || input.labels?.[0]?.textContent.trim() || input.getAttribute('aria-label') || '').replace(/\s+/g, ' ');

  /* ---------- Open picker state ---------- */
  const states = new WeakMap();
  let openSt = null, uid = 0, frame = 0;

  const read = (st) => { const p = st.input.value ? KIND[st.type].parse(st.input.value) : null; return p; };

  function write(st, p) { // the one place that changes the input value
    const input = st.input, sec = st.c.showSec;
    const v = p ? st.c.K.fmt(p, sec) : '';
    if (input.value === v) return false;
    input.value = v;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  /* ---------- Calendar ---------- */
  function renderCal(st, keep) {
    const { c, cal } = st, { T, F } = c;
    cal.replaceChildren();
    const live = st.live, view = st.view, y = st.cur.y;
    const head = el('div', 'bui-dt-head');
    const prevLabel = view === 'days' ? T.prevMonth : view === 'months' ? T.prevYear : T.prevYears;
    const nextLabel = view === 'days' ? T.nextMonth : view === 'months' ? T.nextYear : T.nextYears;
    const prev = button('bui-dt-nav', 'prev', prevLabel), next = button('bui-dt-nav', 'next', nextLabel);
    const mid = el('div', 'bui-dt-titles');
    let first, last; // first and last day of the shown period, to disable the arrows at the limits
    const base = serial(y, st.cur.m, 1);
    if (view === 'days') {
      first = base; last = base + dim(y, st.cur.m) - 1;
      mid.append(button('bui-dt-title', 'to-months', T.month, on(base, F.month)), button('bui-dt-title', 'to-years', T.year, F.nf.format(y)));
    } else if (view === 'months') {
      first = serial(y, 1, 1); last = serial(y, 12, 31);
      mid.append(button('bui-dt-title', 'to-years', T.year, F.nf.format(y)));
    } else {
      const s0 = y - mod(y, 12);
      first = serial(s0, 1, 1); last = serial(s0 + 11, 12, 31);
      mid.append(el('span', 'bui-dt-title bui-dt-title-static', `${F.nf.format(s0)} – ${F.nf.format(s0 + 11)}`));
    }
    prev.disabled = c.minDay !== null && c.minDay >= first;
    next.disabled = c.maxDay !== null && c.maxDay <= last;
    head.append(prev, mid, next);
    cal.append(head);

    if (view === 'days') cal.append(daysGrid(st)); else cal.append(cellsGrid(st, view));
    const text = view === 'days' ? `${on(base, F.month)} ${F.nf.format(y)}` : view === 'months' ? F.nf.format(y) : '';
    if (live && text && live.textContent !== text) live.textContent = text;

    if (keep) (cal.querySelector(`[data-act="${keep}"]:not(:disabled)`) || cal.querySelector('[tabindex="0"]'))?.focus({ preventScroll: true });
  }

  function daysGrid(st) {
    const { c } = st, { T, F } = c, sel = st.value, today = todayS();
    const table = el('table', 'bui-dt-grid'); table.setAttribute('role', 'grid');
    table.setAttribute('aria-label', `${on(serial(st.cur.y, st.cur.m, 1), F.month)} ${F.nf.format(st.cur.y)}`);
    const thead = el('thead'), hr = el('tr');
    if (c.weekNums) { const th = el('th', 'bui-dt-wk', T.weekHead); th.scope = 'col'; th.setAttribute('aria-hidden', 'true'); hr.append(th); }
    for (let i = 0; i < 7; i++) {
      const wd = (c.first + i) % 7, s = 3 + wd; // 1970-01-04 is a Sunday
      const th = el('th', null, on(s, F.wdShort)); th.scope = 'col'; th.abbr = on(s, F.wdLong); hr.append(th);
    }
    thead.append(hr); table.append(thead);
    const tbody = el('tbody');
    const firstOfMonth = serial(st.cur.y, st.cur.m, 1);
    let s = firstOfMonth - mod(dow(firstOfMonth) - c.first, 7);
    const selOrd = sel ? (st.type === 'week' ? monOf(sel.s) : sel.s) : null;
    for (let r = 0; r < 6; r++) {
      const tr = el('tr'); tr.setAttribute('role', 'row');
      const rowStart = s;
      if (c.weekNums) { const td = el('td', 'bui-dt-wk', F.nf.format(isoWeek(rowStart + 3).w)); td.setAttribute('aria-hidden', 'true'); tr.append(td); }
      let rowSelected = false;
      for (let i = 0; i < 7; i++, s++) {
        const { m, d } = ymd(s);
        const td = el('td'); td.setAttribute('role', 'gridcell');
        const b = button('bui-dt-day', 'day', `${on(s, F.full)}`, F.nf.format(d));
        b.dataset.s = s;
        const inMonth = m === st.cur.m;
        if (!inMonth) b.classList.add('is-outside');
        if (s === today) { b.classList.add('is-today'); b.setAttribute('aria-current', 'date'); }
        const isSel = selOrd !== null && (st.type === 'week' ? monOf(s) === selOrd : s === selOrd);
        if (isSel) { td.setAttribute('aria-selected', 'true'); b.classList.add('is-selected'); rowSelected = true; }
        if (!c.okDay(s)) { b.classList.add('is-disabled'); b.setAttribute('aria-disabled', 'true'); }
        b.tabIndex = s === st.fs ? 0 : -1;
        td.append(b); tr.append(td);
      }
      if (st.type === 'week') { tr.classList.add('bui-dt-weekrow'); if (rowSelected) { tr.classList.add('is-selected'); tr.setAttribute('aria-selected', 'true'); } tr.setAttribute('aria-label', sub(T.weekN, { n: F.nf.format(isoWeek(rowStart + 3).w) })); }
      tbody.append(tr);
    }
    table.append(tbody);
    return table;
  }

  function cellsGrid(st, view) { // months (3 × 4) or years (3 × 4)
    const { c } = st, { F } = c, wrap = el('div', 'bui-dt-cells'); wrap.setAttribute('role', 'grid');
    const y0 = st.cur.y - mod(st.cur.y, 12), nowY = ymd(todayS());
    for (let i = 0; i < 12; i++) {
      let b, a, label, ok, cur, sel, tab;
      if (view === 'months') {
        a = serial(st.cur.y, i + 1, 1);
        label = on(a, F.monthShort);
        ok = c.hasDays(a, a + dim(st.cur.y, i + 1) - 1);
        cur = st.cur.y === nowY.y && i + 1 === nowY.m;
        sel = st.type === 'month' && st.value && st.value.mi === mIdx(st.cur.y, i + 1);
        tab = mIdx(st.cur.y, i + 1) === st.fm;
        b = button('bui-dt-cell', 'month', on(a, F.month) + ' ' + F.nf.format(st.cur.y), label); b.dataset.v = i + 1;
      } else {
        const yy = y0 + i;
        a = serial(yy, 1, 1);
        label = F.nf.format(yy);
        ok = c.hasDays(a, serial(yy, 12, 31));
        cur = yy === nowY.y;
        sel = st.value && (st.type === 'month' ? fromMIdx(st.value.mi).y : ymd(st.value.s).y) === yy;
        tab = yy === st.fy;
        b = button('bui-dt-cell', 'year', label, label); b.dataset.v = yy;
      }
      if (cur) { b.classList.add('is-today'); b.setAttribute('aria-current', 'date'); }
      if (sel) { b.classList.add('is-selected'); b.setAttribute('aria-selected', 'true'); }
      if (!ok) { b.classList.add('is-disabled'); b.setAttribute('aria-disabled', 'true'); }
      b.tabIndex = tab ? 0 : -1;
      wrap.append(b);
    }
    return wrap;
  }

  /* ---------- Time columns ---------- */
  const dayForTime = (st) => (st.type === 'time' ? 0 : st.value ? st.value.s : st.fs);

  function renderTime(st) {
    const { c, time } = st, { T, F } = c;
    if (!time) return;
    const day = dayForTime(st), t = st.value ? st.value.t : null;
    const prevFocus = time.contains(document.activeElement) ? { col: document.activeElement.dataset.col, v: document.activeElement.dataset.v } : null;
    time.replaceChildren();
    const head = el('div', 'bui-dt-time-head');
    head.append(el('span', null, T.time));
    const shown = el('strong', null, t === null ? '—' : new Intl.DateTimeFormat(c.loc, { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', second: c.showSec ? '2-digit' : undefined, hour12: c.hour12 }).format(new Date(t * 1000)));
    head.append(shown); time.append(head);
    const cols = el('div', 'bui-dt-cols');
    const H = t === null ? null : Math.floor(t / 3600), M = t === null ? null : Math.floor(t / 60) % 60, S = t === null ? null : t % 60;
    const pm = H === null ? false : H >= 12;
    const column = (id, label, items, selected) => {
      const col = el('div', 'bui-dt-col'); col.setAttribute('role', 'listbox'); col.setAttribute('aria-label', label); col.dataset.col = id;
      const enabled = items.filter((i) => i.ok);
      const tabTarget = items.find((i) => i.v === selected && i.ok) || enabled[0];
      items.forEach((i) => {
        const b = button('bui-dt-opt', 'time', null, i.text); b.setAttribute('role', 'option'); b.dataset.col = id; b.dataset.v = i.v;
        b.setAttribute('aria-selected', String(i.v === selected));
        if (i.v === selected) b.classList.add('is-selected');
        b.disabled = !i.ok; b.tabIndex = i === tabTarget ? 0 : -1;
        col.append(b);
      });
      cols.append(col);
    };
    // hours
    const hours = [];
    for (let h = 0; h < 24; h++) {
      if (c.hour12 && (h >= 12) !== pm) continue;
      const sc = c.scan(day, h * 3600, h * 3600 + 3599);
      if (sc.aligned) hours.push({ v: h, ok: sc.allowed, text: c.hour12 ? F.nf.format(h % 12 || 12) : F.nf2.format(h) });
    }
    if (c.hour12) hours.sort((a, b) => (a.v % 12) - (b.v % 12)); // 12, 1, 2 … 11 like a clock
    column('h', T.hours, hours, H);
    // minutes of the selected hour (or the first allowed hour when nothing is chosen yet)
    const hh = H ?? (hours.find((i) => i.ok) || hours[0] || { v: 0 }).v;
    const mins = [];
    for (let m = 0; m < 60; m++) { const sc = c.scan(day, hh * 3600 + m * 60, hh * 3600 + m * 60 + 59); if (sc.aligned) mins.push({ v: m, ok: sc.allowed, text: F.nf2.format(m) }); }
    column('m', T.minutes, mins, M);
    if (c.showSec) {
      const mm = M ?? (mins.find((i) => i.ok) || { v: 0 }).v, secs = [];
      for (let s = 0; s < 60; s++) { const base = hh * 3600 + mm * 60 + s, sc = c.scan(day, base, base); if (sc.aligned) secs.push({ v: s, ok: sc.allowed, text: F.nf2.format(s) }); }
      column('s', T.seconds, secs, S);
    }
    if (c.hour12) {
      const col = el('div', 'bui-dt-col bui-dt-col-period'); col.setAttribute('role', 'listbox'); col.setAttribute('aria-label', T.period); col.dataset.col = 'p';
      [['am', F.am, false], ['pm', F.pm, true]].forEach(([v, text, isPm]) => {
        const ok = c.scan(day, isPm ? 43200 : 0, isPm ? 86399 : 43199).allowed;
        const b = button('bui-dt-opt', 'time', null, text); b.setAttribute('role', 'option'); b.dataset.col = 'p'; b.dataset.v = v;
        const selected = H !== null && isPm === pm;
        b.setAttribute('aria-selected', String(selected)); if (selected) b.classList.add('is-selected');
        b.disabled = !ok; b.tabIndex = selected || (H === null && v === 'am' && ok) ? 0 : -1;
        col.append(b);
      });
      cols.append(col);
    }
    time.append(cols);
    cols.querySelectorAll('.bui-dt-col:not(.bui-dt-col-period)').forEach((col) => { // show the selected value in the middle of its column
      const s = col.querySelector('.is-selected');
      if (s) col.scrollTop = Math.max(0, s.offsetTop - col.clientHeight / 2 + s.offsetHeight / 2);
    });
    if (prevFocus) time.querySelector(`.bui-dt-opt[data-col="${prevFocus.col}"][data-v="${prevFocus.v}"]:not(:disabled)`)?.focus({ preventScroll: true });
  }

  function setTimePart(st, col, v) {
    const { c } = st, day = dayForTime(st), cur = st.value ? st.value.t : null;
    let H = cur === null ? null : Math.floor(cur / 3600), M = cur === null ? null : Math.floor(cur / 60) % 60;
    let t;
    if (col === 'h') { const target = (v * 3600) + (M ?? 0) * 60 + (cur === null ? 0 : cur % 60); t = c.nearestT(day, target, { h: +v }); }
    else if (col === 'm') { const h = H ?? c.nearestT(day, 0, {}) / 3600 | 0; t = c.nearestT(day, h * 3600 + v * 60 + (cur === null ? 0 : cur % 60), { h, m: +v }); }
    else if (col === 's') { const h = H ?? 0, m = M ?? 0; t = c.okT(day, h * 3600 + m * 60 + +v) ? h * 3600 + m * 60 + +v : null; }
    else { // am / pm keeps the hour on the clock face
      const base = cur ?? c.nearestT(day, v === 'pm' ? 43200 : 0, {}) ?? 0;
      const target = (base % 43200) + (v === 'pm' ? 43200 : 0);
      t = c.okT(day, target) ? target : c.nearestT(day, target, {});
    }
    if (t === null || t === undefined) return;
    write(st, st.type === 'time' ? { t } : { s: day, t });
    st.value = read(st);
    renderTime(st); renderFoot(st);
    if (st.type === 'datetime-local') renderCal(st);
  }

  /* ---------- Footer: Today / Now · Clear · Done ---------- */
  function renderFoot(st) {
    const { c, foot, type } = st, { T } = c;
    foot.replaceChildren();
    const left = el('div', 'bui-dt-foot-group'), right = el('div', 'bui-dt-foot-group');
    const label = type === 'date' ? T.today : type === 'month' ? T.thisMonth : type === 'week' ? T.thisWeek : T.now;
    const nowBtn = button('bui-dt-btn', 'now', null, label);
    const s = todayS();
    nowBtn.disabled = type === 'time' ? c.nearestT(0, nowT()) === null : !c.okDay(s);
    left.append(nowBtn);
    if (!st.input.required) right.append(button('bui-dt-btn', 'clear', null, T.clear));
    if (type === 'time' || type === 'datetime-local') right.append(button('bui-dt-btn bui-dt-btn-primary', 'done', null, T.done));
    foot.append(left, right);
  }

  /* ---------- Choosing things ---------- */
  function chooseDay(st, s) {
    const { c, type } = st;
    if (!c.okDay(s)) return;
    if (type === 'date') { write(st, { s }); close(true); return; }
    if (type === 'week') { write(st, { s: monOf(s) }); close(true); return; }
    // datetime-local: keep the chosen time when it is allowed on the new day, otherwise the nearest allowed time
    const want = st.value ? st.value.t : 0;
    const t = c.okT(s, want) ? want : c.nearestT(s, want);
    if (t === null) return;
    write(st, { s, t }); st.value = read(st); st.fs = s;
    const { y, m } = ymd(s); st.cur = { y, m };
    renderCal(st); renderTime(st); renderFoot(st);
    st.cal.querySelector('[tabindex="0"]')?.focus({ preventScroll: true });
  }

  function chooseNow(st) {
    const { c, type } = st, s = todayS();
    if (type === 'date') { chooseDay(st, s); return; }
    if (type === 'week') { chooseDay(st, s); return; }
    if (type === 'month') { const { y, m } = ymd(s); write(st, { mi: mIdx(y, m) }); close(true); return; }
    const secNow = c.showSec ? nowT() : Math.floor(nowT() / 60) * 60;
    const t = c.okT(type === 'time' ? 0 : s, secNow) ? secNow : c.nearestT(type === 'time' ? 0 : s, secNow);
    if (t === null) return;
    write(st, type === 'time' ? { t } : { s, t }); st.value = read(st);
    if (type === 'datetime-local') { st.fs = s; const { y, m } = ymd(s); st.cur = { y, m }; renderCal(st); }
    renderTime(st); renderFoot(st);
  }

  function nav(st, dir, keep) {
    const { y, m } = st.cur;
    if (st.view === 'days') { st.fs = clampDay(st, addMonths(st.fs, dir)); const r = ymd(st.fs); st.cur = { y: r.y, m: r.m }; }
    else if (st.view === 'months') { st.cur = { y: y + dir, m }; st.fm = mIdx(y + dir, m); }
    else { st.cur = { y: y + dir * 12, m }; st.fy = y + dir * 12; }
    renderCal(st, keep);
  }
  const clampDay = (st, s) => { const { minDay, maxDay } = st.c; if (minDay !== null && s < minDay) s = minDay; if (maxDay !== null && s > maxDay) s = maxDay; return s; };
  const focusCell = (st) => st.cal.querySelector('[tabindex="0"]')?.focus({ preventScroll: true });

  /* ---------- Events inside the popup ---------- */
  function onClick(e) {
    const st = openSt, b = e.target.closest('button[data-act]');
    if (e.target === st.pop && st.pop.dataset.mode === 'sheet') { close(true); return; } // tap on the backdrop
    if (!b || !st.pop.contains(b) || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
    const a = b.dataset.act, { type } = st;
    if (a === 'prev') nav(st, -1, 'prev');
    else if (a === 'next') nav(st, 1, 'next');
    else if (a === 'to-months') { st.view = 'months'; st.fm = mIdx(st.cur.y, st.cur.m); renderCal(st); focusCell(st); }
    else if (a === 'to-years') { st.view = 'years'; st.fy = st.cur.y; renderCal(st); focusCell(st); }
    else if (a === 'year') { st.cur = { y: +b.dataset.v, m: st.cur.m }; st.view = 'months'; st.fm = mIdx(st.cur.y, st.cur.m); renderCal(st); focusCell(st); }
    else if (a === 'month') {
      const m = +b.dataset.v;
      if (type === 'month') { write(st, { mi: mIdx(st.cur.y, m) }); close(true); return; }
      st.cur = { y: st.cur.y, m }; st.fs = clampDay(st, serial(st.cur.y, m, Math.min(ymd(st.fs).d, dim(st.cur.y, m))));
      st.view = 'days'; renderCal(st); focusCell(st);
    }
    else if (a === 'day') chooseDay(st, +b.dataset.s);
    else if (a === 'time') setTimePart(st, b.dataset.col, b.dataset.v);
    else if (a === 'now') chooseNow(st);
    else if (a === 'clear') { write(st, null); close(true); }
    else if (a === 'done') close(true);
  }

  function onKey(e) {
    const st = openSt, k = e.key;
    if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return; }
    if (k === 'Tab') { // keep the focus inside the popup while it is open
      const items = [...st.pop.querySelectorAll('button')].filter((b) => !b.disabled && b.tabIndex >= 0 && b.getClientRects().length);
      if (!items.length) return;
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      return;
    }
    const t = e.target, rtl = st.rtl, side = rtl ? -1 : 1;
    if (t.matches('.bui-dt-day')) {
      const { c } = st; let s = st.fs;
      const wd = mod(dow(s) - c.first, 7);
      switch (k) {
        case 'ArrowLeft': s -= side; break; case 'ArrowRight': s += side; break;
        case 'ArrowUp': s -= 7; break; case 'ArrowDown': s += 7; break;
        case 'Home': s -= wd; break; case 'End': s += 6 - wd; break;
        case 'PageUp': s = addMonths(s, e.shiftKey ? -12 : -1); break; case 'PageDown': s = addMonths(s, e.shiftKey ? 12 : 1); break;
        default: return;
      }
      e.preventDefault();
      st.fs = clampDay(st, s); const r = ymd(st.fs); st.cur = { y: r.y, m: r.m };
      renderCal(st); focusCell(st);
    } else if (t.matches('.bui-dt-cell')) {
      const months = st.view === 'months', key = months ? 'fm' : 'fy';
      const d = { ArrowLeft: -side, ArrowRight: side, ArrowUp: -3, ArrowDown: 3, PageUp: -12, PageDown: 12 }[k];
      if (d === undefined) return;
      e.preventDefault();
      st[key] += d; st.cur = { y: months ? fromMIdx(st[key]).y : st[key], m: st.cur.m };
      renderCal(st); focusCell(st);
    } else if (t.matches('.bui-dt-opt')) {
      const col = t.closest('.bui-dt-col'), opts = [...col.querySelectorAll('.bui-dt-opt:not(:disabled)')], i = opts.indexOf(t);
      let target = null;
      if (k === 'ArrowDown') target = opts[i + 1] || opts[0]; else if (k === 'ArrowUp') target = opts[i - 1] || opts[opts.length - 1];
      else if (k === 'Home') target = opts[0]; else if (k === 'End') target = opts[opts.length - 1];
      else if (k === 'ArrowLeft' || k === 'ArrowRight') {
        const cols = [...st.pop.querySelectorAll('.bui-dt-col')], j = cols.indexOf(col) + (k === 'ArrowRight' ? side : -side), other = cols[j];
        target = other && (other.querySelector('.bui-dt-opt[tabindex="0"]:not(:disabled)') || other.querySelector('.bui-dt-opt:not(:disabled)'));
      } else return;
      e.preventDefault();
      target?.focus();
    }
  }

  /* ---------- Placement: below the field, above it when there is no room, always inside the window ---------- */
  function place(st) {
    const { pop, wrap } = st;
    const sheet = st.modeAttr === 'sheet' || (st.modeAttr !== 'popover' && window.matchMedia('(max-width: 560px)').matches);
    pop.dataset.mode = sheet ? 'sheet' : 'popover';
    ['left', 'top', 'maxHeight'].forEach((p) => { pop.style[p] = ''; });
    if (sheet) return;
    const r = wrap.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) { close(false); return; } // the field scrolled out of the window
    const gap = 6, edge = 8, w = pop.offsetWidth, natural = pop.offsetHeight;
    const below = vh - r.bottom - gap - edge, above = r.top - gap - edge;
    let side = st.side;
    if (!side || (side === 'bottom' ? natural > below && above > below : natural > above && below > above)) side = natural <= below || below >= above ? 'bottom' : 'top';
    st.side = side;
    const room = Math.max(side === 'bottom' ? below : above, 120);
    if (natural > room) pop.style.maxHeight = `${room}px`;
    const h = Math.min(natural, room);
    let left = st.rtl ? r.right - w : r.left;
    left = Math.min(Math.max(left, edge), Math.max(edge, vw - w - edge));
    pop.style.left = `${left}px`;
    pop.style.top = `${side === 'bottom' ? r.bottom + gap : r.top - gap - h}px`;
    pop.dataset.placement = side;
  }
  const onDocKey = (e) => { if (e.key === 'Escape' && openSt && !openSt.pop.contains(e.target)) { e.preventDefault(); e.stopPropagation(); close(true); } }; // focus is on the field
  const schedule = () => { if (openSt && !frame) frame = requestAnimationFrame(() => { frame = 0; if (openSt) place(openSt); }); };
  const onScroll = (e) => { if (openSt && !openSt.pop.contains(e.target)) schedule(); };
  const onPointer = (e) => {
    const st = openSt; if (!st) return;
    if (st.pop.contains(e.target) || st.trigger.contains(e.target) || e.target === st.pop || e.target === st.input) return; // a click on the field keeps it open
    close(false); // the click itself moves the focus
  };

  /* ---------- Open and close ---------- */
  const canPopover = typeof HTMLElement.prototype.showPopover === 'function';

  function open(target) {
    const input = typeof target === 'string' ? document.querySelector(target) : target;
    const st = input && states.get(input);
    if (!st || input.disabled || input.readOnly || openSt === st) return;
    close(false);
    const c = context(input, st.type), { T } = c;
    Object.assign(st, { c, value: read(st), view: st.type === 'month' ? 'months' : 'days', side: null, rtl: getComputedStyle(st.wrap).direction === 'rtl', modeAttr: input.dataset.buiMode || '' });
    const today = todayS(), v = st.value;
    let fs = v && st.type !== 'month' && st.type !== 'time' ? v.s : today;
    if (v && st.type === 'month') fs = serial(fromMIdx(v.mi).y, fromMIdx(v.mi).m, 1);
    st.fs = clampDay(st, fs);
    const r = ymd(st.fs); st.cur = { y: r.y, m: r.m };
    st.fm = mIdx(r.y, r.m); st.fy = r.y;

    const pop = st.pop = el('div', 'bui-dt-pop');
    pop.id = `bui-dt-${++uid}`; pop.dataset.type = st.type; pop.dir = st.rtl ? 'rtl' : 'ltr';
    pop.lang = c.loc; pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', [labelOf(input), T.open[st.type]].filter(Boolean).join(' — '));
    if (input.dataset.buiSize) pop.dataset.size = input.dataset.buiSize;
    if (input.dataset.buiPopupClass) pop.classList.add(...input.dataset.buiPopupClass.split(/\s+/).filter(Boolean));
    pop.style.colorScheme = getComputedStyle(input).colorScheme; // follows the theme even when .bui-dark is on a nested element
    const body = el('div', 'bui-dt-body');
    if (st.type !== 'time') { st.cal = el('div', 'bui-dt-cal'); body.append(st.cal); st.live = el('div', 'bui-dt-sr'); st.live.setAttribute('role', 'status'); st.live.setAttribute('aria-live', 'polite'); pop.append(st.live); }
    if (st.type === 'time' || st.type === 'datetime-local') { st.time = el('div', 'bui-dt-time'); body.append(st.time); }
    st.foot = el('div', 'bui-dt-foot');
    pop.append(body, st.foot);
    pop.addEventListener('click', onClick); pop.addEventListener('keydown', onKey);
    pop.addEventListener('mousedown', (e) => { if (e.target === pop) e.preventDefault(); });

    const host = input.closest('dialog[open]') || document.body; // inside an open modal the popup stays clickable
    if (canPopover) pop.setAttribute('popover', 'manual');
    host.appendChild(pop);
    if (canPopover) pop.showPopover();
    openSt = st;
    if (st.cal) renderCal(st);
    if (st.time) renderTime(st);
    renderFoot(st);
    st.opener = document.activeElement === input ? input : st.trigger;
    nameTrigger(st); st.trigger.setAttribute('aria-expanded', 'true'); st.trigger.setAttribute('aria-controls', pop.id);
    place(st);
    if (st.time) renderTime(st); // again, now that the popup has a size: scroll the lists to the chosen values
    (st.cal ? st.cal.querySelector('[tabindex="0"]') : st.time.querySelector('.bui-dt-opt[tabindex="0"]'))?.focus({ preventScroll: true });
    document.addEventListener('pointerdown', onPointer, true); document.addEventListener('keydown', onDocKey, true);
    window.addEventListener('resize', schedule); window.addEventListener('scroll', onScroll, true);
    window.visualViewport?.addEventListener('resize', schedule);
    input.dispatchEvent(new CustomEvent('bui:datetime-open', { bubbles: true }));
  }

  function close(refocus = true) {
    const st = openSt; if (!st) return;
    openSt = null;
    document.removeEventListener('pointerdown', onPointer, true); document.removeEventListener('keydown', onDocKey, true);
    window.removeEventListener('resize', schedule); window.removeEventListener('scroll', onScroll, true);
    window.visualViewport?.removeEventListener('resize', schedule);
    if (canPopover) { try { st.pop.hidePopover(); } catch { /* already hidden */ } }
    st.pop.remove();
    st.trigger.setAttribute('aria-expanded', 'false'); st.trigger.removeAttribute('aria-controls');
    if (refocus) (st.opener?.isConnected && !st.opener.disabled ? st.opener : st.trigger).focus({ preventScroll: true });
    st.input.dispatchEvent(new CustomEvent('bui:datetime-close', { bubbles: true }));
  }

  /* ---------- Setting up an input ---------- */
  const inputType = (input) => {
    const forced = (input.dataset.buiDatetime || '').toLowerCase(), raw = (input.getAttribute('type') || '').toLowerCase();
    return TYPES.includes(forced) ? forced : TYPES.includes(raw) ? raw : null;
  };

  // Browsers without a native month / week input show a text box; check the typed text ourselves.
  function checkText(st) {
    const { input, type } = st;
    if (input.type !== 'text') return;
    const v = input.value.trim(), c = context(input, type), { T } = c;
    let msg = '';
    if (v) {
      const p = c.K.parse(v);
      if (!p) msg = sub(T.invalid, { f: HINT[type] });
      else { const o = c.K.ord(p); if (c.min !== null && !c.wrap && o < c.min) msg = sub(T.min, { v: input.getAttribute('min') }); else if (c.max !== null && !c.wrap && o > c.max) msg = sub(T.max, { v: input.getAttribute('max') }); else if (!c.ok(o)) msg = T.step; }
    }
    input.setCustomValidity(msg);
  }

  const nameTrigger = (st) => st.trigger.setAttribute('aria-label', [labelOf(st.input), labelsFor(localeOf(st.input)).open[st.type]].filter(Boolean).join(' — '));
  function syncTrigger(st) { st.trigger.disabled = st.input.disabled || st.input.readOnly; if (openSt === st && st.trigger.disabled) close(false); }
  const attrObserver = typeof MutationObserver === 'function' ? new MutationObserver((list) => list.forEach((m) => { const st = states.get(m.target); if (st) { syncTrigger(st); checkText(st); } })) : null;

  function enhance(input) {
    if (states.has(input) || !(input instanceof HTMLInputElement)) return;
    const type = inputType(input);
    if (!type) return;
    let wrap = input.parentElement;
    if (!wrap.classList.contains('bui-float') && !wrap.classList.contains('bui-dt')) { // a plain input gets a small wrapper for the button
      wrap = el('span', 'bui-dt'); input.replaceWith(wrap); wrap.append(input);
    }
    input.classList.add('bui-dt-input');
    const trigger = button('bui-dt-trigger', null, null);
    trigger.dataset.type = type;
    trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-expanded', 'false');
    input.after(trigger);
    const st = { input, type, trigger, wrap };
    states.set(input, st);
    if (input.type === 'text' && !input.placeholder.trim()) input.placeholder = HINT[type];
    nameTrigger(st); syncTrigger(st); checkText(st);
    trigger.addEventListener('click', () => { if (openSt === st) close(true); else open(input); });
    input.addEventListener('click', () => { if (input.dataset.buiClickOpen !== 'false' && openSt !== st) open(input); }); // anywhere on the field
    input.addEventListener('keydown', (e) => { if (e.key === 'F4' || (e.altKey && e.key === 'ArrowDown')) { e.preventDefault(); open(input); } });
    input.addEventListener('input', () => checkText(st));
    input.addEventListener('change', () => checkText(st));
    attrObserver?.observe(input, { attributes: true, attributeFilter: ['disabled', 'readonly', 'min', 'max', 'step'] });
  }

  function init(root = document) {
    if (root.matches?.(SELECTOR)) enhance(root);
    root.querySelectorAll?.(SELECTOR).forEach(enhance);
  }

  BUI.datetime = { init, open, close: () => close(true), isOpen: (t) => { const i = typeof t === 'string' ? document.querySelector(t) : t; return !!openSt && (!i || openSt.input === i); }, locales };

  const start = () => {
    init(document);
    if (typeof MutationObserver === 'function') new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) init(n); }))).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
