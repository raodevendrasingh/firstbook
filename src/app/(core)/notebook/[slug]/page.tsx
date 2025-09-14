"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatContainer } from "@/components/chat-container";
import { SourceDialog } from "@/components/source-dialog";
import { SourcePanel } from "@/components/source-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserDropdown } from "@/components/user-dropdown";
import type { Resource } from "@/db/schema";
import { useModelSelection } from "@/hooks/use-model-selection";
import type { FetchChatResponse } from "@/lib/types";

const chatCache = new Map<
	string,
	{ data: FetchChatResponse; timestamp: number }
>();
const CACHE_TTL = 60000;

interface NotebookPageProps {
	params: Promise<{ slug: string }>;
}

export default function NotebookPage({ params }: NotebookPageProps) {
	const { slug } = use(params);
	const router = useRouter();
	const [input, setInput] = useState("");
	const [webSearch, setWebSearch] = useState<boolean>(false);
	const [title, setTitle] = useState<string>("");
	const [sourceDialogOpen, setSourceDialogOpen] = useState<boolean>(false);
	const [refreshSources, setRefreshSources] = useState<number>(0);
	const [selectedResources, setSelectedResources] = useState<Resource[]>([]);

	const { messages, sendMessage, status, regenerate, setMessages } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
		onError: (chatError) => {
			toast.error(chatError.message);
		},
	});

	const { selectedModel, selectModel, allModels } = useModelSelection();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			sendMessage(
				{ text: input },
				{
					body: {
						selectedModel: selectedModel,
						chatId: slug,
						webSearch: webSearch,
						selectedResources: selectedResources,
					},
				},
			);
			setInput("");
		}
	};

	const handleSelectedResourcesChange = (resources: Resource[]) => {
		setSelectedResources(resources);
	};

	useEffect(() => {
		let isCancelled = false;
		let intervalId: NodeJS.Timeout | null = null;

		const fetchOnce = () => {
			const url = `/api/chat?chatId=${slug}`;
			const now = Date.now();
			const cached = chatCache.get(url);

			// Check if we have valid cached data
			if (cached && now - cached.timestamp < CACHE_TTL) {
				const result = cached.data;
				if (!result.success) {
					toast.error("Chat not found!");
					router.push("/notebooks");
					return;
				}
				if (result.data) {
					setMessages(result.data.messages);
					setTitle(result.data.title);
				}
				return;
			}

			// Fetch fresh data
			fetch(url)
				.then((res) => res.json())
				.then((result: FetchChatResponse) => {
					if (!result.success) {
						toast.error("Chat not found!");
						router.push("/notebooks");
						return;
					}

					// Cache the result
					chatCache.set(url, {
						data: result,
						timestamp: now,
					});

					if (result.data) {
						setMessages(result.data.messages);
						setTitle(result.data.title);
					}

					if (
						!isCancelled &&
						result.data &&
						result.data.title.length === 0 &&
						title.length === 0
					) {
						intervalId = setInterval(() => {
							fetch(`/api/chat?chatId=${slug}`)
								.then((res) => res.json())
								.then((poll: FetchChatResponse) => {
									if (
										!isCancelled &&
										poll.success &&
										poll.data &&
										poll.data.title.length > 0
									) {
										setTitle(poll.data.title);
										if (intervalId)
											clearInterval(intervalId);
									}
								})
								.catch(() => {});
						}, 1000);
					}
				});
		};

		fetchOnce();

		return () => {
			isCancelled = true;
			if (intervalId) clearInterval(intervalId);
		};
	}, [slug, setMessages, router, title.length]);

	return (
		<div className="relative h-screen flex flex-col gap-2 overflow-hidden">
			<nav className="fixed flex items-center h-14 w-full md:px-8 bg-background px-4 border-b border-border z-50">
				<div className="flex w-full items-center justify-between mx-auto">
					<div className="flex flex-row items-center gap-3">
						<Button
							onClick={() => router.back()}
							variant="secondary"
							size="icon"
							className="rounded-full bg-accent border border-border size-8"
						>
							<ArrowLeftIcon className="size-4" />
						</Button>

						<span className="text-base line-clamp-1 md:text-lg font-medium">
							{title.length > 0 ? title : "Untitled Notebook"}
						</span>
					</div>
					<UserDropdown />
				</div>
			</nav>

			{/* Mobile Tabs */}
			<Tabs
				defaultValue="chat"
				className="pt-16 block md:hidden bg-accent/30 w-full mx-auto"
			>
				<TabsList className="flex justify-center items-center mx-auto bg-background w-[95%] sm:w-[98%] border">
					<TabsTrigger
						value="chat"
						className="w-1/2 data-[state=active]:bg-secondary"
					>
						Chat
					</TabsTrigger>
					<TabsTrigger
						value="sources"
						className="w-1/2 data-[state=active]:bg-secondary"
					>
						Sources
					</TabsTrigger>
				</TabsList>
				<div className="flex flex-col h-[calc(100vh-6.3rem)]">
					<TabsContent value="chat" className="p-2">
						<ChatContainer
							className="block md:hidden h-[calc(100vh-7.3rem)] "
							title="Chat"
							messages={messages}
							status={status}
							regenerate={regenerate}
							input={input}
							setInput={setInput}
							handleSubmit={handleSubmit}
							webSearch={webSearch}
							setWebSearch={setWebSearch}
							model={selectedModel}
							setModel={selectModel}
							models={allModels}
							hasSources={selectedResources.length > 0}
						/>
					</TabsContent>
					<TabsContent value="sources" className="p-2">
						<SourcePanel
							setSourceDialogOpen={setSourceDialogOpen}
							className="block md:hidden"
							chatId={slug}
							selectedResources={selectedResources}
							onSelectedResourcesChange={
								handleSelectedResourcesChange
							}
						/>
					</TabsContent>
				</div>
			</Tabs>

			{/* Desktop Layout */}
			<div className="w-full mx-auto items-center justify-center md:flex hidden flex-row gap-2 p-2 pt-16 relative bg-accent/30">
				<ChatContainer
					className="hidden md:flex flex-col h-[calc(100vh-4.5rem)]"
					title="Chat"
					messages={messages}
					status={status}
					regenerate={regenerate}
					input={input}
					setInput={setInput}
					handleSubmit={handleSubmit}
					webSearch={webSearch}
					setWebSearch={setWebSearch}
					model={selectedModel}
					setModel={selectModel}
					models={allModels}
					hasSources={selectedResources.length > 0}
				/>
				<SourcePanel
					className="hidden md:flex"
					setSourceDialogOpen={setSourceDialogOpen}
					chatId={slug}
					refreshTrigger={refreshSources}
					onNoSourcesDetected={() => setSourceDialogOpen(true)}
					selectedResources={selectedResources}
					onSelectedResourcesChange={handleSelectedResourcesChange}
				/>
			</div>

			<SourceDialog
				open={sourceDialogOpen}
				onOpenChange={setSourceDialogOpen}
				slug={slug}
				onSourcesAdded={() => setRefreshSources((prev) => prev + 1)}
			/>
		</div>
	);
}
