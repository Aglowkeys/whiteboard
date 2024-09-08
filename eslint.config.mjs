import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { files: ['./scripts/*.{js,mjs,cjs,ts}'] },
  { ignores: ['**/build/*', 'esbuild.config.mjs', 'tsconfig.json'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
