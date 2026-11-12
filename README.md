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
7. [File upload](#file-upload)
   - [Rich text editor](#rich-text-editor)
8. [Charts and data visualization](#charts-and-data-visualization)
9. [DataTable](#datatable)
   - [Calendar and scheduler](#calendar-and-scheduler)
   - [Stepper and wizard](#stepper-and-wizard)
10. [Loaders and success icon](#loaders-and-success-icon)
11. [Icons](#icons)
12. [Theming (CSS variables)](#theming-css-variables)
13. [Dark mode](#dark-mode)
14. [JavaScript behaviors](#javascript-behaviors)
15. [Using it with Laravel](#using-it-with-laravel)
16. [Adding a new component](#adding-a-new-component)
17. [Naming convention](#naming-convention)
18. [Browser support](#browser-support)
19. [Status and roadmap](#status-and-roadmap)
20. [Third-party licenses](#third-party-licenses)

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
- Every page in `components/` opens with a **Customize** playground (`#customize`): change the options, see the live preview in light, dark, LTR or RTL, and copy the generated HTML or JavaScript. It is documentation only (`component-playground*.js`); to add one to a new component, register a config with `BUIPlayground.add('name', { controls, html, js, mount })` and put `<div data-bui-playground="name"></div>` in the page.

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
│   ├── upload.html             # File upload: dropzone, previews, checks, uploads
│   ├── editor.html             # Rich text editor: toolbars, fonts, colors, RTL, dark, source view, API
│   ├── navigation.html         # Navbar, sidebar, footer and combined layouts
│   ├── charts.html             # Charts: line, bar, area, pie, doughnut, radar, scatter, mixed, radial, gauge
│   ├── datatable.html          # DataTable: 40 sections, 45 live examples
│   ├── calendar.html           # Calendar & Scheduler: month / week / day, drag and drop, resize, Arabic RTL, 14 live examples
│   ├── stepper.html            # Stepper & wizard: horizontal / vertical, completed / active / error, multi-step forms with validation, 8 live examples
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
│   ├── chart-playground.html   # Live chart editor (type, animation, colors, options) that generates the code
│   ├── datatable-playground.html # Live DataTable editor: switch features on / off, preview, copy the generated code
│   ├── direction.html          # RTL / LTR guide with live examples
│   └── layout-playground.html  # Live navbar + sidebar + footer builder that generates the HTML
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
│       ├── baset-upload.js     # Optional file upload (needs section 19 of baset-ui.css)
│       ├── baset-editor.js     # Optional rich text editor (needs section 23 of baset-ui.css)
│       ├── baset-charts.js     # Optional SVG charts (needs section 20 of baset-ui.css)
│       ├── baset-datatable.js  # Optional DataTable (needs section 21 of baset-ui.css)
│       ├── baset-calendar.js   # Optional Calendar & Scheduler (needs section 23 of baset-ui.css)
│       ├── baset-stepper.js    # Optional Stepper & wizard (needs section 24 of baset-ui.css)
│       ├── datatable-docs.js   # DataTable documentation page only (sample data, fake API): do not ship
│       ├── icons-gallery.js    # Icons page only (search + details dialog)
│       ├── token-playground.js     # Token playground page only
│       ├── chart-playground.js     # Chart playground page only (needs baset-charts.js)
│       ├── layout-playground.js    # Layout playground page only (needs baset-ui.js)
│       ├── datatable-playground.js # DataTable playground page only (needs baset-datatable.js + datatable-docs.js)
│       ├── component-playground.js         # "Customize" section on every component page: engine (docs only, do not ship)
│       └── component-playground-configs.js # One config per component: controls, markup and code to copy (docs only)
├── README.md
├── LICENSE
└── .gitattributes
```

`baset-ui.css` is organised in numbered sections (tokens, base, layout helpers, buttons, forms, cards, alerts, badges, feature cards, responsive) so a new component has an obvious place to go.

## Components

| Component | Page | Examples |
| --- | --- | --- |
| Grid system (Layout) | `layout/grid.html` | Basic and equal columns, auto width, responsive tiers, columns per row, wrapping, offsets, order, vertical / horizontal / self alignment, gutters, nesting, containers, CSS grid (spans, auto-fit), stack, cluster, dashboard and form layouts, RTL, breakpoint and class reference |
| Buttons | `components/buttons.html` | Solid / outline / soft / link in 7 colors, neutral, anchors, sizes, icons, icon-only, pill, full width, group, disabled |
| Form controls | `components/forms.html` | Text input, email input, select, checkbox, form layout, floating labels (basic, sizes, select, textarea), validation states with the i message button, password fields (show / hide, strength meter, requirements, Caps Lock), prefix / suffix inputs (+20, @, https://, $, %), custom select menu (automatic placement, groups, keyboard, modal), live validation forms, JS API |
| Date & time pickers | `components/datetime.html` | The five native types (date, time, datetime-local, month, week) with floating and plain fields, min / max / step, required / disabled / readonly, sizes, popup or bottom sheet, locale / first day / 12-24 h, RTL, dark, custom colors, validation and submit, modal, JS API |
| File upload | `components/upload.html` | Drop zone for `input[type=file]` with drag and drop, image grid and file list, checks (type, size, count), disabled and error states, and server uploads with progress, cancel and retry |
| Rich text editor | `components/editor.html` | Basic, full, minimal and custom toolbars, fonts and sizes, text / background colors, RTL, dark mode, readonly, disabled, HTML source view, initial content, textarea / form use, JavaScript API (get / set content, `exec`), max length, height and resize |
| Cards | `components/cards.html` | Stat cards (sparkline, progress, task lines), cards grid |
| Alerts | `components/alerts.html` | Success, info, warning, danger, alert stack |
| Badges | `components/badges.html` | Six status variants |
| Loaders | `components/loaders.html` | Spinner (sizes, styles, colors, label), dots, bars, pulse/ripple, skeleton, indeterminate progress, loading buttons, overlay, animated success icon |
| Icons | `components/icons.html` | Styles, sizes, colors, in buttons, spinner, inline SVG, searchable gallery |
| Toasts & notifications | `components/toasts.html` | Success, info, warning, danger, toast stack |
| Modal | `components/modal.html` | Basic, sizes, positions, drawers, confirmations, forms, media, nested, RTL, JS API (confirm, alert, prompt, show) |
| Navbar, sidebar & footer | `components/navigation.html` | Navbar (basic, inverse / primary, centered element, app header with clock / time zone / language / theme / notifications / user, avatar-only user button, always collapsed, sticky, RTL), sidebar (basic, groups, user, Help and Log out, mini rail, RTL), footer (simple, columns, inverse, status, RTL), layouts (landing page, dashboard, push and overlay drawer sidebar, RTL dashboard) |
| Utilities | `components/utilities.html` | Feature cards |
| Charts & data visualization | `components/charts.html` | Line (basic, multiple, smooth, points, area fill), bar (vertical, horizontal, grouped, stacked, rounded, negative values), area (basic, multiple, stacked), pie, doughnut (center text, custom colors, legend with values and percentages), radar, scatter, mixed bar + line, radial progress, gauge; animation styles and easings; sales and operations dashboards; options, number formats, empty and invalid data, JS API, live data, responsive, RTL, dark mode |
| DataTable | `components/datatable.html` | 40 sections (incl. a complete with-API / without-API example): HTML-table and JS init, pagination, search, multi-column sort, column visibility / reorder / resize, filters and search builder, selection, inline and modal editing, row actions, buttons, copy / CSV / Excel / PDF / JSON / print, responsive and card view, AJAX and server-side, Laravel API, state, grouping, fixed columns, virtual scrolling, i18n, RTL, dark, themes, API, events, extensions |
| Calendar & Scheduler | `components/calendar.html` | 14 live examples, each with complete HTML + CSS + JS and a Copy button: basic, month ("+N more"), week (overlapping events), day, add / edit / delete, drag and drop, resizing, details popup, Arabic RTL, languages and first day, light / dark, colors and categories, callbacks and events, JavaScript API; plus the option, method, callback and keyboard reference |
| Stepper & wizard | `components/stepper.html` | 8 live examples with HTML (and JS where needed) and a Copy button: states, sizes, vertical, icons, multi-step form with validation, vertical wizard, free navigation, custom validation |

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

**Forms** — `.bui-field` (label wrapper), `.bui-input` (input / select), `.bui-checkline` (checkbox or radio line), form layouts use the grid system: `.bui-row` with `.bui-col-12 .bui-col-md-6` on each field (two columns from 768px, one on mobile). Floating labels and validation: see [Floating labels and validation](#floating-labels-and-validation).

**Cards** — `.bui-stat-card` with `.bui-stat-top`, `.bui-stat-icon` (`-purple`, `-blue`, `-orange`), `.bui-stat-change`, `.bui-stat-neutral`, `.bui-stat-label`, `.bui-sparkline`, `.bui-progress`, `.bui-task-lines`. Layout: `.bui-row` with `.bui-col-12 .bui-col-md-4` on each card.

**Alerts** — `.bui-alert` + `.bui-alert-success` / `-info` / `-warning` / `-danger`; `.bui-dismiss` for the close button; `.bui-alert-stack` to stack several.

**Badges** — `.bui-badge` + `.bui-badge-primary` / `-success` / `-warning` / `-danger` / `-neutral` / `-info`; group with `.bui-badge-row`.

**Feature cards** — `.bui-feature` (card look for one item) with `.bui-feature-icon` inside; lay the items out with `.bui-row` and `.bui-col-*`.

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

**Breaking change — removed layout classes.** `.bui-form-grid`, `.bui-cards-grid`, `.bui-feature-grid`, `.bui-chart-grid-2` and the grid part of `.bui-chart-kpis` were removed; use the grid system instead.

| Removed | Use instead |
|---|---|
| `.bui-form-grid` | `.bui-row` + `.bui-col-12 .bui-col-md-6` on each field |
| `.bui-cards-grid` | `.bui-row` + `.bui-col-12 .bui-col-md-4` on each card |
| `.bui-feature-grid` | `.bui-row` + `.bui-col-12 .bui-col-md-4 .bui-feature` on each item |
| `.bui-chart-grid-2` | `.bui-row` + `.bui-col-12 .bui-col-lg-6` on each chart card |
| `.bui-chart-kpis` (grid) | `.bui-row .bui-chart-kpis` + `.bui-col-6 .bui-col-lg` on each tile (the class now only adds bottom spacing) |

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

- **Attributes:** `data-bui-locale`, `data-bui-first-day` (0–6), `data-bui-hour12`, `data-bui-week-numbers`, `data-bui-size="sm|lg"`, `data-bui-mode="popover|sheet"`, `data-bui-popup-class`, `data-bui-click-open="false"` (a click anywhere on the field opens the picker by default; this limits it to the button).
- **Layout:** the popup opens below the field, above it when there is more room, never outside the window; up to 560 px wide it is a bottom sheet.
- **Theme, direction, language:** follows `bui-dark` and `dir="rtl"` / `lang`; button words exist in English and Arabic, add more with `BUI.datetime.locales.fr = { … }`.
- **Customize:** `--bui-dt-cell`, `-bg`, `-fg`, `-muted`, `-border`, `-hover`, `-accent`, `-accent-fg`, `-accent-soft`, `-accent-text`, `-radius`, `-cell-radius`, `-shadow`, `-font`, `-font-size` on `:root` or on a class named in `data-bui-popup-class`.
- **Accessibility:** `role="dialog"`, a labelled calendar grid, full keyboard support (arrows, Home / End, PageUp / PageDown, Esc, Tab kept inside), focus returns to the field.
- **JS:** `BUI.datetime.init(root)`, `.open(input)`, `.close()`, `.isOpen(input?)`; events `bui:datetime-open` / `bui:datetime-close`. Setting `input.value` from code fires no events: dispatch `input` and `change` yourself.
- Where the browser has no native month / week input it shows a text box; the picker still works and checks the typed text against `min` / `max` itself.

Full examples: `components/datetime.html`.

## File upload

Add `data-bui-upload` to a native `<input type="file">` and load `assets/js/baset-upload.js` (the styles are section 19 of `baset-ui.css`; no other script is needed). The script wraps the input in a drop zone, lists the chosen files and checks them. The native input stays in the page and keeps only the files that passed the checks (kept in sync with `DataTransfer`), so a normal form submit sends exactly the listed files and a removed file is not sent.

```html
<label class="bui-upload-caption" for="photos">Photos (up to 2 MB, 6 files)</label>
<input type="file" id="photos" name="photos" multiple accept="image/png,image/jpeg,image/webp"
       data-bui-upload data-bui-layout="grid" data-bui-max-size="2MB" data-bui-max-files="6">
<script src="assets/js/baset-upload.js" defer></script>
```

- **Native attributes** are kept: `id`, `name`, `accept`, `multiple`, `required`, `disabled`, `capture`, `form`. Always set `accept`: without it every type is allowed. `accept` is also applied to dropped files.
- **Rules:** `data-bui-max-size` / `-min-size` (`500KB`, `5MB`), `data-bui-max-files` / `-min-files`, `required`. Messages are in English or Arabic (from `lang` or `data-bui-locale`); add a language with `BUI.upload.locales.fr = { … }`.
- **Look:** `data-bui-variant="dropzone|compact|button|avatar"` (avatar = one round profile photo, or square with `data-bui-shape="square"`), `data-bui-layout="list|grid"`, `data-bui-size="sm|lg"`, `data-bui-title`, `data-bui-hint`, `data-bui-no-preview`. Colors, radius, sizes and spacing come from `--bui-up-*` variables; it follows `bui-dark` and `dir="rtl"`.
- **Choosing is not uploading:** without `data-bui-url` (or `BUI.upload.configure`) files are only selected. With a URL each file is sent as its own `multipart/form-data` POST with real progress, Cancel and Retry; `data-bui-auto` starts as soon as files are chosen. Rows say "Uploaded" only after the server answered.
- **JS:** `BUI.upload.init(root)`, `.configure(input, { url, method, field, data, headers, withCredentials, uploader })`, `.files(input)`, `.add(input, files)`, `.remove(input, file)`, `.clear(input)`, `.upload(input)`, `.retry(input, file)`, `.validate(input)`. Events on the input: `input`, `change`, `bui:upload-add|reject|remove|start|progress|success|error|complete`.
- **Browsers without `new DataTransfer()`** cannot edit `input.files`: files are still selected, checked and previewed, but rejected or removed files cannot be kept out of the form.

Full examples: `components/upload.html`.

## Rich text editor

A WYSIWYG editor built on `contenteditable` and the Selection / Range API (formatting does not use `document.execCommand`). Load `assets/js/baset-editor.js` (the styles are **section 23** of `baset-ui.css`; `baset-ui.js` is not required). Full examples: `components/editor.html`.

```html
<script src="assets/js/baset-editor.js" defer></script>
<div data-bui-editor data-bui-toolbar="full" data-bui-placeholder="Write something…" data-bui-height="260">
  <p>Initial <strong>content</strong></p>
</div>
```

A `<textarea data-bui-editor name="body">` keeps its `name`, so a normal form submit sends the HTML.

- **Toolbar:** `data-bui-toolbar="full | basic | minimal | none"` or tool names, `|` starts a group: `bold italic | ul ol | link`. Tools: `bold italic underline strike subscript superscript clear fontFamily fontSize color highlight heading alignLeft alignCenter alignRight alignJustify ul ol indent outdent quote link image table hr codeBlock undo redo selectAll fullscreen source`.
- **Attributes / options:** `data-bui-placeholder`, `-height`, `-min-height`, `-max-height`, `-resize`, `-dir`, `-locale` (`en`, `ar`), `-fonts` (`Arial|Georgia|Label=stack`), `-sizes`, `-colors`, `-maxlength`, `-counter`, `-readonly`, `-disabled`, `-name`, `-sticky`. `BUI.editor(el, options)` overrides attributes; extra options: `value`, `sanitize`, `imageUpload(file)`, `maxImageSize`, `onChange`.
- **JS:** `getHTML() getText() getLength() isEmpty() setHTML(html) insertHTML(html) clear() exec(name, value) undo() redo() selectAll() focus() toggleSource() toggleFullscreen() setReadonly() setDisabled() setPlaceholder() setDir() setHeight() setToolbar() on(name, fn) destroy()`; `BUI.editor.get(el) / create / init / sanitize / locales`.
- **Events** (on the editor element): `bui:editor-change` (`detail.html`), `-ready`, `-focus`, `-blur`, `-source`, `-fullscreen`, `-error`.
- **Safety:** content from paste, drop, `setHTML` and the source view goes through an allow-list sanitizer (no scripts, event handlers, `javascript:` links, iframes or unknown tags); Word / Google Docs markup is cleaned. Use `sanitize: false` only for content you trust, and always sanitize again on the server.
- **Theme and direction:** built on the `--bui-*` tokens (dark mode and RTL follow the page; `.bui-editor-dark` / `.bui-editor-light` force one editor). Undo / redo use the editor's own history.


## Charts and data visualization

Load `assets/js/baset-charts.js` (the styles are section 20 of `baset-ui.css`; no other script is needed). Charts are drawn as SVG, with no dependencies and no CDN. Colors, text and grid come from `--bui-chart-*` tokens built on the Baset UI tokens, so dark mode and RTL / LTR work without extra code.

```html
<div id="sales-chart"></div>
<script src="assets/js/baset-charts.js"></script>
<script>
  const chart = BUI.chart('#sales-chart', {
    type: 'line',   // line · bar · area · pie · doughnut · radar · scatter · mixed · radial · gauge
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{ label: 'Sales', data: [120, 190, 150, 250], color: '#6366f1' }]
    },
    options: { responsive: true, animation: true, showLegend: true, showGrid: true }
  });
</script>
```

- **No JavaScript:** `<div data-bui-chart="bar" data-bui-labels="Mon,Tue,Wed" data-bui-data="12,19,7" data-bui-color="#6658e8"></div>`, or `data-bui-config='{ "data": …, "options": … }'` for everything.
- **Options:** `responsive`, `width`, `height`, `animation`, `animationStyle`, `easing`, `duration`, `showLegend`, `legendPosition`, `legendValues`, `showGrid`, `showGridX`, `showLabels`, `showValues`, `showTooltip`, `smooth`, `points`, `fill`, `stacked`, `horizontal`, `rounded`, `colors`, `maxPoints`, `min`, `max`, `locale`, `format` (preset, `Intl.NumberFormat` options with `prefix` / `suffix`, or a function), `axisFormat`, `formatRight`, `formatX`, `cutout`, `centerText`, `thickness`, `thresholds`, `xTitle`, `yTitle`, `emptyText`, `ariaLabel`.
- **Datasets:** `label`, `data`, `color`, `colors` (one per slice), `type` and `axis` (mixed charts), `fill`, `smooth`, `points`, `dash`, `hidden`. Scatter points are `{ x, y, r }`.
- **JS:** `chart.update(data)`, `.setOptions(options)` (may change `type`), `.setColors(array)`, `.toggle(index)`, `.replay()`, `.resize()`, `.destroy()`; `BUI.chart.init(root)` and `BUI.chart.get(element)`. Events on the container: `bui:chart-render`, `bui:chart-click`.
- **Animations:** `animationStyle` is `grow` (default), `rise`, `fade`, `slide`, `zoom`, `reveal` or `draw`; `easing` is `ease-out` (default), `ease-in-out`, `linear`, `back`, `bounce` or `elastic`. `chart.replay()` plays the first animation again. Updates always morph from the old values. The **Chart playground** lets you pick them and copy the code.
- **Behavior:** a tooltip on hover, a legend that hides and shows series, smooth animation (skipped with reduced motion), redraw on container resize and when the page direction changes, no errors on empty or invalid data. Negative values are supported by bar, line, area and scatter charts; pie, doughnut and radial ignore them.
- **Tokens:** `--bui-chart-1` … `--bui-chart-8`, `--bui-chart-text`, `--bui-chart-strong`, `--bui-chart-grid`, `--bui-chart-axis`, `--bui-chart-surface`, `--bui-chart-track`, `--bui-chart-font`, `--bui-chart-font-size`, `--bui-chart-line-width`. Layout helpers: `.bui-chart-card`, `.bui-chart-kpis` / `.bui-chart-kpi` (lay cards out with `.bui-row` + `.bui-col-*`).

Full examples: `components/charts.html`.

## DataTable

An optional, dependency-free data grid. Load `assets/js/baset-datatable.js` (the styles are **section 21** of `baset-ui.css`, class prefix `bui-dtbl-`; `baset-ui.js` is not required):

```html
<link rel="stylesheet" href="assets/css/baset-ui.css">
<script src="assets/js/baset-datatable.js" defer></script>
<div id="users"></div>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    const dt = BUI.dataTable('#users', {
      data: [{ id: 1, name: 'Sara' }],
      columns: [{ data: 'id', title: 'ID' }, { data: 'name', title: 'Name' }],
      pageLength: 10, searching: true, ordering: true, responsive: true,
      buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
    });
    dt.search('sara').order([[1, 'asc']]).draw();
  });
</script>
```

An existing `<table data-bui-datatable>` upgrades itself (options as `data-*` attributes).

- **Data:** array of objects or arrays, an HTML table, `ajax` (load once) or `serverSide: true` (page / search / sort / filter on your API). `rowId` names the id field (default `id`).
- **Options (most used):** `pagination`, `paginationType` (`numbers`, `full_numbers`, `simple`, `compact`, `first_last`), `pageLength`, `lengthMenu`, `pageJump`, `searching`, `searchDelay`, `searchHighlight`, `columnSearch`, `ordering`, `order`, `orderMulti`, `filters`, `filterLogic`, `searchBuilder`, `colVisibility`, `colReorder`, `colResize`, `fixedHeader`, `scrollY`, `fixedColumns`, `virtualScroll`, `rowGroup`, `select` (`single`, `multi`, `checkbox`, `cell`), `rowActions`, `rowActionsMode`, `editor`, `buttons`, `bulkActions`, `responsive`, `cardView`, `cardBreakpoint`, `stateSave`, `theme`, `variant`, `density`, `striped`, `bordered`, `language`, `export`.
- **Columns:** `data`, `title`, `render(value, type, row, meta)`, `type`, `orderable`, `searchable`, `visible`, `hideable`, `width`, `minWidth`, `maxWidth`, `priority`, `className`, `filter`, `filterOptions`, `filterFn`, `sortFn`, `sortValue`, `nulls`, `editor`, `exportable`, `exportFormat`, `exportTitle`.
- **Export:** Copy, CSV (UTF-8 with BOM), JSON and print need nothing. **Excel is a real `.xlsx`** (a ZIP of Office Open XML written in the browser). **PDF is a real PDF**: Latin text uses a built-in text writer (selectable text); other scripts such as Arabic are drawn with the browser's text engine and stored as page images inside the PDF (not selectable). For selectable Arabic text register `BUI.dataTable.adapters.pdf = (data, options, dt) => Blob | Promise<Blob>` (for example with pdfMake and your font); `BUI.dataTable.adapters.excel` can replace the workbook writer. No external library is ever loaded by default.
- **Methods:** `search`, `order`, `page` (`page.info()`), `pageLength`, `draw`, `column(i).visible()`, `rows(selector).data() / add / update / remove / select`, `row(id)`, `clear`, `selected`, `filter`, `filterLogic`, `builder`, `addFilter`, `clearFilters`, `create`, `edit`, `delete`, `ajax.reload`, `export`, `exportData`, `cardView`, `fullscreen`, `theme`, `state`, `clearState`, `reset`, `on / one / off`, `destroy`. Setters are chainable and batch a redraw.
- **Events** (`dt.on(name, (detail, dt) => {})`, also DOM `bui:dtbl-<name>`): `init`, `draw`, `search`, `order`, `page`, `length`, `select`, `deselect`, `rowClick`, `rowDoubleClick`, `filter`, `create`, `edit`, `delete`, `rowAction`, `beforeExport`, `afterExport`, `ajaxLoad`, `ajaxError`, `responsiveChange`, `columnVisibility`, `columnReorder`, `columnResize`, `destroy`.
- **Editor:** no backend is built in. `editor: { mode: 'inline' | 'modal', onCreate, onUpdate, onDelete }` take promise-returning functions; throw to show a server error in the form. Validation: `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate(value, row)`.
- **Server side:** `ajax: { url, paramStyle: 'rest' | 'datatables' | 'json', method, headers, data, params, map, fetch }`. The default REST request is `?page=&per_page=&search=&sort=-name,email&filter[col]=...`; the default response is `{ "data": [...], "meta": { "total": N } }` (a Laravel controller example is in the docs).
- **Languages:** English and Arabic built in (`language: { locale: 'ar' }` also sets RTL). Add one with `BUI.dataTable.locales.fr = { ... }`; override any string in `language`.
- **Theming:** `--bui-dtbl-bg`, `-fg`, `-muted`, `-border`, `-header-bg`, `-header-fg`, `-hover`, `-selected`, `-stripe`, `-accent`, `-accent-fg`, `-radius`, `-px`, `-py`, `-font-size`, plus the global `--bui-*` tokens. Light / dark follows `.bui-dark`; direction follows `dir`.
- **Toolbar, selection and export extras:** `buttonIcons: true | 'only'` (built-in SVG icons; per button `icon`, `iconOnly`), `lengthInput: true` (the page-size menu ends with a number input; `lengthMax`), `selectionToggle: true` + `dt.selectionColumn(on?)` (show / hide the checkbox column from the Columns menu; it is never exported), `bulkBar: false` (selection is visual only: no "N selected" bar). `export.rows` defaults to `'auto'`: the ticked rows if any, otherwise every row matching the current search / filters on all pages (with `serverSide` the table re-requests the full result with `per_page=0`, or use `export.fetchAll`).
- **Option columns:** `columns[].options` (strings or `{ value, label }`) feeds the editor select, the Filters panel and the search builder (equals / does not equal show a `<select>` of the options; boolean columns show Yes / No).
- **Row actions and view modal:** `rowActions: [{ name, text, icon, iconOnly, title, className, menu: ['view', 'edit', 'delete'] }]` (`menu` makes a dropdown button), `view: { title(row), render(row, dt), wide }` for a custom "view details" modal. See the *Complete example* section of `components/datatable.html` (with and without an API).
- **Security note:** `render()` output is inserted as HTML (like DataTables); escape user data in your renderers. Plain cells are always inserted as text.

Full examples: `components/datatable.html`.

## Calendar and scheduler

CSS in section 23 of `baset-ui.css`; the component is the optional, dependency-free `assets/js/baset-calendar.js` (no build step). Full examples and reference: `components/calendar.html`.

```html
<div id="calendar"></div>
<script src="assets/js/baset-calendar.js"></script>
<script>
  const calendar = BUI.calendar('#calendar', {
    view: 'month',                // 'month' | 'week' | 'day'
    date: new Date(),
    events: [
      { id: 1, title: 'Meeting', description: 'Weekly sync', start: '2026-11-04T10:00:00', end: '2026-11-04T11:30:00', color: 'primary', category: 'work' },
      { id: 2, title: 'Holiday', start: '2026-11-06', end: '2026-11-08', allDay: true, color: 'success' },   // all-day: date only, end day included
    ],
    editable: true, selectable: true, draggable: true, resizable: true,
    firstDay: 0,                  // 0 = Sunday … 6 = Saturday (default: from the locale)
    locale: 'ar', direction: 'rtl',   // Arabic + RTL (names, digits and times come from Intl)
    onEventClick: (event, jsEvent) => {},          // return false = no built-in popup
    onEventCreate: (event) => {},                  // return false = refuse
    onEventUpdate: (event, oldEvent, info) => {},  // info.source: edit | drag | resize | keyboard; return false = revert
    onEventDelete: (event) => {},                  // return false = keep
    onDateClick: (date, jsEvent) => {},
    onViewChange: (view, info) => {},
  });

  calendar.addEvent({ title: 'New', start: '2026-11-10T09:00:00' });
  calendar.updateEvent(1, { title: 'Renamed' });
  calendar.removeEvent(2);
  calendar.getEvents(); calendar.getEventById(1);
  calendar.setDate('2026-12-01'); calendar.setView('week'); calendar.next(); calendar.prev(); calendar.today();
  calendar.destroy();
</script>
```

- **Views:** month (today circle, selected day, "+N more" popover), week and day (time grid, all-day row, now line, overlapping events side by side, events that cross midnight).
- **Events:** `{ id, title, description, start, end, allDay, color, category }`; `color` is `primary | secondary | success | danger | warning | info` or any CSS color. Times are local (no time zone). Extra properties are kept. `editable: false` on an event locks it.
- **Editing:** the built-in dialog adds, edits and deletes (delete needs a second click; `confirmDelete: false` removes that). Click a day, click **Add event**, or drag over empty time slots to create.
- **Drag and drop:** move between days (month) or days and times (week / day), resize by dragging the top or bottom edge, a dashed ghost shows the drop position, text is never selected, touch works (press and hold to drag; resize handles respond at once), `Esc` cancels. Keyboard: `Alt` + arrows on a focused event. Times snap to `snap` minutes (default 15).
- **Languages and direction:** English and Arabic labels built in; add one with `BUI.calendar.locales.fr = { ... }`. `locale` also sets `direction: 'auto'` (RTL for Arabic, Hebrew, Persian, Urdu …); `direction: 'rtl' | 'ltr'` forces it. All layout uses logical CSS properties, so it mirrors fully.
- **Other options:** `views`, `toolbar`, `addButton`, `categories`, `colors`, `monthMaxEvents`, `hourHeight`, `dayStart`, `dayEnd`, `snap`, `scrollTime`, `height`, `defaultDuration`, `defaultStartHour`, `hour12`, `nowIndicator`, `animate`, `labels`.
- **More methods:** `setEvents`, `getRange`, `select`, `showEvent`, `openEditor`, `setOptions`, `refresh`, `on` / `off`, `BUI.calendar.instance(el)`. DOM events on the container: `bui:cal-eventclick`, `-eventcreate`, `-eventupdate`, `-eventdelete`, `-dateclick`, `-viewchange`, `-navigate`, `-change`.
- **Tokens:** `--bui-cal-today`, `--bui-cal-select`, `--bui-cal-radius`, `--bui-cal-cell-h`, `--bui-cal-hour`, `--bui-cal-body-h`, `--bui-cal-gutter`. Declarative: `<div data-bui-calendar data-bui-view="week" data-bui-locale="ar" data-bui-events='[...]'>`.

## Stepper and wizard

A progress indicator that can become a multi-step form. The CSS alone draws the steps; `assets/js/baset-stepper.js` adds the Back / Next navigation and the validation before each move.

```html
<form class="bui-stepper" id="wizard" data-bui-stepper data-bui-validate novalidate>
  <ol class="bui-stepper-list">
    <li class="bui-step"><button type="button" class="bui-step-head">
      <span class="bui-step-marker">1</span>
      <span class="bui-step-text"><span class="bui-step-title">Account</span><span class="bui-step-desc">Email and password</span></span>
    </button></li>
    <!-- more steps -->
  </ol>
  <div class="bui-stepper-panel"><!-- fields of step 1 --></div>
  <!-- one .bui-stepper-panel per step, in the same order -->
  <div class="bui-stepper-actions">
    <button type="button" class="bui-btn bui-btn-outline" data-bui-step-prev>Back</button>
    <button type="button" class="bui-btn bui-btn-primary" data-bui-step-next>Next</button>
    <button type="button" class="bui-btn bui-btn-success" data-bui-step-finish>Finish</button>
  </div>
</form>
<script src="assets/js/baset-stepper.js"></script>
```

| Class | Use |
|---|---|
| `.bui-stepper` · `.bui-stepper-list` · `.bui-step` | Container, the `<ol>`, one step |
| `.bui-step-head` · `.bui-step-marker` · `.bui-step-text` · `.bui-step-title` · `.bui-step-desc` | A `<button>` head makes the step clickable; a `<span>` keeps it static |
| `.bui-step-active` · `.bui-step-done` · `.bui-step-error` | States (set by the script, or by hand for a static stepper) |
| `.bui-stepper-vertical` · `.bui-stepper-sm` · `.bui-stepper-lg` | Direction and size (`--bui-step-size` sets the marker diameter) |
| `.bui-stepper-panel` · `.bui-stepper-actions` · `.bui-stepper-count` · `.bui-stepper-done` | Step content, button row, "2 / 3" counter, the block shown after `complete()` |

**Options** (also `data-bui-*` attributes): `start`, `linear` (jumping ahead validates every step in between), `clickable` (`true`, `'done'` or `false`), `validate` (`false`, or a function `(index, panel, stepper)` that runs after the built-in field checks and returns `true`, `false` or an error text), `beforeChange(to, from, stepper)`, `onChange`, `onInvalid`, `onFinish`, `animate`, `focus`, `enterKey`, `labels`. Put `data-bui-validate="false"` on a panel to skip its validation.

Validation uses `BUI.float.validate` for floating-label fields and the browser's constraint validation for the rest; add `data-bui-validate` to the form so fields revalidate while the person types. `finish()` validates every step, fires the cancelable `bui:stepper-finish`, then submits the form with `requestSubmit()` (or calls `complete()` when there is no form).

## Navbar, sidebar and footer

CSS in section 22 of `baset-ui.css`; the toggles, live clock and theme button are optional (`baset-ui.js`). Full examples: `components/navigation.html`; build your own in `customize/layout-playground.html`.

```html
<nav class="bui-navbar">
  <a class="bui-navbar-brand" href="#">Baset</a>
  <button class="bui-navbar-toggle" type="button" data-bui-navbar-toggle aria-expanded="false" aria-controls="nav" aria-label="Toggle navigation"><span></span></button>
  <div class="bui-navbar-collapse" id="nav">
    <ul class="bui-navbar-nav"><li><a class="bui-navbar-link active" href="#">Home</a></li></ul>
    <div class="bui-navbar-actions"><a class="bui-btn bui-btn-primary bui-btn-sm" href="#">Sign in</a></div>
  </div>
</nav>
```

| Class / attribute | Purpose |
| --- | --- |
| `.bui-navbar` + `-inverse` / `-primary` / `-flat` / `-sticky` / `-always` | Navbar, colors, flat, sticky, always collapsed (below 768px it collapses by itself) |
| `.bui-navbar-center` · `-actions` · `-search` · `-select` · `-clock` · `-iconbtn` / `-dot` | Centered element, action area, search, small select, clock text, notification button and counter |
| `.bui-navbar-user` (+ `-icon`) | Account button, same height as the icon buttons; `-icon` = avatar only |
| `.bui-sidenav` + `-brand` / `-label` / `-link` / `-text` / `-badge` / `-group` / `-sub` / `-bottom` / `-user` / `-close` / `-mini` | Sidebar; groups use `<details>`; `-mini` is the icon rail |
| `.bui-site-footer` + `-cols` / `-title` / `-links` / `-bottom` / `-nav` / `-social` / `-tools` / `-inverse` / `-center` | Footer |
| `.bui-shell` + `-single` / `-drawer` (push) / `-overlay` / `-main` / `-content` / `-toggle` / `-backdrop` | App layout; below 992px the sidebar opens in the layout and the main column reflows to the remaining width (`-overlay` = floating drawer with a backdrop) |
| `data-bui-navbar-toggle` · `data-bui-shell-toggle` · `data-bui-sidenav-collapse="#id"` | Toggles |
| `data-bui-clock` (+ `data-bui-clock-tz="#select"` or `data-bui-tz`) · `data-bui-theme-toggle` | Live clock (ticks every second) and a theme button |

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
- `customize/chart-playground.html` — pick a chart type, animation style, easing, palette and options, preview in light or dark and RTL or LTR, and copy the generated chart code (full example or options only).
- `customize/datatable-playground.html` — switch DataTable features on or off from a collapsible panel (data source, pagination, search, filters, columns, selection, editing, row actions, buttons, appearance, language, RTL, dark), with Minimal / Standard / Everything presets; the table is rebuilt live and the code shows only the options that differ from the defaults.
- `customize/layout-playground.html` — build a navbar, sidebar and footer together or apart (colors, items, clock, time zone, language, theme, notifications, user menu, mini rail, push / overlay drawer), preview in light / dark and LTR / RTL, and copy the generated HTML (everything or one part).
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

### One global: `BUI`

Every script exposes its API on the single `BUI` object, in camelCase. Components you create from code are callable and `new` is optional; the rest are small namespaces.

| Call | What it does |
|---|---|
| `BUI.dataTable('#users', options)` | DataTable (statics: `.locales`, `.adapters`, `.init(root)`) |
| `BUI.chart('#sales', options)` | Chart (statics: `.init(root)`, `.get(el)`, `.defaults`, `.palette`) |
| `BUI.calendar('#cal', options)` | Calendar (statics: `.locales`, `.instance(el)`, `.init(root)`) |
| `BUI.editor('#body', options)` | Rich text editor (statics: `.get(el)`, `.locales`, `.sanitize(html)`) |
| `BUI.stepper('#wizard', options)` | Stepper / wizard (statics: `.get(el)`, `.init(root)`) |
| `BUI.toast()` · `BUI.notify()` | Toasts and notifications |
| `BUI.modal.*` · `BUI.select.*` · `BUI.dropdown.*` · `BUI.float.*` · `BUI.datetime.*` · `BUI.upload.*` | Namespaces with `open / close / init ...` helpers |

`instanceof BUI.dataTable` works, and the class itself is available as `BUI.dataTable.Class`.

**Breaking change — removed names.** `new BasetDataTable()`, `new BasetChart()`, `new BasetCalendar()`, `new BasetEditor()` (and their `BasetX.locales` / `.adapters` / `.init` statics) and the classes `BUI.DataTable`, `BUI.Chart`, `BUI.Calendar` no longer exist. Replace `new BasetX(` with `BUI.x(` and `BasetX.` with `BUI.x.` (`x` = `dataTable`, `chart`, `calendar`, `editor`). `BUI.editor.create(t, o)` still works.

| Feature | How to use |
| --- | --- |
| Theme toggle | Element with `id="themeToggle"` |
| Direction toggle | Element with `id="dirToggle"` (switches RTL/LTR; its label shows the direction you switch to). Or any element with `data-bui-dir="rtl"` or `data-bui-dir="ltr"`; sets `dir` on `<html>` and saves it in `localStorage` (`bui-dir`) |
| Dismissible alerts | `<button class="bui-dismiss">` inside `.bui-alert` (works for alerts added later too) |
| Copy code | `<button class="bui-copy">` inside a `.bui-code-card`; copies the `<code>` text, or the `data-copy` attribute if present |
| Icons gallery | `assets/js/icons-gallery.js` + `assets/icons/icons-data.js` on `components/icons.html` only |
| Token playground | `assets/js/token-playground.js` on `customize/token-playground.html` only |
| Chart playground | `assets/js/chart-playground.js` (+ `baset-charts.js`) on `customize/chart-playground.html` only |
| DataTable playground | `assets/js/datatable-playground.js` (+ `baset-datatable.js`, `datatable-docs.js`) on `customize/datatable-playground.html` only |
| Select menu | Custom listbox for `select.bui-input`, `select.bui-float-input`, `select.bui-float-prefix`; `BUI.select.open/close/isOpen()`; `data-bui-native` to opt out |
| Date & time pickers | `assets/js/baset-datetime.js` (separate file): `data-bui-datetime` on `input[type=date|time|datetime-local|month|week]`; `BUI.datetime.init/open/close/isOpen()`, `BUI.datetime.locales` |
| File upload | `assets/js/baset-upload.js` (separate file): `data-bui-upload` on `input[type=file]`; `BUI.upload.init/configure/files/add/remove/clear/upload/retry/validate()`; events `bui:upload-*` |
| Rich text editor | `assets/js/baset-editor.js` (separate file): `data-bui-editor` on a `div` / `textarea`, or `BUI.editor(target, options)`; `getHTML / setHTML / exec / undo / redo / destroy`; `BUI.editor.get/create/init/sanitize/locales`; events `bui:editor-*` |
| Charts | `assets/js/baset-charts.js` (separate file): `BUI.chart(target, { type, data, options })` or `data-bui-chart`; `update / setOptions / setColors / toggle / resize / destroy()`; `BUI.chart.init/get()`; events `bui:chart-render`, `bui:chart-click` |
| DataTable | `assets/js/baset-datatable.js` (separate file): `BUI.dataTable(target, options)` or `data-bui-datatable` on a `<table>`; `search / order / page / pageLength / column / rows / row / draw / export / destroy`; `BUI.dataTable.locales`, `.adapters` |
| Calendar & Scheduler | `assets/js/baset-calendar.js` (separate file): `BUI.calendar(target, options)` or `data-bui-calendar`; `addEvent / updateEvent / removeEvent / getEvents / getEventById / setEvents / setDate / setView / next / prev / today / getRange / showEvent / openEditor / setOptions / on / off / destroy()`; events `bui:cal-*` |
| Stepper & wizard | `assets/js/baset-stepper.js` (separate file): `BUI.stepper(target, options)` or `data-bui-stepper`; `next / prev / goTo / validate / finish / complete / reset / setState / destroy`; `BUI.stepper.get/init()`; events `bui:stepper-change`, `bui:stepper-invalid`, `bui:stepper-finish` |
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
