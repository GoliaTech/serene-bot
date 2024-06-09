/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  verbose: true,
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  collectCoverage: true,
  coverageDirectory: "./.coverage",
  coverageReporters: ["json", "html"],
};
