import axios from 'axios';
import { appendFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { ensureDir, runCommand, wait, workspaceRoot } from './lib.mjs';

const backendEntry = resolve(workspaceRoot, 'dist/apps/todos-backend/main.js');

export const buildBackend = async (logFile) =>
  runCommand('npx', ['nx', 'build', 'todos-backend'], { logFile });

export const waitForServer = async (url, attempts = 60, delayMs = 1000) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await axios.get(url);
      return;
    } catch {
      await wait(delayMs);
    }
  }

  throw new Error(`Backend server did not become ready at ${url}`);
};

export const startBackend = async ({
  port = 3000,
  host = '127.0.0.1',
  logFile,
  extraEnv = {},
} = {}) => {
  if (logFile) {
    ensureDir(dirname(logFile));
    writeFileSync(logFile, '', 'utf8');
  }

  const child = spawn(process.execPath, [backendEntry], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: process.env.NODE_ENV ?? 'test',
      ENABLE_SWAGGER: process.env.ENABLE_SWAGGER ?? 'true',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const writeLog = (chunk, target) => {
    const content = chunk.toString();
    target.write(content);
    if (logFile) {
      appendFileSync(logFile, content, 'utf8');
    }
  };

  child.stdout.on('data', (chunk) => writeLog(chunk, process.stdout));
  child.stderr.on('data', (chunk) => writeLog(chunk, process.stderr));

  await waitForServer(`http://${host}:${port}/api`);

  return child;
};

export const stopBackend = async (child) => {
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
