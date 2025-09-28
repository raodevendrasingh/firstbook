"use client";

import {
	ExternalLinkIcon,
	Loader2,
	PlusIcon,
	ScrollText,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Resource } from "@/db/schema";
import { useDeleteSource, useFetchSources } from "@/hooks/use-sources";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface SourcePanelProps {
	setSourceDialogOpen: (open: boolean) => void;
	className?: string;
	chatId: string;
	refreshTrigger?: number;
	onNoSourcesDetected?: () => void;
	selectedResources: Resource[];
	onSelectedResourcesChange: (resources: Resource[]) => void;
}

export const SourcePanel = ({
	setSourceDialogOpen,
	className,
	chatId,
	refreshTrigger,
	onNoSourcesDetected,
	selectedResources,
	onSelectedResourcesChange,
}: SourcePanelProps) => {
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	const { data: sourcesData, isLoading } = useFetchSources(chatId);
	const deleteSourceMutation = useDeleteSource();

	const resources = sourcesData?.success
		? sourcesData.data?.resource || []
		: [];

	useEffect(() => {
		if (resources.length > 0) {
			onSelectedResourcesChange(resources);
		}
	}, [resources, onSelectedResourcesChange]);

	useEffect(() => {
		if (!onNoSourcesDetected || isLoading) {
			return;
		}

		if (resources.length === 0) {
			const timeoutId = window.setTimeout(() => {
				onNoSourcesDetected();
			}, 500);

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
					toast.success("Resource deleted successfully");
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
					resources.map((res) => (
						<ul key={res.id} className="flex flex-col gap-2">
							<li className="py-1 px-3 rounded-lg bg-accent/80 flex items-center justify-between gap-3">
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<Checkbox
										checked={selectedResources.some(
											(selected) =>
												selected.id === res.id,
										)}
										onCheckedChange={(checked) => {
											if (checked) {
												onSelectedResourcesChange([
													...selectedResources,
													res,
												]);
											} else {
												onSelectedResourcesChange(
													selectedResources.filter(
														(selected) =>
															selected.id !==
															res.id,
													),
												);
											}
										}}
									/>
									<span className="flex flex-col items-start min-w-0 flex-1 max-h-10 overflow-hidden">
										<span className="text-sm font-medium line-clamp-1">
											{res.title}
										</span>
										{/* <span className="text-xs text-muted-foreground line-clamp-1">
											{res.source}
										</span> */}
									</span>
								</div>
								<span className="flex items-center gap-0.5 flex-shrink-0">
									<Button
										variant="ghost"
										size="icon"
										className="cursor-pointer rounded-full"
										onClick={() => {
											handleDelete(res.id);
										}}
									>
										{deletingIds.has(res.id) ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<XIcon />
										)}
									</Button>

									<Button
										variant="ghost"
										size="icon"
										className="cursor-pointer rounded-full"
										onClick={() => {
											window.open(
												res.source ?? "",
												"_blank",
											);
										}}
									>
										<ExternalLinkIcon />
									</Button>
								</span>
							</li>
						</ul>
					))
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
