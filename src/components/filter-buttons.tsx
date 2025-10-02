"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getResourceIcon } from "@/utils/get-resource-icon";

interface FilterButtonsProps {
	activeFilter: string | null;
	onFilterChange: (filter: string | null) => void;
	fileMimeTypes: string[];
	uniqueResourceTypes: string[];
}

const getFilterTooltip = (typeOrMimeType: string): string => {
	switch (typeOrMimeType) {
		case "application/pdf":
			return "Filter by PDFs";
		case "text/markdown":
			return "Filter by markdown files";
		case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		case "application/msword":
			return "Filter by document files";
		case "text/plain":
			return "Filter by text files";
		case "links":
			return "Filter by websites";
		case "text":
			return "Filter by text resources";
		default:
			return "Filter by files";
	}
};

export const FilterButtons = ({
	activeFilter,
	onFilterChange,
	fileMimeTypes,
	uniqueResourceTypes,
}: FilterButtonsProps) => {
	return (
		<div className="flex items-center flex-wrap gap-2 mb-2 px-2">
			{fileMimeTypes.map((mimeType) => (
				<Tooltip key={mimeType}>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"rounded-full text-xs font-medium transition-colors border border-stone-300 dark:border-stone-600",
								activeFilter === mimeType
									? mimeType === "application/pdf"
										? "border-2 border-rose-500 dark:border-rose-700"
										: mimeType === "text/markdown"
											? "border-2 border-green-500 dark:border-green-700"
											: mimeType ===
														"application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
													mimeType ===
														"application/msword"
												? "border-2 border-sky-500 dark:border-sky-700"
												: "border-2 border-purple-500 dark:border-purple-700"
									: "",
							)}
							onClick={() =>
								onFilterChange(
									activeFilter === mimeType
										? null
										: mimeType || null,
								)
							}
						>
							{getResourceIcon(mimeType || "", "size-5")}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{getFilterTooltip(mimeType)}</p>
					</TooltipContent>
				</Tooltip>
			))}
			{uniqueResourceTypes
				.filter((type) => type !== "files")
				.map((type) => (
					<Tooltip key={type}>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"rounded-full transition-colors border border-stone-300 dark:border-stone-600",
									activeFilter === type
										? type === "links"
											? "border-2 border-blue-500 dark:border-blue-700"
											: "border-2 border-gray-500 dark:border-gray-700"
										: "",
								)}
								onClick={() =>
									onFilterChange(
										activeFilter === type ? null : type,
									)
								}
							>
								{getResourceIcon(type, "size-5")}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{getFilterTooltip(type)}</p>
						</TooltipContent>
					</Tooltip>
				))}
		</div>
	);
};
