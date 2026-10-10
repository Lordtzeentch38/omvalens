// Modified by the ScreenRecorder fork, 2026-10-10. See FORK_CHANGES.md; AGPL-3.0.
import { expect, test } from "@playwright/test";
import { installDesktopBridge, installDesktopBridgeOverrides } from "./bridge";

test("portable export captures the current editor state and prevents duplicate requests", async ({
	page,
}) => {
	await installDesktopBridge(page);
	await installDesktopBridgeOverrides(page, () => {
		window.electronAPI.exportPortableProject = async (project, name) => {
			document.documentElement.dataset.portablePayload = JSON.stringify(project);
			document.documentElement.dataset.portableName = name;
			document.documentElement.dataset.portableCalls = String(
				Number(document.documentElement.dataset.portableCalls || "0") + 1,
			);
			await new Promise<void>((resolve) =>
				window.addEventListener("finish-portable", () => resolve(), { once: true }),
			);
			return { success: true, path: "/exports/demo.screenrecorder" };
		};
	});
	await page.goto("/?windowType=editor");
	await expect(page.locator("html")).toHaveAttribute("data-project-creates", "1");
	await page.getByRole("button", { name: "Portable project", exact: true }).click();
	await expect(page.getByRole("button", { name: "Packaging…", exact: true })).toBeDisabled();
	await expect(page.locator("html")).toHaveAttribute("data-portable-calls", "1");
	const payload = await page.evaluate(() =>
		JSON.parse(document.documentElement.dataset.portablePayload!),
	);
	expect(payload.version).toBe(2);
	expect(payload.videoPath).toContain("preview.mp4");
	expect(payload.editor).toHaveProperty("clipRegions");
	await page.screenshot({ path: "test-results/portable-project.png", animations: "disabled" });
	await page.evaluate(() => window.dispatchEvent(new Event("finish-portable")));
	await expect(page.getByRole("button", { name: "Portable project", exact: true })).toBeEnabled();
	await expect(page.getByText("Portable project exported", { exact: true })).toBeVisible();
});

test("canceling the archive picker returns to the editor without success or error", async ({
	page,
}) => {
	await installDesktopBridge(page);
	await installDesktopBridgeOverrides(page, () => {
		window.electronAPI.exportPortableProject = async () => ({ success: false, canceled: true });
	});
	await page.goto("/?windowType=editor");
	await expect(page.locator("html")).toHaveAttribute("data-project-creates", "1");
	await page.getByRole("button", { name: "Portable project", exact: true }).click();
	await expect(page.getByRole("button", { name: "Portable project", exact: true })).toBeEnabled();
	await expect(page.getByText("Portable project exported", { exact: true })).toHaveCount(0);
});
