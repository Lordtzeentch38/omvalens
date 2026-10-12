// Added by OmvaLens, 2026-10-12. AGPL-3.0.
export function isWhisperGpuFailure(error: unknown): boolean {
	const result = error as { message?: string; stderr?: string; code?: number | string };
	const text = `${result?.message ?? error}\n${result?.stderr ?? ""}`;
	return (
		/CUDA error|cuBLAS|ggml_cuda|failed to (?:initialize|initialise).*GPU|no CUDA.capable device|out of (?:device )?memory|GPU.*(?:failed|unavailable|not found)/i.test(
			text,
		) ||
		result?.code === 3221225781 ||
		result?.code === -1073741515
	);
}
