// Added by the ScreenRecorder fork, 2026-10-10. Licensed under AGPL-3.0.
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getProjectBackupPath } from "./atomicSave";

export async function readRecoverableProject(
	projectPath: string,
	validate: (value: unknown) => boolean,
	confirmRecovery: () => Promise<boolean>,
) {
	const read = async (file: string) => {
		const text = await fs.readFile(file, "utf8");
		const project: unknown = JSON.parse(text.replace(/^\uFEFF/, ""));
		if (!validate(project)) throw new Error("Invalid project file format");
		return { text, project };
	};
	try {
		return { ...(await read(projectPath)), path: projectPath, recovered: false };
	} catch (originalError) {
		let backup: Awaited<ReturnType<typeof read>>;
		try {
			backup = await read(getProjectBackupPath(projectPath));
		} catch {
			throw originalError;
		}
		if (!(await confirmRecovery())) return null;
		const parsed = path.parse(projectPath);
		const recoveredPath = path.join(
			parsed.dir,
			`${parsed.name}-recovered-${randomUUID()}${parsed.ext}`,
		);
		// Preserve both original and backup so recovery cannot destroy evidence of a failure.
		await fs.writeFile(recoveredPath, backup.text, { flag: "wx" });
		return { ...backup, path: recoveredPath, recovered: true };
	}
}
