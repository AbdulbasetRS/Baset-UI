# Baset-UI Playground

## 1. Purpose and boundaries

The Playground is part of the documentation/developer experience. It allows users to change supported options, inspect a live preview, and understand or export the corresponding code.

It is not part of the library runtime and must not be required by applications that consume Baset-UI. Keep Playground scripts under the documentation asset area (`docs-assets/`), not under public runtime assets.

Never assume a Playground exists for a given component or for the global theme. Inspect the documentation assets and pages first, and extend the actual implementation rather than building a duplicate system.

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
- An icon control offers only icon names that exist in the actual Baset-UI icon system; if no icon system or icon exists, do not show the control. See `ARCHITECTURE.md`, section 10.

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

A conceptual component definition. This example is illustrative only: it is not a verified public API, the format may evolve, and the schema must be defined and documented before several definitions are implemented:

```js
const buttonDefinition = {
    id: "button",
    name: "Button",
    defaults: { variant: "primary", size: "md", disabled: false, label: "Button" },
    controls: [
        { name: "variant", type: "select", options: ["primary", "secondary"] },
        { name: "size", type: "select", options: ["sm", "md", "lg"] },
        { name: "disabled", type: "boolean" },
        { name: "label", type: "text" }
    ]
};
```

The component name, option names, and values above are placeholders for illustration and are not a public contract. A real definition is derived from the implemented component.

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

### 7.1 Code panel

The generated-code area includes a target selector (for example HTML, React JSX, Vue, Angular, or Laravel Blade), syntax highlighting only when a highlighting solution already exists or is approved, a copy action that reports truthful success or failure, a clear list of required imports, styles, scripts, packages, and setup steps, and a visible status when a target is experimental, markup-only, or unsupported. The panel must not imply that every target has a dedicated adapter. Generated output never contains emoji or text-character icon placeholders (see `CODE_GENERATOR.md`).

### 7.2 Configuration persistence

Copying, downloading, and importing configuration JSON, and saving presets locally, are optional capabilities and are never assumed to exist. If browser storage is used: store only non-sensitive UI configuration, version the stored schema, handle invalid or old data, provide reset/clear behavior, and do not assume storage is available in every browser context. Do not build accounts, cloud sync, or server-side preset storage unless explicitly requested.

## 8. Global theme versus per-component customization

Keep these use cases separate:

- Global Theme Playground changes shared design tokens across the design system.
- Component Playground changes one component's supported properties or scoped overrides.

A one-off button color must not silently rewrite the global brand token. A global theme change should not be implemented as unrelated overrides for every component.

A third concept, *component defaults* (editing a component's documented default configuration), exists only if the project intentionally supports configurable theme defaults. Do not add it implicitly.

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
- Loading a documentation page without Playground assets must not break the page's normal component demo.

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
- Icon controls offer only real icon names, and no emoji or text-character icon substitutes appear in the preview.
- No console errors or unintended changes to the docs shell.

## 12. Incremental rollout

Validate the system with one small, real, implemented component before building more. Then add, in order: the shared configuration and preview mechanism, HTML and JSX export templates, Vue/Angular/Blade markup templates after verification, the Global Theme Playground, interactive component previews, saved presets, and finally additional targets. Do not build every component's Playground in one pass.

## 13. Definition of done

A Playground task is complete when every exposed control is functional, the preview reflects the real component, configuration is shared with code generation where applicable, unsafe execution paths are absent, docs are synchronized, tests are reported, and the docs site can be previewed and delivered as a complete ZIP.
