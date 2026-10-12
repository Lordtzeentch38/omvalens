// Modified by OmvaLens, 2026-10-11: localized interface text. AGPL-3.0.
// Modified by OmvaLens, 2026-10-12: localized configured sidebar content. AGPL-3.0.
import { useUiText } from "@/contexts/I18nContext";
import { announcementImageSource } from "@/i18n/announcementImage";
import { Card } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { sidebarCardConfig } from "./sidebarCardConfig";

export function SidebarCards() {
	const uiText = useUiText();
	if (!sidebarCardConfig.enabled || sidebarCardConfig.cards.length === 0) return null;
	return (
		<div
			aria-label={uiText("Sidebar announcements")}
			className="mb-4 max-h-[35vh] space-y-3 overflow-y-auto"
		>
			{sidebarCardConfig.cards.map((card) => (
				<Card key={card.id} className="gap-3 overflow-hidden p-3 shadow-none">
					{card.image && (
						<img
							src={announcementImageSource(card.image, uiText)}
							alt={uiText(card.imageAlt ?? "")}
							className="aspect-video w-full rounded-lg object-cover"
						/>
					)}
					<Card.Header className="gap-1 p-0">
						<Card.Title className="text-[13px]">{uiText(card.heading)}</Card.Title>
						{card.subheading && (
							<Card.Description className="text-xs">
								{uiText(card.subheading)}
							</Card.Description>
						)}
					</Card.Header>
					{card.paragraph && (
						<Card.Content className="p-0 text-xs leading-relaxed text-muted">
							{uiText(card.paragraph)}
						</Card.Content>
					)}
					{card.href && (
						<Card.Footer className="p-0">
							<Button
								size="sm"
								variant="secondary"
								onClick={() =>
									void window.electronAPI
										.openExternalUrl(card.href!)
										.then((result) => {
											if (!result.success)
												throw new Error(
													result.error || "Could not open link",
												);
										})
										.catch((error) => toast.error(String(error)))
								}
							>
								{uiText(card.linkLabel ?? "Learn more")}
							</Button>
						</Card.Footer>
					)}
				</Card>
			))}
		</div>
	);
}
