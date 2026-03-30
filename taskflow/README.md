# Taskflow Frontend Summary for Backend Generation

Use this document as the source of truth to build the backend for the current `taskflow` frontend. The frontend is a React + TypeScript + Vite app and currently stores almost everything in `localStorage`. There is no real API integration yet, so the backend should replace that local persistence with REST endpoints and PostgreSQL storage.

## What the frontend does

This app is a task/project management dashboard with:

- Dashboard overview
- Projects page with Kanban board
- Calendar view
- Analytics view
- Settings page
- Profile page
- Internationalization support
- Theme preference support

Current frontend routes:

- `/`
- `/projects`
- `/calendar`
- `/analytics`
- `/settings`
- `/profile`

The router is mounted with basename `/project-talview`.

## Current frontend data model

### Task

Frontend task shape:

```ts
type Priority = "low" | "medium" | "high"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: Priority
  dueDate?: string
  tags?: string[]
}
```

### Workflow status

Frontend workflow status shape:

```ts
type WorkflowCategory = "pending" | "active" | "completed"

interface WorkflowStatus {
  id: string
  label: string
  color: string
  category: WorkflowCategory
  system: boolean
}
```

Default workflow statuses:

```json
[
  { "id": "todo", "label": "Todo", "color": "#64748b", "category": "pending", "system": true },
  { "id": "in-progress", "label": "In Progress", "color": "#6366f1", "category": "active", "system": true },
  { "id": "done", "label": "Done", "color": "#22c55e", "category": "completed", "system": true }
]
```

### Activity log

```ts
interface Activity {
  id: string
  message: string
  timestamp: number
}
```

## Frontend behavior the backend must support

### Task operations

The frontend currently supports:

- Create task
- Update task title
- Update task description
- Update task status
- Update task priority
- Update task due date
- Update task tags
- Delete task
- Reorder tasks within the same column/status
- Filter tasks by priority, due today, overdue
- Search tasks by title or tags

### Workflow operations

The frontend currently supports:

- List workflow statuses
- Add custom workflow status
- Remove workflow status
- Move workflow status left/right
- Reset workflow to defaults

Important rule:

- If a workflow status is removed, tasks using that status must be migrated to a fallback non-completed status.

### Dashboard and analytics needs

The frontend derives these values from task data:

- Total tasks
- Completed tasks
- Due today
- Overdue tasks
- Project completion percentage
- Focus today list
- Upcoming deadlines
- Workload by status
- Recent tasks
- Activity feed

Backend can either:

- Return raw tasks/statuses and let frontend compute these
- Or provide summary/statistics endpoints for efficiency

## Recommended database design

Use PostgreSQL.

Suggested tables:

### `users`

- `id` uuid primary key
- `name` text
- `email` text unique
- `password_hash` text
- `preferred_language` text default `'en'`
- `theme` text default `'light'`
- `created_at`
- `updated_at`

### `workflow_statuses`

- `id` uuid primary key
- `user_id` uuid references `users(id)` on delete cascade
- `slug` text
- `label` text
- `color` text
- `category` text check in `pending|active|completed`
- `system` boolean default false
- `position` integer
- `created_at`
- `updated_at`

Constraint recommendation:

- unique `(user_id, slug)`

### `tasks`

- `id` uuid primary key
- `user_id` uuid references `users(id)` on delete cascade
- `title` text not null
- `description` text nullable
- `workflow_status_id` uuid references `workflow_statuses(id)`
- `priority` text check in `low|medium|high`
- `due_date` date nullable
- `position` integer
- `created_at`
- `updated_at`

### `task_tags`

- `id` uuid primary key
- `task_id` uuid references `tasks(id)` on delete cascade
- `name` text not null

Constraint recommendation:

- unique `(task_id, name)`

### `activities`

- `id` uuid primary key
- `user_id` uuid references `users(id)` on delete cascade
- `task_id` uuid nullable references `tasks(id)` on delete set null
- `message` text not null
- `created_at` timestamptz not null default now()

## Recommended API

Base path suggestion: `/api`

### Auth

Even though auth is not wired in the current frontend, build it now because multi-user data requires ownership.

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Use JWT or secure session cookies.

### Tasks

- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/reorder`

Suggested `GET /tasks` filters:

- `status`
- `priority`
- `search`
- `due=today`
- `due=overdue`

Suggested create/update payload:

```json
{
  "title": "Design dashboard UI",
  "description": "Create first pass of layout",
  "statusId": "uuid-or-slug",
  "priority": "medium",
  "dueDate": "2026-03-20",
  "tags": ["frontend", "design"]
}
```

### Workflow statuses

- `GET /workflow-statuses`
- `POST /workflow-statuses`
- `PATCH /workflow-statuses/:id`
- `DELETE /workflow-statuses/:id`
- `PATCH /workflow-statuses/reorder`
- `POST /workflow-statuses/reset`

### Activities

- `GET /activities`

### Optional dashboard endpoints

- `GET /dashboard/summary`
- `GET /analytics/summary`

## Backend rules and validation

- `title` is required for tasks
- `priority` must be `low`, `medium`, or `high`
- `category` must be `pending`, `active`, or `completed`
- Due date should be stored as a SQL `date`
- Tags should be trimmed and deduplicated
- Workflow status order must be stable
- Task order must be stable within each workflow column
- System workflow statuses should not be removable unless reset logic handles them explicitly
- Deleting a workflow status must migrate affected tasks to a fallback status
- Every task, workflow status, and activity should belong to a user

## Implementation guidance

Please build:

1. Node.js backend in TypeScript
2. Express or a similarly simple HTTP framework
3. PostgreSQL integration using the existing `backend/src/config/db.ts`
4. Clear route/controller/service structure
5. SQL migration files or schema setup
6. Request validation
7. Auth middleware
8. Seed script for default workflow statuses per new user
9. README with local setup instructions

## Important notes from the current repo

- Backend currently only has PostgreSQL pool config in `backend/src/config/db.ts`
- Frontend currently uses `localStorage` for tasks, workflow statuses, activities, language, theme, profile, and settings
- I did not find active frontend auth API usage in the current codebase
- I did not find a real login page in the current `taskflow/src` tree, so auth should be added in a backend-friendly way without assuming completed frontend wiring

## Deliverable request for Claude

Build the backend for this app using TypeScript, Express, PostgreSQL, and a clean folder structure. Implement authentication, task CRUD, workflow status management, task reordering, activities, validation, database schema/migrations, and seed logic for default statuses. Keep the API easy for the current frontend to integrate with, and document all endpoints and setup steps clearly.

## Docker setup

This repo now includes Docker setup for PostgreSQL and Hasura.

Files added:

- `docker-compose.yml`
- `.env.example`
- `docker/postgres/init/01-init.sql`

### Quick start

1. Copy `.env.example` to `.env`
2. Run `docker compose up -d`
3. Open Hasura console at `http://localhost:8080`
4. Use the admin secret from `.env`

### Default local services

- PostgreSQL: `localhost:5432`
- Hasura: `localhost:8080`

### Backend database env

The backend DB config now reads:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

If your backend runs on your host machine while Postgres runs in Docker, use:

- `DB_HOST=localhost`

If your backend later runs in Docker on the same network, use:

- `DB_HOST=postgres`

## Hasura table filtering

Because workflow statuses, tasks, and activities are user-owned, the Hasura table view will show repeated `todo`, `in-progress`, and `done` rows across different users. That is expected.

To inspect only one user in Hasura:

1. Open Hasura console at `http://localhost:8082`
2. Go to `Data`
3. Open the `users` table and note the `id` of the user you want to inspect
4. Open one of the related tables and add a filter on `user_id`

Recommended filters:

- `workflow_statuses`: `user_id _eq <your_user_id>`
- `tasks`: `user_id _eq <your_user_id>`
- `activities`: `user_id _eq <your_user_id>`

Useful example:

- If the logged-in user has `id = 4`, then in Hasura use `user_id _eq 4`

What you should expect after filtering:

- exactly one default `todo`
- exactly one default `in-progress`
- exactly one default `done`
- only that user’s tasks and activities

Note:

- `task_tags` does not have `user_id`, so inspect it through the task relationship or by filtering `task_id` values belonging to that user’s tasks.
