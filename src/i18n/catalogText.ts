// Added by OmvaLens, 2026-10-11. AGPL-3.0; see FORK_CHANGES.md.
import keys from "./uiTextKeys.json";
import en from "./locales/en/common.json";
import it from "./locales/it/common.json";
import es from "./locales/es/common.json";
import fr from "./locales/fr/common.json";
import de from "./locales/de/common.json";
import nl from "./locales/nl/common.json";
import ko from "./locales/ko/common.json";
import pt from "./locales/pt-BR/common.json";
import cn from "./locales/zh-CN/common.json";
import tw from "./locales/zh-TW/common.json";

const catalogs: Record<string, { ui: Record<string, string> }> = {
	en,
	it,
	es,
	fr,
	de,
	nl,
	ko,
	"pt-BR": pt,
	"zh-CN": cn,
	"zh-TW": tw,
};

/** Translate catalogued UI phrases only. Unknown text is preserved verbatim. */
export function translateCatalogText(
	locale: string,
	source: string,
	vars?: Record<string, string | number>,
) {
	const key = (keys as Record<string, string>)[source];
	const catalog = catalogs[locale] ?? catalogs[locale.split("-")[0]] ?? en;
	const message = key ? (catalog.ui[key] ?? en.ui[key as keyof typeof en.ui] ?? source) : source;
	return vars
		? message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) =>
				vars[name] === undefined ? match : String(vars[name]),
			)
		: message;
}

/** For notifications and non-React helpers. Locale storage keeps its historical
 * identifier for existing profiles. Do not use this on filenames or user text. */
export function currentUiText(source: string, vars?: Record<string, string | number>) {
	let locale = "en";
	try {
		locale = window.localStorage.getItem("recordly.locale") ?? "en";
	} catch {
		/* SSR/tests */
	}
	return translateCatalogText(locale, source, vars);
}
