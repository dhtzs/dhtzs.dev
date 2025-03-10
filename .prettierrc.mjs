/** @type {import("prettier").Config} */
export default {
  "printWidth": Infinity,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "objectWrap": "preserve",
  "bracketSameLine": true,
  "arrowParens": "avoid",
  "rangeStart": 0,
  "rangeEnd": Infinity,
  "requirePragma": false,
  "insertPragma": false,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "ignore",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",
  "singleAttributePerLine": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
