// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ mode: "auto", initialized: false, fail: false }));
vi.mock("electron", () => ({
	app: {
		getGPUInfo: async () => {
			if (state.fail) throw Error("driver unavailable");
			state.initialized = true;
			return { gpuDevice: [{ deviceString: "RTX" }, { deviceString: "RTX" }] };
		},
		getGPUFeatureStatus: () => ({
			webgl: state.initialized ? "enabled" : "disabled_off",
			gpu_compositing: "disabled_off",
		}),
	},
}));
vi.mock("./hardwarePreference", () => ({
	get activeHardwareMode() {
		return state.mode;
	},
	HARDWARE_MODE_KEY: "omvalens.hardwareMode",
	normalizeHardwareMode: (value: unknown) => (value === "cpu" ? "cpu" : "auto"),
}));
vi.mock("./appSettingsStore", () => ({ readAppSetting: () => "auto" }));
vi.mock("./ipc/paths/binaries", () => ({ getBundledWhisperGpuExecutableCandidates: () => [] }));
vi.mock("./ipc/export/native-video", () => ({ resolveNativeVideoEncoder: async () => "libx264" }));
vi.mock("./ipc/ffmpeg/binary", () => ({ getFfmpegBinaryPath: () => "ffmpeg" }));
import { getHardwareCapabilities } from "./hardwareCapabilities";
beforeEach(() => {
	state.mode = "auto";
	state.initialized = false;
	state.fail = false;
});
it("waits for GPU initialization and reports accelerated WebGL despite software compositing", async () => {
	const report = await getHardwareCapabilities();
	expect(report.graphics).toBe("gpu");
	expect(report.devices).toEqual(["RTX"]);
});
it("keeps CPU mode despite available GPU features", async () => {
	state.mode = "cpu";
	expect((await getHardwareCapabilities()).graphics).toBe("software");
});
it("keeps encoder checks available when GPU information fails", async () => {
	state.fail = true;
	const report = await getHardwareCapabilities();
	expect(report.videoEncoder).toBe("libx264");
	expect(report.graphics).toBe("unavailable");
	expect(report.errors[0]).toContain("driver unavailable");
});
