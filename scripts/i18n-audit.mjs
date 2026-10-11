// Added by OmvaLens, 2026-10-11. AGPL-3.0; see FORK_CHANGES.md.
// Review candidates: this report deliberately does not equate strings with bugs.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const findings = [];
const attributes = new Set(["title", "placeholder", "aria-label", "alt"]);
const properties = new Set(["label", "title", "description", "message", "detail"]);
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
		findings.push({
			file: file.replaceAll("\\", "/"),
			line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
			kind,
			text,
		});
	}
	function visit(node) {
		if (ts.isJsxText(node)) add(node, "text", node.text);
		if (
			ts.isJsxAttribute(node) &&
			attributes.has(node.name.getText(ast)) &&
			node.initializer &&
			ts.isStringLiteral(node.initializer)
		)
			add(node, "attribute", node.initializer.text);
		if (
			ts.isPropertyAssignment(node) &&
			properties.has(node.name.getText(ast)) &&
			ts.isStringLiteral(node.initializer)
		)
			add(node, "property", node.initializer.text);
		if (
			ts.isCallExpression(node) &&
			/^(toast\.(error|success|info|warning)|setMessage|alert|confirm)$/.test(
				node.expression.getText(ast),
			)
		) {
			const value = node.arguments[0];
			if (value && ts.isStringLiteral(value)) add(value, "notice", value.text);
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
if (process.argv.includes("--json")) console.log(JSON.stringify(findings, null, 2));
else {
	for (const item of findings)
		console.log(`${item.file}:${item.line} [${item.kind}] ${item.text}`);
	console.log(
		`\n${findings.length} candidates; proper names, sample content and technical labels need manual review.`,
	);
}
