import axios from 'axios';
import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import {
  contractsReportsRoot,
  ensureDir,
  writeJson,
  workspaceRoot,
} from '../validate/lib.mjs';

const baseUrl = process.env.CONTRACT_BASE_URL ?? 'http://127.0.0.1:3000/api';
const openApiPath = resolve(workspaceRoot, 'reports/contracts/openapi.json');

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});
addFormats(ajv);

const validatorCache = new Map();

const getOperation = (spec, method, pathTemplate) => {
  const operation = spec.paths?.[pathTemplate]?.[method.toLowerCase()];
  if (!operation) {
    throw new Error(`No OpenAPI operation found for ${method.toUpperCase()} ${pathTemplate}`);
  }
  return operation;
};

const getCompiledValidator = (cacheKey, schema) => {
  if (!validatorCache.has(cacheKey)) {
    validatorCache.set(cacheKey, ajv.compile(schema));
  }
  return validatorCache.get(cacheKey);
};

const validateSchema = (cacheKey, schema, payload, context) => {
  const validate = getCompiledValidator(cacheKey, schema);
  const valid = validate(payload);
  if (!valid) {
    throw new Error(`${context} schema validation failed: ${ajv.errorsText(validate.errors)}`);
  }
};

const maybeValidateRequest = (spec, method, pathTemplate, body, skip) => {
  if (skip || body === undefined) {
    return;
  }

  const operation = getOperation(spec, method, pathTemplate);
  const schema = operation.requestBody?.content?.['application/json']?.schema;
  if (schema) {
    validateSchema(
      `request:${method}:${pathTemplate}`,
      schema,
      body,
      `${method.toUpperCase()} ${pathTemplate} request`
    );
  }
};

const maybeValidateResponse = (spec, method, pathTemplate, status, payload) => {
  const operation = getOperation(spec, method, pathTemplate);
  const responseSchema =
    operation.responses?.[String(status)]?.content?.['application/json']?.schema ??
    operation.responses?.default?.content?.['application/json']?.schema;

  if (responseSchema) {
    validateSchema(
      `response:${method}:${pathTemplate}:${status}`,
      responseSchema,
      payload,
      `${method.toUpperCase()} ${pathTemplate} response`
    );
  }
};

const results = [];

const requestCase = async (
  spec,
  {
    name,
    method,
    path,
    pathTemplate,
    expectedStatus,
    data,
    skipRequestValidation = false,
  }
) => {
  try {
    maybeValidateRequest(spec, method, pathTemplate, data, skipRequestValidation);

    const response = await axios({
      url: `${baseUrl}${path}`,
      method,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, received ${response.status}`);
    }

    maybeValidateResponse(spec, method, pathTemplate, expectedStatus, response.data);

    results.push({
      name,
      method: method.toUpperCase(),
      path: pathTemplate,
      status: 'passed',
      httpStatus: response.status,
    });

    return response;
  } catch (error) {
    results.push({
      name,
      method: method.toUpperCase(),
      path: pathTemplate,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

const main = async () => {
  ensureDir(contractsReportsRoot);
  const spec = await SwaggerParser.dereference(openApiPath);
  const suffix = randomUUID();

  let exitCode = 0;

  try {
    await requestCase(spec, {
      name: 'health check',
      method: 'get',
      path: '',
      pathTemplate: '/api',
      expectedStatus: 200,
    });

    await requestCase(spec, {
      name: 'invalid user payload returns 400',
      method: 'post',
      path: '/users',
      pathTemplate: '/api/users',
      expectedStatus: 400,
      data: {
        fullName: 'Invalid user',
      },
      skipRequestValidation: true,
    });

    const userResponse = await requestCase(spec, {
      name: 'create user',
      method: 'post',
      path: '/users',
      pathTemplate: '/api/users',
      expectedStatus: 201,
      data: {
        fullName: 'Contract User',
        email: `contract-${suffix}@example.com`,
        avatarUrl:
          'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      },
    });

    const user = userResponse.data;

    await requestCase(spec, {
      name: 'get user',
      method: 'get',
      path: `/users/${user.id}`,
      pathTemplate: '/api/users/{id}',
      expectedStatus: 200,
    });

    const boardResponse = await requestCase(spec, {
      name: 'create board',
      method: 'post',
      path: '/boards',
      pathTemplate: '/api/boards',
      expectedStatus: 201,
      data: {
        name: 'Contract board',
        createdBy: user.id,
        backgroundImage: 'https://images.example.com/board.jpg',
        users: [user.id],
      },
    });

    const board = boardResponse.data;

    await requestCase(spec, {
      name: 'get board',
      method: 'get',
      path: `/boards/${board.id}`,
      pathTemplate: '/api/boards/{id}',
      expectedStatus: 200,
    });

    const columnResponse = await requestCase(spec, {
      name: 'create column',
      method: 'post',
      path: '/columns',
      pathTemplate: '/api/columns',
      expectedStatus: 201,
      data: {
        name: 'To Do',
        order: 1,
        boardId: board.id,
        archived: false,
        tasks: [],
      },
    });

    const column = columnResponse.data;

    await requestCase(spec, {
      name: 'list board columns',
      method: 'get',
      path: `/boards/${board.id}/columns`,
      pathTemplate: '/api/boards/{id}/columns',
      expectedStatus: 200,
    });

    const cardResponse = await requestCase(spec, {
      name: 'create card',
      method: 'post',
      path: `/boards/${board.id}/columns/${column.id}/cards`,
      pathTemplate: '/api/boards/{boardId}/columns/{columnId}/cards',
      expectedStatus: 201,
      data: {
        title: 'Contract card',
        text: 'Validate OpenAPI',
        status: 'todo',
        type: 'task',
        order: 1,
        boardId: board.id,
        columnId: column.id,
        userId: user.id,
        assignedTo: user.id,
        archived: false,
      },
    });

    const card = cardResponse.data;

    await requestCase(spec, {
      name: 'list board cards',
      method: 'get',
      path: `/boards/${board.id}/cards`,
      pathTemplate: '/api/boards/{id}/cards',
      expectedStatus: 200,
    });

    await requestCase(spec, {
      name: 'update card',
      method: 'patch',
      path: `/boards/${board.id}/cards/${card.id}`,
      pathTemplate: '/api/boards/{boardId}/cards/{cardId}',
      expectedStatus: 200,
      data: {
        title: 'Updated contract card',
        text: 'Validate OpenAPI and contracts',
        columnId: column.id,
        assignedTo: user.id,
        label: {
          bg: '#0079bf',
          type: 'performance',
        },
      },
    });

    await requestCase(spec, {
      name: 'missing card returns 404',
      method: 'delete',
      path: `/boards/${board.id}/cards/missing-card`,
      pathTemplate: '/api/boards/{boardId}/cards/{cardId}',
      expectedStatus: 404,
      skipRequestValidation: true,
    });

    await requestCase(spec, {
      name: 'delete card',
      method: 'delete',
      path: `/boards/${board.id}/cards/${card.id}`,
      pathTemplate: '/api/boards/{boardId}/cards/{cardId}',
      expectedStatus: 200,
    });

    await requestCase(spec, {
      name: 'delete column',
      method: 'delete',
      path: `/columns/${column.id}`,
      pathTemplate: '/api/columns/{id}',
      expectedStatus: 200,
    });

    await requestCase(spec, {
      name: 'delete board',
      method: 'delete',
      path: `/boards/${board.id}`,
      pathTemplate: '/api/boards/{id}',
      expectedStatus: 200,
    });

    await requestCase(spec, {
      name: 'delete user',
      method: 'delete',
      path: `/users/${user.id}`,
      pathTemplate: '/api/users/{id}',
      expectedStatus: 200,
    });
  } catch (error) {
    exitCode = 1;
    console.error(error);
  }

  const passed = results.filter((result) => result.status === 'passed').length;
  const report = {
    status: exitCode === 0 ? 'success' : 'failed',
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };

  writeJson(resolve(contractsReportsRoot, 'contract-results.json'), report);

  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
