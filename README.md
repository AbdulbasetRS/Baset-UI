# Baset-UI

**Baset-UI** is a framework-agnostic UI library built with standard HTML, CSS, and vanilla JavaScript. It is designed to be usable in plain HTML projects and alongside Laravel Blade, React, Vue, Angular, and other frontend environments.

The core library must remain independent of every frontend framework. Framework-specific integrations, when needed, are separate and optional.

## Project goals

- Easy to use without a framework.
- Compatible with framework-rendered applications.
- Consistent visual language and component APIs.
- Light and dark themes.
- RTL and LTR support.
- Responsive and accessible components.
- Modular JavaScript: users should not need to load every interactive component.
- Interactive documentation with live previews.
- A Playground and Code Generator that use one shared component configuration model.
- No mandatory runtime dependencies and no mandatory build step.

## Current project status

Baset-UI is in its **foundation phase** and is developed incrementally. A component or integration is considered supported only after its implementation, documentation, examples, and relevant tests have been completed.

What exists today:

- `assets/css/baset-ui.css`: design tokens (colors, typography, spacing, radius, shadows) with light and dark theme variables.
- `assets/css/baset-ui-layout.css`: containers, a 12-column grid, gutters, seven responsive breakpoints, and layout utilities.
- A bilingual (English/Arabic) documentation site with search, light/dark theme, and RTL/LTR switching.

What does **not** exist yet: UI components (such as Button), runtime JavaScript (`assets/js/baset-ui.js` is a planned path, not a file), a Playground, a Code Generator, framework adapters, an npm package, and a `LICENSE` file. Check the repository and the documentation before relying on a feature.

## Quick start

Copy the files you need from `assets/css/` into your project and link them. `baset-ui.css` is the only required file; `baset-ui-layout.css` is optional and needs the spacing tokens from `baset-ui.css`.

```html
<link rel="stylesheet" href="assets/css/baset-ui.css">
<link rel="stylesheet" href="assets/css/baset-ui-layout.css">

<div class="bui-container">
    <div class="bui-row">
        <div class="bui-col">First column</div>
        <div class="bui-col">Second column</div>
    </div>
</div>
```

Adjust the paths to your project. These layout classes are plain CSS and need no JavaScript. Dark mode is applied by adding the `bui-dark` class to `<html>`; direction uses the standard `dir` attribute.

## Framework usage

The same markup and stylesheets work wherever HTML and CSS can be rendered. Only the class attribute name changes: `class` in HTML, Vue, Angular, and Laravel Blade, and `className` in React JSX.

```jsx
<div className="bui-container">
    <div className="bui-row">
        <div className="bui-col">First column</div>
    </div>
</div>
```

This demonstrates framework-compatible markup, not proof that a dedicated React, Vue, Angular, or Laravel package exists. None exists today. Dedicated wrapper components will only be documented after they have been implemented and tested.

## Core principles

1. **One core, many environments.** Do not fork the component implementation for every framework.
2. **No forced framework.** The core must work without React, Vue, Angular, or Laravel.
3. **One source of truth.** A component's configuration/schema drives its preview and generated examples.
4. **Progressive development.** Add and complete one component at a time.
5. **Honest support claims.** Mark unfinished integrations and exports clearly.
6. **Backward compatibility.** Avoid breaking existing public classes, methods, events, and variables without a documented migration path.

## Documentation map

The documentation website lives in the repository root: `index.html` and the `getting-started/`, `customize/`, and `layout/` folders, with documentation-only assets in `docs-assets/`. It is intended to be published with GitHub Pages from `main` / `(root)` at <https://abdulbasetrs.github.io/Baset-UI/>. To browse it locally, run a static server from the repository root, for example `python3 -m http.server 8000`, and open `http://localhost:8000/`.

Engineering documents:

| File | Purpose |
|---|---|
| `instructions/ARCHITECTURE.md` | Core architecture, repository boundaries, and engineering principles |
| `instructions/ASSET_ORGANIZATION.md` | Where CSS and JavaScript belong and how they are loaded |
| `instructions/CODE_GENERATOR.md` | Framework-aware code export rules |
| `instructions/CONTRIBUTING.md` | Process for adding and improving components |
| `instructions/DOCUMENTATION.md` | Documentation site structure, paths, and GitHub Pages rules |
| `instructions/PLAYGROUND.md` | Interactive Playground design and behavior |
| `instructions/TASK_WORKFLOW.md` | Mandatory workflow and deliverables for every task |
| `instructions/TESTING_STRATEGY.md` | Testing strategy and quality checks |
| `ROADMAP.md` | Incremental implementation phases |
| `templates/COMPONENT_SPEC_TEMPLATE.md` | Reusable specification template for each component |

## License

The repository does not currently contain a `LICENSE` file, so the terms of use are not defined. The project owner needs to add one. Do not assume or claim a license until the file exists.
