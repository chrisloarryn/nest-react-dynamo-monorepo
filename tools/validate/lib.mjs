import { spawn } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

export const workspaceRoot = resolve(currentDir, '../..');
export const reportsRoot = resolve(workspaceRoot, 'reports');
export const validateReportsRoot = resolve(reportsRoot, 'validate');
export const contractsReportsRoot = resolve(reportsRoot, 'contracts');
export const performanceReportsRoot = resolve(reportsRoot, 'performance');

export const ensureDir = (path) => {
  mkdirSync(path, { recursive: true });
};

export const resetDir = (path) => {
  rmSync(path, { recursive: true, force: true });
  ensureDir(path);
};

export const writeJson = (path, data) => {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
};

export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export const fileExists = (path) => existsSync(path);

export const wait = (ms) =>
  new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

export const appendSummary = (content) => {
  if (!process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${content.trimEnd()}\n`, 'utf8');
};

export const runCommand = (
  command,
  args,
  {
    cwd = workspaceRoot,
    env = process.env,
    logFile,
    allowFailure = false,
    silent = false,
  } = {}
) =>
  new Promise((resolvePromise, rejectPromise) => {
    if (logFile) {
      ensureDir(dirname(logFile));
      writeFileSync(logFile, '', 'utf8');
    }

    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    const handleChunk = (chunk, streamName) => {
      const content = chunk.toString();
      if (streamName === 'stdout') {
        stdout += content;
      } else {
        stderr += content;
      }

      if (logFile) {
        appendFileSync(logFile, content, 'utf8');
      }

      if (!silent) {
        const target = streamName === 'stdout' ? process.stdout : process.stderr;
        target.write(content);
      }
    };

    child.stdout.on('data', (chunk) => handleChunk(chunk, 'stdout'));
    child.stderr.on('data', (chunk) => handleChunk(chunk, 'stderr'));

    child.on('error', rejectPromise);
    child.on('close', (code) => {
      const result = { code: code ?? 1, stdout, stderr };
      if (result.code !== 0 && !allowFailure) {
        const error = new Error(
          `Command failed: ${command} ${args.join(' ')} (${result.code})`
        );
        error.result = result;
        rejectPromise(error);
        return;
      }

      resolvePromise(result);
    });
  });
