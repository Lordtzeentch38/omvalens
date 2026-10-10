// Modified by the ScreenRecorder fork, 2026-10-10. See FORK_CHANGES.md; AGPL-3.0.
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

let root: string;
beforeEach(async () => {
	root = await fs.mkdtemp(path.join(os.tmpdir(), "screenrecorder-startup-test-"));
	vi.resetModules();
	vi.stubEnv("SCREENRECORDER_USER_DATA_DIR", "");
});

it("isolates an explicitly configured data directory from the user's projects", async () => {
	const custom = path.join(root, "isolated-profile");
	vi.stubEnv("SCREENRECORDER_USER_DATA_DIR", custom);
	const paths = new Map<string, string>([["appData", root]]);
	vi.doMock("electron", () => ({
		app: {
			getPath: (name: string) => paths.get(name),
			setPath: (name: string, value: string) => {
				if (!existsSync(value)) throw new Error("Missing data directory");
				paths.set(name, value);
			},
		},
	}));
	const { USER_DATA_PATH, RECORDINGS_DIR } = await import("./appPaths");
	expect(USER_DATA_PATH).toBe(custom);
	expect(RECORDINGS_DIR).toBe(path.join(custom, "recordings"));
	expect(paths.get("sessionData")).toBe(path.join(custom, "session"));
	expect(await fs.readdir(root)).toEqual(["isolated-profile"]);
});
afterEach(async () => {
	vi.unstubAllEnvs();
	vi.doUnmock("electron");
	vi.resetModules();
	if (
		path.dirname(root) !== path.resolve(os.tmpdir()) ||
		!path.basename(root).startsWith("screenrecorder-startup-test-")
	)
		throw new Error("Invalid startup test cleanup path");
	await fs.rm(root, { recursive: true, force: true });
});

it.each([
	false,
	true,
])("prepares its own existing data directories before Electron starts (development: %s)", async (development) => {
	vi.stubEnv("VITE_DEV_SERVER_URL", development ? "http://localhost:5173" : "");
	const paths = new Map<string, string>([["appData", root]]);
	vi.doMock("electron", () => ({
		app: {
			getPath: (name: string) => paths.get(name),
			setPath: (name: string, value: string) => {
				if (!existsSync(value)) throw new Error("Electron requires existing directories");
				paths.set(name, value);
			},
		},
	}));
	const { USER_DATA_PATH, RECORDINGS_DIR } = await import("./appPaths");
	expect(USER_DATA_PATH).toBe(
		path.join(root, development ? "ScreenRecorder-dev" : "ScreenRecorder"),
	);
	expect(paths.get("sessionData")).toBe(path.join(USER_DATA_PATH, "session"));
	expect(RECORDINGS_DIR).toBe(path.join(USER_DATA_PATH, "recordings"));
	expect(await fs.readdir(root)).not.toContain("Recordly");
});
