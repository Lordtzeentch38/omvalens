// Added by OmvaLens, 2026-10-12: reject unexplained English fallbacks. AGPL-3.0.
import fs from "node:fs";

const config = fs.readFileSync("src/i18n/config.ts", "utf8");
const locales = [
	...config.match(/SUPPORTED_LOCALES\s*=\s*\[([\s\S]*?)\]/)[1].matchAll(/"([^"]+)"/g),
].map((match) => match[1]);
const exceptions = JSON.parse(fs.readFileSync("src/i18n/translationExceptions.json", "utf8"));
function flatten(value, prefix = "") {
	return Object.entries(value).flatMap(([key, item]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		return item && typeof item === "object" ? flatten(item, path) : [[path, item]];
	});
}
const pending = [];
for (const locale of locales.filter((locale) => locale !== "en")) {
	let translated = 0;
	let invariant = 0;
	for (const file of fs
		.readdirSync("src/i18n/locales/en")
		.filter((file) => file.endsWith(".json"))) {
		const base = flatten(JSON.parse(fs.readFileSync(`src/i18n/locales/en/${file}`, "utf8")));
		const target = Object.fromEntries(
			flatten(JSON.parse(fs.readFileSync(`src/i18n/locales/${locale}/${file}`, "utf8"))),
		);
		for (const [key, source] of base) {
			if (typeof target[key] !== "string" || !target[key].trim()) {
				pending.push({ locale, file, key, source });
				continue;
			}
			if (target[key] !== source) {
				translated++;
				continue;
			}
			const reason = exceptions[source];
			if (
				!/[A-Za-z]{2}/.test(source.replace(/\{\{.*?\}\}/g, "")) ||
				/^https?:\/\//.test(source) ||
				(reason?.locales.includes(locale) && reason.reason?.trim())
			) {
				invariant++;
				continue;
			}
			pending.push({ locale, file, key, source });
		}
	}
	if (!process.argv.includes("--json"))
		console.log(
			`${locale}: ${translated} localized, ${invariant} intentional invariants, ${pending.filter((item) => item.locale === locale).length} unexplained English phrases`,
		);
}
if (process.argv.includes("--json")) console.log(JSON.stringify(pending, null, 2));
else
	for (const item of pending)
		console.log(`${item.locale}/${item.file}:${item.key} ${item.source}`);
if (process.argv.includes("--check") && pending.length) process.exitCode = 1;
