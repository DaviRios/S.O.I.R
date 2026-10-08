module.exports = {
  displayName: 'back',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: { '^@soir/contracts$': '<rootDir>/../../libs/contracts/src/index.ts' },
  coverageDirectory: '../../coverage/apps/back',
};
