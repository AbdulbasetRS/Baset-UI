# Contributing to Baset-UI

## 1. Purpose

This document describes how to change Baset-UI safely and incrementally. It applies to new components, fixes, layout utilities, documentation, Playground work, and Code Generator work.

The repository is developed in small tasks. Complete the requested scope without turning each task into a broad refactor.

## 2. Before making changes

1. Read the Claude Project Instructions configured for this project.
2. Read `instructions/TASK_WORKFLOW.md`.
3. Read the other instruction files relevant to the task.
4. Inspect the current branch, repository structure, `git status`, and existing diffs.
5. Search for the feature, public class, variable, method, or page before creating a duplicate.
6. Inspect similar implementations and their documentation.
7. Identify the smallest appropriate set of files to change.

Do not overwrite, reset, stash, or discard changes that were already present in the user's working tree. Do not assume the GitHub `main` branch is newer than the local checkout.

## 3. Scope and planning

Before implementation, state internally or in the working notes:

- What behavior the task requires.
- What is already implemented.
- Which files are likely to change.
- Which instruction documents apply.
- What could be a public API or backward-compatibility risk.
- How the result will be tested and previewed.

If a task is genuinely ambiguous in a way that affects the public API, surface the decision rather than silently inventing a permanent convention. Otherwise make a conservative choice consistent with existing code.

A small, coherent, verified library is a better foundation than a large collection of partially working components. Do not mark a component complete because its visual demo looks correct.

## 4. Adding or extending a component

For a substantial new component, copy `templates/COMPONENT_SPEC_TEMPLATE.md` and define:

- Purpose and use cases.
- Markup contract and public classes.
- Variants, states, and defaults.
- CSS variables, if public customization is needed.
- JavaScript API, events, and lifecycle, only if interactive.
- Accessibility and keyboard behavior.
- Responsive behavior.
- Theme and RTL/LTR behavior.
- Playground properties, if applicable.
- Export targets, if applicable.
- Test plan and documentation pages.

Do not create an artificial specification for a tiny bug fix. Do not implement unsupported options simply because another UI library has them.

Provide at least a basic example, the important variants, the relevant states, and a realistic use case. Realistic content often exposes layout or behavior problems that placeholder text hides. Keep the simplest use case simple: prefer HTML and CSS for a static component, and define initialization, options, events, updates, and cleanup only for an interactive one.

### Implementation order

1. Preserve or define the smallest clear markup/API contract.
2. Implement semantic HTML and foundational CSS.
3. Add vanilla JavaScript only when necessary.
4. Reuse tokens and shared helpers that already exist.
5. Scope CSS and DOM behavior to the component.
6. Add keyboard and focus handling for interactive behavior.
7. Add examples and documentation.
8. Add Playground and generated exports only when required and verified.
9. Run relevant testing and visual checks.

## 5. Improving an existing component

1. Inspect the current behavior and public API.
2. Identify the bug or improvement and make a focused change.
3. Preserve existing use cases.
4. Update examples and documentation.
5. Add regression coverage where possible.
6. Explain any compatibility impact.

Do not rewrite an existing component from scratch merely because a new pattern is preferred.

## 6. Adding a framework integration

A framework integration is separate and optional. Before creating one: confirm that core compatibility is insufficient for the use case, confirm the core API is stable enough, define how the framework owns state and DOM lifecycle, define event and value synchronization and cleanup, add framework-specific examples and tests, and keep core styles and behavior shared. Do not create adapter packages preemptively.

## 7. Public naming and compatibility

- Use `bui-` for public CSS classes.
- Use `--bui-` for public CSS variables.
- Follow existing file and method naming in the repository.
- Prefer CSS logical properties for directional layout.
- Preserve existing theme classes and selectors unless the task explicitly migrates them.
- Preserve documented breakpoints and responsive utility names.

Before changing or removing a public class, variable, method, event, or option, search the repository and docs for usage. Prefer additive changes. For an unavoidable breaking change, explain the reason, document the migration, and obtain the required approval.

## 8. CSS and JavaScript boundaries

Follow `instructions/ASSET_ORGANIZATION.md` for every asset decision.

- Do not create separate core files for ordinary layout, grid, typography, breakpoints, or general utilities.
- Keep large, optional feature assets separate only when there is a real independent loading benefit.
- Keep documentation scripts separate from runtime assets.
- Do not create empty files or placeholder directories.
- Do not create a runtime entry point until actual runtime JavaScript is needed.
- Do not add a package manager, compiler, bundler, or mandatory runtime dependency without explicit approval.

## 9. Documentation and examples

Documentation is part of the implementation, not a later optional polish step.

When behavior, a public class, an option, a variable, an example, or a page changes:

- Update the relevant documentation page.
- Update navigation/search metadata if page structure or titles change.
- Keep code samples executable and paths valid.
- State required assets accurately.
- Document accessibility, keyboard, RTL/LTR, and theme behavior where relevant.
- Do not advertise planned features as implemented.

Follow `instructions/DOCUMENTATION.md`.

## 10. Playground and Code Generator

Only add Playground controls for real component options. Controls must affect the actual preview. Use one structured configuration model for preview and output.

Only add a generated target when its output is valid and its support status is explicit. Never generate nonexistent framework wrappers, Blade components, imports, or runtime files.

Follow `instructions/PLAYGROUND.md` and `instructions/CODE_GENERATOR.md`.

## 11. Dependencies and tooling

Before adding a dependency or build tool, explain:

- Why native browser features or current utilities are insufficient.
- Whether it is runtime or development-only.
- Bundle/installation impact.
- Maintenance and license implications.
- Whether it can remain optional.

Do not add mandatory runtime dependencies without the owner's approval. Do not introduce a build system just to imitate another library.

## 12. Validation

Follow `instructions/TESTING_STRATEGY.md`.

Run the relevant available checks and report exact commands/results. Do not say a test passed if it was not executed. If the repository has no automated test runner for the touched area, perform and report the strongest practical manual/static checks instead.

## 13. Task deliverables

For every repository-changing task, follow `TASK_WORKFLOW.md`:

- Prepare a complete ZIP of the updated project, not merely a patch or the changed files.
- Provide a navigable browser preview of the documentation/site or changed feature before presenting the ZIP as ready.
- Verify the archive can be opened and contains the final state that was previewed.
- Report changed files, test results, preview access, ZIP location, and limitations.

Do not create a fake preview URL or claim that a server, browser session, test, or archive exists when it does not.

## 14. Git and user changes

- Never commit or push unless the user explicitly asks.
- Do not rewrite Git history.
- Do not reset, clean, or force-checkout over user work.
- Do not delete unrelated files.
- Do not include secrets, `.env` files, credentials, or local machine data in deliverable ZIPs.

## 15. Code quality checklist

- [ ] No unnecessary runtime dependency and no framework dependency in the core.
- [ ] Project naming conventions (`bui-`, `--bui-`) are used.
- [ ] Shared design tokens are reused.
- [ ] No accidental global CSS, duplicate code, or unused files.
- [ ] RTL/LTR and light/dark themes are handled.
- [ ] Responsive layout and keyboard behavior are checked where relevant.
- [ ] Initialization and cleanup are checked where relevant.
- [ ] No new console errors.
- [ ] Documentation is updated and accurate.
- [ ] Playground options reflect real functionality, and generated code reflects the same configuration.
- [ ] Tests and limitations are reported.

## 16. Change summary

A useful change summary states the purpose, main implementation details, public API changes, files changed, preview access, tests performed, known limitations, and migration notes where applicable. `TASK_WORKFLOW.md` defines the required final report.

## 17. Definition of done

A task is complete when the requested behavior is implemented, relevant documentation is updated, compatibility and accessibility have been considered, applicable tests/checks are reported honestly, the preview is navigable, and a verified full-project ZIP is available.
