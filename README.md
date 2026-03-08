# nest-react-dynamo-monorepo

Nx monorepo with a NestJS backend, a React frontend, and DynamoDB Local for persistence during local development.

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
- Docker, to run DynamoDB Local

If you use `nvm`, the repo includes [`.nvmrc`](./.nvmrc):

```bash
nvm use
```

## Install

```bash
npm ci
```

## Local development

Start DynamoDB Local first:

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

## DynamoDB Local

The backend is configured to use DynamoDB Local at `http://localhost:8000`.

Compose service:

```bash
docker compose up -d dynamodb-local
```

Stop it with:

```bash
docker compose down
```

## Useful files

- Postman collection: [`postman/Trello Board.postman_collection.json`](./postman/Trello%20Board.postman_collection.json)
- Backend entrypoint: [`apps/todos-backend/src/main.ts`](./apps/todos-backend/src/main.ts)
- Frontend Vite config: [`todos-frontend/vite.config.ts`](./todos-frontend/vite.config.ts)
