"use client";

import { PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Resource } from "@/db/schema";
import type { ApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type sourcePanelProps = {
	setSourceDialogOpen: (open: boolean) => void;
	className?: string;
	chatId: string;
	refreshTrigger?: number;
	onNoSourcesDetected?: () => void;
};

export const SourcePanel = ({
	setSourceDialogOpen,
	className,
	chatId,
	refreshTrigger,
	onNoSourcesDetected,
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
	}, [chatId, onNoSourcesDetected]);

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

	return (
		<div
			className={cn(
				"relative flex flex-col md:max-w-xs lg:max-w-md h-[calc(100vh-7.3rem)] md:h-[calc(100vh-4.5rem)] bg-background border border-border w-full rounded-md overflow-hidden",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-3 border-b px-3 py-1 bg-accent rounded-t-md">
				<div className="font-medium">Sources</div>
				<Button
					variant="default"
					size="sm"
					className="hidden md:flex rounded-full"
					onClick={() => setSourceDialogOpen(true)}
				>
					<PlusIcon className="size-4" />
					Add
				</Button>
			</div>
			<div className="relative flex flex-1 h-full min-h-0 flex-col gap-2 p-3 overflow-y-auto w-full">
				{loading ? (
					<div className="flex items-center justify-center h-32">
						<div className="text-sm text-muted-foreground">
							Loading sources...
						</div>
					</div>
				) : resources && resources.length > 0 ? (
					resources.map((res) => (
						<ul key={res.id} className="flex flex-col gap-1">
							<li className="text-sm font-medium p-1 rounded-md hover:bg-accent">
								{res.title}
							</li>
						</ul>
					))
				) : (
					<div className="flex items-center justify-center p-2 border-[2px] border-dashed rounded-md">
						<div className="text-sm text-muted-foreground">
							No sources added yet
						</div>
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
