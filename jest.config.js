/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  verbose: true,
  projects: [
    {
      preset: "ts-jest",
      testEnvironment: "node",
      // displayName: "www",
      testMatch: ["<rootDir>/src/**/*.test.ts"],
    },
  ],
};
