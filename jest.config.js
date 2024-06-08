/** @returns {Promise<import("jest").Config>} */
module.exports = async () => {
  return {
    verbose: true,
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js"],
    collectCoverage: true,
    coverageDirectory: "./.coverage",
    coverageReporters: ["json", "html"],
  };
};

