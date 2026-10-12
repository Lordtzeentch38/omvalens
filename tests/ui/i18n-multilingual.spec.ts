// Added by OmvaLens, 2026-10-12: selectable locale coverage and layout checks. AGPL-3.0.
import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { SUPPORTED_LOCALES } from "../../src/i18n/config";
import { installDesktopBridge, installDesktopBridgeOverrides } from "./bridge";
const keys: Record<string, string> = JSON.parse(
	fs.readFileSync("src/i18n/uiTextKeys.json", "utf8"),
);

for (const locale of SUPPORTED_LOCALES) {
	test(`${locale}: dashboard, credits, GIF presets, dynamic errors and persistence`, async ({
		page,
	}) => {
		test.setTimeout(90000);
		const common = JSON.parse(
			fs.readFileSync(`src/i18n/locales/${locale}/common.json`, "utf8"),
		);
		const editor = JSON.parse(
			fs.readFileSync(`src/i18n/locales/${locale}/editor.json`, "utf8"),
		);
		const settings = JSON.parse(
			fs.readFileSync(`src/i18n/locales/${locale}/settings.json`, "utf8"),
		);
		const ui = (source: string) =>
			common.ui[(keys as Record<string, string>)[source]] ?? source;
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await installDesktopBridge(page);
		await page.addInitScript(
			(locale) => localStorage.setItem("recordly.locale", locale),
			locale,
		);
		await installDesktopBridgeOverrides(page, () => {
			window.electronAPI.onCloudShareProgress = () => () => undefined;
			window.electronAPI.exportPortableProject = async () => ({
				success: false,
				error: "Missing or empty media: C:\\Film\\My {{draft}}.mp4",
			});
		});
		await page.goto("/?windowType=editor");
		await expect(page.locator("html")).toHaveAttribute("lang", locale);
		await expect(page.locator("html")).toHaveAttribute("data-project-creates", "1");
		await page
			.getByRole("button", { name: editor.project.portableExport, exact: true })
			.click();
		await expect(
			page.getByText(
				ui("Missing or empty media: {{value1}}").replace(
					"{{value1}}",
					"C:\\Film\\My {{draft}}.mp4",
				),
				{ exact: true },
			),
		).toBeVisible();
		await page.getByRole("button", { name: ui("Home"), exact: true }).click();
		const dashboard = page.getByRole("dialog", { name: ui("Projects dashboard") });
		await expect(dashboard.getByPlaceholder(ui("Search projects…"))).toBeVisible();
		await dashboard.getByRole("button", { name: ui("New folder"), exact: true }).click();
		await expect(dashboard.getByText(ui("Untitled folder"), { exact: true })).toBeVisible();
		await dashboard.screenshot({
			path: `.tmp/c08-ui/${locale}-dashboard.png`,
			animations: "disabled",
		});
		await dashboard.getByRole("button", { name: common.credits.trigger }).click();
		const credits = page.getByRole("dialog", { name: "OmvaLens", exact: true });
		await expect(
			credits.getByRole("button", { name: common.credits.originalProject }),
		).toBeVisible();
		await expect(credits.getByText(common.credits.upstream, { exact: true })).toBeVisible();
		await credits.screenshot({
			path: `.tmp/c08-ui/${locale}-credits.png`,
			animations: "disabled",
		});
		await credits.getByRole("button", { name: ui("Close"), exact: true }).click();
		await page.reload();
		await expect(page.locator("html")).toHaveAttribute("lang", locale);
		await page.getByRole("button", { name: ui("Publish"), exact: true }).click();
		await page.getByRole("row", { name: ui("Local"), exact: true }).click();
		await expect(
			page.getByRole("grid", { name: settings.export.format, exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("grid", { name: settings.export.encodingTitle, exact: true }),
		).toBeVisible();
		await page.getByRole("row", { name: "GIF", exact: true }).click();
		await expect(
			page.getByRole("grid", { name: settings.export.size, exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("row", { name: ui("Medium (720p)"), exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("row", { name: ui("Large (1080p)"), exact: true }),
		).toBeVisible();
		await page.screenshot({ path: `.tmp/c08-ui/${locale}-gif.png`, animations: "disabled" });
		await page.reload();
		await expect(page.locator("html")).toHaveAttribute("lang", locale);
		expect(errors).toEqual([]);
	});
}
