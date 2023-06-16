/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  root: true,
  extends: ["prettier"],
  rules: {
    "no-unexpected-multiline": "warn",
    "react/display-name": "off",
    semi: 0,
    "react/no-unescaped-entities": 0,
  },
};
