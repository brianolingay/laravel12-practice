# Architecture Conventions

## Goals
- Keep controllers thin and focused on HTTP orchestration.
- Use Form Requests for validation and authorization at request boundaries.
- Use Actions for business operations and orchestration.
- Use Events and Listeners for side effects.
- Use Jobs for slow/IO work or retry semantics.
- Use Resources/DTOs to shape response payloads where contracts allow.

## Structure
- Controllers: `app/Http/Controllers/*`
- Form Requests: `app/Http/Requests/*`
- Actions: `app/Actions/<Feature>/*`
- Events: `app/Events/*`
- Listeners: `app/Listeners/*`
- Jobs: `app/Jobs/*`
- Resources: `app/Http/Resources/*`

## Naming
- Actions: `VerbNoun` (e.g., `IngestLedgerEvent`, `GenerateStatement`).
- Events: past tense (e.g., `LedgerEventIngested`).
- Listeners: `Handle<Event>` or explicit side effect (e.g., `CreateLedgerEventAuditLog`).
- Requests: `StoreLedgerEventRequest`, `StorePricingRuleRequest`.

## When to Use What
- Actions: whenever business logic spans multiple models or steps.
- Events: emit when a meaningful domain change happens; listeners handle side effects.
- Jobs: use for slow tasks, IO, or retries (e.g., notifications, exports).
- Resources/DTOs: use to centralize API/Inertia response shaping when it will not change public contracts.
