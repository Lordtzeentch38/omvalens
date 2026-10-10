// ScreenRecorder fork, 2026-10-10. AGPL-3.0; see FORK_CHANGES.md.
import assert from "node:assert/strict";
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { _electron } from "playwright";

const executablePath = process.argv[2];
assert.ok(executablePath, "Supply the path to the packaged ScreenRecorder executable");
const artifacts = path.resolve(".tmp", "packaged-app-smoke");
await mkdir(artifacts, { recursive: true });
const app = await _electron.launch({
	executablePath: path.resolve(executablePath),
	env: { ...process.env, SCREENRECORDER_USER_DATA_DIR: path.join(artifacts, "profile") },
	timeout: 30000,
});
try {
	const page = await app.firstWindow();
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.waitForFunction(() => typeof window.electronAPI?.listProjectFiles === "function");
	await page.waitForFunction(() => document.body.innerText.trim().length > 0);
	const result = await page.evaluate(async () => ({
		title: document.title,
		projects: await window.electronAPI.listProjectFiles(),
	}));
	assert.ok(result.title.includes("ScreenRecorder"));
	assert.equal(result.projects.success, true, JSON.stringify(result.projects));
	assert.deepEqual(errors, [], "The packaged renderer must start without uncaught errors");
	const dataPath = await app.evaluate(({ app }) => app.getPath("userData"));
	assert.equal(dataPath, path.join(artifacts, "profile"));
	await page.screenshot({ path: path.join(artifacts, "startup.png") });
	if (process.argv[3]) {
		const video = path.join(artifacts, "profile", "recordings", "smoke-input.mp4");
		await mkdir(path.dirname(video), { recursive: true });
		await copyFile(path.resolve(process.argv[3]), video);
		const selected = await page.evaluate(
			(video) => window.electronAPI.setCurrentVideoPath(video),
			video,
		);
		assert.equal(selected.success, true);
		const opened = app.waitForEvent("window");
		await page.evaluate(() => window.electronAPI.switchToEditor());
		const editor = await opened;
		editor.on("pageerror", (error) => errors.push(error.message));
		await editor.waitForFunction(
			() =>
				[...document.querySelectorAll("video")].some(
					(video) => video.readyState >= 2 && video.duration > 0,
				),
			undefined,
			{ timeout: 30000 },
		);
		const welcome = editor.getByRole("dialog", { name: "Welcome to Recordly" });
		if (await welcome.isVisible()) {
			await welcome.getByRole("button", { name: /^(Close|Chiudi)$/ }).click();
			await welcome.waitFor({ state: "hidden" });
		}
		const archive = path.join(artifacts, "smoke-project.screenrecorder");
		await app.evaluate(({ dialog }, archive) => {
			dialog.showSaveDialog = async () => ({ canceled: false, filePath: archive });
		}, archive);
		await editor.screenshot({ path: path.join(artifacts, "editor-before-transfer.png") });
		await editor
			.getByRole("button", { name: /^(Portable project|Progetto portabile)$/ })
			.click();
		await editor.getByText("Portable project exported", { exact: true }).waitFor();
		assert.ok((await stat(archive)).size > 0);
		const imported = await editor.evaluate(
			(archive) => window.electronAPI.openProjectFileAtPath(archive),
			archive,
		);
		assert.equal(imported.success, true, JSON.stringify(imported));
		assert.notEqual(imported.project.videoPath, video, "Imported media must use its own copy");
		assert.ok((await stat(imported.project.videoPath)).size > 0);
		await editor.screenshot({ path: path.join(artifacts, "editor.png") });
		result.portable = {
			archive,
			imported: imported.success,
			videoPath: imported.project.videoPath,
		};
		assert.deepEqual(
			errors,
			[],
			"Editor startup and portable transfer must have no uncaught errors",
		);
	}
	await writeFile(
		path.join(artifacts, "result.json"),
		JSON.stringify({ ...result, dataPath, errors }, null, 2),
	);
	console.log("Packaged app startup, preload, project IPC and isolated profile passed.");
} finally {
	await app.close();
}
