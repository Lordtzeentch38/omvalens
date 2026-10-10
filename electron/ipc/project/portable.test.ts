// Modified by the ScreenRecorder fork, 2026-10-10. See FORK_CHANGES.md; AGPL-3.0.
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ZipFile } from "yazl";
import { exportPortableProject, importPortableProject, validateArchiveName } from "./portable";

describe("portable project transfer", () => {
	let root: string;
	let recordings: string;
	let projects: string;
	let source: string;
	let archive: string;
	beforeEach(async () => {
		root = await fs.mkdtemp(path.join(os.tmpdir(), "screenrecorder-portable-test-"));
		recordings = path.join(root, "destination", "recordings");
		projects = path.join(recordings, "projects");
		source = path.join(root, "original ń");
		archive = path.join(root, "demo.screenrecorder");
		await fs.mkdir(source);
	});
	afterEach(async () => {
		if (
			path.dirname(root) !== path.resolve(os.tmpdir()) ||
			!path.basename(root).startsWith("screenrecorder-portable-test-")
		)
			throw new Error("Invalid test cleanup path");
		await fs.rm(root, { recursive: true, force: true });
	});
	const authorize = async (file: string) => file;
	async function fixture() {
		for (const [name, contents] of Object.entries({
			"demo.mp4": "screen video test payload",
			"demo.mp4.cursor.json": '{"samples":[1,2,3]}',
			"demo.mic.m4a": "microphone",
			"demo.system.wav": "system audio",
			"demo-webcam.mp4": "webcam",
			"demo.recordly-session.json":
				'{"version":2,"videoFileName":"demo.mp4","webcamFileName":"demo-webcam.mp4","timeOffsetMs":140}',
			"music.wav": "music",
			"background.png": "image",
			"unrelated.mp4": "must not be packaged",
		}))
			await fs.writeFile(path.join(source, name), contents);
		return {
			version: 2,
			projectId: "original",
			videoPath: path.join(source, "demo.mp4"),
			editor: {
				webcam: {
					sourcePath: path.join(source, "demo-webcam.mp4"),
					timeOffsetMs: 140,
					enabled: true,
				},
				audioRegions: [
					{ audioPath: path.join(source, "music.wav"), startMs: 0, endMs: 1000 },
				],
				wallpaper: pathToFileURL(path.join(source, "background.png")).href,
				annotationRegions: [{ type: "text", content: "Keep this text" }],
			},
		};
	}
	async function writeArchive(
		project: unknown,
		entries: Array<{ name: string; data: string; mode?: number }> = [],
	) {
		const zip = new ZipFile();
		const written = pipeline(zip.outputStream, createWriteStream(archive));
		zip.addBuffer(
			Buffer.from(JSON.stringify({ format: "screenrecorder-portable", version: 1, project })),
			"project.json",
		);
		for (const entry of entries)
			zip.addBuffer(Buffer.from(entry.data), entry.name, {
				mode: entry.mode,
				compress: false,
			});
		zip.end();
		await written;
	}
	it("transfers all linked files after the original folder disappears", async () => {
		const project = await fixture();
		const result = await exportPortableProject(project, archive, authorize);
		expect(result.files).toBe(8);
		await fs.rename(source, `${source}-moved`);
		const imported = await importPortableProject(archive, recordings, projects);
		const saved = JSON.parse(await fs.readFile(imported.path, "utf8"));
		expect(saved.projectId).not.toBe("original");
		expect(saved.editor.annotationRegions[0].content).toBe("Keep this text");
		expect(saved.editor.webcam.timeOffsetMs).toBe(140);
		expect(await fs.readFile(saved.videoPath, "utf8")).toBe("screen video test payload");
		expect(await fs.readFile(`${saved.videoPath}.cursor.json`, "utf8")).toContain("samples");
		expect(
			await fs.readFile(path.join(path.dirname(saved.videoPath), "demo.mic.m4a"), "utf8"),
		).toBe("microphone");
		expect(await fs.readFile(saved.editor.audioRegions[0].audioPath, "utf8")).toBe("music");
		expect(await fs.readFile(new URL(saved.editor.wallpaper), "utf8")).toBe("image");
		expect(await fs.readdir(path.dirname(saved.videoPath))).not.toContain("unrelated.mp4");
		expect(project.videoPath).toBe(path.join(source, "demo.mp4"));
	});
	it("preserves bundled wallpaper references without treating them as local files", async () => {
		const project = await fixture();
		project.editor.wallpaper = "/wallpapers/tahoe-light.jpg";
		await exportPortableProject(project, archive, authorize);
		await fs.rename(source, `${source}-moved`);
		const imported = await importPortableProject(archive, recordings, projects);
		const saved = JSON.parse(await fs.readFile(imported.path, "utf8"));
		expect(saved.editor.wallpaper).toBe("/wallpapers/tahoe-light.jpg");
		expect(await fs.readFile(saved.videoPath, "utf8")).toBe("screen video test payload");
	});
	it("keeps files with the same name from different folders distinct", async () => {
		const project = await fixture();
		const other = path.join(root, "other");
		await fs.mkdir(other);
		await fs.writeFile(path.join(other, "demo.mp4"), "other webcam");
		project.editor.webcam.sourcePath = path.join(other, "demo.mp4");
		await exportPortableProject(project, archive, authorize);
		const imported = await importPortableProject(archive, recordings, projects);
		const saved = imported.project as typeof project;
		expect(saved.videoPath).not.toBe(saved.editor.webcam.sourcePath);
		expect(await fs.readFile(saved.editor.webcam.sourcePath, "utf8")).toBe("other webcam");
	});
	it("does not overwrite an existing archive when source media is missing", async () => {
		const project = await fixture();
		await fs.writeFile(archive, "previous export");
		await fs.unlink(project.editor.audioRegions[0].audioPath);
		await expect(exportPortableProject(project, archive, authorize)).rejects.toThrow();
		expect(await fs.readFile(archive, "utf8")).toBe("previous export");
	});
	it.each([
		"media/0000/../evil.mp4",
		"media/0000/C:evil",
		"media/0000/CON.mp4",
		"media/0000/a\\b",
		"../project.json",
		"/project.json",
		"media/0000/file. ",
	])("rejects unsafe names: %s", (name) => {
		expect(() => validateArchiveName(name)).toThrow();
	});
	it.each([
		"C:\\outside.mp4",
		"bundle:media/0000/missing.mp4",
		"bundle:media/0000/../../outside.mp4",
	])("rejects invalid media references and removes partial imports: %s", async (videoPath) => {
		await writeArchive({ version: 2, videoPath, editor: {} });
		await expect(importPortableProject(archive, recordings, projects)).rejects.toThrow();
		expect(await fs.readdir(recordings)).toEqual(["projects"]);
		expect(await fs.readdir(projects)).toEqual([]);
	});
	it("rejects symlinks in an archive", async () => {
		await writeArchive({ version: 2, videoPath: "bundle:media/0000/link.mp4", editor: {} }, [
			{ name: "media/0000/link.mp4", data: "/outside", mode: 0o120777 },
		]);
		await expect(importPortableProject(archive, recordings, projects)).rejects.toThrow(
			"link or special file",
		);
	});
	it("rejects a session sidecar pointing outside the imported folder", async () => {
		await writeArchive({ version: 2, videoPath: "bundle:media/0000/demo.mp4", editor: {} }, [
			{ name: "media/0000/demo.mp4", data: "video" },
			{
				name: "media/0000/demo.recordly-session.json",
				data: JSON.stringify({
					videoFileName: "demo.mp4",
					webcamFileName: "../../private.mp4",
				}),
			},
		]);
		await expect(importPortableProject(archive, recordings, projects)).rejects.toThrow(
			"Session references external media",
		);
		expect(await fs.readdir(recordings)).toEqual(["projects"]);
	});
	it("preserves capitalization in media and session names", async () => {
		await writeArchive({ version: 2, videoPath: "bundle:media/0000/Demo.mp4", editor: {} }, [
			{ name: "media/0000/Demo.mp4", data: "video" },
			{
				name: "media/0000/Demo.recordly-session.json",
				data: JSON.stringify({ videoFileName: "Demo.mp4" }),
			},
		]);
		const result = await importPortableProject(archive, recordings, projects);
		expect(await fs.readFile((result.project as { videoPath: string }).videoPath, "utf8")).toBe(
			"video",
		);
	});
	it("rejects names colliding on Windows", async () => {
		await writeArchive({ version: 2, videoPath: "bundle:media/0000/Demo.mp4", editor: {} }, [
			{ name: "media/0000/Demo.mp4", data: "first" },
			{ name: "media/0000/demo.mp4", data: "second" },
		]);
		await expect(importPortableProject(archive, recordings, projects)).rejects.toThrow(
			"Duplicate",
		);
	});
	it("detects damaged media using the archive CRC", async () => {
		await exportPortableProject(await fixture(), archive, authorize);
		const bytes = await fs.readFile(archive);
		const offset = bytes.indexOf(Buffer.from("screen video test payload"));
		expect(offset).toBeGreaterThan(0);
		bytes[offset] ^= 1;
		await fs.writeFile(archive, bytes);
		await expect(importPortableProject(archive, recordings, projects)).rejects.toThrow(
			"damaged",
		);
		expect(await fs.readdir(recordings)).toEqual(["projects"]);
	});
});
