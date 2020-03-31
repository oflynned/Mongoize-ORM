const config = require("./jest.config");
config.testMatch = ["**/*.unit.ts"];

console.info("Running unit tests ...\n");

module.exports = config;
