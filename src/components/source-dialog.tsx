"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { parseUrls, type ResourceData, resourceSchema } from "@/lib/app-schema";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface SourceDialogProps {
	slug: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSourcesAdded?: () => void;
}

export function SourceDialog({
	slug,
	open,
	onOpenChange,
	onSourcesAdded,
}: SourceDialogProps) {
	const [isPending, setIsPending] = useState<boolean>(false);

	const form = useForm<ResourceData>({
		resolver: zodResolver(resourceSchema),
		defaultValues: {
			urls: "",
		},
	});

	async function onSubmit(values: ResourceData) {
		const urlArray = parseUrls(values.urls);

		const payload = {
			urls: urlArray,
			chatId: slug,
		};

		try {
			setIsPending(true);
			const res = await fetch("/api/source", {
				method: "POST",
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				throw new Error("Failed to add source");
			}
			toast.success("Resources added");
			form.reset({ urls: "" });
			onOpenChange(false);
			onSourcesAdded?.();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error(errorMessage);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-2xl w-full max-h-[90vh] h-full flex flex-col rounded-3xl"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>Add Source</DialogTitle>
					<DialogDescription>
						Add a source to your notebook.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3 flex-1 min-h-0">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex flex-col h-full"
						>
							<FormField
								control={form.control}
								name="urls"
								render={({ field }) => (
									<FormItem className="flex-1 flex flex-col">
										<FormControl className="flex-1">
											<Textarea
												placeholder="Paste URLs here, separated by commas or new lines"
												className="h-full resize-none font-mono rounded-2xl"
												spellCheck={false}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											<span>Notes</span>
										</FormDescription>
										<ul className="list-disc list-inside text-sm text-muted-foreground mx-2">
											<li>
												To add upto five (5) URLs,
												separate with a comma or new
												line.
											</li>
											<li>
												Only the visible text on the
												website will be imported.
											</li>
											<li>
												Paid articles are not supported.
											</li>
										</ul>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end flex-shrink-0 mt-4">
								<Button
									type="submit"
									disabled={isPending}
									className="w-28 rounded-full"
								>
									{isPending ? (
										<Loader2 className="animate-spin" />
									) : (
										"Submit"
									)}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
