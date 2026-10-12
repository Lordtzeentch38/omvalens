// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { readAppSetting } from "./appSettingsStore";
export const HARDWARE_MODE_KEY = "omvalens.hardwareMode";
export type HardwareMode = "auto" | "cpu";
export function normalizeHardwareMode(value: unknown): HardwareMode {
	return value === "cpu" ? "cpu" : "auto";
}
// A session keeps one policy; changing it takes effect at the next app start.
export const activeHardwareMode = normalizeHardwareMode(
	process.env.OMVALENS_HARDWARE_MODE ?? readAppSetting(HARDWARE_MODE_KEY),
);
