"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { useAddSources } from "@/hooks/use-sources";
import {
	parseUrls,
	type ResourceData,
	resourceSchema,
} from "@/lib/schema/app-schema";
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
	const form = useForm<ResourceData>({
		resolver: zodResolver(resourceSchema),
		defaultValues: {
			urls: "",
		},
	});

	const addSourcesMutation = useAddSources();

	const onSubmit = (values: ResourceData) => {
		const urlArray = parseUrls(values.urls);

		addSourcesMutation.mutate(
			{ urls: urlArray, chatId: slug },
			{
				onSuccess: () => {
					toast.success("Resources added");
					form.reset({ urls: "" });
					onOpenChange(false);
					onSourcesAdded?.();
				},
				onError: (error) => {
					toast.error(error.message || "Failed to add resources");
				},
			},
		);
	};

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
									disabled={addSourcesMutation.isPending}
									className="w-28 rounded-full"
								>
									{addSourcesMutation.isPending ? (
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
