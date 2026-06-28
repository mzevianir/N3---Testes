const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",

  transform: {
    ...tsJestTransformCfg
  },

  // O Jest deve procurar somente testes unitários dentro de src
  roots: ["<rootDir>/src"],

  // Executa somente arquivos terminados em .test.ts
  testMatch: ["**/*.test.ts"],

  // Ignora arquivos compilados
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],

  clearMocks: true
};