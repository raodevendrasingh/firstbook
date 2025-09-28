"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddSources } from "@/hooks/use-sources";
import {
	parseUrls,
	type ResourceData,
	resourceSchema,
} from "@/lib/schema/app-schema";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type TabType = "files" | "links" | "text";

interface SourceDialogProps {
	slug: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSourcesAdded?: () => void;
}

interface FilesFormData {
	files: File[];
}

interface TextFormData {
	text: string;
}

const LinksTab = ({
	slug,
	addSourcesMutation,
	onSubmitSuccess,
	onSubmitError,
}: {
	slug: string;
	addSourcesMutation: ReturnType<typeof useAddSources>;
	onSubmitSuccess: () => void;
	onSubmitError: (error: Error) => void;
}) => {
	const form = useForm<ResourceData>({
		resolver: zodResolver(resourceSchema),
		defaultValues: {
			urls: "",
		},
	});

	const onSubmit = (values: ResourceData) => {
		const urlArray = parseUrls(values.urls);

		addSourcesMutation.mutate(
			{
				type: "links",
				data: { urls: urlArray },
				chatId: slug,
			},
			{
				onSuccess: onSubmitSuccess,
				onError: onSubmitError,
			},
		);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col h-full"
			>
				<FormField
					control={form.control}
					name="urls"
					render={({ field }) => (
						<FormItem className="flex flex-col min-h-0">
							<FormControl className="min-h-0">
								<Textarea
									placeholder="Paste URLs here, separated by commas or new lines"
									className="h-80 resize-none font-mono rounded-2xl overflow-auto"
									spellCheck={false}
									{...field}
								/>
							</FormControl>
							<FormDescription>
								<span>Notes</span>
							</FormDescription>
							<ul className="list-disc list-inside text-sm text-muted-foreground mx-2">
								<li>
									To add upto five (5) URLs, separate with a
									comma or new line.
								</li>
								<li>
									Only the visible text on the website will be
									imported.
								</li>
								<li>Paid articles are not supported.</li>
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
	);
};

const FilesTab = ({
	slug,
	addSourcesMutation,
	onSubmitSuccess,
	onSubmitError,
}: {
	slug: string;
	addSourcesMutation: ReturnType<typeof useAddSources>;
	onSubmitSuccess: () => void;
	onSubmitError: (error: Error) => void;
}) => {
	const form = useForm<FilesFormData>({
		defaultValues: {
			files: [],
		},
	});

	const onSubmit = (values: FilesFormData) => {
		// TODO: Implement file upload logic
		addSourcesMutation.mutate(
			{
				type: "files",
				data: { files: values.files },
				chatId: slug,
			},
			{
				onSuccess: onSubmitSuccess,
				onError: onSubmitError,
			},
		);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col h-full"
			>
				<div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-2xl p-8">
					<p className="text-muted-foreground text-center mb-4">
						Drag and drop files here or click to browse
					</p>
					<Button
						type="button"
						variant="outline"
						className="rounded-full"
					>
						Select Files
					</Button>
				</div>
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
	);
};

const TextTab = ({
	slug,
	addSourcesMutation,
	onSubmitSuccess,
	onSubmitError,
}: {
	slug: string;
	addSourcesMutation: ReturnType<typeof useAddSources>;
	onSubmitSuccess: () => void;
	onSubmitError: (error: Error) => void;
}) => {
	const form = useForm<TextFormData>({
		defaultValues: {
			text: "",
		},
	});

	const onSubmit = (values: TextFormData) => {
		// TODO: Implement raw text logic
		addSourcesMutation.mutate(
			{
				type: "text",
				data: { text: values.text },
				chatId: slug,
			},
			{
				onSuccess: onSubmitSuccess,
				onError: onSubmitError,
			},
		);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col h-full"
			>
				<FormField
					control={form.control}
					name="text"
					render={({ field }) => (
						<FormItem className="flex flex-col min-h-0">
							<FormControl className="min-h-0">
								<Textarea
									placeholder="Paste or type your text content here..."
									className="h-80 resize-none rounded-2xl overflow-auto"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								<span>Notes</span>
							</FormDescription>
							<ul className="list-disc list-inside text-sm text-muted-foreground mx-2">
								<li>
									Paste or type any text content you want to
									add as a source.
								</li>
								<li>Maximum length: 50,000 characters.</li>
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
	);
};

export function SourceDialog({
	slug,
	open,
	onOpenChange,
	onSourcesAdded,
}: SourceDialogProps) {
	const [activeTab, setActiveTab] = useState<TabType>("links");

	const addSourcesMutation = useAddSources();

	const handleSubmitSuccess = () => {
		toast.success("Resources added");
		onOpenChange(false);
		onSourcesAdded?.();
	};

	const handleSubmitError = (error: Error) => {
		toast.error(error.message || "Failed to add resources");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-2xl w-full h-[600px] flex flex-col rounded-3xl"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center gap-2">
						Add Sources
						<BookOpen size={18} />
					</DialogTitle>
					<DialogDescription>
						Choose a source type to add to your notebook.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3 flex-1 min-h-0">
					<Tabs
						value={activeTab}
						onValueChange={(value) =>
							setActiveTab(value as TabType)
						}
						className="flex-1 flex flex-col min-h-0"
					>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="files" className="text-sm">
								Files
							</TabsTrigger>
							<TabsTrigger value="links" className="text-sm">
								Links
							</TabsTrigger>
							<TabsTrigger value="text" className="text-sm">
								Raw Text
							</TabsTrigger>
						</TabsList>

						<TabsContent value="files" className="flex-1 mt-4">
							<FilesTab
								slug={slug}
								addSourcesMutation={addSourcesMutation}
								onSubmitSuccess={handleSubmitSuccess}
								onSubmitError={handleSubmitError}
							/>
						</TabsContent>

						<TabsContent
							value="links"
							className="flex-1 mt-4 min-h-0"
						>
							<LinksTab
								slug={slug}
								addSourcesMutation={addSourcesMutation}
								onSubmitSuccess={handleSubmitSuccess}
								onSubmitError={handleSubmitError}
							/>
						</TabsContent>

						<TabsContent
							value="text"
							className="flex-1 mt-4 min-h-0"
						>
							<TextTab
								slug={slug}
								addSourcesMutation={addSourcesMutation}
								onSubmitSuccess={handleSubmitSuccess}
								onSubmitError={handleSubmitError}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}
