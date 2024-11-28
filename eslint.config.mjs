import js from "@eslint/js";
import css from "@eslint/css";

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
    plugins: { html },
    files: ["**/*.html"]
  },
  {
    plugins: { js },
    files: ["**/*.js"],
    ...js.configs.recommended
  },
  {
    plugins: { css },
    files: ["**/*.css"],
    ...css.configs.recommended,
    rules: {
      "no-invalid-properties": "off"
		}
  }
];