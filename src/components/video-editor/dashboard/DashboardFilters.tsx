// Modified by OmvaLens, 2026-10-11: localized interface text. AGPL-3.0.
import { useUiText } from "@/contexts/I18nContext";
import type { DashboardProps } from "./types";
import { Dropdown } from "@heroui/react";
import { CaretDown, Trash } from "@/components/ui/icons";

import { Button } from "@/components/ui/button";

import type { DashboardModel } from "./useDashboardModel";

export function DashboardFilters({
	isRaw,
	period,
	setPeriod,
	selecting,
	setSelecting,
	selected,
	setSelected,
	sort,
	setSort,
	visible,
	busy,
	deleteEntries,
	hideSelection = false,
}: Pick<
	DashboardModel & DashboardProps,
	| "isRaw"
	| "period"
	| "setPeriod"
	| "selecting"
	| "setSelecting"
	| "selected"
	| "setSelected"
	| "sort"
	| "setSort"
	| "visible"
	| "busy"
	| "deleteEntries"
> & { hideSelection?: boolean }) {
	const uiText = useUiText();
	return (
		<>
			<div className="flex items-center gap-3 px-7 pb-7 lg:px-10">
				<div className="flex gap-2" aria-label={uiText("Time filters")}>
					{[
						["all", "All"],
						["week", "Last 7 days"],
						["month", "Last 30 days"],
					].map(([id, label]) => (
						<Button
							key={id}
							variant="ghost"
							size="sm"
							aria-pressed={period === id}
							onClick={() => setPeriod(id)}
							className={`h-7 rounded-lg px-3 text-xs ${period === id ? "bg-default/60 text-foreground" : "text-muted-foreground"}`}
						>
							{uiText(label)}
						</Button>
					))}
					{!hideSelection && (
						<Button
							variant="ghost"
							size="icon"
							className="size-7 min-w-7 text-danger"
							aria-label={
								isRaw
									? uiText("Select raw files to remove")
									: uiText("Select projects to delete")
							}
							aria-pressed={selecting}
							onClick={() => {
								setSelecting(!selecting);
								setSelected([]);
							}}
						>
							<Trash weight="fill" className="size-4" />
						</Button>
					)}
				</div>
				<div className="ml-auto">
					<Dropdown>
						<Button
							variant="ghost"
							size="sm"
							aria-label={isRaw ? uiText("Sort raw files") : uiText("Sort projects")}
							className="h-7 gap-2 text-xs text-muted-foreground"
						>
							{sort === "recent"
								? isRaw
									? uiText("Last created")
									: uiText("Last edited")
								: sort === "created"
									? uiText("Last created")
									: uiText("Name")}
							<CaretDown className="size-3" />
						</Button>
						<Dropdown.Popover>
							<Dropdown.Menu
								aria-label={
									isRaw ? uiText("Sort raw files") : uiText("Sort projects")
								}
							>
								{!isRaw && (
									<Dropdown.Item id="recent" onAction={() => setSort("recent")}>
										{uiText("Last edited")}
									</Dropdown.Item>
								)}
								<Dropdown.Item id="created" onAction={() => setSort("created")}>
									{uiText("Last created")}
								</Dropdown.Item>
								<Dropdown.Item id="name" onAction={() => setSort("name")}>
									{uiText("Name")}
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown.Popover>
					</Dropdown>
				</div>
			</div>
			{selecting && (
				<div className="flex items-center gap-3 px-7 pb-5 text-xs lg:px-10">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSelected(visible.map((e) => e.path))}
					>
						{uiText("Select all")}
					</Button>
					<span>
						{selected.length} {uiText("selected")}
					</span>
					<Button
						variant="destructive"
						size="sm"
						disabled={!selected.length || busy}
						onClick={() => void deleteEntries(selected)}
					>
						{isRaw ? uiText("Remove") : uiText("Delete")}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSelecting(false);
							setSelected([]);
						}}
					>
						{uiText("Cancel")}
					</Button>
				</div>
			)}
		</>
	);
}
