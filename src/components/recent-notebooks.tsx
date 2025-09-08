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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
	CreateNotebookResponse,
	DeleteNotebookResponse,
	FetchNotebooksResponse,
	notebooksWithCounts,
} from "@/lib/types";
import { Button } from "./ui/button";

export const RecentNotebooks = () => {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [notebooks, setNotebooks] = useState<notebooksWithCounts[]>([]);

	const handleCreateNewNotebook = async () => {
		try {
			setIsPending(true);
			const response = await fetch("/api/notebook", {
				method: "POST",
			});
			const result: CreateNotebookResponse = await response.json();

			if (result.success) {
				router.push(`/notebook/${result.data.notebookId}`);
			} else {
				toast.error(result.error);
			}
		} catch {
			toast.error("Failed to create new notebook");
		} finally {
			setIsPending(false);
		}
	};

	const handleOpenInNewTab = (
		notebookId: string,
		event: React.MouseEvent,
	) => {
		event.preventDefault();
		event.stopPropagation();
		window.open(`/notebook/${notebookId}`, "_blank", "noopener,noreferrer");
	};

	const handleDeleteNotebook = async (
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

		try {
			setDeletingId(notebookId);
			const response = await fetch(
				`/api/notebook?notebookId=${notebookId}`,
				{
					method: "DELETE",
				},
			);
			const result: DeleteNotebookResponse = await response.json();

			if (result.success) {
				setNotebooks((prev) =>
					prev.filter((nb) => nb.id !== notebookId),
				);
				toast.success("Notebook deleted successfully");
			} else {
				toast.error(result.error);
			}
		} catch {
			toast.error("Failed to delete notebook");
		} finally {
			setDeletingId(null);
		}
	};

	useEffect(() => {
		const fetchNotebooks = async () => {
			const response = await fetch("/api/notebook", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const result: FetchNotebooksResponse = await response.json();

			if (result.success) {
				setNotebooks(result.data.notebooks);
			} else {
				toast.error(result.error);
			}
		};

		fetchNotebooks();
	}, []);

	return (
		<div className="flex flex-col items-center gap-3 pt-10">
			<div className="flex flex-row items-center justify-between w-full gap-2 pb-3">
				<div className="text-2xl font-medium w-full">My Notebooks</div>
				<Button
					className="md:rounded-full gap-2"
					onClick={handleCreateNewNotebook}
				>
					{isPending ? (
						<Loader2 className="animate-spin" />
					) : (
						<Plus />
					)}
					<span className="hidden sm:block">Create Notebook</span>
				</Button>
			</div>
			<div className="flex flex-row items-center justify-start flex-wrap gap-4 w-full">
				{notebooks.map((nb) => (
					<div key={nb.id} className="relative group">
						<Link href={`/notebook/${nb.id}`}>
							<Card className="rounded-lg w-60 h-32">
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
										).toLocaleDateString()}
									</p>
									<Dot />
									<p>{nb.resourceCount} Sources</p>
								</CardFooter>
							</Card>
						</Link>
						<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										size="icon"
										variant="secondary"
										className="size-8"
									>
										<MoreVertical className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" sideOffset={6}>
									<DropdownMenuItem
										onClick={(e) =>
											handleOpenInNewTab(nb.id, e)
										}
									>
										<ExternalLink className="size-4" />
										Open in new tab
									</DropdownMenuItem>
									<DropdownMenuItem
										variant="destructive"
										onClick={(e) =>
											handleDeleteNotebook(nb.id, e)
										}
										disabled={deletingId === nb.id}
									>
										{deletingId === nb.id ? (
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
				))}
			</div>
		</div>
	);
};
