/* Baset UI — Component playground configs (documentation only)
 * One entry per component page. Each config has: controls (what the panel shows), html(s) (markup to copy and, unless
 * preview(s) is given, the live preview), js(s) (optional script to copy), mount(stage, s) (starts the library on the
 * preview) and note. `s` is the current state of the controls. Loaded after component-playground.js. */
(() => {
  'use strict';
  const PG = window.BUIPlayground;
  if (!PG) return;

  /* ---------- Helpers ---------- */
  const cls = (...a) => a.flat().filter(Boolean).join(' ');
  const q = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const attrs = (o) => Object.entries(o).filter(([, v]) => v !== false && v != null && v !== '').map(([k, v]) => (v === true ? k : `${k}="${q(v)}"`)).join(' ');
  const tagOf = (name, o, inner) => `<${name}${Object.keys(o).length && attrs(o) ? ' ' + attrs(o) : ''}>${inner}</${name}>`;
  const ico = (n, style = 'light') => `<i class="bui-icon-${style} bui-icon-${n}"></i>`;
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const isoT = (d) => `${iso(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  const yes = [['', 'Default']];
  const COLORS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'inverse'];
  const TYPES = ['primary', 'success', 'info', 'warning', 'danger'];
  const ICONS = ['plus', 'arrow-right', 'download', 'check', 'heart', 'star', 'bell', 'gear', 'user', 'house', 'magnifying-glass', 'trash', 'envelope', 'camera', 'lock', 'globe', 'calendar', 'chat-circle', 'bookmark', 'shield-check', 'rocket-launch', 'lightning', 'cloud', 'pencil-simple'];

  /* JavaScript literal printer: single quotes, bare keys, short objects on one line */
  const lit = (v, ind = '') => {
    if (Array.isArray(v)) {
      const inline = `[${v.map((x) => lit(x)).join(', ')}]`;
      if (inline.length <= 70 && !inline.includes('\n')) return inline;
      return `[\n${v.map((x) => `${ind}  ${lit(x, ind + '  ')}`).join(',\n')}\n${ind}]`;
    }
    if (v && typeof v === 'object') {
      const e = Object.entries(v);
      if (!e.length) return '{}';
      const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`);
      const inline = `{ ${e.map(([k, x]) => `${key(k)}: ${lit(x)}`).join(', ')} }`;
      if (inline.length <= 76 && !inline.includes('\n')) return inline;
      return `{\n${e.map(([k, x]) => `${ind}  ${key(k)}: ${lit(x, ind + '  ')}`).join(',\n')}\n${ind}}`;
    }
    if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    return String(v);
  };

  /* ============================== Buttons ============================== */
  PG.add('buttons', {
    controls: [
      { k: 'style', t: 'tabs', label: 'Style', group: 'Look', v: 'solid', opts: [['solid', 'Solid'], ['outline', 'Outline'], ['soft', 'Soft'], ['link', 'Link'], ['light', 'Light'], ['neutral', 'Neutral'], ['ghost', 'Ghost']] },
      { k: 'color', t: 'select', label: 'Color', group: 'Look', v: 'primary', opts: COLORS, show: (s) => ['solid', 'outline', 'soft', 'link'].includes(s.style) },
      { k: 'size', t: 'tabs', label: 'Size', group: 'Look', v: 'md', opts: [['sm', 'Small'], ['md', 'Default'], ['lg', 'Large']] },
      { k: 'shape', t: 'tabs', label: 'Shape', group: 'Look', v: '', opts: [['', 'Rounded'], ['pill', 'Pill']] },
      { k: 'label', t: 'text', label: 'Label', group: 'Content', v: 'Save changes' },
      { k: 'icon', t: 'select', label: 'Icon', group: 'Content', v: '', opts: [['', 'None'], ...ICONS.slice(0, 12)] },
      { k: 'iconEnd', t: 'check', label: 'Icon after text', group: 'Content', v: false, show: (s) => s.icon && !s.iconOnly },
      { k: 'iconOnly', t: 'check', label: 'Icon only', group: 'Content', v: false, show: (s) => s.icon },
      { k: 'block', t: 'check', label: 'Full width', group: 'State', v: false },
      { k: 'disabled', t: 'check', label: 'Disabled', group: 'State', v: false },
      { k: 'loading', t: 'check', label: 'Loading', group: 'State', v: false },
      { k: 'group', t: 'check', label: 'Button group', group: 'State', v: false },
    ],
    html(s) {
      const c = s.color;
      const variant = { solid: `bui-btn-${c}`, outline: `bui-btn-outline-${c}`, soft: `bui-btn-soft-${c}`, link: c === 'primary' ? 'bui-btn-link' : `bui-btn-link-${c}`, light: 'bui-btn-light', neutral: 'bui-btn-outline', ghost: 'bui-btn-ghost' }[s.style];
      const one = (text, first) => {
        const iconOnly = s.icon && s.iconOnly;
        const klass = cls('bui-btn', variant, s.size !== 'md' && `bui-btn-${s.size}`, s.shape && 'bui-btn-pill', s.block && !s.group && 'bui-btn-block', iconOnly && 'bui-btn-icon');
        const spin = s.loading ? '<span class="bui-spinner bui-spinner-sm"></span>' : '';
        const i = s.icon && (first || !s.group) ? ico(s.icon) : '';
        const inner = iconOnly ? (s.loading ? spin : i) : cls(spin, s.iconEnd ? '' : i, text, s.iconEnd ? i : '').replace(/ (<i )/g, '$1');
        return `<button ${attrs({ type: 'button', class: klass, disabled: s.disabled || s.loading, 'aria-busy': s.loading ? 'true' : '', 'aria-label': iconOnly ? text : '' })}>${iconOnly ? inner : inner}</button>`;
      };
      if (s.group) return `<div class="bui-btn-group" role="group" aria-label="Button group">\n  ${one(s.label, true)}\n  ${one('Middle', false)}\n  ${one('Right', false)}\n</div>`;
      return one(s.label, true);
    },
  });

  /* ============================== Forms ============================== */
  PG.add('forms', {
    stretch: true, stage: 'min-height:200px',
    controls: [
      { k: 'mode', t: 'tabs', label: 'Style', group: 'Field', v: 'floating', opts: [['floating', 'Floating label'], ['standard', 'Standard']] },
      { k: 'type', t: 'select', label: 'Type', group: 'Field', v: 'email', opts: ['text', 'email', 'password', 'tel', 'url', 'search', 'textarea'] },
      { k: 'label', t: 'text', label: 'Label', group: 'Field', v: 'Email address' },
      { k: 'placeholder', t: 'text', label: 'Placeholder', group: 'Field', v: 'you@example.com', show: (s) => s.mode === 'standard' },
      { k: 'size', t: 'tabs', label: 'Size', group: 'Field', v: 'md', opts: [['sm', 'Small'], ['md', 'Default'], ['lg', 'Large']], show: (s) => s.mode === 'floating' },
      { k: 'state', t: 'select', label: 'State', group: 'Validation', v: 'none', opts: [['none', 'None'], ['error', 'Error'], ['success', 'Success'], ['warning', 'Warning'], ['notice', 'Notice'], ['loading', 'Loading']], show: (s) => s.mode === 'floating' },
      { k: 'message', t: 'text', label: 'Message (opens from the “i” button)', group: 'Validation', v: 'Enter a valid email address.', show: (s) => s.mode === 'floating' && !['none', 'loading'].includes(s.state) },
      { k: 'prefix', t: 'select', label: 'Prefix', group: 'Affixes', v: '', opts: [['', 'None'], '+20', '@', '$', 'https://'], show: (s) => s.mode === 'floating' && s.type !== 'textarea' },
      { k: 'suffix', t: 'select', label: 'Suffix', group: 'Affixes', v: '', opts: [['', 'None'], '.com', '%', 'kg', 'EGP'], show: (s) => s.mode === 'floating' && s.type !== 'textarea' },
      { k: 'toggle', t: 'check', label: 'Show / hide button', group: 'Password', v: false, show: (s) => s.mode === 'floating' && s.type === 'password' },
      { k: 'strength', t: 'check', label: 'Strength meter', group: 'Password', v: false, show: (s) => s.mode === 'floating' && s.type === 'password' },
      { k: 'required', t: 'check', label: 'Required', group: 'Attributes', v: false },
      { k: 'disabled', t: 'check', label: 'Disabled', group: 'Attributes', v: false },
      { k: 'readonly', t: 'check', label: 'Read only', group: 'Attributes', v: false },
    ],
    html(s) {
      const area = s.type === 'textarea';
      const base = { required: s.required, disabled: s.disabled, readonly: s.readonly };
      if (s.mode === 'standard') {
        const ctl = area ? `<textarea ${attrs({ class: 'bui-input', rows: 3, placeholder: s.placeholder, ...base })}></textarea>` : `<input ${attrs({ class: 'bui-input', type: s.type, placeholder: s.placeholder, ...base })}>`;
        return `<label class="bui-field">${s.label}\n  ${ctl}\n</label>`;
      }
      const id = 'pg-field', msg = !['none', 'loading'].includes(s.state) && s.message;
      const affix = !area && (s.prefix || s.suffix);
      const klass = cls('bui-float', s.size !== 'md' && `bui-float-${s.size}`, area && 'bui-float-textarea', affix && 'bui-float-affix', s.state !== 'none' && `bui-float-${s.state}`);
      const ctl = area ? `<textarea ${attrs({ class: 'bui-float-input', id, placeholder: ' ', ...base })}></textarea>` : `<input ${attrs({ class: 'bui-float-input', id, type: s.type, placeholder: ' ', 'data-bui-strength': s.type === 'password' && s.strength, ...base })}>`;
      const lines = [];
      if (affix && s.prefix) lines.push(`<span class="bui-float-prefix">${s.prefix}</span>`);
      lines.push(ctl, `<label class="bui-float-label" for="${id}">${s.label}</label>`);
      if (affix && s.suffix) lines.push(`<span class="bui-float-suffix">${s.suffix}</span>`);
      if (s.type === 'password' && s.toggle) lines.push('<button type="button" class="bui-float-toggle" aria-label="Show password" aria-pressed="false"></button>');
      if (msg) lines.push(`<button type="button" class="bui-float-info" aria-label="Show message" aria-expanded="false" aria-controls="${id}-msg">${ico('info')}</button>`, `<div class="bui-float-message" id="${id}-msg" role="status">${s.message}</div>`);
      return `<div class="${klass}">\n  ${lines.join('\n  ')}\n</div>`;
    },
    mount(stage) {
      const f = stage.querySelector('.bui-float-message')?.closest('.bui-float');
      if (f) { f.classList.add('bui-float-open'); f.querySelector('.bui-float-info')?.setAttribute('aria-expanded', 'true'); }
    },
  });

  /* ======================== Select & dropdown ======================== */
  const PEOPLE = [['Sara Ahmed', 'Product designer', 'Design'], ['Omar Hassan', 'Frontend engineer', 'Engineering'], ['Laila Nasser', 'UX researcher', 'Design'], ['Karim Adel', 'Backend engineer', 'Engineering'], ['Mona Said', 'Illustrator', 'Design'], ['Youssef Ali', 'DevOps engineer', 'Engineering']];
  PG.add('select', {
    stretch: true, stage: 'min-height:300px;align-content:start',
    controls: [
      { k: 'kind', t: 'tabs', label: 'Component', group: 'Component', v: 'select', opts: [['select', 'Select menu'], ['dropdown', 'Dropdown menu']] },
      { k: 'variant', t: 'tabs', label: 'Field style', group: 'Select', v: 'floating', opts: [['floating', 'Floating'], ['standard', 'Standard']], show: (s) => s.kind === 'select' },
      { k: 'label', t: 'text', label: 'Label', group: 'Select', v: 'Team member', show: (s) => s.kind === 'select' },
      { k: 'search', t: 'check', label: 'Search box', group: 'Select', v: true, show: (s) => s.kind === 'select' },
      { k: 'rich', t: 'check', label: 'Avatars + descriptions', group: 'Select', v: true, show: (s) => s.kind === 'select' },
      { k: 'groups', t: 'check', label: 'Group by team', group: 'Select', v: false, show: (s) => s.kind === 'select' },
      { k: 'disabled', t: 'check', label: 'Disabled', group: 'Select', v: false, show: (s) => s.kind === 'select' },
      { k: 'trigger', t: 'select', label: 'Trigger button', group: 'Dropdown', v: 'bui-btn-outline', opts: [['bui-btn-outline', 'Outline'], ['bui-btn-primary', 'Primary'], ['bui-btn-soft-primary', 'Soft'], ['bui-btn-ghost', 'Ghost']], show: (s) => s.kind === 'dropdown' },
      { k: 'align', t: 'tabs', label: 'Align menu', group: 'Dropdown', v: 'start', opts: [['start', 'Start'], ['end', 'End']], show: (s) => s.kind === 'dropdown' },
      { k: 'items', t: 'tabs', label: 'Item type', group: 'Dropdown', v: 'plain', opts: [['plain', 'Links'], ['checkbox', 'Checkboxes'], ['radio', 'Radios']], show: (s) => s.kind === 'dropdown' },
      { k: 'caret', t: 'check', label: 'Caret', group: 'Dropdown', v: true, show: (s) => s.kind === 'dropdown' },
      { k: 'icons', t: 'check', label: 'Icons', group: 'Dropdown', v: true, show: (s) => s.kind === 'dropdown' && s.items === 'plain' },
      { k: 'shortcuts', t: 'check', label: 'Shortcuts', group: 'Dropdown', v: false, show: (s) => s.kind === 'dropdown' && s.items === 'plain' },
      { k: 'header', t: 'check', label: 'Section header', group: 'Dropdown', v: false, show: (s) => s.kind === 'dropdown' },
      { k: 'danger', t: 'check', label: 'Danger item + divider', group: 'Dropdown', v: true, show: (s) => s.kind === 'dropdown' && s.items === 'plain' },
    ],
    html(s) {
      if (s.kind === 'dropdown') {
        const names = ['Edit', 'Duplicate', 'Archive'], icons = ['pencil-simple', 'copy', 'archive'], keys = ['⌘E', '⌘D', '⌘A'];
        const rows = [];
        if (s.header) rows.push('<div class="bui-dropdown-header">Manage</div>');
        if (s.items === 'plain') {
          names.forEach((n, i) => rows.push(`<a class="bui-dropdown-item" role="menuitem" href="#">${s.icons ? ico(icons[i]) : ''}${n}${s.shortcuts ? `<span class="bui-dropdown-shortcut">${keys[i]}</span>` : ''}</a>`));
          if (s.danger) rows.push('<div class="bui-dropdown-divider" role="separator"></div>', `<a class="bui-dropdown-item bui-dropdown-item-danger" role="menuitem" href="#">${s.icons ? ico('trash') : ''}Delete</a>`);
        } else if (s.items === 'checkbox') {
          ['Comments', 'Mentions', 'Reminders'].forEach((n, i) => rows.push(`<button type="button" class="bui-dropdown-item" role="menuitemcheckbox" aria-checked="${i === 0}">${n}</button>`));
        } else {
          rows.push('<div role="group" aria-label="Sort by">');
          ['Newest', 'Oldest', 'Name'].forEach((n, i) => rows.push(`  <button type="button" class="bui-dropdown-item" role="menuitemradio" aria-checked="${i === 0}">${n}</button>`));
          rows.push('</div>');
        }
        return `<div ${attrs({ class: 'bui-dropdown', 'data-bui-align': s.align === 'end' && 'end' })}>\n  <button type="button" class="bui-btn ${s.trigger}${s.caret ? ' bui-dropdown-caret' : ''}" data-bui-dropdown-toggle aria-haspopup="menu" aria-expanded="false">Actions</button>\n  <div class="bui-dropdown-menu" role="menu">\n    ${rows.join('\n    ')}\n  </div>\n</div>`;
      }
      const opt = ([n, d]) => `<option value="${q(n.toLowerCase().replace(/\s+/g, '-'))}"${s.rich ? ` data-description="${q(d)}"` : ''}>${n}</option>`;
      const body = s.groups
        ? ['Design', 'Engineering'].map((g) => `<optgroup label="${g}">\n      ${PEOPLE.filter((p) => p[2] === g).map(opt).join('\n      ')}\n    </optgroup>`).join('\n    ')
        : PEOPLE.map(opt).join('\n    ');
      const a = { id: 'pg-select', 'data-bui-search': s.search, 'data-bui-rich': s.rich, disabled: s.disabled };
      if (s.variant === 'standard') return `<label class="bui-field">${s.label}\n  <select ${attrs({ class: 'bui-input', ...a })}>\n    <option value="">Choose…</option>\n    ${body}\n  </select>\n</label>`;
      return `<div class="bui-float bui-float-select">\n  <select ${attrs({ class: 'bui-float-input', ...a })}>\n    <option value=""></option>\n    ${body}\n  </select>\n  <label class="bui-float-label" for="pg-select">${s.label}</label>\n</div>`;
    },
  });

  /* ========================== Date & time pickers ========================== */
  PG.add('datetime', {
    stretch: true, stage: 'min-height:200px',
    controls: [
      { k: 'type', t: 'select', label: 'Type', group: 'Picker', v: 'date', opts: [['date', 'Date'], ['time', 'Time'], ['datetime-local', 'Date and time'], ['month', 'Month'], ['week', 'Week']] },
      { k: 'variant', t: 'tabs', label: 'Field style', group: 'Picker', v: 'floating', opts: [['floating', 'Floating'], ['plain', 'Plain']] },
      { k: 'label', t: 'text', label: 'Label', group: 'Picker', v: 'Appointment' },
      { k: 'size', t: 'tabs', label: 'Popup size', group: 'Popup', v: '', opts: [['sm', 'Small'], ['', 'Default'], ['lg', 'Large']] },
      { k: 'mode', t: 'tabs', label: 'Popup mode', group: 'Popup', v: '', opts: [['', 'Auto'], ['sheet', 'Bottom sheet']] },
      { k: 'locale', t: 'tabs', label: 'Language', group: 'Popup', v: 'en', opts: [['en', 'English'], ['ar', 'العربية']] },
      { k: 'firstDay', t: 'select', label: 'First day of week', group: 'Popup', v: '', opts: [['', 'From the language'], ['0', 'Sunday'], ['1', 'Monday'], ['6', 'Saturday']], show: (s) => ['date', 'datetime-local', 'week'].includes(s.type) },
      { k: 'hour12', t: 'tabs', label: 'Clock', group: 'Popup', v: '', opts: [['', 'Auto'], ['true', '12-hour'], ['false', '24-hour']], show: (s) => ['time', 'datetime-local'].includes(s.type) },
      { k: 'weeks', t: 'check', label: 'Week numbers', group: 'Popup', v: false, show: (s) => ['date', 'datetime-local', 'week'].includes(s.type) },
      { k: 'limit', t: 'check', label: 'Only the next 30 days', group: 'Rules', v: false, show: (s) => s.type === 'date' },
      { k: 'clickOpen', t: 'check', label: 'Click anywhere to open', group: 'Rules', v: true },
      { k: 'required', t: 'check', label: 'Required', group: 'Rules', v: false },
      { k: 'disabled', t: 'check', label: 'Disabled', group: 'Rules', v: false },
    ],
    html(s) {
      const today = new Date(), end = new Date(Date.now() + 30 * 864e5);
      const a = {
        class: s.variant === 'floating' ? 'bui-float-input' : 'bui-input', type: s.type, id: 'pg-dt', 'data-bui-datetime': true,
        placeholder: s.variant === 'floating' ? ' ' : '', 'data-bui-locale': s.locale === 'ar' && 'ar', 'data-bui-first-day': s.firstDay, 'data-bui-hour12': s.hour12,
        'data-bui-week-numbers': s.weeks, 'data-bui-size': s.size, 'data-bui-mode': s.mode, 'data-bui-click-open': s.clickOpen ? '' : 'false',
        min: s.limit && s.type === 'date' && iso(today), max: s.limit && s.type === 'date' && iso(end), required: s.required, disabled: s.disabled,
      };
      const input = `<input ${attrs(a)}>`;
      return s.variant === 'floating'
        ? `<div class="bui-float">\n  ${input}\n  <label class="bui-float-label" for="pg-dt">${s.label}</label>\n</div>`
        : `<label class="bui-field" for="pg-dt">${s.label}</label>\n${input}`;
    },
    mount: (stage) => window.BUI?.datetime?.init(stage),
    note: 'Load <code>assets/js/baset-datetime.js</code> once; every input with <code>data-bui-datetime</code> gets the picker.',
  });

  /* ============================== File upload ============================== */
  PG.add('upload', {
    stretch: true, stage: 'min-height:220px',
    controls: [
      { k: 'variant', t: 'tabs', label: 'Look', group: 'Look', v: 'dropzone', opts: [['dropzone', 'Drop zone'], ['compact', 'Compact'], ['button', 'Button'], ['avatar', 'Avatar']] },
      { k: 'layout', t: 'tabs', label: 'File list', group: 'Look', v: 'list', opts: [['list', 'List'], ['grid', 'Grid']], show: (s) => s.variant !== 'avatar' && s.variant !== 'button' },
      { k: 'size', t: 'tabs', label: 'Size', group: 'Look', v: '', opts: [['sm', 'Small'], ['', 'Default'], ['lg', 'Large']] },
      { k: 'shape', t: 'tabs', label: 'Avatar shape', group: 'Look', v: '', opts: [['', 'Round'], ['square', 'Square']], show: (s) => s.variant === 'avatar' },
      { k: 'title', t: 'text', label: 'Title', group: 'Text', v: '', show: (s) => s.variant !== 'avatar' },
      { k: 'hint', t: 'text', label: 'Hint', group: 'Text', v: '', show: (s) => s.variant !== 'avatar' && s.variant !== 'button' },
      { k: 'accept', t: 'select', label: 'Allowed files', group: 'Rules', v: 'image/*', opts: [['', 'Any file'], ['image/*', 'Images'], ['application/pdf', 'PDF'], ['.doc,.docx,.pdf', 'Documents']] },
      { k: 'maxSize', t: 'select', label: 'Max size', group: 'Rules', v: '2MB', opts: [['', 'No limit'], '500KB', '2MB', '10MB'] },
      { k: 'maxFiles', t: 'range', label: 'Max files', group: 'Rules', v: 4, min: 1, max: 10, show: (s) => s.multiple && s.variant !== 'avatar' },
      { k: 'multiple', t: 'check', label: 'Multiple files', group: 'Rules', v: true, show: (s) => s.variant !== 'avatar' },
      { k: 'noPreview', t: 'check', label: 'No image previews', group: 'Rules', v: false, show: (s) => s.variant !== 'avatar' },
      { k: 'required', t: 'check', label: 'Required', group: 'Rules', v: false },
      { k: 'disabled', t: 'check', label: 'Disabled', group: 'Rules', v: false },
    ],
    html(s) {
      const av = s.variant === 'avatar', multi = s.multiple && !av;
      const a = {
        type: 'file', id: 'pg-upload', name: 'files', multiple: multi, accept: s.accept, 'data-bui-upload': true,
        'data-bui-variant': s.variant !== 'dropzone' && s.variant, 'data-bui-layout': multi && s.variant !== 'button' && s.layout === 'grid' && 'grid', 'data-bui-size': s.size,
        'data-bui-shape': av && s.shape, 'data-bui-title': !av && s.title, 'data-bui-hint': !av && s.hint, 'data-bui-max-size': s.maxSize, 'data-bui-max-files': multi && s.maxFiles,
        'data-bui-no-preview': !av && s.noPreview, required: s.required, disabled: s.disabled,
      };
      return `<label class="bui-upload-caption" for="pg-upload">${av ? 'Profile photo' : 'Attachments'}</label>\n<input ${attrs(a)}>`;
    },
    mount: (stage) => window.BUI?.upload?.init(stage),
    note: 'Load <code>assets/js/baset-upload.js</code>; the native input keeps only the files that passed the checks, so a normal form submit sends exactly the listed files.',
  });

  /* ============================ Rich text editor ============================ */
  PG.add('editor', {
    stretch: true,
    controls: [
      { k: 'toolbar', t: 'select', label: 'Toolbar', group: 'Toolbar', v: 'full', opts: [['full', 'Full'], ['basic', 'Basic'], ['minimal', 'Minimal'], ['none', 'None'], ['bold italic | ul ol | link', 'Custom: bold italic | ul ol | link']] },
      { k: 'sticky', t: 'check', label: 'Sticky toolbar', group: 'Toolbar', v: false },
      { k: 'placeholder', t: 'text', label: 'Placeholder', group: 'Content', v: 'Write something…' },
      { k: 'height', t: 'range', label: 'Height', group: 'Content', v: 200, min: 120, max: 480, step: 10, unit: 'px' },
      { k: 'resize', t: 'select', label: 'Resize handle', group: 'Content', v: 'none', opts: ['none', 'vertical', 'horizontal', 'both'] },
      { k: 'maxlength', t: 'range', label: 'Max length (0 = none)', group: 'Content', v: 0, min: 0, max: 1000, step: 50 },
      { k: 'counter', t: 'check', label: 'Character counter', group: 'Content', v: false },
      { k: 'locale', t: 'tabs', label: 'Language', group: 'Language', v: 'en', opts: [['en', 'English'], ['ar', 'العربية']] },
      { k: 'dir', t: 'tabs', label: 'Text direction', group: 'Language', v: '', opts: [['', 'Page'], ['ltr', 'LTR'], ['rtl', 'RTL']] },
      { k: 'readonly', t: 'check', label: 'Read only', group: 'State', v: false },
      { k: 'disabled', t: 'check', label: 'Disabled', group: 'State', v: false },
    ],
    html(s) {
      const a = {
        'data-bui-editor': true, 'data-bui-toolbar': s.toolbar, 'data-bui-placeholder': s.placeholder, 'data-bui-height': s.height, 'data-bui-resize': s.resize !== 'none' && s.resize,
        'data-bui-maxlength': s.maxlength > 0 && s.maxlength, 'data-bui-counter': s.counter, 'data-bui-locale': s.locale !== 'en' && s.locale, 'data-bui-dir': s.dir,
        'data-bui-sticky': s.sticky, 'data-bui-readonly': s.readonly, 'data-bui-disabled': s.disabled,
      };
      return `<div ${attrs(a)}>\n  <p>Initial <strong>content</strong> goes here.</p>\n</div>`;
    },
    mount: (stage) => window.BUI?.editor?.init(stage),
    note: 'Load <code>assets/js/baset-editor.js</code>. A <code>&lt;textarea data-bui-editor name="body"&gt;</code> keeps its name, so a normal form submit sends the HTML.',
  });

  /* ================================ Cards ================================ */
  const CARDS = [
    { label: 'Total revenue', value: '$24,580', change: '+12.8%', glyph: 'trend-up' },
    { label: 'Active users', value: '8,249', change: '+4.1%', glyph: 'users' },
    { label: 'Pending tasks', value: '34', change: '', glyph: 'check-circle' },
  ];
  PG.add('cards', {
    stretch: true,
    controls: [
      { k: 'count', t: 'tabs', label: 'Cards', group: 'Layout', v: '3', opts: ['1', '2', '3'] },
      { k: 'cols', t: 'select', label: 'Columns from 768px', group: 'Layout', v: 'md-4', opts: [['md-6', '2 per row'], ['md-4', '3 per row'], ['md-3', '4 per row']] },
      { k: 'gutter', t: 'select', label: 'Gutter', group: 'Layout', v: '', opts: [['', 'Default'], ['bui-gutter-1', '1'], ['bui-gutter-2', '2'], ['bui-gutter-4', '4'], ['bui-gutter-5', '5']] },
      { k: 'icon', t: 'tabs', label: 'First icon color', group: 'Card', v: 'purple', opts: [['purple', 'Purple'], ['blue', 'Blue'], ['orange', 'Orange']] },
      { k: 'label', t: 'text', label: 'Label (first card)', group: 'Card', v: CARDS[0].label },
      { k: 'value', t: 'text', label: 'Value (first card)', group: 'Card', v: CARDS[0].value },
      { k: 'change', t: 'text', label: 'Change badge (first card)', group: 'Card', v: CARDS[0].change },
      { k: 'extra', t: 'tabs', label: 'Footer', group: 'Card', v: 'sparkline', opts: [['sparkline', 'Sparkline'], ['progress', 'Progress'], ['lines', 'Lines'], ['none', 'None']] },
      { k: 'progress', t: 'range', label: 'Progress', group: 'Card', v: 68, min: 0, max: 100, unit: '%', show: (s) => s.extra === 'progress' },
    ],
    html(s) {
      const colors = ['purple', 'blue', 'orange'], start = colors.indexOf(s.icon);
      const cards = CARDS.slice(0, Number(s.count)).map((c, i) => {
        const label = i === 0 ? s.label : c.label, value = i === 0 ? s.value : c.value, change = i === 0 ? s.change : c.change;
        const foot = { sparkline: '<div class="bui-sparkline"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>', progress: `<div class="bui-progress"><span style="width:${s.progress}%"></span></div>`, lines: '<div class="bui-task-lines"><i></i><i></i><i></i></div>', none: '' }[s.extra];
        return `  <article class="bui-col-12 bui-col-${s.cols} bui-stat-card">\n    <div class="bui-stat-top"><span class="bui-stat-icon bui-stat-icon-${colors[(start + i) % 3]}">${ico(c.glyph)}</span>${change ? `<span class="bui-stat-change">${change}</span>` : ''}</div>\n    <span class="bui-stat-label">${label}</span>\n    <strong>${value}</strong>${foot ? `\n    ${foot}` : ''}\n  </article>`;
      });
      return `<div class="${cls('bui-row', s.gutter)}">\n${cards.join('\n')}\n</div>`;
    },
  });

  /* ================================ Alerts ================================ */
  const SYM = { success: 'check-circle', info: 'info', warning: 'warning', danger: 'x-circle' };
  PG.add('alerts', {
    stretch: true,
    controls: [
      { k: 'type', t: 'tabs', label: 'Type', group: 'Alert', v: 'success', opts: [['success', 'Success'], ['info', 'Info'], ['warning', 'Warning'], ['danger', 'Danger']] },
      { k: 'title', t: 'text', label: 'Title', group: 'Alert', v: 'Changes saved' },
      { k: 'message', t: 'text', label: 'Message (empty = title only)', group: 'Alert', v: 'Your profile was updated successfully.' },
      { k: 'count', t: 'tabs', label: 'Stack', group: 'Alert', v: '1', opts: ['1', '2', '3'] },
      { k: 'dismiss', t: 'check', label: 'Dismiss button', group: 'Options', v: true },
    ],
    html(s) {
      const order = ['success', 'info', 'warning', 'danger'], from = order.indexOf(s.type);
      const one = (t, first) => `<div class="bui-alert bui-alert-${t}" role="${t === 'danger' || t === 'warning' ? 'alert' : 'status'}">\n  <span aria-hidden="true">${ico(SYM[t])}</span>\n  <div><strong>${first ? s.title : `${t[0].toUpperCase()}${t.slice(1)} alert`}</strong>${first && !s.message ? '' : `<p>${first ? s.message : 'Another message with the same layout.'}</p>`}</div>${s.dismiss ? `\n  <button type="button" class="bui-dismiss" aria-label="Dismiss">${ico('x')}</button>` : ''}\n</div>`;
      const list = Array.from({ length: Number(s.count) }, (_, i) => one(order[(from + i) % 4], i === 0));
      return Number(s.count) > 1 ? `<div class="bui-alert-stack">\n${list.join('\n')}\n</div>` : list[0];
    },
  });

  /* ================================ Badges ================================ */
  PG.add('badges', {
    controls: [
      { k: 'color', t: 'tabs', label: 'Color', group: 'Badge', v: 'primary', opts: [['primary', 'Primary'], ['success', 'Success'], ['warning', 'Warning'], ['danger', 'Danger'], ['info', 'Info'], ['neutral', 'Neutral']] },
      { k: 'text', t: 'text', label: 'Text', group: 'Badge', v: 'Active' },
      { k: 'all', t: 'check', label: 'Show every color', group: 'Badge', v: false },
    ],
    html(s) {
      if (!s.all) return `<span class="bui-badge bui-badge-${s.color}">${s.text}</span>`;
      return `<div class="bui-badge-row">\n  ${['primary', 'success', 'warning', 'danger', 'info', 'neutral'].map((c) => `<span class="bui-badge bui-badge-${c}">${s.text}</span>`).join('\n  ')}\n</div>`;
    },
  });

  /* =============================== Loaders =============================== */
  PG.add('loaders', {
    controls: [
      { k: 'kind', t: 'select', label: 'Loader', group: 'Loader', v: 'ring', opts: [['ring', 'Ring spinner'], ['dual', 'Dual ring'], ['gradient', 'Gradient ring'], ['dots', 'Dots'], ['wave', 'Wave dots'], ['bars', 'Bars'], ['pulse', 'Pulse'], ['ripple', 'Ripple'], ['skeleton', 'Skeleton'], ['progress', 'Indeterminate progress'], ['success', 'Success check']] },
      { k: 'size', t: 'tabs', label: 'Size', group: 'Look', v: '', opts: [['sm', 'Small'], ['', 'Default'], ['lg', 'Large'], ['xl', 'XL']], show: (s) => ['ring', 'dual', 'gradient'].includes(s.kind) },
      { k: 'dotSize', t: 'tabs', label: 'Size', group: 'Look', v: '', opts: [['sm', 'Small'], ['', 'Default']], show: (s) => ['dots', 'wave'].includes(s.kind) },
      { k: 'iconSize', t: 'tabs', label: 'Size', group: 'Look', v: '', opts: [['sm', 'Small'], ['', 'Default'], ['lg', 'Large']], show: (s) => s.kind === 'success' },
      { k: 'color', t: 'select', label: 'Color', group: 'Look', v: '', opts: [['', 'Brand'], ['success', 'Success'], ['danger', 'Danger'], ['warning', 'Warning'], ['info', 'Info']], show: (s) => !['skeleton', 'progress', 'success'].includes(s.kind) },
      { k: 'solid', t: 'check', label: 'Solid circle', group: 'Look', v: false, show: (s) => s.kind === 'success' },
      { k: 'text', t: 'check', label: 'Text next to it', group: 'Look', v: false, show: (s) => ['ring', 'dual', 'gradient', 'dots', 'wave', 'bars'].includes(s.kind) },
    ],
    html(s) {
      const style = s.color ? ` style="color:var(--bui-${s.color})"` : '';
      let core;
      switch (s.kind) {
        case 'ring': core = `<span class="${cls('bui-spinner', s.size && `bui-spinner-${s.size}`)}"${style} role="status" aria-label="Loading"></span>`; break;
        case 'dual': core = `<span class="${cls('bui-spinner bui-spinner-dual', s.size && `bui-spinner-${s.size}`)}"${style} role="status" aria-label="Loading"></span>`; break;
        case 'gradient': core = `<span class="${cls('bui-spinner bui-spinner-gradient', s.size && `bui-spinner-${s.size}`)}"${style} role="status" aria-label="Loading"></span>`; break;
        case 'dots': case 'wave': core = `<span class="${cls('bui-dots', s.kind === 'wave' && 'bui-dots-wave', s.dotSize && 'bui-dots-sm')}"${style} role="status" aria-label="Loading"><i></i><i></i><i></i></span>`; break;
        case 'bars': core = `<span class="bui-bars"${style} role="status" aria-label="Loading"><i></i><i></i><i></i><i></i><i></i></span>`; break;
        case 'pulse': core = `<span class="bui-pulse"${style} aria-hidden="true"></span>`; break;
        case 'ripple': core = `<span class="bui-ripple"${style} role="status" aria-label="Loading"><i></i><i></i></span>`; break;
        case 'progress': return '<div class="bui-progress bui-progress-indeterminate" role="progressbar" aria-label="Loading"><span></span></div>';
        case 'skeleton': return '<div class="bui-skeleton-row">\n  <span class="bui-skeleton bui-skeleton-circle"></span>\n  <div class="bui-skeleton-stack">\n    <span class="bui-skeleton bui-skeleton-title"></span>\n    <span class="bui-skeleton"></span>\n    <span class="bui-skeleton" style="width:70%"></span>\n  </div>\n</div>';
        default: return `<svg class="${cls('bui-success-icon', s.iconSize && `bui-success-icon-${s.iconSize}`, s.solid && 'bui-success-icon-solid')}" viewBox="0 0 52 52" role="img" aria-label="Success">\n  <circle class="bui-success-circle" cx="26" cy="26" r="24"/>\n  <path class="bui-success-check" d="M14 27l8 8 16-17"/>\n</svg>`;
      }
      return s.text ? `<span class="bui-loading-inline">${core} Loading…</span>` : core;
    },
  });

  /* ======================== Toasts & notifications ======================== */
  const toastOptions = (s) => {
    const o = {};
    if (s.type !== 'none') o.type = s.type;
    if (s.kind === 'toast' && s.variant) o.variant = s.variant;
    o.title = s.title; if (s.message) o.message = s.message;
    o.position = s.position; o.duration = s.duration;
    if (s.kind === 'toast') o.progress = s.progress;
    o.closable = s.closable; o.pauseOnHover = s.pause;
    if (s.kind === 'notify') {
      if (s.media === 'initials') { o.logo = 'SA'; o.round = true; } else if (s.media === 'icon') o.icon = 'bui-icon-light bui-icon-bell';
      if (s.unread) o.unread = true;
      if (s.actions) o.actions = [{ label: 'View', variant: 'primary' }, { label: 'Dismiss', variant: 'outline' }];
    }
    if (!s.sound) o.sound = false;
    return o;
  };
  PG.add('toasts', {
    stage: 'min-height:120px',
    actions: [{ label: 'Clear all', run: () => window.BUI?.clear() }],
    controls: [
      { k: 'kind', t: 'tabs', label: 'Kind', group: 'Content', v: 'toast', opts: [['toast', 'Toast'], ['notify', 'Notification']] },
      { k: 'type', t: 'select', label: 'Type', group: 'Content', v: 'success', opts: [['none', 'Neutral'], ...TYPES] },
      { k: 'title', t: 'text', label: 'Title', group: 'Content', v: 'Saved' },
      { k: 'message', t: 'text', label: 'Message', group: 'Content', v: 'Your changes were stored.' },
      { k: 'variant', t: 'tabs', label: 'Style', group: 'Look', v: '', opts: [['', 'Default'], ['bui-toast-soft', 'Soft'], ['bui-toast-solid', 'Solid']], show: (s) => s.kind === 'toast' },
      { k: 'media', t: 'tabs', label: 'Media', group: 'Look', v: 'icon', opts: [['none', 'None'], ['initials', 'Initials'], ['icon', 'Icon']], show: (s) => s.kind === 'notify' },
      { k: 'position', t: 'select', label: 'Position', group: 'Behavior', v: 'top-end', opts: ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'] },
      { k: 'duration', t: 'range', label: 'Duration (0 = stays)', group: 'Behavior', v: 5000, min: 0, max: 15000, step: 500, unit: ' ms' },
      { k: 'progress', t: 'check', label: 'Progress bar', group: 'Behavior', v: true, show: (s) => s.kind === 'toast' },
      { k: 'closable', t: 'check', label: 'Close button', group: 'Behavior', v: true },
      { k: 'pause', t: 'check', label: 'Pause on hover', group: 'Behavior', v: true },
      { k: 'unread', t: 'check', label: 'Unread dot', group: 'Behavior', v: false, show: (s) => s.kind === 'notify' },
      { k: 'actions', t: 'check', label: 'Action buttons', group: 'Behavior', v: false, show: (s) => s.kind === 'notify' },
      { k: 'sound', t: 'check', label: 'Play sound', group: 'Behavior', v: false },
    ],
    html(s) {
      const o = toastOptions(s);
      const json = JSON.stringify(o).replace(/'/g, '&#39;');
      return `<button type="button" class="bui-btn bui-btn-primary" ${s.kind === 'toast' ? 'data-bui-toast' : 'data-bui-notify'}='${json}'>Show ${s.kind === 'toast' ? 'toast' : 'notification'}</button>`;
    },
    js(s) {
      const o = toastOptions(s);
      return `BUI.${s.kind === 'toast' ? 'toast' : 'notify'}(${lit(o)});`;
    },
  });

  /* ================================= Modal ================================= */
  PG.add('modal', {
    stage: 'min-height:120px',
    controls: [
      { k: 'icon', t: 'select', label: 'Layout', group: 'Content', v: '', opts: [['', 'Header + body (form / info)'], ['info', 'Centered: info'], ['success', 'Centered: success'], ['warning', 'Centered: warning'], ['danger', 'Centered: danger']] },
      { k: 'title', t: 'text', label: 'Title', group: 'Content', v: 'Edit profile' },
      { k: 'message', t: 'text', label: 'Message', group: 'Content', v: 'Update your name and email, then save.' },
      { k: 'size', t: 'tabs', label: 'Size', group: 'Shape', v: '', opts: [['sm', 'Small'], ['', 'Default'], ['lg', 'Large'], ['xl', 'XL']] },
      { k: 'position', t: 'select', label: 'Position', group: 'Shape', v: '', opts: [['', 'Center'], ['top', 'Top'], ['bottom', 'Bottom sheet'], ['start', 'Side drawer (start)'], ['end', 'Side drawer (end)']] },
      { k: 'footer', t: 'select', label: 'Footer alignment', group: 'Shape', v: '', opts: [['', 'End'], ['start', 'Start'], ['center', 'Center'], ['between', 'Space between'], ['stretch', 'Stretch']], show: (s) => !s.icon },
      { k: 'two', t: 'check', label: 'Cancel + confirm buttons', group: 'Options', v: true },
      { k: 'closable', t: 'check', label: 'Close button', group: 'Options', v: true, show: (s) => !s.icon },
      { k: 'divided', t: 'check', label: 'Divider lines', group: 'Options', v: false, show: (s) => !s.icon },
      { k: 'scroll', t: 'check', label: 'Scrolling body', group: 'Options', v: false, show: (s) => !s.icon },
      { k: 'static', t: 'check', label: 'Static backdrop', group: 'Options', v: false },
    ],
    html(s) {
      const id = 'pg-modal', c = s.icon;
      const klass = cls('bui-modal', s.size && `bui-modal-${s.size}`, s.position && `bui-modal-${s.position}`, c && 'bui-modal-center', !c && s.divided && 'bui-modal-divided', !c && s.scroll && 'bui-modal-scroll');
      const okVariant = c === 'danger' ? 'danger' : 'primary';
      const btns = [];
      if (s.two) btns.push('<button type="button" class="bui-btn bui-btn-outline" data-bui-modal-close>Cancel</button>');
      btns.push(`<button type="button" class="bui-btn bui-btn-${okVariant}" data-bui-modal-close>${c ? 'Confirm' : 'Save'}</button>`);
      const long = s.scroll && !c ? '\n    <p>' + Array(8).fill('More text so the body has to scroll while the header and footer stay in place.').join(' ') + '</p>' : '';
      const head = c ? '' : `\n  <div class="bui-modal-header">\n    <h3 class="bui-modal-title" id="${id}-title">${s.title}</h3>${s.closable ? `\n    <button type="button" class="bui-modal-close" aria-label="Close" data-bui-modal-close>${ico('x')}</button>` : ''}\n  </div>`;
      const body = c
        ? `\n  <div class="bui-modal-body">\n    <span class="bui-modal-icon bui-modal-icon-${c}" aria-hidden="true">${ico({ success: 'check-circle', info: 'info', warning: 'warning', danger: 'warning-circle' }[c])}</span>\n    <h3 class="bui-modal-title" id="${id}-title">${s.title}</h3>\n    <p id="${id}-text">${s.message}</p>\n  </div>`
        : `\n  <div class="bui-modal-body">\n    <p>${s.message}</p>${long}\n  </div>`;
      const foot = `\n  <div class="${cls('bui-modal-footer', !c && s.footer && `bui-modal-footer-${s.footer}`)}">\n    ${btns.join('\n    ')}\n  </div>`;
      return `<button type="button" class="bui-btn bui-btn-primary" data-bui-modal-open="#${id}">Open modal</button>\n\n<dialog ${attrs({ id, class: klass, 'aria-labelledby': `${id}-title`, 'data-bui-static': s.static })}>${head}${body}${foot}\n</dialog>`;
    },
    js(s) {
      if (s.icon) {
        const o = { type: s.icon, title: s.title, message: s.message, confirmText: 'Confirm' };
        if (s.size) o.size = s.size; if (s.position) o.position = s.position; if (s.static) o.static = true;
        return `const ok = await BUI.modal.confirm(${lit(o)});\nif (ok) { /* the person confirmed */ }`;
      }
      const o = { title: s.title, message: s.message };
      if (s.size) o.size = s.size; if (s.position) o.position = s.position; if (s.static) o.static = true; if (!s.closable) o.closable = false;
      o.actions = [...(s.two ? [{ label: 'Cancel', value: false }] : []), { label: 'Save', value: true, variant: 'primary' }];
      return `const result = await BUI.modal.show(${lit(o)});\n// result: the value of the clicked action, or null when dismissed`;
    },
  });

  /* ================================ Utilities ================================ */
  PG.add('utilities', {
    stretch: true,
    controls: [
      { k: 'count', t: 'range', label: 'Items', group: 'Grid', v: 6, min: 1, max: 9 },
      { k: 'cols', t: 'select', label: 'Columns from 768px', group: 'Grid', v: 'md-4', opts: [['md-6', '2 per row'], ['md-4', '3 per row'], ['md-3', '4 per row']] },
      { k: 'gutter', t: 'select', label: 'Gutter', group: 'Grid', v: '', opts: [['', 'Default'], ['bui-gutter-0', '0'], ['bui-gutter-2', '2'], ['bui-gutter-4', '4'], ['bui-gutter-5', '5']] },
      { k: 'justify', t: 'select', label: 'Justify the last row', group: 'Grid', v: '', opts: [['', 'Start'], ['bui-justify-center', 'Center'], ['bui-justify-end', 'End'], ['bui-justify-between', 'Between']] },
      { k: 'icon', t: 'select', label: 'Icon', group: 'Item', v: 'rocket-launch', opts: ICONS },
      { k: 'title', t: 'text', label: 'Title', group: 'Item', v: 'Feature' },
      { k: 'text', t: 'text', label: 'Text', group: 'Item', v: 'A short description of what this does.' },
    ],
    html(s) {
      const items = Array.from({ length: s.count }, (_, i) => `  <div class="bui-col-12 bui-col-${s.cols} bui-feature">\n    <span class="bui-feature-icon">${ico(s.icon)}</span>\n    <strong>${s.title} ${i + 1}</strong>\n    <p>${s.text}</p>\n  </div>`);
      return `<div class="${cls('bui-row', s.gutter, s.justify)}">\n${items.join('\n')}\n</div>`;
    },
  });

  /* ======================== Navbar, sidebar and footer ======================== */
  PG.add('navigation', {
    stretch: true, stage: 'align-content:start',
    note: 'The page-level layouts that combine these parts live in the <a href="../customize/layout-playground.html">layout playground</a>.',
    controls: [
      { k: 'part', t: 'tabs', label: 'Part', group: 'Part', v: 'navbar', opts: [['navbar', 'Navbar'], ['sidebar', 'Sidebar'], ['footer', 'Footer']] },
      { k: 'brand', t: 'text', label: 'Brand', group: 'Part', v: 'Baset' },
      { k: 'variant', t: 'tabs', label: 'Color', group: 'Navbar', v: '', opts: [['', 'Default'], ['bui-navbar-inverse', 'Inverse'], ['bui-navbar-primary', 'Primary']], show: (s) => s.part === 'navbar' },
      { k: 'links', t: 'range', label: 'Links', group: 'Navbar', v: 4, min: 2, max: 6, show: (s) => s.part === 'navbar' },
      { k: 'actions', t: 'tabs', label: 'Actions', group: 'Navbar', v: 'buttons', opts: [['none', 'None'], ['buttons', 'Buttons'], ['search', 'Search']], show: (s) => s.part === 'navbar' },
      { k: 'flat', t: 'check', label: 'Flat (no radius)', group: 'Navbar', v: false, show: (s) => s.part === 'navbar' },
      { k: 'always', t: 'check', label: 'Burger at every width', group: 'Navbar', v: false, show: (s) => s.part === 'navbar' },
      { k: 'mini', t: 'check', label: 'Mini rail (icons only)', group: 'Sidebar', v: false, show: (s) => s.part === 'sidebar' },
      { k: 'badges', t: 'check', label: 'Badge on Projects', group: 'Sidebar', v: true, show: (s) => s.part === 'sidebar' },
      { k: 'group', t: 'check', label: 'Collapsible group', group: 'Sidebar', v: true, show: (s) => s.part === 'sidebar' },
      { k: 'bottom', t: 'check', label: 'Bottom links', group: 'Sidebar', v: true, show: (s) => s.part === 'sidebar' },
      { k: 'fvariant', t: 'tabs', label: 'Look', group: 'Footer', v: '', opts: [['', 'Default'], ['bui-site-footer-inverse', 'Inverse']], show: (s) => s.part === 'footer' },
      { k: 'center', t: 'check', label: 'Centered', group: 'Footer', v: false, show: (s) => s.part === 'footer' },
      { k: 'columns', t: 'check', label: 'Link columns', group: 'Footer', v: true, show: (s) => s.part === 'footer' },
      { k: 'social', t: 'check', label: 'Social links', group: 'Footer', v: false, show: (s) => s.part === 'footer' },
    ],
    html(s) {
      const brand = `<a class="bui-navbar-brand" href="#"><span class="bui-navbar-mark">${s.brand.charAt(0).toUpperCase()}</span>${s.brand}</a>`;
      if (s.part === 'navbar') {
        const names = ['Home', 'Features', 'Pricing', 'Docs', 'Blog', 'Contact'].slice(0, s.links);
        const act = { none: '', buttons: '\n    <div class="bui-navbar-actions">\n      <a class="bui-btn bui-btn-outline bui-btn-sm" href="#">Sign in</a>\n      <a class="bui-btn bui-btn-primary bui-btn-sm" href="#">Get started</a>\n    </div>', search: '\n    <div class="bui-navbar-actions">\n      <div class="bui-navbar-search"><input class="bui-input" type="search" placeholder="Search…" aria-label="Search"></div>\n    </div>' }[s.actions];
        return `<nav class="${cls('bui-navbar', s.variant, s.flat && 'bui-navbar-flat', s.always && 'bui-navbar-always')}" aria-label="Main">\n  ${brand}\n  <button class="bui-navbar-toggle" type="button" data-bui-navbar-toggle aria-expanded="false" aria-controls="pg-nav" aria-label="Toggle navigation"><span></span></button>\n  <div class="bui-navbar-collapse" id="pg-nav">\n    <ul class="bui-navbar-nav">\n${names.map((n, i) => `      <li><a class="bui-navbar-link${i === 0 ? ' active' : ''}" href="#"${i === 0 ? ' aria-current="page"' : ''}>${n}</a></li>`).join('\n')}\n    </ul>${act}\n  </div>\n</nav>`;
      }
      if (s.part === 'sidebar') {
        const link = (icon, text, extra = '', active = false) => `<a class="${cls('bui-sidenav-link', active && 'active')}" href="#">${ico(icon)}<span class="bui-sidenav-text">${text}</span>${extra}</a>`;
        const rows = [link('house', 'Dashboard', '', true), link('folder-open', 'Projects', s.badges ? '<span class="bui-sidenav-badge">12</span>' : '')];
        if (s.group) rows.push(`<details class="bui-sidenav-group" open>\n    <summary class="bui-sidenav-link">${ico('users')}<span class="bui-sidenav-text">Team</span></summary>\n    <div class="bui-sidenav-sub">\n      <a class="bui-sidenav-link" href="#"><span class="bui-sidenav-text">Members</span></a>\n      <a class="bui-sidenav-link" href="#"><span class="bui-sidenav-text">Roles</span></a>\n    </div>\n  </details>`);
        rows.push(link('chart-bar', 'Reports'), link('gear', 'Settings'));
        if (s.bottom) rows.push(`<div class="bui-sidenav-bottom">\n    ${link('question', 'Help')}\n    <a class="bui-sidenav-link bui-sidenav-link-danger" href="#">${ico('sign-out')}<span class="bui-sidenav-text">Log out</span></a>\n  </div>`);
        return `<aside class="${cls('bui-sidenav', s.mini && 'bui-sidenav-mini')}" aria-label="Sidebar">\n  <a class="bui-sidenav-brand" href="#"><span class="bui-navbar-mark">${s.brand.charAt(0).toUpperCase()}</span><span class="bui-sidenav-text">${s.brand}</span></a>\n  ${rows.join('\n  ')}\n</aside>`;
      }
      const col = (t, l) => `<div><h4 class="bui-site-footer-title">${t}</h4><ul class="bui-site-footer-links">${l.map((x) => `<li><a href="#">${x}</a></li>`).join('')}</ul></div>`;
      const cols = s.columns ? `\n  <div class="bui-site-footer-cols">\n    <div>${brand}<p>A lightweight UI library built with plain HTML, CSS and JavaScript.</p></div>\n    ${col('Product', ['Features', 'Pricing', 'Changelog'])}\n    ${col('Company', ['About', 'Blog', 'Careers'])}\n    ${col('Support', ['Docs', 'Help center', 'Contact'])}\n  </div>` : '';
      const social = s.social ? '\n    <div class="bui-site-footer-social"><a href="#" aria-label="X">X</a><a href="#" aria-label="GitHub">G</a><a href="#" aria-label="LinkedIn">in</a></div>' : '';
      return `<footer class="${cls('bui-site-footer', s.fvariant, s.center && 'bui-site-footer-center')}">${cols}\n  <div class="bui-site-footer-bottom">\n    <span>© 2026 ${s.brand}. All rights reserved.</span>${social}\n    <nav class="bui-site-footer-nav" aria-label="Footer"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a></nav>\n  </div>\n</footer>`;
    },
  });

  /* ============================ Calendar & scheduler ============================ */
  const calEvents = (n) => {
    const t = new Date(), at = (d, h, m = 0) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + d, h, m);
    const all = [
      ['Team stand-up', at(0, 9), at(0, 9, 30), 'violet'], ['Design review', at(1, 11), at(1, 12, 30), 'blue'], ['Lunch with Sara', at(2, 13), at(2, 14), 'green'],
      ['Sprint planning', at(3, 10), at(3, 12), 'orange'], ['Release', at(5, 15), at(5, 16), 'red'], ['Workshop', at(-2, 14), at(-2, 16), 'blue'],
      ['1:1 meeting', at(-1, 10), at(-1, 10, 45), 'violet'], ['Dentist', at(7, 17), at(7, 18), 'green'],
    ];
    return all.slice(0, n).map(([title, s, e, color]) => ({ title, start: isoT(s), end: isoT(e), color }));
  };
  const calOptions = (s) => {
    const o = { view: s.view };
    if (s.locale !== 'en') o.locale = s.locale;
    if (s.firstDay !== '') o.firstDay = Number(s.firstDay);
    if (s.hour12 !== '') o.hour12 = s.hour12 === 'true';
    o.editable = s.editable; o.selectable = s.selectable; o.draggable = s.draggable; o.resizable = s.resizable;
    if (!s.toolbar) o.toolbar = false;
    if (!s.nowIndicator) o.nowIndicator = false;
    if (s.hourHeight !== 52) o.hourHeight = s.hourHeight;
    o.events = calEvents(s.events);
    return o;
  };
  PG.add('calendar', {
    stretch: true, tab: 'js',
    controls: [
      { k: 'view', t: 'tabs', label: 'Start view', group: 'View', v: 'month', opts: [['month', 'Month'], ['week', 'Week'], ['day', 'Day']] },
      { k: 'locale', t: 'tabs', label: 'Language', group: 'View', v: 'en', opts: [['en', 'English'], ['ar', 'العربية']] },
      { k: 'firstDay', t: 'select', label: 'First day of week', group: 'View', v: '', opts: [['', 'From the language'], ['0', 'Sunday'], ['1', 'Monday'], ['6', 'Saturday']] },
      { k: 'hour12', t: 'tabs', label: 'Clock', group: 'View', v: '', opts: [['', 'Auto'], ['true', '12-hour'], ['false', '24-hour']] },
      { k: 'hourHeight', t: 'range', label: 'Hour height (week / day)', group: 'View', v: 52, min: 32, max: 90, unit: 'px' },
      { k: 'events', t: 'range', label: 'Sample events', group: 'Data', v: 6, min: 0, max: 8 },
      { k: 'editable', t: 'check', label: 'Editable', group: 'Behavior', v: true },
      { k: 'selectable', t: 'check', label: 'Click a day to add', group: 'Behavior', v: true },
      { k: 'draggable', t: 'check', label: 'Drag to move', group: 'Behavior', v: true },
      { k: 'resizable', t: 'check', label: 'Drag edge to resize', group: 'Behavior', v: true },
      { k: 'toolbar', t: 'check', label: 'Toolbar', group: 'Behavior', v: true },
      { k: 'nowIndicator', t: 'check', label: 'Now line', group: 'Behavior', v: true },
    ],
    html: () => '<div id="calendar"></div>',
    preview: () => '<div id="pg-calendar"></div>',
    js: (s) => `const calendar = BUI.calendar('#calendar', ${lit(calOptions(s))});`,
    mount: (stage, s) => window.BUI?.calendar('#pg-calendar', calOptions(s)),
    note: 'Load <code>assets/js/baset-calendar.js</code>. Events are plain objects: <code>title</code>, <code>start</code>, <code>end</code>, <code>allDay</code>, <code>color</code>.',
  });

  /* ================================== Charts ================================== */
  const PALETTES = { default: null, ocean: ['#368de5', '#56c19b', '#66a8eb', '#6658e8', '#f2a33a', '#d84b5d'], sunset: ['#f2a33a', '#d84b5d', '#e17684', '#f5b969', '#8b80ee', '#6658e8'], forest: ['#20ad7c', '#56c19b', '#167957', '#8bd4bb', '#f2a33a', '#368de5'] };
  const SERIES = [['Revenue', [18, 24, 22, 31, 36, 42]], ['Expenses', [12, 16, 19, 21, 24, 26]], ['Profit', [6, 8, 3, 10, 12, 16]]];
  const chartConfig = (s) => {
    const pie = ['pie', 'doughnut'].includes(s.type), radar = s.type === 'radar';
    const data = pie ? { labels: ['Organic', 'Direct', 'Social', 'Email'], datasets: [{ label: 'Visits', data: [4120, 2340, 1680, 960] }] }
      : radar ? { labels: ['Speed', 'Power', 'Range', 'Armor', 'Agility'], datasets: SERIES.slice(0, Number(s.series)).map(([label], i) => ({ label, data: [[80, 65, 70, 50, 90], [60, 85, 55, 75, 70], [45, 50, 80, 90, 55]][i] })) }
        : { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: SERIES.slice(0, Number(s.series)).map(([label, d]) => ({ label, data: d })) };
    const o = { height: s.height, animation: s.animation };
    if (s.animation) o.animationStyle = s.animationStyle;
    o.showLegend = s.legend; o.showTooltip = s.tooltip;
    if (!pie) { o.showGrid = s.grid; o.showLabels = s.labels; }
    if (s.format !== 'number') o.format = s.format;
    if (PALETTES[s.palette]) o.colors = PALETTES[s.palette];
    if (['line', 'area'].includes(s.type)) { o.smooth = s.smooth; o.points = s.points; if (s.type === 'line') o.fill = s.fill; }
    if (s.type === 'area') o.stacked = s.stacked;
    if (s.type === 'bar') { o.stacked = s.stacked; o.rounded = s.rounded; o.horizontal = s.horizontal; o.showValues = s.values; }
    if (s.type === 'doughnut') { o.cutout = s.cutout; o.centerText = { value: '9,100', label: 'Visits' }; }
    return { type: s.type, data, options: o };
  };
  PG.add('charts', {
    stretch: true, tab: 'js',
    note: 'Load <code>assets/js/baset-charts.js</code>. Every option here is a field of the <code>options</code> object. For the full list (axes, thresholds, live data) use the <a href="../customize/chart-playground.html">chart playground</a>.',
    controls: [
      { k: 'type', t: 'select', label: 'Chart type', group: 'Chart', v: 'line', opts: [['line', 'Line'], ['area', 'Area'], ['bar', 'Bar'], ['pie', 'Pie'], ['doughnut', 'Doughnut'], ['radar', 'Radar']] },
      { k: 'series', t: 'tabs', label: 'Datasets', group: 'Chart', v: '2', opts: ['1', '2', '3'], show: (s) => !['pie', 'doughnut'].includes(s.type) },
      { k: 'height', t: 'range', label: 'Height', group: 'Chart', v: 280, min: 160, max: 420, step: 10, unit: 'px' },
      { k: 'palette', t: 'select', label: 'Colors', group: 'Chart', v: 'default', opts: [['default', 'Brand palette'], ['ocean', 'Ocean'], ['sunset', 'Sunset'], ['forest', 'Forest']] },
      { k: 'format', t: 'select', label: 'Number format', group: 'Chart', v: 'number', opts: ['number', 'compact', 'currency', 'percent'] },
      { k: 'animation', t: 'check', label: 'Animation', group: 'Motion', v: true },
      { k: 'animationStyle', t: 'select', label: 'Animation style', group: 'Motion', v: 'grow', opts: ['grow', 'rise', 'fade', 'slide', 'zoom', 'reveal', 'draw'], show: (s) => s.animation },
      { k: 'legend', t: 'check', label: 'Legend', group: 'Show', v: true },
      { k: 'tooltip', t: 'check', label: 'Tooltip', group: 'Show', v: true },
      { k: 'grid', t: 'check', label: 'Grid lines', group: 'Show', v: true, show: (s) => !['pie', 'doughnut'].includes(s.type) },
      { k: 'labels', t: 'check', label: 'Axis labels', group: 'Show', v: true, show: (s) => !['pie', 'doughnut'].includes(s.type) },
      { k: 'values', t: 'check', label: 'Value labels', group: 'Show', v: false, show: (s) => s.type === 'bar' },
      { k: 'smooth', t: 'check', label: 'Smooth curves', group: 'Style', v: true, show: (s) => ['line', 'area'].includes(s.type) },
      { k: 'points', t: 'check', label: 'Data points', group: 'Style', v: true, show: (s) => ['line', 'area'].includes(s.type) },
      { k: 'fill', t: 'check', label: 'Fill under line', group: 'Style', v: false, show: (s) => s.type === 'line' },
      { k: 'stacked', t: 'check', label: 'Stacked', group: 'Style', v: false, show: (s) => ['bar', 'area'].includes(s.type) },
      { k: 'rounded', t: 'check', label: 'Rounded bars', group: 'Style', v: true, show: (s) => s.type === 'bar' },
      { k: 'horizontal', t: 'check', label: 'Horizontal', group: 'Style', v: false, show: (s) => s.type === 'bar' },
      { k: 'cutout', t: 'range', label: 'Hole size', group: 'Style', v: 62, min: 30, max: 85, unit: '%', show: (s) => s.type === 'doughnut' },
    ],
    html: () => '<div id="sales-chart"></div>',
    preview: () => '<div id="pg-chart"></div>',
    js: (s) => `const chart = BUI.chart('#sales-chart', ${lit(chartConfig(s))});`,
    mount: (stage, s) => window.BUI?.chart('#pg-chart', chartConfig(s)),
  });

  /* ================================= DataTable ================================= */
  const NAMES = ['Sara Ahmed', 'Omar Hassan', 'Laila Nasser', 'Karim Adel', 'Mona Said', 'Youssef Ali', 'Nour Samir', 'Hana Fathy'];
  const ROLES = ['Designer', 'Engineer', 'Researcher', 'Manager'];
  const STATUS = ['Active', 'Pending', 'Inactive'];
  const ROWS = Array.from({ length: 36 }, (_, i) => ({ id: i + 1, name: NAMES[i % 8] + (i > 7 ? ` ${Math.floor(i / 8) + 1}` : ''), email: `user${i + 1}@example.com`, role: ROLES[(i * 3) % 4], status: STATUS[(i * 5) % 3] }));
  const COLS = [{ data: 'id', title: 'ID' }, { data: 'name', title: 'Name' }, { data: 'email', title: 'Email' }, { data: 'role', title: 'Role' }, { data: 'status', title: 'Status' }];
  const dtOptions = (s) => {
    const o = { pageLength: Number(s.pageLength), paginationType: s.paginationType };
    if (!s.searching) o.searching = false;
    if (!s.ordering) o.ordering = false;
    if (s.variant) o.variant = s.variant;
    if (s.density !== 'comfortable') o.density = s.density;
    if (s.striped) o.striped = true;
    if (s.bordered) o.bordered = true;
    if (!s.hover) o.hover = false;
    if (s.theme !== 'auto') o.theme = s.theme;
    if (s.columnSearch) o.columnSearch = true;
    if (s.colVisibility) o.colVisibility = true;
    if (s.colReorder) o.colReorder = true;
    if (s.colResize) o.colResize = true;
    if (s.select) o.select = s.select;
    if (s.buttons) o.buttons = s.buttons.split(',');
    return o;
  };
  PG.add('datatable', {
    stretch: true, tab: 'js',
    note: 'Load <code>assets/js/baset-datatable.js</code>. <code>data</code> is an array of objects; the playground uses 36 sample rows. More options (filters, search builder, server-side, editing) are on the <a href="../customize/datatable-playground.html">DataTable playground</a>.',
    controls: [
      { k: 'pageLength', t: 'select', label: 'Rows per page', group: 'Table', v: '5', opts: ['5', '10', '25'] },
      { k: 'paginationType', t: 'select', label: 'Pagination', group: 'Table', v: 'numbers', opts: ['numbers', 'simple', 'full_numbers', 'compact', 'first_last'] },
      { k: 'searching', t: 'check', label: 'Search box', group: 'Table', v: true },
      { k: 'ordering', t: 'check', label: 'Sorting', group: 'Table', v: true },
      { k: 'variant', t: 'tabs', label: 'Variant', group: 'Look', v: '', opts: [['', 'Default'], ['minimal', 'Minimal'], ['modern', 'Modern']] },
      { k: 'density', t: 'tabs', label: 'Density', group: 'Look', v: 'comfortable', opts: [['comfortable', 'Comfortable'], ['compact', 'Compact']] },
      { k: 'theme', t: 'tabs', label: 'Theme', group: 'Look', v: 'auto', opts: [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']] },
      { k: 'striped', t: 'check', label: 'Striped', group: 'Look', v: false },
      { k: 'bordered', t: 'check', label: 'Bordered', group: 'Look', v: false },
      { k: 'hover', t: 'check', label: 'Row hover', group: 'Look', v: true },
      { k: 'columnSearch', t: 'check', label: 'Search per column', group: 'Columns', v: false },
      { k: 'colVisibility', t: 'check', label: 'Show / hide columns', group: 'Columns', v: false },
      { k: 'colReorder', t: 'check', label: 'Drag to reorder', group: 'Columns', v: false },
      { k: 'colResize', t: 'check', label: 'Drag to resize', group: 'Columns', v: false },
      { k: 'select', t: 'tabs', label: 'Row selection', group: 'Rows', v: '', opts: [['', 'Off'], ['multi', 'Multiple'], ['single', 'Single']] },
      { k: 'buttons', t: 'select', label: 'Export buttons', group: 'Rows', v: '', opts: [['', 'None'], ['copy,csv', 'Copy, CSV'], ['copy,csv,excel,pdf,print', 'All']] },
    ],
    html: () => '<table id="users"></table>',
    preview: () => '<table id="pg-users"></table>',
    js: (s) => `const users = [\n  { id: 1, name: 'Sara Ahmed', email: 'user1@example.com', role: 'Designer', status: 'Active' },\n  // …more rows\n];\n\nconst table = BUI.dataTable('#users', ${lit({ data: '__DATA__', columns: COLS, ...dtOptions(s) }).replace("'__DATA__'", 'users')});`,
    mount: (stage, s) => window.BUI?.dataTable('#pg-users', { data: ROWS, columns: COLS, ...dtOptions(s), pageLength: Number(s.pageLength) }),
  });

  /* ================================== Icons ================================== */
  PG.add('icons', {
    controls: [
      { k: 'style', t: 'tabs', label: 'Style', group: 'Icon', v: 'regular', opts: ['thin', 'light', 'regular', 'solid', 'bold', 'duotone'] },
      { k: 'name', t: 'select', label: 'Icon', group: 'Icon', v: 'heart', opts: ICONS },
      { k: 'size', t: 'range', label: 'Size', group: 'Look', v: 48, min: 16, max: 120, unit: 'px' },
      { k: 'color', t: 'select', label: 'Color', group: 'Look', v: '', opts: [['', 'Inherit'], ['primary', 'Primary'], ['success', 'Success'], ['danger', 'Danger'], ['warning', 'Warning'], ['info', 'Info'], ['muted', 'Muted']] },
      { k: 'button', t: 'check', label: 'Inside a button', group: 'Look', v: false },
    ],
    html(s) {
      const style = s.button ? '' : [`font-size:${s.size}px`, s.color && `color:var(--bui-${s.color})`].filter(Boolean).join(';');
      const i = `<i class="bui-icon-${s.style} bui-icon-${s.name}"${style ? ` style="${style}"` : ''} aria-hidden="true"></i>`;
      return s.button ? `<button type="button" class="bui-btn bui-btn-soft-${s.color && s.color !== 'muted' ? s.color : 'primary'}">${i} ${s.name.replace(/-/g, ' ')}</button>` : i;
    },
    note: 'Load <code>assets/css/baset-icons.css</code> and keep <code>assets/fonts/</code> next to it. Browse every icon in the <a href="icons.html#gallery">gallery</a> below.',
  });
  /* ============================= Stepper & wizard ============================= */
  const STEPS = [['Account', 'Email and password', 'user'], ['Profile', 'Tell us about you', 'envelope'], ['Billing', 'Payment details', 'gear'], ['Preview', 'Check everything', 'bell'], ['Review', 'Last look', 'lock'], ['Finish', 'All done', 'star']];
  PG.add('stepper', {
    stretch: true, tab: 'html',
    note: 'Load <code>assets/js/baset-stepper.js</code>. <strong>Next</strong> validates the fields of the current step before moving; try leaving a field empty. The same options can be passed to <code>BUI.stepper(\'#wizard\', options)</code>.',
    controls: [
      { k: 'orientation', t: 'tabs', label: 'Direction', group: 'Look', v: 'horizontal', opts: [['horizontal', 'Horizontal'], ['vertical', 'Vertical']] },
      { k: 'size', t: 'tabs', label: 'Size', group: 'Look', v: '', opts: [['sm', 'Small'], ['', 'Default'], ['lg', 'Large']] },
      { k: 'steps', t: 'range', label: 'Steps', group: 'Look', v: 3, min: 2, max: 6 },
      { k: 'desc', t: 'check', label: 'Descriptions', group: 'Look', v: true },
      { k: 'icons', t: 'check', label: 'Icons in the markers', group: 'Look', v: false },
      { k: 'inside', t: 'check', label: 'Panels inside the steps', group: 'Look', v: false, show: (s) => s.orientation === 'vertical' },
      { k: 'count', t: 'check', label: 'Step counter', group: 'Look', v: true },
      { k: 'validate', t: 'check', label: 'Validate before moving', group: 'Behavior', v: true },
      { k: 'linear', t: 'check', label: 'Linear (no skipping ahead)', group: 'Behavior', v: true },
      { k: 'clickable', t: 'select', label: 'Step buttons', group: 'Behavior', v: 'true', opts: [['true', 'All clickable'], ['done', 'Completed steps only'], ['false', 'Not clickable']] },
      { k: 'animate', t: 'check', label: 'Slide animation', group: 'Behavior', v: true },
      { k: 'enterKey', t: 'check', label: 'Enter goes to next step', group: 'Behavior', v: true },
    ],
    html(s) {
      const n = s.steps, vertical = s.orientation === 'vertical';
      const root = cls('bui-stepper', vertical && 'bui-stepper-vertical', s.size && `bui-stepper-${s.size}`);
      const a = { class: root, id: 'wizard', 'data-bui-stepper': true, 'data-bui-validate': true, 'data-bui-linear': !s.linear && 'false', 'data-bui-clickable': s.clickable !== 'true' && s.clickable, 'data-bui-animate': !s.animate && 'false', 'data-bui-enter-key': !s.enterKey && 'false' };
      const head = (i) => {
        const [t, d, ic] = STEPS[i];
        return `<button type="button" class="bui-step-head"><span class="bui-step-marker">${s.icons ? ico(ic) : i + 1}</span><span class="bui-step-text"><span class="bui-step-title">${t}</span>${s.desc ? `<span class="bui-step-desc">${d}</span>` : ''}</span></button>`;
      };
      const panel = (i, ind) => {
        const body = s.validate ? `<div class="bui-float">\n${ind}    <input class="bui-float-input" id="pg-st-${i + 1}" placeholder=" " required data-error-required="This step needs a value">\n${ind}    <label class="bui-float-label" for="pg-st-${i + 1}">${STEPS[i][0]} (required)</label>\n${ind}  </div>` : `<p>Content of step ${i + 1}: ${STEPS[i][1]}.</p>`;
        return `<div class="bui-stepper-panel">\n${ind}  ${body}\n${ind}</div>`;
      };
      const items = Array.from({ length: n }, (_, i) => (vertical && s.inside
        ? `    <li class="bui-step">\n      ${head(i)}\n      ${panel(i, '      ')}\n    </li>`
        : `    <li class="bui-step">${head(i)}</li>`));
      const panels = vertical && s.inside ? '' : '\n' + Array.from({ length: n }, (_, i) => `  ${panel(i, '  ')}`).join('\n') + '\n';
      return `<div ${attrs(a)}>\n  <ol class="bui-stepper-list">\n${items.join('\n')}\n  </ol>${panels}\n  <div class="bui-stepper-actions">\n    <button type="button" class="bui-btn bui-btn-outline" data-bui-step-prev>Back</button>${s.count ? '\n    <span class="bui-stepper-count"></span>' : ''}\n    <button type="button" class="bui-btn bui-btn-primary" data-bui-step-next>Next</button>\n    <button type="button" class="bui-btn bui-btn-success" data-bui-step-finish>Finish</button>\n  </div>\n  <div class="bui-stepper-done" data-bui-stepper-done hidden>\n    <h3>All steps completed</h3>\n    <button type="button" class="bui-btn bui-btn-outline" data-bui-step-reset>Start over</button>\n  </div>\n</div>`;
    },
    js(s) {
      return `const wizard = BUI.stepper('#wizard', {\n  linear: ${s.linear},\n  clickable: ${s.clickable === 'true' ? 'true' : s.clickable === 'false' ? 'false' : "'done'"},\n  validate: ${s.validate},\n  animate: ${s.animate},\n  enterKey: ${s.enterKey},\n  onChange(to, from, stepper) { console.log(\`step \${from + 1} -> \${to + 1}\`); },\n  onFinish(stepper) { /* send the data, then call stepper.complete() */ },\n});\n\nwizard.next();      // validates the current step, then moves\nwizard.goTo(0);     // jump back\nwizard.setState(1, 'error');`;
    },
    preview(s) { return this.html(s).replace('id="wizard"', 'id="pg-wizard"'); }, // the page has its own #wizard demo
    mount: (stage) => window.BUI?.stepper?.init(stage),
  });
  /* ================================ Accordion ================================ */
  const TOPICS = [['Getting started', 'Install the files, add the classes and you are ready.', 'rocket-launch'], ['Account', 'Change your name, email and password.', 'user'], ['Notifications', 'Choose what you hear about and how.', 'bell'], ['Security', 'Two-step sign-in and active sessions.', 'shield-check'], ['Billing', 'Invoices, payment methods and plans.', 'credit-card'], ['Support', 'Open a ticket and we answer within a day.', 'chat-circle']];
  const accOptions = (s) => {
    const o = { multiple: s.mode === 'multiple' };
    if (s.mode === 'single') o.collapsible = s.collapsible;
    o.animate = s.animate;
    o.open = s.openFirst ? [0] : [];
    return o;
  };
  PG.add('accordion', {
    stretch: true, stage: 'align-content:start', tab: 'html',
    note: 'Load <code>assets/js/baset-accordion.js</code>. Every option here is also a <code>data-bui-*</code> attribute, so the markup alone is enough; the JavaScript tab shows the same options as a call.',
    controls: [
      { k: 'mode', t: 'tabs', label: 'Expand', group: 'Behavior', v: 'single', opts: [['single', 'One at a time'], ['multiple', 'Several']] },
      { k: 'collapsible', t: 'check', label: 'The open item can be closed', group: 'Behavior', v: true, show: (s) => s.mode === 'single' },
      { k: 'openFirst', t: 'check', label: 'First item open', group: 'Behavior', v: true },
      { k: 'disabled', t: 'check', label: 'Disable the second item', group: 'Behavior', v: false },
      { k: 'nested', t: 'check', label: 'Nested accordion in the first item', group: 'Behavior', v: false },
      { k: 'items', t: 'range', label: 'Items', group: 'Look', v: 4, min: 2, max: 6 },
      { k: 'variant', t: 'tabs', label: 'Style', group: 'Look', v: '', opts: [['', 'Connected'], ['flush', 'Flush'], ['separated', 'Separated']] },
      { k: 'size', t: 'tabs', label: 'Size', group: 'Look', v: '', opts: [['sm', 'Small'], ['', 'Default'], ['lg', 'Large']] },
      { k: 'indicator', t: 'tabs', label: 'Indicator', group: 'Look', v: 'chevron', opts: [['chevron', 'Chevron'], ['plus', 'Plus / minus']] },
      { k: 'start', t: 'check', label: 'Indicator before the title', group: 'Look', v: false },
      { k: 'icons', t: 'check', label: 'Leading icons', group: 'Look', v: true },
      { k: 'animate', t: 'check', label: 'Animation', group: 'Motion', v: true },
      { k: 'speed', t: 'range', label: 'Speed', group: 'Motion', v: 280, min: 100, max: 900, step: 20, unit: ' ms', show: (s) => s.animate },
    ],
    html(s) {
      const root = cls('bui-accordion', s.variant && `bui-accordion-${s.variant}`, s.size && `bui-accordion-${s.size}`, s.indicator === 'plus' && 'bui-accordion-plus', s.start && 'bui-accordion-start');
      const a = { class: root, id: 'faq', 'data-bui-accordion': true, 'data-bui-multiple': s.mode === 'multiple', 'data-bui-collapsible': s.mode === 'single' && !s.collapsible && 'false', 'data-bui-animate': !s.animate && 'false', style: s.animate && s.speed !== 280 && `--bui-acc-speed:${s.speed / 1000}s` };
      const item = (i, ind, topic, extra) => {
        const [t, text, icon] = topic;
        const c = cls('bui-accordion-item', i === 0 && s.openFirst && 'bui-accordion-open', s.disabled && i === 1 && ind === '  ' && 'bui-accordion-disabled');
        const ic = s.icons ? `\n${ind}      <span class="bui-accordion-icon">${ico(icon)}</span>` : '';
        return `${ind}<div class="${c}">\n${ind}  <h3 class="bui-accordion-header">\n${ind}    <button type="button" class="bui-accordion-trigger">${ic}\n${ind}      <span class="bui-accordion-title">${t}</span>\n${ind}      <span class="bui-accordion-indicator"></span>\n${ind}    </button>\n${ind}  </h3>\n${ind}  <div class="bui-accordion-panel">\n${ind}    <div class="bui-accordion-body">\n${ind}      <div class="bui-accordion-content">${extra || text}</div>\n${ind}    </div>\n${ind}  </div>\n${ind}</div>`;
      };
      const nestedHtml = `<p>${TOPICS[0][1]}</p>\n          <div class="bui-accordion bui-accordion-flush" data-bui-accordion>\n${[['Step one', 'Download the files.', 'download'], ['Step two', 'Link the stylesheet.', 'link']].map((t, k) => item(k, '            ', t)).join('\n')}\n          </div>`;
      const list = Array.from({ length: s.items }, (_, i) => item(i, '  ', TOPICS[i], i === 0 && s.nested ? nestedHtml : null));
      return `<div ${attrs(a)}>\n${list.join('\n')}\n</div>`;
    },
    js(s) {
      return `const accordion = BUI.accordion('#faq', {\n  multiple: ${s.mode === 'multiple'},${s.mode === 'single' ? `\n  collapsible: ${s.collapsible},` : ''}\n  animate: ${s.animate},\n  open: ${s.openFirst ? '[0]' : '[]'},\n  onToggle(index, open, accordion) { console.log(index, open); },\n});\n\naccordion.toggle(0);${s.mode === 'multiple' ? '\naccordion.openAll();' : ''}${s.disabled ? '\naccordion.enable(1);   // the second item is disabled in the markup' : ''}`;
    },
    mount: (stage) => window.BUI?.accordion?.init(stage),
  });
})();
