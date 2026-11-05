# Baset-UI Testing Strategy

## 1. Purpose

Testing protects component behavior, public APIs, accessibility, responsive layouts, themes, direction support, and framework compatibility.

Testing should grow with the project. Do not add a large test stack before there is a real need, but do not treat visual inspection alone as sufficient for complex interactive components.

## 2. Testing layers

### 2.1 Manual component checks

Every component should be manually checked for:

- Default behavior.
- All documented variants.
- Empty, disabled, loading, error, and edge states where relevant.
- Mouse and touch interaction.
- Keyboard interaction.
- Light and dark themes.
- RTL and LTR.
- Small, medium, and large viewport widths.
- Long text and translated labels.
- Focus visibility.
- Console errors and obvious layout overflow.

### 2.2 Automated component tests

Add automated tests when behavior is stable enough to test.

Useful candidates:

- Initialization and cleanup.
- Option validation.
- Event dispatch.
- State updates.
- Keyboard behavior.
- Component-specific business rules.
- Code Generator output.
- Configuration import/export.

Choose tools after inspecting the current repository. Playwright, Vitest, Jest, or another tool may be appropriate, but none should become a mandatory dependency without an explicit project decision.

### 2.3 Browser/integration tests

Interactive components should be tested in actual browser rendering.

Prioritize components with complex focus, overlay, pointer, scrolling, or keyboard behavior, such as:

- Modal and dialogs.
- Dropdowns and menus.
- Select and combobox.
- Date/time pickers.
- Calendar and scheduler.
- DataTable.
- Tree view.

### 2.4 Framework compatibility tests

When an integration is claimed as supported, test it in a representative application using that framework.

At minimum, verify:

- Initial mount/render.
- Re-render or state update.
- Conditional mount/unmount.
- Repeated mount/unmount.
- Event propagation.
- Value synchronization where applicable.
- Cleanup of listeners, observers, and generated DOM.

A plain HTML example is not a substitute for a React, Vue, or Angular integration test.

## 3. Required test matrix

| Area | Required checks |
|---|---|
| Functionality | Expected behavior and edge cases |
| Theme | Light and dark |
| Direction | RTL and LTR |
| Responsive | Mobile, tablet, desktop |
| Accessibility | Keyboard, focus, labels, semantics |
| Browser | Supported target browsers |
| Lifecycle | Init, update, destroy, repeated init |
| Framework | Mount, update, unmount, cleanup when claimed |
| Docs | Examples match actual API |
| Generator | Output syntax and behavior match configuration |

Do not test irrelevant dimensions mechanically. Explain any dimension that does not apply to a component.

## 4. Component-specific testing

### Buttons

- All variants and sizes.
- Disabled behavior.
- Loading state.
- Icon placement.
- Focus-visible state.
- Long labels and narrow screens.
- Correct generated code for each supported target.

### Modal/dialog

- Open and close methods.
- Escape behavior.
- Focus enters the dialog.
- Focus is restored on close.
- Background interaction is handled as documented.
- Scroll locking is cleaned up.
- Repeated open/close does not duplicate listeners.

### Dropdown/menu/select

- Keyboard navigation.
- Selection behavior.
- Outside click.
- Escape.
- Correct popup positioning during scroll and resize.
- RTL placement.
- Screen-reader labeling and expanded state.

### Date/time picker and calendar

- Valid and invalid values.
- Min/max dates and edge boundaries.
- Locale and direction.
- Keyboard navigation.
- Time zone assumptions are documented.
- Popup position during scroll/resize.
- Focus management.

### Data-heavy components

For DataTable, Calendar, Tree, or similar components:

- Empty and large datasets.
- Search/filter.
- Sorting.
- Pagination or navigation.
- Responsive behavior.
- Performance with representative data.
- Keyboard and accessibility behavior.
- Virtualization only if implemented.

## 5. Playground tests

- Every control changes the preview.
- Reset restores defaults.
- Invalid values are rejected or handled safely.
- Component customization remains scoped.
- Global theme affects all token-driven preview components.
- Imported configuration is validated.
- Preview and code generator use the same normalized configuration.
- The Playground does not execute generated code.
- Copy/export actions provide truthful feedback.

## 6. Code Generator tests

For every supported target:

- Correct syntax (`class` vs `className`, etc.).
- Correct content and variants.
- Correct escaping of special characters.
- Required imports and dependencies.
- Required CSS and JavaScript setup.
- Unsupported options are surfaced.
- Output is deterministic for the same configuration.
- Interactive examples handle lifecycle and cleanup.

## 7. Accessibility checks

Use a combination of:

- Semantic markup review.
- Keyboard-only testing.
- Screen-reader spot checks where possible.
- Automated accessibility tools when available.

An automated scanner does not prove full accessibility. Record known limitations and manually test complex interactions.

## 8. Test tooling policy

Before adding test tooling:

1. Inspect existing scripts and dependencies.
2. Decide whether the tool is development-only.
3. Explain what it validates.
4. Explain installation and maintenance cost.
5. Keep it out of the runtime core.
6. Ask for approval before introducing a substantial new dependency or build requirement.

## 9. Reporting

For every task, report:

- What was tested.
- Exact commands executed.
- Actual pass/fail results.
- Browsers/environments checked.
- Checks not run and why.
- Known issues.

Never claim that a test passed if it was not executed.

## 10. Definition of done

A component is not complete solely because it renders. Its relevant behavior, accessibility, direction, theme, responsive layout, lifecycle, documentation, and claimed integrations must be checked.
