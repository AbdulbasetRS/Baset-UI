# Baset-UI Documentation and GitHub Pages

## 1. Purpose

This document governs the public documentation website: its page structure, shared assets, navigation, language behavior, links, code examples, and GitHub Pages deployment.

The docs site is a developer-facing website. Its scripts and styles must remain separate from the Baset-UI runtime.

## 2. Current structure and target structure

The public repository baseline inspected for this instruction set currently places HTML pages inside `docs/`, with documentation-only CSS and JavaScript inside `docs/assets/`.

The intended deployment structure is GitHub Pages from `main` / `(root)`. The canonical target after the documentation migration is:

```text
/
├── index.html
├── getting-started/
│   ├── introduction.html
│   ├── install.html
│   └── ...
├── customize/
│   └── ...
├── layout/
│   └── ...
├── components/                 # only when component docs exist
├── docs-assets/
│   ├── css/
│   │   └── docs.css
│   └── js/
│       ├── docs.js
│       ├── init.js
│       ├── nav-data.js
│       ├── search.js
│       └── other docs-only scripts
├── assets/                     # public Baset-UI library assets
├── instructions/
└── templates/
```

This is a migration target, not a reason to duplicate pages. Inspect the actual checkout before every task. If migration has not happened, edit the existing `docs/` source in place. If it has happened, do not recreate a `docs/` folder for published pages.

## 3. GitHub Pages deployment

The intended final GitHub Pages configuration is:

- Source: **Deploy from a branch**.
- Branch: **main**.
- Folder: **/(root)**.

The published project site is expected at:

`https://abdulbasetrs.github.io/Baset-UI/`

Claude may not have permission to inspect or change repository Pages settings. Do not claim that the setting was changed unless it was actually verified. If it cannot be changed by the available tools, tell the owner the exact manual setting required.

Do not configure Pages to an old `docs/` folder after the root migration is complete.

## 4. GitHub Project Pages path rules

This is a project site, so the repository name is part of the base path (`/Baset-UI/`).

Avoid root-absolute paths such as:

```html
<link rel="stylesheet" href="/assets/css/baset-ui.css">
```

That path points to the domain root and can cause 404 errors on a project site.

Use relative paths based on each page's depth. For example:

```html
<!-- Root index.html -->
<link rel="stylesheet" href="assets/css/baset-ui.css">
<link rel="stylesheet" href="docs-assets/css/docs.css">

<!-- getting-started/install.html -->
<link rel="stylesheet" href="../assets/css/baset-ui.css">
<link rel="stylesheet" href="../docs-assets/css/docs.css">

<!-- layout/grid-system.html -->
<link rel="stylesheet" href="../assets/css/baset-ui.css">
<link rel="stylesheet" href="../docs-assets/css/docs.css">
```

The examples above assume the target root layout. Calculate paths for the actual page depth; do not paste one path into every page.

A small documented base-path helper may be used if the existing docs system needs it, but do not build a complex routing layer for a static site. Keep local preview and deployed Project Pages paths working.

## 5. Documentation-only assets

- `docs.css` belongs in `docs-assets/css/` after migration.
- Navigation, search, language, highlighting, token demo, and layout demo scripts belong in `docs-assets/js/` after migration.
- Do not place these scripts in `assets/js/`.
- Do not tell library consumers to include documentation assets.
- Load docs assets only on pages that need them, with correct relative paths.

## 6. Page structure and content quality

A page should be focused and should explain the real current implementation. For a component or feature page, include as relevant:

1. Purpose and use cases.
2. Status and browser/feature limitations.
3. Installation or required assets.
4. Basic working example.
5. Variants and states.
6. Options/API and events, if they exist.
7. Responsive behavior.
8. Theme and RTL/LTR behavior.
9. Accessibility and keyboard behavior.
10. Interactive demo/Playground, only if it is functional.
11. Related pages.

For foundation pages, document the actual design tokens, current selectors, breakpoint values, and implemented utilities. Clearly label planned features as planned.

## 7. Navigation, search, and page metadata

When adding, removing, renaming, or moving a page, update every relevant source:

- Navigation data.
- Search index/data.
- Sidebar group and active-page identifiers.
- Breadcrumbs and previous/next links where present.
- Homepage cards and cross-links.
- Language translations.
- Page title and description metadata.
- GitHub edit links.

Use stable page IDs consistently. Do not leave duplicate IDs, broken paths, or stale links to the old `docs/` location.

GitHub edit links should target the new file location in the repository. After pages move to root, do not keep `/edit/main/docs/` in those links.

## 8. Language, direction, and theme

Preserve the documentation site's existing language and theme capabilities.

- Set correct `lang` and `dir` attributes.
- Keep Arabic text RTL and English text LTR.
- Use logical CSS properties in documentation styles.
- Ensure navigation, search, code blocks, tables, and controls remain usable in both directions.
- Do not translate code identifiers, paths, CSS class names, or API names.
- Keep light/dark theme behavior consistent across all pages.

Do not remove a language or theme mode while changing a page unless the task explicitly requests it.

## 9. Code examples

- Examples must match the actual implementation and current asset paths.
- Do not show files that do not exist as required imports.
- Use `class` in HTML, `className` in JSX, and valid syntax for other targets.
- Explain whether a framework example is markup-only or a real adapter.
- Keep examples small and copyable.
- Test links and file references from the page where they appear.
- Do not execute arbitrary example code in the documentation page.

## 10. Migration procedure from `docs/` to root

Perform this as one controlled task:

1. Inspect and inventory every file under `docs/`.
2. Move HTML pages to the repository root and their category folders, preserving filenames and hierarchy where appropriate.
3. Move only documentation assets from `docs/assets/` to `docs-assets/`.
4. Keep public library assets under `assets/`.
5. Update every relative stylesheet, script, image, favicon, navigation, search, breadcrumb, and internal page link.
6. Update the docs base-path logic for project pages and local preview.
7. Update GitHub edit links and README documentation links.
8. Search the repository for stale `docs/` references and broken old paths.
9. Open the root page and nested pages directly; refresh each nested route.
10. Remove the old `docs/` directory only after its required files have been migrated and verified.
11. Tell the owner if Pages settings still need manual configuration.

Do not copy the entire docs folder into root while leaving both copies active.

## 11. Validation checklist

- [ ] Root index loads.
- [ ] Each nested page loads directly by URL and after refresh.
- [ ] CSS and JS requests return successfully; no accidental `/assets/...` domain-root requests.
- [ ] Images, icons, fonts, and favicons load.
- [ ] Navigation and active-page state work.
- [ ] Search returns correct results and opens correct pages.
- [ ] Arabic/English language switching works where implemented.
- [ ] RTL/LTR layout works.
- [ ] Light/dark theme works.
- [ ] Browser console has no new errors.
- [ ] No stale links to the old `docs/` paths remain.
- [ ] GitHub edit links point to the correct file locations.

## 12. Definition of done

A documentation task is complete when the page content is accurate, navigation/search metadata is synchronized, all relative paths work on the GitHub Project Pages base path and local preview, language/direction/theme are preserved, validation results are reported, and the final navigable preview and ZIP are ready.
