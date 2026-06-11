---
name: controlling-mobile-devices
description: Use when the user asks to interact with mobile devices, Android or iOS — tap, swipe, type, launch apps, take screenshots, run tests, automate workflows, observe UI, collect metrics, or any task involving a phone, tablet, simulator, or emulator. Triggers on "device", "phone", "mobile", "app", "screenshot", "tap", "swipe", "test on device", "automate", "UI tree", "accessibility", "smoke test", "onboarding", or any mobile automation task.
---

# Controlling Mobile Devices

You have access to the **MobAI MCP server** for controlling Android and iOS devices. All device interaction goes through MobAI's MCP tools.

## Before starting

1. Read the MCP resource `mobai://reference/device-automation` to learn how to control devices
2. Use `list_devices` to see connected devices
3. Use `execute_dsl` for all device actions — it supports tap, type, swipe, observe, launch apps, assertions, web automation, metrics, and more in a single batched call

## For test script generation

- Read `mobai://reference/testing` for workflow, rules, and .mob script syntax
- Use `test_get_active` to find the current test project and cases
- Use `test_*` tools to read and modify .mob test scripts
