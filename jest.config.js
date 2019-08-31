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
      "branches": 61.76,
      "functions": 70,
      "lines": 80.38,
      "statements": 80.61
    }
  }
}
