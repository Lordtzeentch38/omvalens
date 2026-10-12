// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { afterEach, expect, it, vi } from "vitest";
import { currentAppMessage, translateAppMessage } from "./appMessage";
afterEach(() => vi.unstubAllGlobals());
it("localizes known IPC errors, including Error.toString wrappers", () => {
	expect(translateAppMessage("it", "Error: Invalid project structure")).toBe(
		"Errore: Struttura del progetto non valida",
	);
});
it("preserves paths, punctuation, braces and multiline values in dynamic messages", () => {
	const file = "C:\\Video\\My {{title}} [draft].mp4\nsecond line";
	expect(translateAppMessage("it", `Missing or empty media: ${file}`)).toBe(
		`Contenuto multimediale mancante o vuoto: ${file}`,
	);
});
it("translates a preflight list while retaining unknown diagnostics", () => {
	expect(
		translateAppMessage("it", "Archive is damaged\nCUDA_ERROR_999\nProject media is empty"),
	).toBe(
		"L'archivio è danneggiato\nCUDA_ERROR_999\nUn contenuto multimediale del progetto è vuoto",
	);
});
it("does not translate filenames, editable content or unknown driver diagnostics", () => {
	for (const source of [
		"C:\\Projects\\Archive is damaged.mp4",
		"My {{film}}",
		"NVENC: 0x001 driver failure",
	])
		expect(translateAppMessage("it", source)).toBe(source);
});
it("keeps dynamic English and unspecified locales readable", () => {
	expect(translateAppMessage("en", "Generated 12 caption cues.")).toBe(
		"Generated 12 caption cues.",
	);
	expect(translateAppMessage("unknown", "Project video file not found: /video.mp4")).toBe(
		"Project video file not found: /video.mp4",
	);
});
it("uses a new locale after the preference changes and keeps supplied values verbatim", () => {
	let locale = "it";
	vi.stubGlobal("window", { localStorage: { getItem: () => locale } });
	expect(currentAppMessage("Generated 12 caption cues.")).toBe("Generati 12 sottotitoli.");
	locale = "en";
	expect(currentAppMessage("Generated 12 caption cues.")).toBe("Generated 12 caption cues.");
	expect(
		translateAppMessage("it", "Preview of {{value1}}", { value1: "Original {{draft}}" }),
	).toBe("Anteprima di Original {{draft}}");
});
it("preserves large codec logs without template matching", () => {
	const log = `VideoDecoder error: ${"x".repeat(40000)}`;
	expect(translateAppMessage("it", log)).toBe(log);
});
