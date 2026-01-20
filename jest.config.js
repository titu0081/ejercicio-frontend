module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testMatch: ["**/+(*.)+(spec).+(ts)"],
  transform: {
    "^.+\\.(ts|js|html|svg)$": [
      "jest-preset-angular",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
        stringifyContentPathRegex: "\\.(html|svg)$",
        isolatedModules: true,
        useESM: true,
      },
    ],
  },
  moduleFileExtensions: ["ts", "html", "js", "json", "mjs"],
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["node_modules/(?!.*\\.mjs$|@angular|rxjs|tslib)"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text-summary"],
  resolver: "jest-preset-angular/build/resolvers/ng-jest-resolver.js",
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};
