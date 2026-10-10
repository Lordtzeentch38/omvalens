// Modified by the ScreenRecorder fork, 2026-10-10. See FORK_CHANGES.md; AGPL-3.0.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { app } from "electron";

if (typeof app.setPath === "function") {
	const defaultUserDataPath = path.join(
		app.getPath("appData"),
		process.env["VITE_DEV_SERVER_URL"] ? "ScreenRecorder-dev" : "ScreenRecorder",
	);
	const devUserDataPath = process.env.SCREENRECORDER_USER_DATA_DIR
		? path.resolve(process.env.SCREENRECORDER_USER_DATA_DIR)
		: defaultUserDataPath;
	const sessionDataPath = path.join(devUserDataPath, "session");
	mkdirSync(sessionDataPath, { recursive: true });
	app.setPath("userData", devUserDataPath);
	app.setPath("sessionData", sessionDataPath);
}

export const USER_DATA_PATH = app.getPath("userData");
export const RECORDINGS_DIR = path.join(USER_DATA_PATH, "recordings");
