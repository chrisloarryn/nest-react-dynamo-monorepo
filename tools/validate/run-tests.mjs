import { resolve } from 'node:path';
import { readJson, resetDir, runCommand, validateReportsRoot, writeJson } from './lib.mjs';

const parseJestReport = (path) => {
  const report = readJson(path);
  return {
    status: report.success ? 'success' : 'failed',
    suites: report.numTotalTestSuites,
    failedSuites: report.numFailedTestSuites,
    tests: report.numTotalTests,
    failedTests: report.numFailedTests,
  };
};

const parseVitestReport = (path) => {
  const report = readJson(path);
  return {
    status: report.success ? 'success' : 'failed',
    suites: report.numTotalTestSuites ?? report.numTotalFiles ?? null,
    failedSuites: report.numFailedTestSuites ?? report.numFailedFiles ?? 0,
    tests: report.numTotalTests ?? null,
    failedTests: report.numFailedTests ?? 0,
  };
};

const main = async () => {
  resetDir(validateReportsRoot);

  await runCommand(
    'npx',
    ['nx', 'run-many', '-t', 'lint', '-p', 'todos-backend,todos-frontend,todos-backend-e2e'],
    { logFile: resolve(validateReportsRoot, 'lint.log') }
  );

  await runCommand(
    'npx',
    [
      'jest',
      '--config',
      'apps/todos-backend/jest.config.ts',
      '--json',
      '--outputFile',
      resolve(validateReportsRoot, 'backend-tests.json'),
    ],
    { logFile: resolve(validateReportsRoot, 'backend-tests.log') }
  );

  await runCommand(
    'npx',
    [
      'vitest',
      'run',
      '--config',
      'todos-frontend/vite.config.ts',
      '--reporter=json',
      '--outputFile',
      resolve(validateReportsRoot, 'frontend-tests.json'),
    ],
    { logFile: resolve(validateReportsRoot, 'frontend-tests.log') }
  );

  await runCommand(
    'npx',
    [
      'jest',
      '--config',
      'apps/todos-backend-e2e/jest.config.ts',
      '--json',
      '--outputFile',
      resolve(validateReportsRoot, 'backend-e2e.json'),
    ],
    { logFile: resolve(validateReportsRoot, 'backend-e2e.log') }
  );

  writeJson(resolve(validateReportsRoot, 'tests.json'), {
    status: 'success',
    lint: { status: 'success' },
    backend: parseJestReport(resolve(validateReportsRoot, 'backend-tests.json')),
    frontend: parseVitestReport(resolve(validateReportsRoot, 'frontend-tests.json')),
    e2e: parseJestReport(resolve(validateReportsRoot, 'backend-e2e.json')),
  });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
