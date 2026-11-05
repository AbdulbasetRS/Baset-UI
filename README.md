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

This repository is developed incrementally. A component or integration is considered supported only after its implementation, documentation, examples, and relevant tests have been completed.

Do not assume that every planned component, framework adapter, or export target already exists. Check the repository and the documentation before relying on a feature.

## Quick start

The exact paths below represent the intended static-file usage. Confirm that the referenced files exist in the current repository before copying this example.

```html
<link rel="stylesheet" href="./assets/css/baset-ui.css">

<button class="bui-btn bui-btn-primary">
    Save changes
</button>

<script src="./assets/js/baset-ui.js" defer></script>
```

A static HTML component such as a button should not require JavaScript unless the component provides interactive behavior.

## Framework usage

### React

```jsx
<button className="bui-btn bui-btn-primary">
    Save changes
</button>
```

### Vue

```vue
<template>
  <button class="bui-btn bui-btn-primary">
    Save changes
  </button>
</template>
```

### Angular

```html
<button class="bui-btn bui-btn-primary">
  Save changes
</button>
```

### Laravel Blade

```blade
<button class="bui-btn bui-btn-primary">
    Save changes
</button>
```

These examples demonstrate framework-compatible markup, not proof that a dedicated React, Vue, Angular, or Laravel package exists. Dedicated wrapper components must only be documented after they have actually been implemented and tested.

## Core principles

1. **One core, many environments.** Do not fork the component implementation for every framework.
2. **No forced framework.** The core must work without React, Vue, Angular, or Laravel.
3. **One source of truth.** A component's configuration/schema drives its preview and generated examples.
4. **Progressive development.** Add and complete one component at a time.
5. **Honest support claims.** Mark unfinished integrations and exports clearly.
6. **Backward compatibility.** Avoid breaking existing public classes, methods, events, and variables without a documented migration path.

## Documentation map

| File | Purpose |
|---|---|
| `CLAUDE.md` | Instructions for AI coding agents working on the repository |
| `ARCHITECTURE.md` | Core architecture and engineering principles |
| `PLAYGROUND.md` | Interactive Playground design and behavior |
| `CODE_GENERATOR.md` | Framework-aware code export architecture |
| `TESTING.md` | Testing strategy and quality checks |
| `CONTRIBUTING.md` | Step-by-step process for adding and improving components |
| `ROADMAP.md` | Incremental implementation phases |
| `templates/COMPONENT_SPEC_TEMPLATE.md` | Reusable specification template for each component |

## License

Use the license file included in this repository. Do not change or claim a license without checking the actual `LICENSE` file.
