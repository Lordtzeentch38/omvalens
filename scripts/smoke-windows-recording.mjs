// ScreenRecorder fork, 2026-10-10. AGPL-3.0; see FORK_CHANGES.md.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import ffmpeg from "ffmpeg-static";
import ffprobe from "ffprobe-static";
import { _electron } from "playwright";

if (process.platform !== "win32") {
	throw new Error("This recording smoke test requires Windows.");
}
const root = process.cwd();
const artifacts = path.join(root, ".tmp", "windows-smoke");
await mkdir(artifacts, { recursive: true });
const fixture = await _electron.launch({
	args: [path.join(root, "scripts", "fixtures", "windows-native-smoke.cjs")],
});
let helper;
try {
	await fixture.firstWindow();
	const handle = await fixture.evaluate(({ BrowserWindow }) => {
		const bytes = globalThis.screenRecorderTestWindow.getNativeWindowHandle();
		return (
			bytes.length === 8 ? bytes.readBigUInt64LE() : BigInt(bytes.readUInt32LE())
		).toString();
	});
	const nativeModule = await fixture.evaluate(() => globalThis.screenRecorderNativeReady);
	assert.ok(nativeModule, "uiohook must load in the real Electron runtime");
	const video = path.join(artifacts, "capture.mp4");
	const config = {
		windowHandle: Number(handle),
		outputPath: video,
		fps: 30,
		width: 800,
		height: 600,
	};
	helper = spawn(
		path.join(root, "electron/native/bin/win32-x64/wgc-capture.exe"),
		[JSON.stringify(config)],
		{
			windowsHide: true,
			stdio: ["pipe", "pipe", "pipe"],
		},
	);
	let stdout = "";
	let stderr = "";
	helper.stdout.on("data", (chunk) => {
		stdout += chunk;
	});
	helper.stderr.on("data", (chunk) => {
		stderr += chunk;
	});
	const completion = new Promise((resolve, reject) => {
		helper.on("error", reject);
		helper.on("exit", (code) => resolve(code));
	});
	for (let attempt = 0; attempt < 150 && !stdout.includes("Recording started"); attempt++) {
		assert.equal(helper.exitCode, null, `Capture exited before startup: ${stderr}`);
		await delay(100);
	}
	assert.ok(stdout.includes("Recording started"), `Capture startup timed out: ${stderr}`);
	await delay(2500);
	await fixture.evaluate(({ BrowserWindow }) => {
		const bounds = globalThis.screenRecorderTestWindow.getBounds();
		const overlay = new BrowserWindow({
			...bounds,
			alwaysOnTop: true,
			backgroundColor: "#ff00ff",
		});
		overlay.loadURL(
			"data:text/html,<body style='margin:0;background:%23ff00ff'>Overlapping window must not be recorded</body>",
		);
	});
	helper.stdin.write("pause\n");
	await delay(700);
	helper.stdin.write("resume\n");
	await delay(1000);
	await fixture.evaluate(() => globalThis.screenRecorderTestWindow.setSize(600, 600));
	await delay(1500);
	helper.stdin.write("stop\n");
	let stopTimer;
	const code = await Promise.race([
		completion,
		new Promise((_, reject) => {
			stopTimer = setTimeout(() => reject(new Error("Capture stop timed out")), 15000);
		}),
	]).finally(() => clearTimeout(stopTimer));
	await writeFile(path.join(artifacts, "capture.log"), `${stdout}\n${stderr}`);
	assert.equal(code, 0, `Native capture failed: ${stderr}`);
	const probe = (file) =>
		JSON.parse(
			execFileSync(
				ffprobe.path,
				["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
				{ encoding: "utf8", windowsHide: true },
			),
		);
	const captured = probe(video);
	const duration = Number(captured.format.duration);
	assert.ok(
		duration >= 4 && duration <= 7,
		`Unexpected duration after pause/resume: ${duration}`,
	);
	assert.ok(
		captured.streams.some(
			(stream) =>
				stream.codec_name === "h264" && stream.width === 800 && stream.height === 600,
		),
	);
	const checksums = execFileSync(
		ffmpeg,
		["-v", "error", "-i", video, "-vf", "fps=2", "-f", "framemd5", "-"],
		{ encoding: "utf8", windowsHide: true },
	);
	const frameHashes = checksums
		.split("\n")
		.filter((line) => line && !line.startsWith("#"))
		.map((line) => line.split(",").at(-1).trim());
	assert.ok(new Set(frameHashes).size > 2, "Recorded frames must contain changing test content");
	const pixel = execFileSync(
		ffmpeg,
		[
			"-v",
			"error",
			"-ss",
			"4",
			"-i",
			video,
			"-vf",
			"crop=1:1:30:300,format=rgb24",
			"-frames:v",
			"1",
			"-f",
			"rawvideo",
			"-",
		],
		{ windowsHide: true },
	);
	assert.ok(
		pixel.length === 3 && pixel[0] < 80 && pixel[1] < 110 && pixel[2] > 60,
		`Expected blue test window under overlay, got RGB ${[...pixel]}`,
	);
	const padding = execFileSync(
		ffmpeg,
		[
			"-v",
			"error",
			"-ss",
			"4",
			"-i",
			video,
			"-vf",
			"crop=1:1:780:300,format=rgb24",
			"-frames:v",
			"1",
			"-f",
			"rawvideo",
			"-",
		],
		{ windowsHide: true },
	);
	assert.ok(
		padding.length === 3 && [...padding].every((value) => value < 30),
		`Shrinking the window must pad with black, got RGB ${[...padding]}`,
	);
	const exported = path.join(artifacts, "export.mp4");
	execFileSync(
		ffmpeg,
		[
			"-y",
			"-v",
			"error",
			"-i",
			video,
			"-vf",
			"scale=640:480",
			"-c:v",
			"libx264",
			"-pix_fmt",
			"yuv420p",
			exported,
		],
		{ windowsHide: true, timeout: 30000 },
	);
	const result = probe(exported);
	assert.equal(result.streams[0].width, 640);
	assert.equal(result.streams[0].height, 480);
	assert.ok(Math.abs(Number(result.format.duration) - duration) < 0.2);
	execFileSync(ffmpeg, ["-v", "error", "-i", exported, "-f", "null", "-"], {
		windowsHide: true,
		timeout: 30000,
	});
	execFileSync(path.join(root, "electron/native/bin/win32-x64/whisper-cli.exe"), ["--help"], {
		windowsHide: true,
		stdio: "pipe",
		timeout: 15000,
	});
	await writeFile(
		path.join(artifacts, "result.json"),
		JSON.stringify(
			{
				electron: await fixture.evaluate(() => process.versions.electron),
				duration,
				frames: frameHashes.length,
				distinctFrames: new Set(frameHashes).size,
				captured,
				exported: result,
			},
			null,
			2,
		),
	);
	console.log(
		`Windows native capture, pause/resume, H.264 encoding, FFmpeg conversion, decode, Whisper runtime and Electron native module passed. Artifacts: ${artifacts}`,
	);
} finally {
	if (helper && helper.exitCode === null) helper.kill();
	await fixture.close();
}
