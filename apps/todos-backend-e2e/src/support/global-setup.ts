/* eslint-disable */

import axios from 'axios';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const workspaceRoot = resolve(__dirname, '../../../..');
const serverStatePath = resolve(workspaceRoot, '.nx/workspace-data/todos-backend-e2e-server.json');

async function waitForServer(url: string, attempts = 30) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await axios.get(url);
      return;
    } catch {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000));
    }
  }

  throw new Error(`Backend server did not become ready at ${url}`);
}

module.exports = async function () {
  console.log('\nSetting up...\n');

  const nxBin = resolve(workspaceRoot, 'node_modules/nx/bin/nx.js');
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  const buildResult = spawnSync(process.execPath, [nxBin, 'build', 'todos-backend'], {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: 'true',
    },
  });

  if (buildResult.status !== 0) {
    throw new Error('Unable to build todos-backend for e2e tests');
  }

  const backendEntry = resolve(workspaceRoot, 'dist/apps/todos-backend/main.js');
  const child = spawn(
    process.execPath,
    [backendEntry],
    {
      cwd: workspaceRoot,
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        CI: 'true',
        PORT: port,
      },
    }
  );

  child.unref();

  mkdirSync(resolve(workspaceRoot, '.nx/workspace-data'), { recursive: true });
  writeFileSync(serverStatePath, JSON.stringify({ pid: child.pid }), 'utf8');

  await waitForServer(`http://${host}:${port}/api`);
};
