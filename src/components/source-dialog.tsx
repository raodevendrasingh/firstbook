"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Loader2, Upload, XIcon } from "lucide-react";
import { useRef, useState } from "react";
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
import type { FileData } from "@/types/data-types";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type TabType = "files" | "links" | "text";

interface SourceDialogProps {
	slug: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSourcesAdded?: () => void;
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
	const [files, setFiles] = useState<File[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSubmitSuccess = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		setFiles([]);
		onSubmitSuccess();
	};

	const MAX_FILE_SIZE = 10 * 1024 * 1024;
	const MAX_FILES = 5;
	const ACCEPTED_TYPES = [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"text/plain",
		"text/markdown",
	];

	const validateFile = (file: File): string | null => {
		if (!ACCEPTED_TYPES.includes(file.type)) {
			return `File type ${file.type} is not supported. Please upload PDF, DOC, DOCX, TXT, or MD files.`;
		}
		if (file.size > MAX_FILE_SIZE) {
			return `File ${file.name} is too large. Maximum size is 10MB.`;
		}
		return null;
	};

	const handleFileSelect = (selectedFiles: FileList | null) => {
		if (!selectedFiles) return;

		const newFiles = Array.from(selectedFiles);
		const validFiles: File[] = [];
		const errors: string[] = [];

		for (const file of newFiles) {
			const error = validateFile(file);
			if (error) {
				errors.push(error);
			} else {
				validFiles.push(file);
			}
		}

		if (files.length + validFiles.length > MAX_FILES) {
			errors.push(
				`You can only upload up to ${MAX_FILES} files at once.`,
			);
			validFiles.splice(MAX_FILES - files.length);
		}

		if (validFiles.length > 0) {
			setFiles((prev) => [...prev, ...validFiles]);
		}

		if (errors.length > 0) {
			toast.error(errors[0]);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		handleFileSelect(e.dataTransfer.files);
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const clearFiles = () => {
		setFiles([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const onSubmit = async () => {
		if (files.length === 0) {
			toast.error("Please select files to upload");
			return;
		}

		try {
			const fileData: FileData[] = await Promise.all(
				files.map(async (file) => {
					return new Promise<FileData>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => {
							const result = reader.result as string;
							const base64 = result.split(",")[1];
							resolve({
								name: file.name,
								size: file.size,
								type: file.type,
								data: base64,
							});
						};
						reader.onerror = () =>
							reject(
								new Error(`Failed to read file ${file.name}`),
							);
						reader.readAsDataURL(file);
					});
				}),
			);

			addSourcesMutation.mutate(
				{
					type: "files",
					data: { files: fileData },
					chatId: slug,
				},
				{
					onSuccess: handleSubmitSuccess,
					onError: onSubmitError,
				},
			);
		} catch {
			toast.error("Failed to process files");
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/** biome-ignore lint/a11y/noStaticElementInteractions: <ignore> */}
			<div
				className={`flex-1 flex flex-col gap-2 items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-colors ${
					isDragOver
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 hover:border-muted-foreground/50"
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept={ACCEPTED_TYPES.join(",")}
					className="hidden"
					onChange={(e) => handleFileSelect(e.target.files)}
				/>

				<Button
					type="button"
					variant="outline"
					className="rounded-full"
					onClick={() => fileInputRef.current?.click()}
				>
					<Upload size={16} />
					Select Files
				</Button>
				<p className="text-muted-foreground text-center">
					Drag and drop files here or click to browse
				</p>
				<p className="text-xs text-muted-foreground mt-2">
					Supported: PDF, DOC, DOCX, TXT, MD (max 10MB each, 5 files)
				</p>
			</div>

			{files.length > 0 && (
				<div className="mt-4 space-y-2">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-medium">Selected Files</h4>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={clearFiles}
							className="text-xs"
						>
							Clear All
						</Button>
					</div>
					<div className="max-h-32 overflow-y-auto space-y-2">
						{files.map((file, index) => (
							<div
								key={`${file.name}-${file.size}-${index}`}
								className="flex items-center justify-between p-2 bg-muted rounded-lg"
							>
								<div className="flex items-center gap-2 min-w-0">
									<span className="text-xs font-mono truncate">
										{file.name}
									</span>
									<span className="text-xs text-muted-foreground">
										{(file.size / 1024 / 1024).toFixed(1)}MB
									</span>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => removeFile(index)}
									className="h-6 w-6 p-0"
								>
									<XIcon size={16} />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="flex justify-end flex-shrink-0 mt-4">
				<Button
					type="button"
					disabled={
						addSourcesMutation.isPending || files.length === 0
					}
					className="w-28 rounded-full"
					onClick={onSubmit}
				>
					{addSourcesMutation.isPending ? (
						<Loader2 className="animate-spin" />
					) : (
						"Submit"
					)}
				</Button>
			</div>
		</div>
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
		setTimeout(() => {
			onSourcesAdded?.();
		}, 100);
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
