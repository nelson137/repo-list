import eslint from '@eslint/js';
import svelte_eslint from 'eslint-plugin-svelte';
import globals from 'globals';
import svelte_eslint_parser from 'svelte-eslint-parser';
import ts_eslint from 'typescript-eslint';

export default ts_eslint.config(
    {
        ignores: [
            '.svelte-kit/**',
            '.DS_Store',
            'build/**',
            'coverage/**',
            'environments/**/*',
            '!environments/.env.example',
            'node_modules/**',
            // Ignore files for PNPM, NPM and YARN
            'pnpm-lock.yaml',
            'package-lock.json',
            'yarn.lock',
        ],
    },
    eslint.configs.recommended,
    ...ts_eslint.configs.recommended,
    ...svelte_eslint.configs['flat/recommended'],
    ...svelte_eslint.configs['flat/prettier'],
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: ts_eslint.parser,
            parserOptions: {
                project: true,
                extraFileExtensions: ['.svelte'],
            },
        },
        plugins: {
            '@typescript-eslint': ts_eslint.plugin,
        },
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parser: svelte_eslint_parser,
            parserOptions: {
                project: true,
                extraFileExtensions: ['.svelte'],
                parser: ts_eslint.parser,
            },
        },
        plugins: {
            '@typescript-eslint': ts_eslint.plugin,
            svelte: svelte_eslint,
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '(^_)|(^\\$\\$Props$)',
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
);
