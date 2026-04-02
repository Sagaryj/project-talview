<!-- # Backend Validation Pattern

This backend uses `Joi` at the request boundary.

## Rule of thumb

Validate early, then keep controllers and services focused on business logic.

## Where validation lives

- Route-level middleware in [validate.middleware.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/middlewares/validate.middleware.ts)
- Module-specific schemas in:
  - [auth.schemas.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/modules/auth/auth.schemas.ts)
  - [user.schemas.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/modules/user/user.schemas.ts)
  - [taskAction.schemas.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/modules/taskAction/taskAction.schemas.ts)
- Environment validation in [index.ts](/home/sagar-y-j/Desktop/Projects/taskflow/backend/src/config/index.ts)

## Middleware choices

Use `validateBody(schema)` for normal Express JSON routes.

Example:

```ts
userRouter.post('/', validateBody(createUserSchema), addUser)
```

Use `validateActionInput(schema)` for Hasura Actions.

This middleware validates `request.body.input` when present, and falls back to `request.body` for normal routes.

Example:

```ts
authActionRouter.post('/verify-signup', validateActionInput(verifySignupSchema), verifySignup)
```

## What controllers should do

Controllers should assume validated input.

Good controller responsibilities:
- call service/action logic
- shape the HTTP response
- pass errors to `next`

Controllers should not repeat field validation that already exists in Joi.

## What services should do

Services should handle:
- business rules
- database work
- authorization checks
- domain-specific errors

Services should not be responsible for basic payload shape validation.

## Error behavior

Validation errors become `400` responses through the existing error flow.

The middleware:
- uses `abortEarly: false`
- uses `stripUnknown: true`
- converts Joi failures into `HttpError(400, ... )`

## Adding a new validated route

1. Add a schema in the module's `*.schemas.ts`
2. Apply the schema in the route file
3. Keep the controller lean
4. Add/update tests for valid and invalid input behavior

## Current coverage

Joi is currently applied to:
- auth signup/login payloads
- OTP start/verify payloads
- user creation payload
- move-task action payload
- environment config

## Why this pattern

This keeps validation:
- consistent
- reusable
- testable
- out of the service layer

That gives us cleaner modules as the backend grows. -->
