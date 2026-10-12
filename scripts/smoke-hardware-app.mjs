// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { _electron } from "playwright";

const executablePath = path.resolve(process.argv[2]);
const videoPath = path.resolve(process.argv[3]);
const root = path.resolve(".tmp/gpu-validation/packaged");
await mkdir(root, { recursive: true });
for (const mode of ["auto", "cpu"]) {
	const errors = [];
	const app = await _electron.launch({
		executablePath,
		env: {
			...process.env,
			SCREENRECORDER_USER_DATA_DIR: path.join(root, `profile-${mode}-${Date.now()}`),
			OMVALENS_HARDWARE_MODE: mode,
		},
		timeout: 45000,
	});
	try {
		const dashboard = await app.firstWindow();
		await dashboard.waitForFunction(() => !!window.electronAPI?.getHardwareCapabilities);
		const report = await dashboard.evaluate(() => window.electronAPI.getHardwareCapabilities());
		assert.equal(report.activeMode, mode);
		assert.ok(report.videoEncoder, JSON.stringify(report));
		if (mode === "cpu") {
			assert.equal(report.videoEncoder, "libx264");
			assert.equal(report.whisperRuntime, "cpu");
			assert.equal(report.graphics, "software");
		}
		const selected = await dashboard.evaluate(
			(video) => window.electronAPI.setCurrentVideoPath(video),
			videoPath,
		);
		assert.equal(selected.success, true);
		const opened = app.waitForEvent("window");
		await dashboard.evaluate(() => window.electronAPI.switchToEditor());
		const editor = await opened;
		editor.on("pageerror", (error) => errors.push(error.message));
		await editor.waitForFunction(
			() =>
				[...document.querySelectorAll("video")].some(
					(v) => v.readyState >= 2 && v.duration > 0,
				),
			undefined,
			{ timeout: 45000 },
		);
		const welcome = editor.getByRole("dialog", {
			name: /^(Welcome to|Benvenuto in) OmvaLens$/,
		});
		if (await welcome.isVisible())
			await welcome.getByRole("button", { name: /^(Close|Chiudi)$/ }).click();
		await editor.waitForFunction(
			() =>
				[...document.querySelectorAll("canvas")].some(
					(canvas) => canvas.width > 100 && canvas.height > 100,
				),
			undefined,
			{ timeout: 45000 },
		);
		const contexts = await editor.evaluate(() =>
			[...document.querySelectorAll("canvas")]
				.filter((canvas) => canvas.width > 100 && canvas.height > 100)
				.map((canvas) => {
					const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
					if (!gl) return { width: canvas.width, height: canvas.height, renderer: null };
					const extension = gl.getExtension("WEBGL_debug_renderer_info");
					return {
						width: canvas.width,
						height: canvas.height,
						renderer: extension
							? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)
							: gl.getParameter(gl.RENDERER),
						lost: gl.isContextLost(),
					};
				}),
		);
		assert.ok(
			contexts.some((context) => context.renderer && !context.lost),
			JSON.stringify({ contexts, errors }),
		);
		assert.deepEqual(errors, []);
		await editor.screenshot({ path: path.join(root, `${mode}.png`) });
		const gpuStatus = await app.evaluate(({ app }) => app.getGPUFeatureStatus());
		const finalReport = await editor.evaluate(() =>
			window.electronAPI.getHardwareCapabilities(),
		);
		if (mode === "auto" && contexts.some((context) => /NVIDIA/.test(context.renderer ?? "")))
			assert.equal(finalReport.graphics, "gpu");
		let captions;
		if (process.argv[4] && process.argv[5]) {
			captions = await editor.evaluate(
				(options) => window.electronAPI.generateAutoCaptions(options),
				{
					videoPath: path.resolve(process.argv[5]),
					whisperModelPath: path.resolve(process.argv[4]),
					language: "en",
				},
			);
			assert.equal(captions.success, true, JSON.stringify(captions));
			assert.match(captions.cues.map((cue) => cue.text).join(" "), /country/i);
		}
		await writeFile(
			path.join(root, `${mode}.json`),
			JSON.stringify({ report, finalReport, gpuStatus, contexts, captions, errors }, null, 2),
		);
		console.log(
			`${mode}: ${report.videoEncoder}, Whisper ${report.whisperRuntime}, canvas ${JSON.stringify(contexts)}`,
		);
	} finally {
		await app.close();
	}
}
