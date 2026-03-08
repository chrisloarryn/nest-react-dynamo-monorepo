import http from 'k6/http';
import { check, group, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL ?? 'http://127.0.0.1:3000/api';
const headers = {
  'Content-Type': 'application/json',
};

export const options = {
  vus: Number(__ENV.K6_VUS ?? 4),
  iterations: Number(__ENV.K6_ITERATIONS ?? 16),
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    'http_req_duration{type:read}': ['p(95)<800'],
    'http_req_duration{type:write}': ['p(95)<1200'],
    http_req_duration: ['p(99)<2000'],
  },
};

const withJson = (value) => JSON.stringify(value);

const expectJson = (response, expectedStatus) =>
  check(response, {
    [`status is ${expectedStatus}`]: (current) => current.status === expectedStatus,
    'response is json': (current) =>
      current.headers['Content-Type']?.includes('application/json') ?? false,
  });

export function setup() {
  const unique = Date.now();

  const userResponse = http.post(
    `${baseUrl}/users`,
    withJson({
      fullName: 'Performance User',
      email: `performance-${unique}@example.com`,
    }),
    {
      headers,
      tags: {
        type: 'write',
        endpoint: 'create-user',
      },
    }
  );
  expectJson(userResponse, 201);
  const user = userResponse.json();

  const boardResponse = http.post(
    `${baseUrl}/boards`,
    withJson({
      name: 'Performance board',
      createdBy: user.id,
      backgroundImage: 'https://images.example.com/performance.jpg',
      users: [user.id],
    }),
    {
      headers,
      tags: {
        type: 'write',
        endpoint: 'create-board',
      },
    }
  );
  expectJson(boardResponse, 201);
  const board = boardResponse.json();

  const columnResponse = http.post(
    `${baseUrl}/columns`,
    withJson({
      name: 'Performance column',
      order: 1,
      boardId: board.id,
      archived: false,
      tasks: [],
    }),
    {
      headers,
      tags: {
        type: 'write',
        endpoint: 'create-column',
      },
    }
  );
  expectJson(columnResponse, 201);
  const column = columnResponse.json();

  const cardResponse = http.post(
    `${baseUrl}/boards/${board.id}/columns/${column.id}/cards`,
    withJson({
      title: 'Performance card',
      text: 'Measure request latency',
      status: 'todo',
      type: 'task',
      order: 1,
      boardId: board.id,
      columnId: column.id,
      userId: user.id,
      archived: false,
    }),
    {
      headers,
      tags: {
        type: 'write',
        endpoint: 'create-card',
      },
    }
  );
  expectJson(cardResponse, 201);

  return {
    user,
    board,
    column,
    card: cardResponse.json(),
  };
}

export default function (data) {
  group('read endpoints', () => {
    const boardResponse = http.get(`${baseUrl}/boards/${data.board.id}`, {
      tags: {
        type: 'read',
        endpoint: 'get-board',
      },
    });
    expectJson(boardResponse, 200);

    const columnsResponse = http.get(`${baseUrl}/boards/${data.board.id}/columns`, {
      tags: {
        type: 'read',
        endpoint: 'get-columns',
      },
    });
    expectJson(columnsResponse, 200);

    const cardsResponse = http.get(`${baseUrl}/boards/${data.board.id}/cards`, {
      tags: {
        type: 'read',
        endpoint: 'get-cards',
      },
    });
    expectJson(cardsResponse, 200);
  });

  group('write endpoints', () => {
    const updatedTitle = `Updated ${Date.now()}`;
    const patchResponse = http.patch(
      `${baseUrl}/boards/${data.board.id}/cards/${data.card.id}`,
      withJson({
        title: updatedTitle,
        text: 'Updated by k6',
        columnId: data.column.id,
        assignedTo: data.user.id,
      }),
      {
        headers,
        tags: {
          type: 'write',
          endpoint: 'patch-card',
        },
      }
    );
    expectJson(patchResponse, 200);

    const extraCardResponse = http.post(
      `${baseUrl}/boards/${data.board.id}/columns/${data.column.id}/cards`,
      withJson({
        title: `Transient card ${Date.now()}`,
        text: 'Transient card for performance validation',
        status: 'todo',
        type: 'task',
        order: 2,
        boardId: data.board.id,
        columnId: data.column.id,
        userId: data.user.id,
        archived: false,
      }),
      {
        headers,
        tags: {
          type: 'write',
          endpoint: 'create-transient-card',
        },
      }
    );
    expectJson(extraCardResponse, 201);

    const transientCard = extraCardResponse.json();
    const deleteResponse = http.del(
      `${baseUrl}/boards/${data.board.id}/cards/${transientCard.id}`,
      null,
      {
        headers,
        tags: {
          type: 'write',
          endpoint: 'delete-transient-card',
        },
      }
    );
    expectJson(deleteResponse, 200);
  });

  sleep(0.2);
}
