// Added by OmvaLens, 2026-10-12: localize known application messages at the UI boundary.
// AGPL-3.0. Unknown diagnostics and captured user values are preserved verbatim.
import templates from "./messageTemplates.json";
import { translateCatalogText } from "./catalogText";

const matchers = templates.map((source) => {
	const names: string[] = [];
	const parts = source.split(/(\{\{\s*\w+\s*\}\})/g);
	const pattern = parts
		.map((part) => {
			const variable = /^\{\{\s*(\w+)\s*\}\}$/.exec(part);
			if (variable) {
				names.push(variable[1]);
				return "([\\s\\S]+?)";
			}
			return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		})
		.join("");
	return { source, names, expression: new RegExp(`^${pattern}(?![\\s\\S])`) };
});

export function translateAppMessage(
	locale: string,
	source: string,
	vars?: Record<string, string | number>,
): string {
	const exact = translateCatalogText(locale, source, vars);
	if (vars || exact !== source) return exact;
	// Large codec logs are diagnostics, not a template-matching workload.
	if (source.length > 32768) return source;
	for (const matcher of matchers) {
		const match = matcher.expression.exec(source);
		if (!match) continue;
		const values = Object.fromEntries(matcher.names.map((name, i) => [name, match[i + 1]]));
		return translateCatalogText(locale, matcher.source, values);
	}
	// Error.toString() and grouped preflight errors arrive as plain IPC strings.
	if (source.startsWith("Error: ")) {
		return `${translateCatalogText(locale, "Error")}: ${translateAppMessage(locale, source.slice(7))}`;
	}
	if (source.includes("\n"))
		return source
			.split("\n")
			.map((line) => translateAppMessage(locale, line))
			.join("\n");
	return source;
}

export function currentAppMessage(source: string): string {
	let locale = "en";
	try {
		locale = window.localStorage.getItem("recordly.locale") ?? "en";
	} catch {
		/* SSR/tests */
	}
	return translateAppMessage(locale, source);
}
