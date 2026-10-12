// Modified by OmvaLens, 2026-10-11: validate interpolation and UI catalog references.
import fs from "node:fs";
import path from "node:path";
// Modified by OmvaLens, 2026-10-12: validate reviewed inventory and dynamic templates.
import { createHash } from "node:crypto";

const root = process.cwd();
const localesDir = path.join(root, "src", "i18n", "locales");

const locales = fs
	.readdirSync(localesDir)
	.filter((entry) => {
		const fullPath = path.join(localesDir, entry);
		return fs.statSync(fullPath).isDirectory();
	})
	.sort((left, right) => left.localeCompare(right));

if (!locales.includes("en")) {
	console.error('i18n-check: expected base locale directory "en"');
	process.exit(1);
}

function loadJson(filePath) {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`i18n-check: failed to load ${path.relative(root, filePath)}: ${message}`);
	}
}

function collectKeyPaths(obj, prefix = "") {
	if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
		return prefix ? [prefix] : [];
	}

	const keys = Object.keys(obj);
	if (keys.length === 0) {
		return prefix ? [prefix] : [];
	}

	const paths = [];
	for (const key of keys) {
		const nextPrefix = prefix ? `${prefix}.${key}` : key;
		const value = obj[key];
		if (value && typeof value === "object" && !Array.isArray(value)) {
			paths.push(...collectKeyPaths(value, nextPrefix));
		} else {
			paths.push(nextPrefix);
		}
	}
	return paths;
}

const baseLocaleDir = path.join(localesDir, "en");
const namespaceFiles = fs
	.readdirSync(baseLocaleDir)
	.filter((file) => file.endsWith(".json"))
	.sort((left, right) => left.localeCompare(right));

let hasErrors = false;

function valueAt(data, key) {
	return key.split(".").reduce((value, part) => value?.[part], data);
}
function variables(value) {
	return typeof value === "string"
		? [...new Set([...value.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((match) => match[1]))]
				.sort()
				.join(",")
		: "";
}

for (const namespaceFile of namespaceFiles) {
	const baseData = loadJson(path.join(baseLocaleDir, namespaceFile));
	const baseKeys = new Set(collectKeyPaths(baseData));

	for (const locale of locales) {
		if (locale === "en") continue;

		const localeFile = path.join(localesDir, locale, namespaceFile);
		if (!fs.existsSync(localeFile)) {
			console.error(`i18n-check: missing namespace file ${locale}/${namespaceFile}`);
			hasErrors = true;
			continue;
		}

		const localeData = loadJson(localeFile);
		const localeKeys = new Set(collectKeyPaths(localeData));

		for (const key of baseKeys) {
			if (!localeKeys.has(key)) {
				console.error(`i18n-check: missing key ${locale}/${namespaceFile}:${key}`);
				hasErrors = true;
			}
			const baseValue = valueAt(baseData, key);
			const translatedValue = valueAt(localeData, key);
			if (typeof translatedValue !== "string" || !translatedValue.trim()) {
				console.error(
					`i18n-check: empty or non-string value ${locale}/${namespaceFile}:${key}`,
				);
				hasErrors = true;
			} else if (variables(baseValue) !== variables(translatedValue)) {
				console.error(
					`i18n-check: interpolation mismatch ${locale}/${namespaceFile}:${key}`,
				);
				hasErrors = true;
			}
		}

		for (const key of localeKeys) {
			if (!baseKeys.has(key)) {
				console.error(`i18n-check: extra key ${locale}/${namespaceFile}:${key}`);
				hasErrors = true;
			}
		}
	}
}

const uiKeys = loadJson(path.join(root, "src/i18n/uiTextKeys.json"));
const common = loadJson(path.join(baseLocaleDir, "common.json"));
for (const [source, key] of Object.entries(uiKeys)) {
	if (common.ui?.[key] !== source) {
		console.error(
			`i18n-check: UI source phrase has no matching English catalog entry: ${source}`,
		);
		hasErrors = true;
	}
}

const templates = loadJson(path.join(root, "src/i18n/messageTemplates.json"));
for (const name of ["placeholder-1.svg", "placeholder-2.svg"]) {
	if (
		fs.readFileSync(path.join(root, "src/i18n/assets", name), "utf8") !==
		fs.readFileSync(path.join(root, "public/announcements", name), "utf8")
	) {
		console.error(
			`i18n-check: bundled placeholder differs from its compatibility asset: ${name}`,
		);
		hasErrors = true;
	}
}
for (const source of templates) {
	if (!uiKeys[source] || !variables(source)) {
		console.error(`i18n-check: invalid dynamic message template: ${source}`);
		hasErrors = true;
	}
}
const reviews = loadJson(path.join(root, "src/i18n/auditReview.json"));
for (const [id, record] of Object.entries(reviews)) {
	const expected = createHash("sha256")
		.update(`${record.file}\n${record.kind}\n${record.text}`)
		.digest("hex")
		.slice(0, 12);
	if (
		id !== expected ||
		!record.reason?.trim() ||
		!/^\d{4}-\d{2}-\d{2}$/.test(record.reviewedOn ?? "")
	) {
		console.error(`i18n-check: invalid inventory review: ${id}`);
		hasErrors = true;
	}
}

if (hasErrors) {
	process.exit(1);
}

console.log(
	"i18n-check: keys, nonempty strings, interpolation variables and UI catalog references are consistent",
);
