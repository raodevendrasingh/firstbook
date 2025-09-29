"use client";

import {
	ExternalLinkIcon,
	FileTextIcon,
	LinkIcon,
	Loader2,
	MoreVerticalIcon,
	PlusIcon,
	ScrollText,
	TextInitial,
	TrashIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Resource } from "@/db/schema";
import { useDeleteSource, useFetchSources } from "@/hooks/use-sources";
import { cn } from "@/lib/utils";

interface SourcePanelProps {
	setSourceDialogOpen: (open: boolean) => void;
	className?: string;
	chatId: string;
	onNoSourcesDetected?: () => void;
	selectedResources: Resource[];
	onSelectedResourcesChange: (resources: Resource[]) => void;
}

export const SourcePanel = ({
	setSourceDialogOpen,
	className,
	chatId,
	onNoSourcesDetected,
	selectedResources,
	onSelectedResourcesChange,
}: SourcePanelProps) => {
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

	const { data: sourcesData, isLoading } = useFetchSources(chatId);
	const deleteSourceMutation = useDeleteSource();

	const resources = sourcesData?.success
		? sourcesData.data?.resource || []
		: [];

	const [hasInitializedSelection, setHasInitializedSelection] =
		useState(false);
	const previousResourceIds = useRef<Set<string>>(new Set());

	useEffect(() => {
		if (isLoading) return;

		const currentResourceIds = new Set(resources.map((r) => r.id));
		const newResourceIds = new Set(
			[...currentResourceIds].filter(
				(id) => !previousResourceIds.current.has(id),
			),
		);

		// Initialize selection for first load
		if (resources.length > 0 && !hasInitializedSelection) {
			onSelectedResourcesChange(resources);
			setHasInitializedSelection(true);
			previousResourceIds.current = currentResourceIds;
			return;
		}

		// Auto-select newly added resources
		if (newResourceIds.size > 0) {
			const newResources = resources.filter((r) =>
				newResourceIds.has(r.id),
			);
			onSelectedResourcesChange([...selectedResources, ...newResources]);
		}

		// Update previous resource IDs
		previousResourceIds.current = currentResourceIds;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		resources,
		hasInitializedSelection,
		isLoading,
		onSelectedResourcesChange,
		selectedResources,
	]);

	useEffect(() => {
		if (!onNoSourcesDetected || isLoading) {
			return;
		}

		if (resources.length === 0) {
			const timeoutId = window.setTimeout(() => {
				onNoSourcesDetected();
			}, 1000);

			return () => window.clearTimeout(timeoutId);
		}
	}, [isLoading, onNoSourcesDetected, resources.length]);

	const handleDelete = (id: string) => {
		if (!chatId) return;

		// Optimistically remove the item from selected resources if it was selected
		// We need to get the current selected resources from the parent component
		// For now, we'll let the query invalidation handle the UI update

		setDeletingIds((prev) => {
			const next = new Set(prev);
			next.add(id);
			return next;
		});

		deleteSourceMutation.mutate(
			{ chatId, id },
			{
				onSuccess: () => {
					setTimeout(() => {
						toast.success("Resource deleted successfully");
					}, 50);
				},
				onError: (error) => {
					toast.error(error.message || "Failed to delete resource");
				},
				onSettled: () => {
					setDeletingIds((prev) => {
						const next = new Set(prev);
						next.delete(id);
						return next;
					});
				},
			},
		);
	};

	return (
		<div
			className={cn(
				"relative flex flex-col md:max-w-xs lg:max-w-sm h-[calc(100vh-7.3rem)] md:h-[calc(100vh-4.5rem)] bg-background border border-border w-full rounded-xl overflow-hidden",
				className,
			)}
		>
			<div className="flex flex-1 h-full min-h-0 flex-col gap-2 p-2 overflow-y-auto w-full">
				<Button
					variant="outline"
					className="hidden md:flex rounded-full mb-2"
					onClick={() => setSourceDialogOpen(true)}
				>
					<PlusIcon className="size-4" />
					Add Sources
				</Button>
				{isLoading ? (
					<div className="flex items-center justify-center h-32 gap-2">
						<div className="text-sm text-muted-foreground">
							Loading sources
						</div>
						<Loader2 className="animate-spin size-4" />
					</div>
				) : resources && resources.length > 0 ? (
					<>
						<div className="mb-2 flex items-center justify-between px-3 py-1 rounded-lg">
							<span className="text-sm font-medium text-muted-foreground">
								Select all sources
							</span>
							<Checkbox
								checked={resources.every((res) =>
									selectedResources.some(
										(selected) => selected.id === res.id,
									),
								)}
								onCheckedChange={(checked) => {
									if (checked) {
										onSelectedResourcesChange(resources);
									} else {
										onSelectedResourcesChange([]);
									}
								}}
								className="cursor-pointer"
							/>
						</div>
						{resources.map((res) => (
							<div key={res.id} className="flex flex-col gap-2">
								<div className="group py-1 px-3 h-10 rounded-lg bg-accent/80 flex items-center gap-3 hover:bg-accent transition-colors relative">
									<div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
										<span
											className={cn(
												"transition-opacity text-primary rounded-md p-1",
												openDropdownId === res.id
													? "opacity-0"
													: "opacity-100 group-hover:opacity-0",
											)}
										>
											{res.type === "links" ? (
												<LinkIcon className="size-4" />
											) : res.type === "files" ? (
												<FileTextIcon className="size-4" />
											) : (
												<TextInitial className="size-4" />
											)}
										</span>
										<span
											className={`absolute inset-0 transition-opacity ${
												openDropdownId === res.id
													? "opacity-100"
													: "opacity-0 group-hover:opacity-100"
											}`}
										>
											<DropdownMenu
												onOpenChange={(open) => {
													setOpenDropdownId(
														open ? res.id : null,
													);
												}}
											>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-4 w-4 p-0 cursor-pointer hover:bg-background/50"
													>
														<MoreVerticalIcon className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="start"
													className="w-48 rounded-xl"
												>
													<DropdownMenuItem
														onClick={() => {
															window.open(
																res.source ??
																	"",
																"_blank",
															);
														}}
														className="cursor-pointer rounded-lg"
													>
														<ExternalLinkIcon className="h-4 w-4 mr-2" />
														Open Resource
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															handleDelete(
																res.id,
															);
														}}
														className="cursor-pointer text-destructive focus:text-destructive rounded-lg"
														variant="destructive"
													>
														{deletingIds.has(
															res.id,
														) ? (
															<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														) : (
															<TrashIcon className="h-4 w-4 mr-2" />
														)}
														Delete Resource
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</span>
									</div>

									<span
										title={res.title}
										className="flex flex-col items-start min-w-0 flex-1 max-h-10 overflow-hidden cursor-default"
									>
										<p className="text-sm font-medium line-clamp-1">
											{res.title}
										</p>
									</span>

									<Checkbox
										checked={selectedResources.some(
											(selected) =>
												selected.id === res.id,
										)}
										onCheckedChange={() => {
											const isCurrentlySelected =
												selectedResources.some(
													(selected) =>
														selected.id === res.id,
												);

											const newResources =
												isCurrentlySelected
													? selectedResources.filter(
															(selected) =>
																selected.id !==
																res.id,
														)
													: [
															...selectedResources,
															res,
														];

											onSelectedResourcesChange(
												newResources,
											);
										}}
										className="cursor-pointer"
									/>
								</div>
							</div>
						))}
					</>
				) : (
					<div className="flex flex-col gap-3 mt-48 items-center justify-center p-2">
						<ScrollText
							size={48}
							className="text-muted-foreground"
						/>
						<span className="flex flex-col gap-1">
							<p className="text-base text-center font-medium text-muted-foreground">
								Saved resources will appear here
							</p>
							<p className="text-sm text-center text-muted-foreground">
								Click Add source button to add web sources to
								your notebook
							</p>
						</span>
					</div>
				)}
				<Button
					variant="default"
					className="flex md:hidden rounded-full w-fit mx-auto mt-auto h-10 sticky bottom-16"
					onClick={() => setSourceDialogOpen(true)}
				>
					<PlusIcon className="size-4" />
					Add Sources
				</Button>
			</div>
		</div>
	);
};
