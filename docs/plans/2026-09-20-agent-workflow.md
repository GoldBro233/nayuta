# Streamline Agent Workflow

Status: Implementation complete; push and validation pending.
Branch: `docs/streamline-agent-workflow`; base: `main` at `3212e01`.
Worktree: `.worktree/streamline-agent-workflow/`.

## Goal

Replace repetitive agent instructions with concise English while preserving
project constraints and defining the approved plan-to-PR workflow.

## Scope and Acceptance

- `AGENTS.md`: remove response prefixes and obsolete reference-directory rules;
  define discovery, approval, worktree setup, durable plans, incremental commits,
  push-before-validation, Draft PR review, and promotion without merging.
- `docs/agents/design.md`: remove duplicate prefix and obsolete directory rules.
- `.gitignore`, `.prettierignore`: exclude `.worktree/`.
- Retain Astro boundaries, accessibility, tokens, toolchain, and safety rules.
- Plan approval authorizes execution through Draft PR creation. User review
  approval authorizes deleting this plan, committing, pushing, and PR promotion.

## Steps

- [x] Read all agent context and verify Git/GitHub CLI workflow support.
- [x] Obtain approval; skip all Bun checks per user instruction.
- [x] Commit this plan before implementation.
- [x] Exclude nested worktrees and commit that change.
- [x] Rewrite instructions and commit the documentation change.
- [ ] Push, inspect the diff and rule consistency, and verify ignore behavior.
- [ ] Record results, commit, push, recheck, and open a Draft PR against `main`.
- [ ] Await user review; revise as requested or remove this plan and promote.

## Validation and Decisions

Use `git diff --check`, targeted text searches, and diff review. Verify that
`.worktree/` is ignored by Git and listed in Prettier's ignore file. Run no Bun
checks or application tests: this change affects documentation and ignore rules.
No dependencies, runtime changes, or subagents are needed. Preserve unrelated
worktrees and user changes. Keep this plan until explicit Draft PR approval.

## Handoff

Next: push, validate, and record results before opening the Draft PR. Merge
belongs to the user.
