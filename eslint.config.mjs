import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  { ignores: [".next/**", "node_modules/**", "public/**", "src/assets/**", "test-results/**", "playwright-report/**", "next-env.d.ts"] },
  {
    rules: {
      "no-console": "error",
      "react-hooks/rules-of-hooks": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "off",
      // React Compiler advice that flags existing template-era code (11 places, all
      // working). Warnings until those components are rebuilt; new code should pass them.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  { files: ["src/lib/logger.ts", "tests/**"], rules: { "no-console": "off" } },
];

export default config;
