import { resolve } from 'node:path';
import { fileExists, wait, workspaceRoot } from '../validate/lib.mjs';
import { buildBackend, startBackend, stopBackend } from '../validate/backend-runtime.mjs';

const outputPath = resolve(workspaceRoot, 'reports/contracts/openapi.json');
const buildLog = resolve(workspaceRoot, 'reports/contracts/openapi-build.log');
const serverLog = resolve(workspaceRoot, 'reports/contracts/openapi-backend.log');

const waitForSpec = async (attempts = 30, delayMs = 500) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (fileExists(outputPath)) {
      return;
    }

    await wait(delayMs);
  }

  throw new Error(`OpenAPI document was not generated at ${outputPath}`);
};

const main = async () => {
  await buildBackend(buildLog);

  const backend = await startBackend({
    port: 3001,
    logFile: serverLog,
    extraEnv: {
      OPENAPI_OUTPUT_PATH: outputPath,
      ENABLE_SWAGGER: 'true',
    },
  });

  try {
    await waitForSpec();
  } finally {
    await stopBackend(backend);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
