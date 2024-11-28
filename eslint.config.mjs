import js from "@eslint/js";
import css from "@eslint/css";
import json from "@eslint/json";
import markdown from "@eslint/markdown";

import html from "eslint-plugin-html";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  eslintConfigPrettier,
  {
    ignores: ["public/", "resources/", "themes/"]
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
        ...globals.builtin,
        ...globals.amd,
        ...globals.browser,
        ...globals.serviceworker
      }
    }
  },
  {
    files: ["**/*.html"],
    plugins: { html }
  },
  {
    files: ["**/*.js"],
    ...js.configs.recommended
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    ...css.configs.recommended,
    rules: {
      "no-invalid-properties": "off"
		}
  },
  {
    files: ["**/*.json"],
    language: "json/json",
    plugins: { json },
    ignores: ["package-lock.json", "package.json"],
    ...json.configs.recommended,
  },
  {
    files: ["**/*.md"],
    plugins: { markdown }
  }
];