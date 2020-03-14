module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
  collectCoverage: true,
  collectCoverageFrom: ["./src/"],
  moduleFileExtensions: ["ts", "js", "json"],
  coverageDirectory: "./coverage",
  testMatch: ["**/*.unit.ts"],
  verbose: true
};
