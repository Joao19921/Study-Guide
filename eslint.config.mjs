import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Vendored shadcn/ui primitives and template hooks predate the stricter
    // React Compiler lint rules (set-state-in-effect, purity) and use `any`
    // in a few generic utility signatures — relax those here instead of
    // editing vendored code, while keeping the rules strict for app code.
    files: ["src/components/ui/**", "src/components/ManusDialog.tsx", "src/hooks/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
]);

export default eslintConfig;
