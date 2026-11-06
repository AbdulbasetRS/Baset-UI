# Baset-UI Mandatory Task Workflow

## 1. Purpose

This file defines the required workflow for every task performed on the Baset-UI repository. It is intended to be read before implementation, not after the task is finished.

The owner works incrementally by assigning one focused task at a time. Complete that task, preserve all unrelated work, and prepare the preview and full-project ZIP before reporting completion.

## 2. Required reading

At the start of every task:

1. Read the project-level instructions configured in Claude Project Instructions.
2. Read this file completely.
3. Read the instruction documents relevant to the task. When a task touches multiple areas, read all corresponding files:
   - `ARCHITECTURE.md`
   - `ASSET_ORGANIZATION.md`
   - `CODE_GENERATOR.md`
   - `CONTRIBUTING.md`
   - `DOCUMENTATION.md`
   - `PLAYGROUND.md`
   - `TESTING_STRATEGY.md`
4. Inspect the current repository structure and the actual implementation.
5. Inspect existing documentation, examples, and similar components.
6. Inspect Git status and diffs before editing.

If a task changes a shared foundation or directory structure, read all eight instruction files before starting.

Do not start implementation before this review.

## 3. Phase A — Understand the task

Before editing:

- Restate the requested outcome in practical terms.
- Identify what already exists and what is missing.
- Identify the smallest set of files likely to be affected.
- Identify public API, styling, path, accessibility, or compatibility risks.
- Identify applicable instructions and required validation.
- Identify the preview page or demo that will let the owner inspect the result.

Do not expand the request into unrelated cleanup or refactoring. Do not implement future roadmap items automatically.

## 4. Phase B — Protect the working tree

- Inspect `git status --short` and relevant diffs.
- Preserve pre-existing user edits, untracked files, and local experiments.
- Do not run destructive commands such as `git reset --hard`, `git clean -fd`, or broad checkout commands.
- Do not overwrite unrelated files.
- Do not commit, push, tag, publish, or rewrite history unless the owner explicitly asks.
- Do not assume the remote `main` branch is newer than the current local checkout.

If pre-existing changes overlap the requested files, incorporate them carefully and report any unresolved conflict.

## 5. Phase C — Implement narrowly

- Follow the existing naming, structure, and public API.
- Make the smallest maintainable change that satisfies the task.
- Reuse existing tokens, styles, utilities, and helpers.
- Follow `ASSET_ORGANIZATION.md` before creating or moving assets.
- Do not create unnecessary files, placeholders, duplicate implementations, dependencies, or build tools.
- Preserve existing behavior unless a change is explicitly requested.
- Keep RTL/LTR, light/dark, responsive behavior, and accessibility in scope where relevant.
- Do not claim support for code or framework targets that have not been implemented and tested.

## 6. Phase D — Update documentation

Update documentation in the same task when the implementation changes a public class, API, option, behavior, usage example, asset path, navigation entry, or feature status.

Check all applicable:

- Documentation page and code examples.
- Navigation and search data.
- Links, breadcrumbs, and GitHub edit URLs.
- Component specification, if the component contract changed.
- README or roadmap, only if project-level status actually changed.

Do not mark planned functionality as complete merely because a page or placeholder was added.

## 7. Phase E — Test and validate

Follow `TESTING_STRATEGY.md` and run the strongest checks available for the task.

At minimum, as relevant:

- Check syntax and obvious static errors.
- Check all modified asset references and relative paths.
- Open the affected documentation page directly.
- Test the main interaction, not just the initial appearance.
- Check browser console and network errors.
- Check RTL/LTR and light/dark behavior where applicable.
- Check narrow and wide viewports.
- Check accessibility basics and keyboard behavior for controls.

Report commands and results exactly. If a test could not be run, say why. Never invent passing results.

## 8. Phase F — Build a real navigable preview

A preview is mandatory for every repository-changing task.

The preview must let the owner inspect the actual result in a browser and navigate it like the documentation website. It must not be only a screenshot, a code snippet, or a textual description.

### Preview requirements

- Use the real updated project files, not a separately recreated mockup.
- Start the appropriate local preview server or use the available browser/preview integration.
- Make the documentation index reachable.
- Ensure the affected page/demo is linked from navigation or provide its direct URL.
- Ensure relative links, CSS, JavaScript, images, and nested pages load.
- Test direct navigation and refresh on the affected nested page.
- Keep the preview available for review for as long as the environment allows.

For a UI feature, the preview must show the feature in its real documentation/demo context and allow interaction where relevant. For a documentation-only or internal task, provide the navigable documentation site so the owner can browse the updated docs.

### Preview limitations

Do not invent a hosted preview URL or say a preview is live if it is not accessible to the owner. If the current environment cannot expose a browser preview, state that limitation clearly and provide the exact local command and URL the owner can use to open the project. A screenshot may be supplementary, but it does not replace the navigable preview.

## 9. Phase G — Create a complete project ZIP

A complete updated-project ZIP is mandatory after every repository-changing task unless the owner explicitly says not to create one.

The archive must contain the complete deliverable project, not only changed files:

- All current project source files.
- Public library assets.
- Documentation pages and documentation assets.
- `instructions/` and `templates/`.
- README, roadmap, license, and other required project files that exist.
- Any new files required for the project to run or be understood.

### ZIP exclusions

Do not include:

- `.git/` history and internal Git metadata.
- `node_modules/`, caches, temporary build directories, test artifacts, and operating-system metadata.
- Local `.env` files, credentials, API keys, personal tokens, or other secrets.
- Temporary screenshots, intermediate ZIPs, or unrelated files.

Do not exclude any source or asset required by the project. Do not add the ZIP itself into the ZIP.

### Naming and validation

Use a clear name, for example:

`Baset-UI-<task-name>-YYYYMMDD-HHmm.zip`

Keep one top-level `Baset-UI/` project directory inside the archive. Store the final ZIP in the task's deliverables/output area, not inside a folder that will be recursively included in itself.

Before presenting it:

1. Verify the archive exists and has a non-zero size.
2. List its contents and confirm the expected project structure is present.
3. Run an archive integrity check such as `unzip -t` or the platform equivalent.
4. Confirm the archive represents the same final state that was previewed.
5. Provide the exact download link/path generated by the current environment.

If a complete archive cannot be created, explain the precise blocker and provide the best available alternative. Do not claim it was created.

## 10. Phase H — Final report

The final response must include:

1. **Completed:** a concise summary of the requested change.
2. **Changed files:** the main files added, edited, moved, or removed.
3. **Preview:** a real navigable preview link or exact local launch command and URL, with any access limitation clearly stated.
4. **ZIP:** the exact verified full-project ZIP link/path.
5. **Validation:** tests/checks run and their real results.
6. **Limitations:** anything incomplete, unverified, or requiring owner action.
7. **Approval needed:** only decisions that genuinely require the owner's choice.

Do not say "done" for work that is only partially implemented. Do not conceal failures or skipped checks.

## 11. Rules that always apply

- The current implementation is the source of truth.
- Instructions govern how to work; they are not permission to replace working architecture unnecessarily.
- Preserve existing public APIs and backward compatibility.
- Do not remove existing functionality.
- Do not overwrite unrelated user changes.
- Do not add mandatory dependencies without approval.
- Do not commit or push without explicit permission.
- Do not silently change the task's scope.
- Do not invent preview links, test results, ZIP files, or deployment settings.
