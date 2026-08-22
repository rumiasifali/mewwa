import { defineConfig } from "@playwright/test";

// Smoke suite runs against a production server: `npm run build` first,
// then `npm run test:e2e` (the webServer below boots `next start`).
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3199",
  },
  webServer: {
    command: "npm run start -- -p 3199",
    url: "http://localhost:3199",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
