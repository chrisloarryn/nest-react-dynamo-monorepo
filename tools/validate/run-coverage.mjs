import { resolve } from 'node:path';
import {
  ensureDir,
  readJson,
  runCommand,
  validateReportsRoot,
  workspaceRoot,
  writeJson,
} from './lib.mjs';

const threshold = 85;

const parseCoverageSummary = (path) => {
  const summary = readJson(path);
  return summary.total;
};

const main = async () => {
  ensureDir(validateReportsRoot);

  await runCommand('npx', ['nx', 'run', 'todos-backend:test:ci'], {
    logFile: resolve(validateReportsRoot, 'backend-coverage.log'),
  });
  await runCommand('npx', ['nx', 'run', 'todos-frontend:test', '--coverage'], {
    logFile: resolve(validateReportsRoot, 'frontend-coverage.log'),
  });

  const backend = parseCoverageSummary(
    resolve(workspaceRoot, 'coverage/apps/todos-backend/coverage-summary.json')
  );
  const frontend = parseCoverageSummary(
    resolve(workspaceRoot, 'coverage/todos-frontend/coverage-summary.json')
  );

  const report = {
    status:
      backend.lines.pct >= threshold && frontend.lines.pct >= threshold
        ? 'success'
        : 'failed',
    threshold,
    backend: backend.lines,
    frontend: frontend.lines,
  };

  writeJson(resolve(validateReportsRoot, 'coverage.json'), report);

  if (report.status !== 'success') {
    throw new Error(
      `Coverage gate failed: backend=${backend.lines.pct}% frontend=${frontend.lines.pct}% threshold=${threshold}%`
    );
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
