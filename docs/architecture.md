# Architecture

## Goals

- Domain-first frontend organization
- Clear boundary between route layer, feature layer, and shared layer
- Reusable UI patterns for dialogs, feedback states, and layout shells
- Predictable import paths and naming

## Source Layout

```text
src
|-- app/                    # Next.js route layer
|-- features/               # Domain UI and feature logic
|-- components/
|   |-- ui/                 # UI primitives
|   |-- shared/             # reusable layout/feedback/dialog
|   |-- auth/
|   `-- theme/
|-- services/api/           # typed API client functions
|-- shared/                 # cross-layer schema/type/constants
|-- hooks/                  # cross-feature hooks
|-- constants/              # app-level constants
`-- lib/                    # generic helpers
```

## Path Aliases

Defined in `tsconfig.base.json`:

- `@/*` -> `src/*`
- `@api/*` -> `src/api/*`
- `@shared/*` -> `src/shared/*`
- `@features/*` -> `src/features/*`
- `@ui/*` -> `src/components/ui/*`

## Frontend Patterns

- Route files in `app` should stay thin and compose feature screens
- Domain UI lives in `features/<domain>`
- Shared visual patterns:
  - `components/shared/dialogs/confirm-action-dialog.tsx`
  - `components/shared/feedback/empty-state.tsx`
  - `components/shared/feedback/live-status-badge.tsx`
  - `components/shared/layout/page-container.tsx`
- Feature-specific skeleton/row components are co-located in each domain

## Naming Rules

- File/folder: `kebab-case`
- Component/type: `PascalCase`
- Hook: `use-*`
- API client names should follow domain intent (`queuesApi`, `servicesApi`, etc.)

## Refactor Notes

- Legacy `src/modules` has been migrated to `src/features`
- Dashboard navigation config extracted into `features/dashboard/constants/navigation.ts`
- Shared footer now uses dynamic year range (`2025-current`)
