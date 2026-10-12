// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { expect, test } from "@playwright/test";
import { installDesktopBridge, installDesktopBridgeOverrides } from "./bridge";
test.beforeEach(async ({ page }) => {
	await installDesktopBridge(page);
	await page.addInitScript(() => localStorage.setItem("recordly.locale", "it"));
});
test("Italian GIF export presets display localized names", async ({ page }) => {
	await installDesktopBridgeOverrides(page, () => {
		window.electronAPI.onCloudShareProgress = () => () => {};
	});
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/?windowType=editor");
	await page.getByRole("button", { name: "Pubblica", exact: true }).click();
	await page.getByRole("row", { name: "Locale", exact: true }).click();
	await page.getByRole("row", { name: "GIF", exact: true }).click();
	await expect(page.getByRole("row", { name: "Medio (720p)", exact: true })).toBeVisible();
	await expect(page.getByRole("row", { name: "Grande (1080p)", exact: true })).toBeVisible();
	await expect(page.getByRole("row", { name: "Originale", exact: true })).toBeVisible();
	expect(errors).toEqual([]);
});
test("portable export translates the error while preserving a user filename", async ({ page }) => {
	await installDesktopBridgeOverrides(page, () => {
		window.electronAPI.exportPortableProject = async () => ({
			success: false,
			error: "Error: Missing or empty media: C:\\Film\\My {{title}}.mp4",
		});
	});
	await page.goto("/?windowType=editor");
	await expect(page.locator("html")).toHaveAttribute("data-project-creates", "1");
	await page.getByRole("button", { name: "Progetto portabile", exact: true }).click();
	await expect(
		page.getByText(
			"Errore: Contenuto multimediale mancante o vuoto: C:\\Film\\My {{title}}.mp4",
			{ exact: true },
		),
	).toBeVisible();
});
test("recording library shows a translated static IPC failure", async ({ page }) => {
	await installDesktopBridgeOverrides(page, () => {
		window.electronAPI.listRecordings = async () => ({
			success: false,
			error: "Recording is outside the Videos library",
		});
	});
	await page.goto("/?windowType=editor");
	await page.getByRole("button", { name: "Home", exact: true }).click();
	await page.getByRole("button", { name: "Originali", exact: true }).click();
	await expect(
		page.getByText("Errore: La registrazione si trova fuori dalla libreria Video", {
			exact: true,
		}),
	).toBeVisible();
});
