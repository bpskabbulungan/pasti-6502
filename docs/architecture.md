# Architecture & Module Layout

This project is moving to a domain-first, layered structure so backend, frontend, and shared contracts stay organized and scalable.

## Targets
- Clear separation: transport (routes/controllers) → application services → infrastructure (Prisma/Redis/mail).
- Domains mapped one-to-one across API and UI: `auth`, `users`, `services`, `queues`, `visitor-form`, `guest-book`, `notifications`, `analytics`, `qr`, `reminders`, `monitoring`.
- Shared contracts (types/schemas) live in one place and are consumed by both API and UI.
- Avoid “god folders” (`lib`, `utils`, `components`) by pushing code into domain modules or shared primitives.

## Recommended Monorepo Layout (incremental)
```
/api                      # (future) Nest service or extracted backend layer
  /src
    /config               # env validation, configuration providers
    /core                 # logger, exception filters, pipes, interceptors
    /common               # decorators, guards (auth/roles), pagination helpers
    /infrastructure
      /database           # PrismaService and migrations hook
      /cache              # Redis client, rate-limit
      /mail               # mailer integration
    /modules              # domain modules
      /auth
      /users
      /services
      /queues
      /visitor-form
      /guest-book
      /notifications
      /analytics
      /qr
      /reminders
      /monitoring
    /shared               # dto/types/constants/mappers
  /prisma

/web                      # Next.js app (UI only)
  /src
    /app                  # routes
      /(public)
      /(protected)
    /modules/<domain>     # feature UI + hooks + tests per domain
    /components
      /ui                 # design system primitives
      /layout             # nav/shell/skeleton wrappers
      /feedback           # toast/dialog utilities
    /services/api         # typed API clients per domain
    /hooks                # cross-cutting hooks
    /lib                  # UI-only helpers
    /styles
    /types

/packages                 # shared assets
  /types                  # DTOs/zod schemas used by both API & web
  /eslint-config
  /tsconfig
  /ui-tokens (optional)
```

## Naming & Conventions
- Directories: kebab-case. Types/classes: PascalCase. Files indicate role (e.g., `queues.controller.ts`, `queues.service.ts`, `queues.dtos.ts`, `use-queues.ts`).
- Domain-first: put logic in `/modules/<domain>` instead of `/lib` or `/utils`. Shared-only code belongs in `/shared` (backend) or `/components/ui` (frontend primitives).
- Keep infra concerns (Prisma/Redis/env) out of domain services; inject via repositories/providers.

## Path Aliases (now in `tsconfig.base.json`)
- `@/*` → `src/*` (legacy)
- `@api/*` → `src/api/*`
- `@shared/*` → `src/shared/*`
- `@modules/*` → `src/modules/*`
- `@ui/*` → `src/components/ui/*`

## Migration Steps (incremental)
1) Create domain folders in `src/api/modules` and move business logic out of route handlers into services/DTOs. Keep route files as thin controllers that call modules.
2) Move infra helpers from `src/lib` into `src/api/infrastructure` (database/cache/security). Re-export from old paths during transition to avoid breaking imports.
3) Create `src/shared/{types,constants,schemas}` and consolidate cross-domain types (Queue, Visitor, Notification, etc.) with zod/Class-Validator schemas.
4) Restructure UI into `src/modules/<domain>`; co-locate feature components, hooks, and skeletons with their pages. Keep primitives in `src/components/ui` and layout shells in `src/components/layout`.
5) Add `/src/services/api` clients per domain that wrap `fetch` with consistent error handling; update hooks/components to consume these clients.
6) Update imports to use the new aliases; run `bun run lint && bun run typecheck` after each domain move.
7) Update Docker/Compose once API and web are split into separate services, and document env files (`api/.env.example`, `web/.env.example`).

## Quick Rules of Thumb
- If code is domain-specific, it belongs in a domain module, not in `/lib`.
- If multiple domains need it, place it in `/shared` (backend) or `/packages/types` (when extracted).
- UI primitives stay in `/components/ui`; layouts/nav go to `/components/layout`.
- Always prefer typed DTOs/schemas at boundaries (API input/output) and reuse them in UI clients.
