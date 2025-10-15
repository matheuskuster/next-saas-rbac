/** @type {import("prettier").Config} */
module.exports = {
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  bracketSameLine: false,
  plugins: ['prettier-plugin-tailwindcss'],
}

