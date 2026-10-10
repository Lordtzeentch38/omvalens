// Modified by the ScreenRecorder fork, 2026-10-10. See FORK_CHANGES.md; AGPL-3.0.
// Original geometric icon for this fork; no upstream branding assets are reused.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const table = Array.from({ length: 256 }, (_, i) => {
	let c = i;
	for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
	return c >>> 0;
});
function chunk(name, data) {
	const payload = Buffer.concat([Buffer.from(name), data]);
	let crc = 0xffffffff;
	for (const byte of payload) crc = (crc >>> 8) ^ table[(crc ^ byte) & 255];
	const head = Buffer.alloc(4),
		tail = Buffer.alloc(4);
	head.writeUInt32BE(data.length);
	tail.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
	return Buffer.concat([head, payload, tail]);
}
function png(size) {
	const rows = Buffer.alloc((size * 4 + 1) * size);
	const segments = [
		[0.72, 0.27, 0.34, 0.27],
		[0.34, 0.27, 0.27, 0.34],
		[0.27, 0.34, 0.27, 0.66],
		[0.27, 0.66, 0.34, 0.73],
		[0.34, 0.73, 0.66, 0.73],
		[0.66, 0.73, 0.73, 0.66],
		[0.73, 0.66, 0.73, 0.49],
	];
	function colorAt(u, v) {
		const tile =
			Math.hypot(Math.max(0.23 - u, 0, u - 0.77), Math.max(0.23 - v, 0, v - 0.77)) <= 0.19;
		if (!tile) return [0, 0, 0, 0];
		let color = [
			Math.round(17 + 10 * (1 - v)),
			Math.round(26 + 14 * (1 - v)),
			Math.round(41 + 14 * (1 - v)),
			255,
		];
		for (const [ax, ay, bx, by] of segments) {
			const dx = bx - ax,
				dy = by - ay;
			const t = Math.max(
				0,
				Math.min(1, ((u - ax) * dx + (v - ay) * dy) / (dx * dx + dy * dy)),
			);
			if (Math.hypot(u - ax - t * dx, v - ay - t * dy) < 0.036) color = [55, 219, 195, 255];
		}
		if (u >= 0.43 && u <= 0.615 && Math.abs(v - 0.5) < (0.615 - u) * 0.7)
			color = [242, 249, 255, 255];
		if (Math.hypot(u - 0.76, v - 0.29) < 0.059) color = [255, 103, 112, 255];
		return color;
	}
	for (let y = 0; y < size; y++)
		for (let x = 0; x < size; x++) {
			const color = [0, 0, 0, 0];
			for (let sy = 0; sy < 4; sy++)
				for (let sx = 0; sx < 4; sx++) {
					const sample = colorAt(
						(x + (sx + 0.5) / 4) / size,
						(y + (sy + 0.5) / 4) / size,
					);
					for (let i = 0; i < 4; i++) color[i] += sample[i] / 16;
				}
			const offset = y * (size * 4 + 1) + 1 + x * 4;
			rows.set(color, offset);
		}
	const header = Buffer.alloc(13);
	header.writeUInt32BE(size);
	header.writeUInt32BE(size, 4);
	header[8] = 8;
	header[9] = 6;
	return Buffer.concat([
		Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
		chunk("IHDR", header),
		chunk("IDAT", deflateSync(rows)),
		chunk("IEND", Buffer.alloc(0)),
	]);
}
const publicDir = path.join(root, "public", "app-icons");
const buildDir = path.join(root, "build", "omvalens");
await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(publicDir, { recursive: true });
for (const size of [16, 32, 64, 128, 256, 512, 1024]) {
	const data = png(size);
	await fs.writeFile(path.join(publicDir, `omvalens-${size}.png`), data);
	if (size === 256) {
		const header = Buffer.alloc(22);
		header.writeUInt16LE(1, 2);
		header.writeUInt16LE(1, 4);
		header.writeUInt16LE(1, 10);
		header.writeUInt16LE(32, 12);
		header.writeUInt32LE(data.length, 14);
		header.writeUInt32LE(22, 18);
		await fs.writeFile(path.join(buildDir, "icon.ico"), Buffer.concat([header, data]));
	}
}
const macChunks = [
	["ic09", png(512)],
	["ic10", png(1024)],
].map(([name, data]) => {
	const header = Buffer.alloc(8);
	header.write(name);
	header.writeUInt32BE(data.length + 8, 4);
	return Buffer.concat([header, data]);
});
const macHeader = Buffer.alloc(8);
macHeader.write("icns");
macHeader.writeUInt32BE(8 + macChunks.reduce((sum, data) => sum + data.length, 0), 4);
await fs.writeFile(path.join(buildDir, "icon.icns"), Buffer.concat([macHeader, ...macChunks]));
await fs.writeFile(
	path.join(publicDir, "omvalens.svg"),
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><title>OmvaLens</title><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#1b2837"/><stop offset="1" stop-color="#111a29"/></linearGradient></defs><rect x="4" y="4" width="92" height="92" rx="19" fill="url(#bg)"/><path d="M72 27H34L27 34V66L34 73H66L73 66V49" fill="none" stroke="#37dbc3" stroke-width="7.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 37.05L61.5 50L43 62.95Z" fill="#f2f9ff"/><circle cx="76" cy="29" r="5.9" fill="#ff6770"/></svg>\n`,
);
