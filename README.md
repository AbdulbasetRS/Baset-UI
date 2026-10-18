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
6. [Loaders and success icon](#loaders-and-success-icon)
7. [Icons](#icons)
8. [Theming (CSS variables)](#theming-css-variables)
9. [Dark mode](#dark-mode)
10. [JavaScript behaviors](#javascript-behaviors)
11. [Using it with Laravel](#using-it-with-laravel)
12. [Adding a new component](#adding-a-new-component)
13. [Naming convention](#naming-convention)
14. [Browser support](#browser-support)
15. [Status and roadmap](#status-and-roadmap)
16. [Third-party licenses](#third-party-licenses)

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
├── components/                 # One documentation page per component
│   ├── buttons.html
│   ├── forms.html
│   ├── cards.html
│   ├── alerts.html
│   ├── badges.html
│   ├── loaders.html            # Spinners, dots, bars, skeleton, progress, success icon
│   ├── icons.html              # Icon guide + searchable gallery with details dialog
│   └── utilities.html
├── customize/                  # Theme documentation
│   ├── colors.html             # Default colors (light + dark values, copy var())
│   ├── typography.html         # Fonts, font size, radius, shadow
│   ├── theme.html              # How the tokens work, theme colors, scales, radius, spacing, dark mode
│   └── token-playground.html   # Live token editor that generates CSS
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
| Buttons | `components/buttons.html` | Solid / outline / soft / link in 7 colors, neutral, anchors, sizes, icons, icon-only, pill, full width, group, disabled |
| Form controls | `components/forms.html` | Text input, email input, select, checkbox, form layout |
| Cards | `components/cards.html` | Stat cards (sparkline, progress, task lines), cards grid |
| Alerts | `components/alerts.html` | Success, info, warning, danger, alert stack |
| Badges | `components/badges.html` | Six status variants |
| Loaders | `components/loaders.html` | Spinner (sizes, styles, colors, label), dots, bars, pulse/ripple, skeleton, indeterminate progress, loading buttons, overlay, animated success icon |
| Icons | `components/icons.html` | Styles, sizes, colors, in buttons, spinner, inline SVG, searchable gallery |
| Utilities | `components/utilities.html` | Feature grid |

Every example on these pages shows the live preview, the class list, and a code block with a **Copy** button (it copies exactly the code shown).

## Class reference

**Buttons** — `.bui-btn` + one style. Seven colors — `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `inverse` — in four families:

| Family | Classes |
| --- | --- |
| Solid | `.bui-btn-primary` … `.bui-btn-inverse`, plus `.bui-btn-light` |
| Outline | `.bui-btn-outline-primary` … `.bui-btn-outline-inverse` |
| Soft | `.bui-btn-soft-primary` … `.bui-btn-soft-inverse` |
| Link (text) | `.bui-btn-link` (primary), `.bui-btn-link-secondary` … `.bui-btn-link-inverse` |
| Neutral | `.bui-btn-outline`, `.bui-btn-ghost` |

Modifiers: sizes `.bui-btn-sm` / `.bui-btn-lg`, `.bui-btn-pill`, `.bui-btn-block` (full width), `.bui-btn-icon` (square, icon-only; add `aria-label`). Group buttons with `.bui-btn-group`. Use the native `disabled` attribute for the disabled state; every style also works on `<a class="bui-btn …">`. Color tokens: `--bui-success`, `--bui-danger`, `--bui-warning`, `--bui-info`, `--bui-secondary`, `--bui-inverse`. Row helper: `.bui-button-row`.

**Forms** — `.bui-field` (label wrapper), `.bui-input` (input / select), `.bui-checkline` (checkbox or radio line), `.bui-form-grid` (two-column layout, one column on mobile).

**Cards** — `.bui-stat-card` with `.bui-stat-top`, `.bui-stat-icon` (`-purple`, `-blue`, `-orange`), `.bui-stat-change`, `.bui-stat-neutral`, `.bui-stat-label`, `.bui-sparkline`, `.bui-progress`, `.bui-task-lines`. Layout: `.bui-cards-grid`.

**Alerts** — `.bui-alert` + `.bui-alert-success` / `-info` / `-warning` / `-danger`; `.bui-dismiss` for the close button; `.bui-alert-stack` to stack several.

**Badges** — `.bui-badge` + `.bui-badge-primary` / `-success` / `-warning` / `-danger` / `-neutral` / `-info`; group with `.bui-badge-row`.

**Feature grid** — `.bui-feature-grid` with `.bui-feature-icon` inside each item.

**Helpers** — `.bui-muted` (small muted text).

**Loaders and success icon** — see [Loaders and success icon](#loaders-and-success-icon).

**Icons** — see [Icons](#icons).

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
| Dismissible alerts | `<button class="bui-dismiss">` inside `.bui-alert` (works for alerts added later too) |
| Copy code | `<button class="bui-copy">` inside a `.bui-code-card`; copies the `<code>` text, or the `data-copy` attribute if present |
| Icons gallery | `assets/js/icons-gallery.js` + `assets/icons/icons-data.js` on `components/icons.html` only |
| Token playground | `assets/js/token-playground.js` on `customize/token-playground.html` only |
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

This is the first starter release and is intentionally small; it is not a complete Bootstrap replacement. Components are added one at a time. The **Utilities** page currently documents the feature grid only — spacing, flex, grid and display helpers are planned.

## Third-party licenses

The icon artwork and the font glyphs are from **[Phosphor Icons](https://phosphoricons.com)** (MIT, © Phosphor Icons). The license text is in `assets/icons/LICENSE-phosphor.txt`; keep it if you redistribute the icons.

## License

MIT — see [LICENSE](LICENSE).
