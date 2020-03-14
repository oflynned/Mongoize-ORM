const config = require("./jest.base.config");
config.testMatch = ["**/*.integration.ts"];

console.info("Running integration tests ...\n");

module.exports = config;
