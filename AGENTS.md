# AGENTS.md

## Project
Smart Campus room availability checker.
One room, fictional booking data, fixed current time.
No backend, login, database, or real booking creation.

## Constraints
Preserve AC1–AC6 and existing UI behavior.
Do not mutate booking fixtures in src/data.ts.
Keep responsive desktop and mobile feedback.

## Engineering rules
Prefer pure functions and minimal changes.
Use at most two justified design patterns.
Do not add new dependencies or features.
Do not introduce Singleton, Factory, or unnecessary class hierarchies.
Avoid duplicating booking-rule constants between UI and utils.

## Agent boundaries
- Do not introduce secrets.
- Do not deploy externally.
- Do not modify CI/CD configuration.
- Require human approval before merge.

## Verification
Add focused regression tests for availability rules.
Run tests and report the exact command, output, and pass/fail counts.
Report changed files, rationale, and remaining limitations.