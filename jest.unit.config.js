const config = require("./jest.base.config");
config.testMatch = ["**/*.unit.ts"];

console.info("Running unit tests ...\n");

module.exports = config;
