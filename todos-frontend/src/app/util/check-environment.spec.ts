import { afterEach, describe, expect, it, vi } from 'vitest';
import checkEnvironment from './check-environment';

describe('checkEnvironment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the local backend url in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(checkEnvironment()).toBe('http://localhost:3000');
  });

  it('returns the deployed backend url outside development', () => {
    vi.stubEnv('NODE_ENV', 'test');
    expect(checkEnvironment()).toBe('https://trello-clone-one.vercel.app');
  });
});
