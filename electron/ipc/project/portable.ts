// Added by the ScreenRecorder fork, 2026-10-10. Licensed under AGPL-3.0.
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { type Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as yauzl from "yauzl";
import { ZipFile } from "yazl";

export const PORTABLE_EXTENSION = "screenrecorder";
const MAX_FILES = 10000;
const MAX_BYTES = 100 * 1024 ** 3;
const MAX_PROJECT_BYTES = 8 * 1024 ** 2;
type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
	if (!value || typeof value !== "object" || Array.isArray(value))
		throw new Error("Invalid project structure");
	return value as JsonObject;
}

/** Only documented media fields are rewritten; text and embedded image data stay intact. */
export function projectMediaFields(project: unknown): Array<{ owner: JsonObject; key: string }> {
	const root = object(project);
	if (!Number.isInteger(root.version) || typeof root.videoPath !== "string" || !root.videoPath)
		throw new Error("Invalid project format");
	const editor = object(root.editor);
	const fields = [{ owner: root, key: "videoPath" }];
	if (editor.webcam != null) {
		const webcam = object(editor.webcam);
		if (webcam.sourcePath) fields.push({ owner: webcam, key: "sourcePath" });
	}
	for (const [list, key] of [
		["audioRegions", "audioPath"],
		["audioTracks", "sourcePath"],
	]) {
		if (editor[list] == null) continue;
		if (!Array.isArray(editor[list])) throw new Error(`Invalid ${list}`);
		for (const item of editor[list]) {
			const owner = object(item);
			if (owner[key]) fields.push({ owner, key });
		}
	}
	if (
		typeof editor.wallpaper === "string" &&
		!editor.wallpaper.startsWith("/wallpapers/") &&
		!editor.wallpaper.startsWith("/app-icons/") &&
		(/^(file:|bundle:|https?:\/\/localhost|https?:\/\/127\.0\.0\.1)/i.test(editor.wallpaper) ||
			path.isAbsolute(editor.wallpaper) ||
			path.win32.isAbsolute(editor.wallpaper))
	)
		fields.push({ owner: editor, key: "wallpaper" });
	for (const field of fields)
		if (typeof field.owner[field.key] !== "string") throw new Error("Invalid media path");
	return fields;
}

export function validateArchiveName(name: string): void {
	if (!/^media\/[0-9]{4}\//.test(name) && name !== "project.json")
		throw new Error(`Unexpected archive entry: ${name}`);
	if (
		name.length > 512 ||
		name
			.split("/")
			.some(
				(part) =>
					!part ||
					part === "." ||
					part === ".." ||
					/[\\:<>"|?*]/.test(part) ||
					Array.from(part).some((character) => character.charCodeAt(0) < 32) ||
					/[. ]$/.test(part) ||
					/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part),
			)
	)
		throw new Error(`Unsafe archive entry: ${name}`);
}

function localPath(value: string): string {
	if (/^file:/i.test(value)) return fileURLToPath(value);
	if (!path.isAbsolute(value)) throw new Error(`Media must be a local absolute path: ${value}`);
	return value;
}

function belongsToSource(name: string, video: string): boolean {
	const stem = video.slice(0, -path.extname(video).length);
	return (
		name === `${video}.cursor.json` ||
		name === `${stem}.recordly-session.json` ||
		name === `${stem}.recording-session.json` ||
		(name.startsWith(`${stem}.`) &&
			/\.(system|mic|microphone|audio|webcam)\.(wav|webm|mp4|m4a)(\.json)?$/i.test(name)) ||
		(name.startsWith(`${stem}-webcam.`) && /\.(mp4|webm|mov|mkv|avi)$/i.test(name))
	);
}

export async function exportPortableProject(
	project: unknown,
	destination: string,
	authorize: (file: string) => Promise<string>,
) {
	const copy = JSON.parse(JSON.stringify(project));
	const fields = projectMediaFields(copy);
	const files = new Map<string, string>();
	const archiveNames = new Set<string>();
	const directories = new Map<string, string>();
	let totalBytes = 0;
	const include = async (file: string) => {
		if (files.has(file)) return files.get(file)!;
		const stat = await fs.stat(file);
		if (!stat.isFile() || !stat.size) throw new Error(`Missing or empty media: ${file}`);
		if (!directories.has(path.dirname(file)))
			directories.set(path.dirname(file), String(directories.size).padStart(4, "0"));
		const name = `media/${directories.get(path.dirname(file))}/${path.basename(file)}`;
		validateArchiveName(name);
		if (archiveNames.has(name.toLowerCase()))
			throw new Error("Media filenames conflict on another platform");
		archiveNames.add(name.toLowerCase());
		totalBytes += stat.size;
		if (files.size >= MAX_FILES || totalBytes > MAX_BYTES)
			throw new Error("Project is too large to package");
		files.set(file, name);
		return name;
	};
	for (const { owner, key } of fields) {
		const source = localPath(await authorize(owner[key] as string));
		const canonical = await fs.realpath(source);
		owner[key] = `bundle:${await include(canonical)}`;
		for (const entry of await fs.readdir(path.dirname(canonical), { withFileTypes: true })) {
			if (!entry.isFile() || !belongsToSource(entry.name, path.basename(canonical))) continue;
			const sidecar = await fs.realpath(path.join(path.dirname(canonical), entry.name));
			if (path.dirname(sidecar) !== path.dirname(canonical))
				throw new Error("Sidecar escapes its media folder");
			await include(sidecar);
		}
	}
	const manifest = Buffer.from(
		JSON.stringify({ format: "screenrecorder-portable", version: 1, project: copy }),
	);
	if (manifest.length > MAX_PROJECT_BYTES) throw new Error("Project metadata is too large");
	const temporary = path.join(path.dirname(destination), `.portable-${randomUUID()}.tmp`);
	const zip = new ZipFile();
	const output = createWriteStream(temporary, { flags: "wx" });
	zip.on("error", (error) => output.destroy(error));
	const written = pipeline(zip.outputStream, output);
	try {
		zip.addBuffer(manifest, "project.json");
		for (const [file, name] of files) zip.addFile(file, name, { compress: false });
		zip.end();
		await written;
		await fs.rename(temporary, destination);
	} catch (error) {
		output.destroy();
		await written.catch(() => undefined);
		throw error;
	} finally {
		output.destroy();
		await fs.rm(temporary, { force: true });
	}
	return { files: files.size, bytes: totalBytes };
}

// Verify CRC as well as declared length: yauzl validates sizes but does not check CRC.
const crcTable = Array.from({ length: 256 }, (_, index) => {
	let crc = index;
	for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
	return crc >>> 0;
});

async function extractArchive(archive: string, directory: string) {
	const zip = await new Promise<yauzl.ZipFile>((resolve, reject) =>
		yauzl.open(
			archive,
			{ lazyEntries: true, strictFileNames: true, validateEntrySizes: true },
			(error, value) => (error ? reject(error) : resolve(value!)),
		),
	);
	const names = new Set<string>();
	const storedNames = new Set<string>();
	let totalBytes = 0;
	let activeRead: Readable | undefined;
	let activeTask: Promise<void> | undefined;
	try {
		await new Promise<void>((resolve, reject) => {
			zip.on("error", reject);
			zip.on("end", resolve);
			zip.on("entry", (entry: yauzl.Entry) => {
				activeTask = (async () => {
					validateArchiveName(entry.fileName);
					const key = entry.fileName.toLowerCase();
					if (names.has(key)) throw new Error("Duplicate archive entry");
					names.add(key);
					storedNames.add(entry.fileName);
					const type = (entry.externalFileAttributes >>> 16) & 0o170000;
					if (type !== 0 && type !== 0o100000)
						throw new Error("Archive contains a link or special file");
					if (entry.generalPurposeBitFlag & 1)
						throw new Error("Encrypted archives are unsupported");
					totalBytes += entry.uncompressedSize;
					if (
						names.size > MAX_FILES + 1 ||
						totalBytes > MAX_BYTES ||
						((entry.fileName === "project.json" ||
							/\.(recordly|recording)-session\.json$/i.test(entry.fileName)) &&
							entry.uncompressedSize > MAX_PROJECT_BYTES)
					)
						throw new Error("Archive exceeds project limits");
					const target = path.join(directory, ...entry.fileName.split("/"));
					await fs.mkdir(path.dirname(target), { recursive: true });
					const stream = await new Promise<Readable>((res, rej) =>
						zip.openReadStream(entry, (error, value) =>
							error ? rej(error) : res(value!),
						),
					);
					activeRead = stream;
					let bytes = 0;
					let crc = 0xffffffff;
					const verify = new Transform({
						transform(chunk: Buffer, _encoding, callback) {
							bytes += chunk.length;
							if (bytes > entry.uncompressedSize)
								return callback(new Error("Invalid archive size"));
							for (const byte of chunk)
								crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
							callback(null, chunk);
						},
					});
					await pipeline(stream, verify, createWriteStream(target, { flags: "wx" }));
					if (
						bytes !== entry.uncompressedSize ||
						(crc ^ 0xffffffff) >>> 0 !== entry.crc32
					)
						throw new Error("Archive is damaged");
					zip.readEntry();
				})();
				void activeTask.catch(reject);
			});
			zip.readEntry();
		});
	} finally {
		activeRead?.destroy();
		zip.close();
		await activeTask?.catch(() => undefined);
	}
	return storedNames;
}

export async function importPortableProject(
	archive: string,
	recordingsDir: string,
	projectsDir: string,
) {
	await fs.mkdir(recordingsDir, { recursive: true });
	await fs.mkdir(projectsDir, { recursive: true });
	const directory = await fs.mkdtemp(path.join(recordingsDir, "portable-"));
	let projectPath: string | undefined;
	try {
		const names = await extractArchive(archive, directory);
		const manifest = object(
			JSON.parse(await fs.readFile(path.join(directory, "project.json"), "utf8")),
		);
		if (manifest.format !== "screenrecorder-portable" || manifest.version !== 1)
			throw new Error("Unsupported portable project version");
		const project = object(manifest.project);
		// Session sidecars are later used to locate webcam media. Never permit
		// them to redirect the importer outside the archive's own media folder.
		for (const name of names) {
			if (!/\.(recordly|recording)-session\.json$/i.test(name)) continue;
			const sessionFile = path.join(directory, ...name.split("/"));
			const session = object(JSON.parse(await fs.readFile(sessionFile, "utf8")));
			for (const key of ["videoFileName", "webcamFileName"]) {
				if (session[key] == null) continue;
				const value = session[key];
				if (
					typeof value !== "string" ||
					value !== path.posix.basename(value) ||
					value !== path.win32.basename(value)
				)
					throw new Error("Session references external media");
				const relative = `${path.posix.dirname(name)}/${value}`;
				validateArchiveName(relative);
			}
		}
		for (const { owner, key } of projectMediaFields(project)) {
			const value = owner[key] as string;
			if (!value.startsWith("bundle:")) throw new Error("Project references external media");
			const name = value.slice(7);
			validateArchiveName(name);
			if (!name.startsWith("media/") || !names.has(name))
				throw new Error("Project media is missing");
			const file = path.join(directory, ...name.split("/"));
			if (!(await fs.stat(file)).size) throw new Error("Project media is empty");
			owner[key] = key === "wallpaper" ? pathToFileURL(file).href : file;
		}
		project.projectId = randomUUID();
		projectPath = path.join(projectsDir, `Imported-${randomUUID()}.recordly`);
		await fs.writeFile(projectPath, JSON.stringify(project, null, 2), { flag: "wx" });
		return { path: projectPath, project };
	} catch (error) {
		if (projectPath) await fs.rm(projectPath, { force: true });
		// Only remove the unique directory we created inside the recordings directory.
		if (path.dirname(path.resolve(directory)) === path.resolve(recordingsDir))
			await fs.rm(directory, { recursive: true, force: true });
		throw error;
	}
}
