module.exports = {
  packageManager: "yarn",
  reporters: ["clear-text", "progress", "dashboard"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  // TODO why doesn't this work?
  // checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  // TODO: re-enable tsx mutation
  mutate: ["src/**/*.ts", "!src/**/*.tsx", "!src/**/*.test.ts", "!src/**/*.test.tsx"],
  thresholds: { high: 80, low: 60, break: 65 }
};
