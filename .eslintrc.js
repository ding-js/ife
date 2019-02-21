module.exports = {
  root: true,
  extends: ['plugin:vue/essential', '@vue/prettier', '@vue/typescript'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },

  overrides: [
    {
      files: ['**/tests/unit/**/*.spec.{js,jsx,ts,tsx}', '**/__tests__/*.{js,jsx,ts,tsx}'],
      env: {
        jest: true
      }
    }
  ]
};
