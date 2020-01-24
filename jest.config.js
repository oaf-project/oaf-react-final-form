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
      "branches": 90.58,
      "functions": 93.55,
      "lines": 96.76,
      "statements": 96.34
    }
  }
}
