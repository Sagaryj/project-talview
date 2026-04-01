# TaskFlow AI Handoff

Use this file as the source of truth when handing this project to another AI tool.

## Project Overview

TaskFlow is a full-stack task and workflow management app with:

- Kanban board
- Dashboard
- Calendar
- Analytics
- Settings
- Profile
- Internationalization
- Theme support
- Hasura + Postgres backend
- Express auth/action backend
- JWT auth with Hasura claims
- OTP-based signup flow using pending email verification records

## Tech Stack

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Apollo Client
- GraphQL
- react-intl
- Framer Motion
- D3 / chart components
- Luxon for timezone-aware time display

### Backend

- Hasura GraphQL Engine
- PostgreSQL
- Express + TypeScript
- JWT authentication
- AWS SES for OTP / welcome emails
- Optional AWS Lambda experiments were started, but the current working local flow uses the Express backend for Hasura Actions

## Current Architecture

```text
Frontend (React + Apollo)
  -> Hasura GraphQL
  -> PostgreSQL

Frontend (Auth / custom flows)
  -> Hasura Actions
  -> Express backend
  -> PostgreSQL
```

## Important Runtime Note

For local development, Hasura Actions should point to the local backend, not Lambda, because PostgreSQL is local.

Working local handlers:

- `startSignup` -> `http://172.17.0.1:4000/actions/start-signup`
- `verifySignup` -> `http://172.17.0.1:4000/actions/verify-signup`
- existing auth/actions also use the local Express server

## Frontend Structure

### Entry / routing

- `src/main.tsx`
- `src/app/router.tsx`

### Layout

- `src/layouts/AppLayout.tsx`
- `src/layouts/Sidebar.tsx`
- `src/layouts/Topbar.tsx`

### Pages

- `src/pages/Welcome.tsx`
- `src/pages/Login.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Projects.tsx`
- `src/pages/Calendar.tsx`
- `src/pages/Analytics.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Profile.tsx`

### Kanban / tasks

- `src/features/kanban/KanbanBoard.tsx`
- `src/features/kanban/KanbanColumn.tsx`
- `src/features/kanban/KanbanCard.tsx`
- `src/features/kanban/TaskModal.tsx`
- `src/features/kanban/TaskDetailsModal.tsx`
- `src/features/kanban/useKanban.ts`
- `src/features/kanban/useWorkflow.ts`
- `src/features/kanban/types.ts`
- `src/features/kanban/workflowConfig.ts`

### GraphQL / app libs

- `src/lib/apollo.ts`
- `src/lib/auth.ts`
- `src/lib/timezone.ts`
- `src/features/auth/graphql/*`
- `src/features/kanban/graphql/*`

### Hooks

- `src/hooks/useAuthSession.ts`
- `src/hooks/useTheme.ts`
- `src/hooks/useZonedTime.ts`

### i18n

- `src/i18n/provider.tsx`
- `src/i18n/en.ts`
- `src/i18n/de.ts`
- `src/i18n/es.ts`
- `src/i18n/fr.ts`
- `src/i18n/hi.ts`
- `src/i18n/ja.ts`

## Backend Structure

```text
backend/
  actions/
  migrations/
  metadata/
  seeds/
  src/
    config/
    lib/
    server.ts
```

### Important backend files

- `backend/src/server.ts`
- `backend/src/config/db.ts`
- `backend/src/lib/auth.ts`
- `backend/src/lib/email.ts`
- `backend/src/lib/httpError.ts`
- `backend/src/lib/workflow.ts`
- `backend/actions/startSignup.ts`
- `backend/actions/verifySignup.ts`

### Hasura metadata

- `backend/metadata/actions.graphql`
- `backend/metadata/actions.yaml`
- `backend/metadata/tables.yaml`
- `backend/metadata/databases/databases.yaml`
- `backend/metadata/databases/default/tables/*.yaml`

### Migrations

- `backend/migrations/default/create_tasks.table/*`
- `backend/migrations/default/1711000000001_add_user_profile_fields/*`
- `backend/migrations/default/1712000000000_create_email_verifications/*`

## Core Database Tables

### users

Stores authenticated users.

Current fields include:

- `id`
- `name`
- `email`
- `password_hash`
- `preferred_language`
- `theme`
- `username`
- `profile_role`
- `company`
- `timezone`
- timestamps

### workflow_statuses

Per-user workflow columns such as:

- `todo`
- `in-progress`
- `done`

Supports custom additional stages.

### tasks

Main task table.

Important fields:

- `id`
- `user_id`
- `title`
- `description`
- `workflow_status_id`
- `priority`
- `due_date`
- `position`

### task_tags

Stores task tags.

### activities

Stores activity feed / audit-like task messages.

### email_verifications

Used for OTP signup verification.

Fields:

- `id`
- `name`
- `email`
- `password_hash`
- `otp_code`
- `expires_at`
- `verified`
- `created_at`

## Auth Model

Authentication uses JWT.

The backend issues a JWT containing Hasura claims.

The payload includes:

- `x-hasura-default-role`
- `x-hasura-allowed-roles`
- `x-hasura-user-id`

Frontend does **not** use Hasura admin secret.

Direct CRUD permissions are based on Hasura role permissions and JWT claims.

## Existing Hasura Actions

Current actions include:

- `login`
- `signup`
- `me`
- `moveTaskWithActivityLog`
- `startSignup`
- `verifySignup`

### Notes

- `signup` remains for backward compatibility
- OTP signup flow should use `startSignup` followed by `verifySignup`
- local development should keep these action handlers pointed to the Express backend

## OTP Signup Flow

### startSignup

Input:

- `name`
- `email`
- `password`

Behavior:

1. validate input
2. reject if user already exists
3. generate a 6-digit OTP
4. hash password using bcrypt
5. insert pending row into `email_verifications`
6. set `expires_at = now() + 10 minutes`
7. send OTP email via SES
8. return:

```json
{
  "message": "Verification code sent to email"
}
```

### verifySignup

Input:

- `email`
- `otp`

Behavior:

1. find the latest pending verification row
2. reject if OTP mismatches
3. reject if expired
4. create the real user in `users`
5. delete the verification row
6. seed default workflow statuses
7. generate JWT identical to login flow
8. optionally send welcome email
9. return `AuthPayload`

### Important local email note

For local OTP testing to work, the local Express backend needs valid AWS credentials and SES config.

Required env:

- `AWS_REGION=us-east-1`
- `SES_FROM_EMAIL=<verified-sender>`

AWS credentials must be valid on the local machine.

## Current Known SES Limitation

If SES is still in sandbox mode, emails can only be sent to verified recipient addresses.

That means OTP currently works only for verified emails until SES production access is granted.

## Frontend Data Fetching Model

Frontend uses GraphQL queries/subscriptions through Apollo Client.

It does **not** query PostgreSQL directly.

Flow:

```text
React component -> Apollo Client -> Hasura GraphQL -> PostgreSQL SELECT/INSERT/UPDATE/DELETE
```

## Kanban / Task Behavior

The app supports:

- task create / edit / delete
- drag-and-drop between workflow statuses
- reorder within column
- due date editing
- priority editing
- tags
- dynamic workflow stages
- activity logging
- filters and search

Workflow statuses are user-specific and customizable.

## Profile / Settings Sync

Profile and Settings are DB-backed and synchronized.

They share fields like:

- name
- email
- username
- profile role
- company
- timezone
- preferred language
- theme

Time zone selection is stored in DB and used to render timezone-aware clocks using Luxon.

## Local Development Runbook

### 1. Start Docker services

```bash
cd ~/Desktop/Projects/taskflow
docker compose up -d --build
```

This starts:

- Postgres
- Hasura

### 2. Start backend

```bash
cd ~/Desktop/Projects/taskflow/backend
npm run dev
```

Backend runs on:

- `http://localhost:4000`

### 3. Start frontend

```bash
cd ~/Desktop/Projects/taskflow
npm run dev
```

Frontend runs on:

- `http://localhost:5173`

### 4. Apply migrations / metadata when needed

```bash
cd ~/Desktop/Projects/taskflow/backend
hasura migrate apply
hasura metadata apply
hasura metadata reload
```

## Environment Notes

Key local env values include:

- Postgres connection settings
- Hasura admin secret
- `AUTH_TOKEN_SECRET`
- `AWS_REGION`
- `SES_FROM_EMAIL`

For local OTP/email to work, AWS SDK credentials on the machine must be valid.

## Build Notes

Backend TypeScript compiles into `backend/dist/`.

The backend build was cleaned up so:

- `npm run build` removes stale `dist` first
- `npm start` uses the correct compiled entry

Important backend scripts:

- `npm run dev`
- `npm run build`
- `npm start`

## Known Limitations / Notes

- Some Hasura metadata files are boilerplate placeholders and may look repetitive; they are not necessarily harmful
- AWS Lambda URLs were explored, but local Postgres means Lambda is not the right active path for OTP in local development
- OTP sending for non-verified recipient emails will fail while SES sandbox restrictions remain
- Existing `signup` action still exists for backward compatibility, but OTP flow should use `startSignup` + `verifySignup`
- The previous root `README.md` is outdated and describes an earlier backend-generation phase, not the current full project state

## Recommended Next Improvements

- Update the main `README.md` so it matches the real current architecture
- Complete the frontend signup page UX so it always uses OTP flow instead of old direct signup
- Move PostgreSQL to RDS or another reachable hosted DB if Lambda-based OTP needs to be used in production
- Request SES production access to send OTP to non-verified recipient emails
- Optionally add cleanup for expired OTP rows

## Handoff Summary

If another AI tool continues work on this project, it should assume:

1. This is already a full-stack app, not frontend-only
2. Hasura + Postgres are central to data access
3. Express handles auth and custom Hasura Actions
4. JWT auth with Hasura claims is already in place
5. OTP signup has backend/database support and SES email sending support
6. Local OTP flow should use the Express backend action endpoints, not Lambda URLs
7. Some documentation in the repo is outdated and should not be treated as source of truth

