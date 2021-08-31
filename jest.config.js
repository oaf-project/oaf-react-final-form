module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "collectCoverage": true,
  "testEnvironment": "jsdom",
  "coverageThreshold": {
    "global": {
      "branches": 85,
      "functions": 95,
      "lines": 96,
      "statements": 96
    }
  },
  // We mess with globals (window, document) in the tests so
  // this keeps them from interfering with each other.
  "maxConcurrency": 1
}
