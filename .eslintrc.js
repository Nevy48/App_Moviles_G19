module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: false }],
    'no-unused-vars': 'warn',
    'react-native/sort-styles': 'off',
  },
};