import { runCommand } from './lib.mjs';

const stages = [
  ['validate:test'],
  ['validate:coverage'],
  ['validate:contract'],
  ['validate:performance'],
];

const main = async () => {
  let hasFailure = false;

  for (const [scriptName] of stages) {
    const result = await runCommand('npm', ['run', scriptName], {
      allowFailure: true,
    });
    if (result.code !== 0) {
      hasFailure = true;
    }
  }

  const summaryResult = await runCommand('npm', ['run', 'validate:summarize'], {
    allowFailure: true,
  });
  if (summaryResult.code !== 0) {
    hasFailure = true;
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
