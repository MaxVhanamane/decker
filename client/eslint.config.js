import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { fixupConfigRules } from "@eslint/compat";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactJsxRuntimeConfig from "eslint-plugin-react/configs/jsx-runtime.js";

export default [
    {
        ignores: ["dev-dist/**"],
    },
    // Apply the recommended configurations to TS and TSX files within the src directory
    {
        files: ["src/**/*.{ts,tsx}"],


        languageOptions: {
            globals: {
                ...globals.browser, "React": "writable", "NodeJS": "writable", "RequestCredentials": "readonly",
            },
            parser: tsParser,
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        settings: { react: { version: "detect" } },
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            ...fixupConfigRules(pluginReactConfig).rules,
            ...fixupConfigRules(pluginReactJsxRuntimeConfig).rules,
            "@typescript-eslint/no-explicit-any": "off",
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            "no-redeclare": "off",
            "@typescript-eslint/no-redeclare": ["error"]

        },
    },
];


