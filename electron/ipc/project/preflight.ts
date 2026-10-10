// Added by the ScreenRecorder fork, 2026-10-10. Licensed under AGPL-3.0.
import fs from "node:fs/promises";
import { projectMediaFields } from "./portable";

/** Check before rendering, rather than discovering missing tracks after a long export. */
export async function preflightProjectMedia(
	project: unknown,
	authorize: (file: string) => Promise<string>,
) {
	const checked = new Set<string>();
	for (const { owner, key } of projectMediaFields(project)) {
		const file = await authorize(owner[key] as string);
		if (checked.has(file)) continue;
		checked.add(file);
		try {
			const stat = await fs.stat(file);
			if (!stat.isFile() || stat.size === 0) throw new Error("File is empty or is not media");
			await fs.access(file, fs.constants.R_OK);
		} catch (error) {
			throw new Error(
				`Cannot export because a project file is unavailable: ${file}. ${String(error)}`,
			);
		}
	}
	return { files: checked.size };
}
