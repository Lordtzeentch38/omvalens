// Added by OmvaLens, 2026-10-12. AGPL-3.0; see FORK_CHANGES.md.
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, copyFile, writeFile, stat } from "node:fs/promises";
import { get } from "node:https";
import { pipeline } from "node:stream/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const version = "v1.8.4";
const asset = "whisper-cublas-12.4.0-bin-x64.zip";
const sha256 = "b07cff4e59831b227896018facbb6334907bf324a342c84597c44f087823d252";
const output = path.resolve("electron/native/bin/win32-x64/whisper-cuda");
const cache = path.resolve(".tmp/whisper-runtime");
async function digest(file) {
	const hash = createHash("sha256");
	for await (const chunk of createReadStream(file)) hash.update(chunk);
	return hash.digest("hex");
}
async function download(url, target, redirects = 0) {
	if (redirects > 5) throw Error("Too many Whisper GPU download redirects");
	const response = await new Promise((resolve, reject) => {
		const request = get(url, { timeout: 30000 }, resolve);
		request.on("error", reject);
		request.on("timeout", () => request.destroy(Error("Whisper GPU download timed out")));
	});
	if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
		response.resume();
		return download(new URL(response.headers.location, url), target, redirects + 1);
	}
	if (response.statusCode !== 200) {
		response.resume();
		throw Error(`Whisper GPU download failed: ${response.statusCode}`);
	}
	await pipeline(response, createWriteStream(target));
}
if (process.platform !== "win32" || process.arch !== "x64") {
	console.log("Whisper CUDA package applies to Windows x64 only; keep the platform runtime.");
} else {
	let staged = false;
	try {
		const manifest = JSON.parse(
			await readFile(path.join(output, "whisper-runtime.json"), "utf8"),
		);
		staged = manifest.version === version && manifest.archiveSha256 === sha256;
		if (staged)
			for (const [name, hash] of Object.entries(manifest.files ?? {})) {
				if ((await digest(path.join(output, name))) !== hash) staged = false;
			}
		staged &&= Boolean(manifest.files?.["whisper-cli.exe"]);
	} catch {
		/* first build or changed artifact */
	}
	if (!staged) {
		await mkdir(cache, { recursive: true });
		const archive = path.join(cache, `${version}-${asset}`);
		let valid = false;
		try {
			valid = (await digest(archive)) === sha256;
		} catch {
			/* cache miss */
		}
		if (!valid) {
			console.log(`Downloading official Whisper CUDA ${version} (SHA-256 pinned)...`);
			await download(
				`https://github.com/ggml-org/whisper.cpp/releases/download/${version}/${asset}`,
				archive,
			);
			if ((await digest(archive)) !== sha256)
				throw Error("Whisper CUDA archive integrity check failed");
		}
		const extracted = path.join(cache, `cuda-${Date.now()}`);
		await mkdir(extracted, { recursive: true });
		execFileSync("tar", ["-xf", archive, "-C", extracted], { stdio: "inherit" });
		const pending = [extracted];
		let runtime;
		while (pending.length) {
			const directory = pending.shift();
			const entries = await readdir(directory, { withFileTypes: true });
			if (entries.some((entry) => entry.name === "whisper-cli.exe")) {
				runtime = directory;
				break;
			}
			for (const entry of entries)
				if (entry.isDirectory()) pending.push(path.join(directory, entry.name));
		}
		if (!runtime) throw Error("Official CUDA archive has no whisper-cli.exe");
		await mkdir(output, { recursive: true });
		const files = {};
		for (const name of await readdir(runtime)) {
			if (
				!/\.dll$/i.test(name) &&
				name !== "whisper-cli.exe" &&
				!/license|notice|copying/i.test(name)
			)
				continue;
			if (!(await stat(path.join(runtime, name))).isFile()) continue;
			await copyFile(path.join(runtime, name), path.join(output, name));
			files[name] = await digest(path.join(output, name));
		}
		await writeFile(
			path.join(output, "whisper-runtime.json"),
			JSON.stringify(
				{
					version,
					platform: "win32",
					arch: "x64",
					backend: "cuda",
					binary: "whisper-cli.exe",
					archiveSha256: sha256,
					source: `https://github.com/ggml-org/whisper.cpp/releases/tag/${version}`,
					files,
				},
				null,
				2,
			),
		);
	}
	// Retain the licenses of the independent runtime and redistributable DLLs.
	for (const [name, url] of [
		[
			"LICENSE-whisper.txt",
			`https://raw.githubusercontent.com/ggml-org/whisper.cpp/${version}/LICENSE`,
		],
		["LICENSE-ggml.txt", "https://raw.githubusercontent.com/ggml-org/ggml/master/LICENSE"],
		["LICENSE-SDL2.txt", "https://raw.githubusercontent.com/libsdl-org/SDL/SDL2/LICENSE.txt"],
		["LICENSE-CUDA.html", "https://docs.nvidia.com/cuda/archive/12.4.0/eula/index.html"],
	]) {
		const target = path.join(output, name);
		let present = false;
		try {
			present = (await stat(target)).size > 100;
		} catch {
			/* first stage */
		}
		if (!present) await download(url, target);
	}
	console.log(`Whisper CUDA runtime verified: ${output}`);
}
