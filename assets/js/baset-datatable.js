/* Baset UI — DataTable (optional, no dependencies)
 *
 * An interactive data grid: pagination, search, multi-column sorting, filters, column tools, selection, inline and
 * modal editing, row actions, export buttons (copy, CSV, real XLSX, real PDF, print, JSON), responsive columns and
 * card view, server-side processing, state saving, English + Arabic, light / dark, LTR / RTL.
 * Needs baset-ui.css (section 21). baset-ui.js is NOT required. Full guide: components/datatable.html
 *
 *   const dt = BUI.dataTable('#users', {
 *     data: [{ id: 1, name: 'Sara' }],
 *     columns: [{ data: 'id', title: 'ID' }, { data: 'name', title: 'Name' }],
 *     pageLength: 10, searching: true, buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
 *   });
 *   dt.search('sara').order([[1, 'asc']]).draw();
 *
 * Add a language:  BUI.dataTable.locales.fr = { search: 'Rechercher…', … }   (missing keys fall back to English)
 * Export adapters: BUI.dataTable.adapters.pdf = (exportData, options) => Blob | Promise<Blob>   (optional)
 */
(() => {
  'use strict';
  const BUI = (window.BUI = window.BUI || {});
  if (BUI.dataTable) return;
  /* BUI.dataTable(target, options) creates an instance (new is optional); statics such as BUI.dataTable.locales live on the same function */
  const make = (Cls) => { function f(...args) { return new Cls(...args); } Object.setPrototypeOf(f, Cls); Object.defineProperty(f, 'prototype', { value: Cls.prototype }); f.Class = Cls; return f; };

  const VERSION = '1.0.0';
  const doc = document;
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const isFn = (v) => typeof v === 'function';
  const hasVal = (v) => v !== null && v !== undefined && v !== '';
  const toArr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
  const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
  let uid = 0;

  function el(tag, cls, attrs, text) {
    const n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (const k in attrs) { if (attrs[k] !== undefined && attrs[k] !== null && attrs[k] !== false) n.setAttribute(k, attrs[k] === true ? '' : attrs[k]); }
    if (text !== undefined) n.textContent = text;
    return n;
  }
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const getPath = (o, p) => {
    if (p == null || p === '') return o;
    if (isFn(p)) return p(o);
    if (o == null) return undefined;
    if (typeof p === 'number') return o[p];
    if (p in Object(o)) return o[p];
    return String(p).split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  };
  const setPath = (o, p, v) => {
    if (typeof p !== 'string' && typeof p !== 'number') return;
    const parts = String(p).split('.');
    if (parts.length === 1 || p in o) { o[p] = v; return; }
    let cur = o;
    parts.forEach((k, i) => { if (i === parts.length - 1) cur[k] = v; else cur = cur[k] = isObj(cur[k]) ? cur[k] : {}; });
  };
  const debounce = (fn, ms) => { let t; const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; d.cancel = () => clearTimeout(t); return d; };
  const merge = (base, over) => {
    const out = { ...base };
    for (const k in over || {}) out[k] = isObj(over[k]) && isObj(base[k]) ? merge(base[k], over[k]) : over[k];
    return out;
  };
  const clone = (v) => (v == null || typeof v !== 'object' ? v : Array.isArray(v) ? v.map(clone) : v instanceof Date ? new Date(v) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)])));
  const RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'ckb', 'dv'];
  const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o && k in o ? o[k] : m));

  /* ---------- Languages (flat keys; add one with BUI.dataTable.locales.fr = { … }) ---------- */
  const locales = {
    en: {
      search: 'Search…', searchLabel: 'Search the table', clear: 'Clear', length: 'Show {menu} entries', lengthLabel: 'Rows per page', all: 'All', lengthCustom: 'Custom number', selectionColumn: 'Selection column', selectRowsFirst: 'Select rows',
      info: 'Showing {start} to {end} of {total} entries', infoEmpty: 'No entries to show', infoFiltered: '(filtered from {max} total entries)', infoSelected: '{n} selected',
      first: 'First', prev: 'Previous', next: 'Next', last: 'Last', pageLabel: 'Pagination', pageN: 'Page {n}', pageOf: 'Page {n} of {total}', pageJump: 'Go to page', go: 'Go',
      empty: 'No matching records found', emptyTable: 'No data available', loading: 'Loading…', processing: 'Processing…', error: 'The data could not be loaded.', retry: 'Retry',
      columns: 'Columns', restoreColumns: 'Restore columns', showAll: 'Show all', reset: 'Reset', refresh: 'Refresh', fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen',
      copy: 'Copy', csv: 'CSV', excel: 'Excel', pdf: 'PDF', print: 'Print', json: 'JSON', export: 'Export', copied: 'Copied {n} rows to the clipboard.', copyFail: 'Could not copy. Select the text and copy it manually.',
      exportEmpty: 'There are no rows to export.', pdfFallback: 'This table has characters the built-in PDF writer cannot draw, so the print dialog opened. Choose "Save as PDF".', pdfNoAdapter: 'Install a PDF adapter for this language.',
      filters: 'Filters', clearFilters: 'Clear all filters', any: 'Any', yes: 'Yes', no: 'No', from: 'From', to: 'To', min: 'Min', max: 'Max', and: 'AND', or: 'OR', matchAll: 'Match all', matchAny: 'Match any',
      searchBuilder: 'Search builder', addCondition: 'Add condition', removeCondition: 'Remove condition', column: 'Column', operator: 'Operator', value: 'Value', apply: 'Apply',
      op: { contains: 'contains', notContains: 'does not contain', equals: 'equals', notEquals: 'does not equal', startsWith: 'starts with', endsWith: 'ends with', gt: 'greater than', gte: 'at least', lt: 'less than', lte: 'at most', between: 'between', empty: 'is empty', notEmpty: 'is not empty' },
      selectAll: 'Select all', deselectAll: 'Deselect all', selectPage: 'Select this page', selectFiltered: 'Select all {n} filtered', selectRow: 'Select row', selectAllRows: 'Select all rows on this page',
      bulkDelete: 'Delete selected', bulkEdit: 'Edit selected', selectedCount: '{n} selected', actions: 'Actions', view: 'View', edit: 'Edit', delete: 'Delete', duplicate: 'Duplicate', create: 'New record',
      save: 'Save', cancel: 'Cancel', close: 'Close', details: 'Details', confirmDelete: 'Delete this record?', confirmDeleteText: 'This action cannot be undone.', confirmBulk: 'Delete {n} records?',
      editTitle: 'Edit record', createTitle: 'New record', bulkEditTitle: 'Edit {n} records', bulkField: 'Field to change', saveFailed: 'The change could not be saved.',
      required: 'This field is required.', invalidEmail: 'Enter a valid email address.', invalidNumber: 'Enter a valid number.', invalidDate: 'Enter a valid date.', minValue: 'Must be at least {n}.', maxValue: 'Must be at most {n}.',
      minLength: 'Use at least {n} characters.', maxLength: 'Use at most {n} characters.', pattern: 'The format is not valid.', invalid: 'This value is not valid.',
      sortAsc: 'Sort ascending', sortDesc: 'Sort descending', sortNone: 'Clear sorting', toggleRow: 'Show details', cardView: 'Card view', tableView: 'Table view', resize: 'Resize column', moveHint: 'Alt + arrow keys move this column',
      toggleGroup: 'Collapse or expand the group', groupCount: '{n} rows', rowsLabel: 'rows', yesNo: ['Yes', 'No'],
    },
    ar: {
      search: 'بحث…', searchLabel: 'البحث في الجدول', clear: 'مسح', length: 'عرض {menu} صفوف', lengthLabel: 'عدد الصفوف في الصفحة', all: 'الكل', lengthCustom: 'عدد مخصص', selectionColumn: 'عمود التحديد', selectRowsFirst: 'حدد صفوفاً',
      info: 'عرض {start} إلى {end} من أصل {total} سجل', infoEmpty: 'لا توجد سجلات للعرض', infoFiltered: '(تمت التصفية من أصل {max} سجل)', infoSelected: 'تم تحديد {n}',
      first: 'الأولى', prev: 'السابق', next: 'التالي', last: 'الأخيرة', pageLabel: 'ترقيم الصفحات', pageN: 'صفحة {n}', pageOf: 'صفحة {n} من {total}', pageJump: 'اذهب إلى صفحة', go: 'اذهب',
      empty: 'لا توجد سجلات مطابقة', emptyTable: 'لا توجد بيانات', loading: 'جارٍ التحميل…', processing: 'جارٍ المعالجة…', error: 'تعذر تحميل البيانات.', retry: 'إعادة المحاولة',
      columns: 'الأعمدة', restoreColumns: 'استعادة الأعمدة', showAll: 'إظهار الكل', reset: 'إعادة ضبط', refresh: 'تحديث', fullscreen: 'ملء الشاشة', exitFullscreen: 'إنهاء ملء الشاشة',
      copy: 'نسخ', csv: 'CSV', excel: 'إكسل', pdf: 'PDF', print: 'طباعة', json: 'JSON', export: 'تصدير', copied: 'تم نسخ {n} صفوف إلى الحافظة.', copyFail: 'تعذر النسخ. حدد النص وانسخه يدويًا.',
      exportEmpty: 'لا توجد صفوف للتصدير.', pdfFallback: 'يحتوي الجدول على أحرف لا يستطيع مُنشئ PDF المدمج رسمها، لذلك فُتحت نافذة الطباعة. اختر «حفظ بصيغة PDF».', pdfNoAdapter: 'ثبّت محوّل PDF لهذه اللغة.',
      filters: 'عوامل التصفية', clearFilters: 'مسح كل عوامل التصفية', any: 'أي', yes: 'نعم', no: 'لا', from: 'من', to: 'إلى', min: 'الأدنى', max: 'الأقصى', and: 'و', or: 'أو', matchAll: 'مطابقة الكل', matchAny: 'مطابقة أي شرط',
      searchBuilder: 'منشئ البحث', addCondition: 'إضافة شرط', removeCondition: 'حذف الشرط', column: 'العمود', operator: 'العملية', value: 'القيمة', apply: 'تطبيق',
      op: { contains: 'يحتوي على', notContains: 'لا يحتوي على', equals: 'يساوي', notEquals: 'لا يساوي', startsWith: 'يبدأ بـ', endsWith: 'ينتهي بـ', gt: 'أكبر من', gte: 'لا يقل عن', lt: 'أصغر من', lte: 'لا يزيد عن', between: 'بين', empty: 'فارغ', notEmpty: 'غير فارغ' },
      selectAll: 'تحديد الكل', deselectAll: 'إلغاء التحديد', selectPage: 'تحديد هذه الصفحة', selectFiltered: 'تحديد كل النتائج ({n})', selectRow: 'تحديد الصف', selectAllRows: 'تحديد كل صفوف هذه الصفحة',
      bulkDelete: 'حذف المحدد', bulkEdit: 'تعديل المحدد', selectedCount: 'تم تحديد {n}', actions: 'إجراءات', view: 'عرض', edit: 'تعديل', delete: 'حذف', duplicate: 'تكرار', create: 'سجل جديد',
      save: 'حفظ', cancel: 'إلغاء', close: 'إغلاق', details: 'التفاصيل', confirmDelete: 'هل تريد حذف هذا السجل؟', confirmDeleteText: 'لا يمكن التراجع عن هذا الإجراء.', confirmBulk: 'هل تريد حذف {n} سجل؟',
      editTitle: 'تعديل السجل', createTitle: 'سجل جديد', bulkEditTitle: 'تعديل {n} سجل', bulkField: 'الحقل المراد تغييره', saveFailed: 'تعذر حفظ التغيير.',
      required: 'هذا الحقل مطلوب.', invalidEmail: 'أدخل بريدًا إلكترونيًا صحيحًا.', invalidNumber: 'أدخل رقمًا صحيحًا.', invalidDate: 'أدخل تاريخًا صحيحًا.', minValue: 'يجب ألا تقل القيمة عن {n}.', maxValue: 'يجب ألا تزيد القيمة عن {n}.',
      minLength: 'استخدم {n} أحرف على الأقل.', maxLength: 'استخدم {n} أحرف على الأكثر.', pattern: 'الصيغة غير صحيحة.', invalid: 'القيمة غير صحيحة.',
      sortAsc: 'ترتيب تصاعدي', sortDesc: 'ترتيب تنازلي', sortNone: 'إلغاء الترتيب', toggleRow: 'إظهار التفاصيل', cardView: 'عرض البطاقات', tableView: 'عرض الجدول', resize: 'تغيير عرض العمود', moveHint: 'Alt مع الأسهم لتحريك هذا العمود',
      toggleGroup: 'طي المجموعة أو توسيعها', groupCount: '{n} صفوف', rowsLabel: 'صفوف', yesNo: ['نعم', 'لا'],
    },
  };

  /* ---------- Export file builders (no libraries) ---------- */
  const utf8 = (s) => new TextEncoder().encode(s);
  let CRC_T;
  function crc32(bytes) {
    if (!CRC_T) { CRC_T = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC_T[n] = c >>> 0; } }
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_T[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  /* A ZIP archive using "store" (no compression): all an .xlsx needs. files = [{ name, data: string | Uint8Array }] */
  function zip(files) {
    const parts = []; const central = []; let offset = 0;
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = (clamp(d.getFullYear() - 1980, 0, 127) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const f of files) {
      const name = utf8(f.name); const data = typeof f.data === 'string' ? utf8(f.data) : f.data; const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      parts.push(new Uint8Array(lh.buffer), name, data); central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const csize = central.reduce((n, p) => n + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  const xmlEsc = (s) => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const colName = (i) => { let s = ''; for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s; return s; };

  /* A real .xlsx (Office Open XML). Numbers stay numbers; text is stored as inline strings; the header row is bold. */
  function buildXlsx(ex, o) {
    const rows = []; let r = 1; const merges = [];
    const cell = (c, v, s) => {
      const ref = colName(c) + r;
      if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"${s ? ` s="${s}"` : ''}><v>${v}</v></c>`;
      if (typeof v === 'boolean') return `<c r="${ref}" t="b"${s ? ` s="${s}"` : ''}><v>${v ? 1 : 0}</v></c>`;
      if (v == null || v === '') return s ? `<c r="${ref}" s="${s}"/>` : '';
      return `<c r="${ref}" t="inlineStr"${s ? ` s="${s}"` : ''}><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
    };
    const n = ex.headers.length;
    if (o.title) { rows.push(`<row r="${r}">${cell(0, o.title, 3)}</row>`); if (n > 1) merges.push(`A${r}:${colName(n - 1)}${r}`); r++; }
    if (o.messageTop) { rows.push(`<row r="${r}">${cell(0, o.messageTop, 0)}</row>`); r++; }
    rows.push(`<row r="${r}">${ex.headers.map((h, i) => cell(i, h, 1)).join('')}</row>`); const headRow = r; r++;
    for (const row of ex.rows) { rows.push(`<row r="${r}">${row.map((v, i) => cell(i, v, 0)).join('')}</row>`); r++; }
    if (o.messageBottom) { r++; rows.push(`<row r="${r}">${cell(0, o.messageBottom, 0)}</row>`); r++; }
    const widths = ex.headers.map((h, i) => { let m = String(h).length; for (let k = 0; k < Math.min(ex.rows.length, 200); k++) m = Math.max(m, String(ex.rows[k][i] ?? '').length); return clamp(m + 3, 8, 60); });
    const rtl = o.rtl ? ' rightToLeft="1"' : '';
    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"${rtl}><pane ySplit="${headRow}" topLeftCell="A${headRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${rows.join('')}</sheetData>${n && ex.rows.length ? `<autoFilter ref="A${headRow}:${colName(n - 1)}${headRow + ex.rows.length}"/>` : ''}${merges.length ? `<mergeCells count="${merges.length}">${merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : ''}</worksheet>`;
    const sheetName = xmlEsc((o.sheetName || 'Sheet1').replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Sheet1');
    const hdr = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    return zip([
      { name: '[Content_Types].xml', data: `${hdr}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
      { name: '_rels/.rels', data: `${hdr}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
      { name: 'xl/workbook.xml', data: `${hdr}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
      { name: 'xl/_rels/workbook.xml.rels', data: `${hdr}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
      { name: 'xl/styles.xml', data: `${hdr}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="14"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF6658E8"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>` },
      { name: 'xl/worksheets/sheet1.xml', data: sheet },
    ]);
  }

  /* A real PDF 1.4 file with the standard Helvetica fonts (Latin / Western European text). Returns null when the text needs
   * characters outside that range (Arabic, Chinese …): then use a PDF adapter (see docs) or the print dialog. */
  const HW = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
  const WIN = { '€': 128, '‚': 130, 'ƒ': 131, '„': 132, '…': 133, '†': 134, '‡': 135, 'ˆ': 136, '‰': 137, 'Š': 138, '‹': 139, 'Œ': 140, 'Ž': 142, '‘': 145, '’': 146, '“': 147, '”': 148, '•': 149, '–': 150, '—': 151, '˜': 152, '™': 153, 'š': 154, '›': 155, 'œ': 156, 'ž': 158, 'Ÿ': 159 };
  const winCode = (ch) => { const c = ch.charCodeAt(0); if (c >= 32 && c < 127) return c; if (c >= 160 && c < 256) return c; return WIN[ch] || 0; };
  const pdfSupported = (s) => { for (const ch of String(s)) { if (ch === '\n' || ch === '\t' || ch === '\r') continue; if (!winCode(ch)) return false; } return true; };
  const textW = (s, size) => { let w = 0; for (const ch of s) { const c = ch.charCodeAt(0); w += c >= 32 && c < 127 ? HW[c - 32] : 556; } return (w * size) / 1000; };
  const pdfStr = (s) => { let o = ''; for (const ch of s) { const c = winCode(ch) || 32; const t = String.fromCharCode(c); o += t === '(' || t === ')' || t === '\\' ? '\\' + t : c > 126 ? '\\' + c.toString(8).padStart(3, '0') : t; } return `(${o})`; };

  function buildPdf(ex, o) {
    const all = [o.title, o.messageTop, o.messageBottom, ...ex.headers, ...ex.rows.flat()].filter(hasVal).map(String);
    if (!all.every(pdfSupported)) return null;
    const landscape = o.orientation ? o.orientation === 'landscape' : ex.headers.length > 5;
    const PW = landscape ? 841.89 : 595.28; const PH = landscape ? 595.28 : 841.89; const M = 36;
    const fs = o.fontSize || 9; const lh = fs * 1.35; const padX = 4; const padY = 4;
    const usable = PW - M * 2;
    const raw = ex.headers.map((h, i) => { let m = textW(String(h), fs) + 10; for (let k = 0; k < Math.min(ex.rows.length, 300); k++) m = Math.max(m, Math.min(textW(String(ex.rows[k][i] ?? ''), fs) + 10, 220)); return m; });
    const total = raw.reduce((a, b) => a + b, 0); const widths = raw.map((w) => (w / total) * usable);
    const wrap = (text, width) => {
      const out = [];
      for (const para of String(text ?? '').split(/\r?\n/)) {
        let line = '';
        for (const word of para.split(/(\s+)/)) {
          if (textW(line + word, fs) <= width) { line += word; continue; }
          if (line.trim()) out.push(line.trimEnd());
          line = word.trimStart();
          while (textW(line, fs) > width && line.length > 1) { let k = line.length - 1; while (k > 1 && textW(line.slice(0, k), fs) > width) k--; out.push(line.slice(0, k)); line = line.slice(k); }
        }
        out.push(line.trimEnd());
      }
      return out.slice(0, 12);
    };
    const pages = []; let ops = []; let y;
    const newPage = () => { ops = []; pages.push(ops); y = PH - M; };
    const rgb = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255].map((v) => v.toFixed(3)).join(' ');
    const text = (s, x, yy, bold, color) => ops.push(`BT /${bold ? 'F2' : 'F1'} ${fs} Tf ${rgb(color || '#20213a')} rg ${x.toFixed(2)} ${yy.toFixed(2)} Td ${pdfStr(s)} Tj ET`);
    const rect = (x, yy, w, h, color) => ops.push(`${rgb(color)} rg ${x.toFixed(2)} ${yy.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
    const line = (x1, y1, x2, y2) => ops.push(`0.88 0.89 0.93 RG 0.5 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
    const drawHead = () => {
      const h = lh + padY * 2; rect(M, y - h, usable, h, '#6658e8'); let x = M;
      ex.headers.forEach((t, i) => { const l = wrap(t, widths[i] - padX * 2)[0] || ''; text(l, x + padX, y - padY - fs, true, '#ffffff'); x += widths[i]; }); y -= h;
    };
    newPage();
    if (o.title) { ops.push(`BT /F2 15 Tf 0.125 0.129 0.227 rg ${M} ${y - 15} Td ${pdfStr(String(o.title))} Tj ET`); y -= 26; }
    if (o.messageTop) { text(String(o.messageTop), M, y - fs, false, '#777b91'); y -= lh + 6; }
    drawHead();
    ex.rows.forEach((row, ri) => {
      const cells = row.map((v, i) => wrap(v == null ? '' : String(v), widths[i] - padX * 2));
      const h = Math.max(...cells.map((c) => c.length), 1) * lh + padY * 2;
      if (y - h < M + 18) { newPage(); drawHead(); }
      if (ri % 2) rect(M, y - h, usable, h, '#f5f5fa');
      let x = M; cells.forEach((lines, i) => { lines.forEach((l, k) => text(l, x + padX, y - padY - fs - k * lh, false)); x += widths[i]; });
      y -= h; line(M, y, M + usable, y);
    });
    if (o.messageBottom) { if (y - lh < M + 18) newPage(); y -= 6; text(String(o.messageBottom), M, y - fs, false, '#777b91'); }
    const stamp = o.footer === false ? '' : String(o.footerText || new Date().toISOString().slice(0, 10));
    const objs = []; const add = (s) => objs.push(s); const pageIds = [];
    add('<< /Type /Catalog /Pages 2 0 R >>'); add(''); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    pages.forEach((p, i) => {
      if (stamp) { const t = `${i + 1} / ${pages.length}`; p.push(`BT /F1 8 Tf 0.47 0.48 0.57 rg ${M} 20 Td ${pdfStr(stamp)} Tj ET`, `BT /F1 8 Tf 0.47 0.48 0.57 rg ${(PW - M - textW(t, 8)).toFixed(2)} 20 Td ${pdfStr(t)} Tj ET`); }
      const content = p.join('\n'); const pid = objs.length + 1; pageIds.push(pid);
      add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pid + 1} 0 R >>`);
      add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    });
    objs[1] = `<< /Type /Pages /Kids [${pageIds.map((i) => `${i} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    const info = objs.length + 1; add(`<< /Title ${pdfStr(String(o.title || o.filename || 'Table'))} /Producer (Baset UI DataTable) >>`);
    let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const offs = [];
    objs.forEach((s, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${s}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((x) => `${String(x).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /* ---------- Text helpers ---------- */
  const stripTags = (s) => String(s).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ًͯ-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  const isTrue = (v) => v === true || v === 1 || /^(true|1|yes|y|on|active)$/i.test(String(v));
  const DATE_RE = /^\d{4}-\d{1,2}-\d{1,2}|^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|^\d{4}\/\d{1,2}\/\d{1,2}/;
  const numKey = (v) => { if (v == null || v === '') return null; if (typeof v === 'number') return isFinite(v) ? v : null; if (typeof v === 'boolean') return v ? 1 : 0; const n = parseFloat(String(v).replace(/[^\d.\-+eE]/g, '')); return isFinite(n) ? n : null; };
  const dateKey = (v) => { if (v == null || v === '') return null; if (v instanceof Date) return v.getTime() || null; if (typeof v === 'number') return v; const t = Date.parse(String(v)); return isFinite(t) ? t : null; };
  const download = (blob, name) => {
    const url = URL.createObjectURL(blob); const a = el('a', '', { href: url, download: name }); a.style.display = 'none';
    doc.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fall through */ }
    try { const t = el('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0;top:0'; doc.body.appendChild(t); t.select(); const ok = doc.execCommand('copy'); t.remove(); return !!ok; } catch (e) { return false; }
  };

  const DEFAULTS = {
    data: null, columns: null, rowId: 'id',
    pagination: true, paginationType: 'numbers', pageLength: 10, lengthMenu: [10, 25, 50, 100, -1], pageJump: false, showInfo: true, showLength: true, pagerSize: 5,
    searching: true, searchDelay: null, searchHighlight: true, searchPlaceholder: null, searchNormalize: true, columnSearch: false,
    ordering: true, orderMulti: true, order: [], orderClearable: true,
    filters: false, filterLogic: 'and', searchBuilder: false,
    colReorder: false, colResize: false, colVisibility: false, fixedHeader: false, fixedColumns: null, scrollY: null, scrollX: false,
    virtualScroll: false, rowGroup: null,
    select: false, bulkBar: true, buttonIcons: false, lengthInput: false, lengthMax: 5000, selectionToggle: false, view: null, rowActions: null, rowActionsMode: 'inline', editor: false, buttons: [], bulkActions: [],
    responsive: true, cardView: 'auto', cardBreakpoint: 576, childRow: true,
    serverSide: false, ajax: null, deferLoading: false,
    stateSave: false, stateKey: null, stateDuration: 0,
    theme: 'auto', variant: '', density: 'comfortable', striped: false, bordered: false, hover: true, className: '', language: {}, emptyMessage: null,
    export: {}, createdRow: null, rowClass: null, drawCallback: null, initComplete: null, events: null, caption: null, ariaLabel: null,
  };

  const instances = new WeakMap();
  const ALLOWED_DIR = ['ltr', 'rtl'];

  class DataTable {
    constructor(target, options = {}) {
      const host = typeof target === 'string' ? doc.querySelector(target) : target;
      if (!host) throw new Error('BUI.dataTable: target not found: ' + target);
      if (instances.has(host)) return instances.get(host);
      instances.set(host, this);
      this.id = 'bdt' + ++uid; this.host = host;
      this.o = merge(DEFAULTS, options);
      this._ev = {}; this._rows = []; this._seq = 0; this._sel = new Map(); this._cells = new Set(); this._hiddenResp = new Set(); this._filterFns = [];
      this._groups = new Set(); this._expanded = new Set(); this._edit = null; this._creating = null; this._json = null; this._reqId = 0; this._timers = {};
      this.s = { search: '', colSearch: {}, filters: {}, fLogic: this.o.filterLogic === 'or' ? 'or' : 'and', builder: { logic: 'and', conds: [] }, order: [], page: 0, len: 10, total: 0, filtered: 0, loading: false, error: null, start: 0, end: 0 };
      this._lang(); this._tableSource(); this._columns();
      this._events();
      const ps = this.o.pageLength; this.s.len = ps === 'all' ? -1 : Number(ps) || 10;
      this.s.order = (this.o.order || []).map(([i, d]) => [this._ci(i), String(d).toLowerCase() === 'desc' ? 'desc' : 'asc']).filter(([i]) => i >= 0);
      if (this.o.rowGroup && !this.s.order.length) { const gi = this._ci(this.o.rowGroup.dataSrc); if (gi >= 0) this.s.order = [[gi, 'asc']]; }
      this._defaults = { order: clone(this.s.order), len: this.s.len, vis: this.cols.map((c) => c.visible), ord: this.cols.map((c) => c.index), widths: this.cols.map((c) => c.width) };
      if (this.o.stateSave) this._loadState();
      this._build();
      this.page = Object.assign((n) => this._page(n), { info: () => this._pageInfo(), len: (n) => this.pageLength(n) });
      this.ajax = { reload: (cb, reset) => this._reload(cb, reset), url: (u) => { if (u === undefined) return this._ajaxCfg().url; this._ajaxCfg().url = u; return this; }, json: () => this._json, params: () => this._buildParams() };
      host.__bdt = this;
      const first = () => { this.emit('init', { dt: this }); if (isFn(this.o.initComplete)) this.o.initComplete.call(this, this); };
      if (this.o.ajax && !this.o.deferLoading) this._reload(() => first(), false, true);
      else { this._process(); this._render(); first(); }
    }

    /* ----- setup ----- */
    _lang() {
      const L = this.o.language || {};
      let loc = L.locale || (doc.documentElement.lang || 'en');
      const base = String(loc).toLowerCase().split(/[-_]/)[0];
      this.locale = loc; this.base = base;
      const own = { ...(locales[base] || {}) }; if (locales[loc]) Object.assign(own, locales[loc]);
      const over = { ...L }; delete over.locale; delete over.direction; delete over.numerals;
      this.t = merge(merge(locales.en, own), over);
      this.dir = ALLOWED_DIR.includes(L.direction) ? L.direction : L.locale ? (RTL_LANGS.includes(base) ? 'rtl' : 'ltr') : null;
      try { this.nf = new Intl.NumberFormat(L.numerals === 'native' ? loc : L.numerals === 'arab' ? 'ar-EG' : 'en-US', { useGrouping: false }); } catch (e) { this.nf = { format: String }; }
      try { this.collator = new Intl.Collator(loc, { sensitivity: 'base' }); this.collatorNat = new Intl.Collator(loc, { sensitivity: 'base', numeric: true }); } catch (e) { this.collator = new Intl.Collator(); this.collatorNat = new Intl.Collator(undefined, { numeric: true }); }
    }
    tr(key, vars) { const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), this.t); const s = v == null ? key : v; return vars ? fill(s, vars) : s; }
    n(v) { return this.nf.format(v); }

    _tableSource() {
      const h = this.host;
      if (h.tagName !== 'TABLE') return;
      this._srcTable = h;
      const heads = [...h.querySelectorAll('thead th')];
      if (!this.o.columns && heads.length) {
        this.o.columns = heads.map((th, i) => ({ data: i, title: th.innerHTML.trim(), type: th.dataset.type, orderable: th.dataset.orderable !== 'false', searchable: th.dataset.searchable !== 'false', visible: th.dataset.visible !== 'false', priority: th.dataset.priority ? Number(th.dataset.priority) : undefined, width: th.dataset.width, className: th.dataset.class, filter: th.dataset.filter, exportable: th.dataset.exportable !== 'false' }));
      }
      if (!this.o.data) {
        const trs = [...h.querySelectorAll('tbody tr')];
        this.o.data = trs.map((tr) => [...tr.children].map((td) => td.dataset.value ?? (td.querySelector('*') ? td.innerHTML.trim() : td.textContent.trim())));
        this._srcHtmlCols = true;
      }
      const d = h.dataset;
      const num = (k, f) => { if (d[k] !== undefined) this.o[f] = Number(d[k]); };
      const bool = (k, f) => { if (d[k] !== undefined) this.o[f] = d[k] !== 'false'; };
      num('pageLength', 'pageLength'); bool('searching', 'searching'); bool('ordering', 'ordering'); bool('pagination', 'pagination'); bool('responsive', 'responsive'); bool('striped', 'striped'); bool('bordered', 'bordered'); bool('colvis', 'colVisibility');
      if (d.select) this.o.select = d.select; if (d.variant) this.o.variant = d.variant; if (d.density) this.o.density = d.density; if (d.buttons) this.o.buttons = d.buttons.split(',').map((x) => x.trim()).filter(Boolean);
      if (d.locale) this.o.language = { ...this.o.language, locale: d.locale }, this._lang();
    }

    _columns() {
      let defs = this.o.columns;
      if (!defs) { const first = (this.o.data || [])[0]; defs = isObj(first) ? Object.keys(first).map((k) => ({ data: k, title: k })) : Array.isArray(first) ? first.map((_, i) => ({ data: i, title: String(i + 1) })) : [{ data: null, title: '' }]; }
      this.cols = defs.map((d, i) => {
        const c = isObj(d) ? { ...d } : { data: d, title: String(d) };
        c.index = i; c.uid = this.id + '-c' + i;
        if (c.title === undefined) c.title = typeof c.data === 'string' ? c.data : '';
        c.orderable = this.o.ordering && c.orderable !== false; c.searchable = c.searchable !== false; c.visible = c.visible !== false; c.exportable = c.exportable !== false;
        c.priority = c.priority == null ? i + 1 : c.priority;
        if (c.filter === true) c.filter = 'text';
        return c;
      });
      this.colOrder = this.cols.map((c) => c.index);
      this._ensureRows();
    }
    _ensureRows() {
      const data = this.o.data || [];
      this._rows = []; data.forEach((d) => this._addRow(d));
    }
    _rowId(d) { const r = this.o.rowId; let v; if (isFn(r)) v = r(d); else if (isObj(d) || Array.isArray(d)) v = getPath(d, r); return hasVal(v) ? String(v) : null; }
    _addRow(d, at) {
      let id = this._rowId(d); const ids = this._idx || (this._idx = new Set());
      if (id == null || ids.has(id)) id = 'r' + this.id + '_' + ++this._seq;
      const row = { id, data: d, h: null, k: null }; ids.add(id);
      if (at === undefined) this._rows.push(row); else this._rows.splice(at, 0, row);
      this._typeCache = false;
      return row;
    }
    _ci(i) { if (typeof i === 'number') return i >= 0 && i < this.cols.length ? i : -1; const k = this.cols.findIndex((c) => c.data === i || c.title === i); return k; }

    /* ----- values ----- */
    raw(row, col) { return col.data == null ? row.data : getPath(row.data, col.data); }
    text(row, col, type = 'filter') {
      const v = this.raw(row, col); let out;
      if (isFn(col.render)) { out = col.render(v, type, row.data, { row: this._rows.indexOf(row), col: col.index, dt: this }); if (out === undefined) out = col.render(v, 'display', row.data, { col: col.index, dt: this }); if (out instanceof Node) out = out.textContent; out = stripTags(out ?? ''); }
      else if (typeof v === 'boolean') out = v ? this.t.yesNo[0] : this.t.yesNo[1];
      else if (v == null) out = '';
      else if (v instanceof Date) out = v.toISOString().slice(0, 10);
      else out = isObj(v) || Array.isArray(v) ? JSON.stringify(v) : String(v);
      return out;
    }
    colType(col) {
      if (col.type && col.type !== 'auto') return col.type;
      if (col._auto && this._typeCache) return col._auto;
      let n = 0; let nums = 0; let dates = 0; let bools = 0;
      for (const r of this._rows) { if (n >= 60) break; const v = this.raw(r, col); if (v == null || v === '') continue; n++; if (typeof v === 'boolean') bools++; else if (typeof v === 'number' || (/^\s*[-+$€£]?\s*[\d,]*\.?\d+\s*%?\s*$/.test(String(v)))) nums++; else if (v instanceof Date || (DATE_RE.test(String(v)) && dateKey(v) != null)) dates++; }
      col._auto = !n ? 'string' : bools === n ? 'boolean' : nums === n ? 'num' : dates === n ? 'date' : 'string';
      this._typeCache = true; return col._auto;
    }
    sortKey(row, col, type) {
      const v = col.sortValue ? col.sortValue(this.raw(row, col), row.data, this) : this.raw(row, col);
      if (v == null || v === '') return null;
      if (type === 'num') return numKey(v); if (type === 'date') return dateKey(v); if (type === 'boolean') return isTrue(v) ? 1 : 0;
      return String(isFn(col.render) && col.sortFromRender ? this.text(row, col, 'sort') : v);
    }
    haystack(row) {
      if (row.h) return row.h;
      const parts = this.cols.filter((c) => c.searchable).map((c) => (this.o.searchNormalize ? norm(this.text(row, c)) : this.text(row, c).toLowerCase()));
      return (row.h = { all: parts.join(' \u0001 '), cols: Object.fromEntries(this.cols.filter((c) => c.searchable).map((c, i) => [c.index, parts[i]])) });
    }
    q(s) { return this.o.searchNormalize ? norm(s) : String(s).toLowerCase(); }

    /* ----- filtering ----- */
    _activeFilters() { return Object.entries(this.s.filters).filter(([i, v]) => this._filterActive(v)); }
    _filterActive(v) { if (v == null) return false; if (Array.isArray(v)) return v.length > 0; if (isObj(v)) return hasVal(v.min) || hasVal(v.max) || hasVal(v.from) || hasVal(v.to); return v !== ''; }
    _matchFilter(row, col, f) {
      const type = col.filter === true ? 'text' : col.filter; const raw = this.raw(row, col);
      if (isFn(col.filterFn)) return !!col.filterFn(raw, row.data, f, this);
      if (type === 'number') { const n = numKey(raw); if (n == null) return false; return (!hasVal(f.min) || n >= Number(f.min)) && (!hasVal(f.max) || n <= Number(f.max)); }
      if (type === 'date') { const t = dateKey(raw); if (t == null) return false; const a = hasVal(f.from) ? dateKey(f.from) : null; let b = hasVal(f.to) ? dateKey(f.to) : null; if (b != null && String(f.to).length <= 10) b += 86399999; return (a == null || t >= a) && (b == null || t <= b); }
      if (type === 'boolean') return isTrue(raw) === (f === 'true' || f === true);
      if (type === 'select') return String(raw ?? '') === String(f) || this.text(row, col) === String(f);
      if (type === 'multiselect') { const t = this.text(row, col); const r = String(raw ?? ''); return f.some((x) => String(x) === r || String(x) === t); }
      return this.q(this.text(row, col)).includes(this.q(f));
    }
    _matchCond(row, c) {
      const col = this.cols[c.col]; if (!col) return true; const raw = this.raw(row, col); const txt = this.q(this.text(row, col)); const val = this.q(c.value ?? ''); const type = this.colType(col);
      if ((c.op === 'equals' || c.op === 'notEquals') && (type === 'boolean' || this._colOptions(col))) { const hit = type === 'boolean' ? isTrue(raw) === (c.value === 'true' || c.value === true) : String(raw ?? '') === String(c.value) || this.text(row, col) === String(c.value); return c.op === 'equals' ? hit : !hit; }
      const key = (v) => (type === 'date' ? dateKey(v) : numKey(v)); const isNum = type === 'num' || type === 'date';
      switch (c.op) {
        case 'contains': return txt.includes(val); case 'notContains': return !txt.includes(val);
        case 'equals': return isNum && key(c.value) != null ? key(raw) === key(c.value) : txt === val; case 'notEquals': return isNum && key(c.value) != null ? key(raw) !== key(c.value) : txt !== val;
        case 'startsWith': return txt.startsWith(val); case 'endsWith': return txt.endsWith(val);
        case 'gt': return key(raw) != null && key(c.value) != null && key(raw) > key(c.value); case 'gte': return key(raw) != null && key(c.value) != null && key(raw) >= key(c.value);
        case 'lt': return key(raw) != null && key(c.value) != null && key(raw) < key(c.value); case 'lte': return key(raw) != null && key(c.value) != null && key(raw) <= key(c.value);
        case 'between': { const k = key(raw); return k != null && key(c.value) != null && key(c.value2) != null && k >= key(c.value) && k <= key(c.value2); }
        case 'empty': return !hasVal(raw); case 'notEmpty': return hasVal(raw);
        default: return true;
      }
    }
    _filtered() {
      const s = this.s; const words = s.search.trim() ? this.q(s.search).split(/\s+/).filter(Boolean) : [];
      const cs = Object.entries(s.colSearch).filter(([, v]) => hasVal(v)).map(([i, v]) => [Number(i), this.q(v)]);
      const fl = this._activeFilters().map(([i, v]) => [this.cols[i], v]).filter(([c]) => c);
      const bc = s.builder.conds.filter((c) => c.col >= 0 && c.op && (['empty', 'notEmpty'].includes(c.op) || hasVal(c.value)));
      return this._rows.filter((row) => {
        if (words.length) { const h = this.haystack(row).all; for (const w of words) if (!h.includes(w)) return false; }
        for (const [i, v] of cs) { const h = this.haystack(row).cols[i]; if (h == null || !h.includes(v)) return false; }
        if (fl.length) { const ok = s.fLogic === 'or' ? fl.some(([c, v]) => this._matchFilter(row, c, v)) : fl.every(([c, v]) => this._matchFilter(row, c, v)); if (!ok) return false; }
        if (bc.length) { const ok = s.builder.logic === 'or' ? bc.some((c) => this._matchCond(row, c)) : bc.every((c) => this._matchCond(row, c)); if (!ok) return false; }
        for (const fn of this._filterFns) if (!fn(row.data, row, this)) return false;
        return true;
      });
    }
    _sorted(rows) {
      const ord = this.s.order.filter(([i]) => this.cols[i]); if (!ord.length) return rows;
      const plan = ord.map(([i, d]) => { const col = this.cols[i]; return { col, dir: d === 'desc' ? -1 : 1, type: this.colType(col) }; });
      const dec = rows.map((row, n) => ({ row, n, k: plan.map((p) => (isFn(p.col.sortFn) ? null : this.sortKey(row, p.col, p.type))) }));
      dec.sort((a, b) => {
        for (let i = 0; i < plan.length; i++) {
          const p = plan[i]; let r;
          if (isFn(p.col.sortFn)) r = p.col.sortFn(this.raw(a.row, p.col), this.raw(b.row, p.col), a.row.data, b.row.data) * p.dir;
          else {
            const x = a.k[i]; const y = b.k[i];
            if (x == null || y == null) { if (x == null && y == null) continue; const nf = p.col.nulls === 'first' ? -1 : 1; r = x == null ? nf : -nf; }
            else if (typeof x === 'string') r = (p.type === 'natural' ? this.collatorNat : this.collator).compare(x, y) * p.dir;
            else r = (x - y) * p.dir;
          }
          if (r) return r;
        }
        return a.n - b.n;
      });
      return dec.map((d) => d.row);
    }
    _process() {
      const s = this.s;
      if (this.o.serverSide) { this._view = this._rows; return; }
      this._filteredRows = this._sorted(this._filtered());
      s.total = this._rows.length; s.filtered = this._filteredRows.length;
      const all = s.len === -1 || !this.o.pagination || this.o.virtualScroll;
      const pages = all ? 1 : Math.max(1, Math.ceil(s.filtered / s.len));
      s.page = clamp(s.page, 0, pages - 1);
      s.start = all ? 0 : s.page * s.len; s.end = all ? s.filtered : Math.min(s.filtered, s.start + s.len);
      this._view = this._filteredRows.slice(s.start, s.end);
    }

    /* ----- events ----- */
    _events() { const E = this.o.events; if (E) for (const k in E) this.on(k, E[k]); }
    on(names, fn) { String(names).split(/\s+/).filter(Boolean).forEach((n) => { const [name, ns] = n.split('.'); (this._ev[name] = this._ev[name] || []).push({ fn, ns }); }); return this; }
    one(name, fn) { const w = (d, dt) => { this.off(name, w); return fn(d, dt); }; return this.on(name, w); }
    off(names, fn) {
      String(names || '').split(/\s+/).filter(Boolean).forEach((n) => {
        const [name, ns] = n.split('.');
        const list = name ? [name] : Object.keys(this._ev);
        list.forEach((k) => { this._ev[k] = (this._ev[k] || []).filter((h) => !((!fn || h.fn === fn) && (!ns || h.ns === ns))); });
      });
      return this;
    }
    emit(name, detail = {}) {
      detail.dt = this; let stop = false;
      for (const h of [...(this._ev[name] || [])]) { try { if (h.fn.call(this, detail, this) === false) stop = true; } catch (e) { console.error('BasetDataTable event "' + name + '":', e); } }
      if (this.wrap) this.wrap.dispatchEvent(new CustomEvent('bui:dtbl-' + name, { detail, bubbles: true }));
      return !stop;
    }
    _dirty(resetPage) { if (resetPage) this.s.page = 0; if (this._queued) return; this._queued = true; Promise.resolve().then(() => { if (this._queued) this.draw(); }); }

    /* ----- public API ----- */
    search(v, opt) {
      if (v === undefined) return this.s.search;
      this.s.search = String(v ?? ''); this.s.page = 0; this._syncSearchUi(); this._dirty(); this.emit('search', { value: this.s.search }); return this;
    }
    order(v) {
      if (v === undefined) return clone(this.s.order);
      if (v === null || (Array.isArray(v) && !v.length)) this.s.order = [];
      else { const list = typeof v[0] === 'number' || typeof v[0] === 'string' ? [v] : v; this.s.order = list.map(([i, d]) => [this._ci(i), String(d).toLowerCase() === 'desc' ? 'desc' : 'asc']).filter(([i]) => i >= 0 && this.cols[i].orderable); }
      this._dirty(); this.emit('order', { order: clone(this.s.order) }); return this;
    }
    _page(n) {
      if (n === undefined) return this.s.page;
      const pages = this._pages();
      const v = n === 'first' ? 0 : n === 'last' ? pages - 1 : n === 'next' ? this.s.page + 1 : n === 'previous' || n === 'prev' ? this.s.page - 1 : Number(n);
      const to = clamp(isFinite(v) ? v : 0, 0, Math.max(pages - 1, 0));
      if (to === this.s.page && n !== 'refresh') return this;
      this.s.page = to; this._dirty(); this.emit('page', this._pageInfo(to)); return this;
    }
    _pages() { const s = this.s; return s.len === -1 || !this.o.pagination ? 1 : Math.max(1, Math.ceil(s.filtered / s.len)); }
    _pageInfo(p = this.s.page) { const s = this.s; return { page: p, pages: this._pages(), length: s.len, start: s.start, end: s.end, recordsTotal: s.total, recordsDisplay: s.filtered, serverSide: !!this.o.serverSide }; }
    pageLength(n) {
      if (n === undefined) return this.s.len;
      this.s.len = n === 'all' || Number(n) === -1 ? -1 : Math.max(1, Number(n) || 10); this.s.page = 0; this._dirty(); this.emit('length', { length: this.s.len }); return this;
    }
    column(i) { const k = this._ci(i); return k < 0 ? null : new ColumnApi(this, k); }
    columns() { return this.cols.map((c) => new ColumnApi(this, c.index)); }
    rows(sel) { return new RowsApi(this, sel); }
    row(id) { return new RowsApi(this, { id }, true); }
    clear() { this._rows = []; this._idx = new Set(); this._sel.clear(); this._typeCache = false; this._dirty(true); return this; }
    draw(resetPaging) {
      this._queued = false; if (resetPaging) this.s.page = 0;
      if (this.o.serverSide) { this._load(); return this; }
      this._process(); this._render(); return this;
    }
    invalidate() { this._rows.forEach((r) => { r.h = null; }); this._typeCache = false; return this; }
    addFilter(fn) { this._filterFns.push(fn); this._dirty(true); return () => { this._filterFns = this._filterFns.filter((f) => f !== fn); this._dirty(true); }; }
    columnSearch(i, v) { const k = this._ci(i); if (k < 0) return this; if (v === undefined) return this.s.colSearch[k] || ''; this.s.colSearch[k] = String(v); this._dirty(true); return this; }
    filter(i, v) { const k = this._ci(i); if (k < 0) return this; if (v === undefined) return this.s.filters[k]; if (v == null || v === '') delete this.s.filters[k]; else this.s.filters[k] = v; this._syncFilterUi(); this._dirty(true); this.emit('filter', { column: k, value: v }); return this; }
    filterLogic(v) { if (v === undefined) return this.s.fLogic; this.s.fLogic = v === 'or' ? 'or' : 'and'; this._syncFilterUi(); this._dirty(true); return this; }
    builder(conds, logic) { if (conds === undefined) return clone(this.s.builder); this.s.builder = { logic: logic === 'or' ? 'or' : 'and', conds: (conds || []).map((c) => ({ col: this._ci(c.col), op: c.op, value: c.value, value2: c.value2 })) }; this._syncFilterUi(); this._dirty(true); this.emit('filter', { builder: true }); return this; }
    clearFilters() { this.s.filters = {}; this.s.colSearch = {}; this.s.builder = { logic: 'and', conds: [] }; this.s.search = ''; this._syncFilterUi(); this._syncSearchUi(); this._dirty(true); this.emit('filter', { cleared: true }); return this; }
    data() { return this._rows.map((r) => r.data); }
    state() { return this._stateObj(); }
    reset() { const d = this._defaults; this.s.order = clone(d.order); this.s.len = d.len; this.s.search = ''; this.s.colSearch = {}; this.s.filters = {}; this.s.builder = { logic: 'and', conds: [] }; this.s.page = 0; this.colOrder = d.ord.slice(); this.cols.forEach((c, i) => { c.visible = d.vis[i]; c.width = d.widths[i]; }); this._clearState(); this._buildHead(); this._syncFilterUi(); this._syncSearchUi(); this._dirty(); return this; }
    destroy(keepDom) {
      clearTimeout(this._timers.s); this._ro && this._ro.disconnect(); this._unbind && this._unbind(); this._req && this._req.abort();
      this.emit('destroy', {}); this.wrap && (keepDom ? this.wrap.replaceWith(this.host) : this.wrap.remove());
      if (this._srcTable && !keepDom) this._srcTable.hidden = false;
      delete this.host.__bdt; instances.delete(this.host); this._ev = {}; return this;
    }
  }

  class ColumnApi {
    constructor(dt, i) { this.dt = dt; this.i = i; this.c = dt.cols[i]; }
    index() { return this.i; } title(v) { if (v === undefined) return this.c.title; this.c.title = v; this.dt._buildHead(); return this; }
    visible(v) { if (v === undefined) return this.c.visible; this.dt._setVisible(this.i, !!v); return this; }
    show() { return this.visible(true); } hide() { return this.visible(false); }
    data() { return this.dt._rows.map((r) => this.dt.raw(r, this.c)); }
    order(d) { this.dt.order([[this.i, d || 'asc']]); return this; }
    search(v) { return v === undefined ? this.dt.columnSearch(this.i) : (this.dt.columnSearch(this.i, v), this); }
    filter(v) { return v === undefined ? this.dt.filter(this.i) : (this.dt.filter(this.i, v), this); }
    width(w) { if (w === undefined) return this.c.width; this.c.width = w; this.dt._applyWidths(); return this; }
    header() { return this.dt.thead && this.dt.thead.querySelector(`th[data-col="${this.i}"]`); }
  }

  class RowsApi {
    constructor(dt, sel, one) { this.dt = dt; this.sel = sel || {}; this.one = !!one; }
    _list() {
      const dt = this.dt; const s = this.sel; let list = dt._rows;
      if (s.id !== undefined) { const ids = toArr(s.id).map(String); list = list.filter((r) => ids.includes(r.id)); if (!list.length && typeof s.id === 'number') list = dt._rows[s.id] ? [dt._rows[s.id]] : []; }
      if (s.filtered) list = dt.o.serverSide ? dt._rows : dt._filteredRows || list;
      if (s.page === 'current') list = dt._view || [];
      if (s.selected === true) list = list.filter((r) => dt._sel.has(r.id)); else if (s.selected === false) list = list.filter((r) => !dt._sel.has(r.id));
      if (s.selected === true && !list.length && dt.o.serverSide) list = [...dt._sel.values()];
      return list;
    }
    data() { const l = this._list(); return this.one ? l[0] && l[0].data : l.map((r) => r.data); }
    ids() { return this._list().map((r) => r.id); } count() { return this._list().length; }
    nodes() { return this._list().map((r) => this.dt._node(r)).filter(Boolean); }
    each(fn) { this._list().forEach((r, i) => fn(r.data, i, r.id)); return this; }
    toArray() { return this.data(); }
    add(d) { const list = toArr(d).map((x) => this.dt._addRow(x)); this.dt._dirty(); this.sel = { id: list.map((r) => r.id) }; this.one = false; return this; }
    update(d) { this._list().forEach((r) => { r.data = isObj(r.data) && isObj(d) ? Object.assign(r.data, d) : d; r.h = null; }); this.dt._typeCache = false; this.dt._dirty(); return this; }
    remove() {
      const ids = new Set(this.ids()); if (!ids.size) return this;
      this.dt._rows = this.dt._rows.filter((r) => !ids.has(r.id)); ids.forEach((id) => { this.dt._sel.delete(id); this.dt._idx.delete(id); }); this.dt._typeCache = false; this.dt._dirty(); this.dt._selChanged(); return this;
    }
    select() { this.dt._select(this._list(), true); return this; }
    deselect() { this.dt._select(this._list(), false); return this; }
    edit() { const r = this._list()[0]; if (r) this.dt.edit(r.id); return this; }
  }

  /* =====================================================================================================
     Rendering: structure, header, body, footer, pager, popovers, dialogs, selection, state, responsive
     ===================================================================================================== */
  const P = DataTable.prototype;
  const SORT_ICON = '<svg viewBox="0 0 10 14" width="9" height="13" aria-hidden="true"><path class="u" d="M5 1 1.5 5.5h7z"/><path class="d" d="M5 13 1.5 8.5h7z"/></svg>';
  const ICON = {
    search: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="m13.5 13.5 4 4"/></svg>',
    x: '<svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>',
    chev: '<svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 4 6 6-6 6"/></svg>',
    dots: '<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="10" cy="4" r="1.7"/><circle cx="10" cy="10" r="1.7"/><circle cx="10" cy="16" r="1.7"/></svg>',
    plus: '<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>',
  };

  const svgI = (p) => '<svg class="bui-dtbl-ico" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  const ICONS = {
    eye: svgI('<path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10z"/><circle cx="10" cy="10" r="2.5"/>'),
    edit: svgI('<path d="M12.5 4.5l3 3M4 16l.7-3.3 8.8-8.8a1.4 1.4 0 012 0l.6.6a1.4 1.4 0 010 2l-8.8 8.8L4 16z"/>'),
    trash: svgI('<path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6M8.5 9v4M11.5 9v4"/>'),
    copy: svgI('<rect x="7" y="7" width="9" height="9" rx="1.5"/><path d="M13 7V5.5A1.5 1.5 0 0011.5 4h-6A1.5 1.5 0 004 5.5v6A1.5 1.5 0 005.5 13H7"/>'),
    download: svgI('<path d="M10 3v9M6.5 8.5L10 12l3.5-3.5M4 15.5h12"/>'),
    file: svgI('<path d="M5 2.5h6l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1v-13a1 1 0 011-1zM11 2.5v4h4"/>'),
    pdf: svgI('<path d="M5 2.5h6l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1v-13a1 1 0 011-1zM11 2.5v4h4M7 11h6M7 14h4"/>'),
    sheet: svgI('<rect x="3.5" y="4" width="13" height="12" rx="1.5"/><path d="M3.5 8h13M3.5 12h13M8 8v8"/>'),
    json: svgI('<path d="M7.5 3.5c-1.5 0-2 .8-2 2V7c0 1-.6 2-1.5 3 .9 1 1.5 2 1.5 3v1.5c0 1.2.5 2 2 2M12.5 3.5c1.5 0 2 .8 2 2V7c0 1 .6 2 1.5 3-.9 1-1.5 2-1.5 3v1.5c0 1.2-.5 2-2 2"/>'),
    print: svgI('<path d="M6 7V3.5h8V7M6 13H4.5A1.5 1.5 0 013 11.5v-3A1.5 1.5 0 014.5 7h11A1.5 1.5 0 0117 8.5v3a1.5 1.5 0 01-1.5 1.5H14"/><rect x="6" y="11" width="8" height="6" rx="1"/>'),
    columns: svgI('<rect x="3" y="4" width="14" height="12" rx="1.5"/><path d="M8 4v12M12.5 4v12"/>'),
    fullscreen: svgI('<path d="M3.5 7.5v-4h4M16.5 7.5v-4h-4M3.5 12.5v4h4M16.5 12.5v4h-4"/>'),
    fullscreenExit: svgI('<path d="M7.5 3.5v4h-4M12.5 3.5v4h4M7.5 16.5v-4h-4M12.5 16.5v-4h4"/>'),
    refresh: svgI('<path d="M16 10a6 6 0 11-1.8-4.3M16 3.5V7h-3.5"/>'),
    reset: svgI('<path d="M4 10a6 6 0 101.8-4.3M4 3.5V7h3.5"/>'),
    plus: svgI('<path d="M10 4v12M4 10h12"/>'),
    check: svgI('<path d="m4.5 10.5 3.5 3.5 7.5-8"/>'),
    dots: svgI('<circle cx="10" cy="4.5" r="1.4" fill="currentColor"/><circle cx="10" cy="10" r="1.4" fill="currentColor"/><circle cx="10" cy="15.5" r="1.4" fill="currentColor"/>'),
    rows: svgI('<path d="M3.5 5h13M3.5 10h13M3.5 15h13"/>'),
    cards: svgI('<rect x="3" y="3.5" width="6" height="6" rx="1"/><rect x="11" y="3.5" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/>'),
    filter: svgI('<path d="M3 4.5h14l-5.5 6.5v5l-3-1.5V11z"/>'),
    user: svgI('<circle cx="10" cy="7" r="3.2"/><path d="M3.8 16.5c.6-3 3-4.5 6.2-4.5s5.6 1.5 6.2 4.5"/>'),
  };
  const BTN_ICON = { copy: 'copy', csv: 'file', excel: 'sheet', pdf: 'pdf', print: 'print', json: 'json', colvis: 'columns', selectColumns: 'columns', restoreColumns: 'reset', fullscreen: 'fullscreen', refresh: 'refresh', reset: 'reset', create: 'plus', pageLength: 'rows', cardView: 'cards', deleteSelected: 'trash', selectAll: 'check', selectNone: 'check' };
  const iconHtml = (n) => (ICONS[n] ? ICONS[n] : /^\s*</.test(String(n)) ? String(n) : '<i class="' + String(n).replace(/"/g, '') + '" aria-hidden="true"></i>');
  const icoSpan = (n) => { const sp = el('span', 'bui-dtbl-bico'); sp.dataset.ico = n; sp.innerHTML = iconHtml(n); return sp; };
  const mkBtn = (text, cls, attrs) => { const b = el('button', 'bui-btn ' + (cls || 'bui-btn-outline') + ' bui-btn-sm', { type: 'button', ...attrs }); b.textContent = text; return b; };

  Object.assign(P, {
    _sel_() {
      const s = this.o.select; let c = { style: 'none', checkbox: false, click: true };
      if (s === true || s === 'multi') c.style = 'multi'; else if (s === 'single') c.style = 'single'; else if (s === 'cell') c.style = 'cell';
      else if (s === 'checkbox') c = { style: 'multi', checkbox: true, click: false };
      else if (isObj(s)) c = { style: s.style === 'checkbox' ? 'multi' : s.style || 'multi', checkbox: s.style === 'checkbox' || !!s.checkbox, click: s.click !== undefined ? !!s.click : !(s.style === 'checkbox' || s.checkbox), ...(s.style === 'checkbox' ? {} : {}) };
      return c;
    },
    _build() {
      const o = this.o; this.sc = this._sel_(); this._sc0 = { ...this.sc };
      const w = (this.wrap = el('div', 'bui-dtbl' + (o.className ? ' ' + o.className : '')));
      w.id = this.host.id ? this.host.id + '-dtbl' : this.id;
      if (this.dir) w.setAttribute('dir', this.dir);
      this._classes();
      this.top = el('div', 'bui-dtbl-top'); this.panels = el('div', 'bui-dtbl-panels'); this.bulk = el('div', 'bui-dtbl-bulk', { hidden: true, role: 'status' });
      this.scroller = el('div', 'bui-dtbl-scroll', { tabindex: '-1' });
      this.table = el('table', 'bui-dtbl-table', { 'aria-label': o.ariaLabel || (this.host.getAttribute && this.host.getAttribute('aria-label')) || null, 'aria-rowcount': -1 });
      if (o.caption) this.table.appendChild(el('caption', 'bui-dtbl-caption', {}, o.caption));
      this.thead = el('thead'); this.tbody = el('tbody'); this.table.append(this.thead, this.tbody);
      this.overlay = el('div', 'bui-dtbl-overlay', { hidden: true, 'aria-live': 'polite' }); this.errBox = el('div', 'bui-dtbl-error', { hidden: true, role: 'alert' });
      this.scroller.append(this.table); this.stage = el('div', 'bui-dtbl-stage'); this.stage.append(this.scroller, this.overlay, this.errBox);
      this.bottom = el('div', 'bui-dtbl-bottom'); this.infoEl = el('div', 'bui-dtbl-info', { role: 'status', 'aria-live': 'polite' }); this.pagerEl = el('nav', 'bui-dtbl-pager', { 'aria-label': this.t.pageLabel });
      this.bottom.append(this.infoEl, this.pagerEl);
      this.head = el('div', 'bui-dtbl-head'); this.head.append(this.top, this.bulk); w.append(this.head, this.panels, this.stage, this.bottom);
      if (this._srcTable) { this._srcTable.hidden = true; this._srcTable.after(w); } else this.host.appendChild(w);
      this._buildToolbar(); this._buildHead(); this._bindBody();
      if (o.fixedHeader || o.scrollY || o.virtualScroll) { this.scroller.style.maxHeight = o.scrollY || (o.virtualScroll ? '420px' : '70vh'); }
      if (o.virtualScroll) this.scroller.addEventListener('scroll', () => { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = 0; this._renderBody(true); }); }, { passive: true });
      if (typeof ResizeObserver !== 'undefined') { let lw = 0; this._ro = new ResizeObserver(() => { const nw = Math.round(w.clientWidth); if (nw === lw) return; lw = nw; clearTimeout(this._timers.r); this._timers.r = setTimeout(() => this._responsive(), 60); }); this._ro.observe(w); }
      this._onDoc = () => { }; this._themeApply();
    },
    _classes() {
      const o = this.o; const w = this.wrap; const c = (n, on) => w.classList.toggle(n, !!on);
      c('bui-dtbl-striped', o.striped || o.variant === 'striped'); c('bui-dtbl-bordered', o.bordered || o.variant === 'bordered'); c('bui-dtbl-hover', o.hover);
      c('bui-dtbl-minimal', o.variant === 'minimal'); c('bui-dtbl-modern', o.variant === 'modern'); c('bui-dtbl-compact', o.density === 'compact');;
      c('bui-dtbl-dark', o.theme === 'dark'); c('bui-dtbl-light', o.theme === 'light'); c('bui-dtbl-virtual', o.virtualScroll); c('bui-dtbl-sticky', o.fixedHeader || o.scrollY || o.virtualScroll);
    },
    _themeApply() { if (this.o.theme === 'auto' && window.matchMedia && !doc.documentElement.classList.contains('bui-dark') && this.o.themeFollowSystem) this.wrap.classList.toggle('bui-dtbl-dark', matchMedia('(prefers-color-scheme: dark)').matches); },
    theme(v) { if (v === undefined) return this.o.theme; this.o.theme = v; this._classes(); this._themeApply(); return this; },
    variant(v) { this.o.variant = v; this._classes(); return this; },
    density(v) { this.o.density = v; this._classes(); return this; },
    _vis() { return this.colOrder.map((i) => this.cols[i]).filter((c) => c.visible); },
    _shown() { return this._vis(); },

    /* ----- toolbar ----- */
    _buildToolbar() {
      const o = this.o; const top = this.top; top.textContent = '';
      const left = el('div', 'bui-dtbl-tools'); const right = el('div', 'bui-dtbl-tools bui-dtbl-tools-end');
      if (o.pagination && o.showLength && o.lengthInput && !o.virtualScroll) {
        const lb = el('button', 'bui-btn bui-btn-outline bui-btn-sm bui-dtbl-lenbtn', { type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-label': this.t.lengthLabel, title: this.t.lengthLabel });
        lb.addEventListener('click', () => { if (this._pop && this._pop.anchor === lb) return this._closePop(); this._lenMenu(lb); if (this._pop) this._pop.anchor = lb; });
        this._lenBtn = lb; this._syncLen(); left.appendChild(lb);
      } else if (o.pagination && o.showLength && !o.virtualScroll && !o.serverSideNoLength) {
        const sel = el('select', 'bui-input bui-dtbl-length', { 'aria-label': this.t.lengthLabel });
        const menu = (o.lengthMenu || [10, 25, 50, 100]).map((v) => (Array.isArray(v) ? v : [v, v === -1 ? this.t.all : this.n(v)]));
        menu.forEach(([v, label]) => { const op = el('option', '', { value: v }, label === -1 || v === -1 ? this.t.all : String(label)); if (v === this.s.len) op.selected = true; sel.appendChild(op); });
        if (![...sel.options].some((x) => Number(x.value) === this.s.len)) { const op = el('option', '', { value: this.s.len, selected: true }, this.n(this.s.len)); sel.insertBefore(op, sel.firstChild); }
        sel.addEventListener('change', () => { this.pageLength(Number(sel.value)); this.draw(); });
        const parts = this.t.length.split('{menu}'); const lab = el('label', 'bui-dtbl-lenwrap'); lab.append(doc.createTextNode(parts[0]), sel, doc.createTextNode(parts[1] || '')); this._lenSel = sel; left.appendChild(lab);
      }
      this.btnBar = el('div', 'bui-dtbl-buttons', { role: 'toolbar', 'aria-label': this.t.export }); this._buildButtons(); if (this.btnBar.childNodes.length) left.appendChild(this.btnBar);
      this._filterToggles = el('div', 'bui-dtbl-buttons');
      if (o.filters) { const b = mkBtn(this.t.filters, 'bui-btn-outline bui-dtbl-filter-btn', { 'aria-expanded': 'false', 'data-panel': 'filters' }); if (o.buttonIcons) b.prepend(icoSpan('filter')); this._filterToggles.appendChild(b); }
      if (o.searchBuilder) { const b = mkBtn(this.t.searchBuilder, 'bui-btn-outline bui-dtbl-filter-btn', { 'aria-expanded': 'false', 'data-panel': 'builder' }); if (o.buttonIcons) b.prepend(icoSpan('filter')); this._filterToggles.appendChild(b); }
      if (this._filterToggles.childNodes.length) { this._filterToggles.addEventListener('click', (e) => { const b = e.target.closest('[data-panel]'); if (b) this._togglePanel(b.dataset.panel, b); }); left.appendChild(this._filterToggles); }
      if (o.searching) {
        const box = el('div', 'bui-dtbl-search'); const inp = el('input', 'bui-input', { type: 'search', 'aria-label': this.t.searchLabel, placeholder: o.searchPlaceholder || this.t.search, autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'search' });
        inp.value = this.s.search; const ic = el('span', 'bui-dtbl-search-ic'); ic.innerHTML = ICON.search; const clr = el('button', 'bui-dtbl-search-x', { type: 'button', 'aria-label': this.t.clear, hidden: !this.s.search }); clr.innerHTML = ICON.x;
        const delay = o.searchDelay != null ? o.searchDelay : o.serverSide ? 400 : 0;
        const go = (v) => { this.s.search = v; this.s.page = 0; clr.hidden = !v; this.emit('search', { value: v }); this.draw(); };
        const deb = delay ? debounce(go, delay) : go;
        inp.addEventListener('input', () => { clr.hidden = !inp.value; deb(inp.value); });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Escape' && inp.value) { inp.value = ''; deb.cancel && deb.cancel(); go(''); } });
        clr.addEventListener('click', () => { inp.value = ''; deb.cancel && deb.cancel(); go(''); inp.focus(); });
        box.append(ic, inp, clr); right.appendChild(box); this._searchInp = inp; this._searchClr = clr;
      }
      if (left.childNodes.length) top.appendChild(left); if (right.childNodes.length) top.appendChild(right); top.hidden = !top.childNodes.length;
    },
    _syncSearchUi() { if (this._searchInp) { this._searchInp.value = this.s.search; this._searchClr.hidden = !this.s.search; } this._syncLen(); },
    _syncLen() {
      if (this._lenSel) this._lenSel.value = this.s.len;
      if (this._lenBtn) { const b = this._lenBtn; const parts = this.t.length.split('{menu}'); b.textContent = ''; b.append(doc.createTextNode(parts[0]), el('strong', 'bui-dtbl-lenval', {}, this.s.len === -1 ? this.t.all : this.n(this.s.len)), el('span', 'bui-dtbl-caret', { 'aria-hidden': 'true' }), doc.createTextNode(parts[1] || '')); }
    },

    /* ----- header ----- */
    _buildHead() {
      const t = this.thead; t.textContent = ''; const o = this.o;
      const tr = el('tr'); this._thMap = {};
      const addSys = (kind) => {
        const th = el('th', 'bui-dtbl-th bui-dtbl-sys bui-dtbl-' + kind, { scope: 'col', 'data-sys': kind });
        if (kind === 'select' && this.sc.style === 'multi') { const cb = el('input', 'bui-dtbl-cb', { type: 'checkbox', 'aria-label': this.t.selectAllRows }); th.appendChild(cb); this._hcb = cb; }
        else if (kind === 'select') th.setAttribute('aria-label', this.t.selectRow);
        else if (kind === 'actions') th.appendChild(el('span', 'bui-dtbl-sr', {}, this.t.actions));
        else if (kind === 'child') th.appendChild(el('span', 'bui-dtbl-sr', {}, this.t.toggleRow));
        if (this._fixedLayout && this._sysWidths && this._sysWidths[kind]) th.style.width = this._sysWidths[kind] + 'px';
        tr.appendChild(th);
      };
      if (this.o.responsive && this.o.childRow) addSys('child');
      if (this.sc.checkbox) addSys('select');
      this._shown().forEach((c) => {
        const th = el('th', 'bui-dtbl-th' + (c.orderable ? ' is-sortable' : '') + (c.className ? ' ' + c.className : ''), { scope: 'col', 'data-col': c.index, 'aria-sort': 'none' });
        const inner = el('div', 'bui-dtbl-th-in'); const lab = el('span', 'bui-dtbl-th-label'); lab.innerHTML = c.title; inner.appendChild(lab);
        if (c.orderable) { const b = el('span', 'bui-dtbl-sort'); b.innerHTML = SORT_ICON; b.appendChild(el('sup', 'bui-dtbl-prio')); inner.appendChild(b); th.tabIndex = 0; th.setAttribute('aria-label', (lab.textContent || '') + ', ' + this.t.sortAsc); }
        th.appendChild(inner);
        if (o.colResize && c.resizable !== false) { const h = el('span', 'bui-dtbl-rs', { role: 'separator', 'aria-orientation': 'vertical', 'aria-label': this.t.resize }); th.appendChild(h); }
        if (o.colReorder && c.reorderable !== false) { th.draggable = true; th.title = this.t.moveHint; th.classList.add('is-movable'); }
        tr.appendChild(th); this._thMap[c.index] = th;
      });
      if (this._hasActions()) addSys('actions');
      t.appendChild(tr);
      if (o.columnSearch) {
        const tr2 = el('tr', 'bui-dtbl-colsearch'); const sysBefore = tr.children.length - this._shown().length - (this._hasActions() ? 1 : 0);
        for (let i = 0; i < sysBefore; i++) tr2.appendChild(el('th', 'bui-dtbl-sys'));
        this._shown().forEach((c) => {
          const th = el('th', 'bui-dtbl-th'); if (c.searchable) { const inp = el('input', 'bui-input bui-dtbl-colin', { type: 'search', 'aria-label': (stripTags(c.title) || '') + ' — ' + this.t.search, placeholder: this.t.search }); inp.value = this.s.colSearch[c.index] || '';
            const go = debounce((v) => { this.s.colSearch[c.index] = v; this.s.page = 0; this.draw(); this.emit('search', { column: c.index, value: v }); }, this.o.serverSide ? 400 : 120); inp.addEventListener('input', () => go(inp.value)); th.appendChild(inp); }
          tr2.appendChild(th);
        });
        if (this._hasActions()) tr2.appendChild(el('th', 'bui-dtbl-sys')); t.appendChild(tr2);
      }
      this._applyWidths(); this._syncSort();
    },
    _hasActions() { return !!(this.o.rowActions && this.o.rowActions.length); },
    _applyWidths() {
      let all = true; let sum = 0;
      this._shown().forEach((c) => { const th = this._thMap && this._thMap[c.index]; if (!th) return; const w = c.width; th.style.width = w == null ? '' : typeof w === 'number' ? w + 'px' : w; th.style.minWidth = c.minWidth ? c.minWidth + 'px' : ''; th.style.maxWidth = c.maxWidth ? c.maxWidth + 'px' : ''; if (typeof w === 'number') sum += w; else all = false; });
      if (this.o.colResize) this.table.style.width = all && sum ? sum + (this._sysW || 0) + 'px' : '';
    },
    _syncSort() {
      const ord = this.s.order;
      Object.entries(this._thMap || {}).forEach(([i, th]) => {
        const k = ord.findIndex(([c]) => c === Number(i)); const d = k >= 0 ? ord[k][1] : null;
        th.setAttribute('aria-sort', d === 'asc' ? 'ascending' : d === 'desc' ? 'descending' : 'none'); th.classList.toggle('is-asc', d === 'asc'); th.classList.toggle('is-desc', d === 'desc');
        const p = th.querySelector('.bui-dtbl-prio'); if (p) p.textContent = ord.length > 1 && k >= 0 ? this.n(k + 1) : '';
      });
    },
    _setVisible(i, v) {
      const c = this.cols[i]; if (!c || c.visible === v) return; if (!v && this._vis().length <= 1) return;
      c.visible = v; this._buildHead(); this._renderBody(); this._responsive(true); this._saveState(); this.emit('columnVisibility', { column: i, visible: v });
    },
    _moveCol(from, to, after) {
      const o = this.colOrder.slice(); const a = o.indexOf(from); if (a < 0 || from === to) return; o.splice(a, 1); let b = o.indexOf(to); if (after) b++; o.splice(b, 0, from); this.colOrder = o;
      this._buildHead(); this._renderBody(); this._saveState(); this.emit('columnReorder', { order: o.slice() });
    },

    /* ----- body ----- */
    _bindBody() {
      const w = this.wrap;
      const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); (this._offs = this._offs || []).push(() => t.removeEventListener(ev, fn, opt)); };
      this._unbind = () => (this._offs || []).forEach((f) => f());
      // header: sort, drag, resize, keyboard
      on(this.thead, 'click', (e) => {
        if (this._justResized) return;
        const th = e.target.closest('th[data-col]'); if (!th || e.target.closest('.bui-dtbl-rs,input')) return; this._sortClick(Number(th.dataset.col), e.shiftKey);
      });
      on(this.thead, 'keydown', (e) => {
        const th = e.target.closest('th[data-col]'); if (!th || e.target.matches('input')) return; const i = Number(th.dataset.col);
        if (e.altKey && /^Arrow(Left|Right)$/.test(e.key) && this.o.colReorder) { e.preventDefault(); const vis = this._shown().map((c) => c.index); const k = vis.indexOf(i); const d = (e.key === 'ArrowRight' ? 1 : -1) * (this._isRtl() ? -1 : 1); const t = vis[k + d]; if (t != null) { this._moveCol(i, t, d > 0); const nt = this._thMap[i]; nt && nt.focus(); } }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._sortClick(i, e.shiftKey); const nt = this._thMap[i]; nt && nt.focus(); }
      });
      on(this.thead, 'pointerdown', (e) => { const h = e.target.closest('.bui-dtbl-rs'); if (h) this._startResize(e, h); });
      on(this.thead, 'dragstart', (e) => { const th = e.target.closest && e.target.closest('th[data-col]'); if (!th) return; this._drag = Number(th.dataset.col); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(this._drag)); } catch (x) { /* ignore */ } th.classList.add('is-dragging'); });
      on(this.thead, 'dragover', (e) => { if (this._drag == null) return; const th = e.target.closest('th[data-col]'); if (!th) return; e.preventDefault(); const r = th.getBoundingClientRect(); const after = (e.clientX > r.left + r.width / 2) !== this._isRtl(); this.thead.querySelectorAll('.drop-before,.drop-after').forEach((n) => n.classList.remove('drop-before', 'drop-after')); th.classList.add(after ? 'drop-after' : 'drop-before'); this._dropAfter = after; });
      on(this.thead, 'drop', (e) => { if (this._drag == null) return; const th = e.target.closest('th[data-col]'); e.preventDefault(); if (th) this._moveCol(this._drag, Number(th.dataset.col), this._dropAfter); this._drag = null; });
      on(this.thead, 'dragend', () => { this._drag = null; this.thead.querySelectorAll('.is-dragging,.drop-before,.drop-after').forEach((n) => n.classList.remove('is-dragging', 'drop-before', 'drop-after')); });
      on(this.thead, 'change', (e) => { if (e.target === this._hcb) this._select(this._view || [], e.target.checked); });
      // body: select, click, dblclick, child rows, actions
      on(this.tbody, 'click', (e) => this._bodyClick(e));
      on(this.tbody, 'dblclick', (e) => { const tr = e.target.closest('tr[data-id]'); if (!tr || e.target.closest('button,input,select,a,textarea')) return; const row = this._byId(tr.dataset.id); if (!row) return; this.emit('rowDoubleClick', { row: row.data, id: row.id, node: tr, event: e }); if (this._edCfg().enabled && this._edCfg().dblclick) this.edit(row.id); });
      on(this.tbody, 'change', (e) => { if (e.target.classList.contains('bui-dtbl-cb')) { const tr = e.target.closest('tr'); const row = tr && this._byId(tr.dataset.id); if (row) this._select([row], e.target.checked); } });
      on(this.tbody, 'keydown', (e) => { const tr = e.target.closest('tr[data-id]'); if (!tr) return; if (e.target === tr && (e.key === 'Enter' || e.key === ' ') && this.sc.style !== 'none') { e.preventDefault(); this._bodyClick({ target: tr, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey }); } if (e.key === 'Escape' && this._edit) this._cancelInline(); if (e.key === 'Enter' && this._edit && e.target.matches('input:not([type=checkbox]),select')) { e.preventDefault(); this._saveInline(); } });
      on(this.errBox, 'click', (e) => { if (e.target.closest('[data-retry]')) this.draw(); });
      on(this.bulk, 'click', (e) => this._bulkClick(e));
    },
    _isRtl() { return getComputedStyle(this.wrap).direction === 'rtl'; },
    _byId(id) { return this._rows.find((r) => r.id === id) || this._sel.get(id); },
    _node(row) { return this.tbody.querySelector(`tr[data-id="${CSS.escape ? CSS.escape(row.id) : row.id}"]`); },
    _sortClick(i, shift) {
      const c = this.cols[i]; if (!c || !c.orderable) return; const ord = this.s.order; const k = ord.findIndex(([x]) => x === i); const cur = k >= 0 ? ord[k][1] : null;
      const nd = cur == null ? 'asc' : cur === 'asc' ? 'desc' : this.o.orderClearable ? null : 'asc';
      if (shift && this.o.orderMulti) { if (k < 0) ord.push([i, 'asc']); else if (nd) ord[k][1] = nd; else ord.splice(k, 1); }
      else this.s.order = nd ? [[i, nd]] : [];
      this.s.page = 0; this.emit('order', { order: clone(this.s.order) }); this.draw();
    },
    _startResize(e, handle) {
      e.preventDefault(); e.stopPropagation(); const th = handle.closest('th'); const i = Number(th.dataset.col); const c = this.cols[i]; const rtl = this._isRtl();
      if (!this._fixedLayout) {
        this._sysWidths = {}; this._sysW = 0;
        this.thead.querySelectorAll('th.bui-dtbl-sys').forEach((t) => { const w = Math.ceil(t.getBoundingClientRect().width); this._sysWidths[t.dataset.sys] = w; this._sysW += w; t.style.width = w + 'px'; });
        this._shown().forEach((cc) => { const t = this._thMap[cc.index]; if (t && typeof cc.width !== 'number') cc.width = Math.round(t.getBoundingClientRect().width); });
        this._fixedLayout = true; this.wrap.classList.add('bui-dtbl-fixed-layout'); this._applyWidths();
      }
      const startX = e.clientX; const startW = c.width; const min = c.minWidth || 56; const max = c.maxWidth || 900; handle.setPointerCapture && handle.setPointerCapture(e.pointerId); th.classList.add('is-resizing');
      const mv = (ev) => { const dx = (ev.clientX - startX) * (rtl ? -1 : 1); c.width = clamp(Math.round(startW + dx), min, max); this._applyWidths(); };
      const up = () => { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up); th.classList.remove('is-resizing'); this._justResized = true; setTimeout(() => { this._justResized = false; }, 80); this._fixCols(); this._saveState(); this.emit('columnResize', { column: i, width: c.width }); };
      handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
    },
    _render() {
      this._renderBody(); this._renderInfo(); this._renderPager(); this._syncSort(); this._responsive(false, true); this._selChanged(true); this._saveState();
      this.wrap.classList.toggle('is-empty', !(this._view || []).length); this.table.setAttribute('aria-busy', this.s.loading ? 'true' : 'false');
      const info = this._pageInfo(); if (isFn(this.o.drawCallback)) this.o.drawCallback.call(this, info); this.emit('draw', info);
    },
    _cellValue(row, col) {
      const raw = this.raw(row, col); const meta = { row: this._rows.indexOf(row), col: col.index, dt: this };
      if (isFn(col.render)) return col.render(raw, 'display', row.data, meta);
      if (typeof raw === 'boolean') return this.t.yesNo[raw ? 0 : 1];
      return raw == null ? '' : raw instanceof Date ? raw.toLocaleDateString(this.locale) : isObj(raw) || Array.isArray(raw) ? JSON.stringify(raw) : String(raw);
    },
    _fillCell(td, row, col) {
      const v = this._cellValue(row, col);
      if (v instanceof Node) { td.appendChild(v); return; }
      const s = String(v ?? '');
      if (isFn(col.render) && /[<&]/.test(s)) { td.innerHTML = s; return; }       // render() output is trusted HTML (like DataTables); escape in your renderer
      const words = this.o.searchHighlight && this.s.search.trim() ? this.s.search.trim().split(/\s+/) : [];
      const cs = this.s.colSearch[col.index]; if (cs) words.push(cs);
      if (!words.length || !col.searchable) { td.textContent = s; return; }
      this._highlight(td, s, words);
    },
    _highlight(td, s, words) {
      const ns = norm(s); if (ns.length !== s.length && this.o.searchNormalize) { td.textContent = s; return; }
      const spans = []; words.forEach((w) => { const q = this.q(w); if (!q) return; let p = 0; while ((p = ns.indexOf(q, p)) >= 0) { spans.push([p, p + q.length]); p += q.length; } });
      if (!spans.length) { td.textContent = s; return; }
      spans.sort((a, b) => a[0] - b[0]); const m = []; spans.forEach((x) => { const l = m[m.length - 1]; if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else m.push(x.slice()); });
      let p = 0; m.forEach(([a, b]) => { if (a > p) td.appendChild(doc.createTextNode(s.slice(p, a))); td.appendChild(el('mark', 'bui-dtbl-mark', {}, s.slice(a, b))); p = b; }); if (p < s.length) td.appendChild(doc.createTextNode(s.slice(p)));
    },
    _rowEl(row, pos) {
      const tr = el('tr', 'bui-dtbl-row', { 'data-id': row.id, 'aria-rowindex': pos + 1 }); const o = this.o; const cols = this._shown();
      if (this.sc.style !== 'none') { tr.tabIndex = -1; }
      if (this._sel.has(row.id)) { tr.classList.add('is-selected'); tr.setAttribute('aria-selected', 'true'); }
      if (this._hiddenResp.size && o.childRow) { const td = el('td', 'bui-dtbl-sys bui-dtbl-child'); const b = el('button', 'bui-dtbl-toggle', { type: 'button', 'aria-expanded': this._expanded.has(row.id) ? 'true' : 'false', 'aria-label': this.t.toggleRow }); b.innerHTML = ICON.chev; td.appendChild(b); tr.appendChild(td); } else if (o.responsive && o.childRow) tr.appendChild(el('td', 'bui-dtbl-sys bui-dtbl-child'));
      if (this.sc.checkbox) { const td = el('td', 'bui-dtbl-sys bui-dtbl-select'); const cb = el('input', 'bui-dtbl-cb', { type: this.sc.style === 'single' ? 'radio' : 'checkbox', 'aria-label': this.t.selectRow, name: this.sc.style === 'single' ? this.id + '-r' : null }); cb.checked = this._sel.has(row.id); td.appendChild(cb); tr.appendChild(td); }
      const editing = this._edit && this._edit.id === row.id;
      cols.forEach((c) => {
        const td = el('td', 'bui-dtbl-td' + (c.className ? ' ' + c.className : ''), { 'data-col': c.index, 'data-label': stripTags(c.title) });
        if (editing && this._isEditable(c)) this._inlineField(td, row, c); else this._fillCell(td, row, c);
        if (this._cells.has(row.id + '|' + c.index)) td.classList.add('is-cell-selected');
        tr.appendChild(td);
      });
      if (this._hasActions()) tr.appendChild(this._actionsCell(row, !!editing));
      if (isFn(o.rowClass)) { const k = o.rowClass(row.data, row); if (k) tr.className += ' ' + k; }
      if (isFn(o.createdRow)) o.createdRow.call(this, tr, row.data, row);
      return tr;
    },
    _renderBody(keepScroll) {
      const tb = this.tbody; const o = this.o; const view = this._view || []; const frag = doc.createDocumentFragment(); const cols = this._shown();
      const span = this.thead.rows[0] ? this.thead.rows[0].children.length : cols.length;
      if (this._creating) frag.appendChild(this._createRow());
      let rows = view; let top = 0; let bot = 0; let startPos = 0;
      if (o.virtualScroll && !o.serverSide) {
        const all = this._filteredRows || []; const rh = (isObj(o.virtualScroll) && o.virtualScroll.rowHeight) || 42; const buf = (isObj(o.virtualScroll) && o.virtualScroll.buffer) || 8;
        const st = this.scroller.scrollTop; const vh = this.scroller.clientHeight || 420; const a = Math.max(0, Math.floor(st / rh) - buf); const b = Math.min(all.length, Math.ceil((st + vh) / rh) + buf);
        rows = all.slice(a, b); top = a * rh; bot = (all.length - b) * rh; startPos = a; this.wrap.style.setProperty('--bui-dtbl-rowh', rh + 'px'); this._vrange = [a, b];
      }
      if (top) frag.appendChild(this._spacer(top, span));
      let lastGroup; let hideGroup = false; const g = o.rowGroup;
      rows.forEach((row, i) => {
        if (g && !o.virtualScroll) {
          const key = String(getPath(row.data, g.dataSrc) ?? ''); if (key !== lastGroup) { lastGroup = key; hideGroup = this._groups.has(key); const grp = view.filter((r) => String(getPath(r.data, g.dataSrc) ?? '') === key); frag.appendChild(this._groupRow(key, grp, span, hideGroup)); }
          if (hideGroup) return;
        }
        const tr = this._rowEl(row, startPos + i); frag.appendChild(tr);
        if (this._expanded.has(row.id) && this._hiddenResp.size) frag.appendChild(this._childRow(row, span));
      });
      if (bot) frag.appendChild(this._spacer(bot, span));
      if (!rows.length && !this._creating) { const tr = el('tr', 'bui-dtbl-emptyrow'); const td = el('td', 'bui-dtbl-empty', { colspan: span }); const msg = this.o.emptyMessage || (this.s.total === 0 && !this.s.search ? this.t.emptyTable : this.t.empty); if (msg instanceof Node) td.appendChild(msg); else td.textContent = msg; tr.appendChild(td); frag.appendChild(tr); }
      const st = keepScroll ? this.scroller.scrollTop : null; tb.textContent = ''; tb.appendChild(frag); if (st != null) this.scroller.scrollTop = st;
      this._hiddenApply(); this._fixCols();
    },
    _spacer(h, span) { const tr = el('tr', 'bui-dtbl-spacer', { 'aria-hidden': 'true' }); tr.style.height = h + 'px'; tr.appendChild(el('td', '', { colspan: span })); return tr; },
    _groupRow(key, rows, span, collapsed) {
      const g = this.o.rowGroup; const tr = el('tr', 'bui-dtbl-group', { 'data-group': key }); const td = el('td', '', { colspan: span });
      const b = el('button', 'bui-dtbl-group-btn', { type: 'button', 'aria-expanded': collapsed ? 'false' : 'true', 'aria-label': this.t.toggleGroup }); b.innerHTML = ICON.chev; td.appendChild(b);
      const lab = isFn(g.startRender) ? g.startRender(key, rows.map((r) => r.data)) : null;
      if (lab instanceof Node) td.appendChild(lab); else if (typeof lab === 'string') { const s = el('span', 'bui-dtbl-group-label'); s.innerHTML = lab; td.appendChild(s); } else { td.appendChild(el('span', 'bui-dtbl-group-label', {}, key || '—')); td.appendChild(el('span', 'bui-dtbl-group-count', {}, this.t.groupCount.replace('{n}', this.n(rows.length)))); }
      tr.appendChild(td); return tr;
    },
    _childRow(row, span) {
      const tr = el('tr', 'bui-dtbl-childrow', { 'data-child': row.id }); const td = el('td', '', { colspan: span }); const dl = el('dl', 'bui-dtbl-details');
      this._vis().filter((c) => this._hiddenResp.has(c.index)).forEach((c) => { const dt = el('dt'); dt.innerHTML = c.title; const dd = el('dd'); this._fillCell(dd, row, c); dl.append(dt, dd); });
      td.appendChild(dl); tr.appendChild(td); return tr;
    },
    _bodyClick(e) {
      const t = e.target; const tr = t.closest && t.closest('tr');
      if (!tr) return;
      if (tr.classList.contains('bui-dtbl-group')) { const key = tr.dataset.group; if (this._groups.has(key)) this._groups.delete(key); else this._groups.add(key); this._renderBody(true); return; }
      const act0 = t.closest('[data-action]'); if (act0 && !tr.dataset.id) { this._runAction(act0.dataset.action, null, act0); return; }
      const id = tr.dataset.id; if (!id) return; const row = this._byId(id); if (!row) return;
      const tog = t.closest('.bui-dtbl-toggle'); if (tog) { if (this._expanded.has(id)) this._expanded.delete(id); else this._expanded.add(id); this._renderBody(true); return; }
      const act = t.closest('[data-action]'); if (act) { this._runAction(act.dataset.action, row, act); return; }
      if (t.closest('.bui-dtbl-actions,button,a,select,textarea,label') || (t.matches && t.matches('input:not(.bui-dtbl-cb)'))) return;
      this.emit('rowClick', { row: row.data, id: row.id, node: tr, event: e, index: this._rows.indexOf(row) });
      if (this._edit && this._edit.id === id) return;
      if (t.classList && t.classList.contains('bui-dtbl-cb')) return;
      const sc = this.sc;
      if (sc.style === 'cell') { const td = t.closest('td[data-col]'); if (td) { const k = id + '|' + td.dataset.col; const on = !this._cells.has(k); if (on) this._cells.add(k); else this._cells.delete(k); td.classList.toggle('is-cell-selected', on); this._selChanged(); this.emit(on ? 'select' : 'deselect', { type: 'cell', id, column: Number(td.dataset.col) }); } return; }
      if (sc.style === 'none' || !sc.click) return;
      if (sc.style === 'single') { this._select([row], !this._sel.has(id) || this._sel.size > 1, true); return; }
      if (e.shiftKey && this._lastSel && this._view.length) { const ids = this._view.map((r) => r.id); const a = ids.indexOf(this._lastSel); const b = ids.indexOf(id); if (a >= 0 && b >= 0) { this._select(this._view.slice(Math.min(a, b), Math.max(a, b) + 1), true); return; } }
      this._select([row], !this._sel.has(id));
    },
    _select(rows, on, exclusive) {
      if (this.sc.style === 'none') return; const changed = [];
      if (this.sc.style === 'single') { if (exclusive || on) { const prev = [...this._sel.values()].filter((r) => !rows.includes(r)); prev.forEach((r) => { this._sel.delete(r.id); changed.push([r, false]); }); } rows = rows.slice(0, 1); }
      rows.forEach((r) => { if (on && !this._sel.has(r.id)) { this._sel.set(r.id, r); changed.push([r, true]); } else if (!on && this._sel.has(r.id)) { this._sel.delete(r.id); changed.push([r, false]); } });
      if (rows.length === 1) this._lastSel = rows[0].id;
      if (!changed.length) return this._selChanged();
      this._selChanged();
      const on_ = changed.filter(([, v]) => v).map(([r]) => r); const off_ = changed.filter(([, v]) => !v).map(([r]) => r);
      if (on_.length) this.emit('select', { rows: on_.map((r) => r.data), ids: on_.map((r) => r.id), type: 'row' });
      if (off_.length) this.emit('deselect', { rows: off_.map((r) => r.data), ids: off_.map((r) => r.id), type: 'row' });
    },
    _selChanged(quiet) {
      const view = this._view || []; let n = 0;
      this.tbody.querySelectorAll('tr[data-id]').forEach((tr) => { const on = this._sel.has(tr.dataset.id); tr.classList.toggle('is-selected', on); on ? tr.setAttribute('aria-selected', 'true') : tr.removeAttribute('aria-selected'); const cb = tr.querySelector('.bui-dtbl-cb'); if (cb) cb.checked = on; });
      view.forEach((r) => { if (this._sel.has(r.id)) n++; });
      if (this._hcb) { this._hcb.checked = view.length > 0 && n === view.length; this._hcb.indeterminate = n > 0 && n < view.length; }
      this._renderBulk();
    },
    selectAll(filtered) { const list = filtered === false ? this._view || [] : this.o.serverSide ? this._rows : this._filteredRows || this._rows; this._select(list, true); return this; },
    deselectAll() { const all = [...this._sel.values()]; this._cells.clear(); this._select(all, false); this.tbody.querySelectorAll('.is-cell-selected').forEach((n) => n.classList.remove('is-cell-selected')); return this; },
    selected() { return [...this._sel.values()].map((r) => r.data); },
    selectedCells() { return [...this._cells].map((k) => { const [id, c] = k.split('|'); const row = this._byId(id); return { id, column: Number(c), value: row ? this.raw(row, this.cols[Number(c)]) : undefined }; }); },
    _renderBulk() {
      if (this.o.bulkBar === false) { this.bulk.hidden = true; this.bulk.textContent = ''; return; }
      const n = this._sel.size + this._cells.size; const b = this.bulk; b.hidden = n === 0; if (!n) { b.textContent = ''; return; }
      b.textContent = ''; b.appendChild(el('strong', 'bui-dtbl-bulk-count', {}, this.t.selectedCount.replace('{n}', this.n(n))));
      const total = this.o.serverSide ? this.s.filtered : (this._filteredRows || []).length;
      if (this.sc.style === 'multi' && total > (this._view || []).length && this._sel.size < total) b.appendChild(el('button', 'bui-dtbl-link', { type: 'button', 'data-bulk': 'all' }, this.t.selectFiltered.replace('{n}', this.n(total))));
      const acts = el('span', 'bui-dtbl-bulk-actions');
      (this.o.bulkActions || []).forEach((a, i) => acts.appendChild(mkBtn(a.text, a.className || 'bui-btn-outline', { 'data-bulk': 'x' + i })));
      const ed = this._edCfg(); if (ed.enabled && ed.bulkEdit) acts.appendChild(mkBtn(this.t.bulkEdit, 'bui-btn-outline', { 'data-bulk': 'edit' }));
      if (ed.enabled && ed.delete !== false && ed.bulkDelete !== false) acts.appendChild(mkBtn(this.t.bulkDelete, 'bui-btn-soft-danger', { 'data-bulk': 'delete' }));
      acts.appendChild(mkBtn(this.t.deselectAll, 'bui-btn-ghost', { 'data-bulk': 'none' })); b.appendChild(acts);
    },
    _bulkClick(e) {
      const b = e.target.closest('[data-bulk]'); if (!b) return; const k = b.dataset.bulk; const rows = [...this._sel.values()];
      if (k === 'all') this.selectAll(true); else if (k === 'none') this.deselectAll(); else if (k === 'delete') this._bulkDelete(rows); else if (k === 'edit') this._bulkEdit(rows);
      else if (k[0] === 'x') { const a = this.o.bulkActions[Number(k.slice(1))]; if (a && a.action) a.action(rows.map((r) => r.data), this, e); }
    },

    /* ----- info and pager ----- */
    _renderInfo() {
      this._syncLen();
      const s = this.s; const el_ = this.infoEl; el_.hidden = !this.o.showInfo; if (!this.o.showInfo) return;
      const total = s.filtered; let t;
      if (!total) t = this.t.infoEmpty; else t = this.t.info.replace('{start}', this.n(s.start + 1)).replace('{end}', this.n(s.end)).replace('{total}', this.n(total));
      if (s.total !== s.filtered && total !== undefined && s.total) t += ' ' + this.t.infoFiltered.replace('{max}', this.n(s.total));
      el_.textContent = t;
    },
    _renderPager() {
      const nav = this.pagerEl; nav.textContent = ''; const o = this.o; const pages = this._pages(); const cur = this.s.page;
      nav.hidden = !o.pagination || o.virtualScroll || (pages <= 1 && !o.alwaysShowPager) || this.s.len === -1; if (nav.hidden) return;
      const type = o.paginationType; const ul = el('ul', 'bui-dtbl-pages');
      const li = (label, page, cls, aria, disabled, current) => { const x = el('li'); const b = el('button', 'bui-dtbl-pg ' + (cls || '') + (current ? ' is-current' : ''), { type: 'button', 'aria-label': aria || null, 'aria-current': current ? 'page' : null, disabled, 'data-page': page }); if (label instanceof Node) b.appendChild(label); else b.textContent = label; x.appendChild(b); ul.appendChild(x); };
      const arrow = (flip, dbl) => { const s = el('span', 'bui-dtbl-arrow' + (flip ? ' is-flip' : '')); s.innerHTML = ICON.chev + (dbl ? ICON.chev : ''); return s; };
      const full = type === 'full_numbers' || type === 'full';
      if (full || type === 'first_last') li(arrow(true, true), 'first', 'bui-dtbl-pg-ic', this.t.first, cur === 0);
      li(type === 'simple' ? this.t.prev : arrow(true), 'prev', type === 'simple' ? '' : 'bui-dtbl-pg-ic', this.t.prev, cur === 0);
      if (type === 'compact') { const x = el('li', 'bui-dtbl-pageof'); x.textContent = this.t.pageOf.replace('{n}', this.n(cur + 1)).replace('{total}', this.n(pages)); ul.appendChild(x); }
      else if (type !== 'simple') {
        const size = Math.max(3, o.pagerSize); let a = Math.max(0, cur - Math.floor(size / 2)); let b = Math.min(pages, a + size); a = Math.max(0, b - size);
        if (a > 0) { li(this.n(1), 0, '', this.t.pageN.replace('{n}', this.n(1))); if (a > 1) ul.appendChild(el('li', 'bui-dtbl-gap', {}, '…')); }
        for (let p = a; p < b; p++) li(this.n(p + 1), p, '', this.t.pageN.replace('{n}', this.n(p + 1)), false, p === cur);
        if (b < pages) { if (b < pages - 1) ul.appendChild(el('li', 'bui-dtbl-gap', {}, '…')); li(this.n(pages), pages - 1, '', this.t.pageN.replace('{n}', this.n(pages))); }
      }
      li(type === 'simple' ? this.t.next : arrow(false), 'next', type === 'simple' ? '' : 'bui-dtbl-pg-ic', this.t.next, cur >= pages - 1);
      if (full || type === 'first_last') li(arrow(false, true), 'last', 'bui-dtbl-pg-ic', this.t.last, cur >= pages - 1);
      nav.appendChild(ul);
      if (o.pageJump) { const f = el('form', 'bui-dtbl-jump'); const i = el('input', 'bui-input', { type: 'number', min: 1, max: pages, 'aria-label': this.t.pageJump, placeholder: this.n(cur + 1) }); const g = mkBtn(this.t.go, 'bui-btn-outline'); g.type = 'submit'; f.append(i, g); f.addEventListener('submit', (e) => { e.preventDefault(); if (i.value) this._page(Number(i.value) - 1); }); nav.appendChild(f); }
      if (!this._pagerBound) { this._pagerBound = true; nav.addEventListener('click', (e) => { const b = e.target.closest('button[data-page]'); if (!b || b.disabled) return; const v = b.dataset.page; this._page(/^\d+$/.test(v) ? Number(v) : v); this.draw(); const f = this.pagerEl.querySelector('.is-current'); f && f.focus(); }); }
    },

    /* ----- popovers and dialogs ----- */
    _popover(anchor, content, cls) {
      this._closePop(); const p = el('div', 'bui-dtbl-pop ' + (cls || ''), { role: 'dialog' }); const wrapCls = [...this.wrap.classList].filter((c) => /bui-dtbl-(dark|light|compact)/.test(c)).join(' '); p.className += ' ' + wrapCls;
      if (this.dir) p.setAttribute('dir', this.dir); else p.setAttribute('dir', this._isRtl() ? 'rtl' : 'ltr');
      p.appendChild(content); doc.body.appendChild(p);
      const place = () => { const r = anchor.getBoundingClientRect(); const pr = p.getBoundingClientRect(); const rtl = p.getAttribute('dir') === 'rtl'; let left = rtl ? r.right - pr.width : r.left; left = clamp(left, 8, innerWidth - pr.width - 8); let top = r.bottom + 6; if (top + pr.height > innerHeight - 8 && r.top - pr.height - 6 > 8) top = r.top - pr.height - 6; p.style.left = left + 'px'; p.style.top = Math.max(8, top) + 'px'; p.style.maxHeight = Math.max(160, innerHeight - 16) + 'px'; };
      place(); anchor.setAttribute('aria-expanded', 'true');
      const out = (e) => { if (!p.contains(e.target) && !anchor.contains(e.target)) close(); }; const key = (e) => { if (e.key === 'Escape') { close(); anchor.focus && anchor.focus(); } };
      const close = () => { doc.removeEventListener('pointerdown', out, true); doc.removeEventListener('keydown', key, true); removeEventListener('resize', place); removeEventListener('scroll', place, true); p.remove(); anchor.setAttribute('aria-expanded', 'false'); if (this._pop && this._pop.el === p) this._pop = null; };
      setTimeout(() => { doc.addEventListener('pointerdown', out, true); }, 0); doc.addEventListener('keydown', key, true); addEventListener('resize', place); addEventListener('scroll', place, true);
      const f = p.querySelector('input,button,[tabindex]'); f && f.focus();
      return (this._pop = { el: p, close, place });
    },
    _closePop() { if (this._pop) this._pop.close(); },
    _dialog({ title, body, buttons, cls, wide, onOpen }) {
      return new Promise((resolve) => {
        const d = el('dialog', 'bui-modal bui-dtbl-dialog ' + (cls || ''), { 'aria-labelledby': this.id + '-dlg-t' }); if (wide) d.style.width = 'min(640px, calc(100vw - 32px))';
        d.setAttribute('dir', this.dir || (this._isRtl() ? 'rtl' : 'ltr')); [...this.wrap.classList].filter((c) => /bui-dtbl-(dark|light)/.test(c)).forEach((c) => d.classList.add(c));
        const h = el('div', 'bui-modal-header'); h.appendChild(el('h3', 'bui-modal-title', { id: this.id + '-dlg-t' }, title)); const x = el('button', 'bui-modal-close', { type: 'button', 'aria-label': this.t.close }); x.innerHTML = ICON.x; h.appendChild(x);
        const b = el('div', 'bui-modal-body'); if (body instanceof Node) b.appendChild(body); else b.textContent = body || '';
        const f = el('div', 'bui-modal-footer bui-dtbl-dialog-foot'); let done = false;
        const finish = (v) => { if (done) return; done = true; if (d.close) d.close(); d.remove(); resolve(v); };
        (buttons || []).forEach((bt) => { const bb = mkBtn(bt.text, bt.className || 'bui-btn-outline'); bb.classList.remove('bui-btn-sm'); bb.addEventListener('click', async (e) => { if (bt.onClick) { const r = await bt.onClick(e, finish, bb); if (r === false) return; } if (!bt.keepOpen) finish(bt.value); }); if (bt.autofocus) bb.dataset.af = '1'; f.appendChild(bb); });
        x.addEventListener('click', () => finish(undefined)); d.addEventListener('cancel', (e) => { e.preventDefault(); finish(undefined); }); d.addEventListener('close', () => finish(undefined));
        d.append(h, b); if (buttons && buttons.length) d.appendChild(f); this.wrap.appendChild(d);
        if (d.showModal) d.showModal(); else d.setAttribute('open', '');
        const af = d.querySelector('[data-af],input:not([type=hidden]),select,textarea'); af && af.focus(); if (onOpen) onOpen(d, finish);
      });
    },
    _confirm(title, text, danger) { return this._dialog({ title, body: text, cls: 'bui-dtbl-confirm', buttons: [{ text: this.t.cancel, value: false }, { text: danger ? this.t.delete : this.t.save, className: danger ? 'bui-btn-danger' : 'bui-btn-primary', value: true, autofocus: true }] }); },
    toast(msg, type) { if (window.BUI && BUI.toast) (BUI.toast[type] || BUI.toast)(msg); else { const live = this.infoEl; live.setAttribute('data-msg', msg); } },
  });

  /* =====================================================================================================
     Responsive, fixed columns, state, filters, buttons and export, editor, row actions, server side
     ===================================================================================================== */
  const fmtDate = () => new Date().toISOString().slice(0, 10);
  const same = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

  Object.assign(P, {
    /* ----- responsive ----- */
    _hiddenApply() {
      this.wrap.querySelectorAll('th[data-col],td[data-col]').forEach((n) => n.classList.toggle('is-resp-hidden', this._hiddenResp.has(Number(n.dataset.col))));
    },
    _responsive(force) {
      const o = this.o; if (!o.responsive || !this.wrap.isConnected) return;
      const width = this.wrap.clientWidth; const cv = o.cardView;
      const card = this._cardOv === true || cv === 'always' || (this._cardOv == null && cv === 'auto' && width > 0 && width < o.cardBreakpoint);
      const prevCard = !!this._card; this._card = card; this.wrap.classList.toggle('is-cards', card);
      if (card) {
        if (this._hiddenResp.size || force || prevCard !== card) { this._hiddenResp = new Set(); this._buildHead(); this._renderBody(true); }
        if (prevCard !== card) this.emit('responsiveChange', { mode: 'card', hidden: [], width }); return;
      }
      if (o.responsive === 'off') return;
      const prev = this._hiddenResp; const sc = this.scroller; const hide = new Set();
      this._hiddenResp = hide; this._hiddenApply();
      const cand = this._vis().filter((c) => c.priority !== 0 && c.fixed == null).sort((a, b) => b.priority - a.priority);
      for (const c of cand) { const before = sc.scrollWidth; if (before <= sc.clientWidth + 1) break; if (this._vis().length - hide.size <= 1) break; hide.add(c.index); this._hiddenApply(); if (sc.scrollWidth >= before) { hide.delete(c.index); this._hiddenApply(); } }
      if (!same(prev, hide) || force || prevCard !== card) { this._buildHead(); this._renderBody(true); this.emit('responsiveChange', { mode: 'table', hidden: [...hide], width }); }
    },
    cardView(v) { if (v === undefined) return !!this._card; this._cardOv = v === null ? null : !!v; this._responsive(true); return this; },
    _fixCols() {
      const fc = this.o.fixedColumns; if (!fc) return; const n = typeof fc === 'number' ? fc : fc.start || 0; const m = isObj(fc) ? fc.end || 0 : 0;
      const head = this.thead.rows[0]; if (!head) return; const cells = [...head.children]; const firstData = cells.findIndex((c) => c.dataset.col != null); if (firstData < 0) return;
      const dataIdx = cells.map((c, i) => (c.dataset.col != null && !c.classList.contains('is-resp-hidden') ? i : -1)).filter((i) => i >= 0);
      const start = n ? [...Array(firstData).keys(), ...dataIdx.slice(0, n)] : []; const trailSys = cells.length - 1 - (dataIdx[dataIdx.length - 1] ?? -1);
      const end = m ? [...dataIdx.slice(-m), ...Array.from({ length: trailSys }, (_, k) => cells.length - trailSys + k)] : [];
      const offs = {}; let acc = 0; start.forEach((i) => { offs[i] = ['s', acc]; acc += cells[i].offsetWidth; }); acc = 0; [...end].reverse().forEach((i) => { offs[i] = ['e', acc]; acc += cells[i].offsetWidth; });
      this.table.querySelectorAll('tr').forEach((tr) => { if (/(group|childrow|emptyrow|spacer)/.test(tr.className)) return; [...tr.children].forEach((c, i) => { c.classList.remove('is-fixed-start', 'is-fixed-end'); const f = offs[i]; if (f) { c.classList.add(f[0] === 's' ? 'is-fixed-start' : 'is-fixed-end'); c.style.setProperty('--bui-dtbl-fx', f[1] + 'px'); } }); });
    },

    /* ----- state ----- */
    _sk() { return 'bui-dtbl:' + (this.o.stateKey || this.host.id || (location.pathname + '#' + (this.host.dataset && this.host.dataset.buiDatatable) || 'table')); },
    _stateObj() { const s = this.s; return { v: 1, t: Date.now(), order: s.order, len: s.len, search: s.search, page: s.page, colSearch: s.colSearch, filters: s.filters, fLogic: s.fLogic, builder: s.builder, vis: this.cols.map((c) => c.visible), ord: this.colOrder, widths: this.cols.map((c) => c.width ?? null) }; },
    _saveState() { if (!this.o.stateSave || this._noSave) return; try { localStorage.setItem(this._sk(), JSON.stringify(this._stateObj())); } catch (e) { /* storage unavailable */ } },
    _loadState() {
      let st; try { st = JSON.parse(localStorage.getItem(this._sk())); } catch (e) { return; } if (!st || st.v !== 1) return;
      const dur = this.o.stateDuration; if (dur > 0 && Date.now() - st.t > dur * 1000) return;
      const s = this.s; if (Array.isArray(st.order)) s.order = st.order.filter(([i]) => this.cols[i] && this.cols[i].orderable); if (st.len) s.len = st.len; s.search = st.search || ''; s.page = st.page || 0; s.colSearch = st.colSearch || {}; s.filters = st.filters || {}; s.fLogic = st.fLogic || s.fLogic; if (st.builder) s.builder = st.builder;
      if (st.vis && st.vis.length === this.cols.length) this.cols.forEach((c, i) => { c.visible = st.vis[i]; });
      if (st.ord && st.ord.length === this.cols.length) this.colOrder = st.ord.slice();
      if (st.widths && st.widths.length === this.cols.length) this.cols.forEach((c, i) => { if (st.widths[i] != null) c.width = st.widths[i]; });
    },
    _clearState() { try { localStorage.removeItem(this._sk()); } catch (e) { /* ignore */ } },
    clearState() { this._clearState(); return this; },

    /* ----- filter panels ----- */
    _togglePanel(kind, btn) {
      let p = this.panels.querySelector(`[data-kind="${kind}"]`);
      if (p) { p.remove(); btn.setAttribute('aria-expanded', 'false'); return; }
      p = el('div', 'bui-dtbl-panel', { 'data-kind': kind }); this.panels.appendChild(p); btn.setAttribute('aria-expanded', 'true'); this._fillPanel(p, kind);
    },
    _syncFilterUi() { this.panels.querySelectorAll('.bui-dtbl-panel').forEach((p) => this._fillPanel(p, p.dataset.kind)); this.thead.querySelectorAll('.bui-dtbl-colin').forEach((inp, i) => { const c = this._shown().filter((x) => x.searchable)[i]; if (c) inp.value = this.s.colSearch[c.index] || ''; }); },
    _distinct(c) { const set = new Set(); this._rows.forEach((r) => { const t = this.text(r, c); if (t !== '') set.add(t); }); return [...set].sort((a, b) => this.collatorNat.compare(a, b)); },
    _fillPanel(p, kind) {
      p.textContent = ''; const upd = debounce(() => { this.s.page = 0; this.draw(); this.emit('filter', { filters: clone(this.s.filters) }); }, 120);
      const head = el('div', 'bui-dtbl-panel-head');
      const logic = el('select', 'bui-input bui-dtbl-logic', { 'aria-label': this.t.matchAll + ' / ' + this.t.matchAny }); const L = kind === 'filters' ? this.s.fLogic : this.s.builder.logic;
      [['and', this.t.matchAll], ['or', this.t.matchAny]].forEach(([v, l]) => { const o = el('option', '', { value: v }, l); if (v === L) o.selected = true; logic.appendChild(o); });
      logic.addEventListener('change', () => { if (kind === 'filters') this.s.fLogic = logic.value; else this.s.builder.logic = logic.value; upd(); });
      head.appendChild(logic); const clr = mkBtn(this.t.clearFilters, 'bui-btn-ghost'); clr.addEventListener('click', () => { this.clearFilters(); }); head.appendChild(clr); p.appendChild(head);
      if (kind === 'filters') {
        const grid = el('div', 'bui-dtbl-filter-grid');
        this.cols.filter((c) => c.filter).forEach((c) => {
          const type = c.filter; const v = this.s.filters[c.index]; const fld = el('div', 'bui-dtbl-ff'); const id = `${this.id}-f${c.index}`; fld.appendChild(el('label', 'bui-dtbl-ff-l', { for: id }, stripTags(c.title)));
          const set = (val) => { if (this._filterActive(val)) this.s.filters[c.index] = val; else delete this.s.filters[c.index]; upd(); };
          const mk = (t, ph, key, ia) => { const i = el('input', 'bui-input', { type: t, placeholder: ph, 'aria-label': stripTags(c.title) + ' ' + ph, id: ia ? id : null }); return i; };
          if (type === 'number' || type === 'date') {
            const [a, b] = type === 'number' ? ['min', 'max'] : ['from', 'to']; const cur = isObj(v) ? v : {}; const row = el('div', 'bui-dtbl-range');
            const i1 = mk(type, this.t[a], a, true); const i2 = mk(type, this.t[b], b); i1.value = cur[a] ?? ''; i2.value = cur[b] ?? '';
            const fire = () => set({ [a]: i1.value, [b]: i2.value }); i1.addEventListener('input', fire); i2.addEventListener('input', fire); row.append(i1, i2); fld.appendChild(row);
          } else if (type === 'boolean') {
            const s = el('select', 'bui-input', { id }); [['', this.t.any], ['true', this.t.yes], ['false', this.t.no]].forEach(([x, l]) => { const o = el('option', '', { value: x }, l); if (String(v ?? '') === x) o.selected = true; s.appendChild(o); }); s.addEventListener('change', () => set(s.value)); fld.appendChild(s);
          } else if (type === 'select' || type === 'multiselect') {
            const opts = (this._colOptions(c) || this._distinct(c)).map((x) => (isObj(x) ? x : { value: x, label: x })); const multi = type === 'multiselect';
            const s = el('select', 'bui-input', { id, multiple: multi, size: multi ? Math.min(5, opts.length || 2) : null }); if (!multi) s.appendChild(el('option', '', { value: '' }, this.t.any));
            opts.forEach((x) => { const o = el('option', '', { value: x.value }, String(x.label)); if (multi ? toArr(v).map(String).includes(String(x.value)) : String(v ?? '') === String(x.value)) o.selected = true; s.appendChild(o); });
            s.addEventListener('change', () => set(multi ? [...s.selectedOptions].map((o) => o.value) : s.value)); fld.appendChild(s);
          } else { const i = mk('search', this.t.search, null, true); i.value = v || ''; i.addEventListener('input', () => set(i.value)); fld.appendChild(i); }
          grid.appendChild(fld);
        });
        p.appendChild(grid);
      } else {
        const list = el('div', 'bui-dtbl-conds'); const b = this.s.builder;
        const rowFor = (c, k) => {
          const r = el('div', 'bui-dtbl-cond'); const col = el('select', 'bui-input', { 'aria-label': this.t.column }); this.cols.forEach((x) => { const o = el('option', '', { value: x.index }, stripTags(x.title)); if (x.index === c.col) o.selected = true; col.appendChild(o); });
          const cdef = this.cols[c.col] || {}; const type = this.colType(cdef); const copts = this._colOptions(cdef); const isBool = type === 'boolean';
          const ops = isBool ? ['equals', 'notEquals', 'empty', 'notEmpty'] : copts ? ['equals', 'notEquals', 'contains', 'notContains', 'empty', 'notEmpty'] : type === 'num' || type === 'date' ? ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between', 'empty', 'notEmpty'] : ['contains', 'notContains', 'equals', 'notEquals', 'startsWith', 'endsWith', 'empty', 'notEmpty'];
          if (!ops.includes(c.op)) c.op = ops[0];
          const op = el('select', 'bui-input', { 'aria-label': this.t.operator }); ops.forEach((x) => { const o = el('option', '', { value: x }, this.t.op[x]); if (x === c.op) o.selected = true; op.appendChild(o); });
          const useSel = (copts || isBool) && (c.op === 'equals' || c.op === 'notEquals'); const it = type === 'num' ? 'number' : type === 'date' ? 'date' : 'text'; let v1;
          if (useSel) { v1 = el('select', 'bui-input bui-dtbl-cond-sel', { 'aria-label': this.t.value }); const list = isBool ? [{ value: 'true', label: this.t.yes }, { value: 'false', label: this.t.no }] : copts; v1.appendChild(el('option', '', { value: '' }, '—')); list.forEach((x) => { const o = el('option', '', { value: x.value }, String(x.label)); if (String(c.value ?? '') === String(x.value)) o.selected = true; v1.appendChild(o); }); }
          else { v1 = el('input', 'bui-input', { type: it, 'aria-label': this.t.value }); v1.value = c.value ?? ''; }
          const v2 = el('input', 'bui-input', { type: it, 'aria-label': this.t.value }); v2.value = c.value2 ?? '';
          const none = c.op === 'empty' || c.op === 'notEmpty'; v1.hidden = none; v2.hidden = c.op !== 'between';
          const rm = el('button', 'bui-dtbl-x', { type: 'button', 'aria-label': this.t.removeCondition }); rm.innerHTML = ICON.x;
          col.addEventListener('change', () => { c.col = Number(col.value); c.value = ''; c.value2 = ''; { const nd = this.cols[c.col] || {}; if (this._colOptions(nd) || this.colType(nd) === 'boolean') c.op = 'equals'; } this._fillPanel(p, kind); upd(); }); op.addEventListener('change', () => { c.op = op.value; this._fillPanel(p, kind); upd(); });
          v1.addEventListener(useSel ? 'change' : 'input', () => { c.value = v1.value; upd(); }); v2.addEventListener('input', () => { c.value2 = v2.value; upd(); }); rm.addEventListener('click', () => { b.conds.splice(k, 1); this._fillPanel(p, kind); upd(); });
          r.append(col, op, v1, v2, rm); return r;
        };
        b.conds.forEach((c, k) => list.appendChild(rowFor(c, k))); p.appendChild(list);
        const add = mkBtn(this.t.addCondition, 'bui-btn-soft-primary'); add.insertAdjacentHTML('afterbegin', ICON.plus + ' '); add.addEventListener('click', () => { b.conds.push({ col: 0, op: 'contains', value: '' }); this._fillPanel(p, kind); }); p.appendChild(add);
      }
    },

    /* ----- buttons ----- */
    _btnDefs() {
      const t = this.t; const ex = (f) => ({ text: t[f], action: () => this.export(f) });
      return {
        copy: ex('copy'), csv: ex('csv'), excel: ex('excel'), pdf: ex('pdf'), print: ex('print'), json: ex('json'),
        colvis: { text: t.columns, dropdown: (a) => this._colvisMenu(a) }, selectColumns: { text: t.columns, dropdown: (a) => this._colvisMenu(a) }, restoreColumns: { text: t.restoreColumns, action: () => this._restoreCols() },
        pageLength: { text: t.lengthLabel, dropdown: (a) => this._lenMenu(a) }, reset: { text: t.reset, action: () => { this.reset(); this.draw(); } }, refresh: { text: t.refresh, action: () => (this.o.ajax ? this._reload() : this.draw()) },
        fullscreen: { text: t.fullscreen, action: (e, dt, b) => this.fullscreen(!this.wrap.classList.contains('is-fullscreen'), b) },
        create: { text: t.create, className: 'bui-btn-primary', action: () => this.create(), enabled: () => this._edCfg().enabled && this._edCfg().create !== false },
        deleteSelected: { text: t.bulkDelete, className: 'bui-btn-soft-danger', action: () => this._bulkDelete([...this._sel.values()]) }, selectAll: { text: t.selectAll, action: () => this.selectAll(true) }, selectNone: { text: t.deselectAll, action: () => this.deselectAll() },
        cardView: { text: t.cardView, action: () => this.cardView(!this._card) },
      };
    },
    _buildButtons() {
      const defs = this._btnDefs(); this.btnBar.textContent = ''; const mk = (spec, host) => {
        let d = typeof spec === 'string' ? { extend: spec } : { ...spec }; const base = d.extend && d.extend !== 'collection' ? defs[d.extend] : null; if (d.extend && d.extend !== 'collection' && !base) { console.warn('BUI.dataTable: unknown button "' + d.extend + '"'); return; }
        d = { ...(base || {}), ...d, text: d.text ?? (base && base.text) ?? ''}; if (isFn(d.text)) d.text = d.text(this, d); if (base && base.enabled && !base.enabled()) return;
        const key = d.extend || d.name; const bi = this.o.buttonIcons; let icon = d.icon !== undefined ? d.icon : (bi && BTN_ICON[key]) || null; if (icon === false) icon = null; const only = !!icon && (d.iconOnly !== undefined ? d.iconOnly : bi === 'only'); const tip = d.title || (only ? d.text : null);
        const b = mkBtn(only ? '' : d.text, d.className || 'bui-btn-outline', { 'data-btn': key || 'custom', title: tip || null, 'aria-label': tip || null }); if (icon) { b.prepend(icoSpan(icon)); b.classList.toggle('bui-dtbl-btn-ico', only); }
        if (d.extend === 'collection' || d.dropdown) { b.setAttribute('aria-haspopup', 'true'); b.setAttribute('aria-expanded', 'false'); b.insertAdjacentHTML('beforeend', ' <span class="bui-dtbl-caret" aria-hidden="true"></span>'); b.addEventListener('click', () => { if (this._pop && this._pop.anchor === b) return this._closePop(); if (d.dropdown) d.dropdown(b); else this._collection(b, d); if (this._pop) this._pop.anchor = b; }); }
        else b.addEventListener('click', async (e) => { if (isFn(d.action)) { try { await d.action.call(b, e, this, b, d); } catch (err) { console.error(err); } } });
        if (isFn(d.init)) d.init.call(b, this, b, d); host.appendChild(b);
      };
      toArr(this.o.buttons).forEach((s) => mk(s, this.btnBar)); this._mkButton = mk;
    },
    _collection(anchor, d) {
      const box = el('div', 'bui-dtbl-menu'); const tmp = el('div'); const sub = { btnBar: tmp }; const defs = this._btnDefs();
      toArr(d.buttons).forEach((s) => { const spec = typeof s === 'string' ? { extend: s } : s; const base = defs[spec.extend] || {}; const text = spec.text ?? base.text ?? spec.extend; const it = el('button', 'bui-dtbl-menu-item', { type: 'button' }, isFn(text) ? text(this) : text); const ik = spec.icon !== undefined ? spec.icon : this.o.buttonIcons && BTN_ICON[spec.extend]; if (ik) it.prepend(icoSpan(ik)); it.addEventListener('click', async (e) => { this._closePop(); const act = spec.action || base.action; if (act) await act.call(it, e, this, it, spec); }); box.appendChild(it); });
      this._popover(anchor, box, 'bui-dtbl-pop-menu');
    },
    _colvisMenu(anchor) {
      const box = el('div', 'bui-dtbl-menu bui-dtbl-colvis'); const sync = () => { const only = this._vis().length === 1; box.querySelectorAll('input[data-i]').forEach((i) => { const c = this.cols[Number(i.dataset.i)]; i.checked = c.visible; i.disabled = c.visible && only; }); const sg = box.querySelector('input[data-sel]'); if (sg) sg.checked = !!this.sc.checkbox; };
      if (this.o.selectionToggle) { const l = el('label', 'bui-dtbl-menu-item bui-dtbl-check bui-dtbl-check-sel'); const cb = el('input', '', { type: 'checkbox', 'data-sel': '1' }); cb.addEventListener('change', () => { this.selectionColumn(cb.checked); sync(); }); l.append(cb, el('span', '', {}, this.t.selectionColumn)); box.append(l, el('div', 'bui-dtbl-menu-sep')); }
      this.colOrder.forEach((i) => { const c = this.cols[i]; if (c.hideable === false) return; const l = el('label', 'bui-dtbl-menu-item bui-dtbl-check'); const cb = el('input', '', { type: 'checkbox', 'data-i': i }); cb.addEventListener('change', () => { this._setVisible(i, cb.checked); sync(); }); const s = el('span'); s.innerHTML = c.title; l.append(cb, s); box.appendChild(l); });
      const f = el('div', 'bui-dtbl-menu-foot'); const a = mkBtn(this.t.showAll, 'bui-btn-ghost'); a.addEventListener('click', () => { this.cols.forEach((c) => { c.visible = true; }); this._buildHead(); this._renderBody(); this._responsive(true); this._saveState(); sync(); }); const r = mkBtn(this.t.restoreColumns, 'bui-btn-ghost'); r.addEventListener('click', () => { this._restoreCols(); sync(); }); f.append(a, r); box.appendChild(f); sync(); this._popover(anchor, box, 'bui-dtbl-pop-menu');
    },
    selectionColumn(on) {
      if (on === undefined) return !!this.sc.checkbox; on = !!on; if (on === !!this.sc.checkbox) return this;
      if (on) { this.sc = { ...this._sc0, style: this._sc0.style === 'none' ? 'multi' : this._sc0.style, checkbox: true, click: this._sc0.checkbox ? this._sc0.click : false }; }
      else { this.deselectAll(); this.sc = { ...this.sc, checkbox: false, click: false, style: this.sc.style }; }
      this._buildHead(); this._renderBody(); this._renderBulk(); this._responsive(true); this.emit('selectionColumn', { visible: on }); return this;
    },
    _restoreCols() { this.selectionColumn(!!this._sc0.checkbox); const d = this._defaults; this.cols.forEach((c, i) => { c.visible = d.vis[i]; c.width = d.widths[i]; }); this.colOrder = d.ord.slice(); this._buildHead(); this._renderBody(); this._responsive(true); this._saveState(); this.emit('columnVisibility', { restored: true }); },
    _lenMenu(anchor) {
      const box = el('div', 'bui-dtbl-menu'); (this.o.lengthMenu || [10, 25, 50, 100]).forEach((v) => { const val = Array.isArray(v) ? v[0] : v; const it = el('button', 'bui-dtbl-menu-item' + (val === this.s.len ? ' is-on' : ''), { type: 'button' }, val === -1 ? this.t.all : this.n(val)); it.addEventListener('click', () => { this._closePop(); this.pageLength(val); this.draw(); this._syncSearchUi(); }); box.appendChild(it); });
      if (this.o.lengthInput) {
        const max = this.o.lengthMax || 5000; const f = el('form', 'bui-dtbl-lenform'); const inp = el('input', 'bui-input', { type: 'number', min: 1, max, step: 1, inputmode: 'numeric', 'aria-label': this.t.lengthCustom, placeholder: this.t.lengthCustom }); const go = mkBtn(this.t.go, 'bui-btn-primary'); go.type = 'submit'; f.append(inp, go);
        f.addEventListener('submit', (e) => { e.preventDefault(); const n = Math.floor(Number(inp.value)); if (!(n >= 1)) { inp.classList.add('is-invalid'); inp.focus(); return; } this._closePop(); this.pageLength(Math.min(n, max)); this.draw(); this._syncSearchUi(); });
        inp.addEventListener('input', () => inp.classList.remove('is-invalid')); box.appendChild(f);
      }
      this._popover(anchor, box, 'bui-dtbl-pop-menu');
    },
    fullscreen(on, btn) {
      const w = this.wrap; on = on === undefined ? !w.classList.contains('is-fullscreen') : !!on; w.classList.toggle('is-fullscreen', on); doc.documentElement.classList.toggle('bui-dtbl-lock', on);
      const b = btn || (this.btnBar && this.btnBar.querySelector('[data-btn=fullscreen]')); if (b) { const lab = on ? this.t.exitFullscreen : this.t.fullscreen; const ic = b.querySelector('.bui-dtbl-bico'); if (ic && ic.dataset.ico === 'fullscreen') ic.innerHTML = ICONS[on ? 'fullscreenExit' : 'fullscreen']; if (b.getAttribute('aria-label')) { b.setAttribute('aria-label', lab); b.title = lab; } const tn = [...b.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (tn) tn.textContent = lab; }
      if (on) { this._fsKey = (e) => { if (e.key === 'Escape' && !this._pop && !w.querySelector('dialog[open]')) this.fullscreen(false); }; doc.addEventListener('keydown', this._fsKey); } else if (this._fsKey) { doc.removeEventListener('keydown', this._fsKey); this._fsKey = null; }
      this._responsive(true); return this;
    },

    /* ----- export (copy · CSV · JSON · real XLSX · real PDF · print) ----- */
    exportData(opt = {}) {
      const o = { ...(this.o.export || {}), ...opt }; let which = o.rows || 'auto'; if (which === 'auto') which = this._sel.size ? 'selected' : 'filtered';
      let rows = which === 'all' ? this._rows : which === 'visible' || which === 'page' ? this._view || [] : which === 'selected' ? [...this._sel.values()] : this.o.serverSide ? this._rows : this._filteredRows || this._rows;
      if (opt.rowsOverride) rows = opt.rowsOverride;
      let cols = o.columns === 'all' ? this.cols.slice() : Array.isArray(o.columns) ? o.columns.map((i) => this.cols[this._ci(i)]).filter(Boolean) : this._vis();
      cols = cols.filter((c) => c.exportable !== false); const types = cols.map((c) => this.colType(c));
      const headers = cols.map((c) => stripTags(c.exportTitle || c.title));
      const val = (r, c, k) => {
        const raw = this.raw(r, c); if (isFn(o.format)) { const f = o.format(raw, r.data, c, this); if (f !== undefined) return f; } if (isFn(c.exportFormat)) return c.exportFormat(raw, r.data, this);
        if (typeof raw === 'number' && !isFn(c.render)) return raw; if (typeof raw === 'boolean') return raw ? this.t.yesNo[0] : this.t.yesNo[1];
        const t = this.text(r, c, 'export'); if (types[k] === 'num' && t !== '' && !isFn(c.render) && isFinite(Number(t))) return Number(t); return t;
      };
      return { headers, rows: rows.map((r) => cols.map((c, k) => val(r, c, k))), rowData: rows.map((r) => r.data), columns: cols.map((c) => c.index), options: o };
    },
    _fileName(o, ext) { let n = isFn(o.filename) ? o.filename(this) : o.filename || (this.host.id ? this.host.id : doc.title || 'table'); n = String(n).replace(/\{date\}/g, fmtDate()); return n.replace(/[\\/:*?"<>|]+/g, '-') + '.' + ext; },
    async export(format, opt = {}) {
      const o = { ...(this.o.export || {}), ...opt }; let ex;
      let which = o.rows || 'auto'; if (which === 'auto') which = this._sel.size ? 'selected' : 'filtered'; const serverAll = this.o.serverSide && which !== 'selected' && which !== 'visible' && which !== 'page';
      if ((which === 'all' && o.fetchAll) || serverAll) { let all; try { all = isFn(o.fetchAll) ? await o.fetchAll(this) : await this._fetchAll(); } catch (err) { if (this.s.loading) this._busy(false); this.toast((err && err.message) || this.t.error, 'error'); return null; } ex = this.exportData({ ...opt, rows: which, rowsOverride: all.map((d) => ({ id: '', data: d })) }); } else ex = this.exportData({ ...opt, rows: which });
      format = String(format).toLowerCase(); if (format === 'xlsx') format = 'excel';
      if (!ex.rows.length && format !== 'print') { this.toast(this.t.exportEmpty, 'warning'); return null; }
      if (this.emit('beforeExport', { format, data: ex }) === false) return null;
      const title = o.title === undefined ? '' : isFn(o.title) ? o.title(this) : o.title; const eo = { ...o, title, rtl: this._isRtl() }; let filename = null; let ok = true; let blob = null;
      if (format === 'copy') { const text = [ex.headers, ...ex.rows].map((r) => r.map((v) => String(v ?? '').replace(/\t|\r?\n/g, ' ')).join('\t')).join('\n'); ok = await copyText(text); this.toast(ok ? this.t.copied.replace('{n}', this.n(ex.rows.length)) : this.t.copyFail, ok ? 'success' : 'error'); filename = 'clipboard'; }
      else if (format === 'csv') { const sep = o.separator || ','; const q = (v) => { const s = String(v ?? ''); return new RegExp('["\\r\\n' + sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']').test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }; const text = [ex.headers, ...ex.rows].map((r) => r.map(q).join(sep)).join('\r\n'); blob = new Blob(['﻿', text], { type: 'text/csv;charset=utf-8' }); filename = this._fileName(o, 'csv'); }
      else if (format === 'json') { const data = ex.rows.map((r) => Object.fromEntries(ex.headers.map((h, i) => [h, r[i]]))); blob = new Blob([JSON.stringify(data, null, o.indent === undefined ? 2 : o.indent)], { type: 'application/json;charset=utf-8' }); filename = this._fileName(o, 'json'); }
      else if (format === 'excel') { blob = DataTable.adapters.excel ? await DataTable.adapters.excel(ex, eo, this) : buildXlsx(ex, eo); filename = this._fileName(o, 'xlsx'); }
      else if (format === 'pdf') {
        blob = DataTable.adapters.pdf ? await DataTable.adapters.pdf(ex, eo, this) : o.pdfMode === 'image' ? await buildPdfImage(ex, eo) : buildPdf(ex, eo);
        if (!blob && !DataTable.adapters.pdf && o.pdfMode !== 'text') { try { blob = await buildPdfImage(ex, eo); } catch (e) { blob = null; } }
        if (!blob) { this.toast(this.t.pdfFallback, 'info'); this.emit('exportFallback', { format, reason: 'pdf-charset' }); this._print(ex, eo); filename = null; ok = true; } else filename = this._fileName(o, 'pdf');
      } else if (format === 'print') { this._print(ex, eo); filename = null; }
      else throw new Error('BUI.dataTable: unknown export format "' + format + '"');
      if (blob) { if (!(blob instanceof Blob)) blob = new Blob([blob], { type: format === 'pdf' ? 'application/pdf' : 'application/octet-stream' }); download(blob, filename); }
      this.emit('afterExport', { format, filename, rows: ex.rows.length, blob, ok }); return blob || ex;
    },
    _print(ex, o) {
      const f = el('iframe', '', { 'aria-hidden': 'true', tabindex: '-1' }); f.style.cssText = 'position:fixed;inset-inline-end:0;bottom:0;width:0;height:0;border:0'; doc.body.appendChild(f);
      const d = f.contentDocument; const dir = this.dir || (this._isRtl() ? 'rtl' : 'ltr'); const td = (v) => esc(v == null ? '' : v);
      d.open(); d.write(`<!doctype html><html dir="${dir}" lang="${esc(this.locale)}"><head><meta charset="utf-8"><title>${esc(o.title || doc.title)}</title><style>body{font:12px/1.45 system-ui,"Segoe UI",Tahoma,sans-serif;color:#20213a;margin:20px}h1{font-size:18px;margin:0 0 6px}p{margin:4px 0 10px;color:#555}table{border-collapse:collapse;width:100%}th,td{border:1px solid #d5d7e3;padding:6px 8px;text-align:start;vertical-align:top}th{background:#eef0f7;font-weight:700}tr:nth-child(even) td{background:#fafbfd}thead{display:table-header-group}tr{break-inside:avoid}</style></head><body>${o.title ? `<h1>${esc(o.title)}</h1>` : ''}${o.messageTop ? `<p>${esc(o.messageTop)}</p>` : ''}<table><thead><tr>${ex.headers.map((h) => `<th>${td(h)}</th>`).join('')}</tr></thead><tbody>${ex.rows.map((r) => `<tr>${r.map((v) => `<td>${td(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>${o.messageBottom ? `<p>${esc(o.messageBottom)}</p>` : ''}</body></html>`); d.close();
      const run = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { console.warn(e); } setTimeout(() => f.remove(), 1500); }; if (d.readyState === 'complete') setTimeout(run, 50); else f.onload = () => setTimeout(run, 50);
    },

    /* ----- editor: create / edit / delete / bulk, inline or modal ----- */
    _edCfg() { const e = this.o.editor; if (!e) return { enabled: false }; return { enabled: true, mode: 'modal', create: true, edit: true, delete: true, confirmDelete: true, ...(isObj(e) ? e : {}), mode_: 0 }; },
    _acts() { const a = this.o.rowActions; if (a && a.length) return a; const e = this._edCfg(); if (!e.enabled || e.defaultActions === false) return []; return [...(e.edit !== false ? ['edit'] : []), ...(e.delete !== false ? ['delete'] : [])]; },
    _hasActions() { return this._acts().length > 0; },
    _fields() {
      const e = this._edCfg(); const f = this.cols.filter((c) => this._isEditable(c)).map((c) => ({ ...(isObj(c.editor) ? c.editor : {}), data: c.data, label: (isObj(c.editor) && c.editor.label) || stripTags(c.title), col: c, type: (isObj(c.editor) && c.editor.type) || (c.options ? 'select' : this.colType(c) === 'num' ? 'number' : this.colType(c) === 'date' ? 'date' : this.colType(c) === 'boolean' ? 'checkbox' : 'text') }));
      toArr(e.fields).forEach((x) => { const i = f.findIndex((y) => y.data === x.data); if (i >= 0) Object.assign(f[i], x); else f.push({ type: 'text', label: String(x.data), ...x }); });
      f.forEach((x) => { if (x.type === 'select' && !x.options) x.options = (x.col && this._colOptions(x.col)) || []; });
      return f;
    },
    _isEditable(c) { return !!c.editor && c.editable !== false && !(isObj(c.editor) && c.editor.readonly === true) && c.data != null; },
    _fieldInput(f, value, id) {
      let inp; const t = f.type; const ph = f.placeholder || '';
      if (t === 'textarea') { inp = el('textarea', 'bui-input bui-dtbl-ta', { rows: f.rows || 3 }); inp.value = value ?? ''; }
      else if (t === 'select') {
        inp = el('select', 'bui-input'); const opts = toArr(f.options).map((x) => (isObj(x) ? x : { value: x, label: x })); inp._opts = opts; if (f.placeholder !== false && !f.required) inp.appendChild(el('option', '', { value: '' }, f.placeholder || '—'));
        opts.forEach((x, i) => { const o = el('option', '', { value: i }, String(x.label)); if (String(x.value) === String(value ?? '')) o.selected = true; inp.appendChild(o); });
      } else if (t === 'checkbox') { inp = el('input', 'bui-dtbl-cb', { type: 'checkbox' }); inp.checked = isTrue(value); }
      else { inp = el('input', 'bui-input', { type: ['number', 'email', 'date', 'password', 'tel', 'url', 'time', 'datetime-local'].includes(t) ? t : 'text', placeholder: ph, step: f.step || null, min: f.min ?? null, max: f.max ?? null, autocomplete: 'off' }); inp.value = value == null ? '' : value instanceof Date ? value.toISOString().slice(0, 10) : value; }
      if (id) inp.id = id; if (f.required) inp.setAttribute('aria-required', 'true'); inp.dataset.field = String(f.data); inp._f = f; return inp;
    },
    _readField(inp) {
      const f = inp._f; if (f.type === 'checkbox') return inp.checked; if (f.type === 'select') { if (inp.value === '') return null; return inp._opts[Number(inp.value)].value; }
      const v = inp.value; if (f.type === 'number') return v === '' ? null : Number(v); return f.trim === false ? v : v.trim();
    },
    _validate(f, v, data) {
      const t = this.t; const empty = v == null || v === '' || (f.type === 'checkbox' && f.required && v === false); if (f.required && empty) return t.required; if (empty) return null;
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return t.invalidEmail; if (f.type === 'number') { if (typeof v !== 'number' || !isFinite(v)) return t.invalidNumber; if (f.min != null && v < Number(f.min)) return t.minValue.replace('{n}', this.n(f.min)); if (f.max != null && v > Number(f.max)) return t.maxValue.replace('{n}', this.n(f.max)); }
      if (f.type === 'date' && isNaN(Date.parse(v))) return t.invalidDate; if (f.type === 'date') { if (f.min && v < f.min) return t.minValue.replace('{n}', f.min); if (f.max && v > f.max) return t.maxValue.replace('{n}', f.max); }
      if (typeof v === 'string') { if (f.minLength && v.length < f.minLength) return t.minLength.replace('{n}', this.n(f.minLength)); if (f.maxLength && v.length > f.maxLength) return t.maxLength.replace('{n}', this.n(f.maxLength)); if (f.pattern && !new RegExp(f.pattern).test(v)) return f.patternMessage || t.pattern; }
      if (isFn(f.validate)) { const r = f.validate(v, data, this); if (r === false) return t.invalid; if (typeof r === 'string') return r; }
      return null;
    },
    _collect(inputs, base, setErr) {
      const vals = {}; let ok = true; let first = null; const data = { ...(base || {}) };
      inputs.forEach((i) => { vals[i._f.data] = this._readField(i); setPath(data, i._f.data, vals[i._f.data]); });
      inputs.forEach((i) => { const m = this._validate(i._f, vals[i._f.data], data); setErr(i, m); if (m) { ok = false; first = first || i; } });
      if (!ok) first && first.focus(); return ok ? vals : null;
    },
    _form(fields, row, isNew) {
      const form = el('form', 'bui-dtbl-form', { novalidate: true }); const inputs = [];
      fields.forEach((f, k) => {
        const id = `${this.id}-e${k}`; const wrap = el('div', 'bui-field bui-dtbl-fld' + (f.type === 'checkbox' ? ' is-check' : '')); const lab = el('label', 'bui-dtbl-fl', { for: id }); lab.textContent = f.label + (f.required ? ' *' : '');
        const val = row ? getPath(row.data, f.data) : f.default !== undefined ? (isFn(f.default) ? f.default() : f.default) : undefined; const inp = this._fieldInput(f, val, id); const err = el('div', 'bui-dtbl-fielderr', { id: id + '-err', role: 'alert', hidden: true });
        if (f.type === 'checkbox') wrap.append(inp, lab); else wrap.append(lab, inp); if (f.help) wrap.appendChild(el('div', 'bui-dtbl-help', {}, f.help)); wrap.appendChild(err); form.appendChild(wrap); inputs.push(inp);
      });
      this._setErr = (inp, m) => { const e = doc.getElementById(inp.id + '-err'); if (e) { e.textContent = m || ''; e.hidden = !m; } inp.classList.toggle('is-invalid', !!m); m ? inp.setAttribute('aria-invalid', 'true') : inp.removeAttribute('aria-invalid'); if (m) inp.setAttribute('aria-describedby', inp.id + '-err'); };
      return { form, inputs, setErr: this._setErr };
    },
    async _commit(kind, payload, ctx) {
      const ed = this._edCfg(); const cb = kind === 'create' ? ed.onCreate : kind === 'update' ? ed.onUpdate : ed.onDelete; let res;
      if (isFn(cb)) res = await cb(payload, { dt: this, ...ctx });
      if (this.o.serverSide && ed.reload !== false) { await this._load(); return res; }
      return res;
    },
    create(defaults) {
      const ed = this._edCfg(); if (!ed.enabled || ed.create === false) return this; const fields = this._fields();
      if (ed.mode === 'inline') { this._creating = { defaults: defaults || {} }; this._edit = null; this._renderBody(true); const f = this.tbody.querySelector('.bui-dtbl-newrow input,.bui-dtbl-newrow select'); f && f.focus(); return this; }
      this._modalEdit(null, fields, defaults); return this;
    },
    edit(id) {
      const ed = this._edCfg(); if (!ed.enabled || ed.edit === false) return this; const row = this._byId(String(id)); if (!row) return this; const fields = this._fields();
      if (ed.mode === 'inline') { this._creating = null; this._edit = { id: row.id }; this._renderBody(true); const f = this._node(row) && this._node(row).querySelector('input,select,textarea'); f && f.focus(); return this; }
      this._modalEdit(row, fields); return this;
    },
    async _modalEdit(row, fields, defaults) {
      const isNew = !row; const { form, inputs, setErr } = this._form(fields.map((f) => (defaults && defaults[f.data] !== undefined ? { ...f, default: defaults[f.data] } : f)), row, isNew); const errBox = el('div', 'bui-dtbl-formerr', { role: 'alert', hidden: true });
      form.prepend(errBox); let saving = false;
      const save = async (e, finish, btn) => {
        if (saving) return false; const vals = this._collect(inputs, row ? row.data : {}, setErr); if (!vals) return false; saving = true; btn.disabled = true; errBox.hidden = true;
        try { await this._applyCommit(isNew, row, vals); finish(true); } catch (err) { errBox.textContent = (err && err.message) || this.t.saveFailed; errBox.hidden = false; saving = false; btn.disabled = false; }
        return false;
      };
      form.addEventListener('submit', (e) => { e.preventDefault(); const b = form.closest('dialog').querySelector('.bui-btn-primary'); b && b.click(); });
      return this._dialog({ title: isNew ? this.t.createTitle : this.t.editTitle, body: form, wide: fields.length > 4, buttons: [{ text: this.t.cancel, value: false }, { text: this.t.save, className: 'bui-btn-primary', onClick: save, keepOpen: true }] });
    },
    async _applyCommit(isNew, row, vals) {
      if (isNew) {
        const data = {}; Object.keys(vals).forEach((k) => setPath(data, k, vals[k])); const res = await this._commit('create', data, {}); const out = isObj(res) ? { ...data, ...res } : data;
        if (!this.o.serverSide) { const r = this._addRow(out, 0); this._creating = null; this._dirty(); this.emit('create', { row: out, id: r.id }); } else this.emit('create', { row: out });
      } else {
        const old = clone(row.data); const next = clone(row.data); Object.keys(vals).forEach((k) => setPath(next, k, vals[k])); const res = await this._commit('update', next, { row: old, id: row.id });
        if (!this.o.serverSide) { Object.assign(row.data, next, isObj(res) ? res : {}); row.h = null; this._typeCache = false; this._edit = null; this._dirty(); }
        this.emit('edit', { row: row.data, old, id: row.id });
      }
    },
    _inlineField(td, row, col) { const f = this._fields().find((x) => x.col === col); if (!f) return this._fillCell(td, row, col); const id = `${this.id}-i${col.index}`; const inp = this._fieldInput(f, this.raw(row, col), id); inp.setAttribute('aria-label', f.label); td.classList.add('is-editing'); td.appendChild(inp); const err = el('div', 'bui-dtbl-fielderr', { id: id + '-err', role: 'alert', hidden: true }); td.appendChild(err); },
    _createRow() {
      const tr = el('tr', 'bui-dtbl-row bui-dtbl-newrow'); const fields = this._fields(); const d = this._creating.defaults || {}; const sys = this.thead.rows[0].children; 
      [...sys].forEach((th) => {
        if (th.dataset.col == null) { const td = el('td', 'bui-dtbl-sys' + (th.classList.contains('bui-dtbl-actions') ? ' bui-dtbl-actions' : '')); if (th.classList.contains('bui-dtbl-actions')) { td.append(this._btnIcon('save', this.t.save, 'bui-btn-primary', 'saveNew'), this._btnIcon('cancel', this.t.cancel, 'bui-btn-ghost', 'cancelNew')); } tr.appendChild(td); return; }
        const c = this.cols[Number(th.dataset.col)]; const td = el('td', 'bui-dtbl-td', { 'data-col': c.index, 'data-label': stripTags(c.title) }); const f = fields.find((x) => x.col === c);
        if (f) { const id = `${this.id}-n${c.index}`; const inp = this._fieldInput(f, d[f.data] !== undefined ? d[f.data] : isFn(f.default) ? f.default() : f.default, id); inp.setAttribute('aria-label', f.label); td.classList.add('is-editing'); td.append(inp, el('div', 'bui-dtbl-fielderr', { id: id + '-err', role: 'alert', hidden: true })); } tr.appendChild(td);
      });
      return tr;
    },
    _btnIcon(kind, text, cls, action) { const b = mkBtn(text, cls, { 'data-action': action }); return b; },
    _actionsCell(row, editing) {
      const td = el('td', 'bui-dtbl-sys bui-dtbl-actions'); const wrap = el('div', 'bui-dtbl-actwrap');
      if (editing) { wrap.append(this._btnIcon('save', this.t.save, 'bui-btn-primary', 'saveInline'), this._btnIcon('cancel', this.t.cancel, 'bui-btn-ghost', 'cancelInline')); td.appendChild(wrap); return td; }
      const acts = this._acts().map((a) => this._actDef(a)).filter((a) => !a.visible || a.visible(row.data, row));
      if (this.o.rowActionsMode === 'menu') { const b = el('button', 'bui-dtbl-kebab', { type: 'button', 'data-action': 'menu', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': this.t.actions }); b.innerHTML = ICON.dots; wrap.appendChild(b); }
      else acts.forEach((a) => {
        const only = !!a.icon && a.iconOnly !== false && (a.iconOnly === true || this.o.actionIcons === 'only'); const tip = a.title || a.text;
        const b = mkBtn(only ? '' : a.text, a.className + (only ? ' bui-dtbl-btn-ico' : ''), { 'data-action': a.menu ? 'menu' : a.name, title: tip, 'aria-label': only || a.menu ? tip : null });
        if (a.icon) b.prepend(icoSpan(a.icon)); if (a.menu) { b.dataset.menuFor = a.name; b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', 'false'); if (!only) b.append(el('span', 'bui-dtbl-caret', { 'aria-hidden': 'true' })); } wrap.appendChild(b);
      });
      td.appendChild(wrap); return td;
    },
    _actDef(a) {
      const t = this.t; const base = { view: { text: t.view, className: 'bui-btn-ghost', icon: 'eye' }, edit: { text: t.edit, className: 'bui-btn-soft-primary', icon: 'edit' }, delete: { text: t.delete, className: 'bui-btn-soft-danger', icon: 'trash' }, duplicate: { text: t.duplicate, className: 'bui-btn-ghost', icon: 'copy' } };
      const o = typeof a === 'string' ? { name: a } : a; const b = base[o.name] || {}; const r = { className: 'bui-btn-outline', ...b, ...o, text: o.text || b.text || o.name }; if (this.o.actionIcons === false || (this.o.actionIcons === undefined && !this.o.buttonIcons && !o.icon)) { if (!o.icon) r.icon = null; } return r;
    },
    _findAct(name, row) { const walk = (list) => { for (const a of list) { const d = this._actDef(a); if (d.name === name) return d; if (d.menu) { const r = walk(d.menu); if (r) return r; } } return null; }; return walk(this._acts()); },
    async _runAction(name, row, btn) {
      if (name === 'menu') { const src = btn && btn.dataset.menuFor ? (this._findAct(btn.dataset.menuFor) || {}).menu : null; const box = el('div', 'bui-dtbl-menu'); (src || this._acts()).map((a) => this._actDef(a)).filter((a) => !a.visible || a.visible(row.data, row)).forEach((a) => { const it = el('button', 'bui-dtbl-menu-item' + (a.name === 'delete' ? ' is-danger' : ''), { type: 'button', role: 'menuitem' }, a.text); if (a.icon && (this.o.buttonIcons || this.o.actionIcons || a.icon)) it.prepend(icoSpan(a.icon)); it.addEventListener('click', () => { this._closePop(); this._runAction(a.name, row, it); }); box.appendChild(it); }); this._popover(btn, box, 'bui-dtbl-pop-menu'); return; }
      if (name === 'saveInline') return this._saveInline(); if (name === 'cancelInline') return this._cancelInline(); if (name === 'saveNew') return this._saveNew(); if (name === 'cancelNew') { this._creating = null; this._renderBody(true); return; }
      const def = this._findAct(name); const ev = { action: name, row: row.data, id: row.id }; this.emit('rowAction', ev);
      if (def && isFn(def.action)) return def.action(row.data, this, row, btn);
      if (name === 'view') return this._viewDialog(row); if (name === 'edit') return this.edit(row.id); if (name === 'delete') return this.delete(row.id);
      if (name === 'duplicate') { const copy = clone(row.data); const rid = this.o.rowId; if (typeof rid === 'string') { if (isObj(copy)) delete copy[rid]; } const ed = this._edCfg(); if (ed.enabled && isFn(ed.onCreate)) { try { await this._applyCommit(true, null, isObj(copy) ? Object.fromEntries(Object.entries(copy)) : copy); } catch (e) { this.toast((e && e.message) || this.t.saveFailed, 'error'); } } else { const r = this._addRow(copy, this._rows.indexOf(row) + 1); this._dirty(); this.emit('create', { row: copy, id: r.id, duplicate: true }); } }
    },
    async _viewDialog(row) {
      const v = isObj(this.o.view) ? this.o.view : null; let body; let title = this.t.details; let cls = '';
      if (v && isFn(v.render)) { const r = v.render(row.data, this, row); if (r instanceof Node) body = r; else { body = el('div', 'bui-dtbl-view'); body.innerHTML = String(r == null ? '' : r); } if (v.title) title = isFn(v.title) ? v.title(row.data, this, row) : v.title; cls = 'bui-dtbl-view-dlg' + (v.wide ? ' is-wide' : ''); }
      else { const dl = el('dl', 'bui-dtbl-details'); this._vis().forEach((c) => { const dt = el('dt'); dt.innerHTML = c.title; const dd = el('dd'); this._fillCell(dd, row, c); dl.append(dt, dd); }); body = dl; }
      this.emit('view', { row: row.data, id: row.id }); const ed = this._edCfg(); const btns = [];
      if (ed.enabled && ed.edit !== false && !(v && v.edit === false)) btns.push({ text: this.t.edit, className: 'bui-btn-soft-primary', value: 'edit' });
      btns.push({ text: this.t.close, className: 'bui-btn-primary', value: true });
      const r = await this._dialog({ title, body, cls, buttons: btns }); if (r === 'edit') this.edit(row.id); return r;
    },
    async _saveInline() {
      const e = this._edit; if (!e) return; const row = this._byId(e.id); const tr = this._node(row); const inputs = [...tr.querySelectorAll('[data-field]')]; const vals = this._collect(inputs, row.data, this._inlineErr); if (!vals) return;
      try { await this._applyCommit(false, row, vals); this._edit = null; this._renderBody(true); } catch (err) { this.toast((err && err.message) || this.t.saveFailed, 'error'); }
    },
    async _saveNew() {
      const tr = this.tbody.querySelector('.bui-dtbl-newrow'); if (!tr) return; const inputs = [...tr.querySelectorAll('[data-field]')]; const vals = this._collect(inputs, {}, this._inlineErr); if (!vals) return;
      try { await this._applyCommit(true, null, vals); this._creating = null; this._renderBody(true); } catch (err) { this.toast((err && err.message) || this.t.saveFailed, 'error'); }
    },
    _inlineErr(inp, m) { const e = doc.getElementById(inp.id + '-err'); if (e) { e.textContent = m || ''; e.hidden = !m; } inp.classList.toggle('is-invalid', !!m); m ? inp.setAttribute('aria-invalid', 'true') : inp.removeAttribute('aria-invalid'); },
    _cancelInline() { this._edit = null; this._renderBody(true); },
    async delete(ids) {
      const ed = this._edCfg(); const rows = toArr(ids).map((i) => this._byId(String(i))).filter(Boolean); if (!rows.length) return false;
      if (ed.enabled === false || ed.delete === false) return false;
      if (ed.confirmDelete !== false) { const ok = await this._dialog({ title: rows.length > 1 ? this.t.confirmBulk.replace('{n}', this.n(rows.length)) : this.t.confirmDelete, body: this.t.confirmDeleteText, cls: 'bui-dtbl-confirm', buttons: [{ text: this.t.cancel, value: false }, { text: this.t.delete, className: 'bui-btn-danger', value: true, autofocus: true }] }); if (!ok) return false; }
      try { const data = rows.map((r) => r.data); await this._commit('delete', rows.length === 1 ? data[0] : data, { ids: rows.map((r) => r.id), rows: data }); if (!this.o.serverSide) this.rows({ id: rows.map((r) => r.id) }).remove(); else rows.forEach((r) => this._sel.delete(r.id)); this.emit('delete', { rows: data, ids: rows.map((r) => r.id) }); return true; }
      catch (err) { this.toast((err && err.message) || this.t.saveFailed, 'error'); return false; }
    },
    _bulkDelete(rows) { return this.delete(rows.map((r) => r.id)); },
    async _bulkEdit(rows) {
      const fields = this._fields().filter((f) => f.bulk !== false); if (!fields.length || !rows.length) return; const body = el('div', 'bui-dtbl-form'); const sel = el('select', 'bui-input', { 'aria-label': this.t.bulkField }); fields.forEach((f, i) => sel.appendChild(el('option', '', { value: i }, f.label)));
      const holder = el('div', 'bui-field bui-dtbl-fld'); const errBox = el('div', 'bui-dtbl-fielderr', { role: 'alert', hidden: true }); let inp; const mk = () => { holder.textContent = ''; const f = { ...fields[Number(sel.value)], required: false }; inp = this._fieldInput(f, undefined, this.id + '-bulk'); holder.append(inp, errBox); }; sel.addEventListener('change', mk); mk();
      body.append(el('label', 'bui-dtbl-fl', {}, this.t.bulkField), sel, holder);
      return this._dialog({ title: this.t.bulkEditTitle.replace('{n}', this.n(rows.length)), body, buttons: [{ text: this.t.cancel, value: false }, { text: this.t.save, className: 'bui-btn-primary', keepOpen: true, onClick: async (e, finish, btn) => { const f = inp._f; const v = this._readField(inp); const m = this._validate(f, v, {}); if (m) { errBox.textContent = m; errBox.hidden = false; return false; } btn.disabled = true; try { for (const r of rows) await this._applyCommit(false, r, { [f.data]: v }); finish(true); } catch (err) { errBox.textContent = (err && err.message) || this.t.saveFailed; errBox.hidden = false; btn.disabled = false; } return false; } }] });
    },

    /* ----- AJAX and server-side processing ----- */
    _ajaxCfg() { let a = this.o.ajax; if (typeof a === 'string') a = this.o.ajax = { url: a }; return a || {}; },
    _buildParams() {
      const c = this._ajaxCfg(); const s = this.s; const style = c.paramStyle || 'rest'; const f = {}; Object.entries(s.filters).forEach(([i, v]) => { if (this._filterActive(v)) f[this._colKey(i)] = v; }); const cs = {}; Object.entries(s.colSearch).forEach(([i, v]) => { if (hasVal(v)) cs[this._colKey(i)] = v; });
      const len = s.len === -1 ? 0 : s.len; let p;
      if (style === 'datatables') { p = { draw: this._reqId + 1, start: s.page * len, length: s.len, search: { value: s.search, regex: false }, order: s.order.map(([i, d]) => ({ column: i, dir: d })), columns: this.cols.map((col) => ({ data: col.data, name: col.name || '', searchable: col.searchable, orderable: col.orderable, search: { value: s.colSearch[col.index] || '', regex: false } })) }; }
      else if (style === 'json') p = { page: s.page + 1, pageSize: s.len, search: s.search, order: s.order.map(([i, d]) => ({ column: this._colKey(i), dir: d })), filters: f, columnSearch: cs, filterLogic: s.fLogic };
      else { p = { page: s.page + 1, per_page: s.len === -1 ? 0 : s.len }; if (s.search) p.search = s.search; if (s.order.length) p.sort = s.order.map(([i, d]) => (d === 'desc' ? '-' : '') + this._colKey(i)).join(','); if (Object.keys(f).length) { p.filter = f; if (s.fLogic === 'or') p.filter_logic = 'or'; } if (Object.keys(cs).length) p.column_search = cs; }
      const extra = isFn(c.data) ? c.data(p, this) : c.data; if (isObj(extra)) Object.assign(p, extra); if (isFn(c.params)) { const r = c.params(p, this); if (isObj(r)) p = r; } return p;
    },
    async _fetchAll() {
      const c = this._ajaxCfg(); if (!c.url && !isFn(c.fetch)) return this._rows.map((r) => r.data);
      const style = c.paramStyle || 'rest'; const p = this._buildParams(); if (style === 'datatables') { p.start = 0; p.length = -1; } else if (style === 'json') { p.page = 1; p.pageSize = 0; } else { p.page = 1; p.per_page = 0; }
      const prev = this._req; this._req = typeof AbortController !== 'undefined' ? new AbortController() : { abort() {}, signal: undefined }; this._busy(true);
      try { const json = await this._fetchJson(c, p); return this._mapResponse(json, c).data; } finally { this._req = prev; this._busy(false); }
    },
    _colOptions(c) { const e = isObj(c.editor) ? c.editor.options : null; let o = c.options || c.filterOptions || e; if (!o && (c.filter === 'select' || c.filter === 'multiselect')) o = this._distinct(c); return o ? toArr(o).map((x) => (isObj(x) ? x : { value: x, label: x })) : null; },
    _colKey(i) { const c = this.cols[i]; return c ? (c.name || (typeof c.data === 'string' ? c.data : String(i))) : String(i); },
    _qs(o, prefix, out = []) { Object.entries(o).forEach(([k, v]) => { if (v === undefined || v === null) return; const key = prefix ? `${prefix}[${k}]` : k; if (isObj(v)) this._qs(v, key, out); else if (Array.isArray(v)) { if (v.every((x) => !isObj(x))) v.forEach((x) => out.push(encodeURIComponent(key + '[]') + '=' + encodeURIComponent(x))); else v.forEach((x, i) => this._qs(isObj(x) ? x : { v: x }, `${key}[${i}]`, out)); } else out.push(encodeURIComponent(key) + '=' + encodeURIComponent(v)); }); return out; },
    _mapResponse(json, c) {
      if (isFn(c.map)) return c.map(json, this); let data = c.dataSrc !== undefined ? (c.dataSrc === '' ? json : getPath(json, c.dataSrc)) : Array.isArray(json) ? json : json && json.data !== undefined ? json.data : json && json.rows;
      data = Array.isArray(data) ? data : []; const m = json && !Array.isArray(json) ? json : {}; const total = m.recordsTotal ?? m.total ?? (m.meta && (m.meta.total ?? m.meta.recordsTotal)) ?? m.count ?? data.length;
      const filtered = m.recordsFiltered ?? (m.meta && m.meta.filtered) ?? m.filtered ?? (m.meta && m.meta.total) ?? m.total ?? total; return { data, total, filtered };
    },
    async _fetchJson(c, params) {
      const method = String(c.method || 'GET').toUpperCase(); let url = isFn(c.url) ? c.url(this) : c.url; const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(isFn(c.headers) ? c.headers(this) : c.headers) };
      const meta = c.csrf !== false && doc.querySelector('meta[name="csrf-token"]'); if (meta && method !== 'GET' && !headers['X-CSRF-TOKEN']) headers['X-CSRF-TOKEN'] = meta.content;
      const init = { method, headers, credentials: c.credentials || 'same-origin', signal: this._req.signal };
      if (method === 'GET') { const q = this._qs(params).join('&'); if (q) url += (url.includes('?') ? '&' : '?') + q; } else { headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(params); }
      const res = await (isFn(c.fetch) ? c.fetch(url, init, this) : fetch(url, init)); if (res && res.ok === false) { const e = new Error('HTTP ' + res.status); e.status = res.status; e.response = res; throw e; }
      return res && isFn(res.json) ? res.json() : res;
    },
    _busy(on) { this.s.loading = on; this.wrap.classList.toggle('is-loading', on); this.overlay.hidden = !on; if (on) { this.overlay.textContent = ''; const sp = el('span', 'bui-dtbl-spin', { role: 'status', 'aria-label': this.t.processing }); this.overlay.append(sp, el('span', 'bui-dtbl-overlay-t', {}, this.t.processing)); } this.table.setAttribute('aria-busy', on ? 'true' : 'false'); },
    async _load() {
      const c = this._ajaxCfg(); if (!c.url && !isFn(c.fetch)) { this._process(); this._render(); return; } const id = ++this._reqId; this._req && this._req.abort(); this._req = typeof AbortController !== 'undefined' ? new AbortController() : { abort() {}, signal: undefined };
      this._busy(true); this.errBox.hidden = true; this.s.error = null; const params = this.o.serverSide ? this._buildParams() : (isFn(c.params) ? c.params({}, this) || {} : isObj(c.data) ? c.data : {});
      try {
        const json = await this._fetchJson(c, params); if (id !== this._reqId) return; this._json = json; const m = this._mapResponse(json, c); const s = this.s;
        const keep = new Set(this._sel.keys()); this._rows = []; this._idx = new Set(); this._typeCache = false; m.data.forEach((d) => this._addRow(d)); this._rows.forEach((r) => { if (keep.has(r.id)) this._sel.set(r.id, r); });
        s.total = Number(m.total) || 0; s.filtered = Number(m.filtered ?? m.total) || 0;
        if (this.o.serverSide) { const len = s.len === -1 ? s.filtered : s.len; s.start = s.page * len; s.end = s.start + this._rows.length; this._view = this._rows; this._filteredRows = this._rows; if (s.page > 0 && !this._rows.length && s.filtered > 0) { s.page = Math.max(0, Math.ceil(s.filtered / len) - 1); this._busy(false); return this._load(); } } else this._process();
        this._busy(false); this._render(); this.emit('ajaxLoad', { json, data: m.data, total: s.total, filtered: s.filtered }); return json;
      } catch (err) {
        if (id !== this._reqId || (err && err.name === 'AbortError')) return; this._busy(false); this.s.error = err; this.errBox.textContent = ''; this.errBox.append(el('span', '', {}, this.t.error + (err && err.status ? ' (' + err.status + ')' : '')), mkBtn(this.t.retry, 'bui-btn-outline', { 'data-retry': '1' })); this.errBox.hidden = false;
        this._rows = this.o.serverSide ? [] : this._rows; this._view = this.o.serverSide ? [] : this._view; if (this.o.serverSide) { this.s.filtered = 0; this._renderBody(); this._renderInfo(); this._renderPager(); } this.emit('ajaxError', { error: err, status: err && err.status });
      }
    },
    async _reload(cb, resetPaging, initial) {
      if (resetPaging) this.s.page = 0; const r = await this._load(); if (isFn(cb) && !this.s.error) cb.call(this, this._json); if (initial && this.s.error) { this._process(); this._render(); } return r;
    },
  });


  /* A real PDF for any script (Arabic, Chinese …): the table is drawn with the browser's own text engine on a canvas,
   * and each page is stored as a JPEG image inside a genuine PDF file. The text is therefore NOT selectable; for selectable
   * Arabic text register a PDF adapter (see the docs). Used automatically when the built-in text writer cannot encode a character. */
  async function buildPdfImage(ex, o) {
    const rtl = !!o.rtl; const landscape = o.orientation ? o.orientation === 'landscape' : ex.headers.length > 5; const PW = landscape ? 841.89 : 595.28; const PH = landscape ? 595.28 : 841.89; const K = 2; const M = 36 * K;
    const W = Math.round(PW * K); const H = Math.round(PH * K); const fs = (o.fontSize || 9) * K * 1.05; const lh = fs * 1.45; const pad = 5 * K; const family = '"Segoe UI", Tahoma, "Noto Naskh Arabic", "Noto Sans Arabic", Arial, system-ui, sans-serif';
    const mk = () => { const c = doc.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.direction = rtl ? 'rtl' : 'ltr'; x.textBaseline = 'alphabetic'; return [c, x]; };
    let [cv, cx] = mk(); const canvases = []; const usable = W - M * 2; const meas = (t, b) => { cx.font = `${b ? '700 ' : ''}${fs}px ${family}`; return cx.measureText(t).width; };
    const raw = ex.headers.map((h, i) => { let m = meas(String(h), true) + pad * 2; for (let k = 0; k < Math.min(ex.rows.length, 200); k++) m = Math.max(m, Math.min(meas(String(ex.rows[k][i] ?? ''), false) + pad * 2, 260 * K)); return m; });
    const tot = raw.reduce((a, b) => a + b, 0); const widths = raw.map((w) => (w / tot) * usable);
    const colX = (i) => { let x = widths.slice(0, i).reduce((a, b) => a + b, 0); return rtl ? W - M - x - widths[i] : M + x; };
    const wrapT = (text, width, b) => { const out = []; String(text ?? '').split(/\r?\n/).forEach((para) => { let line = ''; para.split(/(\s+)/).forEach((w) => { if (meas(line + w, b) <= width || !line) line += w; else { out.push(line.trim()); line = w.trimStart(); } }); out.push(line.trim()); }); return out.slice(0, 10); };
    const txt = (t, i, y, b, color) => { cx.font = `${b ? '700 ' : ''}${fs}px ${family}`; cx.fillStyle = color || '#20213a'; cx.textAlign = rtl ? 'right' : 'left'; cx.fillText(t, rtl ? colX(i) + widths[i] - pad : colX(i) + pad, y); };
    let y = M; const done = () => canvases.push(cv);
    const drawHead = () => { const h = lh + pad * 2; cx.fillStyle = '#6658e8'; cx.fillRect(M, y, usable, h); ex.headers.forEach((t, i) => txt(wrapT(t, widths[i] - pad * 2, true)[0] || '', i, y + pad + fs, true, '#fff')); y += h; };
    if (o.title) { cx.font = `700 ${fs * 1.6}px ${family}`; cx.fillStyle = '#20213a'; cx.textAlign = rtl ? 'right' : 'left'; cx.fillText(String(o.title), rtl ? W - M : M, y + fs * 1.4); y += fs * 2.6; }
    if (o.messageTop) { cx.font = `${fs}px ${family}`; cx.fillStyle = '#777b91'; cx.textAlign = rtl ? 'right' : 'left'; cx.fillText(String(o.messageTop), rtl ? W - M : M, y + fs); y += lh + 6; }
    drawHead();
    ex.rows.forEach((row, ri) => {
      const cells = row.map((v, i) => wrapT(v == null ? '' : String(v), widths[i] - pad * 2, false)); const h = Math.max(...cells.map((c) => c.length), 1) * lh + pad * 2;
      if (y + h > H - M - 20 * K) { done(); [cv, cx] = mk(); y = M; drawHead(); }
      if (ri % 2) { cx.fillStyle = '#f5f5fa'; cx.fillRect(M, y, usable, h); }
      cells.forEach((lines, i) => lines.forEach((l, k) => txt(l, i, y + pad + fs + k * lh, false)));
      y += h; cx.fillStyle = '#e1e3ed'; cx.fillRect(M, y - 1, usable, 1);
    });
    if (o.messageBottom) { cx.font = `${fs}px ${family}`; cx.fillStyle = '#777b91'; cx.textAlign = rtl ? 'right' : 'left'; cx.fillText(String(o.messageBottom), rtl ? W - M : M, y + lh + 6); }
    done();
    const jpgs = []; for (let i = 0; i < canvases.length; i++) {
      const c = canvases[i]; const x = c.getContext('2d'); x.direction = 'ltr'; x.font = `${fs * 0.8}px ${family}`; x.fillStyle = '#777b91'; x.textAlign = 'right'; x.fillText(`${i + 1} / ${canvases.length}`, W - M, H - M / 2); x.textAlign = 'left'; x.fillText(String(o.footerText || new Date().toISOString().slice(0, 10)), M, H - M / 2);
      const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.92)); if (!blob) return null; jpgs.push(new Uint8Array(await blob.arrayBuffer()));
    }
    const enc = new TextEncoder(); const chunks = []; let len = 0; const offs = []; const push = (d) => { const b = typeof d === 'string' ? enc.encode(d) : d; chunks.push(b); len += b.length; }; const obj = (n, head, stream) => { offs[n] = len; push(`${n} 0 obj\n${head}\n`); if (stream) { push('stream\n'); push(stream); push('\nendstream\n'); } push('endobj\n'); };
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'); const nP = jpgs.length; obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, `<< /Type /Pages /Kids [${jpgs.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] /Count ${nP} >>`);
    jpgs.forEach((j, i) => { const pg = 3 + i * 3; const content = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`; obj(pg, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 ${pg + 1} 0 R >> >> /Contents ${pg + 2} 0 R >>`); obj(pg + 1, `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.length} >>`, j); obj(pg + 2, `<< /Length ${content.length} >>`, content); });
    const info = 3 + nP * 3; obj(info, '<< /Producer (Baset UI DataTable) >>'); const xref = len; let t = `xref\n0 ${info + 1}\n0000000000 65535 f \n`; for (let i = 1; i <= info; i++) t += `${String(offs[i]).padStart(10, '0')} 00000 n \n`;
    push(t + `trailer\n<< /Size ${info + 1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`);
    const out = new Uint8Array(len); let p = 0; chunks.forEach((c) => { out.set(c, p); p += c.length; }); return new Blob([out], { type: 'application/pdf' });
  }

  /* ---------- Statics and auto-init ---------- */
  DataTable.version = VERSION; DataTable.locales = locales; DataTable.adapters = { pdf: null, excel: null }; DataTable.defaults = DEFAULTS; DataTable.get = (t) => { const n = typeof t === 'string' ? doc.querySelector(t) : t; return n ? instances.get(n) || null : null; };
  DataTable.buildXlsx = buildXlsx; DataTable.buildPdf = buildPdf; DataTable.zip = zip; DataTable.crc32 = crc32;
  DataTable.init = (root = doc) => [...root.querySelectorAll('table[data-bui-datatable]')].filter((t) => !instances.has(t)).map((t) => new DataTable(t));
  BUI.dataTable = make(DataTable);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => DataTable.init()); else DataTable.init();
})();
