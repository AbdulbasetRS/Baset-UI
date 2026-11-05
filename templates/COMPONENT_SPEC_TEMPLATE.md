# Component Specification: [Component Name]

> Copy this file for a new component and replace all bracketed guidance. Keep the specification concise but precise.

## 1. Identity

- **Component ID:** `[component-id]`
- **Display name:** `[Component Name]`
- **Category:** `[Category]`
- **Status:** `Planned | In progress | Supported | Experimental | Deprecated`
- **Owner/maintainer:** `[Optional]`

## 2. Purpose

Describe the problem the component solves and when users should use it.

## 3. Scope

### Included

- [Capability]
- [Capability]

### Not included

- [Explicitly excluded behavior]

## 4. Basic usage

```html
<!-- Add the simplest valid markup example here. -->
```

List the exact CSS and JavaScript assets required. Do not list files that do not exist.

## 5. Variants

| Variant | Description | Default |
|---|---|---|
| `[variant]` | `[description]` | Yes/No |

## 6. States

| State | Expected behavior |
|---|---|
| Default | |
| Hover | |
| Focus-visible | |
| Active | |
| Disabled | |
| Loading | |
| Error | |
| Empty | |

Remove states that do not apply and add component-specific states.

## 7. Public API

### Options

| Option | Type | Default | Allowed values | Description |
|---|---|---|---|---|
| `optionName` | `string` | `value` | `...` | |

### Methods

| Method | Parameters | Result | Description |
|---|---|---|---|
| `methodName` | | | |

### Events

| Event | Payload | When dispatched |
|---|---|---|
| `event-name` | | |

For a static CSS-only component, state that no JavaScript API is required.

## 8. Markup and styling contract

- Root class:
- Child classes:
- CSS custom properties:
- Required attributes:
- Optional attributes:
- Generated markup rules:

All public classes and variables must use the Baset-UI naming conventions.

## 9. Theme and direction

- Light theme behavior:
- Dark theme behavior:
- RTL behavior:
- LTR behavior:
- Direction-sensitive icons or controls:

## 10. Responsive behavior

Describe layout and behavior at narrow, medium, and wide viewport sizes.

## 11. Accessibility

- Semantic element:
- Accessible name/label:
- Keyboard interactions:
- Focus behavior:
- ARIA attributes and state:
- Screen-reader considerations:
- Reduced-motion behavior:

## 12. Framework compatibility

| Target | Output type | Status | Notes |
|---|---|---|---|
| Plain HTML | HTML | Planned | |
| React | JSX markup / adapter | Planned | |
| Vue | Template / adapter | Planned | |
| Angular | Template / adapter | Planned | |
| Laravel Blade | Blade-compatible HTML / Blade component | Planned | |

Distinguish framework-compatible markup from a dedicated framework adapter. Mark unsupported targets honestly.

## 13. Playground definition

List only real configurable properties.

| Control | Type | Default | Validation | Affects |
|---|---|---|---|---|
| | | | | Preview / CSS / markup / behavior |

## 14. Code Generator requirements

- Required HTML/JS/CSS:
- Required imports:
- Required packages:
- Export targets:
- Unsupported options:
- Notes that must appear with generated code:

## 15. Dependencies

- Runtime dependencies:
- Optional dependencies:
- Development/test dependencies:

Explain why each dependency is needed. Prefer none in the core.

## 16. Test plan

- [ ] Default behavior.
- [ ] Variants and states.
- [ ] Light and dark themes.
- [ ] RTL and LTR.
- [ ] Responsive layout.
- [ ] Keyboard/accessibility.
- [ ] Lifecycle and cleanup, if interactive.
- [ ] Framework integration tests, when claimed.
- [ ] Code Generator output, when available.
- [ ] Documentation examples.

## 17. Documentation checklist

- [ ] Component page.
- [ ] Basic example.
- [ ] Variants and states.
- [ ] API reference.
- [ ] Accessibility and keyboard notes.
- [ ] Theme and direction notes.
- [ ] Playground.
- [ ] Export examples and limitations.
- [ ] Index/navigation updated.

## 18. Open questions and decisions

Record unresolved decisions. Do not silently turn assumptions into public API commitments.

## 19. Definition of done

List the specific conditions that must be true before this component is marked supported.
