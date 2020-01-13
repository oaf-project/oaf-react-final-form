module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "collectCoverage": true,
  "coverageThreshold": {
    "global": {
      "branches": 75,
      "functions": 77.42,
      "lines": 85.48,
      "statements": 85.42
    }
  }
}
