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
	for (let y = 0; y < size; y++)
		for (let x = 0; x < size; x++) {
			const u = (x + 0.5) / size,
				v = (y + 0.5) / size;
			const cornerDistance = Math.hypot(
				Math.max(0.18 - u, 0, u - 0.82),
				Math.max(0.18 - v, 0, v - 0.82),
			);
			let color = [20, 25, 45, cornerDistance < 0.16 ? 255 : 0];
			if (
				u > 0.2 &&
				u < 0.8 &&
				v > 0.26 &&
				v < 0.71 &&
				(u < 0.25 || u > 0.75 || v < 0.31 || v > 0.66)
			)
				color = [132, 155, 255, 255];
			if (u > 0.35 && u < 0.65 && v > 0.77 && v < 0.82) color = [132, 155, 255, 255];
			if (Math.hypot(u - 0.68, v - 0.39) < 0.075) color = [255, 97, 115, 255];
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
const buildDir = path.join(root, "build", "screenrecorder");
await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(publicDir, { recursive: true });
for (const size of [16, 32, 64, 128, 256, 512, 1024]) {
	const data = png(size);
	await fs.writeFile(path.join(publicDir, `screenrecorder-${size}.png`), data);
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
