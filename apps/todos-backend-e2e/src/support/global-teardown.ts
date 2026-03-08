/* eslint-disable */

import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = resolve(__dirname, '../../../..');
const serverStatePath = resolve(workspaceRoot, '.nx/workspace-data/todos-backend-e2e-server.json');

module.exports = async function () {
  if (existsSync(serverStatePath)) {
    const { pid } = JSON.parse(readFileSync(serverStatePath, 'utf8')) as { pid: number };

    try {
      process.kill(-pid, 'SIGTERM');
    } catch {
      // Ignore teardown races when the process has already exited.
    }

    rmSync(serverStatePath, { force: true });
  }

  console.log('\nTearing down...\n');
};
