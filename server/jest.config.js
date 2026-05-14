export default {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['dotenv/config'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
