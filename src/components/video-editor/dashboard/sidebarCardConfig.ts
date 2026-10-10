// Modified by the OmvaLens fork, 2026-10-10. See FORK_CHANGES.md; AGPL-3.0.
export type SidebarCard = {
	id: string;
	image?: string;
	imageAlt?: string;
	heading: string;
	subheading?: string;
	paragraph?: string;
	href?: string;
	linkLabel?: string;
};

/** Code-only sidebar content. Empty cards or enabled:false hides this area. */
export const sidebarCardConfig: { enabled: boolean; cards: SidebarCard[] } = {
	enabled: false,
	cards: [
		{
			id: "placeholder",
			image: "announcements/placeholder-1.svg",
			imageAlt: "Placeholder banner",
			heading: "Coming soon",
			subheading: "News from OmvaLens",
			paragraph: "A place for updates, tips, and announcements.",
		},
	],
};
