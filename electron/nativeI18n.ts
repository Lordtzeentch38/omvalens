// Added by OmvaLens, 2026-10-11. AGPL-3.0; see FORK_CHANGES.md.
import { app } from "electron";
import { EventEmitter } from "node:events";
import { readAppSetting } from "./appSettingsStore";
import { translateCatalogText } from "../src/i18n/catalogText";

export const localeEvents = new EventEmitter();

export function nativeText(source: string, vars?: Record<string, string | number>) {
	const saved = readAppSetting("recordly.locale");
	const locale = typeof saved === "string" ? saved : (app.getLocale?.() ?? "en");
	return translateCatalogText(locale, source, vars);
}
