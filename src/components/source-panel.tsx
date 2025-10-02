"use client";

import {
	ArrowLeftIcon,
	ExternalLinkIcon,
	Loader2,
	MoreVerticalIcon,
	PlusIcon,
	ScrollText,
	TrashIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FilterButtons } from "@/components/filter-buttons";
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
import { getResourceIcon } from "@/utils/get-resource-icon";

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
	const [selectedResourceDetail, setSelectedResourceDetail] =
		useState<Resource | null>(null);
	const [activeFilter, setActiveFilter] = useState<string | null>(null);

	const { data: sourcesData, isLoading } = useFetchSources(chatId);
	const deleteSourceMutation = useDeleteSource();

	const resources = sourcesData?.success
		? sourcesData.data?.resource || []
		: [];

	const uniqueResourceTypes = Array.from(
		new Set(resources.map((r) => r.type)),
	);
	const fileMimeTypes = Array.from(
		new Set(
			resources
				.filter((r) => r.type === "files")
				.map((r) => r.metadata?.mimeType)
				.filter((mimeType): mimeType is string => Boolean(mimeType)),
		),
	);

	const filteredResources = activeFilter
		? resources.filter((res) => {
				if (activeFilter === "files") return res.type === "files";
				if (activeFilter === "links") return res.type === "links";
				if (activeFilter === "text") return res.type === "text";
				if (
					res.type === "files" &&
					res.metadata?.mimeType === activeFilter
				) {
					return true;
				}
				return false;
			})
		: resources;

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

		if (resources.length > 0 && !hasInitializedSelection) {
			onSelectedResourcesChange(resources);
			setHasInitializedSelection(true);
			previousResourceIds.current = currentResourceIds;
			return;
		}

		if (newResourceIds.size > 0) {
			const newResources = resources.filter((r) =>
				newResourceIds.has(r.id),
			);
			onSelectedResourcesChange([...selectedResources, ...newResources]);
		}

		previousResourceIds.current = currentResourceIds;
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
				"relative flex flex-col h-[calc(100vh-7.3rem)] md:h-[calc(100vh-4.5rem)] bg-background border border-border w-full rounded-xl overflow-hidden",
				selectedResourceDetail
					? "md:max-w-md lg:max-w-md"
					: "md:max-w-xs lg:max-w-sm",
				className,
			)}
		>
			{selectedResourceDetail ? (
				<div className="flex flex-1 h-full min-h-0 flex-col gap-4 p-4 overflow-y-auto w-full">
					<Button
						variant="ghost"
						className="w-fit rounded-full"
						onClick={() => setSelectedResourceDetail(null)}
					>
						<ArrowLeftIcon className="size-4 mr-2" />
						Back to sources
					</Button>

					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between gap-3	">
							<div className="p-2 bg-accent rounded-lg">
								{selectedResourceDetail.type === "files"
									? getResourceIcon(
											selectedResourceDetail.metadata
												?.mimeType || "files",
											"size-8",
										)
									: getResourceIcon(
											selectedResourceDetail.type,
											"size-8",
										)}
							</div>
							<div className="flex-1 min-w-0">
								<h2 className="text-lg font-semibold break-words">
									{selectedResourceDetail.title}
								</h2>
							</div>
							{(selectedResourceDetail.type === "links" ||
								selectedResourceDetail.type === "files") &&
								selectedResourceDetail.source && (
									<Button
										variant="outline"
										size="icon"
										className="rounded-full"
										onClick={() => {
											window.open(
												selectedResourceDetail.source ??
													"",
												"_blank",
											);
										}}
									>
										<ExternalLinkIcon className="size-4" />
									</Button>
								)}
						</div>

						{selectedResourceDetail.summary && (
							<div className="flex flex-col gap-2">
								<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
									Summary
								</h3>
								<div className="p-4 bg-accent/50 rounded-lg">
									<p className="text-sm leading-relaxed whitespace-pre-wrap">
										{selectedResourceDetail.summary}
									</p>
								</div>
							</div>
						)}

						{selectedResourceDetail.content && (
							<div className="flex flex-col gap-2">
								<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
									Content
								</h3>
								<div className="p-4 bg-accent/30 rounded-lg">
									<p className="text-sm leading-relaxed whitespace-pre-wrap">
										{selectedResourceDetail.content}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="flex flex-1 h-full min-h-0 flex-col gap-2 p-2 overflow-y-auto w-full">
					<Button
						variant="outline"
						className="hidden md:flex rounded-full mb-2"
						onClick={() => setSourceDialogOpen(true)}
					>
						<PlusIcon className="size-4" />
						Add Sources
					</Button>
					{resources.length > 0 && (
						<FilterButtons
							activeFilter={activeFilter}
							onFilterChange={setActiveFilter}
							fileMimeTypes={fileMimeTypes}
							uniqueResourceTypes={uniqueResourceTypes}
						/>
					)}
					{isLoading ? (
						<div className="flex items-center justify-center h-32 gap-2">
							<div className="text-sm text-muted-foreground">
								Loading sources
							</div>
							<Loader2 className="animate-spin size-4" />
						</div>
					) : resources && resources.length > 0 ? (
						filteredResources.length > 0 ? (
							<>
								<div className="mb-2 flex items-center justify-between px-3 py-1 rounded-lg">
									<span className="text-sm font-medium text-muted-foreground">
										Select all sources
									</span>
									<Checkbox
										checked={filteredResources.every(
											(res) =>
												selectedResources.some(
													(selected) =>
														selected.id === res.id,
												),
										)}
										onCheckedChange={(checked) => {
											if (checked) {
												onSelectedResourcesChange(
													filteredResources,
												);
											} else {
												const filteredIds = new Set(
													filteredResources.map(
														(r) => r.id,
													),
												);
												onSelectedResourcesChange(
													selectedResources.filter(
														(res) =>
															!filteredIds.has(
																res.id,
															),
													),
												);
											}
										}}
										className="cursor-pointer"
									/>
								</div>
								{filteredResources.map((res) => (
									<div
										key={res.id}
										className="flex flex-col gap-2"
									>
										<div className="group py-1 px-3 h-10 rounded-lg bg-accent/80 flex items-center gap-3 hover:bg-accent transition-colors relative">
											<div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
												<span
													className={cn(
														"transition-opacity text-primary rounded-md p-1",
														openDropdownId ===
															res.id
															? "opacity-0"
															: "opacity-100 group-hover:opacity-0",
													)}
												>
													{res.type === "files"
														? getResourceIcon(
																res.metadata
																	?.mimeType ||
																	"files",
																"size-5",
															)
														: getResourceIcon(
																res.type,
																"size-5",
															)}
												</span>
												<span
													className={`absolute inset-0 transition-opacity ${
														openDropdownId ===
														res.id
															? "opacity-100"
															: "opacity-0 group-hover:opacity-100"
													}`}
												>
													<DropdownMenu
														onOpenChange={(
															open,
														) => {
															setOpenDropdownId(
																open
																	? res.id
																	: null,
															);
														}}
													>
														<DropdownMenuTrigger
															asChild
														>
															<Button
																variant="ghost"
																size="icon"
																className="h-4 w-4 p-0 cursor-pointer hover:bg-background/50 flex items-center justify-center"
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

											<button
												type="button"
												title={res.title}
												className="flex flex-col items-start min-w-0 flex-1 max-h-10 overflow-hidden cursor-pointer hover:underline text-left"
												onClick={() =>
													setSelectedResourceDetail(
														res,
													)
												}
											>
												<p className="text-sm font-medium line-clamp-1">
													{res.title}
												</p>
											</button>

											<Checkbox
												checked={selectedResources.some(
													(selected) =>
														selected.id === res.id,
												)}
												onCheckedChange={() => {
													const isCurrentlySelected =
														selectedResources.some(
															(selected) =>
																selected.id ===
																res.id,
														);

													const newResources =
														isCurrentlySelected
															? selectedResources.filter(
																	(
																		selected,
																	) =>
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
							<div className="flex flex-col gap-3 mt-24 items-center justify-center p-4">
								<div className="text-muted-foreground">
									No resources match the current filter
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setActiveFilter(null)}
									className="mt-2"
								>
									Clear filter
								</Button>
							</div>
						)
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
									Click Add source button to add web sources
									to your notebook
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
			)}
		</div>
	);
};
