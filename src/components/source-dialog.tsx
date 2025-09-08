"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface SourceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	slug: string;
}

const ResourceSchema = z.object({
	urls: z
		.string()
		.min(1, { message: "URLs are required" })
		.refine(
			(str) => {
				const urlArray = str
					.split("\n")
					.filter((url) => url.trim() !== "");
				return urlArray.every((url) => {
					try {
						new URL(url.trim());
						return true;
					} catch {
						return false;
					}
				});
			},
			{ message: "Please enter valid URLs, separated by new lines" },
		),
});

export function SourceDialog({ open, onOpenChange, slug }: SourceDialogProps) {
	const form = useForm<z.infer<typeof ResourceSchema>>({
		resolver: zodResolver(ResourceSchema),
		defaultValues: {
			urls: "",
		},
	});

	async function onSubmit(values: z.infer<typeof ResourceSchema>) {
		const urlArray = values.urls
			.split("\n")
			.filter((url) => url.trim() !== "")
			.map((url) => url.trim());

		const payload = {
			urls: urlArray,
			chatId: slug,
		};

		try {
			const response = await fetch("/api/source", {
				method: "POST",
				body: JSON.stringify(payload),
			});
			if (!response.ok) {
				throw new Error("Failed to add source");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error("Failed to add source", {
				description: errorMessage,
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-2xl w-full max-h-[90vh] h-full flex flex-col"
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
												placeholder="Paste URLs here, separated by new lines"
												className="h-full resize-none font-mono"
												spellCheck={false}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											<span>Notes</span>
										</FormDescription>
										<ul className="list-disc list-inside text-sm text-muted-foreground mx-2">
											<li>
												To add multiple URLs, separate
												with a new line.
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
								<Button type="submit">Submit</Button>
							</div>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
