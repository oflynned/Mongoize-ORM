const { resolve } = require('path');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['./src'],
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: ['./src/'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    coverageDirectory: './coverage',
    testMatch: ['**/*.{unit,test,spec,integration,e2e}.ts'],
    verbose: true,
};
