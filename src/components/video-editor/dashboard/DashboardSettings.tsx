// Modified by OmvaLens, 2026-10-11: localized interface text. AGPL-3.0.
import { useUiText } from "@/contexts/I18nContext";
import { SettingsSections, SettingsCategory } from "../SettingsSections";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SettingsRow } from "../SettingsRow";
import { Switch } from "@/components/ui/switch";
import { supportsHudCaptureProtection } from "@/lib/hudCaptureProtection";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
export const DashboardSettingsContext = createContext<ReactNode>(null);
export function DashboardSettings({ onImportFile }: { onImportFile: () => Promise<void> }) {
	const uiText = useUiText();
	const settingsContent = useContext(DashboardSettingsContext);
	const [directory, setDirectory] = useState("");
	const [recordings, setRecordings] = useState("");
	const [hideHud, setHideHud] = useState(true);
	const [captureSupported, setCaptureSupported] = useState(false);
	const [busy, setBusy] = useState(false);
	const run = async (action: () => Promise<void>) => {
		setBusy(true);
		try {
			await action();
		} catch (error) {
			toast.error(String(error));
		} finally {
			setBusy(false);
		}
	};
	useEffect(() => {
		let active = true;
		void Promise.all([
			window.electronAPI.getRecordingsDirectory(),
			window.electronAPI.getHudOverlayCaptureProtection(),
			window.electronAPI.getPlatform(),
		])
			.then(([directory, protection, platform]) => {
				if (!active) return;
				if (directory.success) setRecordings(directory.path);
				if (protection.success) setHideHud(protection.enabled);
				setCaptureSupported(supportsHudCaptureProtection(platform));
			})
			.catch((error) => toast.error(String(error)));
		return () => {
			active = false;
		};
	}, []);
	return (
		<section
			aria-label={uiText("Dashboard settings")}
			className="dashboard-settings max-w-2xl py-10"
		>
			<h1 className="mb-8 text-lg font-semibold">{uiText("Settings")}</h1>
			<SettingsSections categories={["general", "motion", "recording", "files", "advanced"]}>
				<SettingsCategory category={["general", "motion", "advanced"]}>
					{settingsContent}
				</SettingsCategory>
				<SettingsCategory category="files">
					<SettingsRow title={uiText("Open video or project")}>
						<Button
							variant="secondary"
							size="sm"
							disabled={busy}
							onClick={() => void run(onImportFile)}
						>
							{uiText("Open file")}
						</Button>
					</SettingsRow>
				</SettingsCategory>
				<SettingsCategory category="recording">
					<SettingsRow
						title={uiText("Recordings folder")}
						description={
							<span className="block truncate" title={recordings}>
								{recordings}
							</span>
						}
					>
						<Button
							variant="secondary"
							size="sm"
							disabled={busy}
							onClick={() =>
								void run(async () => {
									const result =
										await window.electronAPI.chooseRecordingsDirectory();
									if (result.canceled) return;
									if (!result.success || !result.path)
										throw Error(uiText("Could not change recordings folder"));
									setRecordings(result.path);
								})
							}
						>
							{uiText("Change folder")}
						</Button>
					</SettingsRow>
					{captureSupported && (
						<SettingsRow
							title={uiText("Hide HUD from recordings")}
							description={uiText(
								"Only while recording. The idle HUD stays visible in captures.",
							)}
						>
							<Switch
								aria-label={uiText("Hide HUD from recordings")}
								checked={hideHud}
								disabled={busy}
								onCheckedChange={(enabled) =>
									void run(async () => {
										const result =
											await window.electronAPI.setHudOverlayCaptureProtection(
												enabled,
											);
										if (!result.success)
											throw Error(
												uiText("Could not update capture protection"),
											);
										setHideHud(result.enabled);
									})
								}
							/>
						</SettingsRow>
					)}
				</SettingsCategory>
				<SettingsCategory category="advanced">
					{import.meta.env.DEV && (
						<SettingsRow title={uiText("Preview update UI")}>
							<Button
								variant="secondary"
								size="sm"
								disabled={busy}
								onClick={() =>
									void run(async () => {
										await window.electronAPI.previewUpdateToast();
									})
								}
							>
								{uiText("Preview")}
							</Button>
						</SettingsRow>
					)}
				</SettingsCategory>
				<SettingsCategory category="files">
					<SettingsRow
						title={uiText("Projects folder")}
						description={directory || uiText("Named projects save automatically.")}
					>
						<Button
							variant="secondary"
							size="sm"
							onClick={async () => {
								try {
									const result = await window.electronAPI.getProjectsDirectory();
									if (!result.success || !result.path)
										throw Error(uiText("Could not open projects folder"));
									setDirectory(result.path);
									await window.electronAPI.revealInFolder(result.path);
								} catch (e) {
									toast.error(String(e));
								}
							}}
						>
							{uiText("Show folder")}
						</Button>
					</SettingsRow>
					<p className="text-xs text-muted-foreground">
						{uiText(
							"Named projects save automatically. Previews refresh when you return to Projects.",
						)}
					</p>
				</SettingsCategory>
			</SettingsSections>
		</section>
	);
}
