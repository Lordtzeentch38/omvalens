// Added by OmvaLens, 2026-10-11. AGPL-3.0; see FORK_CHANGES.md.
import { afterEach, describe, expect, it, vi } from "vitest";
import { currentUiText, translateCatalogText } from "./catalogText";

afterEach(() => vi.unstubAllGlobals());
describe("catalogued interface messages", () => {
	it("keeps unknown diagnostics and proper names unchanged", () => {
		expect(translateCatalogText("it", "C:\\Projects\\My film.mp4")).toBe(
			"C:\\Projects\\My film.mp4",
		);
		expect(translateCatalogText("it", "OmvaLens")).toBe("OmvaLens");
		expect(translateCatalogText("unknown", "Continue without signing in")).toBe(
			"Continue without signing in",
		);
	});
	it("interpolates names verbatim, including punctuation and placeholder-like user data", () => {
		expect(translateCatalogText("it", "Remove {{value1}}", { value1: "My {{film}}.mp4" })).toBe(
			"Rimuovi My {{film}}.mp4",
		);
		expect(translateCatalogText("it", "Generated {{value1}} captions", { value1: 12 })).toBe(
			"Generati 12 sottotitoli",
		);
	});
	it("notifications read the current preference instead of retaining the startup language", () => {
		let locale = "it";
		vi.stubGlobal("window", { localStorage: { getItem: () => locale } });
		expect(currentUiText("No video loaded")).toBe("Nessun video caricato");
		locale = "en";
		expect(currentUiText("No video loaded")).toBe("No video loaded");
	});
});
