# Baset-UI Architecture

## 1. Purpose and authority

This document defines the technical architecture of Baset-UI. It applies to the library runtime, its documentation website, interactive demos, Playground, and Code Generator.

The repository's working implementation is the source of truth. This document describes boundaries and intended conventions; it does not authorize rebuilding working code, creating speculative layers, or moving files without a task that requires it.

Read this document together with `ASSET_ORGANIZATION.md`, `DOCUMENTATION.md`, `PLAYGROUND.md`, `CODE_GENERATOR.md`, and `TESTING_STRATEGY.md` when the task touches those areas.

## 2. Product identity

Baset-UI is a lightweight, framework-agnostic UI library built on:

- HTML for markup and semantics.
- CSS for visual presentation and layout.
- Vanilla JavaScript for optional interactive behavior.

The core must not require React, Vue, Angular, Laravel, jQuery, or another framework. The same core markup and styles may be used inside plain HTML, Blade, React, Vue, Angular, or another environment that can render HTML and load CSS/JavaScript.

Framework-compatible markup is not the same as a dedicated framework adapter. Do not claim an adapter exists unless it is implemented, documented, and tested.

## 3. Non-negotiable principles

1. **Framework-agnostic core:** runtime code uses platform standards, not framework APIs.
2. **Progressive enhancement:** static markup and CSS should work without JavaScript whenever practical.
3. **One implementation:** do not fork the same component for different frameworks.
4. **Small, explicit boundaries:** add abstractions only when a real repeated requirement exists.
5. **Design-token driven:** shared visual values use documented `--bui-*` custom properties.
6. **Accessible by default:** semantic HTML, keyboard operation, visible focus, labels, and ARIA only where needed.
7. **Direction-aware:** support both RTL and LTR; prefer CSS logical properties.
8. **Responsive and mobile-first:** preserve the project's documented breakpoint contract.
9. **Documentation is part of the feature:** examples and references must match the real implementation.
10. **No unnecessary dependencies or build tools:** do not introduce them without explaining the need and receiving approval when required.
11. **Backward compatibility:** public classes, variables, methods, events, and options are contracts.
12. **Deliverable quality:** after repository changes, follow `TASK_WORKFLOW.md` for a complete ZIP and navigable preview.

## 4. Repository boundaries

The project has four distinct areas:

### 4.1 Library assets — `assets/`

This is the public library area. It contains only assets intended to be consumed by applications using Baset-UI.

- `assets/css/` contains the public stylesheet(s).
- `assets/js/` is reserved for actual runtime JavaScript, only when runtime behavior exists.
- Optional feature assets may live in clearly named subfolders as defined by `ASSET_ORGANIZATION.md`.
- Do not put documentation navigation, search, highlighting, playground, or demo scripts here.

### 4.2 Documentation website

The current published repository has its HTML pages under `docs/` and documentation-only files under `docs/assets/`. The intended GitHub Pages deployment target is the repository root (`main` / `/(root)`), with HTML pages in the root and category folders and documentation-only assets in `docs-assets/`.

Treat this as a controlled migration: inspect the current location before changing it. Do not create a second copy of the documentation site or leave stale duplicate pages. The canonical final structure and migration checks are defined in `DOCUMENTATION.md`.

### 4.3 Instructions — `instructions/`

All detailed engineering rules live in the eight Markdown documents in this folder. Claude Project Instructions are configured in Claude itself; do not create or rely on a new `CLAUDE.md` file as the primary instruction source.

If an old root-level instruction file exists, do not leave two conflicting sources of truth. Follow the owner's requested migration: move/replace its relevant guidance into `instructions/`, update links, and remove the redundant root copy only after verifying that its content is preserved and the owner has authorized that cleanup.

### 4.4 Templates — `templates/`

Reusable authoring templates live here. The existing `templates/COMPONENT_SPEC_TEMPLATE.md` is the starting point for component specifications. Do not duplicate it in `instructions/` or replace it with a one-off component document.

## 5. Current baseline versus target architecture

The public `main` branch inspected for these instructions contains:

- `assets/css/baset-ui.css`, currently used for design tokens and theme variables.
- `assets/css/baset-ui-layout.css`, currently used for containers, grid, breakpoints, and layout utilities.
- Documentation HTML under `docs/`.
- Documentation styles and scripts under `docs/assets/`.
- `templates/COMPONENT_SPEC_TEMPLATE.md`.
- No public runtime entry file named `assets/js/baset-ui.js` at the time of this baseline review.

These are baseline observations, not guarantees about a user's newer local working tree. Always inspect the actual checkout before applying a rule.

The target stylesheet architecture is one main public stylesheet: `assets/css/baset-ui.css`. It should eventually contain shared tokens, themes, base foundations, typography, layout, grid, breakpoints, common utilities, and other foundational CSS. Large, genuinely optional feature modules may have separate stylesheets.

The target JavaScript architecture may use `assets/js/baset-ui.js` for real shared runtime behavior and separate files for large optional interactive features. Do not create this file merely to satisfy a diagram or instruction. Create it only when working runtime JavaScript exists.

The transition from the current baseline to the target architecture must preserve existing classes, variables, docs examples, and loading behavior. See `ASSET_ORGANIZATION.md`.

## 6. CSS and JavaScript conventions

- Public component classes use the `bui-` prefix.
- Public CSS custom properties use the `--bui-` prefix.
- Preserve existing public names; do not casually rename classes or variables.
- The default theme is light through `:root` and `.bui-light` conventions where used.
- Dark mode uses `.bui-dark` where used by the current implementation.
- Direction comes from the standard `dir="ltr"` or `dir="rtl"` attribute, not an invented theme token.
- Prefer `margin-inline`, `padding-inline`, `inset-inline-*`, `border-inline-*`, `text-align: start/end`, and other logical properties for directional behavior.
- Use the existing breakpoint values and mobile-first ordering when responsive layout utilities are involved. Do not create a second breakpoint system.
- Keep selectors scoped. Avoid global element selectors unless they are part of an explicitly approved base/reset layer.
- Avoid `!important` unless a documented compatibility reason requires it.
- Keep component scripts scoped to their component root and provide cleanup for listeners, observers, timers, and generated nodes.

## 7. Component design

A component should have an explicit contract for the parts that apply:

- Purpose and supported use cases.
- Markup structure and public classes.
- Variants, states, and defaults.
- Public CSS variables.
- JavaScript initialization and lifecycle, if interactive.
- Public methods, events, and callbacks, if any.
- Keyboard and accessibility behavior.
- Responsive behavior.
- Light/dark theme behavior.
- RTL/LTR behavior.
- Documentation examples.
- Playground schema, where useful and implemented.
- Code Generator templates, only for supported targets.
- Tests or manual validation evidence.

Static CSS-only patterns do not need artificial JavaScript instances, methods, or lifecycle APIs.

Use `templates/COMPONENT_SPEC_TEMPLATE.md` for a new substantial component. Do not create a specification for every tiny fix.

## 8. JavaScript architecture

JavaScript is optional. Use it only when markup and CSS cannot reasonably provide the required behavior.

When runtime scripts are introduced:

- Keep the public API small and documented.
- Avoid duplicate initialization.
- Scope selectors to the component or explicitly provided root.
- Validate options and use safe defaults.
- Provide predictable update and destroy/dispose behavior when instances own resources.
- Dispatch documented, useful events from predictable targets.
- Support keyboard behavior and focus management where relevant.
- Clean up event listeners, observers, timers, and generated DOM.
- Do not require consumers to load unrelated component scripts.
- Never use `eval()` or `new Function()`.

A global `BUI` namespace is only an option if it fits the actual API and does not conflict with existing public contracts. Inspect the repository before introducing it.

## 9. Themes, direction, and customization

- Components consume semantic tokens rather than hardcoding separate light/dark colors throughout each component.
- Theme changes should be token-driven and scoped correctly.
- Component-local customization must not unexpectedly change every instance.
- Prefer component-specific custom properties or a caller-supplied wrapper class.
- Do not duplicate global tokens in component files.
- RTL/LTR differences should be handled through logical properties first. Use explicit direction selectors only when the browser behavior or component geometry requires them.
- Icons with directional meaning may need direction-aware presentation; non-directional icons should not be mirrored blindly.

## 10. Playground and Code Generator boundaries

The Playground and Code Generator belong to the documentation/developer experience. They are not required dependencies of the library runtime.

The Playground must preview the real component and use structured configuration. The Code Generator must consume the same normalized configuration as the preview. Neither should infer the component API from scraping rendered DOM.

A component/target combination is supported only when the generated output has been verified. Mark markup-only, experimental, and unavailable targets honestly.

See `PLAYGROUND.md` and `CODE_GENERATOR.md`.

## 11. Framework compatibility

Standard HTML markup can often be copied into Blade, React, Vue, or Angular templates with the framework's syntax adjustments. This demonstrates compatibility, not an integration package.

Do not add framework runtime code to `assets/`. Dedicated adapters, if later approved, must be separate, optional, and tested in the real framework lifecycle. They must not fork core styles or component behavior.

## 12. Performance and security

- Load only assets required by the page or feature.
- Avoid expensive global DOM scans and unnecessary observers.
- Lazy-load large optional modules when appropriate.
- Keep documentation and Playground code out of the consumer runtime.
- Treat Playground inputs and imported configuration as untrusted.
- Render text safely and validate attributes/options.
- Do not execute user-entered or generated code in the docs site.
- Do not store credentials or secrets in browser storage or generated samples.

## 13. Change and migration policy

Before changing a public contract or moving a core file:

1. Inspect all usages in the repository, docs, demos, and templates.
2. Identify whether users may depend on it.
3. Prefer additive or backward-compatible changes.
4. Update every reference and example.
5. Test the new and old loading paths during a migration where feasible.
6. Document any unavoidable breaking change and migration path.
7. Remove obsolete files only after the replacement is verified.

Do not rewrite unrelated components or reorganize the repository merely to match a proposed directory tree.

## 14. Definition of done

An architectural change is complete when the intended boundary is clear, existing public behavior is preserved or deliberately migrated, references and documentation are updated, relevant tests are run, no unnecessary dependencies are added, and the final ZIP and preview are produced as required by `TASK_WORKFLOW.md`.
