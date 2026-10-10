// ScreenRecorder fork, 2026-10-10. AGPL-3.0; see FORK_CHANGES.md.
// This fixture supplies its own window so the smoke test never records the desktop.
const { app, BrowserWindow } = require("electron");
const { uIOhook } = require("uiohook-napi");
globalThis.screenRecorderNativeReady =
	typeof uIOhook.start === "function" && typeof uIOhook.stop === "function";
app.whenReady().then(async () => {
	const window = new BrowserWindow({
		width: 800,
		height: 600,
		title: "ScreenRecorder test",
		webPreferences: { backgroundThrottling: false },
	});
	globalThis.screenRecorderTestWindow = window;
	await window.loadURL(
		`data:text/html,${encodeURIComponent(`
<html><body style="margin:0;background:#193760;color:white;font:32px sans-serif">
<h1>ScreenRecorder native capture test</h1>
<p>This window contains only generated test content.</p>
<div style="width:100px;height:100px;background:#ef4444;animation:move 1s infinite alternate"></div>
<style>@keyframes move {to {transform:translateX(500px);background:#22c55e}}</style>
</body></html>`)}`,
	);
});
app.on("window-all-closed", () => app.quit());
