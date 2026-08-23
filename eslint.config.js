// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // El alias @/ lo resuelve TypeScript desde tsconfig; se evita un falso positivo del resolver de ESLint en VS Code.
      "import/no-unresolved": "off",
    },
  },
]);
