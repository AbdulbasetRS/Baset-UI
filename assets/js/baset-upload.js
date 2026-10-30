/* Baset UI — File upload (optional, no dependencies)
 *
 * Turns a native file input into a drop zone with a file list or image grid, checks the files and, if you ask for it,
 * uploads them with progress and retry:
 *   <input type="file" name="files" accept=".pdf,image/*" multiple data-bui-upload data-bui-max-size="5MB">
 * The native <input type="file"> stays in the page and stays the source of truth: id, name, accept, multiple, required,
 * disabled, capture and form work as before. Only the files that passed the checks are in input.files, so only they are
 * sent with the form, and a file removed from the list is not sent. Choosing and uploading are different things:
 * a file is "uploaded" only after your server answered (data-bui-url or BUI.upload.configure). Needs baset-ui.css (section 19).
 *
 * Attributes (all optional)
 *   data-bui-upload                 enable
 *   accept · multiple · required · disabled · capture · form     native
 *   data-bui-max-size="5MB"         largest file (bytes, or 500KB · 5MB · 1.5GB)
 *   data-bui-min-size="10KB"        smallest file
 *   data-bui-max-files="6"          most files (multiple)
 *   data-bui-min-files="2"          fewest files, checked by form validation
 *   data-bui-variant="dropzone|compact|button|avatar"     look (default dropzone); avatar = one round or square profile photo
 *   data-bui-shape="circle|square"  shape of the avatar variant (default circle)
 *   data-bui-layout="list|grid"     files as rows or as a grid of thumbnails
 *   data-bui-size="sm|lg"           size
 *   data-bui-title · data-bui-hint  your own texts for the zone
 *   data-bui-locale="ar"            language of the texts (default: nearest lang)
 *   data-bui-url="/upload"          upload to the server (one request per file) · data-bui-method · data-bui-field
 *   data-bui-auto                   start uploading as soon as files are chosen
 *   data-bui-no-preview             no image thumbnails
 *
 * JavaScript: BUI.upload.init(root) · configure(input, options) · files(input) · add(input, files) · remove(input, file)
 *             clear(input) · upload(input) · retry(input, file) · validate(input) · locales
 * Events on the input: bui:upload-add · -reject · -remove · -start · -progress · -success · -error · -complete
 */
(() => {
  'use strict';
  const BUI = (window.BUI = window.BUI || {});
  if (BUI.upload) return;

  const SELECTOR = 'input[type="file"][data-bui-upload]';
  const canAssign = (() => { try { return !!new DataTransfer().files; } catch { return false; } })(); // needed to remove a file from the input

  /* ---------- Texts: add a language with BUI.upload.locales.fr = { ... } (missing keys fall back to English) ---------- */
  const locales = {
    en: {
      title1: 'Drag a file here or click to choose', titleN: 'Drag files here or click to choose', choose1: 'Choose file', chooseN: 'Choose files', photo: 'Choose photo', removePhoto: 'Remove photo',
      upTo: 'up to {size}', atLeast: 'at least {size}', maxFiles: 'max {n} files', minFiles: 'min {n} files', anyType: 'Any file type',
      type: '"{name}" is not an allowed file type. Allowed: {types}.', maxSize: '"{name}" is too large ({size}). The maximum is {max}.',
      minSize: '"{name}" is too small ({size}). The minimum is {min}.', tooMany: 'You can add up to {n} files.', onlyOne: 'Only one file can be added.',
      duplicate: '"{name}" is already in the list.', needMin: 'Choose at least {n} files.', required: 'Choose a file.',
      rejected: '{n} not added', added: '{n} selected', ready: 'Ready to upload', uploading: 'Uploading {p}%', done: 'Uploaded', failed: 'Upload failed', network: 'Network error',
      retry: 'Retry', remove: 'Remove {name}', dismiss: 'Dismiss {name}', clear: 'Clear all', upload: 'Upload', uploadN: 'Upload {n} files', cancel: 'Cancel',
      list: 'Selected files', allDone: 'All files uploaded', units: ['B', 'KB', 'MB', 'GB', 'TB'], and: ', ',
    },
    ar: {
      title1: 'اسحب الملف هنا أو اضغط للاختيار', titleN: 'اسحب الملفات هنا أو اضغط للاختيار', choose1: 'اختيار ملف', chooseN: 'اختيار ملفات', photo: 'اختيار صورة', removePhoto: 'حذف الصورة',
      upTo: 'حتى {size}', atLeast: 'لا يقل عن {size}', maxFiles: 'بحد أقصى {n} ملفات', minFiles: 'بحد أدنى {n} ملفات', anyType: 'أي نوع ملف',
      type: 'الملف "{name}" من نوع غير مسموح. المسموح: {types}.', maxSize: 'الملف "{name}" كبير جدًا ({size}). الحد الأقصى {max}.',
      minSize: 'الملف "{name}" صغير جدًا ({size}). الحد الأدنى {min}.', tooMany: 'يمكنك إضافة {n} ملفات كحد أقصى.', onlyOne: 'يمكن إضافة ملف واحد فقط.',
      duplicate: 'الملف "{name}" مضاف بالفعل.', needMin: 'اختر {n} ملفات على الأقل.', required: 'اختر ملفًا.',
      rejected: 'لم يُضَف {n}', added: 'تم اختيار {n}', ready: 'جاهز للرفع', uploading: 'جارٍ الرفع {p}%', done: 'تم الرفع', failed: 'فشل الرفع', network: 'خطأ في الشبكة',
      retry: 'إعادة المحاولة', remove: 'إزالة {name}', dismiss: 'إخفاء {name}', clear: 'مسح الكل', upload: 'رفع', uploadN: 'رفع {n} ملفات', cancel: 'إلغاء',
      list: 'الملفات المختارة', allDone: 'تم رفع كل الملفات', units: ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب'], and: '، ',
    },
  };
  const sub = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '');
  const localeOf = (input) => input.dataset.buiLocale || input.closest('[lang]')?.getAttribute('lang') || navigator.language || 'en';
  const labelsFor = (loc) => ({ ...locales.en, ...(locales[loc.split('-')[0].toLowerCase()] || {}) });

  /* ---------- Sizes, names, types ---------- */
  const parseSize = (v) => {
    if (v == null || v === '') return null;
    const m = /^\s*([\d.]+)\s*([kmgt]?)b?\s*$/i.exec(String(v));
    if (!m) return null;
    return Math.round(parseFloat(m[1]) * 1024 ** ('kmgt'.indexOf(m[2].toLowerCase()) + 1));
  };
  const formatSize = (n, loc, units) => {
    let i = 0, v = n;
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
    let nf; try { nf = new Intl.NumberFormat(loc, { maximumFractionDigits: v < 10 && i ? 1 : 0 }); } catch { nf = new Intl.NumberFormat('en', { maximumFractionDigits: v < 10 && i ? 1 : 0 }); }
    return `${nf.format(v)} ${units[i]}`;
  };
  const splitName = (name) => { const i = name.lastIndexOf('.'); return i > 0 && i < name.length - 1 ? { base: name.slice(0, i), ext: name.slice(i + 1) } : { base: name, ext: '' }; };
  const KINDS = {
    image: /^(png|jpe?g|gif|webp|svg|avif|bmp|ico|heic|tiff?)$/, pdf: /^pdf$/, doc: /^(docx?|odt|rtf|txt|md|pages)$/, sheet: /^(xlsx?|csv|ods|numbers|tsv)$/,
    slide: /^(pptx?|odp|key)$/, archive: /^(zip|rar|7z|tar|gz|tgz|bz2)$/, audio: /^(mp3|wav|ogg|m4a|flac|aac|opus)$/, video: /^(mp4|mov|webm|mkv|avi|m4v)$/,
  };
  const kindOf = (file) => {
    const t = file.type || '', ext = splitName(file.name).ext.toLowerCase();
    if (t.startsWith('image/')) return 'image'; if (t.startsWith('audio/')) return 'audio'; if (t.startsWith('video/')) return 'video'; if (t === 'application/pdf') return 'pdf';
    for (const k of Object.keys(KINDS)) if (KINDS[k].test(ext)) return k;
    return 'file';
  };
  const acceptTokens = (input) => (input.getAttribute('accept') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const accepts = (file, tokens) => !tokens.length || tokens.some((t) => {
    const type = (file.type || '').toLowerCase(), name = file.name.toLowerCase();
    if (t.startsWith('.')) return name.endsWith(t);
    if (t.endsWith('/*')) return type.startsWith(t.slice(0, -1));
    return type === t;
  });
  const typeLabel = (t) => (t.startsWith('.') ? t.slice(1).toUpperCase() : t.endsWith('/*') ? t.slice(0, -2) : t.split('/').pop().replace(/^x-/, '').toUpperCase());
  const same = (a, b) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

  /* ---------- State ---------- */
  const states = new WeakMap();
  let uid = 0;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const btn = (cls, act, label, text) => { const b = el('button', cls, text); b.type = 'button'; if (act) b.dataset.act = act; if (label) b.setAttribute('aria-label', label); return b; };
  const emit = (st, name, detail) => st.input.dispatchEvent(new CustomEvent(`bui:upload-${name}`, { bubbles: true, detail }));
  const fire = (st) => { st.syncing = true; try { st.input.dispatchEvent(new Event('input', { bubbles: true })); st.input.dispatchEvent(new Event('change', { bubbles: true })); } finally { st.syncing = false; } }; // our own change event must not be read as a new selection
  const accepted = (st) => st.entries.filter((e) => e.status !== 'rejected');

  function settings(st) {
    const i = st.input, d = i.dataset, loc = localeOf(i), T = labelsFor(loc);
    return {
      loc, T, multiple: i.multiple, tokens: acceptTokens(i), maxSize: parseSize(d.buiMaxSize), minSize: parseSize(d.buiMinSize),
      maxFiles: i.multiple ? parseInt(d.buiMaxFiles, 10) || Infinity : 1, minFiles: parseInt(d.buiMinFiles, 10) || 0,
      layout: d.buiLayout === 'grid' ? 'grid' : 'list', variant: ['compact', 'button', 'avatar'].includes(d.buiVariant) ? d.buiVariant : 'dropzone', shape: d.buiShape === 'square' ? 'square' : 'circle', size: ['sm', 'lg'].includes(d.buiSize) ? d.buiSize : '',
      preview: !i.hasAttribute('data-bui-no-preview'),
    };
  }
  const uploader = (st) => st.cfg.uploader || (st.input.dataset.buiUrl || st.cfg.url ? xhrUploader(st) : null);

  /* ---------- Adding files ---------- */
  function check(st, S, file, list) {
    const { T } = S, name = file.name;
    if (list.some((e) => e.status !== 'rejected' && same(e.file, file))) return sub(T.duplicate, { name });
    if (!accepts(file, S.tokens)) return sub(T.type, { name, types: S.tokens.map(typeLabel).join(T.and) });
    if (S.maxSize !== null && file.size > S.maxSize) return sub(T.maxSize, { name, size: formatSize(file.size, S.loc, T.units), max: formatSize(S.maxSize, S.loc, T.units) });
    if (S.minSize !== null && file.size < S.minSize) return sub(T.minSize, { name, size: formatSize(file.size, S.loc, T.units), min: formatSize(S.minSize, S.loc, T.units) });
    return '';
  }

  function addFiles(st, incoming, native) {
    const S = settings(st);
    incoming = [...incoming];
    if (!incoming.length) { sync(st); return []; } // the dialog was cancelled: keep what we had
    st.entries = st.entries.filter((e) => { if (e.status === 'rejected') return false; return true; }); // old errors go away
    const addedNow = [], rejected = [];
    if (!S.multiple) {
      if (incoming.length > 1) incoming.slice(1).forEach((file) => rejected.push({ file, reason: 'onlyOne', message: S.T.onlyOne }));
      incoming = incoming.slice(0, 1);
      if (incoming.length && accepted(st).length && !check(st, S, incoming[0], [])) drop(st, accepted(st)); // a new valid file replaces the old one
    }
    for (const file of incoming) {
      const list = [...st.entries, ...addedNow.map((file) => ({ file }))];
      let message = check(st, S, file, list), reason = message ? 'invalid' : '';
      if (!message && accepted(st).length + addedNow.length >= S.maxFiles) { message = sub(S.T.tooMany, { n: S.maxFiles }); reason = 'maxFiles'; }
      if (message) rejected.push({ file, reason: reason === 'invalid' ? ruleOf(st, S, file, list) : reason, message });
      else addedNow.push(newEntry(st, S, file));
    }
    st.entries.push(...addedNow);
    rejected.forEach((r) => st.entries.push({ id: ++uid, file: r.file, status: 'rejected', error: r.message, reason: r.reason, progress: 0 }));
    st.showRequired = false;
    sync(st);
    if (!native && addedNow.length) fire(st);
    if (addedNow.length) emit(st, 'add', { files: addedNow.map((e) => e.file) });
    if (rejected.length) emit(st, 'reject', { rejected: rejected.map(({ file, reason, message }) => ({ file, reason, message })) });
    render(st); validity(st);
    if (addedNow.length && st.input.hasAttribute('data-bui-auto') && uploader(st)) upload(st);
    return addedNow.map((e) => e.file);
  }
  function ruleOf(st, S, file, list) { // which rule failed, for event listeners
    if (list.some((e) => e.status !== 'rejected' && same(e.file, file))) return 'duplicate';
    if (!accepts(file, S.tokens)) return 'type';
    if (S.maxSize !== null && file.size > S.maxSize) return 'maxSize';
    return 'minSize';
  }
  function newEntry(st, S, file) {
    const e = { id: ++uid, file, status: 'selected', progress: 0, error: '', url: null, kind: kindOf(file) };
    if (S.preview && e.kind === 'image') { try { e.url = URL.createObjectURL(file); } catch { /* no preview */ } }
    return e;
  }
  function drop(st, entries) { entries.forEach((e) => { e.ctrl?.abort(); if (e.url) URL.revokeObjectURL(e.url); }); st.entries = st.entries.filter((e) => !entries.includes(e)); }

  function sync(st) { // the input holds exactly the files that passed the checks
    if (!canAssign) return;
    const dt = new DataTransfer();
    accepted(st).forEach((e) => dt.items.add(e.file));
    st.syncing = true; st.input.files = dt.files; st.syncing = false;
  }

  function removeEntry(st, entry) {
    const was = entry.status !== 'rejected';
    drop(st, [entry]); sync(st);
    if (was) { fire(st); emit(st, 'remove', { file: entry.file }); }
    render(st); validity(st);
  }
  function clear(st) {
    const had = accepted(st).length > 0;
    drop(st, [...st.entries]); sync(st); st.showRequired = false;
    if (had) fire(st);
    emit(st, 'remove', { file: null });
    render(st); validity(st);
  }

  function validity(st) {
    const S = settings(st), n = accepted(st).length;
    st.input.setCustomValidity(n > 0 && n < S.minFiles ? sub(S.T.needMin, { n: S.minFiles }) : '');
    const bad = st.entries.some((e) => e.status === 'rejected') || !st.input.validity.valid && (st.showRequired || (n > 0 && n < S.minFiles));
    st.input.setAttribute('aria-invalid', String(!!bad));
    st.wrap.classList.toggle('is-invalid', !!bad);
  }

  /* ---------- Uploading (only when your server is involved) ---------- */
  function xhrUploader(st) {
    return (file, { signal, onProgress }) => new Promise((resolve, reject) => {
      const i = st.input, c = st.cfg, T = labelsFor(localeOf(i));
      const fd = new FormData();
      Object.entries(c.data || {}).forEach(([k, v]) => fd.append(k, v));
      fd.append(c.field || i.dataset.buiField || i.name || 'file', file, file.name);
      const x = new XMLHttpRequest();
      x.open((c.method || i.dataset.buiMethod || 'POST').toUpperCase(), c.url || i.dataset.buiUrl);
      Object.entries(c.headers || {}).forEach(([k, v]) => x.setRequestHeader(k, v));
      x.withCredentials = !!c.withCredentials;
      x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
      x.onload = () => {
        if (x.status >= 200 && x.status < 300) { let r = x.responseText; try { r = JSON.parse(r); } catch { /* plain text */ } resolve(r); }
        else reject(new Error(`${x.status} ${x.statusText}`.trim()));
      };
      x.onerror = () => reject(new Error(T.network));
      x.onabort = () => reject(new DOMException('Aborted', 'AbortError'));
      signal.addEventListener('abort', () => x.abort());
      x.send(fd);
    });
  }

  async function uploadEntry(st, e, send) {
    e.status = 'uploading'; e.progress = 0; e.error = ''; e.ctrl = new AbortController();
    emit(st, 'start', { file: e.file }); render(st);
    try {
      const res = await send(e.file, { signal: e.ctrl.signal, input: st.input, onProgress: (p) => { e.progress = Math.max(0, Math.min(1, p)); paint(st, e); emit(st, 'progress', { file: e.file, progress: e.progress }); } });
      e.status = 'done'; e.progress = 1; e.response = res; e.ctrl = null;
      emit(st, 'success', { file: e.file, response: res });
    } catch (err) {
      if (e.ctrl?.signal.aborted || !st.entries.includes(e)) return; // removed or cancelled
      e.status = 'error'; e.error = (err && err.message) || ''; e.ctrl = null;
      emit(st, 'error', { file: e.file, error: err });
    }
    render(st);
  }
  async function upload(st, only) {
    const send = uploader(st);
    if (!send) return [];
    const todo = (only ? [only] : st.entries).filter((e) => e.status === 'selected' || e.status === 'error');
    const queue = [...todo], limit = Math.max(1, parseInt(st.input.dataset.buiParallel, 10) || 3);
    await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, async () => { while (queue.length) await uploadEntry(st, queue.shift(), send); }));
    const list = accepted(st);
    if (todo.length && list.length && list.every((e) => e.status === 'done')) emit(st, 'complete', { files: list.map((e) => e.file) });
    return todo.map((e) => e.status);
  }

  /* ---------- Drawing ---------- */
  function itemStatus(st, S, e) {
    const T = S.T, size = formatSize(e.file.size, S.loc, T.units);
    if (e.status === 'rejected') return { text: e.error, cls: 'is-error' };
    if (e.status === 'uploading') return { text: `${size} · ${sub(T.uploading, { p: Math.round(e.progress * 100) })}`, cls: '' };
    if (e.status === 'done') return { text: `${size} · ${T.done}`, cls: 'is-success' };
    if (e.status === 'error') return { text: `${size} · ${T.failed}${e.error ? ` (${e.error})` : ''}`, cls: 'is-error' };
    return { text: uploader(st) ? `${size} · ${T.ready}` : size, cls: '' };
  }
  function paint(st, e) { // progress changes update in place, so the list is not rebuilt on every tick
    const li = st.list.querySelector(`[data-id="${e.id}"]`); if (!li) return;
    const S = settings(st);
    li.querySelector('.bui-upload-meta').textContent = itemStatus(st, S, e).text;
    const bar = li.querySelector('.bui-upload-bar'); if (bar) { bar.firstChild.style.width = `${Math.round(e.progress * 100)}%`; bar.setAttribute('aria-valuenow', String(Math.round(e.progress * 100))); }
  }

  function itemEl(st, S, e) {
    const T = S.T, { base, ext } = splitName(e.file.name), kind = e.kind || kindOf(e.file), status = itemStatus(st, S, e);
    const li = el('li', `bui-upload-item ${e.status === 'rejected' ? 'is-rejected' : `is-${e.status}`}`); li.dataset.id = e.id; li.dataset.kind = kind;
    const thumb = el('span', 'bui-upload-thumb'); thumb.setAttribute('aria-hidden', 'true');
    if (e.url && e.status !== 'rejected') {
      const img = el('img'); img.src = e.url; img.alt = ''; img.loading = 'lazy'; img.onerror = () => { img.remove(); thumb.append(el('span', 'bui-upload-ext', (ext || '?').slice(0, 4).toUpperCase())); };
      thumb.append(img); thumb.classList.add('has-image');
    } else thumb.append(el('span', 'bui-upload-ext', (ext || '?').slice(0, 4).toUpperCase()));
    const body = el('span', 'bui-upload-body');
    const name = el('span', 'bui-upload-name'); name.title = e.file.name; name.append(el('span', 'bui-upload-base', base)); if (ext) name.append(el('span', 'bui-upload-dotext', `.${ext}`));
    const meta = el('span', `bui-upload-meta ${status.cls}`, status.text); if (e.status === 'rejected') meta.setAttribute('role', 'alert');
    body.append(name, meta);
    if (e.status === 'uploading') {
      const bar = el('span', 'bui-upload-bar'); bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-label', e.file.name); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', '100'); bar.setAttribute('aria-valuenow', String(Math.round(e.progress * 100)));
      const fill = el('span'); fill.style.width = `${Math.round(e.progress * 100)}%`; bar.append(fill); body.append(bar);
    }
    const acts = el('span', 'bui-upload-actions-item');
    if (e.status === 'error') acts.append(btn('bui-upload-icon-btn bui-upload-retry', 'retry', `${T.retry}: ${e.file.name}`));
    if (e.status === 'uploading') acts.append(btn('bui-upload-icon-btn bui-upload-remove', 'remove', `${T.cancel}: ${e.file.name}`));
    else if (e.status === 'rejected') acts.append(btn('bui-upload-icon-btn bui-upload-remove', 'remove', sub(T.dismiss, { name: e.file.name })));
    else if (canAssign || e.status === 'selected') acts.append(btn('bui-upload-icon-btn bui-upload-remove', 'remove', sub(T.remove, { name: e.file.name })));
    li.append(thumb, body, acts);
    return li;
  }

  function render(st) {
    const S = settings(st), { T } = S, i = st.input, list = accepted(st), all = st.entries;
    const w = st.wrap;
    w.dataset.variant = S.variant; w.dataset.layout = S.layout; if (S.variant === 'avatar') w.dataset.shape = S.shape; else delete w.dataset.shape; if (S.size) w.dataset.size = S.size; else delete w.dataset.size;
    w.classList.toggle('has-files', all.length > 0);
    w.classList.toggle('is-disabled', i.disabled);
    const busy = list.some((e) => e.status === 'uploading');
    w.dataset.state = busy ? 'uploading' : list.length && list.every((e) => e.status === 'done') && uploader(st) ? 'done' : list.some((e) => e.status === 'error') ? 'error' : list.length ? 'selected' : 'idle';
    // zone texts
    st.title.textContent = i.dataset.buiTitle || (S.variant === 'avatar' ? T.photo : S.variant === 'dropzone' ? (S.multiple ? T.titleN : T.title1) : (S.multiple ? T.chooseN : T.choose1));
    const hint = i.dataset.buiHint ?? [
      S.tokens.length ? S.tokens.map(typeLabel).join(', ') : '',
      S.minSize !== null ? sub(T.atLeast, { size: formatSize(S.minSize, S.loc, T.units) }) : '',
      S.maxSize !== null ? sub(T.upTo, { size: formatSize(S.maxSize, S.loc, T.units) }) : '',
      S.multiple && Number.isFinite(S.maxFiles) ? sub(T.maxFiles, { n: S.maxFiles }) : '',
      S.multiple && S.minFiles ? sub(T.minFiles, { n: S.minFiles }) : '',
    ].filter(Boolean).join(' · ');
    st.hint.textContent = hint; st.hint.hidden = !hint;
    // avatar: the chosen picture fills the round / square zone (the list is hidden by CSS)
    const first = list.find((e) => e.url);
    if (S.variant === 'avatar' && first) { if (st.avatar.getAttribute('src') !== first.url) st.avatar.src = first.url; st.avatar.hidden = false; w.classList.add('has-avatar'); }
    else { st.avatar.hidden = true; st.avatar.removeAttribute('src'); w.classList.remove('has-avatar'); }
    // list
    st.list.replaceChildren(...all.map((e) => itemEl(st, S, e)));
    st.list.hidden = !all.length; st.list.setAttribute('aria-label', T.list);
    // summary message (live region)
    const rejected = all.filter((e) => e.status === 'rejected').length;
    let msg = '', cls = '';
    if (st.showRequired && !list.length) { msg = T.required; cls = 'is-error'; }
    else if (list.length && list.length < S.minFiles) { msg = sub(T.needMin, { n: S.minFiles }); cls = 'is-error'; }
    else if (rejected) { msg = S.variant === 'avatar' ? all.find((e) => e.status === 'rejected').error : sub(T.rejected, { n: rejected }); cls = 'is-error'; } // the avatar has no list, so the message says why
    else if (w.dataset.state === 'done') { msg = T.allDone; cls = 'is-success'; }
    st.msg.textContent = msg; st.msg.className = `bui-upload-msg ${cls}`; st.msg.hidden = !msg;
    // toolbar
    st.bar.replaceChildren();
    const todo = all.filter((e) => e.status === 'selected' || e.status === 'error').length;
    if (uploader(st) && !i.hasAttribute('data-bui-auto') && todo) { const b = btn('bui-btn bui-btn-primary bui-btn-sm', 'upload', null, todo > 1 ? sub(T.uploadN, { n: todo }) : T.upload); b.disabled = busy || i.disabled; st.bar.append(b); }
    if (S.variant === 'avatar') { if (list.length) st.bar.append(btn('bui-btn bui-btn-outline bui-btn-sm', 'clear', null, T.removePhoto)); }
    else if (list.length > 1 || (list.length && uploader(st)) || rejected) st.bar.append(btn('bui-btn bui-btn-outline bui-btn-sm', 'clear', null, T.clear));
    st.bar.hidden = !st.bar.childElementCount;
  }

  /* ---------- Events ---------- */
  function onClick(st, e) {
    const b = e.target.closest('button[data-act]'); if (!b || !st.wrap.contains(b)) return;
    const li = b.closest('.bui-upload-item'), entry = li && st.entries.find((x) => String(x.id) === li.dataset.id);
    const act = b.dataset.act;
    if (act === 'remove' && entry) { removeEntry(st, entry); (st.list.querySelector('.bui-upload-remove') || st.input).focus(); }
    else if (act === 'retry' && entry) upload(st, entry);
    else if (act === 'upload') upload(st);
    else if (act === 'clear') { clear(st); st.input.focus(); }
  }

  function hasFiles(e) { return [...(e.dataTransfer?.types || [])].includes('Files'); }
  function enhance(input) {
    if (states.has(input) || !(input instanceof HTMLInputElement) || input.type !== 'file') return;
    const id = input.id || (input.id = `bui-upload-${++uid}`);
    const wrap = el('div', 'bui-upload');
    const zone = el('label', 'bui-upload-zone'); zone.htmlFor = id;
    const icon = el('span', 'bui-upload-icon'); icon.setAttribute('aria-hidden', 'true');
    const text = el('span', 'bui-upload-text'), title = el('span', 'bui-upload-title'), hint = el('span', 'bui-upload-hint');
    hint.id = `${id}-hint`; text.append(title, hint);
    const avatar = el('img', 'bui-upload-avatar'); avatar.alt = ''; avatar.hidden = true;
    input.before(wrap); input.classList.add('bui-upload-input'); zone.append(input, avatar, icon, text);
    const list = el('ul', 'bui-upload-list'), msg = el('div', 'bui-upload-msg'), bar = el('div', 'bui-upload-toolbar');
    msg.id = `${id}-msg`; msg.setAttribute('role', 'status'); msg.setAttribute('aria-live', 'polite');
    wrap.append(zone, msg, list, bar);
    input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), hint.id, msg.id].filter(Boolean).join(' '));
    const st = { input, wrap, zone, avatar, title, hint, list, msg, bar, entries: [], cfg: {}, depth: 0, showRequired: false };
    states.set(input, st);

    input.addEventListener('change', () => { if (st.syncing) return; addFiles(st, input.files, true); });
    input.addEventListener('invalid', () => { st.showRequired = !accepted(st).length; render(st); validity(st); });
    wrap.addEventListener('click', (e) => onClick(st, e));
    zone.addEventListener('dragenter', (e) => { if (input.disabled || !hasFiles(e)) return; e.preventDefault(); st.depth++; wrap.classList.add('is-dragover'); });
    zone.addEventListener('dragover', (e) => { if (input.disabled || !hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; wrap.classList.add('is-dragover'); });
    zone.addEventListener('dragleave', () => { st.depth = Math.max(0, st.depth - 1); if (!st.depth) wrap.classList.remove('is-dragover'); });
    zone.addEventListener('drop', (e) => { if (!hasFiles(e)) return; e.preventDefault(); st.depth = 0; wrap.classList.remove('is-dragover'); if (!input.disabled) addFiles(st, e.dataTransfer.files, false); });
    input.form?.addEventListener('reset', () => setTimeout(() => { drop(st, [...st.entries]); st.showRequired = false; render(st); validity(st); }));
    if (typeof MutationObserver === 'function') new MutationObserver(() => render(st)).observe(input, { attributes: true, attributeFilter: ['disabled', 'accept', 'multiple', 'data-bui-max-size', 'data-bui-min-size', 'data-bui-max-files', 'data-bui-min-files', 'data-bui-layout', 'data-bui-variant', 'data-bui-shape', 'data-bui-size'] });
    if (input.files.length) addFiles(st, input.files, true); else render(st);
  }

  // Works even before the page finished loading: an input that is not set up yet is set up on first use.
  const get = (t) => { const i = typeof t === 'string' ? document.querySelector(t) : t; if (i && !states.has(i) && i.matches?.(SELECTOR)) enhance(i); return i && states.get(i); };
  function init(root = document) {
    if (root.matches?.(SELECTOR)) enhance(root);
    root.querySelectorAll?.(SELECTOR).forEach(enhance);
  }

  BUI.upload = {
    init, locales,
    configure(t, options = {}) { const st = get(t); if (st) { Object.assign(st.cfg, options); render(st); } }, // { url, method, field, data, headers, withCredentials, uploader(file, { onProgress, signal }) }
    files: (t) => { const st = get(t); return st ? accepted(st).map((e) => e.file) : []; },
    add: (t, files) => { const st = get(t); return st ? addFiles(st, files, false) : []; },
    remove(t, file) { const st = get(t); const e = st && st.entries.find((x) => x.file === file); if (e) removeEntry(st, e); },
    clear(t) { const st = get(t); if (st) clear(st); },
    upload: (t) => { const st = get(t); return st ? upload(st) : Promise.resolve([]); },
    retry(t, file) { const st = get(t); const e = st && st.entries.find((x) => x.file === file); return e ? upload(st, e) : Promise.resolve([]); },
    validate: (t) => { const st = get(t); if (!st) return true; st.showRequired = !accepted(st).length; validity(st); render(st); return st.input.reportValidity(); },
  };

  const start = () => {
    init(document);
    if (typeof MutationObserver === 'function') new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) init(n); }))).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
