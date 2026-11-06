# Baset-UI Code Generator

## 1. Purpose and status

The Code Generator is a documentation/Playground developer tool. It turns a component's structured configuration into code examples for a selected target. It is not part of the Baset-UI runtime and must never be required to use the library.

This document defines the rules for implementing or extending the generator. It does not claim that a complete generator or every target already exists. Inspect the working tree and mark each feature as implemented, experimental, planned, or unavailable.

## 2. Core rule: one configuration, multiple outputs

The same normalized configuration must drive:

1. Live preview.
2. Generated code.
3. Required CSS and JavaScript assets.
4. Imports and setup instructions.
5. Validation and support status.

Do not maintain one set of controls for preview and a different set of rules for export. Do not generate code by scraping the preview DOM or using fragile string replacements.

## 3. Component definition

A component that supports generation should have a structured definition containing, as applicable:

- Stable component ID and display name.
- Default configuration.
- Configurable fields, types, and allowed values.
- Validation and normalization rules.
- Which options affect markup, CSS, or behavior.
- Required library assets and their load order.
- Target-specific support status.
- Unsupported options and limitations.
- Optional imports or framework setup.

Use the component's real implementation as the authority. A schema must not invent options that the component does not support.

## 4. Generator input and result

A conceptual input may look like:

```js
{
  component: "button",
  target: "html",
  config: {
    variant: "primary",
    size: "large",
    label: "Save changes"
  }
}
```

A conceptual result may contain:

```js
{
  status: "supported",
  files: [
    {
      path: "index.html",
      language: "html",
      content: "..."
    }
  ],
  imports: [],
  assets: [],
  dependencies: [],
  setup: [],
  notes: []
}
```

These are examples, not a mandate to retrofit an existing working generator to this exact object shape. Inspect the current code and keep its established data contract unless there is a justified, explicitly scoped migration.

## 5. Output targets and honest support levels

Potential targets include:

- Plain HTML.
- React JSX markup.
- Vue template markup.
- Angular template markup.
- Laravel Blade-compatible markup.
- Dedicated framework component output only when a real adapter/component exists.

Every component/target pair must have an explicit status:

- **Supported:** output is valid and has been tested for the target and claimed behavior.
- **Markup only:** syntax is suitable for the target, but no framework-specific interactive integration is supplied.
- **Experimental:** an incomplete or limited example exists and is labeled as such.
- **Unavailable:** no verified output exists.

Never mark all frameworks as supported simply because the generated result is HTML-like.

### HTML

Use valid semantic HTML and `class` attributes. Include all required structure and explain the CSS/JS assets needed.

### React JSX

Use `className` and valid JSX syntax. Add imports only when they are real. JSX markup is not proof of a React adapter. For an interactive integration, account for mounting, updates, unmounting, event handling, and cleanup.

### Vue

Distinguish a template fragment from a complete Single File Component. Use Vue bindings only when needed. Do not add Vue dependencies to the core.

### Angular

Distinguish an Angular template snippet from a tested Angular wrapper. Use Angular bindings only when the output actually depends on them.

### Laravel Blade

Ordinary HTML is valid Blade-compatible markup. Do not generate custom tags such as `<x-bui-button>` unless that Blade component/package actually exists and is documented.

## 6. Interactive component output

An interactive component may require multiple output files or sections:

- Markup/template.
- Component CSS import.
- Core or optional runtime JavaScript.
- Initialization code or framework adapter.
- Imports and package requirements.
- Event handling.
- Cleanup/lifecycle instructions.

List only files and dependencies that exist or are explicitly part of the generated setup. Do not reference a nonexistent `baset-ui.js` or a future adapter.

For framework outputs, never mutate framework-owned DOM in a way that conflicts with the framework's rendering lifecycle. Prefer a dedicated optional adapter when the behavior is too complex for a safe markup-only example.

## 7. CSS generation

The generator may output:

- Required Baset-UI classes.
- Scoped custom CSS.
- Component-specific custom property overrides.
- Global token overrides for a theme.

For one customized instance, scope overrides to a unique wrapper class or the component's documented local variables. Do not unexpectedly change every instance on the page.

Use `--bui-*` names for public variables. Do not emit duplicate global token declarations or create ad hoc global styles that conflict with the library.

## 8. Safety and escaping

Treat all Playground values as untrusted input.

- Validate selected options against the component schema.
- Escape text and attribute values correctly for the output language.
- Validate class names and enumerated values.
- Do not concatenate arbitrary user input into executable JavaScript.
- Never use `eval()` or `new Function()`.
- Never execute generated snippets inside the documentation page.
- Do not inject arbitrary HTML/CSS/JS into the live docs page.
- Keep the preview and source generation as separate operations based on the same normalized data.
- Do not send user configuration to an external service unless the behavior is explicitly designed, documented, and approved.

## 9. Determinism and formatting

For the same component, target, and normalized configuration, output should be deterministic.

- Keep indentation and formatting consistent.
- Keep generated files in a stable order.
- Avoid random IDs unless the component requires a unique ID; when it does, make the generation rule explicit and reproducible where possible.
- Include comments only when they explain required setup or limitations.
- Do not emit empty imports, empty files, or irrelevant setup steps.

## 10. Testing requirements

For each supported target, verify:

- Default configuration.
- Every documented variant.
- Boolean and optional properties.
- Text with quotes, ampersands, angle brackets, and non-Latin characters.
- Disabled/loading/error states where relevant.
- Correct class/attribute syntax for that target.
- Required imports and assets.
- Unsupported options are reported, not silently dropped.
- Interactive lifecycle and cleanup where claimed.

Syntax tests alone are insufficient for a target that claims interactive behavior. Test in the actual target environment.

## 11. Incremental implementation

- Start with a simple component and a single target.
- Confirm the schema and generator contract before multiplying templates.
- Add additional targets only when there is a clear use case and a way to validate them.
- Do not implement a large generator as part of an unrelated component task.
- Keep generator code in the documentation/developer tooling area, not the runtime assets.

## 12. Definition of done

A generator enhancement is complete when the selected configuration accurately drives both preview and output, generated code is safe and valid for every claimed target, required setup and limitations are visible, tests have been run, documentation is synchronized, and the task's preview/ZIP deliverables are ready.
