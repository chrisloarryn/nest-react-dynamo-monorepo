import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  appendSummary,
  contractsReportsRoot,
  fileExists,
  performanceReportsRoot,
  validateReportsRoot,
} from './lib.mjs';

const loadIfExists = (path) => {
  if (!fileExists(path)) {
    return null;
  }

  return JSON.parse(readFileSync(path, 'utf8'));
};

const statusLabel = (status) => {
  if (status === 'success') {
    return 'PASS';
  }
  if (status === 'failed') {
    return 'FAIL';
  }
  return 'N/A';
};

const formatMetric = (value, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'n/a';
  }

  return `${Number(value).toFixed(2)}${suffix}`;
};

const tests = loadIfExists(resolve(validateReportsRoot, 'tests.json'));
const coverage = loadIfExists(resolve(validateReportsRoot, 'coverage.json'));
const contracts = loadIfExists(resolve(contractsReportsRoot, 'contract-results.json'));
const performance = loadIfExists(resolve(performanceReportsRoot, 'performance.json'));

const summary = `## Validation Summary

| Stage | Result | Highlights |
| --- | --- | --- |
| Tests | ${statusLabel(tests?.status)} | backend=${tests?.backend?.tests ?? 'n/a'}, frontend=${tests?.frontend?.tests ?? 'n/a'}, e2e=${tests?.e2e?.tests ?? 'n/a'} |
| Coverage | ${statusLabel(coverage?.status)} | backend lines=${formatMetric(coverage?.backend?.pct, '%')}, frontend lines=${formatMetric(coverage?.frontend?.pct, '%')}, threshold=${formatMetric(coverage?.threshold, '%')} |
| Contracts | ${statusLabel(contracts?.status)} | passed=${contracts?.passed ?? 'n/a'}, failed=${contracts?.failed ?? 'n/a'} |
| Performance | ${statusLabel(performance?.status)} | failed rate=${formatMetric(performance?.httpReqFailedRate)}, p95 read=${formatMetric(performance?.p95ReadMs, 'ms')}, p95 write=${formatMetric(performance?.p95WriteMs, 'ms')}, p99=${formatMetric(performance?.p99Ms, 'ms')} |
`;

writeFileSync(resolve(validateReportsRoot, 'summary.md'), `${summary}\n`, 'utf8');
appendSummary(summary);
console.log(summary);
