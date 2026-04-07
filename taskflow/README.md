<!-- # Taskflow

Taskflow is a full-stack project workspace app built with a React + TypeScript frontend and an Express + TypeScript backend, with Hasura and PostgreSQL as the data layer.

The app includes:
- welcome, login, and signup screens
- OTP-based signup verification
- dashboard overview
- projects kanban board
- calendar view
- analytics view
- settings and profile management
- testing with Jest and Cypress
- component documentation with Storybook

## Architecture

High-level flow:

```text
Frontend (React + Apollo)
  -> Hasura GraphQL / GraphQL subscriptions
  -> PostgreSQL

Frontend auth + Hasura Actions
  -> Express backend
  -> PostgreSQL / AWS SES
```

Main pieces:
- `src/`: frontend application
- `backend/src/`: Express backend
- `backend/metadata/`: Hasura metadata
- `backend/migrations/`: PostgreSQL schema migrations
- `docker-compose.yml`: local Postgres + Hasura
- `storybook/`: Storybook stories
- `cypress/`: end-to-end tests

## Frontend

Frontend entry:
- [src/main.tsx](/home/sagar-y-j/Desktop/Projects/taskflow/src/main.tsx)

It mounts:
- `ApolloProvider`
- `I18nProvider`
- `ToastProvider`
- `RouterProvider`

Routing:
- [src/app/router.tsx](/home/sagar-y-j/Desktop/Projects/taskflow/src/app/router.tsx)

Routes:
- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/projects`
- `/calendar`
- `/analytics`
- `/settings`
- `/profile`

Router basename:
- `/project-talview`

### Frontend concepts used

React:
- component-based UI
- hooks for state and effects
- protected layout via `AppLayout`

React Router:
- route-based navigation
- protected routes through session checks

Apollo Client:
- GraphQL queries and mutations
- subscriptions for live board updates

React Intl:
- multi-language UI via `src/i18n`

Tailwind CSS:
- utility-first styling across pages and components

Framer Motion:
- animated transitions in layout and cards

Luxon:
- timezone-aware date/time rendering

### Frontend feature flow

Auth:
- [src/pages/Login.tsx](/home/sagar-y-j/Desktop/Projects/taskflow/src/pages/Login.tsx)
- [src/lib/auth.ts](/home/sagar-y-j/Desktop/Projects/taskflow/src/lib/auth.ts)

Flow:
1. login/signup page calls auth helpers
2. normal login calls Hasura action `login`
3. signup uses OTP flow:
   - `startSignup`
   - user enters OTP
   - `verifySignup`
4. auth session is stored in localStorage under `taskflow-auth`
5. protected pages read session through `useAuthSession`

Tasks and workflow:
- [src/features/kanban/useKanban.ts](/home/sagar-y-j/Desktop/Projects/taskflow/src/features/kanban/useKanban.ts)
- [src/features/kanban/useWorkflow.ts](/home/sagar-y-j/Desktop/Projects/taskflow/src/features/kanban/useWorkflow.ts)
- [src/features/kanban/hasura](/home/sagar-y-j/Desktop/Projects/taskflow/src/features/kanban/hasura)

Flow:
1. page calls kanban/workflow hooks
2. hooks fetch tasks, activities, and workflow statuses from Hasura
3. hooks subscribe to live updates
4. create/update/delete/reorder actions are sent through GraphQL mutations
5. dashboard, projects, calendar, and analytics derive UI from the same task/status data

## Backend

Backend entry:
- [backend/src/server.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/server.ts)
- [backend/src/app.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/app.ts)

Main backend routes:
- `/api/health`
- `/users`
- `/api/auth/*`
- `/actions/*`

### Backend structure

Important folders:
- [backend/src/modules/auth](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/modules/auth)
- [backend/src/modules/taskAction](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/modules/taskAction)
- [backend/src/modules/user](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/modules/user)
- [backend/src/middlewares](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/middlewares)
- [backend/src/lib](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/lib)
- [backend/actions](/home/sagar-y-j/Desktop/Projects/taskflow/backend/actions)

Backend pattern:
- routes
- controllers
- services
- schemas
- middleware

### Backend concepts used

Node.js + TypeScript:
- typed backend modules
- compiled build output in `backend/dist`

Express:
- HTTP server
- route handlers
- middleware composition

PostgreSQL with `pg`:
- direct SQL queries
- no ORM

Joi:
- request validation
- action input validation
- config validation

JWT + bcrypt:
- password hashing
- login token creation
- auth token verification

AWS SES:
- OTP verification email
- welcome email

Hasura Actions:
- custom business logic bridge between Hasura and Express

### Backend auth flow

Normal login/signup:
- [backend/src/modules/auth/auth.routes.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/modules/auth/auth.routes.ts)
- [backend/src/modules/auth/auth.service.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/modules/auth/auth.service.ts)

Flow:
1. request hits route
2. Joi validation runs
3. controller calls service
4. service reads/writes Postgres
5. service returns token + user

### OTP signup flow

Files:
- [backend/actions/startSignup.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/actions/startSignup.ts)
- [backend/actions/verifySignup.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/actions/verifySignup.ts)

Flow:
1. frontend calls Hasura action `startSignup`
2. Hasura calls backend `/actions/start-signup`
3. backend:
   - validates input
   - checks duplicate email
   - hashes password
   - stores pending record in `email_verifications`
   - sends OTP email via SES
4. user enters OTP
5. frontend calls Hasura action `verifySignup`
6. Hasura calls backend `/actions/verify-signup`
7. backend:
   - validates OTP
   - checks expiry
   - creates user
   - seeds default workflow statuses
   - deletes verification row
   - returns JWT + user
   - sends welcome email

## Hasura and Database

Hasura metadata:
- [backend/metadata](/home/sagar-y-j/Desktop/Projects/taskflow/backend/metadata)

Migrations:
- [backend/migrations](/home/sagar-y-j/Desktop/Projects/taskflow/backend/migrations)

Tracked core tables:
- `users`
- `workflow_statuses`
- `tasks`
- `task_tags`
- `activities`
- `email_verifications`

Hasura is used for:
- GraphQL queries
- GraphQL mutations
- GraphQL subscriptions
- custom actions for login/signup/me/startSignup/verifySignup/moveTaskWithActivityLog

## Libraries and Where They Are Used

### Frontend dependencies

`react`, `react-dom`
- app rendering and component model

`react-router-dom`
- route config and protected layout

`@apollo/client`, `graphql`, `graphql-ws`
- GraphQL queries, mutations, subscriptions

`react-intl`
- localization and translated UI strings

`tailwindcss`
- utility-based styling

`framer-motion`
- transitions and animated UI blocks

`luxon`
- timezone-aware date and time formatting

`lucide-react`
- icons

`@dnd-kit/core`
- drag and drop behavior in calendar

`d3`, `@amcharts/amcharts5`
- analytics/chart rendering support

### Backend dependencies

`express`
- backend server and routing

`cors`
- cross-origin support for local dev

`pg`
- PostgreSQL access

`bcryptjs`
- password hashing and verification

`joi`
- validation schemas and middleware

`dotenv`
- environment variable loading

`@aws-sdk/client-ses`
- verification and welcome emails

## Validation

Backend validation pattern:
- [backend/README_VALIDATION.md](/home/sagar-y-j/Desktop/Projects/taskflow/backend/README_VALIDATION.md)

Current validation points:
- login/signup payloads
- OTP start/verify payloads
- user payloads
- task action payloads
- startup env config

## Testing

### Frontend tests

Frameworks:
- Jest
- React Testing Library

Examples:
- page tests
- hook tests
- layout tests
- kanban logic tests

Test setup:
- [jest.config.cjs](/home/sagar-y-j/Desktop/Projects/taskflow/jest.config.cjs)
- [src/test](/home/sagar-y-j/Desktop/Projects/taskflow/src/test)

### Backend tests

Frameworks:
- Jest
- Supertest

Coverage includes:
- auth helpers
- middleware
- services
- route/controller behavior
- OTP action files

### Cypress

Cypress is used for mock-auth frontend E2E coverage.

Important folders:
- [cypress/e2e](/home/sagar-y-j/Desktop/Projects/taskflow/cypress/e2e)
- [cypress/support](/home/sagar-y-j/Desktop/Projects/taskflow/cypress/support)
- [cypress/fixtures](/home/sagar-y-j/Desktop/Projects/taskflow/cypress/fixtures)

### Storybook

Storybook is used for component isolation and UI documentation.

Important folders:
- [.storybook](/home/sagar-y-j/Desktop/Projects/taskflow/.storybook)
- [storybook](/home/sagar-y-j/Desktop/Projects/taskflow/storybook)

## Local Development Flow

### 1. Start Postgres and Hasura

```bash
cd ~/Desktop/Projects/taskflow
docker compose up -d --build
```

### 2. Start backend

```bash
cd ~/Desktop/Projects/taskflow/backend
npm run dev
```

### 3. Start frontend

```bash
cd ~/Desktop/Projects/taskflow
npm run dev
```

### 4. Apply Hasura metadata/migrations when needed

```bash
cd ~/Desktop/Projects/taskflow/backend
hasura migrate apply
hasura metadata apply
hasura metadata reload
```

### 5. Test commands

Frontend:

```bash
cd ~/Desktop/Projects/taskflow
npm run test
```

Backend:

```bash
cd ~/Desktop/Projects/taskflow/backend
npm run test
```

Cypress:

```bash
cd ~/Desktop/Projects/taskflow
npx cypress open
```

Storybook:

```bash
cd ~/Desktop/Projects/taskflow
npm run storybook
```

## Useful URLs

- Frontend: `http://localhost:5173/project-talview`
- Hasura console: `http://localhost:8082`
- Backend: `http://localhost:4000`
- Storybook: `http://localhost:6006`

## Supporting Docs

- [README_RUN.md](/home/sagar-y-j/Desktop/Projects/taskflow/README_RUN.md)
- [CHATGPT_HANDOFF.md](/home/sagar-y-j/Desktop/Projects/taskflow/CHATGPT_HANDOFF.md)
- [backend/README_VALIDATION.md](/home/sagar-y-j/Desktop/Projects/taskflow/backend/README_VALIDATION.md)

## Current Project Status

What is already implemented:
- full frontend app shell and feature pages
- GraphQL + Hasura-based task/workflow/activity flow
- Express backend with modular structure
- JWT auth
- OTP signup with email verification
- welcome email after verification
- Joi validation
- Jest coverage for frontend and backend
- Cypress mock-auth E2E structure
- Storybook component stories

What to keep in mind:
- Hasura action handlers must point to the reachable backend host in local Docker/dev
- OTP email sending depends on valid AWS credentials and SES configuration
- Cypress task coverage should always be aligned with the actual app route/API contract -->
