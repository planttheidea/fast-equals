module.exports = {
  coveragePathIgnorePatterns: ['/__tests__/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>'],
  testRegex: '/__tests__/.*\\.(ts|tsx)$',
  transform: {
    '\\.(ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/__helpers__/'],
  verbose: true,
};
