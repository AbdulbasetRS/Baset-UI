# Start Here — Baset-UI

This file explains how to use the foundation documents and begin the project gradually.

## 1. Place the files

Copy the foundation files into the root of the Baset-UI repository.

The root should contain:

```text
/
├── README.md
├── CLAUDE.md
├── ARCHITECTURE.md
├── PLAYGROUND.md
├── CODE_GENERATOR.md
├── TESTING.md
├── CONTRIBUTING.md
├── ROADMAP.md
└── templates/
    └── COMPONENT_SPEC_TEMPLATE.md
```

Keep the repository's actual `LICENSE` file. Do not replace it with an assumed license.

If the repository already contains useful documentation or source files, inspect and merge carefully rather than deleting them blindly.

## 2. Ask Claude to initialize the project

Use `PROJECT_BOOTSTRAP_PROMPT.md` as the first task.

The first task should establish a clean, minimal foundation. It should not attempt to implement the full component library, all framework adapters, or the complete Playground.

## 3. Build in small milestones

Recommended sequence:

1. Project foundation and conventions.
2. Design tokens and theme foundation.
3. RTL/LTR foundation.
4. Button as the first complete component.
5. Button documentation and Playground.
6. HTML and framework markup exports for Button.
7. Global Theme Playground.
8. Additional components one at a time.
9. Complex interactive components.
10. Optional framework adapters when there is a demonstrated need.

Use `ROADMAP.md` to track progress.

## 4. Before implementing a component

1. Copy `templates/COMPONENT_SPEC_TEMPLATE.md`.
2. Rename the copy to match the component.
3. Define its API, states, accessibility, direction, theme, and tests.
4. Review the existing architecture.
5. Implement only that component and its required shared utilities.
6. Update its documentation and Playground.
7. Verify generated output before declaring export support.

## 5. Important project decisions

- Keep the core framework-agnostic.
- Do not make React, Vue, Angular, or Laravel mandatory dependencies.
- Do not build separate component implementations per framework.
- Do not create empty adapter packages before they are needed.
- Do not implement all Playground features in the first milestone.
- Keep generated code separate from the runtime core.
- Mark unfinished framework targets honestly.
- Do not claim a component is complete because its preview looks correct.

## 6. What a good first release looks like

A good first release does not need dozens of components.

It should have:

- A stable core foundation.
- Clear design tokens.
- Light and dark theme behavior.
- RTL and LTR foundations.
- A small number of polished components.
- Accurate documentation.
- A working Button Playground.
- Correct code exports for the targets actually supported.
- Tests and known limitations clearly reported.

A small, coherent, verified library is a better foundation than a large collection of partially working components.
