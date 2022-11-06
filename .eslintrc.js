module.exports = {
  /* 指定如何解析语法。*/
  parser: 'vue-eslint-parser',
  /* 优先级低于parse的语法解析配置 */
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // typescript-eslint推荐规则
    'prettier',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    // 禁止使用 var
    'no-var': 'error',
    // 使用结尾分号
    semi: 'off',
    'no-case-declarations': 'off',
    // 优先使用 interface 而不是 type
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-this-alias': 'off',
  },
  overrides: [
    {
      files: ['**/electron/**.[jt]s', 'scripts/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
