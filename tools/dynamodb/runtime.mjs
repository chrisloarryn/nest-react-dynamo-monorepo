import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { wait, workspaceRoot } from '../validate/lib.mjs';

const endpoint = 'http://127.0.0.1:8000';
const dynaliteEntry = resolve(workspaceRoot, 'node_modules/dynalite/cli.js');

const createClient = () =>
  new DynamoDBClient({
    endpoint,
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'DUMMYIDEXAMPLE',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'DUMMYEXAMPLEKEY',
    },
  });

export const waitForDynamoDb = async (attempts = 30, delayMs = 500) => {
  const client = createClient();

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await client.send(new ListTablesCommand({}));
      return;
    } catch {
      await wait(delayMs);
    }
  }

  throw new Error(`DynamoDB emulator did not become ready at ${endpoint}`);
};

export const startDynamoDb = async ({ logFile } = {}) => {
  if (logFile) {
    mkdirSync(dirname(logFile), { recursive: true });
    writeFileSync(logFile, '', 'utf8');
  }

  const child = spawn(
    process.execPath,
    [
      dynaliteEntry,
      '--host',
      '127.0.0.1',
      '--port',
      '8000',
      '--path',
      resolve(workspaceRoot, '.nx/dynalite'),
      '--createTableMs',
      '0',
    ],
    {
      cwd: workspaceRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  const handleChunk = (chunk) => {
    if (!logFile) {
      return;
    }

    appendFileSync(logFile, chunk.toString(), 'utf8');
  };

  child.stdout.on('data', handleChunk);
  child.stderr.on('data', handleChunk);

  await waitForDynamoDb();
  return child;
};

export const stopDynamoDb = async (child) => {
  if (!child || child.killed) {
    return;
  }

  await new Promise((resolvePromise) => {
    const timeout = setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
      resolvePromise();
    }, 5000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolvePromise();
    });

    child.kill('SIGTERM');
  });
};

export const dynamoDbEndpoint = endpoint;
