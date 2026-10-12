// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { expect, test } from "@playwright/test";
import { installDesktopBridge } from "./bridge";

test("hardware settings report capabilities and defer CPU mode until restart", async ({ page }) => {
	await installDesktopBridge(page);
	await page.addInitScript(() => {
		localStorage.setItem("recordly.locale", "it");
		const oldGet = window.electronAPI.getAppSetting;
		window.electronAPI.getAppSetting = (key) =>
			key === "omvalens.hardwareMode.active"
				? "auto"
				: key === "omvalens.hardwareMode"
					? localStorage.getItem(key)
					: oldGet(key);
		window.electronAPI.setAppSetting = (key, value) => {
			localStorage.setItem(key, String(value));
			return true;
		};
		window.electronAPI.getHardwareCapabilities = async () => ({
			activeMode: "auto",
			selectedMode: "auto",
			graphics: "gpu",
			devices: ["Test GPU"],
			videoEncoder: "h264_nvenc",
			whisperRuntime: "cuda",
			errors: [],
		});
	});
	await page.goto("/?windowType=editor");
	await page.getByRole("radio", { name: "Impostazioni", exact: true }).click();
	const panel = page.getByRole("region", { name: "Accelerazione hardware", exact: true });
	await panel.getByRole("button", { name: "Controlla hardware" }).click();
	await expect(panel.getByText("Test GPU", { exact: true })).toBeVisible();
	await expect(panel.getByText("Codifica video: h264_nvenc")).toBeVisible();
	await panel.getByRole("switch", { name: "Accelerazione hardware" }).focus();
	await page.keyboard.press("Space");
	await expect(
		panel.getByText("Chiudi e riapri OmvaLens per applicare questa modifica."),
	).toBeVisible();
	await page.reload();
	await page.getByRole("radio", { name: "Impostazioni", exact: true }).click();
	await expect(
		page.getByRole("switch", { name: "Accelerazione hardware", exact: true }),
	).not.toBeChecked();
});
