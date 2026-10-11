// Added by OmvaLens, 2026-10-11. AGPL-3.0; see FORK_CHANGES.md.
import { beforeEach, expect, it, vi } from "vitest";
import { nativeText } from "./nativeI18n";

const preference = vi.hoisted(() => ({ saved: null as unknown, system: "en-US" }));
vi.mock("electron", () => ({ app: { getLocale: () => preference.system } }));
vi.mock("./appSettingsStore", () => ({ readAppSetting: () => preference.saved }));
beforeEach(() => {
	preference.saved = null;
	preference.system = "en-US";
});

it("native dialogs follow the app preference even on an English operating system", () => {
	preference.saved = "it";
	expect(nativeText("Open OmvaLens Project")).toBe("Apri progetto OmvaLens");
	expect(nativeText("Discard & Close")).toBe("Ignora modifiche e chiudi");
	preference.saved = "en";
	expect(nativeText("Open OmvaLens Project")).toBe("Open OmvaLens Project");
});
it("uses the system language before an app preference has been chosen", () => {
	preference.system = "it-IT";
	expect(nativeText("Recover project")).toBe("Recupera progetto");
	expect(nativeText("Recording: {{source}}", { source: "My App" })).toBe("Registrazione: My App");
});
