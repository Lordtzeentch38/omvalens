// Modified by OmvaLens, 2026-10-11: interpolated UI translations. AGPL-3.0.
import { useUiText } from "@/contexts/I18nContext";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { SOURCE_AUDIO_FALLBACK_TOAST_ID } from "@/components/video-editor/audio/audioTypes";

interface UseSourceAudioFallbackParams {
	currentSourcePath: string | null;
	refreshKey?: number;
	summarizeErrorMessage: (message: string) => string;
}

export function useSourceAudioFallback({
	currentSourcePath,
	refreshKey = 0,
	summarizeErrorMessage,
}: UseSourceAudioFallbackParams) {
	const uiText = useUiText();
	const [sourceAudioFallbackPaths, setSourceAudioFallbackPaths] = useState<string[]>([]);
	const [sourceAudioFallbackStartDelayMsByPath, setSourceAudioFallbackStartDelayMsByPath] =
		useState<Record<string, number>>({});
	const previousSourcePathRef = useRef<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		// Refetch when late recording sidecars are finalized after the editor opens.
		void refreshKey;
		const sourceChanged = previousSourcePathRef.current !== currentSourcePath;
		previousSourcePathRef.current = currentSourcePath;
		if (sourceChanged) {
			setSourceAudioFallbackPaths([]);
			setSourceAudioFallbackStartDelayMsByPath({});
		}

		if (!currentSourcePath) {
			return () => {
				cancelled = true;
			};
		}

		void (async () => {
			try {
				const result =
					await window.electronAPI.getVideoAudioFallbackPaths(currentSourcePath);
				if (cancelled) {
					return;
				}
				if (!result.success) {
					if (sourceChanged) {
						setSourceAudioFallbackPaths([]);
						setSourceAudioFallbackStartDelayMsByPath({});
					}
					toast.warning(
						result.error
							? uiText("Could not load companion audio sources: {{value1}}", {
									value1: summarizeErrorMessage(result.error),
								})
							: "Could not load companion audio sources. Playback and export may miss microphone audio.",
						{ id: SOURCE_AUDIO_FALLBACK_TOAST_ID, duration: 10000 },
					);
					return;
				}

				toast.dismiss(SOURCE_AUDIO_FALLBACK_TOAST_ID);
				setSourceAudioFallbackPaths(result.paths ?? []);
				setSourceAudioFallbackStartDelayMsByPath(result.startDelayMsByPath ?? {});
			} catch (error) {
				if (!cancelled) {
					if (sourceChanged) {
						setSourceAudioFallbackPaths([]);
						setSourceAudioFallbackStartDelayMsByPath({});
					}
					toast.warning(
						uiText("Could not load companion audio sources: {{value1}}", {
							value1: summarizeErrorMessage(String(error)),
						}),
						{ id: SOURCE_AUDIO_FALLBACK_TOAST_ID, duration: 10000 },
					);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [uiText, currentSourcePath, refreshKey, summarizeErrorMessage]);

	return { sourceAudioFallbackPaths, sourceAudioFallbackStartDelayMsByPath };
}
