import { eslintConfig } from "@robot-inventor/eslint-config";

export default [
    {
        ignores: [
            "**/*.test.ts"
        ]
    },
    ...eslintConfig,
];
