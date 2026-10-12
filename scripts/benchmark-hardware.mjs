// Added by OmvaLens, 2026-10-12. AGPL-3.0.
// Small real-codec/runtime probe; does not certify full edited-project export.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import ffprobe from "ffprobe-static";
const run = promisify(execFile);
const output = path.resolve(".tmp/gpu-validation");
await mkdir(output, { recursive: true });
const results = { video: [], whisper: [] };
for (const encoder of ["h264_nvenc", "libx264"]) {
	const file = path.join(output, `${encoder}.mp4`);
	const started = performance.now();
	try {
		await run(
			ffmpeg,
			[
				"-y",
				"-hide_banner",
				"-loglevel",
				"error",
				"-f",
				"lavfi",
				"-i",
				"testsrc2=size=1280x720:rate=30",
				"-t",
				"5",
				"-c:v",
				encoder,
				"-preset",
				encoder === "libx264" ? "veryfast" : "p4",
				"-b:v",
				"6000k",
				"-pix_fmt",
				"yuv420p",
				file,
			],
			{ timeout: 60000 },
		);
		const elapsedMs = performance.now() - started;
		const { stdout } = await run(
			ffprobe.path,
			[
				"-v",
				"error",
				"-count_frames",
				"-select_streams",
				"v:0",
				"-show_entries",
				"stream=nb_read_frames,width,height,duration",
				"-of",
				"json",
				file,
			],
			{ timeout: 60000 },
		);
		const stream = JSON.parse(stdout).streams[0];
		assert.equal(Number(stream.nb_read_frames), 150);
		assert.equal(stream.width, 1280);
		assert.equal(stream.height, 720);
		results.video.push({ encoder, elapsedMs, stream, success: true });
	} catch (error) {
		results.video.push({ encoder, success: false, error: String(error) });
	}
}
if (process.argv[2] && process.argv[3]) {
	for (const backend of ["cuda", "cpu"]) {
		const executable = path.resolve(
			"electron/native/bin/win32-x64",
			...(backend === "cuda" ? ["whisper-cuda"] : []),
			"whisper-cli.exe",
		);
		const out = path.join(output, `whisper-${backend}`);
		const started = performance.now();
		try {
			const { stderr } = await run(
				executable,
				[
					"-m",
					path.resolve(process.argv[2]),
					"-f",
					path.resolve(process.argv[3]),
					"-l",
					"en",
					"-osrt",
					"-of",
					out,
					...(backend === "cpu" ? ["-ng"] : []),
				],
				{ timeout: 120000, maxBuffer: 5 * 1024 * 1024 },
			);
			const elapsedMs = performance.now() - started;
			await writeFile(`${out}.log`, stderr);
			const text = await readFile(`${out}.srt`, "utf8");
			assert.match(text, /country/i);
			if (backend === "cuda")
				assert.match(stderr, /using CUDA\d+ backend|using CUDA backend/i);
			results.whisper.push({ backend, elapsedMs, text, success: true });
		} catch (error) {
			results.whisper.push({ backend, success: false, error: String(error) });
		}
	}
}
await writeFile(path.join(output, "benchmark.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.video.some((item) => !item.success) || results.whisper.some((item) => !item.success))
	process.exitCode = 1;
