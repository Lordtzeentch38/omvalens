// Modified by OmvaLens, 2026-10-12: known UI error messages. AGPL-3.0.
import { currentAppMessage } from "@/i18n/appMessage";
// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { useState } from "react";
import { useScopedT } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { HardwareCapabilities } from "@/types/hardware";
import { SettingsRow } from "./SettingsRow";

export function HardwareAccelerationPanel() {
	const t = useScopedT("settings");
	const [mode, setMode] = useState(() =>
		window.electronAPI?.getAppSetting?.("omvalens.hardwareMode") === "cpu" ? "cpu" : "auto",
	);
	const [report, setReport] = useState<HardwareCapabilities | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	if (!window.electronAPI?.getHardwareCapabilities) return null;
	const active =
		window.electronAPI.getAppSetting?.("omvalens.hardwareMode.active") === "cpu"
			? "cpu"
			: "auto";
	const inspect = async () => {
		setBusy(true);
		setError("");
		try {
			setReport(await window.electronAPI.getHardwareCapabilities());
		} catch (error) {
			setError(String(error));
		} finally {
			setBusy(false);
		}
	};
	return (
		<section
			className="flex flex-col gap-3"
			aria-label={t("hardware.title", "Hardware acceleration")}
		>
			<SettingsRow
				title={t("hardware.title", "Hardware acceleration")}
				description={t(
					"hardware.description",
					"Use a compatible GPU when available, with a software fallback.",
				)}
			>
				<Switch
					aria-label={t("hardware.title", "Hardware acceleration")}
					checked={mode === "auto"}
					disabled={busy}
					onCheckedChange={(enabled) => {
						const next = enabled ? "auto" : "cpu";
						if (window.electronAPI.setAppSetting("omvalens.hardwareMode", next)) {
							setMode(next);
							setError("");
						} else
							setError(
								t("hardware.saveError", "Could not save the hardware preference."),
							);
					}}
				/>
			</SettingsRow>
			{active !== mode && (
				<p role="status" className="text-xs text-muted-foreground">
					{t("hardware.restart", "Close and reopen OmvaLens to apply this change.")}
				</p>
			)}
			<Button variant="secondary" size="sm" disabled={busy} onClick={() => void inspect()}>
				{busy
					? t("hardware.checking", "Checking hardware…")
					: t("hardware.check", "Check hardware")}
			</Button>
			{report && (
				<div className="text-xs text-muted-foreground" role="status">
					<p>{report.devices.join(", ") || t("hardware.noDevice", "No GPU detected")}</p>
					<p>
						{t("hardware.graphics", "Preview and composition")}:{" "}
						{report.graphics === "gpu" ? "GPU" : "CPU"}
					</p>
					<p>
						{t("hardware.video", "Video encoding")}:{" "}
						{report.videoEncoder ?? t("hardware.unavailable", "Unavailable")}
					</p>
					<p>
						Whisper:{" "}
						{report.whisperRuntime === "cuda"
							? t("hardware.cuda", "CUDA runtime available")
							: report.whisperRuntime === "platform"
								? t("hardware.platform", "Platform runtime")
								: "CPU"}
					</p>
					<p>
						{t(
							"hardware.note",
							"Availability is checked here; actual use depends on the file and operation. GIF encoding and some effects use the CPU.",
						)}
					</p>
					{report.errors.length > 0 && (
						<p>
							{t(
								"hardware.partial",
								"Some hardware checks failed; the software fallback remains available.",
							)}
						</p>
					)}
				</div>
			)}
			{error && (
				<p role="alert" className="text-xs">
					{currentAppMessage(error)}
				</p>
			)}
		</section>
	);
}
