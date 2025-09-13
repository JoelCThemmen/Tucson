# Repository Guidelines

## Project Structure & Module Organization
- Backend: `backend/` (Express + TypeScript). Key folders: `src/routes/*.routes.ts`, `src/services/*.service.ts`, `src/middleware/*.middleware.ts`, Prisma schema in `backend/prisma/`.
- Frontend: `web/` (React + Vite + TypeScript). Key folders: `src/components/`, `src/pages/`, `src/hooks/`, `src/services/`, `src/layouts/`.
- E2E Tests: root `tests/` (Playwright). Frontend-specific examples in `web/tests/`.
- Docs & assets: `docs/`, images at repo root and `images/`.

## Build, Test, and Development Commands
- Root E2E tests: `npm test` (runs Playwright with web and backend dev servers). UI mode: `npm run test:ui`.
- Backend: `cd backend`
  - Dev: `npm run dev` (nodemon + ts-node)
  - Build/Start: `npm run build && npm start`
  - Prisma: `npm run prisma:migrate | prisma:generate | prisma:studio`
  - Lint/Format: `npm run lint` | `npm run format`
- Frontend: `cd web`
  - Dev: `npm run dev` | Preview: `npm run preview`
  - Build: `npm run build` | Lint: `npm run lint`
- Docker (optional): `docker-compose up --build` brings up Postgres, backend, and frontend.

## Coding Style & Naming Conventions
- TypeScript across repo. Prefer 2-space indentation.
- Frontend: components/pages use PascalCase (e.g., `components/VerificationWizard.tsx`), hooks prefixed `use` (e.g., `hooks/useApi.ts`), services camelCase (`services/api.ts`).
- Backend: `*.routes.ts`, `*.service.ts`, `*.middleware.ts` naming (e.g., `src/routes/auth.routes.ts`).
- Linting: ESLint configured (web) and script-based (backend). Formatting via Prettier in backend (`npm run format`). Keep imports ordered and remove unused code.

## Testing Guidelines
- Framework: Playwright. Place E2E tests in `tests/` using `*.spec.ts` (e.g., `tests/verification.spec.ts`).
- Run: `npm test`. Update snapshots if needed: `npx playwright test --update-snapshots`.
- Base URL defaults to `http://localhost:5173`; Playwright auto-starts `web` and `backend` dev servers per `playwright.config.ts`.

## Commit & Pull Request Guidelines
- Commits: imperative, concise subject (<= 72 chars). Optional scope, e.g., `feat(web): improve verification flow`.
- PRs: include summary, motivation, screenshots for UI changes, and linked issues. Ensure `npm run lint` (web/backend) and `npm test` pass locally. Describe any schema or env changes.

## Security & Configuration Tips
- Do not commit secrets. Keep `.env` files in `backend/` and `web/` local only.
- Required vars include database URL and Clerk keys (see README). Rotate keys on exposure.
- Prefer `docker-compose` for local Postgres; match `DATABASE_URL` to container settings.

