module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  moduleNameMapper: {
    '^@theme/Layout$': '<rootDir>/jest/mocks/Layout',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@docusaurus/(.*)$': '<rootDir>/jest/mocks/$1',
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.css$': require.resolve('./jest/cssMapper.js'),
    '^unist-util-visit$': '<rootDir>/jest/mocks/unist-util-visit.js',
  },
  testMatch: ['**/__tests__/**/*.(t|j)s?(x)', '**/?(*.)+(spec|test).(t|j)s?(x)'],
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/theme/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!src/**/?(*.)+(spec|test).{ts,tsx}',
  ],
};
