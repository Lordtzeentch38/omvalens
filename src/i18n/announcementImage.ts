// Added by OmvaLens, 2026-10-12: localize bundled SVG placeholder text. AGPL-3.0.
import first from "./assets/placeholder-1.svg?raw";
import second from "./assets/placeholder-2.svg?raw";

const placeholders: Record<string, string> = {
	"announcements/placeholder-1.svg": first,
	"announcements/placeholder-2.svg": second,
};
export function announcementImageSource(
	source: string,
	translate: (text: string) => string,
): string {
	const svg = placeholders[source];
	if (!svg)
		return /^(https?:|data:|\/)/.test(source) ? source : `${import.meta.env.BASE_URL}${source}`;
	const localized = svg.replace(
		/(<text\b[^>]*>)([^<]*)(<\/text>)/g,
		(_match, open, text, close) => {
			const escaped = translate(text).replace(
				/[&<>"']/g,
				(character) =>
					({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[
						character
					]!,
			);
			return `${open}${escaped}${close}`;
		},
	);
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(localized)}`;
}
