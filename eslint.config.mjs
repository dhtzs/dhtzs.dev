import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

import js from "@eslint/js";
import css from "@eslint/css";
import { tailwind4 } from "tailwind-csstree";
import markdown from "@eslint/markdown";
import json from "@eslint/json";

export default defineConfig([
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
    plugins: { js },
    files: ["**/*.js"],
    extends: ["js/recommended"]
  },
  {
    plugins: { css },
    files: ["**/*.css"],
    language: "css/css",
    languageOptions: {
      tolerant: true,
      customSyntax: tailwind4
    },
    extends: ["css/recommended"],
    rules: {
      "css/no-invalid-properties": "off"
    }
  },
  {
    plugins: { json },
    files: ["**/*.json"],
    language: "json/json",
    extends: ["json/recommended"],
    ignores: ["layouts/**"]
  },
  {
    plugins: { markdown },
    files: ["**/*.md"],
    language: "markdown/commonmark",
    languageOptions: {
      frontmatter: "yaml"
    },
    extends: ["markdown/recommended"],
    rules: {
      "markdown/no-missing-label-refs": "off"
    }
  },
  globalIgnores(["public/", "resources/", "themes/", "package-lock.json", "backup/"])
]);
