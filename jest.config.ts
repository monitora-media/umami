export default {
  roots: ['./src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Resolve the tsconfig path aliases (baseUrl ./src) so modules importing via
  // `lib/...`, `components/...` or `queries/...` can be unit-tested.
  moduleNameMapper: {
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^queries/(.*)$': '<rootDir>/src/queries/$1',
  },
};
