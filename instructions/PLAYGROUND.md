# Baset-UI Playground

## 1. Purpose and boundaries

The Playground is part of the documentation/developer experience. It allows users to change supported options, inspect a live preview, and understand or export the corresponding code.

It is not part of the library runtime and must not be required by applications that consume Baset-UI. Keep Playground scripts under the documentation asset area (`docs/assets/` today, `docs-assets/` after the docs migration), not under public runtime assets.

The repository currently has documentation demonstrations such as live token/layout examples, but do not assume a complete component Playground exists. Extend the actual implementation rather than building a duplicate system.

## 2. Playground modes

### 2.1 Global Theme / Design Token Playground

This mode customizes shared design-system values that are represented by documented `--bui-*` tokens.

Potential controls, only where the corresponding token exists and is supported:

- Brand and semantic colors.
- Typography family and scale.
- Spacing scale.
- Border radius.
- Shadows.
- Light/dark mode.
- RTL/LTR direction.

Expected user actions may include previewing the theme, resetting to defaults, copying or downloading CSS variable overrides, and exporting/importing a versioned JSON configuration when safely implemented.

Global changes must preview across representative real examples. Do not create controls for tokens that do not exist or do not affect the preview.

### 2.2 Component Playground

This mode customizes one implemented component. Controls may represent variants, size, text, icons, disabled/loading state, and other real options.

Rules:

- Expose only options supported by the actual component.
- Every visible control must change the preview or generated result.
- Do not add decorative/inert controls.
- Use the component's actual defaults and validation.
- Do not claim a Playground exists for a component until it is usable.

## 3. Page experience

A component documentation page may contain:

1. Short introduction and status.
2. Default example and important variants.
3. Required CSS/JS assets.
4. Live Playground.
5. Generated code panel, if supported.
6. Accessibility and keyboard notes.
7. Theme and RTL/LTR notes.
8. Framework/export notes.
9. Related documentation.

Keep the controls proportional to the component's complexity. A simple component does not need an oversized editor. Group complex controls into clear sections.

## 4. Single source of truth

The Playground must not create an independent definition of component options.

A component definition/schema should describe, where applicable:

- Component ID and display name.
- Default configuration.
- Configurable fields and types.
- Allowed values and validation.
- Which options affect markup, CSS, or behavior.
- Preview support.
- Code Generator support by target.
- Required assets and optional dependencies.
- Unsupported or conditional options.

Use one normalized configuration object as the input for Live Preview and Code Generator. Do not derive exported code by scraping the preview DOM.

The actual component implementation remains authoritative; a schema cannot invent behavior.

## 5. Preview behavior

- Update the preview when a valid control changes.
- Provide a reset-to-default action where controls are editable.
- Validate input before applying it.
- Keep per-component customizations scoped to that preview instance.
- Prevent custom styles from leaking into the docs page or neighboring examples.
- Support light/dark and RTL/LTR states when relevant.
- Make interactive controls keyboard accessible.
- Preserve focus sensibly when the preview updates.
- Show validation errors clearly instead of silently coercing invalid values.
- Use realistic examples that expose wrapping, long content, and narrow widths.

A visual change must be reflected by the actual preview; do not provide a fake preview using a screenshot when interaction is part of the feature.

## 6. Isolation and rendering safety

Treat user-entered values and imported configurations as untrusted.

- Render text safely.
- Validate enumerated options.
- Do not execute user-provided JavaScript.
- Never use `eval()` or `new Function()`.
- Do not inject arbitrary HTML from configuration.
- Do not allow arbitrary CSS to escape the preview scope.
- Do not execute generated code in the docs site.
- If an iframe/sandbox is used, define the minimum permissions required; do not grant script execution or same-origin access unnecessarily.
- Keep Playground state isolated between examples.

## 7. Generated code integration

The preview and generator must consume the same normalized configuration. The generated output must state the exact CSS/JS assets, imports, and setup required.

Do not show a framework target as supported unless its result is verified. Distinguish markup-only examples from real framework integration.

See `CODE_GENERATOR.md` for target status, output, escaping, and tests.

## 8. Global theme versus per-component customization

Keep these use cases separate:

- Global Theme Playground changes shared design tokens across the design system.
- Component Playground changes one component's supported properties or scoped overrides.

A one-off button color must not silently rewrite the global brand token. A global theme change should not be implemented as unrelated overrides for every component.

## 9. Documentation and usability

- Explain what a control changes.
- Provide sensible defaults and reset behavior.
- Keep labels and help text clear in every supported docs language.
- Preserve RTL/LTR and light/dark modes.
- Make code output selectable/copyable where the feature supports it.
- Indicate unsupported options and targets instead of silently dropping them.
- Do not display controls that are placeholders for future work.

## 10. Performance

- Load Playground scripts only on pages that use them.
- Avoid re-rendering unrelated parts of the docs site.
- Debounce expensive preview operations where appropriate.
- Do not add a large state-management dependency for a small static demo.
- Clean up event handlers and observers when a Playground instance is destroyed or replaced.

## 11. Testing

Test:

- Default values and reset.
- Each exposed control.
- Invalid values and boundary values.
- Preview updates.
- Isolation between multiple instances.
- Light/dark and RTL/LTR where supported.
- Keyboard use and visible focus.
- Generated output matching the preview configuration.
- Safe handling of text containing quotes, angle brackets, ampersands, and Arabic characters.
- No console errors or unintended changes to the docs shell.

## 12. Definition of done

A Playground task is complete when every exposed control is functional, the preview reflects the real component, configuration is shared with code generation where applicable, unsafe execution paths are absent, docs are synchronized, tests are reported, and the docs site can be previewed and delivered as a complete ZIP.
