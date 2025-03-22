module.exports = {
  extends: ['universe/native'],
  rules: {
    // Disable rules related to import sequence/order
    'import/order': 'off',
    'import/first': 'off',
    'import/no-duplicates': 'off',
    'sort-imports': 'off',
  },
};
