import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { wait, workspaceRoot } from '../validate/lib.mjs';

const defaultHost = '127.0.0.1';
const defaultPort = 8000;
const dynaliteEntry = resolve(workspaceRoot, 'node_modules/dynalite/cli.js');

const createEndpoint = (host, port) => `http://${host}:${port}`;

const reservePort = (port, host) =>
  new Promise((resolvePromise, rejectPromise) => {
    const server = createServer();
    server.unref();
    server.once('error', rejectPromise);
    server.listen(port, host, () => {
      const address = server.address();
      const reservedPort =
        typeof address === 'object' && address !== null ? address.port : port;

      server.close((error) => {
        if (error) {
          rejectPromise(error);
          return;
        }

        resolvePromise(reservedPort);
      });
    });
  });

const getAvailablePort = async (preferredPort = defaultPort, host = defaultHost) => {
  try {
    return await reservePort(preferredPort, host);
  } catch (error) {
    if (error?.code !== 'EADDRINUSE') {
      throw error;
    }

    return reservePort(0, host);
  }
};

const createClient = (endpoint) =>
  new DynamoDBClient({
    endpoint,
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'DUMMYIDEXAMPLE',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'DUMMYEXAMPLEKEY',
    },
  });

export const waitForDynamoDb = async (
  endpoint,
  attempts = 30,
  delayMs = 500
) => {
  const client = createClient(endpoint);

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

export const startDynamoDb = async ({
  logFile,
  host = defaultHost,
  preferredPort = defaultPort,
} = {}) => {
  const port = await getAvailablePort(preferredPort, host);
  const endpoint = createEndpoint(host, port);
  mkdirSync(resolve(workspaceRoot, '.nx'), { recursive: true });
  const dataPath = mkdtempSync(resolve(workspaceRoot, '.nx/dynalite-'));

  if (logFile) {
    mkdirSync(dirname(logFile), { recursive: true });
    writeFileSync(logFile, '', 'utf8');
  }

  const child = spawn(
    process.execPath,
    [
      dynaliteEntry,
      '--host',
      host,
      '--port',
      String(port),
      '--path',
      dataPath,
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

  await new Promise((resolvePromise, rejectPromise) => {
    const onExit = (code, signal) => {
      rejectPromise(
        new Error(
          `DynamoDB emulator exited before becoming ready (code=${code ?? 'null'}, signal=${signal ?? 'null'})`
        )
      );
    };

    child.once('exit', onExit);
    waitForDynamoDb(endpoint)
      .then(() => {
        child.off('exit', onExit);
        resolvePromise();
      })
      .catch((error) => {
        child.off('exit', onExit);
        rejectPromise(error);
      });
  });

  return {
    child,
    dataPath,
    endpoint,
    host,
    port,
  };
};

export const stopDynamoDb = async (runtime) => {
  const child = runtime?.child;
  if (!child || child.killed) {
    if (runtime?.dataPath) {
      rmSync(runtime.dataPath, { recursive: true, force: true });
    }
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

  if (runtime?.dataPath) {
    rmSync(runtime.dataPath, { recursive: true, force: true });
  }
};
