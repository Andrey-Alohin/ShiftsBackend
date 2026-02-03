import js from '@eslint/js';
import globals, { node } from 'globals';
import { defineConfig } from 'eslint/config';
import pluginJS from '@eslint/js';

export default defineConfig([
  pluginJS.configs.recommended,
  {
    files: ['src/**?*js'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      semi: 'error',
      'no-unused-vars': ['error', { args: 'none' }],
      'no-undef': 'error',
    },
  },
]);
