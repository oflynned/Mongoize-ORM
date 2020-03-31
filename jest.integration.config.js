const config = require("./jest.config");
config.testMatch = ["**/*.integration.ts"];

console.info("Running integration tests ...\n");

module.exports = config;
