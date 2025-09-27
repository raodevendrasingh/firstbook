"use client";

import {
	Dot,
	ExternalLink,
	Loader2,
	MoreVertical,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useCreateNotebook,
	useDeleteNotebook,
	useFetchNotebooks,
} from "@/hooks/use-notebooks";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

export const RecentNotebooks = () => {
	const router = useRouter();
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	const { data: notebooksData, isLoading } = useFetchNotebooks();
	const createNotebookMutation = useCreateNotebook();
	const deleteNotebookMutation = useDeleteNotebook();

	const notebooks = notebooksData?.success
		? notebooksData.data?.notebooks || []
		: [];

	const handleCreateNewNotebook = () => {
		createNotebookMutation.mutate(undefined, {
			onSuccess: (result) => {
				if (result.success) {
					router.push(`/notebook/${result.data?.notebookId}`);
				} else {
					toast.error(result.error);
				}
			},
			onError: () => {
				toast.error("Failed to create new notebook");
			},
		});
	};

	const handleOpenInNewTab = (
		notebookId: string,
		event: React.MouseEvent,
	) => {
		event.preventDefault();
		event.stopPropagation();
		window.open(`/notebook/${notebookId}`, "_blank", "noopener,noreferrer");
	};

	const handleDeleteNotebook = (
		notebookId: string,
		event: React.MouseEvent,
	) => {
		event.preventDefault();
		event.stopPropagation();

		if (
			!confirm(
				"Are you sure you want to delete this notebook? This action cannot be undone.",
			)
		) {
			return;
		}

		setDeletingIds((prev) => {
			const next = new Set(prev);
			next.add(notebookId);
			return next;
		});
		deleteNotebookMutation.mutate(notebookId, {
			onSuccess: () => {
				toast.success("Notebook deleted successfully");
			},
			onError: () => {
				toast.error("Failed to delete notebook");
			},
			onSettled: () => {
				setDeletingIds((prev) => {
					const next = new Set(prev);
					next.delete(notebookId);
					return next;
				});
			},
		});
	};

	return (
		<div className="flex flex-col items-center gap-3 pt-10 w-full">
			<div className="flex flex-row items-center justify-between w-full gap-2 mb-5">
				<div className="text-2xl font-medium w-full">My Notebooks</div>
				{notebooks.length > 0 && (
					<Button
						className="rounded-2xl sm:rounded-full gap-2"
						onClick={handleCreateNewNotebook}
					>
						{createNotebookMutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							<Plus />
						)}
						<span className="hidden sm:block">Create Notebook</span>
					</Button>
				)}
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
				{isLoading ? (
					SKELETON_KEYS.map((key) => (
						<div key={key} className="relative ">
							<div className="rounded-2xl h-40 border p-4 relative shadow">
								<div className="flex flex-col space-y-1">
									<Skeleton className="h-5 w-full" />
									<Skeleton className="h-5 w-3/4" />
								</div>
								<div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-20" />
								</div>
							</div>
						</div>
					))
				) : notebooks.length === 0 ? (
					<div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
								<Plus className="w-8 h-8 text-muted-foreground" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-medium">
									No notebooks yet
								</h3>
								<p className="text-muted-foreground text-sm max-w-sm">
									Create your first notebook to start
									organizing your research and ideas.
								</p>
							</div>
							<Button
								onClick={handleCreateNewNotebook}
								disabled={createNotebookMutation.isPending}
								className="gap-2 rounded-full"
							>
								{createNotebookMutation.isPending ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Plus className="w-4 h-4" />
								)}
								Create Notebook
							</Button>
						</div>
					</div>
				) : (
					notebooks.map((nb) => (
						<div key={nb.id} className="relative group">
							<Link
								href={`/notebook/${nb.id}`}
								className="rounded-2xl"
							>
								<Card className="rounded-2xl h-40 pb-4">
									<CardHeader className="flex-1">
										<CardTitle>
											{nb.title.length > 0
												? nb.title
												: "Untitled Notebook"}
										</CardTitle>
									</CardHeader>
									<CardFooter className="flex items-center text-sm font-light">
										<p>
											{new Date(
												nb.createdAt,
											).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "2-digit",
											})}
										</p>
										<Dot />
										<p>{nb.resourceCount} Sources</p>
									</CardFooter>
								</Card>
							</Link>
							<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<DropdownMenu>
									<DropdownMenuTrigger
										asChild
										className="cursor-pointer"
									>
										<Button
											size="icon"
											variant="secondary"
											className="size-8 bg-transparent hover:bg-transparent shadow-none rounded-full"
										>
											<MoreVertical className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="bg-background rounded-xl gap-3"
									>
										<DropdownMenuItem
											onClick={(e) =>
												handleOpenInNewTab(nb.id, e)
											}
											className="rounded-lg"
										>
											<ExternalLink className="size-4" />
											Open in new tab
										</DropdownMenuItem>
										<DropdownMenuItem
											variant="destructive"
											onClick={(e) =>
												handleDeleteNotebook(nb.id, e)
											}
											disabled={deletingIds.has(nb.id)}
											className="rounded-lg"
										>
											{deletingIds.has(nb.id) ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<Trash2 className="size-4" />
											)}
											Delete notebook
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
