/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  verbose: true,
  projects: [
    {
      preset: "ts-jest",
      testEnvironment: "node",
      // displayName: "www",
      testMatch: ["<rootDir>/src/**/*.test.ts"],

      // https://github.com/facebook/jest/issues/13022
      // esm module resolution; allow/enforce `import "./blah.js"` instead of `import "./blah"`
      resolver: "ts-jest-resolver",
    },
  ],
};
