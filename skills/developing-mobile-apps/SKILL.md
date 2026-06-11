---
name: developing-mobile-apps
description: Use when building a new mobile app or adding features to an existing one. Enforces incremental development — break work into small steps, implement one at a time, validate each on a real device via MobAI, then proceed. Triggers on "build an app", "create an app", "new app", "add feature", "implement feature", "develop app", "make an app", "build this".
---

# Developing Mobile Apps

Build incrementally: plan → implement one step → validate on device with MobAI → next step.

## Step 1: Understand and Plan

1. **Ask**: app idea, platform (iOS/Android/both), framework (SwiftUI, Flutter, React Native, etc.)
2. **Check existing code** if any
3. **Break into small steps** — each step produces one visible, testable change on the device

Present the plan as a numbered checklist. Each step = one visible feature. "Add login screen with fields" = good. "Build entire auth flow" = too big.

Get user confirmation before starting.

## Step 2: For Each Step — Implement → Validate

### 2a. Implement

Write code for this step only. Make sure it compiles/builds.

### 2b. Validate on Device with MobAI

If the framework supports hot reload (Flutter, React Native), prefer it over a full build → install cycle. Hot reload preserves app state and is significantly faster for iterating.

After the app is running on the device, use MobAI to verify the implementation works:

1. Read `mobai://reference/device-automation` to learn how to control devices

### 2c. Update Progress

Mark step done, summarize what was validated, and wait for user confirmation before next step.

## Rules

- One step at a time — never implement multiple steps before validating
- Always validate on device with MobAI — compiling is not enough
- Fix before moving on — never skip broken steps
- Respect the plan — update the checklist if scope changes

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Generating the whole app at once | 5-10 small steps, one at a time |
| Skipping device validation | Use MobAI to screenshot + interact after each step |
| Moving on when broken | Fix and re-validate first |
| Not pausing between steps | Always wait for user confirmation |