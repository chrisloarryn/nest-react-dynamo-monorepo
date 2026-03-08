import { resolve } from 'node:path';
import { buildBackend, startBackend, stopBackend } from './backend-runtime.mjs';
import { startDynamoDb, stopDynamoDb } from '../dynamodb/runtime.mjs';
import {
  contractsReportsRoot,
  resetDir,
  runCommand,
} from './lib.mjs';

const contractLog = resolve(contractsReportsRoot, 'contracts.log');
const buildLog = resolve(contractsReportsRoot, 'build.log');
const serverLog = resolve(contractsReportsRoot, 'backend.log');
const contractPort = 3100;

const main = async () => {
  resetDir(contractsReportsRoot);

  const dynamoDb = await startDynamoDb({
    logFile: resolve(contractsReportsRoot, 'dynamodb.log'),
  });
  const dynamoDbEndpoint = dynamoDb.endpoint;

  try {
    await runCommand('node', ['tools/dynamodb/bootstrap-tables.mjs'], {
      logFile: resolve(contractsReportsRoot, 'dynamodb-bootstrap.log'),
      env: {
        ...process.env,
        DYNAMODB_ENDPOINT: dynamoDbEndpoint,
      },
    });
    await runCommand('npm', ['run', 'openapi:generate'], {
      logFile: resolve(contractsReportsRoot, 'openapi.log'),
      env: {
        ...process.env,
        DYNAMODB_ENDPOINT: dynamoDbEndpoint,
      },
    });
    await buildBackend(buildLog);

    const backend = await startBackend({
      port: contractPort,
      logFile: serverLog,
      extraEnv: {
        DYNAMODB_ENDPOINT: dynamoDbEndpoint,
      },
    });

    try {
      await runCommand('node', ['tools/contracts/run-contract-tests.mjs'], {
        logFile: contractLog,
        env: {
          ...process.env,
          CONTRACT_BASE_URL: `http://127.0.0.1:${contractPort}/api`,
        },
      });
    } finally {
      await stopBackend(backend);
    }
  } finally {
    await stopDynamoDb(dynamoDb);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
