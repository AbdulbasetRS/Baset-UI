/* Baset UI Rich Text Editor v1.0.0 — optional, dependency-free.
   Needs section 23 of baset-ui.css. Formatting is done with the Selection / Range API (no execCommand for formatting),
   history is its own snapshot stack, and everything that enters the editor (paste, drop, setHTML, source view) is sanitized. */
(() => {
  'use strict';
  const BUI = (window.BUI = window.BUI || {});
  const ZW = '\u200B';
  const SEL = () => window.getSelection();
  const $ = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  /* ---------- Constants ---------- */
  const BLOCK = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'PRE', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH', 'HR']);
  const LEAF = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'PRE', 'LI', 'TD', 'TH']);
  const VOID = new Set(['BR', 'IMG', 'HR']);
  const INLINE_TAGS = new Set(['STRONG', 'EM', 'U', 'S', 'SUB', 'SUP', 'SPAN', 'A']);
  const isEl = (n) => !!n && n.nodeType === 1;
  const isBlock = (n) => isEl(n) && BLOCK.has(n.tagName);
  const isList = (n) => isEl(n) && (n.tagName === 'UL' || n.tagName === 'OL');
  const unwrap = (e) => { const p = e.parentNode; if (!p) return; while (e.firstChild) p.insertBefore(e.firstChild, e); p.removeChild(e); };
  const up = (n, area, fn) => { for (n = n && n.nodeType === 3 ? n.parentNode : n; n && n !== area; n = n.parentNode) if (isEl(n) && fn(n)) return n; return null; };
  const uniq = (a) => [...new Set(a)];
  const nodeLen = (n) => (n.nodeType === 3 ? n.length : n.childNodes.length);
  const hasContent = (n) => n.textContent.replace(/\u200B/g, '') !== '' || !!n.querySelector('img,hr,table,br');
  const isEmptyBlock = (b) => !b.textContent.replace(/[\u200B\s]/g, '') && !b.querySelector('img,hr,table');

  /* ---------- Icons (inline SVG, so the editor never depends on the icon font) ---------- */
  const P = (...ds) => ds.map((d) => `<path d="${d}"/>`).join('');
  const ic = (d, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  const G = (cls, html) => `<span class="bui-editor-glyph ${cls}">${html}</span>`;
  const ICON = {
    bold: G('is-b', 'B'), italic: G('is-i', 'I'), underline: G('is-u', 'U'), strike: G('is-s', 'S'),
    subscript: G('', 'x<sub>2</sub>'), superscript: G('', 'x<sup>2</sup>'),
    clear: ic(P('M19 20H8.5l-4.2-4.2a1.5 1.5 0 0 1 0-2.1L14 4a1.5 1.5 0 0 1 2.1 0l4.2 4.2a1.5 1.5 0 0 1 0 2.1L11.5 20', 'M7.5 12.5l5.5 5.5')),
    color: '<span class="bui-editor-glyph is-color"><b>A</b><i class="bui-editor-bar"></i></span>',
    highlight: `<span class="bui-editor-glyph is-color">${ic(P('M5 15l7-7 4 4-7 7H5z', 'M13 7l2-2 4 4-2 2'))}<i class="bui-editor-bar"></i></span>`,
    alignLeft: ic(P('M4 6h16M4 10h10M4 14h16M4 18h10')), alignCenter: ic(P('M4 6h16M7 10h10M4 14h16M7 18h10')),
    alignRight: ic(P('M4 6h16M10 10h10M4 14h16M10 18h10')), alignJustify: ic(P('M4 6h16M4 10h16M4 14h16M4 18h16')),
    ul: ic(P('M9 6h11M9 12h11M9 18h11', 'M4 6h.01M4 12h.01M4 18h.01')),
    ol: ic(P('M10 6h10M10 12h10M10 18h10', 'M4 4.5l1.2-.8V8', 'M3.6 12.2h2.6L3.6 16h2.8')),
    indent: ic(P('M4 6h16M12 10h8M12 14h8M4 18h16', 'M4 9l3 3-3 3'), 'bui-editor-flip'),
    outdent: ic(P('M4 6h16M12 10h8M12 14h8M4 18h16', 'M7 9l-3 3 3 3'), 'bui-editor-flip'),
    quote: ic(P('M6 17h3l2-4V7H5v6h3', 'M14 17h3l2-4V7h-6v6h3')),
    link: ic(P('M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1')),
    image: ic('<rect x="3" y="4" width="18" height="16" rx="2"/>' + P('M21 16l-5-5-9 9') + '<circle cx="9" cy="10" r="1.5"/>'),
    table: ic('<rect x="3" y="4" width="18" height="16" rx="2"/>' + P('M3 10h18M3 15h18M10 4v16')),
    hr: ic(P('M3 12h18M8 7h8M8 17h8')),
    codeBlock: ic(P('M9 4c-2 0-3 1-3 3v2c0 1.5-1 3-2 3 1 0 2 1.5 2 3v2c0 2 1 3 3 3', 'M15 4c2 0 3 1 3 3v2c0 1.5 1 3 2 3-1 0-2 1.5-2 3v2c0 2-1 3-3 3')),
    undo: ic(P('M9 14L4 9l5-5', 'M4 9h10a6 6 0 0 1 0 12h-3')), redo: ic(P('M15 14l5-5-5-5', 'M20 9H10a6 6 0 0 0 0 12h3')),
    selectAll: ic(P('M5 5h14v14H5z', 'M9 12l2 2 4-4')),
    fullscreen: ic(P('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5')), exitFullscreen: ic(P('M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5')),
    source: ic(P('M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12')), visual: ic(P('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z') + '<circle cx="12" cy="12" r="3"/>'),
    caret: ic(P('M6 9l6 6 6-6'), 'bui-editor-caret'),
    heading: '', fontFamily: '', fontSize: '',
  };

  /* ---------- Locales ---------- */
  const LOCALES = {
    en: { bold: 'Bold', italic: 'Italic', underline: 'Underline', strike: 'Strikethrough', subscript: 'Subscript', superscript: 'Superscript', clear: 'Clear formatting', fontFamily: 'Font family', fontSize: 'Font size', color: 'Text color', highlight: 'Highlight color', heading: 'Block format', paragraph: 'Paragraph', h: 'Heading', alignLeft: 'Align left', alignCenter: 'Align center', alignRight: 'Align right', alignJustify: 'Justify', ul: 'Bulleted list', ol: 'Numbered list', indent: 'Increase indent', outdent: 'Decrease indent', quote: 'Blockquote', link: 'Link', image: 'Image', table: 'Table', hr: 'Horizontal line', codeBlock: 'Code block', undo: 'Undo', redo: 'Redo', selectAll: 'Select all', fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen', source: 'HTML source', visual: 'Visual editor', defaultFont: 'Default', defaultSize: 'Default', defaultColor: 'Default', noColor: 'No color', custom: 'Custom color', url: 'URL', text: 'Text', newTab: 'Open in a new tab', apply: 'Apply', cancel: 'Cancel', remove: 'Remove link', insert: 'Insert', imageUrl: 'Image URL', upload: 'Or upload an image', alt: 'Alt text', width: 'Width (px)', rows: 'Rows', cols: 'Columns', headerRow: 'Header row', invalidUrl: 'Enter a valid URL.', tooBig: 'The image is too large.', notImage: 'Choose an image file.', placeholder: 'Start typing…', chars: 'characters', toolbar: 'Editor toolbar', area: 'Rich text editor', sourceLabel: 'HTML source code' },
    ar: { bold: 'غامق', italic: 'مائل', underline: 'تسطير', strike: 'يتوسطه خط', subscript: 'نص سفلي', superscript: 'نص علوي', clear: 'مسح التنسيق', fontFamily: 'نوع الخط', fontSize: 'حجم الخط', color: 'لون النص', highlight: 'لون التظليل', heading: 'نمط الفقرة', paragraph: 'فقرة', h: 'عنوان', alignLeft: 'محاذاة لليسار', alignCenter: 'توسيط', alignRight: 'محاذاة لليمين', alignJustify: 'ضبط', ul: 'قائمة نقطية', ol: 'قائمة رقمية', indent: 'زيادة المسافة البادئة', outdent: 'تقليل المسافة البادئة', quote: 'اقتباس', link: 'رابط', image: 'صورة', table: 'جدول', hr: 'خط أفقي', codeBlock: 'كتلة برمجية', undo: 'تراجع', redo: 'إعادة', selectAll: 'تحديد الكل', fullscreen: 'ملء الشاشة', exitFullscreen: 'إنهاء ملء الشاشة', source: 'شيفرة HTML', visual: 'المحرر المرئي', defaultFont: 'الافتراضي', defaultSize: 'الافتراضي', defaultColor: 'الافتراضي', noColor: 'بدون لون', custom: 'لون مخصص', url: 'الرابط', text: 'النص', newTab: 'فتح في نافذة جديدة', apply: 'تطبيق', cancel: 'إلغاء', remove: 'إزالة الرابط', insert: 'إدراج', imageUrl: 'رابط الصورة', upload: 'أو ارفع صورة', alt: 'النص البديل', width: 'العرض (بكسل)', rows: 'الصفوف', cols: 'الأعمدة', headerRow: 'صف عنوان', invalidUrl: 'أدخل رابطًا صحيحًا.', tooBig: 'حجم الصورة كبير جدًا.', notImage: 'اختر ملف صورة.', placeholder: 'ابدأ الكتابة…', chars: 'حرف', toolbar: 'شريط أدوات المحرر', area: 'محرر النصوص', sourceLabel: 'شيفرة HTML' },
  };

  /* ---------- Safe values ---------- */
  const COLOR_RE = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/deg-]+\)|[a-z]{3,20})$/i;
  const BAD_COLOR = /^(inherit|initial|unset|revert|currentcolor|windowtext|window|buttontext|buttonface|highlight|highlighttext|transparent)$/i;
  const NEUTRAL_FG = /^(#0{3}|#0{6}|black|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*1\s*\))$/i;
  const NEUTRAL_BG = /^(#f{3}|#f{6}|white|transparent|rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))$/i;
  const safeColor = (v) => { v = String(v || '').trim(); return COLOR_RE.test(v) && !BAD_COLOR.test(v) ? v : ''; };
  const safeSize = (v) => (/^\d+(\.\d+)?(px|pt|em|rem|%)$/i.test(String(v || '').trim()) ? String(v).trim() : '');
  const safeFamily = (v) => (/^[\w\s,'"-]{1,200}$/.test(String(v || '').trim()) ? String(v).trim() : '');
  function safeUrl(u, img) {
    u = String(u || '').trim();
    if (!u) return '';
    const flat = u.replace(/[\u0000-\u0020\u007f-\u009f\u200b]+/g, '').toLowerCase();
    const m = flat.match(/^([a-z][a-z0-9+.-]*):/);
    if (!m) return u; // relative URL
    if (img) return /^https?$/.test(m[1]) ? u : /^data:image\/(png|jpe?g|gif|webp|bmp|avif);base64,[a-z0-9+/=]+$/.test(flat) ? u.replace(/\s+/g, '') : '';
    return /^(https?|mailto|tel)$/.test(m[1]) ? u : '';
  }
  function normalizeUrl(v) {
    v = String(v || '').trim();
    if (!v) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return safeUrl(v);
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(v)) return `mailto:${v}`;
    if (/^(#|\/|\.\/|\.\.\/)/.test(v)) return v;
    return safeUrl(`https://${v.replace(/^\/\//, '')}`);
  }
  const FONT_SIZES = { 1: '10px', 2: '13px', 3: '16px', 4: '18px', 5: '24px', 6: '32px', 7: '48px' };

  /* ---------- Sanitizer: allow-list, rebuilt into fresh nodes ---------- */
  const ALLOWED = { P: 'p', BR: 'br', HR: 'hr', H1: 'h1', H2: 'h2', H3: 'h3', H4: 'h4', H5: 'h5', H6: 'h6', BLOCKQUOTE: 'blockquote', UL: 'ul', OL: 'ol', LI: 'li', PRE: 'pre', CODE: 'code', TABLE: 'table', THEAD: 'thead', TBODY: 'tbody', TFOOT: 'tfoot', TR: 'tr', TD: 'td', TH: 'th', A: 'a', IMG: 'img', DIV: 'div' };
  const FMT = { B: 'strong', STRONG: 'strong', I: 'em', EM: 'em', U: 'u', INS: 'u', S: 's', STRIKE: 's', DEL: 's', SUB: 'sub', SUP: 'sup' };
  const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH', 'HEAD', 'TITLE', 'META', 'LINK', 'XML', 'FORM', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'AUDIO', 'VIDEO', 'CANVAS', 'APPLET', 'FRAME', 'FRAMESET', 'BASE', 'SOURCE', 'TRACK', 'PARAM', 'DIALOG']);
  const BLOCKISH_STYLE = /^(P|H[1-6]|DIV|PRE|BLOCKQUOTE|LI|TD|TH)$/;

  function cleanChildren(src, dst, o) {
    for (const n of [...src.childNodes]) {
      if (n.nodeType === 3) { if (n.data) dst.appendChild(document.createTextNode(n.data)); }
      else if (n.nodeType === 1) cleanEl(n, dst, o);
    }
  }
  function cleanEl(el, dst, o) {
    const tag = el.tagName.toUpperCase();
    if (DROP.has(tag)) return;
    const css = el.getAttribute('style') || '';
    if (/mso-list\s*:\s*ignore/i.test(css)) return;
    const st = el.style || {};
    const t = ALLOWED[tag];
    if (t === 'br' || t === 'hr') { dst.appendChild($(t)); return; }
    if (t === 'img') {
      const src = safeUrl(el.getAttribute('src'), true);
      if (!src) return;
      const img = $('img'); img.setAttribute('src', src); img.setAttribute('alt', (el.getAttribute('alt') || '').slice(0, 300));
      ['width', 'height'].forEach((a) => { const v = parseInt(el.getAttribute(a), 10); if (v > 0 && v < 5000) img.setAttribute(a, String(v)); });
      dst.appendChild(img); return;
    }
    // Word list paragraph -> list item (grouped into a list afterwards)
    let base = null;
    if (t === 'p' && o.paste && /mso-list\s*:\s*(?!none)/i.test(css)) {
      const mk = [...el.querySelectorAll('span[style]')].find((s) => /mso-list\s*:\s*ignore/i.test(s.getAttribute('style')));
      base = $('li'); base.setAttribute('data-bui-list', mk && /^\s*(\d+|[a-z]|[ivxlc]+)[.)]/i.test(mk.textContent) ? 'ol' : 'ul');
    } else if (t && t !== 'a') base = $(t);
    const inl = !t || t === 'a';
    const els = [];
    if (inl) {
      const fw = (st.fontWeight || '').toLowerCase(), fs = (st.fontStyle || '').toLowerCase();
      const td = `${st.textDecorationLine || ''} ${st.textDecoration || ''}`.toLowerCase(), va = (st.verticalAlign || '').toLowerCase();
      const f = {};
      const ft = FMT[tag];
      if (ft === 'strong') f.strong = !/^(normal|[1-4]00)$/.test(fw); else if (ft) f[ft] = true;
      if (!ft || !f[ft]) { /* style-derived formatting only for generic inline tags */ }
      if (/^(bold|bolder|[6-9]00)$/.test(fw)) f.strong = true;
      if (/italic|oblique/.test(fs)) f.em = true;
      if (/underline/.test(td)) f.u = true;
      if (/line-through/.test(td)) f.s = true;
      if (va === 'sub') f.sub = true; else if (va === 'super') f.sup = true;
      const sp = $('span'); let any = false;
      let c = safeColor(st.color || (tag === 'FONT' ? el.getAttribute('color') : ''));
      let bg = safeColor(st.backgroundColor);
      if (c && !(o.paste && NEUTRAL_FG.test(c))) { sp.style.color = c; any = true; }
      if (bg && !(o.paste && NEUTRAL_BG.test(bg))) { sp.style.backgroundColor = bg; any = true; }
      if (!o.paste) {
        const ff = safeFamily((st.fontFamily || (tag === 'FONT' ? el.getAttribute('face') : '') || '').replace(/!important/g, ''));
        const sz = safeSize(st.fontSize) || (tag === 'FONT' ? FONT_SIZES[el.getAttribute('size')] || '' : '');
        if (ff) { sp.style.fontFamily = ff; any = true; }
        if (sz) { sp.style.fontSize = sz; any = true; }
      }
      if (any) els.push(sp);
      ['strong', 'em', 'u', 's', 'sub', 'sup'].forEach((k) => { if (f[k]) els.push($(k)); });
      if (t === 'a') {
        const href = safeUrl(el.getAttribute('href')); const a = $('a');
        if (href) { a.setAttribute('href', href); if (el.getAttribute('target') === '_blank') { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); } if (el.getAttribute('title')) a.setAttribute('title', el.getAttribute('title').slice(0, 200)); }
        els.push(a);
      }
    } else if (base) {
      if (BLOCKISH_STYLE.test(tag) || tag === 'UL' || tag === 'OL') {
        const ta = (st.textAlign || '').toLowerCase();
        if (/^(left|right|center|justify)$/.test(ta)) base.style.textAlign = ta;
      }
      if (/^(P|H[1-6]|DIV|PRE|BLOCKQUOTE)$/.test(tag) && !base.hasAttribute('data-bui-list')) {
        const m = parseFloat(st.marginInlineStart); if (m > 0 && /em$/.test(st.marginInlineStart || '')) base.style.setProperty('margin-inline-start', `${Math.min(m, 20)}em`);
      }
      if (/^(TD|TH)$/.test(tag)) {
        ['colspan', 'rowspan'].forEach((a) => { const v = parseInt(el.getAttribute(a), 10); if (v > 1 && v < 50) base.setAttribute(a, String(v)); });
        const bgc = safeColor(st.backgroundColor); if (bgc && !(o.paste && NEUTRAL_BG.test(bgc))) base.style.backgroundColor = bgc;
      }
      if (tag === 'OL') { const s = parseInt(el.getAttribute('start'), 10); if (s > 0 && s < 10000) base.setAttribute('start', String(s)); }
      if (/^(ltr|rtl)$/i.test(el.getAttribute('dir') || '') && BLOCKISH_STYLE.test(tag)) base.setAttribute('dir', el.getAttribute('dir').toLowerCase());
      if (!base.getAttribute('style')) base.removeAttribute('style');
    }
    if (base) { dst.appendChild(base); cleanChildren(el, base, o); return; }
    if (els.length) {
      for (let i = 1; i < els.length; i++) els[i - 1].appendChild(els[i]);
      dst.appendChild(els[0]); cleanChildren(el, els[els.length - 1], o); return;
    }
    cleanChildren(el, dst, o); // unknown tag: keep its children
  }
  function fixBlocks(c) {
    for (const ch of [...c.childNodes]) if (isEl(ch) && !VOID.has(ch.tagName)) fixBlocks(ch);
    // Word list items -> real lists
    let cur = null;
    for (const ch of [...c.childNodes]) {
      if (isEl(ch) && ch.tagName === 'LI' && !isList(c)) {
        const kind = ch.getAttribute('data-bui-list') || 'ul'; ch.removeAttribute('data-bui-list');
        if (!cur || cur.tagName.toLowerCase() !== kind) { cur = $(kind); ch.before(cur); }
        cur.appendChild(ch);
      } else if (!(ch.nodeType === 3 && !ch.data.trim())) cur = null;
    }
    for (const ch of [...c.childNodes]) {
      if (isEl(ch) && ch.tagName === 'DIV') {
        if ([...ch.children].some(isBlock)) { while (ch.firstChild) c.insertBefore(ch.firstChild, ch); ch.remove(); }
        else { const p = $('p'); if (ch.getAttribute('style')) p.setAttribute('style', ch.getAttribute('style')); while (ch.firstChild) p.appendChild(ch.firstChild); ch.replaceWith(p); }
      }
    }
    if (c.nodeName === 'LI') {
      [...c.children].filter((x) => x.tagName === 'P').forEach((p, i) => { if (i > 0) c.insertBefore($('br'), p); while (p.firstChild) c.insertBefore(p.firstChild, p); p.remove(); });
    }
    if (c.nodeType === 11 || c.nodeName === 'BLOCKQUOTE') {
      let run = null;
      for (const n of [...c.childNodes]) {
        const loose = (n.nodeType === 3 && (n.data.trim() || run)) || (isEl(n) && !isBlock(n));
        if (loose) { if (!run) { run = $('p'); n.before(run); } run.appendChild(n); }
        else { run = null; if (n.nodeType === 3) n.remove(); }
      }
    }
    if (/^(UL|OL|TABLE|THEAD|TBODY|TFOOT|TR)$/.test(c.nodeName)) [...c.childNodes].forEach((n) => { if (n.nodeType === 3 && !n.data.trim()) n.remove(); });
  }
  function sanitizeFragment(html, opts = {}) {
    const dom = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const out = document.createDocumentFragment();
    cleanChildren(dom.body, out, opts);
    fixBlocks(out);
    return out;
  }
  function sanitizeHTML(html, opts) {
    const d = $('div'); d.appendChild(sanitizeFragment(html, opts)); return d.innerHTML;
  }
  function textFragment(text) {
    const f = document.createDocumentFragment();
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    while (lines.length > 1 && !lines[lines.length - 1]) lines.pop();
    if (lines.length === 1) { if (lines[0]) f.appendChild(document.createTextNode(lines[0])); return f; }
    lines.forEach((l) => { const p = $('p'); if (l) p.textContent = l; else p.innerHTML = '<br>'; f.appendChild(p); });
    return f;
  }

  /* ---------- Range engine: markers, inline strip / wrap, blocks ---------- */
  function snapPoint(c, o, end) {
    while (c.nodeType === 1) {
      const n = end ? c.childNodes[o - 1] : c.childNodes[o];
      if (!n) break;
      if (n.nodeType === 3) { c = n; o = end ? n.length : 0; break; }
      if (n.nodeType !== 1 || VOID.has(n.tagName)) break;
      c = n; o = end ? n.childNodes.length : 0;
    }
    return [c, o];
  }
  /* Two comment nodes mark the selection, so it survives any DOM surgery. */
  function mark(range) {
    const [ec, eo] = snapPoint(range.endContainer, range.endOffset, true);
    const [sc, so] = snapPoint(range.startContainer, range.startOffset, false);
    const e = document.createRange(); e.setStart(ec, eo); e.collapse(true);
    const s = document.createRange(); s.setStart(sc, so); s.collapse(true);
    const em = document.createComment('e'), sm = document.createComment('s');
    e.insertNode(em); s.insertNode(sm);
    return { sm, em };
  }
  const region = (m) => { const r = document.createRange(); r.setStartAfter(m.sm); r.setEndBefore(m.em); return r; };

  function removeEmpty(root) {
    [...root.querySelectorAll('strong,em,u,s,sub,sup,span,a')].reverse().forEach((e) => { if (!e.textContent && !e.querySelector('img,br')) e.remove(); });
  }
  const sig = (e) => e.cloneNode(false).outerHTML;
  function mergeInline(root, range) {
    const walk = (p) => {
      for (let c = p.firstChild; c; c = c.nextSibling) {
        if (!isEl(c)) continue;
        if (INLINE_TAGS.has(c.tagName)) {
          let nx;
          while ((nx = c.nextSibling) && isEl(nx) && nx.tagName === c.tagName && sig(nx) === sig(c)) {
            const base = c.childNodes.length;
            const sc = range.startContainer, so = range.startOffset, ec = range.endContainer, eo = range.endOffset;
            while (nx.firstChild) c.appendChild(nx.firstChild);
            nx.remove();
            if (sc === nx) range.setStart(c, base + so);
            if (ec === nx) range.setEnd(c, base + eo);
          }
        }
        walk(c);
      }
    };
    walk(root);
  }
  function cleanBlocks(area) {
    [...area.querySelectorAll('ul,ol,blockquote')].reverse().forEach((e) => {
      if (!e.textContent.trim() && !e.querySelector('li,img,hr,table,br,pre,p,h1,h2,h3,h4,h5,h6')) e.remove();
    });
  }
  function finish(area, range, m) {
    range.setStartAfter(m.sm); range.setEndBefore(m.em);
    m.sm.remove(); m.em.remove();
    removeEmpty(area); mergeInline(area, range); cleanBlocks(area);
    area.normalize();
  }
  /* Remove a format from the marked region. Elements that stick out of the region are split first, so only the region loses the format. */
  function strip(area, m, test, clear) {
    const els = [], w = document.createTreeWalker(area, NodeFilter.SHOW_ELEMENT);
    while (w.nextNode()) if (test(w.currentNode)) els.push(w.currentNode);
    for (const e of els) {
      if (!e.isConnected || !region(m).intersectsNode(e)) continue;
      const rr = document.createRange();
      if (e.contains(m.sm)) {
        rr.setStart(e, 0); rr.setEndBefore(m.sm);
        if (!rr.collapsed) { const w2 = e.cloneNode(false); w2.appendChild(rr.extractContents()); e.parentNode.insertBefore(w2, e); }
      }
      if (e.contains(m.em)) {
        rr.setStartAfter(m.em); rr.setEnd(e, e.childNodes.length);
        if (!rr.collapsed) { const w2 = e.cloneNode(false); w2.appendChild(rr.extractContents()); e.parentNode.insertBefore(w2, e.nextSibling); }
      }
      clear(e);
    }
  }
  /* Wrap every text node of the marked region with a fresh element. Adjacent equal wrappers are merged later. */
  function applyWrap(area, m, make) {
    const out = [], w = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode;
      if (!n.data || !(m.sm.compareDocumentPosition(n) & 4) || !(m.em.compareDocumentPosition(n) & 2)) continue;
      if (!n.data.trim() && /^(TABLE|TBODY|THEAD|TFOOT|TR|UL|OL|BLOCKQUOTE)$/.test(n.parentNode.nodeName)) continue;
      out.push(n);
    }
    out.forEach((n) => { const el = make(); n.parentNode.insertBefore(el, n); el.appendChild(n); });
  }
  function textIn(area, range) {
    const out = [], w = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode;
      if (!range.intersectsNode(n)) continue;
      const s = n === range.startContainer ? range.startOffset : 0, e = n === range.endContainer ? range.endOffset : n.length;
      if (e > s && n.data.slice(s, e).trim()) out.push(n);
    }
    return out;
  }

  /* ---------- Blocks ---------- */
  const isLeaf = (e) => ![...e.childNodes].some(isBlock) || [...e.childNodes].some((c) => !isBlock(c) && (c.nodeType === 3 ? c.data.trim() : c.nodeType === 1));
  function leafBlocks(area, m) {
    const r = region(m), out = [], w = document.createTreeWalker(area, NodeFilter.SHOW_ELEMENT);
    while (w.nextNode()) {
      const e = w.currentNode;
      if (!LEAF.has(e.tagName) || !isLeaf(e) || !r.intersectsNode(e)) continue;
      // a block that only contains other blocks (nested list) counts when the range touches its own content
      if ([...e.childNodes].some(isBlock) && ![...e.childNodes].some((c) => !isBlock(c) && c.nodeType !== 8 && (c.nodeType !== 3 || c.data.trim()) && r.intersectsNode(c))) continue;
      out.push(e);
    }
    return out;
  }
  const leafAt = (node, area) => up(node, area, (e) => LEAF.has(e.tagName));
  const listUnit = (b) => (b.parentNode && b.parentNode.tagName === 'LI' ? b.parentNode : b);
  function unitOf(b, area) {
    if (/^(TD|TH)$/.test(b.tagName)) return b;
    let n = b;
    while (n.parentNode && n.parentNode !== area && !/^(BLOCKQUOTE|TD|TH)$/.test(n.parentNode.tagName)) n = n.parentNode;
    return n;
  }
  const insertAfterUnit = (u, node) => (/^(TD|TH)$/.test(u.tagName) ? u.appendChild(node) : u.after(node));
  const emptyP = () => { const p = $('p'); p.innerHTML = '<br>'; return p; };
  const caretIn = (range, node, atEnd) => { range.selectNodeContents(node); range.collapse(!atEnd); };

  function preToInline(pre) {
    pre.querySelectorAll('code').forEach(unwrap);
    const w = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT), ns = [];
    while (w.nextNode()) ns.push(w.currentNode);
    ns.forEach((n) => {
      if (!n.data.includes('\n')) return;
      const f = document.createDocumentFragment();
      n.data.split('\n').forEach((p, i) => { if (i) f.appendChild($('br')); if (p) f.appendChild(document.createTextNode(p)); });
      n.replaceWith(f);
    });
  }
  function retagBlock(b, tag) {
    const n = $(tag);
    ['style', 'dir'].forEach((a) => { if (b.hasAttribute(a)) n.setAttribute(a, b.getAttribute(a)); });
    if (b.tagName === 'PRE') preToInline(b);
    while (b.firstChild) n.appendChild(b.firstChild);
    b.replaceWith(n); return n;
  }
  function flattenToText(b) {
    [...b.querySelectorAll('*')].forEach((e) => {
      if (e.tagName === 'BR') e.replaceWith('\n'); else if (e.tagName === 'IMG') e.remove(); else unwrap(e);
    });
  }
  function unlistItem(li) {
    const list = li.parentNode, after = list.cloneNode(false);
    while (li.nextSibling) after.appendChild(li.nextSibling);
    const nested = [...li.children].filter(isList);
    const blocks = [...li.children].filter((c) => isBlock(c) && !isList(c));
    let blk;
    if (blocks.length === 1 && ![...li.childNodes].some((c) => c.nodeType === 3 && c.data.trim())) {
      blk = blocks[0];
      [...li.childNodes].filter((c) => c.nodeType === 8).forEach((c) => blk.appendChild(c));
    } else { blk = $('p'); [...li.childNodes].filter((c) => !isList(c)).forEach((c) => blk.appendChild(c)); }
    if (li.style.textAlign && !blk.style.textAlign) blk.style.textAlign = li.style.textAlign;
    list.after(blk);
    let ref = blk; nested.forEach((n) => { ref.after(n); ref = n; });
    if (after.firstChild) ref.after(after);
    li.remove();
    if (!list.firstChild) list.remove();
    if (!blk.firstChild) blk.innerHTML = '<br>';
  }
  function retagList(li, tag) {
    const list = li.parentNode; if (list.tagName === tag) return;
    const after = list.cloneNode(false); while (li.nextSibling) after.appendChild(li.nextSibling);
    const mid = $(tag.toLowerCase()); list.after(mid); mid.appendChild(li); if (after.firstChild) mid.after(after);
    if (!list.firstChild) list.remove();
  }
  function wrapInList(b, tag) {
    const list = $(tag.toLowerCase()), li = $('li');
    if (b.style.textAlign) li.style.textAlign = b.style.textAlign;
    if (b.tagName === 'PRE') preToInline(b);
    while (b.firstChild) li.appendChild(b.firstChild);
    list.appendChild(li);
    if (/^(TD|TH)$/.test(b.tagName)) b.appendChild(list); else b.replaceWith(list);
  }
  function mergeLists(area) {
    area.querySelectorAll('ul,ol').forEach((l) => {
      if (!l.parentNode) return;
      const p = l.previousElementSibling;
      if (!p || p.tagName !== l.tagName) return;
      for (let n = l.previousSibling; n && n !== p; n = n.previousSibling) if (n.nodeType === 1 || (n.nodeType === 3 && n.data.trim())) return;
      while (l.firstChild) p.appendChild(l.firstChild);
      l.remove();
    });
  }
  function indentLi(li) {
    const prev = li.previousElementSibling; if (!prev || prev.tagName !== 'LI') return;
    let sub = prev.lastElementChild;
    if (!isList(sub)) { sub = $(li.parentNode.tagName.toLowerCase()); prev.appendChild(sub); }
    sub.appendChild(li);
  }
  function outdentLi(li) {
    const list = li.parentNode, host = list.parentNode;
    if (host && host.tagName === 'LI') {
      if (li.nextSibling) { const sub = list.cloneNode(false); while (li.nextSibling) sub.appendChild(li.nextSibling); li.appendChild(sub); }
      host.after(li);
      if (!list.firstChild) list.remove();
    } else unlistItem(li);
  }
  function shiftBlock(b, dir) {
    const cur = parseFloat(b.style.getPropertyValue('margin-inline-start')) || 0;
    const next = Math.max(0, Math.min(20, cur + dir * 2));
    if (next) b.style.setProperty('margin-inline-start', `${next}em`); else { b.style.removeProperty('margin-inline-start'); if (!b.getAttribute('style')) b.removeAttribute('style'); }
  }

  /* Insert sanitized content at the caret: inline content goes into the current block, blocks split it. */
  function pasteInto(range, frag, area) {
    range.deleteContents();
    let kids = [...frag.childNodes];
    if (!kids.length) return;
    if (kids.length === 1 && isEl(kids[0]) && /^(P|H[1-6]|DIV)$/.test(kids[0].tagName)) { // one paragraph: paste it inline
      const f = document.createDocumentFragment(); while (kids[0].firstChild) f.appendChild(kids[0].firstChild);
      frag = f; kids = [...f.childNodes]; if (!kids.length) return;
    }
    const leaf = up(range.startContainer, area, (e) => LEAF.has(e.tagName));
    const inlineOnly = !kids.some(isBlock);
    if (inlineOnly || !leaf || /^(TD|TH|PRE)$/.test(leaf.tagName)) {
      let f = frag;
      if (!inlineOnly) {
        f = document.createDocumentFragment();
        kids.forEach((k, i) => { if (i) f.appendChild($('br')); if (isEl(k) && /^(P|H[1-6]|DIV|PRE)$/.test(k.tagName)) while (k.firstChild) f.appendChild(k.firstChild); else f.appendChild(document.createTextNode(k.textContent)); });
      }
      const last = f.lastChild; if (!last) return;
      range.insertNode(f); range.setStartAfter(last); range.collapse(true); return;
    }
    const tail = document.createRange(); tail.setStart(range.startContainer, range.startOffset); tail.setEnd(leaf, leaf.childNodes.length);
    const B2 = leaf.cloneNode(false); B2.appendChild(tail.extractContents()); leaf.after(B2);
    const merge = (n) => isEl(n) && /^(P|H[1-6]|DIV)$/.test(n.tagName);
    const items = kids.slice();
    const dropBr = (b) => { if (b.lastChild && b.lastChild.nodeName === 'BR' && !b.textContent.replace(ZW, '')) b.lastChild.remove(); };
    if (merge(items[0])) { const f = items.shift(); dropBr(leaf); while (f.firstChild) leaf.appendChild(f.firstChild); }
    let end = null;
    if (items.length && merge(items[items.length - 1])) {
      const l = items.pop(); end = document.createComment('x'); B2.insertBefore(end, B2.firstChild);
      while (l.firstChild) B2.insertBefore(l.firstChild, end);
    }
    const wrapLi = (n) => { const li = $('li'); if (merge(n)) while (n.firstChild) li.appendChild(n.firstChild); else li.appendChild(n); return li; };
    items.forEach((n) => leaf.parentNode.insertBefore(leaf.tagName === 'LI' && n.tagName !== 'LI' ? wrapLi(n) : n, B2));
    if (end) { range.setStartBefore(end); range.collapse(true); end.remove(); return; }
    if (hasContent(B2)) { caretIn(range, B2, false); return; }
    B2.remove();
    const lastNode = items.length ? items[items.length - 1] : leaf;
    if (lastNode === leaf) caretIn(range, leaf, true);
    else if (merge(lastNode)) caretIn(range, lastNode, true);
    else { const p = emptyP(); lastNode.parentNode.insertBefore(p, lastNode.nextSibling); caretIn(range, p, false); }
  }

  /* ---------- Options ---------- */
  const PRESETS = {
    full: 'undo redo | heading fontFamily fontSize | bold italic underline strike subscript superscript clear | color highlight | alignLeft alignCenter alignRight alignJustify | ul ol outdent indent quote | link image table hr codeBlock | selectAll source fullscreen',
    basic: 'undo redo | heading | bold italic underline | color highlight | ul ol | link image | clear',
    minimal: 'bold italic underline | ul ol | link',
  };
  const MENUS = new Set(['heading', 'fontFamily', 'fontSize']);
  const PANELS = new Set(['color', 'highlight', 'link', 'image', 'table']);
  const TOOL_NAMES = new Set([...Object.keys(ICON).filter((k) => !['caret', 'heading', 'fontFamily', 'fontSize', 'visual', 'exitFullscreen'].includes(k)), 'heading', 'fontFamily', 'fontSize']);
  const KEYS = { bold: 'Ctrl+B', italic: 'Ctrl+I', underline: 'Ctrl+U', link: 'Ctrl+K', undo: 'Ctrl+Z', redo: 'Ctrl+Y' };
  const KEEP_ON_READONLY = new Set(['selectAll', 'source', 'fullscreen']);
  const DEFAULTS = {
    toolbar: 'basic', placeholder: '', height: null, minHeight: 160, maxHeight: null, resize: 'none', dir: null, locale: null,
    readonly: false, disabled: false, maxlength: 0, counter: false, sticky: false, name: null, sanitize: true,
    maxImageSize: 2 * 1024 * 1024, imageUpload: null, onChange: null,
    fonts: ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Tahoma', 'Trebuchet MS', 'DM Sans', 'Manrope'],
    sizes: [12, 14, 16, 18, 24, 32, 48],
    colors: ['#20213a', '#6b7090', '#b2b5c5', '#ffffff', '#d84b5d', '#f2a33a', '#20ad7c', '#368de5', '#6658e8', '#8b80ee', '#e17684', '#f5b969', '#56c19b', '#66a8eb', '#473ea2', '#973441'],
  };
  const px = (v) => (/^\d+(\.\d+)?$/.test(String(v)) ? `${v}px` : String(v));
  const flag = (d, k) => k in d && d[k] !== 'false';
  function readAttrs(el) {
    const d = el.dataset, a = {};
    if (d.buiToolbar !== undefined) a.toolbar = d.buiToolbar;
    ['Height', 'MinHeight', 'MaxHeight', 'Placeholder', 'Resize', 'Dir', 'Locale', 'Name'].forEach((k) => { if (d[`bui${k}`]) a[k[0].toLowerCase() + k.slice(1)] = d[`bui${k}`]; });
    if (!a.placeholder && el.getAttribute('placeholder')) a.placeholder = el.getAttribute('placeholder');
    if (!a.name && el.getAttribute('name')) a.name = el.getAttribute('name');
    const ml = d.buiMaxlength || el.getAttribute('maxlength'); if (ml) a.maxlength = parseInt(ml, 10) || 0;
    if (flag(d, 'buiCounter')) a.counter = true;
    if (flag(d, 'buiSticky')) a.sticky = true;
    if (flag(d, 'buiReadonly') || el.hasAttribute('readonly')) a.readonly = true;
    if (flag(d, 'buiDisabled') || el.hasAttribute('disabled')) a.disabled = true;
    if (d.buiFonts) a.fonts = d.buiFonts.split('|').map((s) => s.trim()).filter(Boolean).map((s) => { const i = s.indexOf('='); return i > 0 ? { label: s.slice(0, i).trim(), value: s.slice(i + 1).trim() } : s; });
    if (d.buiSizes) a.sizes = d.buiSizes.split(',').map((s) => s.trim()).filter(Boolean);
    if (d.buiColors) a.colors = d.buiColors.split(',').map((s) => s.trim()).filter(Boolean);
    return a;
  }
  function parseToolbar(spec) {
    if (spec === false || spec === 'false' || spec === 'none' || spec === '' || spec == null) return null;
    if (Array.isArray(spec)) spec = spec.map((g) => (Array.isArray(g) ? g.join(' ') : g)).join(' | ');
    spec = String(spec).trim();
    if (PRESETS[spec]) spec = PRESETS[spec];
    const groups = spec.split('|').map((g) => g.trim().split(/[\s,]+/).filter((n) => TOOL_NAMES.has(n))).filter((g) => g.length);
    return groups.length ? groups : null;
  }
  const fontStack = (n) => {
    const q = /\s/.test(n) ? `"${n}"` : n;
    return `${q}, ${/Courier|Consolas|Monaco|Mono/i.test(n) ? 'monospace' : /Georgia|Times|Garamond|Serif/i.test(n) ? 'serif' : 'sans-serif'}`;
  };
  function caretFromPoint(x, y) {
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (!p) return null; const r = document.createRange(); r.setStart(p.offsetNode, p.offset); r.collapse(true); return r; }
    return document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
  }
  const formatHTML = (h) => h.replace(/(<\/(?:p|h[1-6]|li|blockquote|pre|table|thead|tbody|tfoot|tr)>|<hr\s*\/?>|<ul[^>]*>|<ol[^>]*>)/g, '$1\n').replace(/\n{2,}/g, '\n').trim();

  const instances = new Set();
  document.addEventListener('selectionchange', () => { const s = SEL(); if (s.rangeCount) instances.forEach((ed) => ed._track(s)); });
  let uid = 0;

  class BasetEditor {
    constructor(target, options = {}) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) throw new Error('BUI.editor: target not found');
      if (el._buiEditor) return el._buiEditor;
      const o = (this.o = Object.assign({}, DEFAULTS, readAttrs(el), options));
      const isTa = el.tagName === 'TEXTAREA';
      const initial = o.value != null ? o.value : isTa ? el.value : el.innerHTML;
      this.el = el; this.isTa = isTa; this.id = ++uid;
      const root = (this.root = isTa ? $('div') : el);
      if (isTa) { el.after(root); el.hidden = true; if (el.required) { this.required = true; el.required = false; } }
      else root.textContent = '';
      root.classList.add('bui-editor');
      const code = String(o.locale || root.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
      const t = (this.t = Object.assign({}, LOCALES.en, BUI.editor.locales[code]));
      if (o.dir && o.dir !== 'auto') root.setAttribute('dir', o.dir);
      root.dataset.resize = o.resize || 'none';
      root.classList.toggle('bui-editor-sticky', !!o.sticky);
      root.style.setProperty('--bui-editor-min-height', px(o.minHeight));
      this.toolbar = $('div', 'bui-editor-toolbar'); this.toolbar.setAttribute('role', 'toolbar'); this.toolbar.setAttribute('aria-label', t.toolbar);
      this.body = $('div', 'bui-editor-body');
      this.ph = $('div', 'bui-editor-placeholder'); this.ph.setAttribute('aria-hidden', 'true');
      const a = (this.area = $('div', 'bui-editor-area'));
      a.setAttribute('role', 'textbox'); a.setAttribute('aria-multiline', 'true'); a.setAttribute('aria-label', o.placeholder || t.area); a.spellcheck = true;
      this.source = $('textarea', 'bui-editor-source'); this.source.hidden = true; this.source.spellcheck = false; this.source.setAttribute('aria-label', t.sourceLabel);
      this.body.append(this.ph, a, this.source);
      this.footer = $('div', 'bui-editor-footer'); this.count = $('span', 'bui-editor-count'); this.footer.append(this.count);
      this.footer.hidden = !(o.maxlength > 0 || o.counter);
      root.append(this.toolbar, this.body, this.footer);
      if (o.height) this.setHeight(o.height);
      if (o.maxHeight) this.body.style.maxHeight = px(o.maxHeight);
      this.ph.textContent = o.placeholder || '';
      if (o.name) { this.field = isTa ? el : $('input'); if (!isTa) { this.field.type = 'hidden'; this.field.name = o.name; root.appendChild(this.field); } else this.field.name = o.name; }
      else if (isTa) this.field = el;
      this.tools = {}; this.wraps = {}; this.labels = {}; this.hist = []; this.hi = -1; this.cur = {};
      this.sourceMode = false; this.fullscreen = false; this.saved = null; this.pop = null;
      this._bind();
      this.setHTML(initial, { silent: true });
      this.setToolbar(o.toolbar);
      this.hist = [this._snap()]; this.hi = 0;
      this._apply(); this._sync(true);
      el._buiEditor = this; root._buiEditor = this; instances.add(this);
      this._emit('ready');
    }

    /* ----- events ----- */
    _bind() {
      const a = this.area, root = this.root;
      a.addEventListener('input', () => { if (!this.composing) this.fixTop(); this._sync(); this._later(); this.refresh(); });
      a.addEventListener('compositionstart', () => { this.composing = true; });
      a.addEventListener('compositionend', () => { this.composing = false; this.fixTop(); this._sync(); this._later(); });
      a.addEventListener('keydown', (e) => this._key(e));
      a.addEventListener('beforeinput', (e) => this._before(e));
      a.addEventListener('paste', (e) => this._onPaste(e));
      a.addEventListener('drop', (e) => this._onDrop(e));
      a.addEventListener('dragstart', () => { const r = this._live(); this._drag = r && !r.collapsed ? r.cloneRange() : null; });
      a.addEventListener('dragend', () => { this._drag = null; });
      a.addEventListener('focus', () => { root.classList.add('is-focus'); try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* not available */ } this._emit('focus'); });
      a.addEventListener('blur', () => { root.classList.remove('is-focus'); this._emit('blur'); });
      this.source.addEventListener('focus', () => root.classList.add('is-focus'));
      this.source.addEventListener('blur', () => root.classList.remove('is-focus'));
      this.toolbar.addEventListener('mousedown', (e) => { if (!e.target.closest('input,textarea,select,label')) e.preventDefault(); });
      this.toolbar.addEventListener('click', (e) => {
        const b = e.target.closest('.bui-editor-btn[data-tool]');
        if (!b || b.disabled) return;
        const n = b.dataset.tool;
        if (MENUS.has(n) || PANELS.has(n)) this.togglePanel(n, e.detail === 0); else this.exec(n);
      });
      this.toolbar.addEventListener('keydown', (e) => {
        if (!/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key) || e.target.closest('.bui-editor-panel')) return;
        const bs = [...this.toolbar.querySelectorAll('.bui-editor-btn:not(:disabled)')], i = bs.indexOf(document.activeElement);
        if (i < 0) return;
        const rtl = getComputedStyle(root).direction === 'rtl';
        let n = i;
        if (e.key === 'Home') n = 0; else if (e.key === 'End') n = bs.length - 1;
        else n = (i + (e.key === 'ArrowRight' !== rtl ? 1 : -1) + bs.length) % bs.length;
        e.preventDefault(); bs.forEach((b) => { b.tabIndex = -1; }); bs[n].tabIndex = 0; bs[n].focus();
      });
      root.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (this.pop) { e.preventDefault(); e.stopPropagation(); const had = this.pop.btn; this.closePanel(); if (document.activeElement && this.root.contains(document.activeElement) && document.activeElement !== this.area) this.focusArea(); else had.focus?.(); }
        else if (this.fullscreen) { e.preventDefault(); this.toggleFullscreen(false); }
      });
      this.source.addEventListener('input', () => { this._emit('change'); });
      const form = this.el.form || root.closest('form');
      if (form) { this._form = form; this._onSubmit = (e) => { if (this.required && this.isEmpty()) { e.preventDefault(); root.classList.add('bui-editor-invalid'); this.focus(); } }; form.addEventListener('submit', this._onSubmit); }
    }
    _emit(name, detail = {}) {
      const d = Object.assign({ editor: this }, detail);
      if (!('html' in d)) Object.defineProperty(d, 'html', { get: () => this.getHTML(), enumerable: true });
      this.root.dispatchEvent(new CustomEvent(`bui:editor-${name}`, { bubbles: true, detail: d }));
    }
    _track(s) {
      if (this.area.contains(s.anchorNode) && this.area.contains(s.focusNode)) { this.saved = s.getRangeAt(0).cloneRange(); this.refresh(); }
    }
    _before(e) {
      const max = this.o.maxlength; if (!max || e.isComposing) return;
      const t = e.inputType || '';
      if (!/^insert(Text|FromDrop|Replacement|Transpose)/.test(t) || t === 'insertParagraph') return;
      const add = e.data ? e.data.length : 0;
      if (this.getLength() - SEL().toString().length + add > max) e.preventDefault();
    }
    _key(e) {
      const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
      if (mod && !e.altKey) {
        const map = { b: 'bold', i: 'italic', u: 'underline' };
        if (map[k] && !e.shiftKey) { e.preventDefault(); this.toggleInline(map[k]); }
        else if (k === 'k') { e.preventDefault(); if (this.wraps.link) this.openPanel('link'); }
        else if (k === 'z') { e.preventDefault(); if (e.shiftKey) this.redo(); else this.undo(); }
        else if (k === 'y') { e.preventDefault(); this.redo(); }
        return;
      }
      if (this.o.readonly || this.o.disabled) return;
      const r = this._live();
      if (e.key === 'Enter' && r && up(r.startContainer, this.area, (n) => n.tagName === 'PRE')) {
        e.preventDefault();
        this.run((range) => {
          range.deleteContents();
          const t = document.createTextNode('\n'); range.insertNode(t); range.setStartAfter(t); range.collapse(true);
          const tail = document.createRange(); tail.setStart(range.startContainer, range.startOffset);
          const pre = up(range.startContainer, this.area, (n) => n.tagName === 'PRE'); tail.setEnd(pre, pre.childNodes.length);
          if (!tail.toString()) t.after(document.createTextNode('\n'));
        });
      } else if (e.key === 'Tab' && r) {
        const cell = up(r.startContainer, this.area, (n) => /^(TD|TH)$/.test(n.tagName));
        const li = up(r.startContainer, this.area, (n) => n.tagName === 'LI');
        if (cell) { e.preventDefault(); this._cell(cell, e.shiftKey); }
        else if (li) { e.preventDefault(); this.indent(e.shiftKey ? -1 : 1); }
      }
    }
    _cell(cell, back) {
      const table = cell.closest('table'); let cells = [...table.querySelectorAll('td,th')];
      let i = cells.indexOf(cell) + (back ? -1 : 1);
      if (i >= cells.length) {
        const row = cell.parentNode.cloneNode(false); [...cell.parentNode.children].forEach(() => { const td = $('td'); td.innerHTML = '<br>'; row.appendChild(td); });
        cell.closest('tbody,table').appendChild(row); cells = [...table.querySelectorAll('td,th')];
      }
      if (i < 0) i = 0;
      const r = document.createRange(); caretIn(r, cells[i], false); this._setSel(r);
    }
    _onPaste(e) {
      if (this.o.readonly || this.o.disabled) return;
      const cd = e.clipboardData; if (!cd) return;
      e.preventDefault();
      const html = cd.getData('text/html'), text = cd.getData('text/plain');
      const files = [...(cd.files || [])].filter((f) => /^image\//.test(f.type));
      if (!html && !text && files.length) { files.forEach((f) => this._imageFile(f)); return; }
      this._paste(html, text);
    }
    _paste(html, text) {
      let frag = html ? sanitizeFragment(html, { paste: true }) : textFragment(text);
      if (html && !frag.textContent.trim() && !frag.querySelector('img,hr,table')) frag = textFragment(text);
      const max = this.o.maxlength;
      if (max) {
        const room = max - this.getLength() + SEL().toString().length;
        if (room <= 0) return;
        if (frag.textContent.length > room) frag = textFragment(frag.textContent.slice(0, room));
      }
      this.run((range) => pasteInto(range, frag, this.area));
    }
    _onDrop(e) {
      if (this.o.readonly || this.o.disabled) return;
      const dt = e.dataTransfer; if (!dt) return;
      e.preventDefault();
      const pt = caretFromPoint(e.clientX, e.clientY);
      if (!pt || !this.area.contains(pt.startContainer)) return;
      const files = [...(dt.files || [])].filter((f) => /^image\//.test(f.type));
      const html = dt.getData('text/html'), text = dt.getData('text/plain');
      if (!files.length && !html && !text) return;
      if (this._drag) {
        if (this._drag.isPointInRange(pt.startContainer, pt.startOffset)) { this._drag = null; return; }
        this._drag.deleteContents(); this._drag = null;
      }
      this._setSel(pt);
      if (files.length) files.forEach((f) => this._imageFile(f)); else this._paste(html, text);
    }

    /* ----- selection, history, running commands ----- */
    _live() {
      const s = SEL();
      if (s.rangeCount && this.area.contains(s.anchorNode) && this.area.contains(s.focusNode)) return s.getRangeAt(0);
      return this.saved && this.area.contains(this.saved.startContainer) && this.area.contains(this.saved.endContainer) ? this.saved : null;
    }
    _setSel(range) { const s = SEL(); s.removeAllRanges(); s.addRange(range); this.saved = range.cloneRange(); }
    focusArea() {
      const a = this.area, s = SEL(), before = this._live(), keep = before ? before.cloneRange() : null;
      if (document.activeElement !== a) a.focus({ preventScroll: true });
      if (keep) { s.removeAllRanges(); s.addRange(keep); return; }
      let r = this.saved && a.contains(this.saved.startContainer) && a.contains(this.saved.endContainer) ? this.saved.cloneRange() : null;
      if (!r) { r = document.createRange(); r.selectNodeContents(a.lastElementChild || a); r.collapse(false); }
      s.removeAllRanges(); s.addRange(r);
    }
    _ser() {
      const r = this._live(); if (!r) return null;
      const path = (n) => { const p = []; while (n && n !== this.area) { p.unshift(Array.prototype.indexOf.call(n.parentNode.childNodes, n)); n = n.parentNode; } return p; };
      return { s: path(r.startContainer), so: r.startOffset, e: path(r.endContainer), eo: r.endOffset };
    }
    _res(s) {
      if (!s) return null;
      const get = (p) => p.reduce((n, i) => n && n.childNodes[i], this.area);
      const sc = get(s.s), ec = get(s.e); if (!sc || !ec) return null;
      const r = document.createRange();
      try { r.setStart(sc, Math.min(s.so, nodeLen(sc))); r.setEnd(ec, Math.min(s.eo, nodeLen(ec))); } catch { return null; }
      return r;
    }
    _snap() { if (!this.composing) this.area.normalize(); return { html: this.area.innerHTML, sel: this._ser() }; }
    record() {
      clearTimeout(this._t); this._t = 0;
      const snap = this._snap(), cur = this.hist[this.hi];
      if (cur && cur.html === snap.html) { cur.sel = snap.sel; return; }
      this.hist.length = this.hi + 1; this.hist.push(snap);
      if (this.hist.length > 200) this.hist.shift();
      this.hi = this.hist.length - 1;
    }
    _later() { clearTimeout(this._t); this._t = setTimeout(() => { this._t = 0; this.record(); this.refresh(); }, 350); }
    flush() { if (this._t) this.record(); }
    undo() { if (this.sourceMode || this.o.readonly || this.o.disabled) return this; this.flush(); if (this.hi > 0) this._go(this.hi - 1); return this; }
    redo() { if (this.sourceMode || this.o.readonly || this.o.disabled) return this; this.flush(); if (this.hi < this.hist.length - 1) this._go(this.hi + 1); return this; }
    _go(i) {
      this.hi = i; const s = this.hist[i];
      this.area.innerHTML = s.html; this.focusArea();
      const r = this._res(s.sel); if (r) this._setSel(r);
      this._sync(); this.refresh();
    }
    run(fn) {
      if (this.o.disabled || this.o.readonly || this.sourceMode) return false;
      this.closePanel(); this.focusArea(); this.flush(); this.fixTop();
      const r = this._live(); if (!r) return false;
      const range = r.cloneRange();
      fn(range);
      this._setSel(range);
      this.record(); this._sync(); this.refresh();
      return true;
    }
    /* Keep the content a list of blocks: loose text becomes a paragraph, an empty editor gets <p><br></p>. */
    fixTop() {
      const a = this.area, r = this._live();
      const keep = r ? [r.startContainer, r.startOffset, r.endContainer, r.endOffset] : null;
      const kids = [...a.childNodes];
      if (!kids.some((n) => isEl(n) || (n.nodeType === 3 && n.data.trim()))) {
        a.innerHTML = '<p><br></p>';
        if (document.activeElement === a) { const x = document.createRange(); caretIn(x, a.firstChild, false); this._setSel(x); }
        return;
      }
      let run = null, changed = false;
      for (const n of kids) {
        const loose = (n.nodeType === 3 && (n.data.trim() || run)) || (isEl(n) && !isBlock(n));
        if (loose) { if (!run) { run = $('p'); n.before(run); } run.appendChild(n); changed = true; }
        else { run = null; if (n.nodeType === 3) { n.remove(); } }
      }
      const last = a.lastElementChild;
      if (last && /^(HR|TABLE)$/.test(last.tagName)) a.appendChild(emptyP());
      if (changed && keep && document.activeElement === a) { try { const x = document.createRange(); x.setStart(keep[0], keep[1]); x.setEnd(keep[2], keep[3]); this._setSel(x); } catch { /* ignore */ } }
    }
    _sync(silent) {
      const empty = this.isEmpty(), max = this.o.maxlength;
      this.body.classList.toggle('is-empty', empty);
      if (!this.footer.hidden) {
        const n = this.getLength();
        this.count.textContent = max ? `${n} / ${max}` : `${n} ${this.t.chars}`;
        this.root.classList.toggle('is-over', !!max && n > max);
      }
      if (this.field) this.field.value = this.getHTML();
      if (!empty) this.root.classList.remove('bui-editor-invalid');
      if (!silent) { this._emit('change'); if (typeof this.o.onChange === 'function') this.o.onChange(this.getHTML(), this); }
    }
    _apply() {
      const { readonly: ro, disabled: dis } = this.o, a = this.area;
      a.contentEditable = ro || dis ? 'false' : 'true'; a.tabIndex = dis ? -1 : 0;
      a.setAttribute('aria-readonly', String(!!ro)); a.setAttribute('aria-disabled', String(!!dis));
      this.root.classList.toggle('is-readonly', !!ro); this.root.classList.toggle('is-disabled', !!dis);
      this.source.readOnly = !!ro; this.source.disabled = !!dis;
      Object.entries(this.tools).forEach(([n, b]) => { b.disabled = dis || (ro && !KEEP_ON_READONLY.has(n)) || (this.sourceMode && n !== 'source' && n !== 'fullscreen'); });
      if (ro || dis) this.closePanel();
    }

    /* ----- toolbar ----- */
    setToolbar(spec) {
      this.closePanel();
      const tb = this.toolbar; tb.textContent = ''; this.tools = {}; this.wraps = {}; this.labels = {};
      const groups = parseToolbar(spec);
      this.o.toolbar = spec;
      tb.hidden = !groups; this.root.classList.toggle('has-toolbar', !!groups);
      if (!groups) return this;
      groups.forEach((g) => { const ge = $('div', 'bui-editor-group'); ge.setAttribute('role', 'group'); g.forEach((n) => ge.appendChild(this._tool(n))); tb.appendChild(ge); });
      const first = tb.querySelector('.bui-editor-btn'); if (first) first.tabIndex = 0;
      this._apply(); this.refresh();
      return this;
    }
    _tool(name) {
      const t = this.t, menu = MENUS.has(name), panel = PANELS.has(name);
      const b = $('button', 'bui-editor-btn'); b.type = 'button'; b.tabIndex = -1; b.dataset.tool = name;
      const title = t[name] + (KEYS[name] ? ` (${KEYS[name]})` : '');
      b.title = title; b.setAttribute('aria-label', t[name]);
      this.tools[name] = b;
      if (menu || panel) {
        const wrap = $('div', 'bui-editor-dd'); this.wraps[name] = wrap;
        b.setAttribute('aria-haspopup', menu ? 'menu' : 'dialog'); b.setAttribute('aria-expanded', 'false');
        if (menu) { b.classList.add('bui-editor-dd-toggle'); const l = (this.labels[name] = $('span', 'bui-editor-dd-label', name === 'heading' ? t.paragraph : name === 'fontFamily' ? t.defaultFont : '16')); b.append(l); b.insertAdjacentHTML('beforeend', ICON.caret); }
        else { b.innerHTML = ICON[name]; if (name === 'color' || name === 'highlight') b.insertAdjacentHTML('beforeend', ICON.caret); }
        wrap.appendChild(b); return wrap;
      }
      b.innerHTML = ICON[name];
      return b;
    }
    refresh() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = 0; this.paint(); }); }
    paint() {
      const r = this.sourceMode ? null : this._live(), t = this.t, A = this.area;
      const set = (n, v) => { const b = this.tools[n]; if (!b) return; b.classList.toggle('is-active', !!v); b.setAttribute('aria-pressed', String(!!v)); };
      ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'].forEach((n) => set(n, r && this._inlineActive(r, INLINE[n].tags)));
      const node = r && (r.startContainer.nodeType === 3 ? r.startContainer.parentNode : r.startContainer);
      const leaf = r && leafAt(r.startContainer, A);
      const li = r && up(r.startContainer, A, (e) => e.tagName === 'LI');
      set('ul', li && li.parentNode.tagName === 'UL'); set('ol', li && li.parentNode.tagName === 'OL');
      set('quote', r && up(r.startContainer, A, (e) => e.tagName === 'BLOCKQUOTE')); set('codeBlock', r && up(r.startContainer, A, (e) => e.tagName === 'PRE'));
      set('link', r && up(r.startContainer, A, (e) => e.tagName === 'A'));
      let al = '';
      if (leaf) { const cs = getComputedStyle(leaf); al = cs.textAlign; const rtl = cs.direction === 'rtl'; if (al === 'start') al = rtl ? 'right' : 'left'; else if (al === 'end') al = rtl ? 'left' : 'right'; if (!al) al = 'left'; }
      [['alignLeft', 'left'], ['alignCenter', 'center'], ['alignRight', 'right'], ['alignJustify', 'justify']].forEach(([n, v]) => set(n, al === v));
      const find = (prop) => { const e = node && up(node, A, (x) => x.style && x.style.getPropertyValue(prop)); return e ? e.style.getPropertyValue(prop) : ''; };
      const h = leaf && /^H[1-6]$/.test(leaf.tagName) ? leaf.tagName.toLowerCase() : 'p';
      this.cur = { heading: h, fontFamily: find('font-family'), fontSize: find('font-size') };
      const L = this.labels;
      if (L.heading) L.heading.textContent = h === 'p' ? t.paragraph : `${t.h} ${h[1]}`;
      if (L.fontFamily) { const nf = (v) => v.replace(/["'\s]/g, '').toLowerCase(); const hit = this.o.fonts.map((f) => (typeof f === 'string' ? { label: f, value: fontStack(f) } : f)).find((f) => this.cur.fontFamily && nf(f.value) === nf(this.cur.fontFamily)); L.fontFamily.textContent = hit ? hit.label : this.cur.fontFamily ? this.cur.fontFamily.split(',')[0].replace(/["']/g, '') : t.defaultFont; }
      if (L.fontSize) L.fontSize.textContent = String(parseInt(this.cur.fontSize || (node ? getComputedStyle(node).fontSize : '') || 16, 10) || 16);
      const dis = this.o.disabled || this.o.readonly || this.sourceMode;
      if (this.tools.undo) this.tools.undo.disabled = dis || this.hi <= 0;
      if (this.tools.redo) this.tools.redo.disabled = dis || this.hi >= this.hist.length - 1;
    }

    /* ----- panels (menus, color picker, link / image / table forms) ----- */
    togglePanel(name, kbd) { if (this.pop && this.pop.name === name) this.closePanel(); else this.openPanel(name, kbd); }
    openPanel(name, kbd) {
      this.closePanel();
      if (this.o.readonly || this.o.disabled || this.sourceMode) return;
      const wrap = this.wraps[name], btn = this.tools[name]; if (!wrap) return;
      const p = $('div', 'bui-editor-panel'); wrap.appendChild(p);
      p.addEventListener('mousedown', (e) => { if (!e.target.closest('input,textarea,select,label')) e.preventDefault(); });
      ({ heading: () => this._menu(p, 'heading'), fontFamily: () => this._menu(p, 'fontFamily'), fontSize: () => this._menu(p, 'fontSize'), color: () => this._color(p, 'color'), highlight: () => this._color(p, 'highlight'), link: () => this._link(p), image: () => this._image(p), table: () => this._table(p) })[name]();
      btn.setAttribute('aria-expanded', 'true'); wrap.classList.add('is-open');
      this._place(p, wrap);
      this.pop = { name, p, btn, wrap };
      this._out = (e) => { if (this.pop && !this.pop.wrap.contains(e.target)) this.closePanel(); };
      document.addEventListener('mousedown', this._out, true);
      if (MENUS.has(name)) { if (kbd) (p.querySelector('[aria-checked="true"]') || p.querySelector('button'))?.focus(); }
      else (p.querySelector('input:not([type=file]):not([type=checkbox]):not([type=color])') || p.querySelector('button'))?.focus();
    }
    closePanel() {
      if (!this.pop) return;
      const { p, btn, wrap } = this.pop; this.pop = null;
      p.remove(); btn.setAttribute('aria-expanded', 'false'); wrap.classList.remove('is-open');
      document.removeEventListener('mousedown', this._out, true);
    }
    _place(p, wrap) {
      const r = p.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
      if (r.bottom > vh - 8 && wrap.getBoundingClientRect().top > r.height + 16) p.classList.add('is-top');
      let dx = 0; if (r.right > vw - 8) dx = vw - 8 - r.right; if (r.left + dx < 8) dx = 8 - r.left;
      if (dx) p.style.translate = `${dx}px 0`;
    }
    _menu(p, kind) {
      const t = this.t, o = this.o;
      p.classList.add('bui-editor-menu'); p.setAttribute('role', 'menu');
      let items;
      if (kind === 'heading') items = [{ label: t.paragraph, value: 'p' }, ...[1, 2, 3, 4, 5, 6].map((n) => ({ label: `${t.h} ${n}`, value: `h${n}` }))];
      else if (kind === 'fontFamily') items = [{ label: t.defaultFont, value: '' }, ...o.fonts.map((f) => (typeof f === 'string' ? { label: f, value: fontStack(f) } : f))];
      else items = [{ label: t.defaultSize, value: '' }, ...o.sizes.map((s) => (typeof s === 'object' ? s : { label: String(s).replace(/px$/, ''), value: /^\d+(\.\d+)?$/.test(String(s)) ? `${s}px` : String(s) }))];
      const nf = (v) => String(v || '').replace(/["'\s]/g, '').toLowerCase(), cur = this.cur[kind];
      items.forEach((it) => {
        const b = $('button', 'bui-editor-menu-item', it.label); b.type = 'button'; b.tabIndex = -1; b.setAttribute('role', 'menuitemradio');
        if (kind === 'fontFamily' && it.value && safeFamily(it.value)) b.style.fontFamily = it.value;
        if (kind === 'heading') b.dataset.level = it.value;
        const on = nf(it.value) === nf(cur); b.setAttribute('aria-checked', String(on)); b.classList.toggle('is-active', on);
        b.addEventListener('click', () => { if (kind === 'heading') this.setBlock(it.value); else this.setStyle(kind === 'fontFamily' ? 'font-family' : 'font-size', it.value); });
        p.appendChild(b);
      });
      p.addEventListener('keydown', (e) => {
        const bs = [...p.querySelectorAll('button')], i = bs.indexOf(document.activeElement); let n = -1;
        if (e.key === 'ArrowDown') n = (i + 1) % bs.length; else if (e.key === 'ArrowUp') n = (i - 1 + bs.length) % bs.length; else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = bs.length - 1;
        if (n >= 0) { e.preventDefault(); bs[n].focus(); }
      });
    }
    _bar(kind, c) { const bar = this.tools[kind] && this.tools[kind].querySelector('.bui-editor-bar'); if (bar) bar.style.backgroundColor = c || ''; }
    _color(p, kind) {
      const t = this.t, prop = kind === 'color' ? 'color' : 'background-color';
      p.classList.add('bui-editor-colors');
      const grid = $('div', 'bui-editor-swatches');
      this.o.colors.map(safeColor).filter(Boolean).forEach((c) => {
        const b = $('button', 'bui-editor-swatch'); b.type = 'button'; b.style.backgroundColor = c; b.title = c; b.setAttribute('aria-label', c);
        b.addEventListener('click', () => { this._bar(kind, c); this.setStyle(prop, c); }); grid.appendChild(b);
      });
      const row = $('div', 'bui-editor-row');
      const reset = $('button', 'bui-btn bui-btn-sm bui-btn-outline', kind === 'color' ? t.defaultColor : t.noColor); reset.type = 'button';
      reset.addEventListener('click', () => { this._bar(kind, ''); this.setStyle(prop, ''); });
      const custom = $('label', 'bui-editor-custom'); const inp = $('input'); inp.type = 'color'; inp.setAttribute('aria-label', t.custom);
      inp.addEventListener('change', () => { this._bar(kind, inp.value); this.setStyle(prop, inp.value); });
      custom.append(inp, $('span', null, t.custom));
      row.append(reset, custom); p.append(grid, row);
    }
    _fields(p, title) { const f = $('div', 'bui-editor-form'); f.setAttribute('role', 'group'); f.setAttribute('aria-label', title); p.appendChild(f); return f; }
    _field(label, input) { const l = $('label', 'bui-field'); l.append(label, input); return l; }
    _actions(form, items) {
      const row = $('div', 'bui-editor-actions');
      items.forEach(([label, cls, fn]) => { const b = $('button', `bui-btn bui-btn-sm ${cls}`, label); b.type = 'button'; b.addEventListener('click', fn); row.appendChild(b); });
      form.appendChild(row);
    }
    _enter(form, fn) { form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file') { e.preventDefault(); fn(); } }); }
    _link(p) {
      const t = this.t, f = this._fields(p, t.link); p.classList.add('bui-editor-form-panel');
      const r = this._live(), a = r && up(r.startContainer, this.area, (e) => e.tagName === 'A');
      const url = $('input', 'bui-input'); url.type = 'text'; url.dir = 'ltr'; url.placeholder = 'https://'; url.value = a ? a.getAttribute('href') || '' : '';
      const text = $('input', 'bui-input'); text.type = 'text'; text.value = a ? a.textContent : r && !r.collapsed ? '' : '';
      const showText = !!a || !r || r.collapsed;
      const cb = $('label', 'bui-checkline'); const chk = $('input'); chk.type = 'checkbox'; chk.checked = !!a && a.target === '_blank'; cb.append(chk, document.createTextNode(t.newTab));
      const err = $('div', 'bui-editor-error'); err.setAttribute('role', 'alert'); err.hidden = true;
      f.append(this._field(t.url, url)); if (showText) f.append(this._field(t.text, text)); f.append(cb, err);
      const apply = () => {
        const href = normalizeUrl(url.value);
        if (!href) { err.textContent = t.invalidUrl; err.hidden = false; url.classList.add('is-invalid'); url.focus(); return; }
        this.setLink({ href, text: showText ? text.value : null, newTab: chk.checked });
      };
      const acts = [];
      if (a) acts.push([t.remove, 'bui-btn-soft-danger', () => this.removeLink()]);
      acts.push([t.cancel, 'bui-btn-outline', () => { this.closePanel(); this.focusArea(); }], [t.apply, 'bui-btn-primary', apply]);
      this._actions(f, acts); this._enter(f, apply);
    }
    _image(p) {
      const t = this.t, f = this._fields(p, t.image); p.classList.add('bui-editor-form-panel');
      const url = $('input', 'bui-input'); url.type = 'text'; url.dir = 'ltr'; url.placeholder = 'https://';
      const file = $('input', 'bui-input'); file.type = 'file'; file.accept = 'image/*';
      const alt = $('input', 'bui-input'); alt.type = 'text';
      const w = $('input', 'bui-input'); w.type = 'number'; w.min = '1'; w.max = '4000';
      const err = $('div', 'bui-editor-error'); err.setAttribute('role', 'alert'); err.hidden = true;
      f.append(this._field(t.imageUrl, url), this._field(t.upload, file), this._field(t.alt, alt), this._field(t.width, w), err);
      const apply = async () => {
        err.hidden = true;
        try {
          const fl = file.files[0]; const src = fl ? await this._readImage(fl) : url.value.trim();
          if (!safeUrl(src, true)) throw new Error(t.invalidUrl);
          this.insertImage({ src, alt: alt.value, width: parseInt(w.value, 10) || 0 });
        } catch (e) { err.textContent = e.message || t.invalidUrl; err.hidden = false; }
      };
      this._actions(f, [[t.cancel, 'bui-btn-outline', () => { this.closePanel(); this.focusArea(); }], [t.insert, 'bui-btn-primary', apply]]); this._enter(f, apply);
    }
    _table(p) {
      const t = this.t, f = this._fields(p, t.table); p.classList.add('bui-editor-form-panel');
      const rows = $('input', 'bui-input'); rows.type = 'number'; rows.min = '1'; rows.max = '50'; rows.value = '3';
      const cols = $('input', 'bui-input'); cols.type = 'number'; cols.min = '1'; cols.max = '20'; cols.value = '3';
      const two = $('div', 'bui-editor-two'); two.append(this._field(t.rows, rows), this._field(t.cols, cols));
      const cb = $('label', 'bui-checkline'); const chk = $('input'); chk.type = 'checkbox'; chk.checked = true; cb.append(chk, document.createTextNode(t.headerRow));
      f.append(two, cb);
      const apply = () => this.insertTable({ rows: rows.value, cols: cols.value, header: chk.checked });
      this._actions(f, [[t.cancel, 'bui-btn-outline', () => { this.closePanel(); this.focusArea(); }], [t.insert, 'bui-btn-primary', apply]]); this._enter(f, apply);
    }

    /* ----- commands ----- */
    _inlineActive(range, tags) {
      const has = (n) => !!up(n, this.area, (e) => tags.includes(e.tagName));
      if (range.collapsed) return has(range.startContainer);
      const ns = textIn(this.area, range); return ns.length > 0 && ns.every(has);
    }
    _collapsed(range, off, make) {
      if (!off) { const el = make(); el.textContent = ZW; range.insertNode(el); range.setStart(el.firstChild, 1); range.collapse(true); return; }
      const m = mark(range);
      strip(this.area, m, off.test, off.clear);
      const tn = document.createTextNode(ZW); m.em.before(tn);
      range.setStart(tn, 1); range.collapse(true);
      m.sm.remove(); m.em.remove(); removeEmpty(this.area);
    }
    toggleInline(name) {
      const spec = INLINE[name]; if (!spec) return this;
      this.run((range) => {
        const test = (e) => spec.tags.includes(e.tagName), active = this._inlineActive(range, spec.tags);
        if (range.collapsed) { this._collapsed(range, active ? { test, clear: unwrap } : null, () => $(spec.make)); return; }
        const m = mark(range);
        if (spec.exclusive) strip(this.area, m, (e) => INLINE[spec.exclusive].tags.includes(e.tagName), unwrap);
        strip(this.area, m, test, unwrap);
        if (!active) applyWrap(this.area, m, () => $(spec.make));
        finish(this.area, range, m);
      });
      return this;
    }
    setStyle(prop, value) {
      value = String(value || '');
      if (value) { value = prop === 'font-family' ? safeFamily(value) : prop === 'font-size' ? safeSize(value) : safeColor(value); if (!value) return this; }
      this.run((range) => {
        const test = (e) => INLINE_TAGS.has(e.tagName) && e.style && e.style.getPropertyValue(prop);
        const clear = (e) => { e.style.removeProperty(prop); if (!(e.getAttribute('style') || '').trim()) e.removeAttribute('style'); if (e.tagName === 'SPAN' && !e.attributes.length) unwrap(e); };
        const make = () => { const s = $('span'); s.style.setProperty(prop, value); return s; };
        if (range.collapsed) { if (value) this._collapsed(range, null, make); else this._collapsed(range, { test, clear }); return; }
        const m = mark(range); strip(this.area, m, test, clear);
        if (value) applyWrap(this.area, m, make);
        finish(this.area, range, m);
      });
      return this;
    }
    clearFormat() {
      this.run((range) => {
        const m = mark(range);
        strip(this.area, m, (e) => /^(STRONG|B|EM|I|U|S|STRIKE|DEL|SUB|SUP|FONT|MARK|SPAN)$/.test(e.tagName), unwrap);
        leafBlocks(this.area, m).forEach((b) => { if (/^(H[1-6]|PRE|DIV)$/.test(b.tagName)) retagBlock(b, 'p'); else b.removeAttribute('style'); });
        finish(this.area, range, m);
      });
      return this;
    }
    setBlock(tag) {
      tag = String(tag || 'p').toLowerCase(); if (!/^(p|h[1-6])$/.test(tag)) return this;
      this.run((range) => {
        const m = mark(range);
        leafBlocks(this.area, m).forEach((b) => {
          if (/^(LI|TD|TH)$/.test(b.tagName)) {
            if (tag === 'p') return;
            const n = $(tag); [...b.childNodes].filter((c) => !isBlock(c)).forEach((c) => n.appendChild(c)); b.insertBefore(n, b.firstChild);
          } else if (b.tagName !== tag.toUpperCase()) retagBlock(b, tag);
        });
        finish(this.area, range, m);
      });
      return this;
    }
    align(v) {
      if (!/^(left|center|right|justify)$/.test(v)) return this;
      this.run((range) => { const m = mark(range); leafBlocks(this.area, m).forEach((b) => { b.style.textAlign = v; }); finish(this.area, range, m); });
      return this;
    }
    toggleList(tag) {
      this.run((range) => {
        const m = mark(range), units = uniq(leafBlocks(this.area, m).map(listUnit));
        const all = units.length && units.every((u) => u.tagName === 'LI' && u.parentNode.tagName === tag);
        units.forEach((u) => { if (all) unlistItem(u); else if (u.tagName === 'LI') retagList(u, tag); else wrapInList(u, tag); });
        mergeLists(this.area); finish(this.area, range, m);
      });
      return this;
    }
    indent(dir = 1) {
      this.run((range) => {
        const m = mark(range);
        uniq(leafBlocks(this.area, m).map(listUnit)).forEach((u) => {
          if (u.tagName === 'LI') { if (dir > 0) indentLi(u); else outdentLi(u); }
          else if (!/^(TD|TH)$/.test(u.tagName)) shiftBlock(u, dir);
        });
        finish(this.area, range, m);
      });
      return this;
    }
    toggleQuote() {
      this.run((range) => {
        const m = mark(range), leafs = leafBlocks(this.area, m), inQ = (b) => up(b, this.area, (e) => e.tagName === 'BLOCKQUOTE');
        if (leafs.length && leafs.every(inQ)) uniq(leafs.map(inQ)).forEach(unwrap);
        else {
          const units = uniq(leafs.filter((b) => !inQ(b)).map((b) => unitOf(b, this.area)));
          let group = [];
          const flushGroup = () => { if (!group.length) return; const q = $('blockquote'); group[0].before(q); group.forEach((u) => q.appendChild(u)); group = []; };
          units.forEach((u) => {
            const prev = group[group.length - 1];
            if (prev) { let n = prev.nextSibling; while (n && (n.nodeType === 8 || (n.nodeType === 3 && !n.data.trim()))) n = n.nextSibling; if (n !== u) flushGroup(); }
            group.push(u);
          });
          flushGroup();
        }
        finish(this.area, range, m);
      });
      return this;
    }
    toggleCode() {
      this.run((range) => {
        const m = mark(range), leafs = leafBlocks(this.area, m), pres = leafs.filter((b) => b.tagName === 'PRE');
        if (leafs.length && pres.length === leafs.length) {
          pres.forEach((pre) => {
            preToInline(pre);
            const out = []; let cur = $('p');
            [...pre.childNodes].forEach((c) => { if (c.nodeName === 'BR') { out.push(cur); cur = $('p'); } else cur.appendChild(c); });
            out.push(cur);
            if (out.length > 1 && !cur.firstChild) out.pop();
            out.forEach((p) => { if (!p.firstChild) p.innerHTML = '<br>'; });
            pre.before(...out); pre.remove();
          });
        } else {
          const targets = leafs.filter((b) => !/^(LI|TD|TH|PRE)$/.test(b.tagName));
          if (targets.length) {
            const pre = $('pre'), code = $('code'); pre.appendChild(code);
            targets.forEach((b, i) => { flattenToText(b); if (i) code.appendChild(document.createTextNode('\n')); while (b.firstChild) code.appendChild(b.firstChild); });
            targets[0].before(pre); targets.forEach((b) => b.remove());
            if (!code.textContent) code.insertBefore(document.createTextNode(ZW), code.firstChild);
          }
        }
        finish(this.area, range, m);
      });
      return this;
    }
    _unit(range) { const leaf = leafAt(range.startContainer, this.area); return leaf ? unitOf(leaf, this.area) : null; }
    insertHr() {
      this.run((range) => {
        range.collapse(false);
        const unit = this._unit(range), hr = $('hr');
        if (!unit) { range.insertNode(hr); range.setStartAfter(hr); range.collapse(true); return; }
        if (unit.tagName === 'P' && isEmptyBlock(unit)) { unit.before(hr); caretIn(range, unit, false); return; }
        insertAfterUnit(unit, hr);
        if (/^(TD|TH)$/.test(unit.tagName)) { range.setStartAfter(hr); range.collapse(true); return; }
        const p = emptyP(); hr.after(p); caretIn(range, p, false);
      });
      return this;
    }
    insertTable(opts = {}) {
      const rows = Math.max(1, Math.min(50, parseInt(opts.rows, 10) || 2)), cols = Math.max(1, Math.min(20, parseInt(opts.cols, 10) || 2));
      this.run((range) => {
        range.collapse(false);
        const table = $('table'), body = $('tbody'); table.appendChild(body);
        for (let r = 0; r < rows; r++) { const tr = $('tr'); for (let c = 0; c < cols; c++) { const td = $(opts.header && r === 0 ? 'th' : 'td'); td.innerHTML = '<br>'; tr.appendChild(td); } body.appendChild(tr); }
        const unit = this._unit(range);
        if (!unit) range.insertNode(table);
        else if (unit.tagName === 'P' && isEmptyBlock(unit)) unit.before(table); else insertAfterUnit(unit, table);
        if (!table.nextElementSibling) table.after(emptyP());
        caretIn(range, table.querySelector('td,th'), false);
      });
      return this;
    }
    setLink({ href, text = null, newTab = false } = {}) {
      href = normalizeUrl(href); if (!href) return this;
      const make = () => { const a = $('a'); a.setAttribute('href', href); if (newTab) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); } return a; };
      this.run((range) => {
        const a0 = up(range.startContainer, this.area, (e) => e.tagName === 'A');
        if (a0 && (range.collapsed || a0.contains(range.endContainer))) {
          a0.setAttribute('href', href);
          if (newTab) { a0.setAttribute('target', '_blank'); a0.setAttribute('rel', 'noopener noreferrer'); } else { a0.removeAttribute('target'); a0.removeAttribute('rel'); }
          if (text != null && text.trim() && text !== a0.textContent) a0.textContent = text;
          range.setStartAfter(a0); range.collapse(true); return;
        }
        if (range.collapsed) {
          const a = make(); a.textContent = (text && text.trim()) || href; range.insertNode(a);
          const z = document.createTextNode(ZW); a.after(z); range.setStart(z, 1); range.collapse(true); return;
        }
        const m = mark(range);
        strip(this.area, m, (e) => e.tagName === 'A', unwrap); applyWrap(this.area, m, make);
        finish(this.area, range, m);
      });
      return this;
    }
    removeLink() {
      this.run((range) => {
        const a0 = up(range.startContainer, this.area, (e) => e.tagName === 'A');
        if (a0 && range.collapsed) { const m = mark(range); unwrap(a0); finish(this.area, range, m); return; }
        const m = mark(range); strip(this.area, m, (e) => e.tagName === 'A', unwrap); finish(this.area, range, m);
      });
      return this;
    }
    insertImage({ src, alt = '', width = 0 } = {}) {
      if (!safeUrl(src, true)) { this._emit('error', { message: this.t.invalidUrl }); return false; }
      return this.run((range) => {
        range.deleteContents();
        const img = $('img'); img.setAttribute('src', safeUrl(src, true)); img.setAttribute('alt', String(alt || '').slice(0, 300));
        if (width > 0 && width < 5000) img.setAttribute('width', String(Math.round(width)));
        range.insertNode(img); range.setStartAfter(img); range.collapse(true);
      });
    }
    async _readImage(file) {
      if (!/^image\//.test(file.type)) throw new Error(this.t.notImage);
      if (typeof this.o.imageUpload === 'function') return this.o.imageUpload(file);
      if (file.size > this.o.maxImageSize) throw new Error(this.t.tooBig);
      return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(new Error('read')); fr.readAsDataURL(file); });
    }
    _imageFile(f) { this._readImage(f).then((src) => this.insertImage({ src, alt: f.name.replace(/\.[^.]+$/, '') })).catch((e) => this._emit('error', { message: e.message })); }
    selectAll() {
      if (this.sourceMode) { this.source.select(); return this; }
      this.focusArea(); const r = document.createRange(); r.selectNodeContents(this.area); this._setSel(r); return this;
    }
    toggleSource(on = !this.sourceMode) {
      on = !!on; if (on === this.sourceMode) return this;
      this.closePanel();
      if (on) {
        this.flush(); this.source.value = this._srcInit = formatHTML(this.getHTML());
        this.sourceMode = true; this.area.hidden = true; this.source.hidden = false; this.root.classList.add('is-source');
      } else {
        const html = this.source.value;
        this.sourceMode = false; this.area.hidden = false; this.source.hidden = true; this.root.classList.remove('is-source');
        if (!this.o.readonly && html !== this._srcInit) this.setHTML(html); else this._sync(true);
      }
      const b = this.tools.source; if (b) { b.innerHTML = ICON[on ? 'visual' : 'source']; b.title = this.t[on ? 'visual' : 'source']; b.setAttribute('aria-label', b.title); b.classList.toggle('is-active', on); }
      this._apply(); this.refresh(); this._emit('source', { on });
      if (on) this.source.focus(); else if (!this.o.readonly && !this.o.disabled) this.focusArea();
      return this;
    }
    toggleFullscreen(on = !this.fullscreen) {
      this.fullscreen = !!on; this.closePanel();
      this.root.classList.toggle('bui-editor-fullscreen', this.fullscreen);
      document.documentElement.classList.toggle('bui-editor-lock', [...instances].some((e) => e.fullscreen));
      const b = this.tools.fullscreen; if (b) { b.innerHTML = ICON[this.fullscreen ? 'exitFullscreen' : 'fullscreen']; b.title = this.t[this.fullscreen ? 'exitFullscreen' : 'fullscreen']; b.setAttribute('aria-label', b.title); b.classList.toggle('is-active', this.fullscreen); }
      this._emit('fullscreen', { on: this.fullscreen });
      return this;
    }

    /* ----- public API ----- */
    exec(name, v) {
      const c = {
        bold: () => this.toggleInline('bold'), italic: () => this.toggleInline('italic'), underline: () => this.toggleInline('underline'), strike: () => this.toggleInline('strike'),
        subscript: () => this.toggleInline('subscript'), superscript: () => this.toggleInline('superscript'), clear: () => this.clearFormat(),
        heading: () => this.setBlock(v || 'p'), fontFamily: () => this.setStyle('font-family', v), fontSize: () => this.setStyle('font-size', typeof v === 'number' ? `${v}px` : v),
        color: () => this.setStyle('color', v), highlight: () => this.setStyle('background-color', v),
        align: () => this.align(v), alignLeft: () => this.align('left'), alignCenter: () => this.align('center'), alignRight: () => this.align('right'), alignJustify: () => this.align('justify'),
        ul: () => this.toggleList('UL'), ol: () => this.toggleList('OL'), indent: () => this.indent(1), outdent: () => this.indent(-1), quote: () => this.toggleQuote(),
        link: () => this.setLink(v), unlink: () => this.removeLink(), image: () => this.insertImage(v), table: () => this.insertTable(v), hr: () => this.insertHr(), codeBlock: () => this.toggleCode(),
        undo: () => this.undo(), redo: () => this.redo(), selectAll: () => this.selectAll(), fullscreen: () => this.toggleFullscreen(v), source: () => this.toggleSource(v),
      };
      if (c[name]) c[name]();
      return this;
    }
    _clean(html) {
      const s = this.o.sanitize; html = String(html == null ? '' : html);
      if (s === false) return html; if (typeof s === 'function') return s(html);
      return sanitizeHTML(html, {});
    }
    _frag(html) {
      if (this.o.sanitize === false) { const tpl = document.createElement('template'); tpl.innerHTML = String(html); return tpl.content; }
      return sanitizeFragment(typeof this.o.sanitize === 'function' ? this.o.sanitize(String(html)) : html, {});
    }
    getHTML() {
      if (this.sourceMode) return this._clean(this.source.value);
      const c = this.area.cloneNode(true), w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT), dead = [];
      while (w.nextNode()) { const n = w.currentNode; if (n.nodeType === 8) dead.push(n); else if (n.data.includes(ZW)) n.data = n.data.replace(/\u200B/g, ''); }
      dead.forEach((n) => n.remove());
      removeEmpty(c);
      c.querySelectorAll('pre').forEach((pre) => { const x = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT); let last = null; while (x.nextNode()) last = x.currentNode; if (last) last.data = last.data.replace(/\n$/, ''); });
      if (this.isEmpty()) return '';
      return c.innerHTML;
    }
    setHTML(html, opts = {}) {
      const c = this._clean(html);
      this.area.innerHTML = c || '<p><br></p>'; this.fixTop(); this.saved = null;
      if (this.sourceMode) this.source.value = formatHTML(c);
      if (!opts.silent) { this.record(); this._sync(); this.refresh(); }
      return this;
    }
    insertHTML(html) { this.run((range) => pasteInto(range, this._frag(html), this.area)); return this; }
    getText() { return this.area.textContent.replace(/\u200B/g, ''); }
    getLength() { return this.getText().length; }
    isEmpty() { return !this.area.textContent.replace(/[\u200B\s]/g, '') && !this.area.querySelector('img,hr,table'); }
    clear() { return this.setHTML(''); }
    focus() { if (this.sourceMode) this.source.focus(); else if (!this.o.disabled) this.focusArea(); return this; }
    blur() { this.area.blur(); this.source.blur(); return this; }
    setReadonly(v = true) { this.o.readonly = !!v; this._apply(); this.refresh(); return this; }
    setDisabled(v = true) { this.o.disabled = !!v; this._apply(); this.refresh(); return this; }
    setPlaceholder(s) { this.o.placeholder = s || ''; this.ph.textContent = this.o.placeholder; this.area.setAttribute('aria-label', this.o.placeholder || this.t.area); return this; }
    setDir(d) { if (!d || d === 'auto') this.root.removeAttribute('dir'); else this.root.setAttribute('dir', d); this.refresh(); return this; }
    setHeight(h) { this.body.style.height = h && h !== 'auto' ? px(h) : ''; return this; }
    on(name, fn) { this.root.addEventListener(`bui:editor-${name}`, (e) => fn(e.detail, e)); return this; }
    destroy() {
      this.closePanel(); instances.delete(this);
      if (this._form) this._form.removeEventListener('submit', this._onSubmit);
      if (this.fullscreen) this.toggleFullscreen(false);
      const html = this.getHTML();
      if (this.isTa) { this.el.hidden = false; this.el.value = html; this.root.remove(); }
      else { this.root.className = this.root.className.replace(/\bbui-editor[\w-]*|\bis-\w+/g, '').trim(); this.root.removeAttribute('data-resize'); this.root.style.removeProperty('--bui-editor-min-height'); this.root.innerHTML = html; }
      delete this.el._buiEditor; delete this.root._buiEditor;
    }
  }

  const INLINE = {
    bold: { tags: ['STRONG', 'B'], make: 'strong' }, italic: { tags: ['EM', 'I'], make: 'em' }, underline: { tags: ['U'], make: 'u' },
    strike: { tags: ['S', 'STRIKE', 'DEL'], make: 's' },
    subscript: { tags: ['SUB'], make: 'sub', exclusive: 'superscript' }, superscript: { tags: ['SUP'], make: 'sup', exclusive: 'subscript' },
  };

  /* ---------- Public namespace and auto-init ---------- */
  const init = (root = document) => {
    const list = root.matches && root.matches('[data-bui-editor]') ? [root] : [];
    list.push(...(root.querySelectorAll ? root.querySelectorAll('[data-bui-editor]') : []));
    list.forEach((el) => { if (!el._buiEditor) new BasetEditor(el); });
  };
  const make = (Cls) => { function f(...args) { return new Cls(...args); } Object.setPrototypeOf(f, Cls); Object.defineProperty(f, 'prototype', { value: Cls.prototype }); f.Class = Cls; return f; };
  /* BUI.editor(target, options) creates an editor (new is optional); the helpers below live on the same function */
  BUI.editor = Object.assign(make(BasetEditor), {
    version: '1.0.0', create: (t, o) => new BasetEditor(t, o), init, locales: LOCALES, defaults: DEFAULTS, presets: PRESETS,
    get: (t) => { const el = typeof t === 'string' ? document.querySelector(t) : t; return el ? el._buiEditor || (el.matches('[data-bui-editor]') ? new BasetEditor(el) : null) : null; },
    sanitize: (html, o) => sanitizeHTML(html, o),
  });
  const start = () => { init(); new MutationObserver((rs) => rs.forEach((r) => r.addedNodes.forEach((n) => { if (n.nodeType === 1) init(n); }))).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
