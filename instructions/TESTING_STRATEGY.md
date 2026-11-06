# Baset-UI Testing Strategy

## 1. Purpose

Testing protects public CSS and JavaScript contracts, component behavior, responsive layout, themes, direction support, accessibility, documentation, Playground, and Code Generator output.

The testing approach should grow with the real project. Do not introduce a large testing stack before it is justified, but do not treat visual inspection alone as sufficient for complex interaction.

The current public baseline does not show a dedicated automated test framework. Inspect the actual working tree before choosing tools. Do not add mandatory test dependencies or a build system without approval.

## 2. Testing layers

### 2.1 Static checks

Use available tools or lightweight scripts to check:

- CSS syntax and malformed blocks.
- JavaScript syntax for scripts changed by the task.
- Broken local file references.
- Missing assets and incorrect relative paths.
- Duplicate IDs where relevant.
- Stale references to renamed files.
- Documentation links and navigation targets.
- No accidental debug output or new console errors.

Do not install a dependency solely to run a check that can reasonably be performed with existing tools, unless the project owner approves it.

### 2.2 Manual visual and functional checks

For every affected UI area, inspect:

- Default appearance and behavior.
- Variants and states that exist.
- Long text, translated text, and narrow content.
- Empty, disabled, loading, error, and boundary states where applicable.
- Pointer and touch behavior for interactive controls.
- Keyboard interaction and visible focus.
- Light and dark themes.
- RTL and LTR.
- Narrow, medium, and wide viewport sizes.
- Layout overflow and unintended page scrolling.
- Browser console and network failures.

Only test dimensions that apply to the feature. Explain why a dimension is not applicable rather than marking it as passed.

### 2.3 Automated unit/component tests

Add automated tests when behavior is stable and the repository has, or the owner approves, a suitable test setup.

Good candidates include:

- Option normalization and validation.
- Component initialization and repeated initialization.
- Public method behavior.
- Event dispatch and payloads.
- State changes.
- Keyboard interactions.
- Cleanup and disposal.
- Configuration import/export.
- Code Generator determinism and escaping.

Choose a tool after inspecting the repository. Playwright, Vitest, Jest, or another tool may be suitable, but no tool is mandatory by default.

### 2.4 Browser/integration tests

Complex browser behavior should be tested in an actual browser, especially for:

- Modals and dialogs.
- Dropdowns and menus.
- Select/combobox controls.
- Date/time pickers.
- Calendars and schedulers.
- DataTable interactions.
- Drag-and-drop.
- Popovers, tooltips, and floating panels.
- Focus management, scrolling, and overlay positioning.

A screenshot does not prove that an interaction works. Test scrolling, resizing, keyboard navigation, opening/closing, and cleanup as applicable.

### 2.5 Framework integration tests

When a dedicated React, Vue, Angular, or Laravel adapter is claimed as supported, test it in a representative application using that framework.

Verify:

- Initial mount/render.
- State or prop update.
- Conditional rendering.
- Repeated mount/unmount.
- Event propagation.
- Value synchronization.
- Cleanup of listeners, observers, timers, and generated DOM.

A plain HTML snippet is not an integration test.

## 3. Required quality matrix

| Area | Checks |
|---|---|
| Functionality | Expected behavior, variants, edge cases |
| CSS | Correct classes, responsive rules, no accidental regressions |
| JavaScript | Initialization, updates, errors, cleanup, if applicable |
| Theme | Light and dark, including scoped themes where used |
| Direction | RTL and LTR |
| Responsive | Small, medium, and large viewports |
| Accessibility | Semantics, labels, keyboard, focus, ARIA where needed |
| Browser | Actual target browsers/devices where available |
| Documentation | Examples match the implementation; links and assets load |
| Playground | Controls update the real preview; state stays isolated |
| Generator | Output syntax, escaping, assets, and behavior are accurate |
| Packaging | Full ZIP contains expected source and passes integrity check |
| Preview | Navigable browser preview matches the final project state |

## 4. CSS and design-system tests

For shared foundations and layout utilities, check:

- Token names and defaults remain stable.
- Light/dark token values are applied correctly.
- Components consume shared tokens rather than duplicate values.
- The `bui-` and `--bui-` naming conventions are followed.
- Breakpoint values and mobile-first cascade are preserved.
- Container widths and gutters do not create horizontal overflow.
- Grid columns, offsets, ordering, and alignment work at relevant breakpoints.
- Logical properties behave correctly in RTL and LTR.
- Utility classes do not unintentionally override component internals.
- CSS consolidation does not remove classes or change cascade order unexpectedly.

For a CSS-only change, do not invent a JavaScript test requirement.

## 5. JavaScript lifecycle tests

For an interactive runtime component, test the lifecycle parts that apply:

- Initialize once.
- Initialize twice without duplicating behavior.
- Update configuration/value.
- Handle invalid options safely.
- Dispatch documented events.
- Destroy/dispose cleanly.
- Reinitialize after destroy.
- Remove listeners, observers, timers, and generated nodes.
- Handle missing target elements without crashing unrelated code.

Do not require every CSS-only component to have an instance lifecycle.

## 6. Documentation website tests

For every affected docs page, check:

- Direct URL loading and refresh.
- Correct relative asset paths.
- No domain-root `/assets/...` paths that break GitHub Project Pages.
- CSS, JavaScript, images, icons, and fonts load.
- Sidebar navigation and active-page state.
- Search entries and result links.
- Internal page links, breadcrumbs, and GitHub edit links.
- Arabic/English direction and language switching where available.
- Light/dark docs theme.
- Code examples match current APIs and files.
- Console and network panel show no new errors.

With the documentation in the repository root, test both `index.html` and nested pages such as `getting-started/install.html` or `layout/grid-system.html` directly and after refresh.

## 7. Playground and Code Generator tests

For the Playground:

- Every visible control changes the preview.
- Reset returns the actual defaults.
- Invalid inputs are rejected or safely normalized.
- Multiple previews do not leak state/styles into each other.
- Theme and direction controls work where supported.
- Keyboard operation and focus remain usable.
- A global theme change affects all token-driven preview components, while component customization stays scoped.
- Imported configuration is validated.
- Copy and export actions give truthful feedback, and the Playground never executes generated code.

For the Code Generator:

- Output is deterministic for a fixed configuration.
- Text and attributes are escaped for the target language.
- Correct class syntax is used per target.
- Required assets/imports are present and real.
- Unsupported options are not silently dropped.
- Only tested targets are marked supported.
- Interactive output is tested in the environment it claims to support.

## 8. Browser and viewport coverage

Use the browsers/devices available in the environment. Prioritize current Chromium-based browsers, Firefox, and Safari/WebKit where test infrastructure permits. Do not claim a browser was tested if it was not available.

At minimum, visually inspect a narrow mobile width, a tablet-like width, and a desktop width for responsive UI changes. Use the project's actual breakpoint values when testing responsive utilities.

## 9. Component-specific testing

Apply these only when the component exists.

- **Buttons:** all variants and sizes, disabled and loading states, icon placement, focus-visible state, long labels on narrow screens, and generated code for each supported target.
- **Modal/dialog:** open and close methods, Escape, focus entering the dialog and being restored on close, documented background interaction, scroll-lock cleanup, and no duplicate listeners after repeated open/close.
- **Dropdown, menu, select:** keyboard navigation, selection, outside click, Escape, popup positioning during scroll and resize, RTL placement, and screen-reader labeling and expanded state.
- **Date/time picker and calendar:** valid and invalid values, min/max boundaries, locale and direction, keyboard navigation, documented time-zone assumptions, popup position during scroll/resize, and focus management.
- **Data-heavy components (DataTable, Calendar, Tree):** empty and large datasets, search/filter, sorting, pagination or navigation, responsive behavior, performance with representative data, keyboard and accessibility behavior, and virtualization only if implemented.

## 10. Accessibility checks

Combine semantic markup review, keyboard-only testing, screen-reader spot checks where possible, and automated accessibility tools when available. An automated scanner does not prove full accessibility. Record known limitations and manually test complex interactions. Never claim accessibility compliance that was not audited.

## 11. Test tooling policy

Before adding test tooling: inspect existing scripts and dependencies, decide whether the tool is development-only, explain what it validates and its installation and maintenance cost, keep it out of the runtime core, and ask for approval before introducing a substantial new dependency or build requirement.

## 12. Reporting results

For every task, report:

- Exact commands executed.
- Which manual scenarios were checked.
- Pass/fail/blocked status.
- Browser and viewport used, when known.
- Errors found and fixed.
- Checks not run and why.

Use clear status language:

- **Passed:** actually executed and succeeded.
- **Failed:** executed and found a defect.
- **Not run:** not executed.
- **Blocked:** could not execute due to a specific limitation.

Never convert "not run" into "passed". Never report "all tests passed" unless all relevant tests were run.

## 13. Definition of done

Testing is complete when relevant static, functional, visual, browser, accessibility, and documentation checks have been performed or explicitly marked not run/blocked; remaining issues are reported; the navigable preview is available; and the complete ZIP passes an integrity check.
