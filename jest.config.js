/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  coveragePathIgnorePatterns: ['node_modules', 'src/types.ts', '__helpers__'],
  preset: 'ts-jest',
  setupFilesAfterEnv: ['jest-expect-message'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/__helpers__',
    '<rootDir>/benchmark',
  ],
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/build/tsconfig/base.json',
      },
    ],
  },
};
