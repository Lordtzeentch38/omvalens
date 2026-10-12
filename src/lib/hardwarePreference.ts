// Added by OmvaLens, 2026-10-12. AGPL-3.0.
export function isCpuMode(): boolean {
	try {
		return window.electronAPI?.getAppSetting?.("omvalens.hardwareMode.active") === "cpu";
	} catch {
		return false;
	}
}
