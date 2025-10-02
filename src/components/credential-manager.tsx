"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Eye,
	EyeOff,
	Files,
	Loader2,
	PencilLine,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	useDeleteR2Credentials,
	useFetchR2Credentials,
	useStoreR2Credentials,
} from "@/hooks/use-r2-credentials";

const r2CredentialsSchema = z.object({
	endpoint: z.url("Must be a valid URL"),
	accessKeyId: z.string().min(1, "Access Key ID is required"),
	secretAccessKey: z.string().min(1, "Secret Access Key is required"),
	publicAccessUrl: z.url("Must be a valid URL"),
	bucket: z.string().min(1, "Bucket name is required"),
});

type R2CredentialsData = z.infer<typeof r2CredentialsSchema>;

export function CredentialManager() {
	const [isDeleting, setIsDeleting] = useState(false);
	const [showCredentials, setShowCredentials] = useState<
		Record<string, boolean>
	>({});
	const [editingCredentials, setEditingCredentials] =
		useState<boolean>(false);
	const [showAddForm, setShowAddForm] = useState(false);

	const { data: credentials } = useFetchR2Credentials();
	const storeCredentialsMutation = useStoreR2Credentials();
	const deleteCredentialsMutation = useDeleteR2Credentials();

	const hasCredentials = !!credentials;
	const isCreating = storeCredentialsMutation.isPending;
	const isUpdating = storeCredentialsMutation.isPending;

	const form = useForm<R2CredentialsData>({
		resolver: zodResolver(r2CredentialsSchema),
		defaultValues: {
			endpoint: "",
			accessKeyId: "",
			secretAccessKey: "",
			publicAccessUrl: "",
			bucket: "",
		},
	});

	const onSubmit = (data: R2CredentialsData) => {
		storeCredentialsMutation.mutate(data, {
			onSuccess: () => {
				toast.success("R2 credentials saved successfully");
				form.reset();
				setShowAddForm(false);
			},
			onError: (error) => {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to save credentials",
				);
			},
		});
	};

	const onUpdate = (data: R2CredentialsData) => {
		storeCredentialsMutation.mutate(data, {
			onSuccess: () => {
				toast.success("R2 credentials updated successfully");
				setEditingCredentials(false);
				form.reset();
			},
			onError: (error) => {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update credentials",
				);
			},
		});
	};

	const onDelete = () => {
		if (!confirm("Are you sure you want to delete your R2 credentials?")) {
			return;
		}

		setIsDeleting(true);
		deleteCredentialsMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("R2 credentials deleted successfully");
			},
			onError: (error) => {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to delete credentials",
				);
			},
			onSettled: () => {
				setIsDeleting(false);
			},
		});
	};

	const startEdit = () => {
		setEditingCredentials(true);
		if (credentials) {
			form.reset({
				endpoint: credentials.endpoint,
				accessKeyId: credentials.accessKeyId,
				secretAccessKey: credentials.secretAccessKey,
				publicAccessUrl: credentials.publicAccessUrl,
				bucket: credentials.bucket,
			});
		}
	};

	const cancelEdit = () => {
		setEditingCredentials(false);
		form.reset();
	};

	const cancelAdd = () => {
		setShowAddForm(false);
		form.reset();
	};

	const toggleCredentialVisibility = (field: string) => {
		setShowCredentials((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const credentialFields = [
		{
			key: "endpoint",
			label: "S3 API Endpoint",
			placeholder: "https://your-account.r2.cloudflarestorage.com",
		},
		{
			key: "accessKeyId",
			label: "Access Key ID",
			placeholder: "Your R2 access key ID",
		},
		{
			key: "secretAccessKey",
			label: "Secret Access Key",
			placeholder: "Your R2 secret access key",
		},
		{
			key: "publicAccessUrl",
			label: "Public Access URL",
			placeholder: "https://your-domain.com",
		},
		{
			key: "bucket",
			label: "Bucket Name",
			placeholder: "your-bucket-name",
		},
	] as const;

	return (
		<div className="flex flex-col gap-4 h-full">
			{!showAddForm && !editingCredentials ? (
				<div className="flex items-center justify-between">
					<Button
						onClick={() => setShowAddForm(true)}
						className="rounded-xl gap-2"
						disabled={hasCredentials}
					>
						<Plus className="h-4 w-4" />
						{hasCredentials
							? "Credentials Configured"
							: "Add R2 Credentials"}
					</Button>
					{hasCredentials && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={startEdit}
								className="rounded-xl"
								aria-label="Edit credentials"
							>
								<PencilLine className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={onDelete}
								className="rounded-xl text-rose-500 hover:text-rose-600"
								disabled={isDeleting}
								aria-label="Delete credentials"
							>
								{isDeleting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Trash2 className="h-4 w-4" />
								)}
							</Button>
						</div>
					)}
				</div>
			) : (
				<Card className="p-2 rounded-xl border-accent">
					<CardContent className="p-2">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(
									editingCredentials ? onUpdate : onSubmit,
								)}
								className="flex flex-col gap-4 w-full"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{credentialFields.map((field) => (
										<FormField
											key={field.key}
											control={form.control}
											name={field.key}
											render={({ field: formField }) => (
												<FormItem>
													<FormLabel>
														{field.label}
													</FormLabel>
													<FormControl>
														<div className="relative">
															<Input
																{...formField}
																type={
																	field.key ===
																		"secretAccessKey" &&
																	!showCredentials[
																		field
																			.key
																	]
																		? "password"
																		: "text"
																}
																placeholder={
																	field.placeholder
																}
																className="rounded-xl pr-10"
																autoComplete="off"
																autoCorrect="off"
																autoCapitalize="off"
																spellCheck="false"
															/>
															{field.key ===
																"secretAccessKey" && (
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
																	onClick={() =>
																		toggleCredentialVisibility(
																			field.key,
																		)
																	}
																	aria-label={
																		showCredentials[
																			field
																				.key
																		]
																			? "Hide secret access key"
																			: "Show secret access key"
																	}
																>
																	{showCredentials[
																		field
																			.key
																	] ? (
																		<EyeOff className="h-4 w-4 text-muted-foreground" />
																	) : (
																		<Eye className="h-4 w-4 text-muted-foreground" />
																	)}
																</Button>
															)}
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									))}
								</div>
								<div className="flex gap-2 pt-2 justify-end">
									<Button
										type="button"
										variant="outline"
										onClick={
											editingCredentials
												? cancelEdit
												: cancelAdd
										}
										className="w-24 rounded-xl"
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isCreating || isUpdating}
										className="w-24 rounded-xl"
									>
										{isCreating || isUpdating ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : editingCredentials ? (
											"Update"
										) : (
											"Save"
										)}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			)}

			{hasCredentials && !showAddForm && !editingCredentials && (
				<Card className="p-3 rounded-2xl border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
					<CardContent className="p-2">
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 bg-green-500 rounded-full" />
							<div>
								<p className="font-medium text-green-800 dark:text-green-200">
									File uploads enabled
								</p>
								<p className="text-sm text-green-600 dark:text-green-400">
									R2 credentials are configured and ready to
									use
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{!hasCredentials && !showAddForm && (
				<Card className="flex-1 bg-accent">
					<CardContent className="flex flex-1 flex-col items-center justify-center">
						<Files className="h-10 w-10 text-muted-foreground mb-3" />
						<p className="text-muted-foreground text-sm text-center font-mono">
							No file upload credentials configured.
							<br />
							Add your Cloudflare R2 credentials to enable file
							uploads.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
