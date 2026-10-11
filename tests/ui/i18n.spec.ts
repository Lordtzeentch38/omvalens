// Added by OmvaLens, 2026-10-11. AGPL-3.0; see FORK_CHANGES.md.
import { expect, test } from "@playwright/test";
import { installDesktopBridge } from "./bridge";

test.beforeEach(async ({ page }) => {
	await installDesktopBridge(page);
	await page.addInitScript(() => {
		if (!localStorage.getItem("recordly.locale")) localStorage.setItem("recordly.locale", "it");
	});
});

test("Italian dashboard, folder names and credits are localized", async ({ page }) => {
	await page.goto("/?windowType=editor");
	await page.getByRole("button", { name: "Home", exact: true }).click();
	const dashboard = page.getByRole("dialog", { name: "Raccolta dei progetti" });
	await expect(dashboard.getByPlaceholder("Cerca progetti…")).toBeVisible();
	await expect(dashboard.getByRole("button", { name: "Ultimi 7 giorni" })).toBeVisible();
	await dashboard.getByRole("button", { name: "Nuova cartella", exact: true }).click();
	await expect(dashboard.getByText("Cartella senza nome", { exact: true })).toBeVisible();
	await dashboard.getByRole("button", { name: "Informazioni e crediti" }).click();
	const credits = page.getByRole("dialog", { name: "OmvaLens", exact: true });
	await expect(credits.getByText(/Basato su Recordly/)).toBeVisible();
	await expect(credits.getByRole("button", { name: "Progetto originale" })).toBeVisible();
	await expect
		.poll(() => credits.evaluate((element) => getComputedStyle(element).opacity))
		.toBe("1");
	await credits.screenshot({ path: "test-results/italiano-crediti.png", animations: "disabled" });
	await credits.getByRole("button", { name: "Chiudi", exact: true }).click();
	await dashboard.getByRole("button", { name: "Impostazioni", exact: true }).click();
	await dashboard.getByRole("row", { name: "Registrazione", exact: true }).click();
	await expect(dashboard.getByRole("button", { name: "Cambia cartella" })).toBeVisible();
	await dashboard.screenshot({
		path: "test-results/italiano-impostazioni.png",
		animations: "disabled",
	});
});

test("the language selector changes the live interface and persists after reload", async ({
	page,
}) => {
	await page.goto("/?windowType=editor");
	await page.getByRole("radio", { name: "Impostazioni", exact: true }).click();
	await page.getByRole("button", { name: "Italiano Lingua", exact: true }).click();
	await page.getByRole("option", { name: "English", exact: true }).click();
	await expect(page.getByRole("button", { name: "Show onboarding" })).toBeVisible();
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
	await page.getByRole("button", { name: "Home", exact: true }).click();
	await expect(page.getByRole("dialog", { name: "Projects dashboard" })).toBeVisible();
});

test("Italian feature tour translates all steps and preserves the chosen language", async ({
	page,
}) => {
	await page.goto("/?windowType=editor");
	await page.getByRole("radio", { name: "Impostazioni", exact: true }).click();
	await page.getByRole("button", { name: "Mostra guida iniziale" }).click();
	const tour = page.getByRole("dialog", { name: "Benvenuto in OmvaLens" });
	await expect(tour.getByText("Accedi per iniziare", { exact: true })).toBeVisible();
	await expect(
		tour.getByRole("button", { name: "Inviami un collegamento di accesso" }),
	).toBeVisible();
	await tour.screenshot({ path: "test-results/italiano-accesso.png", animations: "disabled" });
	await tour.getByRole("button", { name: "Continua senza accedere" }).click();
	await expect(tour.getByRole("heading", { name: "Inizia da un momento." })).toBeVisible();
	await tour.getByRole("button", { name: "Avanti", exact: true }).click();
	await expect(tour.getByRole("heading", { name: "Dagli il tuo stile." })).toBeVisible();
	await tour.getByRole("button", { name: "Avanti", exact: true }).click();
	await expect(tour.getByRole("heading", { name: "Pronto quando vuoi." })).toBeVisible();
	await tour.getByRole("button", { name: "Inizia", exact: true }).click();
	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("lang", "it");
	await expect(page.getByRole("button", { name: "Home", exact: true })).toBeVisible();
});

test("another window changing language updates the dashboard without losing a search", async ({
	page,
}) => {
	await page.goto("/?windowType=editor");
	await page.getByRole("button", { name: "Home", exact: true }).click();
	const search = page.getByPlaceholder("Cerca progetti…");
	await search.fill("My project");
	await page.evaluate(() => {
		localStorage.setItem("recordly.locale", "en");
		window.dispatchEvent(
			new StorageEvent("storage", { key: "recordly.locale", newValue: "en" }),
		);
	});
	await expect(page.getByRole("dialog", { name: "Projects dashboard" })).toBeVisible();
	await expect(page.getByPlaceholder("Search projects…")).toHaveValue("My project");
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
