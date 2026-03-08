# nest-react-dynamo-monorepo

Nx monorepo with a NestJS backend, a React frontend, and DynamoDB-backed board data. The workspace now includes a full `validate` pipeline for tests, coverage, contracts, performance, and summary reporting.

## Stack

- Node.js 25.x
- npm 11.x
- Nx 22
- NestJS 11
- React 19
- Vite 7
- Vitest 4
- Dynamoose 4

## Projects

- `todos-backend`: NestJS API served on `http://localhost:3000/api`
- `todos-frontend`: React app served on `http://localhost:4200`
- `todos-backend-e2e`: Jest-based end-to-end tests for the backend

## Requirements

- Node.js `^25.0.0`
- npm `^11.0.0`
- Docker, only if you want to run DynamoDB Local for manual local development

If you use `nvm`, the repo includes [`.nvmrc`](./.nvmrc):

```bash
nvm use
```

## Install

```bash
npm ci
```

## Local development

Start DynamoDB Local first if you want to run the application stack manually:

```bash
docker compose up -d dynamodb-local
```

Run the backend:

```bash
npm start
```

Run the frontend in a second terminal:

```bash
npm run start:frontend
```

Local URLs:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`

## Common commands

Install dependencies:

```bash
npm ci
```

Lint all projects:

```bash
npm run lint
```

Run unit and component tests across the workspace:

```bash
npm test
```

Build all projects:

```bash
npm run build
```

Run backend tests with coverage:

```bash
npx nx run todos-backend:test:ci
```

Run frontend tests with coverage:

```bash
npx nx run todos-frontend:test --coverage
```

Run backend end-to-end tests:

```bash
npx nx run todos-backend-e2e:e2e
```

Generate the OpenAPI document:

```bash
npm run openapi:generate
```

## Validation

The repo exposes a top-level validation workflow similar to the `users` repository.

Run the full validation pipeline:

```bash
npm run validate
```

Run stages individually:

```bash
npm run validate:test
npm run validate:coverage
npm run validate:contract
npm run validate:performance
npm run validate:summarize
```

What each stage does:

- `validate:test`: runs workspace lint, backend unit tests, frontend tests, and backend e2e tests
- `validate:coverage`: enforces an `85%` line coverage gate for backend and frontend
- `validate:contract`: starts an isolated local DynamoDB emulator, generates `openapi.json`, boots the backend, and validates real responses against the OpenAPI spec
- `validate:performance`: starts an isolated local DynamoDB emulator, boots the backend, and runs the smoke performance suite with `k6`
- `validate:summarize`: writes a consolidated Markdown summary for local use and GitHub Actions

Generated outputs are written to `reports/`:

- `reports/validate/summary.md`
- `reports/validate/tests.json`
- `reports/validate/coverage.json`
- `reports/contracts/openapi.json`
- `reports/contracts/contract-results.json`
- `reports/performance/performance.json`

Notes:

- `validate:contract` and `validate:performance` do not require Docker locally; they start their own temporary DynamoDB emulator.
- The GitHub Actions workflow for the same pipeline lives at [`.github/workflows/validate.yml`](./.github/workflows/validate.yml).

## API overview

The backend uses the global `/api` prefix.

Base route:

- `GET /api`

Resource routes:

- `GET|POST /api/users`
- `GET|PATCH|DELETE /api/users/:id`
- `GET|POST /api/tasks`
- `GET|PATCH|DELETE /api/tasks/:id`
- `GET|POST /api/columns`
- `GET|PATCH|DELETE /api/columns/:id`
- `GET|POST /api/boards`
- `GET|PATCH|DELETE /api/boards/:id`
- `GET /api/boards/:id/columns`
- `GET /api/boards/:id/cards`
- `POST /api/boards/:boardId/columns/:columnId/cards`
- `PATCH /api/boards/:boardId/cards/:cardId`
- `DELETE /api/boards/:boardId/cards/:cardId`

OpenAPI and Swagger:

- Swagger UI: `GET /api/docs`
- OpenAPI JSON in development: `GET /api/docs-json`

## DynamoDB Local

The backend is configured to use DynamoDB Local at `http://localhost:8000` for local app development.

Compose service:

```bash
docker compose up -d dynamodb-local
```

Stop it with:

```bash
docker compose down
```

For validation flows, the repo starts and tears down its own local emulator automatically.

## Useful files

- Postman collection: [`postman/Trello Board.postman_collection.json`](./postman/Trello%20Board.postman_collection.json)
- Backend entrypoint: [`apps/todos-backend/src/main.ts`](./apps/todos-backend/src/main.ts)
- OpenAPI setup: [`apps/todos-backend/src/app/openapi.ts`](./apps/todos-backend/src/app/openapi.ts)
- Frontend Vite config: [`todos-frontend/vite.config.ts`](./todos-frontend/vite.config.ts)
- Validate workflow: [`.github/workflows/validate.yml`](./.github/workflows/validate.yml)
