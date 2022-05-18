module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "quote-props": [1, "as-needed"],
    quotes: [0, "double"],
    "import/no-unresolved": 0,
    "object-curly-spacing": [2, "always"],
    indent: "off",
    camelcase: [0],
    "@typescript-eslint/ban-ts-ignore": "off",
    "max-len": ["error", { code: 1000 }],
  },
  files: ["types.d.ts"],
};
