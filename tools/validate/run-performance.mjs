import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import axios from 'axios';
import { buildBackend, startBackend, stopBackend } from './backend-runtime.mjs';
import {
  dynamoDbEndpoint,
  startDynamoDb,
  stopDynamoDb,
} from '../dynamodb/runtime.mjs';
import {
  performanceReportsRoot,
  resetDir,
  runCommand,
  writeJson,
} from './lib.mjs';

const parsePerformanceSummary = (path) => {
  const summary = JSON.parse(readFileSync(path, 'utf8'));
  const metrics = summary.metrics ?? {};
  const thresholdExceeded = (metricName, thresholdName) =>
    metrics[metricName]?.thresholds?.[thresholdName] === true;

  return {
    mode: 'k6',
    status:
      thresholdExceeded('http_req_failed', 'rate<0.01') ||
      thresholdExceeded('checks', 'rate>0.99') ||
      thresholdExceeded('http_req_duration{type:read}', 'p(95)<800') ||
      thresholdExceeded('http_req_duration{type:write}', 'p(95)<1200') ||
      thresholdExceeded('http_req_duration', 'p(99)<2000')
        ? 'failed'
        : 'success',
    checksRate: metrics.checks?.value ?? null,
    httpReqFailedRate: metrics.http_req_failed?.value ?? null,
    avgMs: metrics.http_req_duration?.avg ?? null,
    p95ReadMs: metrics['http_req_duration{type:read}']?.['p(95)'] ?? null,
    p95WriteMs: metrics['http_req_duration{type:write}']?.['p(95)'] ?? null,
    p99Ms: metrics.http_req_duration?.['p(99)'] ?? null,
  };
};

const performancePort = 3200;

const percentile = (values, percentileValue) => {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((percentileValue / 100) * sorted.length) - 1)
  );

  return Number(sorted[index].toFixed(2));
};

const runNodeSmoke = async (baseUrl) => {
  const requestDurations = [];
  const readDurations = [];
  const writeDurations = [];
  let totalRequests = 0;
  let failedRequests = 0;
  let passedChecks = 0;
  let totalChecks = 0;

  const timedRequest = async (method, path, expectedStatus, type, data) => {
    const start = performance.now();
    let response;

    try {
      response = await axios({
        method,
        url: `${baseUrl}${path}`,
        data,
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      });
    } catch (error) {
      failedRequests += 1;
      totalRequests += 1;
      throw error;
    } finally {
      const duration = performance.now() - start;
      requestDurations.push(duration);
      if (type === 'read') {
        readDurations.push(duration);
      } else {
        writeDurations.push(duration);
      }
    }

    totalRequests += 1;
    totalChecks += 2;

    const statusOk = response.status === expectedStatus;
    const contentTypeOk =
      response.headers['content-type']?.includes('application/json') ?? false;

    if (statusOk) {
      passedChecks += 1;
    }
    if (contentTypeOk) {
      passedChecks += 1;
    }

    if (!statusOk) {
      failedRequests += 1;
      throw new Error(`Expected ${expectedStatus} for ${method.toUpperCase()} ${path}, received ${response.status}`);
    }

    return response.data;
  };

  const unique = randomUUID();
  const user = await timedRequest('post', '/users', 201, 'write', {
    fullName: 'Performance User',
    email: `performance-${unique}@example.com`,
  });
  const board = await timedRequest('post', '/boards', 201, 'write', {
    name: 'Performance board',
    createdBy: user.id,
    backgroundImage: 'https://images.example.com/performance.jpg',
    users: [user.id],
  });
  const column = await timedRequest('post', '/columns', 201, 'write', {
    name: 'Performance column',
    order: 1,
    boardId: board.id,
    archived: false,
    tasks: [],
  });
  const card = await timedRequest(
    'post',
    `/boards/${board.id}/columns/${column.id}/cards`,
    201,
    'write',
    {
      title: 'Performance card',
      text: 'Measure request latency',
      status: 'todo',
      type: 'task',
      order: 1,
      boardId: board.id,
      columnId: column.id,
      userId: user.id,
      archived: false,
    }
  );

  for (let iteration = 0; iteration < 8; iteration += 1) {
    await timedRequest('get', `/boards/${board.id}`, 200, 'read');
    await timedRequest('get', `/boards/${board.id}/columns`, 200, 'read');
    await timedRequest('get', `/boards/${board.id}/cards`, 200, 'read');

    await timedRequest('patch', `/boards/${board.id}/cards/${card.id}`, 200, 'write', {
      title: `Updated ${iteration}`,
      text: 'Updated by node smoke fallback',
      columnId: column.id,
      assignedTo: user.id,
    });

    const transientCard = await timedRequest(
      'post',
      `/boards/${board.id}/columns/${column.id}/cards`,
      201,
      'write',
      {
        title: `Transient ${iteration}`,
        text: 'Transient node smoke card',
        status: 'todo',
        type: 'task',
        order: iteration + 2,
        boardId: board.id,
        columnId: column.id,
        userId: user.id,
        archived: false,
      }
    );

    await timedRequest(
      'delete',
      `/boards/${board.id}/cards/${transientCard.id}`,
      200,
      'write'
    );
  }

  const checksRate = totalChecks === 0 ? 1 : passedChecks / totalChecks;
  const httpReqFailedRate = totalRequests === 0 ? 0 : failedRequests / totalRequests;
  const avgMs =
    requestDurations.length === 0
      ? null
      : Number(
          (
            requestDurations.reduce((total, value) => total + value, 0) /
            requestDurations.length
          ).toFixed(2)
        );

  const report = {
    status:
      httpReqFailedRate < 0.01 &&
      checksRate > 0.99 &&
      (percentile(readDurations, 95) ?? 0) < 800 &&
      (percentile(writeDurations, 95) ?? 0) < 1200 &&
      (percentile(requestDurations, 99) ?? 0) < 2000
        ? 'success'
        : 'failed',
    mode: 'node-smoke-fallback',
    checksRate,
    httpReqFailedRate,
    avgMs,
    p95ReadMs: percentile(readDurations, 95),
    p95WriteMs: percentile(writeDurations, 95),
    p99Ms: percentile(requestDurations, 99),
    totalRequests,
  };

  writeJson(resolve(performanceReportsRoot, 'node-smoke.json'), report);
  return report;
};

const main = async () => {
  resetDir(performanceReportsRoot);

  const summaryPath = resolve(performanceReportsRoot, 'k6-summary.json');
  const dynamoDb = await startDynamoDb({
    logFile: resolve(performanceReportsRoot, 'dynamodb.log'),
  });
  try {
    await runCommand('node', ['tools/dynamodb/bootstrap-tables.mjs'], {
      logFile: resolve(performanceReportsRoot, 'dynamodb-bootstrap.log'),
      env: {
        ...process.env,
        DYNAMODB_ENDPOINT: dynamoDbEndpoint,
      },
    });
    await buildBackend(resolve(performanceReportsRoot, 'build.log'));
    const backend = await startBackend({
      port: performancePort,
      logFile: resolve(performanceReportsRoot, 'backend.log'),
      extraEnv: {
        DYNAMODB_ENDPOINT: dynamoDbEndpoint,
      },
    });

    try {
      const hasK6 = await runCommand('which', ['k6'], {
        allowFailure: true,
        silent: true,
      });
      const hasDocker = await runCommand('docker', ['info'], {
        allowFailure: true,
        silent: true,
      });

      if (hasK6.code === 0) {
        await runCommand(
          'k6',
          [
            'run',
            '--summary-export',
            summaryPath,
            'tools/performance/validate.js',
          ],
          {
            logFile: resolve(performanceReportsRoot, 'k6.log'),
            env: {
              ...process.env,
              BASE_URL: `http://127.0.0.1:${performancePort}/api`,
            },
          }
        );
      } else if (hasDocker.code === 0) {
        await runCommand(
          'docker',
          [
            'run',
            '--rm',
            '-i',
            '-v',
            `${process.cwd()}:/work`,
            '-e',
            `BASE_URL=http://host.docker.internal:${performancePort}/api`,
            '-w',
            '/work',
            'grafana/k6',
            'run',
            '--summary-export',
            '/work/reports/performance/k6-summary.json',
            'tools/performance/validate.js',
          ],
          {
            logFile: resolve(performanceReportsRoot, 'k6.log'),
          }
        );
      } else {
        const report = await runNodeSmoke(`http://127.0.0.1:${performancePort}/api`);
        writeJson(resolve(performanceReportsRoot, 'performance.json'), report);
        return;
      }
    } finally {
      await stopBackend(backend);
    }
  } finally {
    await stopDynamoDb(dynamoDb);
  }

  writeJson(
    resolve(performanceReportsRoot, 'performance.json'),
    parsePerformanceSummary(summaryPath)
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
