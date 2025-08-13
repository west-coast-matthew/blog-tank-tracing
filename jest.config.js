const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json"); // Adjust if your tsconfig is named differently

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest", // Use the ts-jest preset for TypeScript projects
  testEnvironment: "node",

  // Jest should search for tests and modules in both 'src' and 'test' directories
  roots: ["<rootDir>/src", "<rootDir>/tests"],

  // Specify a pattern to match test files, located specifically in the 'test' directory
  testMatch: [
    "<rootDir>/tests/**/*.spec.ts", // Matches files like 'my-test.spec.ts' in 'test' and its subdirectories
    "<rootDir>/tests/**/*.test.ts", // Matches files like 'my-test.test.ts' in 'test' and its subdirectories
  ],

  // Transform TypeScript files using ts-jest
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  // Map module paths according to your tsconfig.json (useful for absolute imports)
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
};
