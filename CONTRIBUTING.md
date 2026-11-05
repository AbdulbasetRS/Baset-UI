# Contributing to Baset-UI

This guide describes the expected workflow for adding components and improving the library incrementally.

## 1. Before starting

1. Read `CLAUDE.md` and the relevant architecture/testing documents.
2. Inspect the existing repository and similar components.
3. Search for an existing implementation or partial feature.
4. Identify the users and use cases the change should support.
5. Avoid unrelated refactoring.

## 2. Adding a new component

Use this sequence.

### Step 1 — Define the component

Create a specification from `templates/COMPONENT_SPEC_TEMPLATE.md`.

Define:

- Purpose and use cases.
- Basic markup.
- Variants and states.
- Public API.
- Events and lifecycle.
- Accessibility behavior.
- Responsive behavior.
- RTL/LTR behavior.
- Theme behavior.
- Playground options.
- Export targets.
- Tests and examples.

Do not start with a large implementation before the expected behavior is clear.

### Step 2 — Design the public API

Keep the simplest use case simple.

For a static component, prefer HTML and CSS. For an interactive component, define clear initialization, options, events, updates, and cleanup.

Check existing public API conventions before introducing a new pattern.

### Step 3 — Implement the core

- Use HTML, CSS, and vanilla JavaScript.
- Keep the component independent of frontend frameworks.
- Follow `bui-` and `--bui-` naming.
- Reuse shared design tokens.
- Avoid new runtime dependencies.
- Keep code scoped and modular.
- Preserve existing behavior.

### Step 4 — Add examples

Provide at least:

- A basic example.
- Important variants.
- Relevant states.
- A realistic use case.

Do not use only placeholder content if realistic content exposes layout or behavior problems.

### Step 5 — Add Playground support

For components with meaningful configurable properties:

- Define a structured component schema.
- Add controls for supported options only.
- Use the schema for live preview.
- Use the same normalized configuration for code generation.
- Keep the preview isolated from other documentation content.

Very simple components may need only a small Playground.

### Step 6 — Add code export

Add target templates only when the output can be generated accurately.

For each target, document:

- Whether it is markup-only or a dedicated integration.
- Required CSS/JS assets.
- Required imports/packages.
- Limitations.
- Testing performed.

Never output a Blade component tag or framework wrapper that does not exist.

### Step 7 — Test

Follow `TESTING.md`.

Check functionality, themes, directions, responsive layouts, accessibility, lifecycle, and relevant exports.

### Step 8 — Update documentation

Update all affected documentation:

- Component page.
- Documentation index.
- Navigation.
- Examples.
- Playground.
- Code Generator target status.
- README or overview pages, if relevant.

Do not leave dead links or examples that no longer match the API.

### Step 9 — Review and report

Check:

- Naming consistency.
- Duplicate code.
- Console errors.
- Unintended global styles.
- Unused files.
- Accessibility basics.
- Compatibility.
- Documentation accuracy.

Report exactly what changed and what was tested.

## 3. Improving an existing component

1. Inspect current behavior and public API.
2. Identify the bug or improvement.
3. Add a focused change.
4. Preserve existing use cases.
5. Update examples and docs.
6. Add regression coverage where possible.
7. Explain any compatibility impact.

Do not rewrite an existing component from scratch merely because a new pattern is preferred.

## 4. Adding a framework integration

A framework integration should be separate and optional.

Before creating one:

- Confirm that core compatibility is insufficient for the use case.
- Confirm that the core API is stable enough.
- Define how the framework owns state and DOM lifecycle.
- Define event and value synchronization.
- Define cleanup behavior.
- Add framework-specific examples and tests.
- Keep core styles and behavior shared.

## 5. Code quality checklist

- [ ] No unnecessary runtime dependency.
- [ ] No framework dependency in core.
- [ ] Uses project naming conventions.
- [ ] Uses design tokens.
- [ ] No accidental global CSS.
- [ ] Handles RTL and LTR.
- [ ] Handles light and dark themes.
- [ ] Responsive layout checked.
- [ ] Keyboard behavior checked where relevant.
- [ ] Initialization and cleanup checked where relevant.
- [ ] Documentation updated.
- [ ] Playground options reflect real functionality.
- [ ] Generated code reflects the same configuration.
- [ ] Tests and limitations reported.

## 6. Pull request or change summary

A useful change summary contains:

- Purpose.
- Main implementation details.
- Public API changes.
- Files changed.
- Screenshots or preview, when useful.
- Tests performed.
- Known limitations.
- Migration notes, if applicable.
