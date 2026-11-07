# Baset-UI Asset Organization

## 1. Purpose

This document defines where public library assets and documentation-only assets belong, how they are loaded, and when a separate CSS or JavaScript file is justified.

The rules apply to every task that creates, edits, moves, renames, bundles, or references CSS, JavaScript, icons, or fonts.

## 2. Two asset domains

Keep these domains separate:

### Public library assets

`assets/` contains files that an application consuming Baset-UI may need.

Examples:

- Core CSS.
- Optional feature CSS.
- Runtime JavaScript, when implemented.
- Optional feature JavaScript.
- Public icons or fonts, only when the library actually uses and distributes them.

### Documentation-only assets

Documentation navigation, search, language switching, code highlighting, demos, live token controls, and Playground UI are not part of the library runtime.

They live under `docs-assets/`.

Do not place docs-only assets in `assets/` and do not include them in consumer installation instructions.

## 3. Target directory structure

Use the following as the intended organization. Create only directories needed by real files; never create empty placeholder folders.

```text
assets/
├── css/
│   ├── baset-ui.css
│   └── components/
│       ├── datatable.css       # only if this is a real optional feature
│       ├── charts.css          # only if this is a real optional feature
│       └── calendar.css        # only if this is a real optional feature
├── js/
│   ├── baset-ui.js             # only when shared runtime JS exists
│   └── components/
│       ├── datatable.js        # only if implemented
│       ├── charts.js           # only if implemented
│       └── calendar.js         # only if implemented
├── icons/                      # only if public library icons exist
└── fonts/                      # only if public library fonts exist

docs-assets/
├── css/
│   └── docs.css
└── js/
    ├── docs.js
    ├── init.js
    ├── nav-data.js
    ├── search.js
    └── other-docs-only-scripts.js
```

This tree is the intended organization, not an inventory. Files marked "only if" exist only when the corresponding feature is real. Always inspect the actual checkout to learn which files exist, and never reference a file that does not.

## 4. CSS file policy

### 4.1 Main stylesheet: `assets/css/baset-ui.css`

This is the single main stylesheet for shared and foundational library CSS.

It should contain the common foundation, including where implemented:

1. Design tokens and shared CSS custom properties.
2. Light and dark theme values.
3. Base/reset rules, only if the project intentionally adopts them.
4. Typography foundations.
5. Containers and layout foundations.
6. Grid system and gutters.
7. Breakpoints and responsive utilities.
8. Display, flex, alignment, spacing, and other common utilities.
9. Small shared patterns used broadly across the library.

Do not split these foundational categories into separate public files merely because they are logically different sections.

Do not create files such as:

- `baset-ui-layout.css`
- `baset-ui-grid.css`
- `baset-ui-utilities.css`
- `baset-ui-typography.css`
- `baset-ui-breakpoints.css`
- `baset-ui-helpers.css`

If a legacy file in `assets/css/` overlaps this foundation, do not create another file of the same kind. Handle it with the legacy-file rules in section 8.

### 4.2 Optional feature stylesheets

A separate stylesheet is allowed only for a substantial, independently useful feature that users may reasonably want to load separately.

Examples may include DataTable, Charts, Calendar/Scheduler, Rich Text Editor, or another complex widget, but only when that feature actually exists.

Before creating a separate feature stylesheet, verify all of the following:

- The feature is large enough to justify an independent asset.
- It has a clear public feature boundary.
- Consumers can load it independently after the core stylesheet.
- It is not simply a foundational utility or a few shared selectors.
- The split reduces unnecessary loading or improves maintainability without creating brittle coupling.
- Its CSS dependencies and required load order are documented.

Keep feature styles under `assets/css/components/` using a stable name, such as `datatable.css`.

Do not create a separate file for one small variant, a handful of selectors, or an ordinary shared utility.

### 4.3 CSS authoring rules

- Public classes use `bui-`.
- Public variables use `--bui-`.
- Reuse existing tokens before adding new ones.
- Use logical properties for RTL/LTR-sensitive layout.
- Avoid unnecessary global selectors and `!important`.
- Keep feature styles scoped to the feature.
- Avoid redefining core tokens in feature stylesheets.
- Do not silently change existing class behavior or specificity.
- Ensure theme colors come from semantic tokens where practical.

## 5. JavaScript file policy

### 5.1 Runtime JavaScript rule

Never assume `assets/js/baset-ui.js` exists; check the checkout. JavaScript under `docs-assets/` is documentation code, not library runtime code.

Never create an empty `baset-ui.js` just to satisfy a proposed structure. If a task is CSS-only, keep it CSS-only.

### 5.2 Core runtime: `assets/js/baset-ui.js`

When multiple implemented components genuinely need shared runtime behavior, put only stable shared runtime code in this file, such as:

- Shared DOM/event helpers.
- Common initialization utilities.
- Stable shared accessibility/focus helpers.
- A public namespace/registration mechanism, if the actual API requires one.

Do not turn the core into a large collection of unrelated component implementations.

### 5.3 Optional feature scripts

Large interactive features may live in `assets/js/components/`, such as `datatable.js` or `calendar.js`, when they can be loaded independently and have a clear API.

A feature script should:

- State whether the core script is required.
- Document load order and initialization.
- Avoid duplicate initialization.
- Scope DOM work to its own root/instance.
- Clean up listeners, observers, timers, and generated elements.
- Validate options and handle missing/invalid markup safely.
- Avoid mandatory third-party dependencies unless approved.

Do not split every small helper into a separate file. Do not create empty or speculative files.

### 5.4 Documentation JavaScript

Keep documentation-only scripts in `docs-assets/js/`.

Examples include navigation, search, language switching, code highlighting, live token demos, and layout demonstrations. These scripts must not be presented as part of the Baset-UI consumer API.

## 6. Icons and fonts

- Add public icon/font files only when a real feature uses them and distribution is intentional.
- Do not add large font/icon bundles for a single optional glyph.
- Document licenses and attribution for third-party assets.
- Do not invent an icon naming API before one exists.
- Do not add an external icon library or a mandatory icon dependency without explicit approval.
- Never use emoji or Unicode/text characters as icons. The full icon usage policy is in `ARCHITECTURE.md`, section 10; follow it for every icon decision.
- Icon assets live in `assets/icons/` only when they are real, public, and distributed intentionally. Never reference an icon file or icon name that does not exist.
- Keep documentation logos, favicons, and illustrative images separate if they are not library assets.

## 7. Loading order

For a page that uses only foundational styling, load only:

```html
<link rel="stylesheet" href="assets/css/baset-ui.css">
```

For a page using an optional feature stylesheet, load core first and the optional feature second:

```html
<link rel="stylesheet" href="assets/css/baset-ui.css">
<link rel="stylesheet" href="assets/css/components/datatable.css">
```

For runtime JavaScript, load only the files required by the feature. Use `defer` for normal static scripts where appropriate. Do not load documentation scripts in a consumer application.

These paths are illustrative (an optional feature stylesheet is loaded only if that feature exists) and must be adjusted for a nested page's relative depth. See `DOCUMENTATION.md` for GitHub Pages path rules.

## 8. Legacy files and asset migration

### 8.1 Legacy files

An existing file that conflicts with the architecture above (for example a foundational stylesheet split out of `baset-ui.css`) is a legacy file. Handle it as follows:

- Preserve its working behavior until a migration is explicitly scoped.
- Inspect every reference to it: page links, script tags, documentation, examples, and generated code.
- Migrate only inside an explicitly scoped task, preserving every supported class, variable, selector, and responsive behavior.
- Validate the new loading path on root and nested pages.
- Remove the legacy file only after confirming that no required references remain.

Do not create additional files of the same legacy kind, and do not treat a legacy file as part of the permanent architecture.

### 8.2 Migration procedure

When merging, moving, or renaming assets:

1. Inspect the actual working tree and `git status` first.
2. Search the whole repository for imports, links, script tags, documentation references, examples, and build/copy rules.
3. Record the current public classes, selectors, variables, and load order.
4. Make the smallest safe migration.
5. Update all references in the same task.
6. Verify no stale references remain.
7. Test both root and nested documentation pages.
8. Remove the old file only after the new file contains the required implementation and checks pass.
9. Report any external URLs or user integrations that could not be inspected.

Never overwrite user changes or delete a file just because it appears redundant by name.

## 9. Prohibited patterns

- Splitting common layout, grid, typography, breakpoints, or utility CSS into multiple public core files.
- Mixing docs-only scripts into the consumer runtime.
- Creating empty CSS/JS files or unused folders.
- Bundling every optional feature into a file users must always load.
- Duplicating shared tokens across feature files.
- Adding a build process or package manager requirement without approval.
- Adding an external icon library or icon dependency without approval.
- Using emoji, Unicode symbols, or CSS text characters as icons.
- Referencing a file that does not exist.

## 10. Definition of done

An asset change is complete when the file is in the correct domain, its public API and load order are clear, all references are updated, no duplicate or stale implementation remains, RTL/LTR and themes are preserved where relevant, and the final ZIP/preview workflow has been completed.
