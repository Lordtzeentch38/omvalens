// Added by the OmvaLens fork, 2026-10-10. AGPL-3.0; see FORK_CHANGES.md.
import { expect, test } from "@playwright/test";
import { installDesktopBridge } from "./bridge";

test("OmvaLens identity is displayed while upstream attribution remains in credits", async ({
	page,
}) => {
	await installDesktopBridge(page);
	await page.goto("/?windowType=editor");
	await expect(page).toHaveTitle("OmvaLens Editor");
	await page.getByRole("button", { name: "Home", exact: true }).click();
	const home = page.getByRole("dialog", { name: "Projects dashboard" });
	await expect(home.getByText("OmvaLens", { exact: true })).toBeVisible();
	const icon = home.locator('img[src*="omvalens-64.png"]');
	await expect(icon).toBeVisible();
	await expect
		.poll(() => icon.evaluate((element) => (element as HTMLImageElement).naturalWidth))
		.toBe(64);
	await expect(home).not.toContainText("Recordly");
	await home.getByRole("button", { name: "About and credits" }).click();
	const credits = page.getByRole("dialog", { name: "OmvaLens", exact: true });
	await expect(credits).toBeVisible();
	await expect(credits).toContainText("Based on Recordly by webadderallorg and contributors");
	await expect(credits).toContainText("GNU AGPLv3");
	await expect(credits).toContainText("portable projects");
	await expect.poll(() => credits.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
	await credits.screenshot({ path: "test-results/omvalens-credits.png", animations: "disabled" });
	await credits.getByRole("button", { name: "Close", exact: true }).click();
	await expect(credits).not.toBeVisible();
});
