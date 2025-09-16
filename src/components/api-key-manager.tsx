"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Eye,
	EyeOff,
	Key,
	Loader2,
	PencilLine,
	Plus,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ApiKeyData,
	apiKeySchema,
	type Provider,
	providerLabels,
} from "@/lib/schema/api-key-schema";
import { cn } from "@/lib/utils";
import type { FetchApiKeysResponse } from "@/types/api-handler";
import type { SafeKeys } from "@/types/data-types";

interface ApiKeyManagerProps {
	userId: string;
}

export function ApiKeyManager({ userId }: ApiKeyManagerProps) {
	const [storedKeys, setStoredKeys] = useState<SafeKeys[]>([]);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);

	const form = useForm<ApiKeyData>({
		resolver: zodResolver(apiKeySchema),
		defaultValues: {
			provider: "openai",
			apiKey: "",
		},
	});

	const editForm = useForm<{ apiKey: string }>({
		resolver: zodResolver(apiKeySchema.pick({ apiKey: true })),
		defaultValues: {
			apiKey: "",
		},
	});

	const fetchKeys = useCallback(async () => {
		try {
			const response = await fetch("/api/keys");
			const result: FetchApiKeysResponse = await response.json();
			if (result.success) {
				if (result.data) {
					setStoredKeys(result.data.keys);
				} else {
					toast.error("Error fetching API keys");
				}
			} else {
				toast.error(result.error);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (userId) {
			fetchKeys();
		}
	}, [userId, fetchKeys]);

	const onSubmit = async (data: ApiKeyData) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/keys", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (response.ok) {
				toast.success(
					`${providerLabels[data.provider]} API key added successfully`,
				);
				form.reset();
				setShowAddForm(false);
				await fetchKeys();
			} else {
				toast.error(result.error || "Failed to add API key");
			}
		} catch {
			toast.error("Failed to add API key");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onUpdate = async (keyId: string, apiKey: string) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/keys", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ keyId, apiKey }),
			});

			const result = await response.json();

			if (response.ok) {
				toast.success("API key updated successfully");
				setEditingKey(null);
				editForm.reset();
				await fetchKeys();
			} else {
				toast.error(result.error || "Failed to update API key");
			}
		} catch {
			toast.error("Failed to update API key");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onDelete = async (keyId: string, provider: Provider) => {
		if (
			!confirm(
				`Are you sure you want to delete your ${providerLabels[provider]} API key?`,
			)
		) {
			return;
		}

		try {
			setIsDeleting(true);
			const response = await fetch(`/api/keys?keyId=${keyId}`, {
				method: "DELETE",
			});

			const result = await response.json();

			if (response.ok) {
				toast.success(
					`${providerLabels[provider]} API key deleted successfully`,
				);
				await fetchKeys();
			} else {
				toast.error(result.error || "Failed to delete API key");
			}
		} catch {
			toast.error("Failed to delete API key");
		} finally {
			setIsDeleting(false);
		}
	};

	const startEdit = (keyId: string) => {
		setEditingKey(keyId);
		editForm.reset({ apiKey: "" });
	};

	const cancelEdit = () => {
		setEditingKey(null);
		editForm.reset();
	};

	const cancelAdd = () => {
		setShowAddForm(false);
		form.reset();
	};

	if (loading) {
		return <ApiKeySkeleton />;
	}

	return (
		<div className="flex flex-col gap-4 h-full">
			{!showAddForm ? (
				<Button
					onClick={() => setShowAddForm(true)}
					className="w-full rounded-xl gap-2"
				>
					<Plus className="h-4 w-4" />
					Add API Key
				</Button>
			) : (
				<Card className="p-2 rounded-xl border-accent">
					<CardContent className="p-2">
						{/* <div className="space-y-4"> */}
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="flex flex-col gap-3 w-full"
							>
								<div className="flex items-center gap-2 w-full">
									<span className="flex items-center gap-2 w-1/3">
										<FormField
											control={form.control}
											name="provider"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormLabel>
														Provider
													</FormLabel>
													<Select
														onValueChange={
															field.onChange
														}
														defaultValue={
															field.value
														}
													>
														<FormControl>
															<SelectTrigger className="rounded-xl w-full">
																<SelectValue placeholder="Select a provider" />
															</SelectTrigger>
														</FormControl>
														<SelectContent className="rounded-xl bg-accent">
															{Object.entries(
																providerLabels,
															).map(
																([
																	value,
																	label,
																]) => (
																	<SelectItem
																		className="hover:bg-background focus:bg-background rounded-lg"
																		key={
																			value
																		}
																		value={
																			value
																		}
																	>
																		<div>
																			<div className="font-medium">
																				{
																					label
																				}
																			</div>
																		</div>
																	</SelectItem>
																),
															)}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</span>
									<span className="flex items-center gap-2 w-2/3">
										<FormField
											control={form.control}
											name="apiKey"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormLabel>
														API Key
													</FormLabel>
													<FormControl>
														<Input
															{...field}
															type="password"
															placeholder="Enter your API key"
															className="rounded-xl w-full"
															autoComplete="off"
															autoCorrect="off"
															autoCapitalize="off"
															spellCheck="false"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</span>
								</div>
								<div className="flex gap-2 pt-2 justify-end">
									<Button
										type="button"
										variant="outline"
										onClick={cancelAdd}
										className="w-24 rounded-xl"
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-24 rounded-xl"
									>
										{isSubmitting ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											"Add Key"
										)}
									</Button>
								</div>
							</form>
						</Form>
						{/* </div> */}
					</CardContent>
				</Card>
			)}

			{/* Stored Keys List */}
			{storedKeys.length === 0 && !showAddForm ? (
				<Card className="flex-1 bg-accent">
					<CardContent className="flex flex-1 flex-col items-center justify-center ">
						<Key className="h-10 w-10 text-muted-foreground mb-3" />
						<p className="text-muted-foreground text-sm text-center">
							No API keys configured yet. Add your first API key
							to get started.
						</p>
					</CardContent>
				</Card>
			) : storedKeys.length > 0 ? (
				<div className="space-y-3 overflow-y-auto">
					{storedKeys.map((key) => (
						<Card
							key={key.id}
							className="rounded-2xl border-accent p-2"
						>
							<CardContent className="p-2">
								<div className="flex items-center justify-between gap-5 h-full">
									<div
										className={cn(
											"flex-1",
											editingKey === key.id &&
												"flex-none",
										)}
									>
										<div className="flex items-center gap-2 mb-1">
											<h4 className="font-medium">
												{providerLabels[key.provider]}
											</h4>
										</div>
										<p className="text-xs text-muted-foreground">
											Added{" "}
											{new Date(
												key.createdAt,
											).toDateString()}
										</p>
									</div>
									<div
										className={cn(
											"flex  items-center gap-2",
											editingKey === key.id && "flex-1",
										)}
									>
										{editingKey === key.id ? (
											<Form {...editForm}>
												<form
													onSubmit={editForm.handleSubmit(
														(data) =>
															onUpdate(
																key.id,
																data.apiKey,
															),
													)}
													className="flex flex-col items-center gap-2 w-full"
												>
													<div className="flex items-center gap-2 w-full">
														<FormField
															control={
																editForm.control
															}
															name="apiKey"
															render={({
																field,
															}) => (
																<FormItem className="flex-1">
																	<FormControl>
																		<Input
																			{...field}
																			type={
																				showApiKey[
																					key
																						.id
																				]
																					? "text"
																					: "password"
																			}
																			placeholder="Enter new API key"
																			className="w-full rounded-xl"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<Button
															type="button"
															variant="outline"
															size="sm"
															className="rounded-xl"
															onClick={() =>
																setShowApiKey(
																	(prev) => ({
																		...prev,
																		[key.id]:
																			!prev[
																				key
																					.id
																			],
																	}),
																)
															}
														>
															{showApiKey[
																key.id
															] ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</Button>
													</div>
													<div className="flex items-center justify-end w-full gap-2">
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={cancelEdit}
															className="rounded-xl w-24"
														>
															Cancel
														</Button>
														<Button
															type="submit"
															size="sm"
															disabled={
																isSubmitting
															}
															className="rounded-xl w-24"
														>
															{isSubmitting ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																"Save"
															)}
														</Button>
													</div>
												</form>
											</Form>
										) : (
											<>
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														startEdit(key.id)
													}
													className="rounded-xl"
												>
													<PencilLine />
												</Button>
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														onDelete(
															key.id,
															key.provider,
														)
													}
													className="rounded-xl text-rose-500 hover:text-rose-600"
												>
													{isDeleting ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Trash2 className="h-4 w-4" />
													)}
												</Button>
											</>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : null}
		</div>
	);
}

function ApiKeySkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full rounded-xl" />
			<div className="space-y-3">
				{[1, 2].map((i) => (
					<Card key={i} className="p-2 border border-accent">
						<CardContent className="p-2">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<Skeleton className="h- w-32 mb-1" />
									<Skeleton className="h-3 w-48" />
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-8 w-16 rounded-xl" />
									<Skeleton className="h-8 w-8 rounded-xl" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
