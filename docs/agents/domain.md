# Domain Docs

This repository uses a multi-context domain model.

## Before exploring

- Read the root `CONTEXT-MAP.md` when it exists.
- Follow it to each `CONTEXT.md` relevant to the current work.
- Read applicable system-wide ADRs under `docs/adr/`.
- Read context-specific ADRs alongside their context.
- If these files do not exist yet, proceed silently; domain-modeling creates them lazily.

## Intended layout

```
/
├── CONTEXT-MAP.md
├── docs/adr/
├── api/
│   ├── CONTEXT.md
│   └── docs/adr/
├── frontend/
│   ├── CONTEXT.md
│   └── docs/adr/
└── mobile/
    ├── CONTEXT.md
    └── docs/adr/
```

Use terminology defined in the relevant `CONTEXT.md`. If work contradicts an existing ADR, surface the conflict explicitly instead of silently overriding it.
