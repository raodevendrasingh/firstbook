"use client";

import {
	ExternalLinkIcon,
	Loader2,
	PlusIcon,
	ScrollText,
	XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Resource } from "@/db/schema";
import type { ApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

type sourcePanelProps = {
	setSourceDialogOpen: (open: boolean) => void;
	className?: string;
	chatId: string;
	refreshTrigger?: number;
	onNoSourcesDetected?: () => void;
	selectedResources: Resource[];
	onSelectedResourcesChange: (resources: Resource[]) => void;
};

export const SourcePanel = ({
	setSourceDialogOpen,
	className,
	chatId,
	refreshTrigger,
	onNoSourcesDetected,
	selectedResources,
	onSelectedResourcesChange,
}: sourcePanelProps) => {
	const [resources, setResources] = useState<Resource[] | undefined>();
	const [loading, setLoading] = useState(false);
	const [hasFetched, setHasFetched] = useState(false);

	const fetchSources = useCallback(async () => {
		if (!chatId) return;

		setLoading(true);
		try {
			const res = await fetch(`/api/source?chatId=${chatId}`, {
				method: "GET",
			});
			const result: ApiResponse<{ resource: Resource[] }> =
				await res.json();

			if (result.success) {
				const sources = result.data?.resource || [];
				setResources(sources);
				setHasFetched(true);

				onSelectedResourcesChange(sources);

				if (sources.length === 0 && onNoSourcesDetected) {
					setTimeout(() => {
						onNoSourcesDetected();
					}, 500);
				}
			} else {
				toast.error(result.error);
			}
		} catch {
			toast.error("Failed to fetch sources");
		} finally {
			setLoading(false);
		}
	}, [chatId, onNoSourcesDetected, onSelectedResourcesChange]);

	useEffect(() => {
		if (chatId && !hasFetched && !loading) {
			fetchSources();
		}
	}, [chatId, hasFetched, loading, fetchSources]);

	useEffect(() => {
		if (refreshTrigger && refreshTrigger > 0) {
			setHasFetched(false);
		}
	}, [refreshTrigger]);

	const handleDelete = useCallback(
		async (id: string) => {
			if (!chatId) return;
			const res = await fetch(`/api/source?chatId=${chatId}&id=${id}`, {
				method: "DELETE",
			});
			if (res.ok) {
				fetchSources();
				toast.success("Resource deleted successfully");
			} else {
				toast.error("Failed to delete resource");
			}
		},
		[chatId, fetchSources],
	);

	return (
		<div
			className={cn(
				"relative flex flex-col md:max-w-xs lg:max-w-md h-[calc(100vh-7.3rem)] md:h-[calc(100vh-4.5rem)] bg-background border border-border w-full rounded-xl overflow-hidden",
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
				{loading ? (
					<div className="flex items-center justify-center h-32 gap-2">
						<div className="text-sm text-muted-foreground">
							Loading sources
						</div>
						<Loader2 className="animate-spin size-4" />
					</div>
				) : resources && resources.length > 0 ? (
					resources.map((res) => (
						<ul key={res.id} className="flex flex-col gap-2">
							<li className="py-1 px-3 rounded-xl bg-accent/80 flex items-center justify-between gap-3">
								<div className="flex items-center gap-3">
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
									<span className="flex flex-col items-start">
										<span className="text-sm font-medium line-clamp-1">
											{res.title}
										</span>
										<span className="text-xs text-muted-foreground line-clamp-1">
											{res.source}
										</span>
									</span>
								</div>
								<span className="flex items-center gap-0.5">
									<Button
										variant="ghost"
										size="icon"
										className="cursor-pointer rounded-full"
										onClick={() => {
											handleDelete(res.id);
										}}
									>
										<XIcon />
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
