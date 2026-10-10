// Added by the OmvaLens fork, 2026-10-10. AGPL-3.0; see FORK_CHANGES.md.
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
	const { locale } = useI18n();
	const italian = locale === "it";
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" className="justify-start text-muted-foreground">
					{italian ? "Informazioni e crediti" : "About and credits"}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{APP_NAME}</DialogTitle>
					<DialogDescription>
						{italian
							? "Registrazione e montaggio dello schermo · Open source"
							: "Screen recording and editing · Open source"}
					</DialogDescription>
				</DialogHeader>
				<img
					src={`${import.meta.env.BASE_URL}app-icons/omvalens-128.png`}
					alt=""
					className="size-16 rounded-2xl"
				/>
				<p className="text-sm">
					{italian
						? "Basato su Recordly, creato da webadderallorg e dai suoi collaboratori. OmvaLens è un progetto derivato indipendente, distribuito con licenza GNU AGPLv3."
						: "Based on Recordly by webadderallorg and contributors. OmvaLens is an independent derivative, distributed under the GNU AGPLv3 license."}
				</p>
				<p className="text-sm text-muted-foreground">
					{italian
						? "Le nostre modifiche: nuova identità e logo, progetti portabili, controlli prima dell’esportazione, recupero dei backup e correzioni alla cattura delle finestre Windows. Sono conservati i copyright e i riconoscimenti originali."
						: "Our changes: original name and logo, portable projects, export checks, backup recovery and fixes to Windows window capture. Original copyright notices and acknowledgements are retained."}
				</p>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						onClick={() =>
							void window.electronAPI.openExternalUrl(
								"https://github.com/webadderallorg/Recordly",
							)
						}
					>
						{italian ? "Progetto originale" : "Original project"}
					</Button>
					<Button
						variant="outline"
						onClick={() =>
							void window.electronAPI.openExternalUrl(
								"https://git.omvas.mooo.com/LordT78/omvalens",
							)
						}
					>
						{italian ? "Codice di OmvaLens" : "OmvaLens source"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
