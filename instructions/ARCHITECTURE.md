# Baset-UI Architecture

## 1. Purpose and authority

This document defines the permanent technical architecture of Baset-UI. It applies to the library runtime, its documentation website, interactive demos, Playground, and Code Generator.

The repository's working implementation is the source of truth for what exists. This document defines boundaries and conventions; it does not authorize rebuilding working code, creating speculative layers, or moving files without a task that requires it. Never assume a file, component, API, or feature exists because this document or any other instruction mentions it. Inspect the actual checkout first.

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
12. **Icon discipline:** icons come only from the official Baset-UI icon assets, never from emoji or text characters (section 10).
13. **Deliverable quality:** after repository changes, follow `TASK_WORKFLOW.md` for a complete ZIP and navigable preview.

## 4. Repository boundaries

The project has four distinct areas:

### 4.1 Library assets: `assets/`

This is the public library area. It contains only assets intended to be consumed by applications using Baset-UI.

- `assets/css/` contains the public stylesheet(s).
- `assets/js/` is reserved for actual runtime JavaScript, only when runtime behavior exists.
- Optional feature assets may live in clearly named subfolders as defined by `ASSET_ORGANIZATION.md`.
- Do not put documentation navigation, search, highlighting, Playground, or demo scripts here.

### 4.2 Documentation website

The documentation HTML pages live in the repository root (`index.html`) and its category folders (for example `getting-started/`, `customize/`, `layout/`). Documentation-only CSS and JavaScript live in `docs-assets/`. The GitHub Pages deployment target is the repository root (`main` / `/(root)`).

Documentation pages never live in a separate `docs/` directory. Do not create a second copy of the documentation site or leave duplicate pages. The canonical structure and checks are defined in `DOCUMENTATION.md`.

### 4.3 Instructions: `instructions/`

All detailed engineering rules live in the Markdown documents in this folder, and this folder is their only location. Claude Project Instructions are configured in Claude itself; do not create or rely on a `CLAUDE.md` file as the primary instruction source.

Do not create root-level copies of instruction documents. Two conflicting sources of truth are prohibited, and no instruction may point to a file outside `instructions/` as an authoritative rule source.

### 4.4 Templates: `templates/`

Reusable authoring templates live here. `templates/COMPONENT_SPEC_TEMPLATE.md` is the starting point for component specifications. Do not duplicate it in `instructions/` or replace it with a one-off component document.

## 5. Core stylesheet and JavaScript architecture

### 5.1 Core stylesheet: `assets/css/baset-ui.css`

`assets/css/baset-ui.css` is the single main public stylesheet. It is responsible for the shared foundations of the library:

- Design tokens and shared `--bui-*` custom properties.
- Light and dark themes.
- Base styles (only if the project intentionally adopts a base layer).
- Typography.
- Layout: containers, grid, and gutters.
- Breakpoints and shared responsive utilities.
- Common foundational styles and small shared patterns used broadly across the library.

Foundational categories are sections of this one file. Do not split them into separate public core files.

### 5.2 Optional feature stylesheets

A large, independently useful feature (for example a data table, charts, or a calendar, only when that feature actually exists) may have its own stylesheet under `assets/css/components/`. It loads after the core stylesheet, documents its load order, and never redefines core tokens. `ASSET_ORGANIZATION.md` defines the conditions.

### 5.3 Shared runtime JavaScript: `assets/js/baset-ui.js`

`assets/js/baset-ui.js` holds only stable runtime behavior that multiple implemented components genuinely share. It is created only when working runtime JavaScript exists. Never create it empty or to satisfy a diagram.

### 5.4 Optional feature JavaScript

A substantial optional interactive feature may have its own module under `assets/js/components/`. It can be loaded independently, states whether the core script is required, and has a clear, documented API.

### 5.5 Legacy and transitional files

If an existing file conflicts with this architecture, treat it as a legacy file. Preserve its working behavior, inspect every reference, migrate only inside an explicitly scoped task, validate the new loading path, and remove the legacy file only after confirming that no required references remain. Section 14 and `ASSET_ORGANIZATION.md` define the procedure. A legacy file is never part of the permanent architecture.

## 6. CSS and JavaScript conventions

- Public component classes use the `bui-` prefix.
- Public CSS custom properties use the `--bui-` prefix.
- Preserve existing public names; do not casually rename classes or variables.
- The default theme is light, provided through `:root` and `.bui-light`.
- Dark mode is a CSS theme selector: the `.bui-dark` class, applied to `<html>` (page-wide) or to any element (scoped region). `.bui-light` and `.bui-dark` are public CSS contracts; do not rename or replace them without an approved migration.
- Direction comes from the standard `dir="ltr"` or `dir="rtl"` attribute, not an invented theme token.
- Prefer `margin-inline`, `padding-inline`, `inset-inline-*`, `border-inline-*`, `text-align: start/end`, and other logical properties for directional behavior.
- Use the existing breakpoint values and mobile-first ordering when responsive layout utilities are involved. Do not create a second breakpoint system.
- Keep selectors scoped. Avoid global element selectors unless they are part of an explicitly approved base/reset layer.
- Avoid `!important` unless a documented compatibility reason requires it.
- Keep component scripts scoped to their component root and provide cleanup for listeners, observers, timers, and generated nodes.

### 6.1 Theme selection versus preference storage

Keep these two things separate:

- `.bui-dark` is a CSS theme selector provided by the library.
- `bui-theme` is a `localStorage` key (`"light"` or `"dark"`; absent means follow the operating system) used by the documentation website to remember a reader's choice. It is documentation-site behavior, not a library runtime API.

The library itself provides no theme-persistence API. Applications choose their own storage key and mechanism. Do not describe documentation-only preference storage as a public library API unless an actual library-level API has been implemented and documented.

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

### 7.1 Component boundaries

A component owns its markup contract, public classes and component-level tokens, optional JavaScript behavior, options and defaults, events and lifecycle, documentation examples, Playground schema (where applicable), Code Generator templates (where supported), and tests. Extract shared code only when it is genuinely shared and stable.

### 7.2 Accessibility and motion baseline

- Use semantic HTML first; add ARIA only when native semantics are insufficient, and keep ARIA state synchronized with the real state.
- Give icon-only controls accessible names.
- Keep focus visible (`:focus-visible`) and manage focus for dialogs, menus, popovers, and similar overlays.
- Support Escape where it is an expected dismissal behavior.
- Respect `prefers-reduced-motion`.
- Do not communicate state by color alone.
- Do not claim WCAG conformance without an appropriate audit.

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

Illustrative API shapes (examples only, not a contract and not a statement that they exist): `BUI.toast({ message, variant })` for an instance-less component, or `BUI.datePicker(element, options)` for an element-based one. Where applicable, an interactive instance supports create/initialize, update of options or value, public actions, and destroy/dispose. Name events consistently, document them, dispatch them from a predictable target, and do not expose internal implementation details through them.

## 9. Themes, direction, and customization

- Components consume semantic tokens rather than hardcoding separate light/dark colors throughout each component.
- Theme changes should be token-driven and scoped correctly.
- Component-local customization must not unexpectedly change every instance.
- Prefer component-specific custom properties or a caller-supplied wrapper class.

  ```css
  .my-special-button {
      --bui-button-bg: #6d28d9;
      --bui-button-radius: 999px;
  }
  ```

  The component consumes its local variables and keeps sensible global defaults. The names above are illustrative; define real component variables in the component's specification.
- Do not duplicate global tokens in component files.
- RTL/LTR differences should be handled through logical properties first. Use explicit direction selectors only when the browser behavior or component geometry requires them.
- Icons with directional meaning may need direction-aware presentation; non-directional icons should not be mirrored blindly.

## 10. Icon usage standards

This policy applies to every project area: documentation pages, component examples and demos, Playground previews, Code Generator previews and generated output, navigation and sidebar, buttons, alerts, badges, cards, dropdowns, form controls, empty states, notifications, toolbars, action menus, README visuals, and all future components and features.

### 10.1 Rules

1. Never use emoji as icons anywhere in the project.
2. Never use Unicode symbols, decorative text characters, or emoji as substitutes for UI icons.
3. When an example requires an icon, use an icon from the official Baset-UI icon library or icon assets.
4. Do not introduce an external icon library or a mandatory icon dependency without explicit approval.
5. Do not draw improvised text-based icons with CSS characters or pseudo-elements.
6. Use consistent icon sizing, alignment, stroke or fill style, and color behavior.
7. Icons inherit or respect the surrounding theme and support RTL/LTR where relevant (see section 9 for directional icons).
8. A decorative icon never replaces an accessible label: give the control an accessible name, and hide purely decorative icons from assistive technologies.
9. Do not add icon assets that are not present in the repository.
10. Never present an icon name or implementation as supported unless it exists in the actual icon system.

### 10.2 When the official icon library is unavailable

If the project has no official icon library, or the required icon is missing:

- Do not use an emoji as a temporary replacement.
- Do not silently introduce an external icon package.
- Use an existing approved icon asset if one is available.
- Otherwise omit the optional icon and keep the example functional.
- If the icon is essential to the task, report the missing icon and request approval before introducing a new icon source.

### 10.3 Documentation and generated code

- Use real Baset-UI icon markup and supported icon names in examples.
- Generated code references the actual icon implementation and the assets it requires.
- Never generate emoji-based icon placeholders.
- Keep icon examples synchronized with the installed icon assets.

### 10.4 What is not an icon

These are literal text, not icon substitutes, and are not restricted by this section:

- Keyboard-key labels inside `<kbd>` (for example the Command key glyph in a shortcut hint).
- Typographic punctuation in prose (ellipsis, quotation marks, separators in running text).
- Characters that are the explicit subject of an example, such as input that demonstrates emoji or Unicode handling.

A character used to stand in for a button glyph, status marker, disclosure arrow, or any other UI affordance is an icon substitute and falls under the rules above.

### 10.5 Reviewing existing content

When a task touches project content, classify any emoji or symbol-as-icon occurrence:

- Actual UI icon usage: replace it with an approved icon asset if one is available; otherwise follow section 10.2.
- Project-authored documentation prose: remove decorative emoji.
- Literal emoji input that is the explicit subject of an example: preserve it.

Never replace an emoji with another arbitrary Unicode character.

## 11. Playground and Code Generator boundaries

The Playground and Code Generator belong to the documentation/developer experience. They are not required dependencies of the library runtime.

The Playground must preview the real component and use structured configuration. The Code Generator must consume the same normalized configuration as the preview. Neither should infer the component API from scraping rendered DOM.

A component/target combination is supported only when the generated output has been verified. Mark markup-only, experimental, and unavailable targets honestly.

See `PLAYGROUND.md` and `CODE_GENERATOR.md`.

## 12. Framework compatibility

Standard HTML markup can often be copied into Blade, React, Vue, or Angular templates with the framework's syntax adjustments. This demonstrates compatibility, not an integration package.

Do not add framework runtime code to `assets/`. Dedicated adapters, if later approved, must be separate, optional, and tested in the real framework lifecycle. They must not fork core styles or component behavior.

An adapter is justified only when a component needs framework-specific lifecycle, state, refs, or event integration. An adapter must not duplicate core styles, fork component behavior, make the core depend on the framework, or imperatively mutate framework-owned DOM without a safe integration boundary.

## 13. Performance and security

- Load only assets required by the page or feature.
- Avoid expensive global DOM scans and unnecessary observers.
- Lazy-load large optional modules when appropriate.
- Keep documentation and Playground code out of the consumer runtime.
- Consider virtualization only for genuinely large datasets, where measurement supports it and keyboard/accessibility implications are addressed.
- Avoid adding a dependency for a marginal gain.
- Treat Playground inputs and imported configuration as untrusted.
- Render text safely and validate attributes/options.
- Do not execute user-entered or generated code in the docs site.
- Do not store credentials or secrets in browser storage or generated samples.

## 14. Change and migration policy

Before changing a public contract or moving a core file:

1. Inspect all usages in the repository, docs, demos, and templates.
2. Identify whether users may depend on it.
3. Prefer additive or backward-compatible changes.
4. Update every reference and example.
5. Test the new and old loading paths during a migration where feasible.
6. Document any unavoidable breaking change and migration path.
7. Remove obsolete files only after the replacement is verified and no required references remain.
8. Deprecate before removing when practical, provide a migration example, and update the documentation and any release notes.

Perform a migration only inside a task that explicitly scopes it. Do not describe a migration stage as part of the permanent architecture, and do not leave migration history inside these instruction documents.

When proposing a new shared abstraction or dependency, explain the problem it solves, why browser features or existing utilities are insufficient, its effect on size and maintenance, whether it can remain optional, how it affects framework compatibility, and how it can be tested. Do not introduce an architecture layer merely because it is fashionable.

Do not rewrite unrelated components or reorganize the repository merely to match a proposed directory tree.

## 15. Definition of done

An architectural change is complete when the intended boundary is clear, existing public behavior is preserved or deliberately migrated, references and documentation are updated, relevant tests are run, no unnecessary dependencies are added, and the final ZIP and preview are produced as required by `TASK_WORKFLOW.md`.
