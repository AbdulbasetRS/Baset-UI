# Baset-UI Documentation and GitHub Pages

## 1. Purpose

This document governs the public documentation website: its page structure, shared assets, navigation, language behavior, links, code examples, and GitHub Pages deployment.

The docs site is a developer-facing website. Its scripts and styles must remain separate from the Baset-UI runtime.

## 2. Structure

The documentation pages live in the repository root and its category folders, with documentation-only CSS and JavaScript inside `docs-assets/`. The deployment structure is GitHub Pages from `main` / `(root)`. The canonical structure is:

```text
/
├── index.html
├── getting-started/
├── customize/
├── layout/
└── docs-assets/
    ├── css/
    └── js/
```

Additional category folders (for example `components/`) are added only when real pages for them exist. The other top-level folders (`assets/`, `instructions/`, `templates/`) belong to their own domains and are not documentation pages.

Documentation pages never live in a separate `docs/` directory, and the site is never duplicated. Inspect the actual checkout before every task.

## 3. GitHub Pages deployment

The GitHub Pages configuration is:

- Source: **Deploy from a branch**.
- Branch: **main**.
- Folder: **/(root)**.

The published project site is expected at:

`https://abdulbasetrs.github.io/Baset-UI/`

Claude may not have permission to inspect or change repository Pages settings. Do not claim that the setting was changed unless it was actually verified. If it cannot be changed by the available tools, tell the owner the exact manual setting required.

Never configure Pages to publish from a `docs/` folder.

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

Calculate paths for the actual page depth; do not paste one path into every page.

A small documented base-path helper may be used if the existing docs system needs it, but do not build a complex routing layer for a static site. Keep local preview and deployed Project Pages paths working.

## 5. Documentation-only assets

- `docs.css` belongs in `docs-assets/css/`.
- Navigation, search, language, highlighting, token demo, and layout demo scripts belong in `docs-assets/js/`.
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

Use stable page IDs consistently. Do not leave duplicate IDs, broken paths, or links that reference a `docs/` directory.

GitHub edit links must target the page's actual path in the repository (for example `/edit/main/layout/grid-system.html`), never a `docs/` path.

## 8. Language, direction, and theme

Preserve the documentation site's existing language and theme capabilities.

- Set correct `lang` and `dir` attributes.
- Keep Arabic text RTL and English text LTR.
- Use logical CSS properties in documentation styles.
- Ensure navigation, search, code blocks, tables, and controls remain usable in both directions.
- Do not translate code identifiers, paths, CSS class names, or API names.
- Keep light/dark theme behavior consistent across all pages.
- Reader preferences (theme, language, direction) that the site persists in browser storage are documentation-site behavior. Never document them as a Baset-UI library API, wrap storage access so it fails safely when storage is unavailable, and keep existing keys stable unless a task explicitly migrates them. See `ARCHITECTURE.md`, section 6.1.

Do not remove a language or theme mode while changing a page unless the task explicitly requests it.

## 9. Code examples

- Examples must match the actual implementation and current asset paths.
- Do not show files that do not exist as required imports.
- Use `class` in HTML, `className` in JSX, and valid syntax for other targets.
- Explain whether a framework example is markup-only or a real adapter.
- Keep examples small and copyable.
- Test links and file references from the page where they appear.
- Do not execute arbitrary example code in the documentation page.

## 10. Icons and decorative content

- Follow the icon usage policy in `ARCHITECTURE.md`, section 10, on every page.
- Never use emoji or Unicode/text characters as icons in page content, navigation, sidebar, tables, callouts, or status labels.
- Examples that need an icon use real Baset-UI icon markup and supported icon names; if none exists, omit the optional icon rather than substituting a character.
- Remove decorative emoji from project-authored documentation prose. Preserve emoji only when literal emoji input is the explicit subject of an example.
- Icon-only controls on documentation pages have accessible names, and decorative icons are hidden from assistive technologies.

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
- [ ] No reference to a `docs/` directory exists, and no `docs/` directory exists.
- [ ] GitHub edit links point to the correct file locations.
- [ ] No emoji or text-character icon substitutes appear in page content.

## 12. Definition of done

A documentation task is complete when the page content is accurate, navigation/search metadata is synchronized, all relative paths work on the GitHub Project Pages base path and local preview, language/direction/theme are preserved, validation results are reported, and the final navigable preview and ZIP are ready.
