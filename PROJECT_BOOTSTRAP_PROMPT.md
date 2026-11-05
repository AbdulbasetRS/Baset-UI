# Prompt: Initialize Baset-UI from a Clean Foundation

Use this prompt with Claude Code after placing the foundation documents in the repository.

---

You are initializing **Baset-UI**, a framework-agnostic UI library.

Before doing any work, read these files completely:

- `CLAUDE.md`
- `ARCHITECTURE.md`
- `PLAYGROUND.md`
- `CODE_GENERATOR.md`
- `TESTING.md`
- `CONTRIBUTING.md`
- `ROADMAP.md`
- `START_HERE.md`

Also inspect the current repository, including its existing README, license, source files, and documentation.

## Main objective

Prepare a clean and maintainable starting foundation for Baset-UI so that components can be added incrementally over time.

The library's core must use standard HTML, CSS, and vanilla JavaScript. It must not require React, Vue, Angular, Laravel, or any other framework.

The same core should be usable in plain HTML, Laravel Blade, React, Vue, Angular, and other environments that can render standard HTML.

## Important boundaries

For this initialization task:

- Do not implement a large component collection.
- Do not create React, Vue, Angular, or Laravel adapter packages.
- Do not build the complete Playground or Code Generator.
- Do not introduce a mandatory build system.
- Do not add mandatory runtime dependencies.
- Do not rewrite unrelated existing code.
- Do not delete existing useful files.
- Do not change the repository license.
- Do not claim support for integrations that have not been tested.
- Do not create empty speculative folders.

## Work to perform

### 1. Repository audit

Inspect the existing repository and report:

- Current directory structure.
- Existing assets and source files.
- Existing conventions that should be preserved.
- Conflicts between existing files and the new foundation documents.
- Any missing prerequisite that blocks initialization.

Do not assume that the repository is empty.

### 2. Reconcile project documentation

If the repository already contains documentation:

- Preserve accurate project information.
- Merge the new architecture and workflow rules.
- Remove contradictions carefully.
- Keep `CLAUDE.md` as the primary agent instruction file.
- Keep detailed architecture, Playground, Code Generator, and testing guidance in their dedicated documents.

Do not duplicate the entire contents of every document inside `CLAUDE.md`.

### 3. Establish the minimal project structure

Create only the directories and files needed for the first milestone.

Use the suggested repository structure from `ARCHITECTURE.md` as guidance, not as a requirement to create every planned directory.

Keep source/runtime code separate from documentation and Playground code.

### 4. Establish naming and design foundations

Confirm or define:

- CSS class prefix: `bui-`.
- CSS variable prefix: `--bui-`.
- JavaScript namespace convention: `BUI`, where a global API is appropriate.
- Theme token strategy.
- RTL/LTR strategy using CSS logical properties.
- Component naming and file naming conventions.

If existing conventions already work, preserve them unless they conflict with a documented project principle.

### 5. Create a minimal working foundation

Create only the smallest useful baseline needed to prove that the library can be loaded as static assets.

The baseline should include:

- A minimal core stylesheet.
- A minimal JavaScript entry point only if needed.
- A simple documentation landing page or starter page.
- One small example proving the CSS can be consumed without a frontend framework.
- Clear comments only where they help maintenance.

Do not implement the Button component yet unless the repository owner explicitly includes it in this initialization task. Button should be the next separate milestone.

### 6. Verify the baseline

Check:

- Static HTML can load the core styles.
- CSS naming follows the project rules.
- No framework dependency is required.
- No accidental global styles are introduced.
- Theme and direction foundations are documented.
- Existing repository content remains intact.

Run only checks that are actually available. Report commands and real results.

### 7. Update project status

Update `ROADMAP.md` only to reflect work that was actually completed.

Do not mark future features as implemented.

## Final response

Provide:

1. Repository audit summary.
2. Files created or changed.
3. Final directory structure.
4. Decisions made and why.
5. Tests/checks actually executed.
6. Remaining issues or decisions requiring approval.
7. The exact next recommended task: implement the first complete Button component using `CONTRIBUTING.md` and `templates/COMPONENT_SPEC_TEMPLATE.md`.

Do not start the next task automatically. Finish the foundation first and report the result.
