module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/tests/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/tests/mocks/react-native.js',
    '^expo-sensors$': '<rootDir>/tests/mocks/expo-sensors.js',
    '^expo-keep-awake$': '<rootDir>/tests/mocks/expo-keep-awake.js',
    '^expo-haptics$': '<rootDir>/tests/mocks/expo-haptics.js',
    '^expo-av$': '<rootDir>/tests/mocks/expo-av.js'
  }
};
