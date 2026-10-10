// Modified by the ScreenRecorder fork, 2026-10-10. See FORK_CHANGES.md; AGPL-3.0.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { preflightProjectMedia } from "./preflight";
import { readRecoverableProject } from "./recovery";

describe("project recovery and export preflight", () => {
	let root: string;
	let file: string;
	const valid = (value: unknown) => !!value && typeof value === "object" && "videoPath" in value;
	beforeEach(async () => {
		root = await fs.mkdtemp(path.join(os.tmpdir(), "screenrecorder-recovery-test-"));
		file = path.join(root, "demo.recordly");
	});
	afterEach(async () => {
		if (
			path.dirname(root) !== path.resolve(os.tmpdir()) ||
			!path.basename(root).startsWith("screenrecorder-recovery-test-")
		)
			throw new Error("Invalid test cleanup path");
		await fs.rm(root, { recursive: true, force: true });
	});
	it("opens a valid project without asking about its backup", async () => {
		await fs.writeFile(file, '{"videoPath":"video.mp4"}');
		const confirm = vi.fn();
		expect((await readRecoverableProject(file, valid, confirm))?.recovered).toBe(false);
		expect(confirm).not.toHaveBeenCalled();
	});
	it("recovers a separate copy while preserving the corrupt original and backup", async () => {
		await fs.writeFile(file, "corrupt");
		const backup = '{"videoPath":"video.mp4"}';
		await fs.writeFile(`${file}.bak`, backup);
		const result = await readRecoverableProject(file, valid, async () => true);
		expect(result?.path).not.toBe(file);
		expect(result?.recovered).toBe(true);
		expect(await fs.readFile(result!.path, "utf8")).toBe(backup);
		expect(await fs.readFile(file, "utf8")).toBe("corrupt");
		expect(await fs.readFile(`${file}.bak`, "utf8")).toBe(backup);
	});
	it("cancels recovery without writing any file", async () => {
		await fs.writeFile(file, "corrupt");
		await fs.writeFile(`${file}.bak`, '{"videoPath":"video.mp4"}');
		expect(await readRecoverableProject(file, valid, async () => false)).toBeNull();
		expect((await fs.readdir(root)).length).toBe(2);
	});
	it("fails without offering an invalid backup", async () => {
		await fs.writeFile(file, "corrupt");
		await fs.writeFile(`${file}.bak`, "{}");
		const confirm = vi.fn();
		await expect(readRecoverableProject(file, valid, confirm)).rejects.toThrow();
		expect(confirm).not.toHaveBeenCalled();
	});
	it("checks every linked audio file before export", async () => {
		const video = path.join(root, "video.mp4");
		await fs.writeFile(video, "video");
		const project = {
			version: 2,
			videoPath: video,
			editor: { audioRegions: [{ audioPath: path.join(root, "missing.wav") }] },
		};
		await expect(preflightProjectMedia(project, async (value) => value)).rejects.toThrow(
			"unavailable",
		);
		await fs.writeFile(project.editor.audioRegions[0].audioPath, "audio");
		expect(await preflightProjectMedia(project, async (value) => value)).toEqual({ files: 2 });
	});
	it("rejects empty files and unapproved media", async () => {
		await fs.writeFile(file, "");
		const project = { version: 2, videoPath: file, editor: {} };
		await expect(preflightProjectMedia(project, async (value) => value)).rejects.toThrow(
			"empty",
		);
		await expect(
			preflightProjectMedia(project, async () => {
				throw new Error("unapproved");
			}),
		).rejects.toThrow("unapproved");
	});
});
