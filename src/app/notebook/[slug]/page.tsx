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
import type { FetchChatResponse } from "@/lib/types";

const models = [
	{
		name: "Gemini 2.5 Pro",
		value: "gemini-2.5-pro",
	},
	{
		name: "Gemini 2.5 Flash",
		value: "gemini-2.5-flash",
	},
	{
		name: "Gemini 2.5 Flash-Lite",
		value: "gemini-2.5-flash-lite",
	},
	{
		name: "Gemini 2.0 Flash",
		value: "gemini-2.0-flash",
	},
	{
		name: "Gemini 2.0 Flash-Lite",
		value: "gemini-2.0-flash-lite",
	},
];

interface NotebookPageProps {
	params: Promise<{ slug: string }>;
}

export default function NotebookPage({ params }: NotebookPageProps) {
	const { slug } = use(params);
	const router = useRouter();
	const [input, setInput] = useState("");
	const [model, setModel] = useState<string>(models[0].value);
	const [webSearch, setWebSearch] = useState<boolean>(false);
	const [title, setTitle] = useState<string>("");
	const [sourceDialogOpen, setSourceDialogOpen] = useState<boolean>(false);

	const { messages, sendMessage, status, regenerate, setMessages } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			sendMessage(
				{ text: input },
				{
					body: {
						model: model,
						chatId: slug,
						webSearch: webSearch,
					},
				},
			);
			setInput("");
		}
	};

	useEffect(() => {
		let isCancelled = false;
		let intervalId: NodeJS.Timeout | null = null;

		const fetchOnce = () =>
			fetch(`/api/chat?chatId=${slug}`)
				.then((res) => res.json())
				.then((result: FetchChatResponse) => {
					if (!result.success) {
						toast.error("Chat not found!");
						router.push("/notebooks");
						return;
					}
					setMessages(result.data.messages);
					setTitle(result.data.title);

					if (
						!isCancelled &&
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

		fetchOnce();

		return () => {
			isCancelled = true;
			if (intervalId) clearInterval(intervalId);
		};
	}, [slug, setMessages, router, title.length]);

	return (
		<>
			<nav className="fixed flex items-center h-14 w-full md:px-8 px-4 bg-primary-foreground z-50">
				<div className="flex w-full items-center justify-between mx-auto">
					<div className="flex flex-row items-center gap-3">
						<Button
							onClick={() => router.back()}
							variant="secondary"
							size="icon"
							className="rounded-full bg-zinc-200 border border-zinc-300"
						>
							<ArrowLeftIcon className="size-4" />
						</Button>

						<span className="text-base line-clamp-1 md:text-xl font-medium">
							{title.length > 0 ? title : "Untitled Notebook"}
						</span>
					</div>
					<UserDropdown />
				</div>
			</nav>

			{/* Mobile Tabs */}
			<Tabs defaultValue="chat" className="pt-16 block md:hidden">
				<TabsList className="mx-2">
					<TabsTrigger value="chat">Chat</TabsTrigger>
					<TabsTrigger value="sources">Sources</TabsTrigger>
				</TabsList>
				<div className="flex flex-col h-[calc(100vh-6.7rem)]">
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
							model={model}
							setModel={setModel}
							models={models}
						/>
					</TabsContent>
					<TabsContent value="sources" className="p-2">
						<SourcePanel
							setSourceDialogOpen={setSourceDialogOpen}
							className="block md:hidden"
						/>
					</TabsContent>
				</div>
			</Tabs>

			{/* Desktop Layout */}
			<div className="w-full mx-auto items-center justify-center md:flex hidden flex-row gap-2 p-2 pt-16 relative">
				<ChatContainer
					className="hidden md:block h-[calc(100vh-4.5rem)]"
					title="Chat"
					messages={messages}
					status={status}
					regenerate={regenerate}
					input={input}
					setInput={setInput}
					handleSubmit={handleSubmit}
					webSearch={webSearch}
					setWebSearch={setWebSearch}
					model={model}
					setModel={setModel}
					models={models}
				/>
				<SourcePanel
					className="hidden md:block"
					setSourceDialogOpen={setSourceDialogOpen}
				/>
			</div>

			<SourceDialog
				open={sourceDialogOpen}
				onOpenChange={setSourceDialogOpen}
				slug={slug}
			/>
		</>
	);
}
