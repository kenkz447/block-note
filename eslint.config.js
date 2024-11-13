import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tsEslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'

export default tsEslint.config(
    { ignores: ['dist', 'build'] },
    {
        extends: [
            js.configs.recommended,
            ...tsEslint.configs.recommended
        ],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'only-warn': onlyWarn,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'semi': "warn",
            'indent': ['warn', 4],
            'quotes': ['warn', 'single'],
            'jsx-quotes': ['warn', 'prefer-double'],
            'eol-last': ['warn', 'always'],
        },
    },
)
