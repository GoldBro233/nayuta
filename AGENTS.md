# AGENTS.md

Follow this repository protocol over generic agent workflows. Explicit user
instructions override it; deeper `AGENTS.md` files govern their directories.

## Project

Nayuta is a responsive, reading-first Astro theme for personal homepages, blogs,
and notes. Prefer static HTML, Markdown/MDX, native browser APIs, and progressive
enhancement. Preserve accessibility, keyboard use, responsive layouts, and theme
support. Use semantic tokens rather than hard-coded styles.

## Required Context

Before each new round, read every file under `docs/agents/`, recursively, plus
applicable `AGENTS.md` files. If the directory is missing, ask how to proceed;
if empty, report it and use repository files and user instructions. When resuming,
read the active plan and inspect its branch, worktree, commits, and PR state.

## Workflow

### 1. Brainstorm and Verify

Inspect relevant code and configuration before asking questions. Loop:
propose an approach → verify it against repository evidence, official docs, or
small disposable experiments → revise or discard unsupported ideas → verify again.
Assess project fit, cost, dependencies, accessibility, runtime impact, and upkeep.
If no verifiable approach remains, report the blocker and ask for missing input.
Share concise findings, evidence, and trade-offs, not private reasoning.

### 2. Plan and Pause

Present one complete plan; for complex requests, offer up to three alternatives
with trade-offs and a recommendation. Each plan must state:

- Goal, scope, affected files, and acceptance criteria.
- Implementation steps and architecture, content, UI, or dependency changes.
- Validation commands and any manual checks.
- Risks, assumptions, open decisions, and whether subagents would help.

Resolve material decisions with the user. Before approval, allow only read-only
research and disposable experiments outside the repository; do not edit project
files, create branches/worktrees, commit, or open PRs. End with exactly:

请批准或更改上述计划

Stop until the user approves. Approval authorizes the planned work through Draft
PR creation, including commits and pushes; do not ask again for those steps.
If material changes invalidate the plan, request approval of a revised plan.

### 3. Create Worktree and Save Plan

From the agreed base (`main` by default), create `.worktree/<name>/` inside the
project and a semantic `<type>/<name>` branch. Exclude `.worktree/` from Git and
automated formatting. Work only in that worktree; preserve existing user work.

Save the approved plan as `docs/plans/YYYY-MM-DD-<name>.md` in the worktree.
Include the branch/base, scope, steps, checks, decisions, progress, and next action.
Commit the plan alone before coding, then start implementation. Keep it current
with each completed step. Later sessions reuse the same plan, branch, and worktree.

### 4. Implement, Push, and Validate

Implement the approved steps. Commit each completed, coherent feature or fix
separately, including relevant tests, docs, and plan updates. Keep commits focused
and independently revertible; avoid unrelated formatting.

After completing changes, push the branch, then run the planned checks, narrowest
first. Review failures, fix, commit, push, and rerun affected checks until the
final pushed revision passes. Record results in the plan; commit and push any
updates and recheck as needed. Report blockers, unavailable tools, and skipped
checks honestly; never claim unrun checks passed.

### 5. Open Draft PR and Pause

After validation, open a Draft PR against `main` unless directed otherwise.
Use a Conventional Commit title; describe the result, checks, and limitations.
Share its URL and request user review. Stop and retain the plan.

### 6. Apply Review and Promote

For requested revisions, update the plan and repeat implementation, commit, push,
and validation on the same Draft PR; request review again. After explicit user
approval, delete only this task's plan, commit, push, verify the final diff, and
mark the Draft PR ready for review. Do not merge or enable auto-merge: the user
handles merging.

## Implementation Boundaries

- Components: small reusable UI, styling, slots, state, and local interaction.
- Widgets: composed homepage/blog sections; layouts: page structure, regions,
  drawers, and responsive placement. Follow directory ownership in `docs/agents/`.
- Styles/themes: semantic tokens and customization; use scoped vanilla CSS.
- `src/content/`: authored content and colocated assets only; schemas/loaders
  belong in `src/content.config.ts`.
- Keep local queries, sorting, and display logic in the consuming `.astro` file.
  Extract to `src/utils/` only when multiple consumers actually share the logic.
- Prefer existing dependencies; justify additions and their compatibility,
  runtime/bundle cost, and maintenance. Avoid unnecessary client rendering.
- Update docs for changed contracts, commands, configuration, and conventions.
- Use subagents only after approval for clear, disjoint tasks. Avoid them for
  small or unclear tasks; the main agent owns integration and final review.

## Toolchain

- Use Astro, TypeScript, CSS, Bun, and Prettier. No `vp` or Rust tooling.
- Use `bun install` and repository `bun run <script>` commands. Astro manages
  Vite unless repository scripts explicitly expose it.
- Use TypeScript 6 until TypeScript 7 is stable in the main `typescript` package.
  Declare needed ambient types explicitly; Bun needs `@types/bun` and
  `"types": ["bun"]` in `tsconfig.json`.
- Format through repository Prettier scripts. Choose validation for the change
  from available scripts: `check`, `test`, `build`, `lint`, `format:check`.
  If unavailable, report that and use the closest meaningful inspection.

## Commits and Safety

Use the following format, with a required scope, capitalized summary, and a short
body explaining the change or its purpose:

```text
<type>(<scope>): <Summary>

<Description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`.
Never commit secrets, local environment files, caches, or build artifacts; never
print secrets. Do not discard user changes or perform destructive Git/filesystem
operations without explicit approval. Report facts and results accurately.
