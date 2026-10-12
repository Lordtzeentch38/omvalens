// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { expect, it } from "vitest";
import { announcementImageSource } from "./announcementImage";
import { translateCatalogText } from "./catalogText";
it("translates both bundled illustrations without changing their geometry", () => {
	for (const [file, expected] of [
		["placeholder-1.svg", "Spazio alle novità."],
		["placeholder-2.svg", "Altro da scoprire."],
	]) {
		const result = announcementImageSource(`announcements/${file}`, (text) =>
			translateCatalogText("it", text),
		);
		const svg = decodeURIComponent(result.split(",")[1]);
		expect(svg).toContain(expected);
		expect(svg).toContain('viewBox="0 0 1440 240"');
	}
});
it("escapes translated SVG text and preserves external announcement images", () => {
	const result = announcementImageSource("announcements/placeholder-1.svg", () => '<script>&"');
	expect(decodeURIComponent(result.split(",")[1])).toContain("&lt;script&gt;&amp;&quot;");
	expect(announcementImageSource("https://example.com/banner.svg", () => "ignored")).toBe(
		"https://example.com/banner.svg",
	);
});
