// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { EventEmitter } from "node:events";
import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ spawn: vi.fn(), remove: vi.fn() }));
vi.mock("electron", () => ({ app: { getPath: () => "/tmp", getAppPath: () => "/app" } }));
vi.mock("../../hardwarePreference", () => ({ activeHardwareMode: "auto" }));
vi.mock("node:child_process", async (original) => ({
	...(await original<typeof import("node:child_process")>()),
	spawn: mocks.spawn,
}));
vi.mock("node:fs/promises", () => ({ default: { rm: mocks.remove } }));
import { probeNativeVideoEncoder } from "./native-video";
afterEach(() => {
	vi.useRealTimers();
	vi.clearAllMocks();
});
function child() {
	const process = Object.assign(new EventEmitter(), {
		stderr: new EventEmitter(),
		stdin: Object.assign(new EventEmitter(), { end: vi.fn() }),
		kill: vi.fn(),
	});
	mocks.spawn.mockReturnValue(process);
	return process;
}
it("uses a frame above NVIDIA's minimum supported dimensions", async () => {
	const process = child();
	const probe = probeNativeVideoEncoder("ffmpeg", "h264_nvenc", "balanced");
	expect(mocks.spawn.mock.calls[0][1]).toContain("256x256");
	expect(process.stdin.end.mock.calls[0][0].length).toBe(256 * 256 * 4);
	process.emit("close", 0);
	expect(await probe).toBe(true);
});
it("a missing native encoder process rejects its candidate without crashing the app", async () => {
	const process = child();
	const probe = probeNativeVideoEncoder("missing-ffmpeg", "h264_nvenc", "balanced");
	process.emit("error", Error("ENOENT"));
	expect(await probe).toBe(false);
});
it("an EPIPE while probing is handled and a hung probe is bounded", async () => {
	vi.useFakeTimers();
	const process = child();
	const probe = probeNativeVideoEncoder("ffmpeg", "h264_nvenc", "balanced");
	process.stdin.emit("error", Error("EPIPE"));
	await vi.advanceTimersByTimeAsync(15000);
	expect(await probe).toBe(false);
	expect(process.kill).toHaveBeenCalledWith("SIGKILL");
});
