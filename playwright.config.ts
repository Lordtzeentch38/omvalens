// Modified by the ScreenRecorder fork, 2026-10-10. See FORK_CHANGES.md; AGPL-3.0.
import { defineConfig } from "@playwright/test";
export default defineConfig({
	testDir: "./tests/ui",
	timeout: 30000,
	expect: { timeout: 15000 },
	use: {
		baseURL: "http://127.0.0.1:5178",
		viewport: { width: 1440, height: 1000 },
		trace: "retain-on-failure",
	},
	webServer: {
		env: { RECORDLY_RENDERER_ONLY: "1" },
		command: "npx vite --host 127.0.0.1 --port 5178 --strictPort",
		url: "http://127.0.0.1:5178",
		reuseExistingServer: !process.env.CI,
	},
});
