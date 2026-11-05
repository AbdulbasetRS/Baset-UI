# CLAUDE.md — Baset-UI Project Instructions

These instructions define how AI coding agents must work in the Baset-UI repository. Follow them together with `ARCHITECTURE.md`, `PLAYGROUND.md`, `CODE_GENERATOR.md`, `TESTING.md`, and `CONTRIBUTING.md`.

If instructions conflict, do not silently choose a risky interpretation. Prefer preserving working behavior and public APIs, explain the conflict, and ask only when a decision is genuinely blocking.

---

## 1. Project identity

Baset-UI is a framework-agnostic UI library based on:

- Standard HTML.
- CSS.
- Vanilla JavaScript.
- Optional framework integrations that live outside the core.

The same core styles and component behavior should be reusable in:

- Plain HTML projects.
- Laravel Blade applications.
- React applications.
- Vue applications.
- Angular applications.
- Other environments that render standard HTML.

Baset-UI is not a React library, an Angular library, or a Laravel-only package.

### Primary goals

1. Simple adoption and predictable APIs.
2. Small, modular, maintainable implementation.
3. Consistent components and design tokens.
4. Light/dark theme support.
5. RTL/LTR support.
6. Responsive behavior and accessibility.
7. Documentation with working live examples.
8. An interactive Component Playground.
9. A framework-aware Code Generator.
10. Incremental development without unnecessary rewrites.

## 2. Non-negotiable rules

- Do not introduce a mandatory frontend framework into the core.
- Do not add mandatory runtime dependencies without explicit approval.
- Do not introduce a mandatory build process unless the project owner approves the change.
- Do not make existing components depend on the Playground or documentation code.
- Do not copy and maintain separate implementations of the same core component for each framework.
- Do not claim that an integration, export target, or test is supported unless it has actually been implemented and verified.
- Do not remove existing features, public APIs, CSS classes, events, or configuration options merely to make a new implementation easier.
- Do not perform large-scale refactoring unrelated to the requested task.
- Do not overwrite unrelated user work.
- Do not commit, push, publish, release, or change repository settings unless explicitly requested.
- Never fabricate test results, browser support, performance measurements, or accessibility compliance.

## 3. Repository discovery before every task

Before editing:

1. Inspect the repository's current structure.
2. Read this file and the relevant project documents.
3. Locate the existing component implementation, styles, scripts, demos, and documentation.
4. Search for existing classes, methods, events, CSS variables, and related examples.
5. Identify dependencies and initialization patterns already used by the project.
6. Check whether the requested feature already exists partially.
7. Identify public APIs and behavior that must remain compatible.

The actual repository is authoritative. The folder layout in documentation is a target convention, not permission to reorganize the project unnecessarily.

Do not create empty directories or speculative abstractions just to match a proposed structure.

## 4. Project-wide naming conventions

- CSS class prefix: `bui-`.
- CSS custom property prefix: `--bui-`.
- Global JavaScript namespace, when applicable: `BUI`.
- Use descriptive, consistent, lowercase file names.
- Avoid generic global variables and generic CSS selectors.
- Keep component-specific implementation scoped to that component.

Examples:

```css
.bui-button { }
.bui-button--primary { }
--bui-color-primary: #...;
```

Do not create a second naming convention for a new component.

## 5. Framework-agnostic core

The core must use platform standards and must not import React, Vue, Angular, or Laravel.

### Markup and styles

- Prefer semantic HTML.
- Use normal HTML attributes and classes that can be rendered by any framework.
- Do not require JSX, Angular directives, Vue directives, Blade directives, or framework-specific syntax in the core markup.
- Do not use framework-specific CSS assumptions.
- Avoid CSS selectors that depend on a framework's generated DOM structure.

### JavaScript

- Use vanilla JavaScript in the core.
- Provide clear initialization and cleanup behavior for interactive components.
- Avoid uncontrolled DOM mutation that competes with a framework's rendering process.
- Do not assume that Baset-UI owns the entire page or the lifetime of an element.
- Avoid duplicate initialization and duplicate event listeners.
- Use event delegation only where it is appropriate and safely scoped.
- Clean up event listeners, observers, timers, and generated DOM when an instance is destroyed.
- Handle missing optional browser APIs gracefully.
- Do not use `eval()` or construct executable code from arbitrary user input.

### Global namespace

Where a global API is appropriate, expose it through the `BUI` namespace rather than adding unrelated global names.

Do not force every component to use a global API if a simpler HTML/CSS implementation is sufficient.

## 6. Modular implementation

- Keep unrelated components independent.
- Shared utilities belong in a clearly documented core layer.
- Component-specific behavior belongs with that component.
- Avoid one large file containing every component's logic.
- Avoid premature abstraction: extract shared utilities only when there is a real repeated need.
- Loading one component must not require every optional interactive component.
- Do not duplicate shared utilities across components.
- Keep documentation and Playground scripts outside the runtime core.

Do not migrate all existing files to a new architecture as part of a component task unless explicitly requested.

## 7. Consistent component API

Interactive components should use consistent conventions where relevant:

- Predictable initialization.
- Clear options and defaults.
- Clear events and callback behavior.
- Programmatic value updates where meaningful.
- A documented destroy/dispose method.
- Safe repeated initialization.
- Clear error handling.

A possible API style is:

```js
const instance = BUI.modal(element, options);

instance.open();
instance.close();
instance.destroy();
```

This is a convention example, not a requirement to force every component into the exact same method set. Choose an API suitable for the component and document it.

## 8. CSS and design system rules

- Use `--bui-*` variables for shared design tokens.
- Prefer CSS logical properties such as `margin-inline`, `padding-inline`, `inset-inline-start`, and `border-inline-start`.
- Avoid hardcoded colors when a shared token exists.
- Scope component styles to `bui-` classes.
- Avoid broad selectors such as `button`, `input`, `*`, or `body` unless they are intentionally part of a documented reset or theme layer.
- Avoid `!important` unless a specific documented compatibility issue requires it.
- Support focus-visible states.
- Respect reduced-motion preferences.
- Keep responsive behavior in the component stylesheet.
- Do not let single-component customization unexpectedly change every instance.

### Themes

Preserve the project's established theme mechanism. If no mechanism exists yet, propose one based on design tokens before implementing theme behavior.

The project may use `.bui-dark` and a `bui-theme` preference key if those are the established conventions in the repository. Never rename or replace an existing theme contract casually.

### RTL and LTR

Every component that contains directional layout or interaction must be reviewed in both RTL and LTR.

- Prefer logical CSS properties.
- Do not blindly apply `row-reverse`.
- Do not force text, icons, or controls to LTR.
- Use direction-aware icon placement and keyboard behavior when needed.
- Test Arabic and English labels where relevant.

## 9. Accessibility requirements

- Use semantic HTML first.
- Provide accessible names for icon-only controls.
- Ensure keyboard operation for interactive widgets.
- Maintain visible focus.
- Use ARIA only when native semantics are insufficient.
- Keep ARIA state synchronized with actual state.
- Manage focus correctly for dialogs, menus, popovers, and similar overlays.
- Support Escape where it is an expected dismissal behavior.
- Respect reduced motion.
- Avoid communicating state by color alone.

Do not claim WCAG conformance without an appropriate audit.

## 10. Responsive and performance requirements

- Design for narrow screens first when appropriate.
- Prevent horizontal overflow.
- Keep controls usable on touch screens.
- Avoid unnecessary DOM work.
- Avoid unbounded event listeners and observers.
- Use lazy loading for optional or expensive features when it provides a real benefit.
- Use virtualization only for genuinely large collections and only when its accessibility and keyboard implications are addressed.
- Do not add complex performance machinery to small components without evidence.

## 11. Component specification first

Before implementing a new component, create or update its component specification using `templates/COMPONENT_SPEC_TEMPLATE.md`.

The specification should state:

- Purpose and use cases.
- Required markup and public API.
- Variants and states.
- Configuration options.
- Events and lifecycle.
- Accessibility behavior.
- Responsive behavior.
- RTL/LTR behavior.
- Theme behavior.
- Framework export requirements.
- Dependencies, if any.
- Test cases.
- Documentation examples.

For a very small change to an existing component, update its existing specification if one exists rather than creating duplicate documents.

## 12. Component implementation workflow

Follow `CONTRIBUTING.md`.

At a minimum:

1. Inspect the current implementation and related patterns.
2. Agree on the component behavior and public API.
3. Implement the smallest complete core solution.
4. Add or update styles and scripts.
5. Add realistic demos.
6. Add Playground controls only for meaningful, supported options.
7. Add code-generation templates only for verified export targets.
8. Add tests or document manual checks.
9. Update component documentation and navigation.
10. Verify theme, direction, responsive behavior, accessibility, and compatibility.
11. Summarize files changed, tests run, and limitations.

Do not mark a component complete when only its visual demo works.

## 13. Documentation requirements

Every implemented component must have documentation that includes:

- What the component does.
- When to use it.
- Installation or required assets.
- Basic example.
- Variants and configuration.
- Interactive states.
- Events and methods, when applicable.
- Accessibility and keyboard behavior.
- RTL/LTR notes.
- Theme behavior.
- Framework usage notes.
- Dependencies and export limitations.
- Live demo where practical.

Keep documentation navigation and index pages in sync with actual pages.

All code examples must match the actual implementation. Never show unsupported APIs merely because they look convenient.

## 14. Playground requirements

Follow `PLAYGROUND.md`.

- The Playground is a documentation/developer tool, not part of the core runtime.
- The Playground must consume component schemas/configuration rather than inventing its own separate options.
- Live preview and generated code must derive from the same structured configuration.
- Separate global theme customization from single-component customization.
- Keep preview rendering isolated from the user's application.
- Do not execute arbitrary user-provided JavaScript.
- Save/load configuration only through clearly documented, safe mechanisms.
- Avoid adding a heavy Playground dependency unless approved.
- Load Playground code only on pages that need it.

## 15. Code Generator requirements

Follow `CODE_GENERATOR.md`.

- Use a registry of explicit export targets and templates.
- Generate from structured component configuration, not by scraping the rendered preview DOM.
- Do not implement framework output through fragile string replacements.
- Distinguish plain framework-compatible markup from dedicated framework wrapper packages.
- For example, HTML markup with `className` may be JSX-compatible, but it is not automatically a tested React adapter.
- Do not generate Blade component tags unless a matching Blade integration has actually been implemented.
- Include required imports, styles, scripts, dependencies, and setup notes.
- Mark unsupported options clearly; never silently omit meaningful configuration.
- Test generated snippets for syntax and behavior before marking an export target as supported.

## 16. Framework integrations

Core compatibility is required; dedicated adapters are optional.

Potential future packages may include:

- `@baset-ui/react`
- `@baset-ui/vue`
- `@baset-ui/angular`
- A Laravel/Blade integration package.

Do not create these packages preemptively. First stabilize the core API and identify a real integration need.

Each adapter must:

- Be separately installable.
- Depend on the core rather than duplicate its implementation.
- Follow the framework's lifecycle and state conventions.
- clean up resources correctly.
- Have its own examples and tests.
- Be documented as optional.

## 17. Dependencies and build tools

- No mandatory runtime dependencies by default.
- Do not add a package solely for convenience without checking whether the platform already provides the required capability.
- Development-only tools may be considered for testing, linting, or packaging.
- Explain why a new dependency is needed, its size/maintenance impact, and whether it is optional.
- Do not introduce a build system without approval.
- If a build system is later approved, keep source files understandable and document generated artifacts.

## 18. Testing and validation

Follow `TESTING.md`.

For each relevant change, test:

- Expected behavior.
- Default and edge states.
- Light and dark themes.
- RTL and LTR.
- Responsive layouts.
- Keyboard and focus behavior.
- Framework rendering compatibility where relevant.
- Initialization, updates, repeated rendering, and cleanup for interactive components.

Run available checks. Report exact commands and results. If a check could not be run, say so.

Do not say "all tests passed" if no tests were executed.

## 19. Backward compatibility

Before changing a public class, CSS variable, method, event, option, or markup contract:

1. Search for existing usage.
2. Identify the impact.
3. Prefer additive changes.
4. If a breaking change is unavoidable, document the reason and migration path.
5. Preserve compatibility where practical.

Do not remove old aliases without a deliberate deprecation plan.

## 20. Security and safe output

- Treat Playground input as untrusted.
- Do not inject arbitrary HTML with unsafe APIs.
- Sanitize or safely render user-provided labels and text.
- Do not execute generated code inside the documentation page.
- Do not use `eval()` for preview or code generation.
- Do not send configuration data to external services unless explicitly requested and documented.
- Do not store secrets in local storage or generated examples.

## 21. Preview and deliverables

For substantial UI changes:

- Provide a usable preview or a clear way to inspect the result.
- Ensure examples are not merely static screenshots when interaction is part of the feature.
- Provide changed files in a clear structure.
- When the environment supports packaging and the task calls for a complete deliverable, provide a ZIP of the complete updated project.
- Never claim that a preview, ZIP, build, or test exists unless it was actually created or run.

## 22. Response format after completing a task

Summarize:

1. What was implemented.
2. Main files added or changed.
3. How to use or verify it.
4. Tests actually run and their results.
5. Known limitations or unfinished work.
6. Any decision that needs the project owner's approval.

Keep the explanation direct and practical. Do not hide incomplete work behind confident wording.

## 23. Definition of done

A component or feature is complete only when:

- Its implementation works.
- Its public API is documented.
- Its styles support the design system.
- Theme behavior is checked.
- RTL/LTR behavior is checked.
- Responsive behavior is checked.
- Accessibility basics are checked.
- Documentation examples match the real API.
- Playground support exists where applicable.
- Generated exports are accurate where claimed.
- Relevant tests or manual checks are reported.
- Existing components and APIs remain intact.
