# Baset-UI Architecture

## 1. Purpose

This document describes the intended architecture of Baset-UI. The goal is to keep the library framework-agnostic, modular, easy to adopt, and maintainable as components and integrations are added over time.

The architecture is a set of principles and conventions. It is not a requirement to create every directory or abstraction immediately. Build only what the current milestone needs.

## 2. Architectural principles

1. **Framework-agnostic core:** HTML, CSS, and vanilla JavaScript are the foundation.
2. **Progressive enhancement:** static components should work without JavaScript whenever practical.
3. **One implementation:** do not fork core components for React, Vue, Angular, or Blade.
4. **Modularity:** components can be loaded and maintained independently.
5. **Consistent public API:** shared conventions without forcing irrelevant methods on simple components.
6. **Design tokens:** shared appearance is controlled through CSS custom properties.
7. **Accessible by default:** semantic HTML, keyboard behavior, focus management, and ARIA where needed.
8. **Direction-aware:** support RTL and LTR from the beginning.
9. **Documentation as part of development:** examples and docs are part of a component's definition of done.
10. **No unnecessary dependencies:** optional integrations remain optional.

## 3. Logical layers

### 3.1 Core styles

Responsibilities:

- Design tokens.
- Base/reset rules, if the project intentionally provides them.
- Typography and shared utilities.
- Theme variables.
- Direction-aware foundations.

Core styles must not depend on a framework.

### 3.2 Component styles

Each component owns its component-specific styling.

Examples:

- Button styles.
- Modal styles.
- Select styles.
- Calendar styles.

Use the `bui-` class prefix and `--bui-` variable prefix. Use CSS logical properties for direction-sensitive layout.

### 3.3 Core JavaScript

Responsibilities may include:

- Shared event helpers.
- Instance registration where useful.
- Safe DOM helpers.
- Common lifecycle conventions.
- Shared accessibility helpers.

Do not turn the core into a large utility framework. Add shared helpers only when multiple components have a real common requirement.

### 3.4 Component JavaScript

Interactive behavior belongs to the relevant component.

A component should:

- Have a clear initialization contract.
- Avoid duplicate initialization.
- Scope its DOM work to its root or target element.
- Provide a cleanup path.
- Dispatch documented events or callbacks.
- Handle updates predictably.

Static components should not require JavaScript simply to render.

### 3.5 Documentation

Documentation and demo scripts are separate from the runtime.

A documentation page may load:

- Core styles.
- The specific component styles.
- The relevant component script.
- Documentation-only scripts.
- Playground scripts, only when needed.

Do not ship documentation-only code as part of the runtime unless there is a deliberate reason.

### 3.6 Playground and Code Generator

The Playground is a developer tool that helps users customize components and inspect output. It must not become a runtime dependency.

It consumes component schemas and structured configuration. The same configuration is used by:

- Live Preview.
- Code Generator.
- Configuration export/import.

See `PLAYGROUND.md` and `CODE_GENERATOR.md`.

### 3.7 Optional adapters

Framework adapters are separate integration layers. They may provide idiomatic wrappers, but they must use the same core styles and behavior rather than fork the component implementation.

Possible future integrations include React, Vue, Angular, and Laravel/Blade. They are not considered implemented merely because compatible markup can be copied into those environments.

## 4. Suggested repository layout

Adapt this layout to the repository as it actually exists. Do not move working files solely to make the repository look like this example.

```text
/
├── README.md
├── LICENSE
├── CLAUDE.md
├── ARCHITECTURE.md
├── PLAYGROUND.md
├── CODE_GENERATOR.md
├── TESTING.md
├── CONTRIBUTING.md
├── ROADMAP.md
├── templates/
│   └── COMPONENT_SPEC_TEMPLATE.md
├── assets/
│   ├── css/
│   │   ├── baset-ui.css
│   │   └── components/
│   ├── js/
│   │   ├── baset-ui.js
│   │   ├── core/
│   │   └── components/
│   ├── icons/
│   └── fonts/
├── docs/
│   ├── index.html
│   ├── components/
│   └── assets/
├── examples/
├── adapters/
│   ├── react/        # only when implemented
│   ├── vue/          # only when implemented
│   ├── angular/      # only when implemented
│   └── laravel/      # only when implemented
└── tests/            # create when a test harness is adopted
```

Directories marked "only when implemented" should not be created as empty placeholders.

## 5. Component boundaries

A component should own its own:

- Markup contract.
- CSS classes and component tokens.
- JavaScript behavior, if needed.
- Options and defaults.
- Events and lifecycle.
- Documentation examples.
- Playground schema, where applicable.
- Code-generation templates, where supported.
- Tests.

Shared code should be extracted only when it is genuinely shared and stable.

## 6. Public JavaScript API

A `BUI` namespace may provide a consistent entry point for interactive components.

Example style:

```js
const toast = BUI.toast({
    message: "Saved successfully",
    variant: "success"
});
```

Or, for element-based components:

```js
const picker = BUI.datePicker(element, {
    format: "YYYY-MM-DD"
});
```

These are illustrative API shapes. Before adopting a new public API, inspect existing conventions and avoid breaking established contracts.

### Lifecycle

Where applicable, interactive instances should support:

- Create/initialize.
- Update options or value.
- Public actions.
- Destroy/dispose.

A simple CSS-only component does not need an artificial JavaScript instance.

### Events

Events should be:

- Named consistently.
- Documented.
- Dispatched from a predictable target.
- Useful to both vanilla JavaScript and framework integrations.

Avoid events that expose internal implementation details unnecessarily.

## 7. CSS design system

### Tokens

Use CSS custom properties for shared values such as:

- Brand colors.
- Semantic colors.
- Text and surface colors.
- Border colors.
- Radius.
- Spacing.
- Typography.
- Shadows.
- Motion durations.

Example naming:

```css
:root {
    --bui-color-primary: #2563eb;
    --bui-color-success: #16a34a;
    --bui-radius-md: 0.5rem;
    --bui-space-3: 0.75rem;
}
```

The actual token scale should be documented and consistent. Do not add near-duplicate tokens without reason.

### Theme

Theme switching should be token-driven. Component styles should consume semantic tokens rather than hardcoding separate light and dark values throughout the component CSS.

Preserve an existing theme selector and preference key. If the project establishes `.bui-dark` and `bui-theme`, treat them as public conventions unless a deliberate migration is approved.

### Component-level customization

A single customized component must not change every instance. Prefer a wrapper class, component-specific modifier, or scoped custom properties:

```css
.my-special-button {
    --bui-button-bg: #6d28d9;
    --bui-button-radius: 999px;
}
```

The component should consume its local variables while retaining sensible global defaults.

## 8. Framework compatibility model

### Core compatibility

Core markup and CSS should work inside any environment that can render normal HTML and load CSS/JavaScript.

Examples:

- HTML uses `class`.
- React JSX uses `className`.
- Vue templates use normal class attributes.
- Angular templates use normal class attributes.
- Blade can render normal HTML.

This compatibility does not require separate implementations.

### Framework adapters

Adapters are optional packages. They are justified when a component needs framework-specific lifecycle, state, refs, or event integration.

An adapter must not:

- Duplicate core styles.
- Fork the component behavior.
- Make the core depend on the framework.
- Imperatively mutate framework-owned DOM without a safe integration boundary.

## 9. Component schema as a shared contract

Components intended for the Playground should describe their configurable behavior in a structured schema.

A schema may define:

- Component identifier.
- Display name.
- Default configuration.
- Configurable properties.
- Types and allowed values.
- Validation rules.
- Preview capabilities.
- Export-target compatibility.
- Required assets and dependencies.
- Unsupported or conditional options.

The schema is the contract used by the Playground and Code Generator. Avoid maintaining separate option lists that drift apart.

A schema is not a replacement for the component implementation. The real component code remains authoritative for behavior.

## 10. Performance

- Load only the scripts required by a page or component.
- Avoid costly global DOM scans.
- Do not create observers or listeners that are never cleaned up.
- Use lazy loading for genuinely optional or expensive functionality.
- Consider virtualization only for large datasets where measurement supports it.
- Keep Playground code out of normal production usage.
- Avoid adding dependencies for marginal gains.

## 11. Security

- Treat Playground configuration and user-entered values as untrusted.
- Render text safely.
- Do not use `eval()` or `new Function()`.
- Do not execute generated snippets in the documentation page.
- Do not send user configuration to a server unless explicitly designed and documented.
- Do not store credentials or secrets in browser storage.

## 12. Backward compatibility and deprecation

Public classes, methods, events, CSS variables, and configuration options can be dependencies for users.

Prefer additive changes. For a breaking change:

1. Identify affected public contracts.
2. Explain why the change is required.
3. Provide a migration example.
4. Deprecate before removal when practical.
5. Update documentation and release notes.

## 13. Architecture decisions

When proposing a new shared abstraction or dependency, explain:

- The problem it solves.
- Why existing browser features or utilities are insufficient.
- Its effect on bundle size and maintenance.
- Whether it is optional.
- How it affects framework compatibility.
- How it can be tested.

Do not introduce an architecture layer merely because it is fashionable.

## 14. Definition of done

A component is architecturally complete when its boundaries, public API, styles, lifecycle (if interactive), accessibility, direction behavior, documentation, Playground schema (if applicable), export templates (if supported), and tests are coherent.
