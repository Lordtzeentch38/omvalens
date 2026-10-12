import { afterEach, describe, expect, it, vi } from "vitest";

import {
	getOrderedSupportedMp4EncoderCandidates,
	resolveSupportedMp4EncoderPath,
} from "./mp4Support";
afterEach(() => vi.unstubAllGlobals());
it("uses only software candidates in CPU mode, ignoring old hardware hints", () => {
	vi.stubGlobal("window", { electronAPI: { getAppSetting: () => "cpu" } });
	const candidates = getOrderedSupportedMp4EncoderCandidates({
		preferredEncoderPath: { codec: "avc1.640033", hardwareAcceleration: "prefer-hardware" },
	});
	expect(candidates.length).toBeGreaterThan(0);
	expect(
		candidates.every((candidate) => candidate.hardwareAcceleration === "prefer-software"),
	).toBe(true);
});
it("retries software when querying the hardware driver throws", async () => {
	const probe = vi.fn(async (config: VideoEncoderConfig) => {
		if (config.hardwareAcceleration === "prefer-hardware") throw Error("driver unavailable");
		return { supported: true, config };
	});
	vi.stubGlobal("VideoEncoder", { isConfigSupported: probe });
	expect(
		await resolveSupportedMp4EncoderPath({
			width: 640,
			height: 360,
			frameRate: 30,
			bitrate: 4000000,
		}),
	).toMatchObject({ hardwareAcceleration: "prefer-software" });
	expect(probe).toHaveBeenCalledTimes(2);
});

describe("getOrderedSupportedMp4EncoderCandidates", () => {
	it("keeps hardware candidates ahead of a preferred software hint", () => {
		const candidates = getOrderedSupportedMp4EncoderCandidates({
			codec: "avc1.640033",
			preferredEncoderPath: {
				codec: "avc1.640033",
				hardwareAcceleration: "prefer-software",
			},
		});

		expect(candidates[0]).toEqual({
			codec: "avc1.640033",
			hardwareAcceleration: "prefer-hardware",
		});
		expect(candidates[1]).toEqual({
			codec: "avc1.4d4033",
			hardwareAcceleration: "prefer-hardware",
		});
		expect(candidates).toContainEqual({
			codec: "avc1.640033",
			hardwareAcceleration: "prefer-software",
		});
		expect(
			candidates.findIndex((candidate) => {
				return (
					candidate.codec === "avc1.640033" &&
					candidate.hardwareAcceleration === "prefer-software"
				);
			}),
		).toBeGreaterThan(
			candidates.findIndex((candidate) => {
				return (
					candidate.codec === "avc1.42001f" &&
					candidate.hardwareAcceleration === "prefer-hardware"
				);
			}),
		);
	});

	it("preserves a preferred hardware path at the front of the list", () => {
		const candidates = getOrderedSupportedMp4EncoderCandidates({
			codec: "avc1.640033",
			preferredEncoderPath: {
				codec: "avc1.4d401f",
				hardwareAcceleration: "prefer-hardware",
			},
		});

		expect(candidates[0]).toEqual({
			codec: "avc1.4d401f",
			hardwareAcceleration: "prefer-hardware",
		});
	});
});
