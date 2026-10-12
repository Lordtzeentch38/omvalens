// Added by OmvaLens, 2026-10-12: locale completeness and immutable user data. AGPL-3.0.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { expect, it } from "vitest";
import { SUPPORTED_LOCALES } from "./config";
import { translateAppMessage } from "./appMessage";
import { translateCatalogText } from "./catalogText";

function coverageFixture(target: Record<string, string>, exceptions = {}) {
	fs.mkdirSync(".tmp", { recursive: true });
	const dir = fs.mkdtempSync(path.resolve(".tmp/c08-coverage-test-"));
	fs.mkdirSync(path.join(dir, "src/i18n/locales/en"), { recursive: true });
	fs.mkdirSync(path.join(dir, "src/i18n/locales/fr"), { recursive: true });
	fs.writeFileSync(
		path.join(dir, "src/i18n/config.ts"),
		'export const SUPPORTED_LOCALES = ["en", "fr"] as const;',
	);
	fs.writeFileSync(
		path.join(dir, "src/i18n/translationExceptions.json"),
		JSON.stringify(exceptions),
	);
	fs.writeFileSync(
		path.join(dir, "src/i18n/locales/en/common.json"),
		JSON.stringify({ action: "New action", format: "MP4" }),
	);
	fs.writeFileSync(path.join(dir, "src/i18n/locales/fr/common.json"), JSON.stringify(target));
	return spawnSync(process.execPath, [path.resolve("scripts/i18n-coverage.mjs"), "--check"], {
		cwd: dir,
		encoding: "utf8",
	});
}
it("rejects an unexplained English fallback introduced by a future feature", () => {
	const result = coverageFixture({ action: "New action", format: "MP4" });
	expect(result.status).toBe(1);
	expect(result.stdout).toContain("New action");
});
it("accepts a translated command and a specifically reviewed format name", () => {
	const result = coverageFixture(
		{ action: "Nouvelle action", format: "MP4" },
		{ MP4: { locales: ["fr"], reason: "Format name" } },
	);
	expect(result.status).toBe(0);
});
it("does not reuse another locale's exception or count a missing string as translated", () => {
	const result = coverageFixture(
		{ format: "MP4" },
		{ MP4: { locales: ["de"], reason: "Format name" } },
	);
	expect(result.status).toBe(1);
	expect(result.stdout).toContain("New action");
	expect(result.stdout).toContain("MP4");
});
for (const locale of SUPPORTED_LOCALES.filter((locale) => locale !== "en" && locale !== "it")) {
	it(`${locale}: preserves product names and executable download links`, () => {
		function flatten(value: Record<string, unknown>, prefix = ""): [string, string][] {
			return Object.entries(value).flatMap(([key, item]) =>
				typeof item === "string"
					? [[prefix + key, item] as [string, string]]
					: flatten(item as Record<string, unknown>, `${prefix}${key}.`),
			);
		}
		for (const file of fs.readdirSync("src/i18n/locales/en")) {
			const source = flatten(
				JSON.parse(fs.readFileSync(`src/i18n/locales/en/${file}`, "utf8")),
			);
			const target = Object.fromEntries(
				flatten(JSON.parse(fs.readFileSync(`src/i18n/locales/${locale}/${file}`, "utf8"))),
			);
			source.forEach(([key, phrase]) => {
				for (const name of ["OmvaLens", "Recordly", "Supabase", "Whisper"])
					if (phrase.includes(name))
						expect(target[key], `${file}: ${phrase}`).toContain(name);
				for (const url of phrase.match(/https?:\/\/[^\s,;]+/g) ?? [])
					expect(target[key], `${file}: ${phrase}`).toContain(url);
			});
		}
	});
	it(`${locale}: dynamic error retains a filename and unknown diagnostics`, () => {
		const filename = "C:\\Film\\My {{draft}} [1].mp4";
		const source = `Missing or empty media: ${filename}`;
		const translated = translateAppMessage(locale, source);
		expect(translated).not.toBe(source);
		expect(translated).toContain(filename);
		expect(translateAppMessage(locale, "NVENC error: 0x999 driver diagnostic")).toBe(
			"NVENC error: 0x999 driver diagnostic",
		);
	});
}
it("distinguishes simplified and traditional Chinese controls", () => {
	expect(translateCatalogText("zh-CN", "Settings")).toBe("设置");
	expect(translateCatalogText("zh-TW", "Settings")).toBe("設定");
});

function referenceFixture(source: string) {
	const dir = fs.mkdtempSync(path.resolve(".tmp/c08-reference-test-"));
	fs.mkdirSync(path.join(dir, "src/i18n/locales/en"), { recursive: true });
	fs.writeFileSync(
		path.join(dir, "src/i18n/locales/en/settings.json"),
		JSON.stringify({ export: { title: "Export" } }),
	);
	fs.writeFileSync(path.join(dir, "src/example.tsx"), source);
	return spawnSync(process.execPath, [path.resolve("scripts/i18n-references.mjs")], {
		cwd: dir,
		encoding: "utf8",
	});
}
it("rejects a missing scoped key even when an English fallback hides it in the UI", () => {
	const result = referenceFixture(
		'const tSettings = useScopedT("settings"); tSettings("export.size", "Size");',
	);
	expect(result.status).toBe(1);
	expect(result.stderr).toContain("missing catalog key settings.export.size");
});
it("checks real scoped calls without treating comments or text as catalog references", () => {
	const result = referenceFixture(
		'const tSettings = useScopedT("settings"); tSettings("export.title"); // tSettings("export.missing")\nconst text = \'tSettings("export.missing")\';',
	);
	expect(result.status).toBe(0);
	expect(result.stdout).toContain("1 literal scoped references checked, 0 missing");
});
