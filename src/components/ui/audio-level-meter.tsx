// Modified by OmvaLens, 2026-10-11: localized interface text. AGPL-3.0.
import { useUiText } from "@/contexts/I18nContext";
import { Meter } from "@heroui/react";
export function AudioLevelMeter({ level, className }: { level: number; className?: string }) {
	const uiText = useUiText();
	return (
		<Meter
			aria-label={uiText("Microphone level")}
			value={Math.min(100, Math.max(0, level))}
			minValue={0}
			maxValue={100}
			size="sm"
			color={level > 85 ? "danger" : level > 65 ? "warning" : "accent"}
			className={className}
		>
			<Meter.Track>
				<Meter.Fill />
			</Meter.Track>
		</Meter>
	);
}
