// Added by OmvaLens, 2026-10-11. AGPL-3.0; see FORK_CHANGES.md.
// Review candidates: this report deliberately does not equate strings with bugs.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
// Modified by OmvaLens, 2026-10-12: dynamic/error candidates and reviewed exclusions.
import { createHash } from "node:crypto";

const catalogKeys = JSON.parse(fs.readFileSync("src/i18n/uiTextKeys.json", "utf8"));
const reviewFile = "src/i18n/auditReview.json";
const reviews = fs.existsSync(reviewFile) ? JSON.parse(fs.readFileSync(reviewFile, "utf8")) : {};

const findings = [];
const attributes = new Set(["title", "placeholder", "aria-label", "alt"]);
const properties = new Set(["label", "title", "description", "message", "detail", "error"]);
function literal(node) {
	return ts.isStringLiteralLike(node) || ts.isTemplateExpression(node);
}
function literalText(node) {
	if (ts.isTemplateExpression(node))
		return (
			node.head.text +
			node.templateSpans
				.map((span, index) => `{{value${index + 1}}}${span.literal.text}`)
				.join("")
		);
	return node.text;
}
function inspect(file) {
	const source = fs.readFileSync(file, "utf8");
	const ast = ts.createSourceFile(
		file,
		source,
		ts.ScriptTarget.Latest,
		true,
		file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	function add(node, kind, value) {
		const text = value.replace(/\s+/g, " ").trim();
		if (!/[A-Za-z]{2}/.test(text)) return;
		const normalizedFile = file.replaceAll("\\", "/");
		const id = createHash("sha256")
			.update(`${normalizedFile}\n${kind}\n${text}`)
			.digest("hex")
			.slice(0, 12);
		findings.push({
			id,
			file: normalizedFile,
			line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
			kind,
			text,
			status: catalogKeys[text]
				? "catalogued"
				: reviews[id]
					? "reviewed-exclusion"
					: "pending",
			reason:
				reviews[id]?.reason ??
				(catalogKeys[text]
					? "Catalogo UI; traduzione al punto di visualizzazione."
					: "Da classificare"),
		});
	}
	function visit(node) {
		if (ts.isJsxText(node)) add(node, "text", node.text);
		if (ts.isJsxExpression(node) && node.expression && !ts.isJsxAttribute(node.parent)) {
			const expression = node.expression;
			if (literal(expression)) add(expression, "expression", literalText(expression));
			if (ts.isConditionalExpression(expression))
				for (const branch of [expression.whenTrue, expression.whenFalse]) {
					if (literal(branch)) add(branch, "expression", literalText(branch));
				}
		}
		if (
			ts.isJsxAttribute(node) &&
			attributes.has(node.name.getText(ast)) &&
			node.initializer &&
			literal(node.initializer)
		)
			add(node, "attribute", literalText(node.initializer));
		if (
			ts.isJsxAttribute(node) &&
			attributes.has(node.name.getText(ast)) &&
			node.initializer &&
			ts.isJsxExpression(node.initializer) &&
			node.initializer.expression
		) {
			const expression = node.initializer.expression;
			if (literal(expression)) add(expression, "attribute", literalText(expression));
			if (ts.isConditionalExpression(expression))
				for (const branch of [expression.whenTrue, expression.whenFalse]) {
					if (literal(branch)) add(branch, "attribute", literalText(branch));
				}
		}
		if (
			ts.isPropertyAssignment(node) &&
			properties.has(node.name.getText(ast)) &&
			literal(node.initializer)
		)
			add(node, "property", literalText(node.initializer));
		if (
			(ts.isCallExpression(node) || ts.isNewExpression(node)) &&
			/^(toast\.(error|success|info|warning)|set\w*(?:Error|Message)|(?:\w+\.)?setError|alert|confirm|Error)$/.test(
				node.expression.getText(ast),
			)
		) {
			const value = node.arguments?.[0];
			if (value && literal(value))
				add(value, ts.isNewExpression(node) ? "error" : "notice", literalText(value));
		}
		ts.forEachChild(node, visit);
	}
	visit(ast);
}
function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const file = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(file);
		else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) inspect(file);
	}
}
walk("src");
walk("electron");
for (const name of fs.readdirSync("public/announcements")) {
	if (!name.endsWith(".svg")) continue;
	const file = `public/announcements/${name}`;
	const source = fs.readFileSync(file, "utf8");
	for (const match of source.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)) {
		const text = match[1].trim();
		const kind = "svg-text";
		const id = createHash("sha256")
			.update(`${file}\n${kind}\n${text}`)
			.digest("hex")
			.slice(0, 12);
		findings.push({
			id,
			file,
			line: source.slice(0, match.index).split("\n").length,
			kind,
			text,
			status: catalogKeys[text]
				? "catalogued"
				: reviews[id]
					? "reviewed-exclusion"
					: "pending",
			reason:
				reviews[id]?.reason ??
				(catalogKeys[text]
					? "Tradotto da announcementImageSource nei segnaposto inclusi."
					: "Da classificare"),
		});
	}
}
if (process.argv.includes("--json")) console.log(JSON.stringify(findings, null, 2));
else if (process.argv.includes("--summary")) {
	for (const status of ["catalogued", "reviewed-exclusion", "pending"]) {
		console.log(`${status}: ${findings.filter((item) => item.status === status).length}`);
	}
} else {
	for (const item of findings)
		console.log(
			`${item.file}:${item.line} [${item.status}; ${item.kind}; ${item.id}] ${item.text}`,
		);
	console.log(
		`\n${findings.length} candidates; proper names, sample content and technical labels need manual review.`,
	);
}
if (
	process.argv.includes("--check-reviewed") &&
	findings.some((item) => item.status === "pending")
) {
	console.error(
		`${findings.filter((item) => item.status === "pending").length} candidates need review`,
	);
	process.exitCode = 1;
}
