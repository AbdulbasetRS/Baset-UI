# Baset-UI Code Generator

## 1. Purpose

The Code Generator converts a component's structured configuration into usable code for a selected environment.

It is part of the documentation/Playground experience. It is not a runtime dependency of Baset-UI.

Supported output targets may include:

- Plain HTML.
- React JSX.
- Vue template or Single File Component examples.
- Angular template.
- Laravel Blade markup.
- Dedicated Blade component syntax, only when a real Blade integration exists.
- Other targets added deliberately in the future.

A target is not "supported" just because its output resembles HTML.

## 2. Core design rule

**One component configuration, multiple output templates.**

The same normalized configuration must drive:

1. Live Preview.
2. Generated code.
3. Required imports and assets.
4. Validation and support status.

Do not create separate configuration logic for every target.

## 3. Structured configuration

Each component must define:

- A stable component ID.
- Default values.
- Supported options.
- Allowed values and validation.
- Which options affect markup.
- Which options affect CSS.
- Which options require JavaScript.
- Which export targets support each option.
- Required dependencies/assets.

Normalize user input before passing it to a generator. Reject invalid values or fall back to documented defaults; do not insert arbitrary user input into executable source.

## 4. Generator contract

A generator should conceptually receive:

```js
{
    component: "button",
    config: {
        variant: "primary",
        size: "lg",
        label: "Get Started"
    },
    target: "react"
}
```

It should return a structured result such as:

```js
{
    status: "supported",
    files: [
        {
            path: "Button.jsx",
            language: "jsx",
            content: "<button ...>Get Started</button>"
        }
    ],
    imports: [],
    dependencies: [],
    setup: [],
    notes: []
}
```

This is an illustrative contract. Agree on the actual data shape before building multiple templates.

## 5. Target templates

Each export target should have its own explicit template/renderer.

### Plain HTML

- Use `class`.
- Include standard attributes.
- Include required HTML structure.
- Explain required CSS and JavaScript assets.

### React JSX

- Use `className`.
- Use valid JSX syntax.
- Include imports only when needed.
- For interactive framework behavior, use a real adapter or provide a clearly labeled integration example with lifecycle handling.
- Do not claim that JSX markup alone is a React adapter.

### Vue

- Use valid Vue template syntax.
- Distinguish a template snippet from a complete Single File Component.
- Use idiomatic bindings only when the example requires them.
- Do not add Vue runtime dependencies to the core.

### Angular

- Use valid Angular template syntax.
- Clearly distinguish template-only output from a tested Angular wrapper.
- Use bindings and event syntax only when appropriate.
- Do not make the core depend on Angular.

### Laravel Blade

- Standard HTML markup is valid Blade markup and may be exported as such.
- Do not output custom tags such as `<x-bui-button>` unless a corresponding Blade component/package exists and is documented.
- Distinguish standard Blade-compatible markup from a dedicated Laravel integration.

## 6. Interactive component exports

An interactive component may require more than one code block or file:

- Markup/template.
- JavaScript initialization or framework wrapper.
- CSS imports or component styles.
- Package installation/import instructions.
- Event handling.
- Cleanup/lifecycle behavior.

The Generator should explain these requirements clearly.

For React, Vue, and Angular, avoid unmanaged imperative DOM changes that conflict with the framework. Prefer an optional framework adapter when integration is complex.

## 7. Support levels

Every component/target pair should have an explicit status.

Suggested statuses:

- **Supported:** generated output has been tested for syntax and expected behavior.
- **Markup only:** the output is valid markup, but interactive framework integration is not provided.
- **Experimental:** an example exists but is not fully validated.
- **Unavailable:** no generator exists for this component/target.

The UI must not display unavailable targets as fully supported.

## 8. Unsupported configuration

If a selected target cannot represent an option:

- Do not silently drop it.
- Show a clear explanation.
- Offer a safe alternative when possible.
- Include a note in the generated output if a manual adjustment is required.

If a feature needs a dedicated adapter that does not exist, say so.

## 9. CSS export

The Generator may produce:

- Required standard Baset-UI classes.
- Scoped custom CSS.
- CSS variable overrides.
- A complete small stylesheet for a customized component, when useful.

Single-component custom CSS must use a unique or user-selected wrapper class and must not unexpectedly alter global component styles.

Global theme export should produce token overrides, not a collection of unrelated per-component overrides.

## 10. Security and correctness

- Never use `eval()` or `new Function()`.
- Never execute generated code in the Playground.
- Escape or safely serialize text and attribute values.
- Validate class names and option values against the component schema.
- Do not allow arbitrary CSS or JavaScript to be injected into the docs page.
- Do not use the preview DOM as the source for generated code.
- Keep templates deterministic for the same configuration.

## 11. Tests

For every supported target, test:

- Default configuration.
- Every supported variant.
- Boolean options.
- Optional icon/content.
- Special characters and text escaping.
- Disabled/loading states where relevant.
- Correct class syntax for the target.
- Required imports/assets.
- Interactive behavior and cleanup, when applicable.

Syntax validation is not enough for interactive components; test behavior in the target environment.

## 12. Incremental rollout

Start with a component that is mostly markup and CSS, such as Button.

Recommended sequence:

1. HTML.
2. React JSX markup.
3. Vue template.
4. Angular template.
5. Laravel Blade markup.
6. Interactive component integration.
7. Dedicated framework adapters only when justified.

Do not promise that all framework targets are supported until their templates and examples are verified.

## 13. Definition of done

A generator target is complete for a component when its output is valid, reflects the selected configuration, includes all required setup instructions, communicates limitations, and has been verified in the claimed environment.
