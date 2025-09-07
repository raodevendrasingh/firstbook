"use client";

import { Dot, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type {
	CreateNotebookResponse,
	FetchNotebooksResponse,
	notebooksWithCounts,
} from "@/lib/types";
import { Button } from "./ui/button";

export const RecentNotebooks = () => {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
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
			<div className="text-2xl font-medium w-full">Recent Notebooks</div>
			<div className="flex flex-row items-center justify-start flex-wrap gap-5 w-full">
				<Card
					onClick={handleCreateNewNotebook}
					className="flex items-center justify-center rounded-sm w-64 h-48 p-3 cursor-pointer"
				>
					<CardContent className="flex flex-col items-center justify-center gap-4 px-3">
						<Button
							size="icon"
							variant="secondary"
							className="rounded-full size-16 cursor-pointer"
						>
							{isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<Plus className="size-6" />
							)}
						</Button>
						<span className="font-medium text-xl">
							Create New Notebook
						</span>
					</CardContent>
				</Card>

				{notebooks.map((nb) => (
					<Link key={nb.id} href={`/notebook/${nb.id}`}>
						<Card className="rounded-sm w-64 h-48">
							<CardHeader className="flex-1">
								<CardTitle>{nb.title}</CardTitle>
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
				))}
			</div>
		</div>
	);
};
