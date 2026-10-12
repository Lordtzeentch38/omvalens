// Added by OmvaLens, 2026-10-12. AGPL-3.0.
export interface HardwareCapabilities {
	activeMode: "auto" | "cpu";
	selectedMode: "auto" | "cpu";
	graphics: "gpu" | "software" | "unavailable";
	devices: string[];
	videoEncoder: string | null;
	whisperRuntime: "cuda" | "platform" | "cpu";
	errors: string[];
}
