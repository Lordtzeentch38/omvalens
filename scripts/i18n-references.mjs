// Added by OmvaLens, 2026-10-12: reject missing scoped catalog keys. AGPL-3.0.
import fs from "node:fs";
import ts from "typescript";

function sourceFiles(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const file = `${dir}/${entry.name}`;
		return entry.isDirectory() ? sourceFiles(file) : /\.tsx?$/.test(file) ? [file] : [];
	});
}
const catalogs = new Map();
let missing = 0;
let checked = 0;
for (const file of sourceFiles("src")) {
	const ast = ts.createSourceFile(
		file,
		fs.readFileSync(file, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const aliases = new Map();
	function findAliases(node) {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			node.initializer &&
			ts.isCallExpression(node.initializer) &&
			ts.isIdentifier(node.initializer.expression) &&
			node.initializer.expression.text === "useScopedT" &&
			node.initializer.arguments[0] &&
			ts.isStringLiteral(node.initializer.arguments[0])
		) {
			const namespaces = aliases.get(node.name.text) ?? new Set();
			namespaces.add(node.initializer.arguments[0].text);
			aliases.set(node.name.text, namespaces);
		}
		ts.forEachChild(node, findAliases);
	}
	findAliases(ast);
	function check(node) {
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			aliases.get(node.expression.text)?.size === 1 &&
			node.arguments[0] &&
			ts.isStringLiteral(node.arguments[0])
		) {
			const namespace = [...aliases.get(node.expression.text)][0];
			if (!catalogs.has(namespace))
				catalogs.set(
					namespace,
					JSON.parse(fs.readFileSync(`src/i18n/locales/en/${namespace}.json`, "utf8")),
				);
			const key = node.arguments[0].text;
			checked++;
			if (
				typeof key
					.split(".")
					.reduce((value, part) => value?.[part], catalogs.get(namespace)) !== "string"
			) {
				const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
				console.error(`${file}:${line}: missing catalog key ${namespace}.${key}`);
				missing++;
			}
		}
		ts.forEachChild(node, check);
	}
	check(ast);
}
console.log(`i18n-references: ${checked} literal scoped references checked, ${missing} missing`);
if (missing) process.exitCode = 1;
