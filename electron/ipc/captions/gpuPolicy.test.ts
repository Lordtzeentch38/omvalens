// Added by OmvaLens, 2026-10-12. AGPL-3.0.
import { expect, it } from "vitest";
import { isWhisperGpuFailure } from "./gpuPolicy";
it("recognizes CUDA/VRAM and loader failures without hiding model or option errors", () => {
	expect(isWhisperGpuFailure({ stderr: "ggml_cuda_init: no CUDA-capable device" })).toBe(true);
	expect(isWhisperGpuFailure(Error("CUDA error: out of memory"))).toBe(true);
	expect(isWhisperGpuFailure({ code: -1073741515 })).toBe(true);
	expect(isWhisperGpuFailure(Error("invalid model file"))).toBe(false);
	expect(isWhisperGpuFailure(Error("unknown argument: -ojf"))).toBe(false);
});
