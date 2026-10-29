# Baset UI

A lightweight, responsive, Bootstrap-inspired UI library built with **vanilla HTML, CSS and JavaScript** — no frameworks, no build step, no dependencies.

It is both a **library** you can drop into any project and a **personal reference**: every component has its own documentation page with all of its examples, the exact code, and a **Copy** button.

## Live Preview

Explore the full Baset UI documentation website, including interactive component examples, code snippets, customization tools, and the searchable icon gallery.

**<a href="https://abdulbasetrs.github.io/Baset-UI/" target="_blank" rel="noopener noreferrer">Open Baset UI Live Preview ↗</a>**

- Version: `1.0.0`
- Class prefix: `bui-` (e.g. `.bui-btn`)
- CSS variables prefix: `--bui-` (e.g. `--bui-primary`)
- License: MIT

---

## Table of contents

1. [Preview / run the docs](#preview--run-the-docs)
2. [Installation](#installation)
3. [Project structure](#project-structure)
4. [Components](#components)
5. [Class reference](#class-reference)
   - [Grid and layout](#grid-and-layout)
6. [Date and time pickers](#date-and-time-pickers)
7. [Loaders and success icon](#loaders-and-success-icon)
8. [Icons](#icons)
9. [Theming (CSS variables)](#theming-css-variables)
10. [Dark mode](#dark-mode)
11. [JavaScript behaviors](#javascript-behaviors)
12. [Using it with Laravel](#using-it-with-laravel)
13. [Adding a new component](#adding-a-new-component)
14. [Naming convention](#naming-convention)
15. [Browser support](#browser-support)
16. [Status and roadmap](#status-and-roadmap)
17. [Third-party licenses](#third-party-licenses)

---

## Preview / run the docs

No installation is needed. Open `index.html` in a modern browser.

If you prefer a local server (recommended so relative paths behave exactly like production):

```bash
# Python
python -m http.server 8080

# or Node
npx serve .
```

Then open <http://localhost:8080>.

> The Google Fonts import (DM Sans + Manrope) needs an internet connection. Without it the library falls back to the system sans-serif font.

## Installation

Baset UI is plain files. Copy `assets/css/baset-ui.css` and `assets/js/baset-ui.js` into your project and include them:

```html
<link rel="stylesheet" href="assets/css/baset-ui.css">
<script src="assets/js/baset-ui.js"></script>
```

Minimal starter page:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>My project</title>
  <link rel="stylesheet" href="assets/css/baset-ui.css">
</head>
<body>
  <button type="button" class="bui-btn bui-btn-primary">Hello Baset UI</button>
  <script src="assets/js/baset-ui.js"></script>
</body>
</html>
```

Notes:

- **`baset-ui.css` is the only stylesheet you need.** `docs.css` styles the documentation pages only (sidebar, hero, demo and code cards) — do not ship it in your projects.
- `baset-ui.js` is optional. Without it everything still looks right; you only lose the interactions listed in [JavaScript behaviors](#javascript-behaviors).

## CDN

Use Baset UI directly from GitHub Pages without downloading or copying the library files into your project.

### Include CSS and JavaScript

```html
<!-- Baset UI Styles -->
<link rel="stylesheet" href="https://abdulbasetrs.github.io/Baset-UI/assets/css/baset-ui.css">

<!-- Baset Icons (Optional) -->
<link rel="stylesheet" href="https://abdulbasetrs.github.io/Baset-UI/assets/css/baset-icons.css">

<!-- Baset UI JavaScript (Optional) -->
<script src="https://abdulbasetrs.github.io/Baset-UI/assets/js/baset-ui.js"></script>
```

### Notes

- `baset-ui.css` contains the library styles and components.
- `baset-ui.js` is optional and enables supported interactive behaviors.
- No build step or external JavaScript dependencies are required.
- An internet connection is required to load the files.
- Documentation styles (`docs.css`) are not needed in your project.

## Project structure

```
baset-ui/
├── index.html                  # Docs home: overview, installation, component index
├── layout/                     # Layout documentation
│   └── grid.html               # Grid system: containers, 12-column grid, CSS grid, stack, cluster
├── components/                 # One documentation page per component
│   ├── buttons.html
│   ├── forms.html
│   ├── datetime.html           # Date & time pickers: date, time, datetime-local, month, week
│   ├── cards.html
│   ├── alerts.html
│   ├── badges.html
│   ├── loaders.html            # Spinners, dots, bars, skeleton, progress, success icon
│   ├── icons.html              # Icon guide + searchable gallery with details dialog
│   ├── toasts.html             # Toasts & notifications
│   ├── modal.html              # Modal: dialogs, confirmations, drawers, JS API
│   └── utilities.html
├── customize/                  # Theme documentation
│   ├── colors.html             # Default colors (light + dark values, copy var())
│   ├── typography.html         # Fonts, font size, radius, shadow
│   ├── theme.html              # How the tokens work, theme colors, scales, radius, spacing, dark mode
│   ├── token-playground.html   # Live token editor that generates CSS
│   └── direction.html          # RTL / LTR guide with live examples
├── assets/
│   ├── css/
│   │   ├── baset-ui.css        # THE LIBRARY: tokens, base, components, dark theme
│   │   ├── baset-icons.css     # Icon font classes (optional, needs assets/fonts/)
│   │   └── docs.css            # Documentation shell only (not part of the library)
│   ├── fonts/                  # baset-icons-{thin,light,regular,solid,bold,duotone}.woff2
│   ├── icons/
│   │   ├── icons-data.js       # Names, categories, tags (gallery only)
│   │   ├── svg/*.js            # Inline SVG data per style (gallery only, lazy-loaded)
│   │   └── LICENSE-phosphor.txt
│   └── js/
│       ├── baset-ui.js         # Optional interactions
│       ├── baset-datetime.js   # Optional date & time pickers (needs section 18 of baset-ui.css)
│       ├── icons-gallery.js    # Icons page only (search + details dialog)
│       └── token-playground.js     # Token playground page only
├── README.md
├── LICENSE
└── .gitattributes
```

`baset-ui.css` is organised in numbered sections (tokens, base, layout helpers, buttons, forms, cards, alerts, badges, feature grid, responsive) so a new component has an obvious place to go.

## Components

| Component | Page | Examples |
| --- | --- | --- |
| Grid system (Layout) | `layout/grid.html` | Basic and equal columns, auto width, responsive tiers, columns per row, wrapping, offsets, order, vertical / horizontal / self alignment, gutters, nesting, containers, CSS grid (spans, auto-fit), stack, cluster, dashboard and form layouts, RTL, breakpoint and class reference |
| Buttons | `components/buttons.html` | Solid / outline / soft / link in 7 colors, neutral, anchors, sizes, icons, icon-only, pill, full width, group, disabled |
| Form controls | `components/forms.html` | Text input, email input, select, checkbox, form layout, floating labels (basic, sizes, select, textarea), validation states with the i message button, password fields (show / hide, strength meter, requirements, Caps Lock), prefix / suffix inputs (+20, @, https://, $, %), custom select menu (automatic placement, groups, keyboard, modal), live validation forms, JS API |
| Date & time pickers | `components/datetime.html` | The five native types (date, time, datetime-local, month, week) with floating and plain fields, min / max / step, required / disabled / readonly, sizes, popup or bottom sheet, locale / first day / 12-24 h, RTL, dark, custom colors, validation and submit, modal, JS API |
| Cards | `components/cards.html` | Stat cards (sparkline, progress, task lines), cards grid |
| Alerts | `components/alerts.html` | Success, info, warning, danger, alert stack |
| Badges | `components/badges.html` | Six status variants |
| Loaders | `components/loaders.html` | Spinner (sizes, styles, colors, label), dots, bars, pulse/ripple, skeleton, indeterminate progress, loading buttons, overlay, animated success icon |
| Icons | `components/icons.html` | Styles, sizes, colors, in buttons, spinner, inline SVG, searchable gallery |
| Toasts & notifications | `components/toasts.html` | Success, info, warning, danger, toast stack |
| Modal | `components/modal.html` | Basic, sizes, positions, drawers, confirmations, forms, media, nested, RTL, JS API (confirm, alert, prompt, show) |
| Utilities | `components/utilities.html` | Feature grid |

Every example on these pages shows the live preview, the class list, and a code block with a **Copy** button (it copies exactly the code shown).

## Class reference

**Grid and layout** — see [Grid and layout](#grid-and-layout).

**Buttons** — `.bui-btn` + one style. Seven colors — `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `inverse` — in four families:

| Family | Classes |
| --- | --- |
| Solid | `.bui-btn-primary` … `.bui-btn-inverse`, plus `.bui-btn-light` |
| Outline | `.bui-btn-outline-primary` … `.bui-btn-outline-inverse` |
| Soft | `.bui-btn-soft-primary` … `.bui-btn-soft-inverse` |
| Link (text) | `.bui-btn-link` (primary), `.bui-btn-link-secondary` … `.bui-btn-link-inverse` |
| Neutral | `.bui-btn-outline`, `.bui-btn-ghost` |

Modifiers: sizes `.bui-btn-sm` / `.bui-btn-lg`, `.bui-btn-pill`, `.bui-btn-block` (full width), `.bui-btn-icon` (square, icon-only; add `aria-label`). Group buttons with `.bui-btn-group`. Use the native `disabled` attribute for the disabled state; every style also works on `<a class="bui-btn …">`. Color tokens: `--bui-success`, `--bui-danger`, `--bui-warning`, `--bui-info`, `--bui-secondary`, `--bui-inverse`. Row helper: `.bui-button-row`.

**Forms** — `.bui-field` (label wrapper), `.bui-input` (input / select), `.bui-checkline` (checkbox or radio line), `.bui-form-grid` (two-column layout, one column on mobile). Floating labels and validation: see [Floating labels and validation](#floating-labels-and-validation).

**Cards** — `.bui-stat-card` with `.bui-stat-top`, `.bui-stat-icon` (`-purple`, `-blue`, `-orange`), `.bui-stat-change`, `.bui-stat-neutral`, `.bui-stat-label`, `.bui-sparkline`, `.bui-progress`, `.bui-task-lines`. Layout: `.bui-cards-grid`.

**Alerts** — `.bui-alert` + `.bui-alert-success` / `-info` / `-warning` / `-danger`; `.bui-dismiss` for the close button; `.bui-alert-stack` to stack several.

**Badges** — `.bui-badge` + `.bui-badge-primary` / `-success` / `-warning` / `-danger` / `-neutral` / `-info`; group with `.bui-badge-row`.

**Feature grid** — `.bui-feature-grid` with `.bui-feature-icon` inside each item.

**Helpers** — `.bui-muted` (small muted text).

**Loaders and success icon** — see [Loaders and success icon](#loaders-and-success-icon).

**Icons** — see [Icons](#icons).

**Toasts & notifications** — see [Toasts & notifications](#toasts-and-notifications).

## Grid and layout

A mobile-first, 12-column flexbox grid. It is CSS only (no JavaScript), uses logical properties so it mirrors in RTL, and follows the dark/light tokens (it has no colors of its own). Full examples: `layout/grid.html`.

```html
<div class="bui-container">
  <div class="bui-row bui-gutter-3">
    <div class="bui-col-12 bui-col-md-8">Main</div>
    <div class="bui-col-12 bui-col-md-4">Sidebar</div>
  </div>
</div>
```

| Class | Purpose |
| --- | --- |
| `.bui-container`, `-sm` `-md` `-lg` `-xl`, `-fluid` | Centered wrapper with a max-width per breakpoint (`--bui-container-padding` sets the side padding) |
| `.bui-row` | Flex row that wraps; columns are its direct children |
| `.bui-col`, `.bui-col-auto`, `.bui-col-{1-12}` | Equal width, content width, or n of 12 columns |
| `.bui-col-{sm\|md\|lg\|xl}-*` | The same, from that breakpoint up (576 / 768 / 992 / 1200px) |
| `.bui-row-cols-{1-6}` (+ tier) | Set the number of columns per row from the row |
| `.bui-offset-{0-11}` (+ tier) | Leave empty columns before a column (`margin-inline-start`) |
| `.bui-order-{0-5}`, `-first`, `-last` (+ tier) | Visual order |
| `.bui-gutter-{0-5}`, `.bui-gutter-x-*`, `.bui-gutter-y-*` | Gap between columns; sets `--bui-gutter-x` / `--bui-gutter-y` |
| `.bui-items-{start\|center\|end\|baseline\|stretch}`, `.bui-justify-{start\|center\|end\|between\|around\|evenly}`, `.bui-self-{start\|center\|end\|stretch}` | Alignment on the row or on one column |
| `.bui-grid`, `.bui-grid-cols-{1-6}` (+ tier), `.bui-grid-span-{1-6}` (+ tier), `.bui-grid-auto` | CSS grid with equal tracks, spans and auto-fit (`--bui-grid-min`) |
| `.bui-stack`, `.bui-cluster` | Vertical flow and wrapping inline group, spaced by the gutter classes |

Breakpoints follow the viewport width (min-width), not the container width.

## Toasts and notifications

Short messages (**toasts**) and richer **notifications** (media, one-line title, two-line text, time, close button, actions). Use static markup, a `data-` attribute, or the JavaScript API. Full examples: `components/toasts.html`.

| Class | Purpose |
| --- | --- |
| `.bui-toast` + `-success` / `-info` / `-warning` / `-danger` / `-primary` | Toast and its color (none = neutral) |
| `.bui-toast-soft` · `.bui-toast-solid` | Variants |
| `.bui-toast-icon` · `.bui-toast-body` · `.bui-toast-close` · `.bui-toast-progress` | Parts |
| `.bui-notification` (`-unread`) | Notification |
| `.bui-notification-media` (`-round`, `-success` …) | Image, logo or icon |
| `.bui-notification-head` · `-title` (1 line) · `-time` · `-text` (2 lines) · `-actions` · `-close` | Parts |
| `.bui-notification-list` | Notifications in a list |
| `.bui-toast-container[data-position]` | Created by the JS API, one per position |

```html
<!-- declarative -->
<button class="bui-btn bui-btn-primary" data-bui-toast='{"type":"success","title":"Saved","message":"Done"}'>Save</button>
<button class="bui-btn bui-btn-outline" data-bui-notify='{"title":"New comment","message":"Maya replied.","logo":"M"}'>Notify</button>
```

```js
BUI.toast({ type: 'success', title: 'Saved', message: 'Your changes were saved.', position: 'top-end', duration: 5000 });
BUI.toast.danger('Upload failed', { duration: 0 });      // shorthands: primary success info warning danger
BUI.notify({ title: 'New comment', message: 'Maya replied.', image: 'avatar.jpg', time: Date.now(), unread: true });
const t = BUI.toast({ message: 'Uploading…', duration: 0 }); t.close();   // also t.pause(), t.resume()
BUI.clear('top-end');   // one position, or BUI.clear() for all
BUI.config({ position: 'bottom-center', max: 3 });        // defaults; second argument 'toast' | 'notify'
```

Sound: every toast and notification plays a sound. Put your audio files in `assets/sounds/` (mp3, ogg or wav); the default file is `notification.mp3`. Change the sounds in one place, the `BUI.sounds` list in `baset-ui.js` (or at runtime, e.g. `BUI.sounds.success = 'success.mp3'`; a file name inside `assets/sounds/`, or a path / URL containing `/`). Turn it off with `BUI.config({ sound: false })` (second argument `'toast'` or `'notify'` for one kind), per call with `sound: false | 'file.mp3'` and `soundVolume` (0-1), or mute for the user with `BUI.mute(true)` (saved as `bui-sound`). The library ships no audio files, and browsers play sound only after the first user interaction.

Options: `sound`, `soundVolume`, `type`, `variant` (`soft` / `solid`), `title`, `message`, `icon`, `image`, `logo`, `round`, `time` (Date, timestamp, string or `false`), `unread`, `actions` (`[{ label, variant, onClick, keep }]`), `position` (`top|bottom` + `start|center|end`), `duration` (ms, `0` = sticky), `progress`, `pauseOnHover`, `closable`, `max`, `onClick`, `onClose(reason)`. Texts are inserted as plain text. Positions use logical `start` / `end`, so they follow RTL. Defaults: toast 5000 ms with progress bar, notification 8000 ms.



## Loaders and success icon

All loaders are pure CSS (no JavaScript, no font), use `currentColor`, and are part of `baset-ui.css`.

| Component | Markup |
| --- | --- |
| Ring spinner | `<span class="bui-spinner" role="status" aria-label="Loading"></span>` — sizes `-sm`, `-lg`, `-xl`; styles `-dual`, `-gradient` |
| Spinner + label | `<div class="bui-loading-inline"><span class="bui-spinner bui-spinner-sm"></span><span role="status">Loading…</span></div>` |
| Dots | `<span class="bui-dots"><i></i><i></i><i></i></span>` — `-wave`, `-sm` |
| Bars | `<span class="bui-bars"><i></i>` ×5 `</span>` |
| Pulse / ripple | `.bui-pulse`, `<span class="bui-ripple"><i></i><i></i></span>` |
| Skeleton | `.bui-skeleton` + `-title`, `-circle`, `-block`; layout with `.bui-skeleton-row` / `.bui-skeleton-stack` |
| Indeterminate progress | `<div class="bui-progress bui-progress-indeterminate"><span></span></div>` |
| Loading button | `disabled aria-busy="true"` + a `.bui-spinner.bui-spinner-sm` inside the button |
| Overlay | `.bui-loading-host` on the container + `.bui-loading-overlay` inside it |

Change the color with `color:` (e.g. `style="color:#20ad7c"`), or the size with `--bui-loader-size` / `--bui-loader-thickness`. With `prefers-reduced-motion` the loaders slow down instead of stopping.

**Success icon** (animated check, plain SVG + CSS):

```html
<svg class="bui-success-icon" viewBox="0 0 52 52" role="img" aria-label="Success">
  <circle class="bui-success-circle" cx="26" cy="26" r="24"/>
  <path class="bui-success-check" d="M14 27l8 8 16-17"/>
</svg>
```

Add `bui-success-icon-solid` for a filled circle, and `-sm` / `-lg` for sizes. It plays once when it appears; to replay it, re-insert the element (the docs *Replay* button does this).

## Icons

1,512 icons in six styles, used like Font Awesome: one class for the **style** and one for the **icon name**.

```html
<link rel="stylesheet" href="assets/css/baset-icons.css">

<i class="bui-icon-solid bui-icon-file"></i>
<i class="bui-icon-regular bui-icon-file"></i>
<i class="bui-icon-light bui-icon-file"></i>
<i class="bui-icon-thin bui-icon-file"></i>
<i class="bui-icon-bold bui-icon-file"></i>
<i class="bui-icon-duotone bui-icon-file"></i>
```

| Class | Purpose |
| --- | --- |
| `bui-icon-thin` · `-light` · `-regular` · `-solid` · `-bold` · `-duotone` | Style (pick one) |
| `bui-icon-{name}` | The icon, e.g. `bui-icon-file`, `bui-icon-arrow-right` |
| `bui-icon-xs` · `-sm` · `-lg` · `-xl` · `-2xl` | Size (default is `1em`, so it follows the text) |
| `bui-icon-fw` | Fixed width (aligns icons in lists/menus) |
| `bui-icon-spin` | Rotate smoothly around the exact center (use with `spinner`, `circle-notch`, `spinner-gap`) |
| `bui-icon-spin-pulse` | Rotate in 8 steps (classic spoke spinner look) |

- Icons use `currentColor`, so `color` on the icon or any parent colors them.
- Duotone second-layer opacity: `--bui-icon-duotone-opacity` (default `.2`).
- Keep the `assets/fonts/` folder next to `assets/css/` (the fonts are loaded with `../fonts/...`).

**Find an icon:** open `components/icons.html`. Search by name or tag, filter by category, choose a style, then click an icon to open its dialog: all six styles side by side, the **HTML**, **SVG** and **CSS** code with Copy buttons, *Download SVG*, a size slider, and ← / → to move through the results.

**Inline SVG** (no font needed): every icon is also available as SVG (`viewBox="0 0 256 256"`, `fill="currentColor"`) from the dialog's SVG tab.

## Floating labels and validation

Inputs whose label floats up on focus or when the field has a value, with validation states and an **i** button at the end of the field: clicking it opens the message. Full examples: `components/forms.html`.

```html
<div class="bui-float bui-float-error">
  <input class="bui-float-input" id="email" type="email" placeholder=" " value="abdulbaset@">
  <label class="bui-float-label" for="email">Email address</label>
  <button type="button" class="bui-float-info" aria-label="Show message" aria-expanded="false" aria-controls="email-msg">i</button>
  <div class="bui-float-message" id="email-msg" role="status">Enter a valid email address.</div>
</div>
```

| Class | Purpose |
| --- | --- |
| `.bui-float` (`-sm` / `-lg`, `-select`, `-textarea`, `-top`) | Wrapper, sizes, select arrow, textarea, message above the field |
| `.bui-float-input` · `.bui-float-label` | The control (needs `placeholder=" "`) and its label (after the control) |
| `.bui-float-error` · `-success` · `-warning` · `-notice` · `-loading` | State of the field |
| `.bui-float-info` · `.bui-float-message` · `.bui-float-open` | The i button, its message, and the open state |
| `.bui-float-hint` | Helper text that is always visible |
| `.bui-float-toggle` | Show / hide button for password fields (`data-label-show` / `data-label-hide` for other languages) |
| `.bui-float-meter` · `.bui-float-rules` | Password strength meter and requirements checklist |
| `.bui-float-affix` + `.bui-float-prefix` / `-suffix` | Prefix and suffix: `+20`, `@`, `https://`, `$`, `%`, `.com` (a `<select>` can be the prefix) |

**Live validation:** add `data-bui-validate novalidate` to a `<form>`. Fields use normal HTML rules (`required`, `type`, `pattern`, `minlength`, `min`, `max`). They validate on blur, then on every key; on submit the first invalid field gets focus and its message opens. Messages come from data attributes: `data-error` (any rule), `data-error-required` / `-type` / `-pattern` / `-minlength` / `-maxlength` / `-min` / `-max` / `-step`, `data-success`, and `data-match="#id"` with `data-error-match` (confirm password).

**Password fields:** add `<button type="button" class="bui-float-toggle" aria-label="Show password" aria-pressed="false"></button>` after the label. `data-bui-strength` on the input adds a 4-level meter (`data-strength-1` … `-4` for custom labels). `<ul data-bui-rules="#password"><li data-rule="min:8">…` is a live requirements list (`min:N`, `upper`, `lower`, `digit`, `symbol`, `regex:PATTERN`). `data-bui-caps="Caps Lock is on"` opens a warning while Caps Lock is on.

**Prefix and suffix:** `<div class="bui-float bui-float-affix"><span class="bui-float-prefix">+20</span><input class="bui-float-input" placeholder=" "><label>…</label></div>`. The label stays floated. `data-bui-filter="digits|alnum|username|letters"` removes characters while typing, and `data-bui-case="lower|upper"` changes the case.

```js
BUI.float.setState('#username', 'loading');
BUI.float.setState('#username', 'error', 'This username is taken.', { open: true });   // error | success | warning | info | loading
BUI.float.clear('#username');   BUI.float.open('#username', false);
BUI.float.reveal('#password', true);   // show or hide a password
BUI.float.validate(form);       BUI.float.reset(form);                                  // true | false, clear all states
form.addEventListener('bui:valid', (e) => { e.preventDefault(); /* send with fetch() */ });   // also bui:invalid
```

## Select menu

Every single-choice `<select>` with `.bui-float-input`, `.bui-input` or `.bui-float-prefix` opens a custom menu instead of the browser one, with no change to your markup. The native `<select>` stays in the page and stays the source of truth (value, `change` event, `required`, `disabled`, label, form submit); the menu is built from its `<option>` / `<optgroup>` items each time it opens, so options changed with JavaScript are always current. Full examples: `components/forms.html`.

- **Automatic placement:** the menu opens below the field when the whole list fits there, otherwise on the side with more room (and scrolls if even that is too small). It stays inside the window and lines up with the start of the field (the end in RTL). No direction is ever set by the developer.
- **Top layer:** it uses the Popover API when available, so `overflow: hidden` containers never clip it, and it is placed inside the field or the open `<dialog>` so it keeps the theme, direction and tokens and stays clickable inside a modal.
- **Keyboard:** Enter / Space / arrows open it; arrows, Home, End, Page Up / Down move (disabled options are skipped); Enter / Space choose; typing jumps to a matching option; Esc / Tab close it (Esc does not close a modal).
- **Opt out:** `data-bui-native` keeps the browser menu for one select. `multiple` and `size` selects are never changed.

```js
select.add(new Option('Legal', 'legal'));   // options can change at any time, even while the menu is open
select.value = 'design';                    // the field and the menu stay in sync
BUI.select.open(select);   BUI.select.close();   BUI.select.isOpen(select);
select.addEventListener('bui:select-open', fn);  select.addEventListener('bui:select-close', fn);   // a choice also fires input and change
```

Styling: `.bui-select-menu`, `.bui-select-option` (`-active`, `-empty`), `.bui-select-group`, `.bui-select-group-label`; the longest list before scrolling is the `max-height` of `.bui-select-menu` (18rem). CSS anchor positioning is not used because it is not available in every supported browser.

## Date and time pickers

Add `data-bui-datetime` to a native `<input>` of type `date`, `time`, `datetime-local`, `month` or `week` and load `assets/js/baset-datetime.js` (the styles are section 18 of `baset-ui.css`; `baset-ui.js` is not required):

```html
<div class="bui-float">
  <input class="bui-float-input" type="date" id="when" name="when" data-bui-datetime placeholder=" " min="2026-10-10" required>
  <label class="bui-float-label" for="when">Date</label>
</div>
<script src="assets/js/baset-datetime.js" defer></script>
```

The native input stays the source of truth: `id`, `name`, `value`, `min`, `max`, `step`, `required`, `disabled`, `readonly`, validation and form submit are the browser's own, and typing still works. The picker (a calendar, month / year grids and time lists) writes the value in the native format and fires `input` and `change`. Disallowed days, months, hours and minutes are dimmed; `step` is respected. A plain input outside `.bui-float` gets a `<span class="bui-dt">` wrapper for the button. Inputs added later are found automatically.

- **Attributes:** `data-bui-locale`, `data-bui-first-day` (0–6), `data-bui-hour12`, `data-bui-week-numbers`, `data-bui-size="sm|lg"`, `data-bui-mode="popover|sheet"`, `data-bui-popup-class`.
- **Layout:** the popup opens below the field, above it when there is more room, never outside the window; up to 560 px wide it is a bottom sheet.
- **Theme, direction, language:** follows `bui-dark` and `dir="rtl"` / `lang`; button words exist in English and Arabic, add more with `BUI.datetime.locales.fr = { … }`.
- **Customize:** `--bui-dt-cell`, `-bg`, `-fg`, `-muted`, `-border`, `-hover`, `-accent`, `-accent-fg`, `-accent-soft`, `-accent-text`, `-radius`, `-cell-radius`, `-shadow`, `-font`, `-font-size` on `:root` or on a class named in `data-bui-popup-class`.
- **Accessibility:** `role="dialog"`, a labelled calendar grid, full keyboard support (arrows, Home / End, PageUp / PageDown, Esc, Tab kept inside), focus returns to the field.
- **JS:** `BUI.datetime.init(root)`, `.open(input)`, `.close()`, `.isOpen(input?)`; events `bui:datetime-open` / `bui:datetime-close`. Setting `input.value` from code fires no events: dispatch `input` and `change` yourself.
- Where the browser has no native month / week input it shows a text box; the picker still works and checks the typed text against `min` / `max` itself.

Full examples: `components/datetime.html`.

## Modal

Dialogs built on the native `<dialog>` element: backdrop, focus trap, **Esc** key, inert page and focus return come from the browser. Use plain HTML, or the JavaScript API with Promises. Full examples: `components/modal.html`.

| Class / attribute | Purpose |
| --- | --- |
| `.bui-modal` (on a `<dialog>`) + `-sm` / `-lg` / `-xl` / `-fullscreen` | Modal and its size |
| `.bui-modal-top` / `-bottom` / `-start` / `-end` | Position: top, bottom sheet, side drawers (follow RTL) |
| `.bui-modal-header` · `-title` · `-close` · `-body` · `-footer` | Parts (footer: `-footer-start` / `-center` / `-between` / `-stretch`) |
| `.bui-modal-center` + `.bui-modal-icon-success` / `-danger` / `-warning` / `-info` | Centered confirmation layout with a status icon |
| `.bui-modal-scroll` · `.bui-modal-divided` · `.bui-modal-media` | Scrollable body, divider lines, top image |
| `data-bui-modal-open="#id"` · `data-bui-modal-close="value"` · `data-bui-static` | Open, close (value becomes `returnValue`), ignore Esc and backdrop |

```html
<button class="bui-btn bui-btn-primary" data-bui-modal-open="#m-confirm">Delete</button>
<dialog class="bui-modal bui-modal-sm bui-modal-center" id="m-confirm" aria-labelledby="m-confirm-title">
  <div class="bui-modal-body">
    <span class="bui-modal-icon bui-modal-icon-danger" aria-hidden="true">!</span>
    <h3 class="bui-modal-title" id="m-confirm-title">Delete this project?</h3>
    <p>This action cannot be undone.</p>
  </div>
  <div class="bui-modal-footer">
    <button class="bui-btn bui-btn-outline" data-bui-modal-close>Cancel</button>
    <button class="bui-btn bui-btn-danger" data-bui-modal-close="delete">Delete</button>
  </div>
</dialog>
```

```js
BUI.modal.open('m-confirm');  BUI.modal.close('m-confirm', 'value');
const ok = await BUI.modal.confirm({ type: 'danger', title: 'Delete this file?', message: 'You cannot undo this.', confirmText: 'Delete' });   // true | false
await BUI.modal.alert({ type: 'success', title: 'Saved', message: 'Your changes are live.' });
const name = await BUI.modal.prompt({ title: 'Rename', label: 'File name', value: 'report.pdf', required: true });                          // string | null
const choice = await BUI.modal.show({ icon: 'warning', title: 'Save first?', actions: [{ label: 'Discard', value: 'discard' }, { label: 'Save', value: 'save', variant: 'primary' }] });
// onConfirm / action onClick may return a Promise: the button shows a spinner, and returning false keeps the modal open
```

`show()` options: `title`, `message`, `body` (DOM node), `icon` / `type`, `size`, `position`, `static`, `closable`, `footer`, `input`, `actions` (`[{ label, value, variant, autofocus, onClick, input }]`), `onClose`. It returns a Promise with the action value, or `null` when dismissed. Events on the dialog: `bui:modal-open`, `bui:modal-close` (`detail.returnValue`), plus the native `close` and `cancel`. Texts are inserted as plain text.

## Theming (CSS variables)

Everything is driven by CSS variables declared on `:root` in `baset-ui.css`, in three layers:

1. **Color scales** — `--bui-violet-100` … `--bui-violet-900` (also `slate`, `green`, `red`, `amber`, `blue`; 500 is the base).
2. **Theme color tokens** — six theme colors (`primary`, `secondary`, `success`, `danger`, `warning`, `info`), each with the same six tokens:

   | Token | Used for |
   | --- | --- |
   | `--bui-primary-base` | The pure color |
   | `--bui-primary-bg` | Solid backgrounds (solid buttons) |
   | `--bui-primary-bg-subtle` | Tinted backgrounds (alerts, badges, soft buttons) |
   | `--bui-primary-fg` | Text and icons on normal surfaces |
   | `--bui-primary-border` | Borders of tinted components |
   | `--bui-primary-contrast` | Text on the solid background |

   The `-bg-subtle`, `-fg` and `-border` tokens use `light-dark()`, e.g. `light-dark(var(--bui-violet-100), var(--bui-violet-900))`, so dark mode needs no second set of values.
3. **Neutrals, shape, spacing and type** — `--bui-ink`, `--bui-muted`, `--bui-bg`, `--bui-surface`, `--bui-soft`, `--bui-line`, `--bui-input-border`, `--bui-inverse`, `--bui-inverse-on`, `--bui-radius-1` … `--bui-radius-6` (`--bui-radius` = `--bui-radius-5`), `--bui-shadow`, `--bui-spacer`, `--bui-font-size`, `--bui-font-body`, `--bui-font-heading`.

Short aliases such as `--bui-primary`, `--bui-primary-soft`, `--bui-primary-text`, `--bui-success`, `--bui-success-text` still exist and follow the theme color tokens.

**Change the theme** by overriding tokens on `:root`, after `baset-ui.css`:

```css
:root {
  /* use another color scale */
  --bui-primary-base: var(--bui-green-500);
  --bui-primary-bg-subtle: light-dark(var(--bui-green-100), var(--bui-green-900));
  --bui-primary-fg: light-dark(var(--bui-green-600), var(--bui-green-400));
  --bui-primary-border: light-dark(var(--bui-green-300), var(--bui-green-600));

  /* shape and spacing */
  --bui-radius-3: .75rem;   /* buttons, inputs */
  --bui-radius-5: 1.25rem;  /* cards */
  --bui-spacer: 1.125rem;
}
```

If you change a color on an element instead of `:root`, re-declare the derived tokens too (custom properties are resolved where they are declared). The **Token playground** generates the right CSS for you.

`light-dark()` needs a current browser (Chrome, Edge, Firefox, Safari from 2024).

### Customize pages

- `customize/colors.html` — every default color (light and dark value, *Copy var()* button).
- `customize/typography.html` — fonts, font size, radius and shadow.
- `customize/theme.html` — how the tokens are built, the six tokens of each theme color, color scales, radius/spacing, dark mode, and how to override them.
- `customize/token-playground.html` — edit theme colors, radius, spacer and font size, preview in light or dark, and copy the generated CSS. It only changes the preview, not the files.
- `customize/direction.html` — switch the page between RTL and LTR, live examples in both directions, `dir` usage and direction-safe CSS (logical properties).

## Dark mode

Add the class `bui-dark` to `<html>` (or `<body>`). All tokens switch automatically.

```html
<html class="bui-dark">
```

With `baset-ui.js`, any element with `id="themeToggle"` becomes a toggle button. The choice is saved in `localStorage` (key `bui-theme`). To avoid a flash of light theme on load, add this to `<head>` before the stylesheets finish loading (the docs pages already do):

```html
<script>try{if(localStorage.getItem('bui-theme')==='dark')document.documentElement.classList.add('bui-dark')}catch(e){}</script>
```

## JavaScript behaviors

| Feature | How to use |
| --- | --- |
| Theme toggle | Element with `id="themeToggle"` |
| Direction toggle | Element with `id="dirToggle"` (switches RTL/LTR; its label shows the direction you switch to). Or any element with `data-bui-dir="rtl"` or `data-bui-dir="ltr"`; sets `dir` on `<html>` and saves it in `localStorage` (`bui-dir`) |
| Dismissible alerts | `<button class="bui-dismiss">` inside `.bui-alert` (works for alerts added later too) |
| Copy code | `<button class="bui-copy">` inside a `.bui-code-card`; copies the `<code>` text, or the `data-copy` attribute if present |
| Icons gallery | `assets/js/icons-gallery.js` + `assets/icons/icons-data.js` on `components/icons.html` only |
| Token playground | `assets/js/token-playground.js` on `customize/token-playground.html` only |
| Select menu | Custom listbox for `select.bui-input`, `select.bui-float-input`, `select.bui-float-prefix`; `BUI.select.open/close/isOpen()`; `data-bui-native` to opt out |
| Date & time pickers | `assets/js/baset-datetime.js` (separate file): `data-bui-datetime` on `input[type=date|time|datetime-local|month|week]`; `BUI.datetime.init/open/close/isOpen()`, `BUI.datetime.locales` |
| Floating labels | The i button toggles its message; `<form data-bui-validate>` and `BUI.float.setState/clear/open/validate/reset()` |
| Modal | `BUI.modal.open/close/show/confirm/alert/prompt()` or `data-bui-modal-open` / `data-bui-modal-close` attributes |
| Scroll-spy | Sidebar links like `<a class="bui-nav" href="#section">` highlight as you scroll |

## Using it with Laravel

Copy the two files into `public/vendor/baset-ui/` and reference them in your Blade layout:

```blade
<link rel="stylesheet" href="{{ asset('vendor/baset-ui/baset-ui.css') }}">
<script src="{{ asset('vendor/baset-ui/baset-ui.js') }}" defer></script>
```

## Adding a new component

1. Add its CSS to a new numbered section in `assets/css/baset-ui.css` (all classes start with `bui-`, colors come from `--bui-*` variables, include dark-mode support through the variables).
2. Create `components/<name>.html` by copying an existing page; add one `bui-demo-card` per example (preview, class list, code card with Copy button).
3. Add the page link to the sidebar in every HTML file and to the component grid in `index.html`.
4. Update the [Components](#components) and [Class reference](#class-reference) sections here.

## Naming convention

- All library classes use the `bui-` prefix; variants use `bui-<component>-<variant>` (e.g. `bui-btn-primary`, `bui-badge-success`).
- All CSS variables use the `--bui-` prefix.
- Documentation-only classes (sidebar, hero, demo and code cards, `bui-gallery-*`) also use `bui-` but live in `docs.css`.
- Icons: `bui-icon-<style>` + `bui-icon-<name>`.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari.

## Status and roadmap

This is the first starter release and is intentionally small; it is not a complete Bootstrap replacement. Components are added one at a time. The **Layout → Grid system** page documents the grid. The **Utilities** page currently documents the feature grid only — spacing, display and text helpers are planned.

## Third-party licenses

The icon artwork and the font glyphs are from **[Phosphor Icons](https://phosphoricons.com)** (MIT, © Phosphor Icons). The license text is in `assets/icons/LICENSE-phosphor.txt`; keep it if you redistribute the icons.

## License

MIT — see [LICENSE](LICENSE).
