import js from "@eslint/js";
import html from "eslint-plugin-html";
import globals from "globals";

export default [
  js.configs.recommended,
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
  }
];