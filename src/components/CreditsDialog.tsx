// Added 2026-10-10; localized by OmvaLens, 2026-10-11. AGPL-3.0; see FORK_CHANGES.md.
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/contexts/I18nContext";
import { APP_NAME } from "@/lib/forkIdentity";

export function CreditsDialog() {
	const { t } = useI18n();
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" className="justify-start text-muted-foreground">
					{t("common.credits.trigger")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{APP_NAME}</DialogTitle>
					<DialogDescription>{t("common.credits.description")}</DialogDescription>
				</DialogHeader>
				<img
					src={`${import.meta.env.BASE_URL}app-icons/omvalens-128.png`}
					alt=""
					className="size-16 rounded-2xl"
				/>
				<p className="text-sm">{t("common.credits.upstream")}</p>
				<p className="text-sm text-muted-foreground">{t("common.credits.changes")}</p>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						onClick={() =>
							void window.electronAPI.openExternalUrl(
								"https://github.com/webadderallorg/Recordly",
							)
						}
					>
						{t("common.credits.originalProject")}
					</Button>
					<Button
						variant="outline"
						onClick={() =>
							void window.electronAPI.openExternalUrl(
								"https://git.omvas.mooo.com/LordT78/omvalens",
							)
						}
					>
						{t("common.credits.source")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
