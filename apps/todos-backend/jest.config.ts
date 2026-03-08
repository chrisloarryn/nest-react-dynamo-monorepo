/* eslint-disable */
export default {
  displayName: 'todos-backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/todos-backend',
  coverageReporters: ['text', 'html', 'json-summary', 'lcov'],
};
