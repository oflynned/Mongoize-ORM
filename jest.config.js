process.env.NODE_ENV = "test";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/example/**/*", "!src/logger/**/*"],
  moduleFileExtensions: ["ts", "js", "json"],
  coverageDirectory: "./coverage",
  testMatch: ["**/*.{unit,integration}.ts"],
  verbose: true
};
