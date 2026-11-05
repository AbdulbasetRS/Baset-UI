# Baset-UI Playground

## 1. Purpose

The Baset-UI Playground is an interactive area within the documentation where users can customize components, preview changes, and inspect or export the corresponding code.

It should make the library easier to learn and adopt. It is not part of the production runtime and must not be required to use Baset-UI.

## 2. Two distinct Playground modes

### 2.1 Global Theme Playground

This mode customizes the shared design system.

Possible controls:

- Primary and secondary colors.
- Semantic colors: success, warning, danger, and info.
- Font family and typography scale.
- Border radius scale.
- Spacing scale.
- Shadows.
- Light/dark theme.
- Direction: LTR/RTL.

The preview should show a representative collection of components so users can understand how global token changes affect the system.

Global theme settings must map to documented `--bui-*` tokens.

The user should be able to:

- Preview the theme.
- Copy or download the CSS variable overrides.
- Export a versioned JSON configuration.
- Reset to defaults.
- Import a previously exported configuration, if that capability is implemented safely.

### 2.2 Component Playground

This mode customizes one component at a time.

Example for a button:

- Variant.
- Size.
- Label.
- Icon and icon position.
- Disabled state.
- Loading state.
- Full-width state.
- Border radius.
- Custom colors, if supported.
- Relevant hover/focus options.

Only expose options that the real component supports. Do not present decorative controls that do not affect the actual preview or generated code.

## 3. Documentation page layout

A component page should normally contain:

1. Component introduction.
2. Default examples and variants.
3. Basic usage and required assets.
4. Live Component Playground.
5. Generated code panel.
6. Accessibility and keyboard guidance.
7. Framework/export notes.
8. Related components.

Do not force every page into an oversized Playground. For simple components, keep the controls compact. For complex widgets, group controls into logical sections.

## 4. Single source of truth

The Playground must not maintain an independent list of component options.

Each supported component should have a structured definition containing:

- Component identity.
- Default configuration.
- Configurable fields.
- Field types and constraints.
- Preview capabilities.
- Export capabilities.
- Dependencies and required assets.
- Validation rules.

The Live Preview and Code Generator must consume the same normalized configuration.

Do not generate code by inspecting or scraping the preview DOM. Do not use fragile string replacement on rendered HTML.

## 5. Preview behavior

- Update the preview when a control changes.
- Provide a clear reset-to-default action.
- Validate values before applying them.
- Keep single-component overrides scoped to that preview instance.
- Do not leak custom preview styles to the documentation page or other component instances.
- Make light/dark and RTL/LTR preview behavior available when relevant.
- Make interactive previews keyboard-accessible.
- Avoid executing arbitrary code typed by a user.
- Handle invalid imported configuration safely.

A preview must reflect the real component behavior. If an option is not implemented in the component, it must not appear as a working Playground option.

## 6. Component-level and global customization

Keep these concepts separate:

- **Global Theme:** edits shared design tokens and affects the theme preview.
- **Component Customization:** edits one component instance and should be scoped.
- **Component Defaults:** edits the documented default configuration only when the project intentionally supports configurable theme defaults.

A custom button color should not silently change every button in the page. A global primary color change may affect all components that consume the primary token.

## 7. Code panel

The generated-code area should include:

- Target selector, such as HTML, React JSX, Vue, Angular, or Laravel Blade.
- Syntax-highlighted code when a highlighting solution already exists or is approved.
- Copy action.
- Clear indication of required imports, styles, scripts, packages, or setup steps.
- A visible status when an export target is experimental, template-only, or unsupported.

The code panel must not imply that every target has a dedicated adapter.

## 8. Configuration persistence

A future Playground may support:

- Copy configuration JSON.
- Download configuration JSON.
- Import configuration JSON.
- Save presets locally.

If local browser storage is used:

- Store only non-sensitive UI configuration.
- Version the stored schema.
- Handle invalid or old data.
- Provide reset/clear behavior.
- Do not assume storage is available in every browser context.

Do not build accounts, cloud sync, or server-side preset storage unless explicitly requested.

## 9. Suggested component definition

The exact implementation format may evolve. A conceptual definition could look like:

```js
const buttonDefinition = {
    id: "button",
    name: "Button",
    defaults: {
        variant: "primary",
        size: "md",
        disabled: false,
        label: "Button"
    },
    controls: [
        {
            name: "variant",
            type: "select",
            options: ["primary", "secondary", "success", "danger"]
        },
        {
            name: "size",
            type: "select",
            options: ["sm", "md", "lg"]
        },
        {
            name: "disabled",
            type: "boolean"
        },
        {
            name: "label",
            type: "text"
        }
    ]
};
```

This is an architectural example, not a demand to adopt this exact object shape. Define and document the schema before implementing multiple component definitions.

## 10. Playground isolation

- Playground scripts must live outside the production core.
- Component preview code must not pollute global styles.
- Code generation must not execute the generated output.
- Loading a documentation page without Playground assets should not break the normal component demo.
- Do not load all Playground code on every documentation page if it is not needed.

## 11. Incremental rollout

Recommended order:

1. Button Playground with a small, complete set of options.
2. Shared configuration and preview mechanism.
3. HTML and JSX export templates.
4. Vue, Angular, and Blade markup templates after syntax and examples are verified.
5. Global Theme Playground.
6. Interactive component previews.
7. Save/load presets.
8. Additional export targets and optional framework adapters.

Do not build all component Playground pages in one pass before validating the system with a real component.

## 12. Definition of done

The Playground is complete for a component when:

- Every visible control changes a supported setting.
- Preview matches the component implementation.
- Reset works.
- RTL/LTR and themes are checked where relevant.
- Generated code matches the same configuration.
- Required assets and setup notes are shown.
- Unsupported options/targets are identified honestly.
- Keyboard operation and accessible labels are checked.
