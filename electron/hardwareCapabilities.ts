// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { app } from "electron";
import { existsSync } from "node:fs";
import type { HardwareCapabilities } from "../src/types/hardware";
import { activeHardwareMode, HARDWARE_MODE_KEY, normalizeHardwareMode } from "./hardwarePreference";
import { readAppSetting } from "./appSettingsStore";
import { getBundledWhisperGpuExecutableCandidates } from "./ipc/paths/binaries";
import { resolveNativeVideoEncoder } from "./ipc/export/native-video";
import { getFfmpegBinaryPath } from "./ipc/ffmpeg/binary";

export async function getHardwareCapabilities(): Promise<HardwareCapabilities> {
	const result: HardwareCapabilities = {
		activeMode: activeHardwareMode,
		selectedMode: normalizeHardwareMode(readAppSetting(HARDWARE_MODE_KEY)),
		graphics: "unavailable",
		devices: [],
		videoEncoder: null,
		whisperRuntime: "cpu",
		errors: [],
	};
	try {
		let deadline: ReturnType<typeof setTimeout> | undefined;
		try {
			const info = (await Promise.race([
				app.getGPUInfo("basic"),
				new Promise<never>((_, reject) => {
					deadline = setTimeout(() => reject(Error("GPU detection timed out")), 5000);
				}),
			])) as {
				gpuDevice?: { deviceString?: string; vendorString?: string; vendorId?: number }[];
			};
			result.devices = [
				...new Set(
					(info.gpuDevice ?? []).map(
						(gpu) =>
							gpu.deviceString || gpu.vendorString || `GPU ${gpu.vendorId ?? ""}`,
					),
				),
			];
		} finally {
			clearTimeout(deadline);
		}
		// GPU feature status is reliable after GPU information has initialized.
		// Pixi WebGL can be accelerated even when window compositing is software.
		const status = app.getGPUFeatureStatus();
		result.graphics =
			activeHardwareMode !== "cpu" &&
			(status.webgl === "enabled" || status.gpu_compositing === "enabled")
				? "gpu"
				: "software";
	} catch (error) {
		result.errors.push(String(error));
	}
	try {
		result.videoEncoder = await resolveNativeVideoEncoder(getFfmpegBinaryPath(), "balanced");
	} catch (error) {
		result.errors.push(String(error));
	}
	if (activeHardwareMode !== "cpu") {
		result.whisperRuntime = getBundledWhisperGpuExecutableCandidates().some(existsSync)
			? "cuda"
			: process.platform === "darwin"
				? "platform"
				: "cpu";
	}
	return result;
}
