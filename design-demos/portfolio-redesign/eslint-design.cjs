module.exports = {
 root: true,
 parser: require.resolve('@typescript-eslint/parser', { paths: [require('node:path').resolve(__dirname, '../../client')] }),
 parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
 plugins: ['@typescript-eslint', 'react-hooks'],
 extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
 env: { browser: true, es2022: true },
 rules: { '@typescript-eslint/no-explicit-any': 'off' },
};
