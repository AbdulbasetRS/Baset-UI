# Baset-UI Incremental Roadmap

## Guiding rule

Build Baset-UI gradually. Complete a small, coherent milestone before moving to the next one. Do not attempt to build every component, every framework adapter, and the entire Playground at once.

This roadmap describes a suggested order, not a commitment to specific release dates.

## Phase 0 — Project foundation

Goals:

- Establish project identity and license.
- Establish CSS and JavaScript naming conventions.
- Define design tokens.
- Define theme and direction conventions.
- Create documentation structure.
- Agree on component specification format.
- Establish basic validation and testing approach.

Completion criteria:

- New contributors can understand how to add a component.
- Core principles are documented.
- A minimal static example can load the core styles.

## Phase 1 — Core foundations

Goals:

- Base tokens and theme.
- Typography and shared utilities.
- RTL/LTR foundation.
- Focus and accessibility foundations.
- Minimal vanilla JavaScript namespace/helpers, only if needed.

Do not build every utility before a real component demonstrates the need.

## Phase 2 — First component family

Start with simple, high-value components:

1. Button.
2. Badge.
3. Alert.
4. Card.
5. Form controls.

Complete each component's markup, styles, variants, documentation, and tests before expanding.

## Phase 3 — First Component Playground

Use Button as the pilot.

Goals:

- Structured Button definition.
- Configurable properties.
- Live preview.
- Reset behavior.
- Generated HTML.
- Generated React JSX markup.
- Clear asset/setup notes.
- Basic output validation.

After this works, add Vue, Angular, and Blade markup templates and verify each output.

## Phase 4 — Code Generator foundation

Goals:

- Stable component configuration format.
- Target registry.
- Explicit generator result format.
- Per-target support status.
- Escaping and validation.
- Required asset/import notes.
- Tests for deterministic output.

Do not add all targets to every component by assumption. Add only verified component/target combinations.

## Phase 5 — Global Theme Playground

Goals:

- Edit shared design tokens.
- Preview multiple components.
- Light/dark preview.
- RTL/LTR preview.
- Copy/download token overrides.
- Import/export versioned theme configuration.

Ensure component-level customization remains distinct from global theme changes.

## Phase 6 — Interactive components

Add complex components one at a time, for example:

- Modal.
- Toast.
- Dropdown/menu.
- Select.
- Date/time picker.
- Calendar/scheduler.
- DataTable.
- Tree view.

For each component, design lifecycle, keyboard behavior, focus handling, and cleanup before creating framework integrations.

## Phase 7 — Framework adapters

Only after core APIs are stable, evaluate optional packages:

- React.
- Vue.
- Angular.
- Laravel/Blade.

Prioritize based on actual user demand. Each adapter needs its own examples and tests. Do not block core releases on adapters.

## Phase 8 — Quality and ecosystem

Possible improvements:

- More automated browser testing.
- Accessibility audits.
- Performance benchmarks for data-heavy components.
- Component recipes and templates.
- Theme presets.
- More code export targets.
- Package distribution improvements.
- Migration guides and release notes.

## What not to do early

- Do not build every adapter before the core is stable.
- Do not build a visual code editor before a small component Playground works.
- Do not add a large state-management layer for simple controls.
- Do not virtualize small lists without evidence.
- Do not add a build system or dependency merely to match another library.
- Do not rewrite existing working components as a prerequisite for adding new ones.

## Milestone completion

A phase is complete when its stated goals are implemented, documented, and verified. Update this roadmap as actual priorities change.
