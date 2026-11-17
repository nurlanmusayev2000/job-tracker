import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Understand the "@/..." import alias from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    // jsdom gives the tests a browser-like document to render into.
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Unit and component tests live next to the code. The Playwright test in
    // e2e/ is run separately with `npm run test:e2e`.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
