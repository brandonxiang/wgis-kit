import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    ignorePatterns: [],
    indent: {
      type: 'space',
      size: 2,
    },
    lineWidth: 120,
    semi: false,
    quotes: 'single',
    trailingCommas: 'always',
  },
  lint: {
    plugins: null,
    categories: {},
    rules: {
      'no-unused-vars': 'warn',
      eqeqeq: 'error',
      yoda: 'off',
    },
    ignorePatterns: ['node_modules/', 'dist/', 'types/', '*.min.js'],
    settings: {
      'jsx-a11y': {
        polymorphicPropName: null,
        components: {},
        attributes: {},
      },
      next: {
        rootDir: [],
      },
      react: {
        formComponents: [],
        linkComponents: [],
        version: null,
        componentWrapperFunctions: [],
      },
      jsdoc: {
        ignorePrivate: false,
        ignoreInternal: false,
        ignoreReplacesDocs: true,
        overrideReplacesDocs: true,
        augmentsExtendsReplacesDocs: false,
        implementsReplacesDocs: false,
        exemptDestructuredRootsFromChecks: false,
        tagNamePreference: {},
      },
      vitest: {
        typecheck: false,
      },
    },
    env: {
      browser: true,
      builtin: true,
    },
    globals: {
      defineProps: 'readonly',
    },
    options: {
      typeAware: false,
      typeCheck: false,
    },
  },
});
