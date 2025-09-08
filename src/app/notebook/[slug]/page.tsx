"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
	ArrowLeftIcon,
	CopyIcon,
	GlobeIcon,
	PlusIcon,
	RefreshCcwIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputButton,
	PromptInputModelSelect,
	PromptInputModelSelectContent,
	PromptInputModelSelectItem,
	PromptInputModelSelectTrigger,
	PromptInputModelSelectValue,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import { SourceDialog } from "@/components/source-dialog";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";
import type { FetchChatResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

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
	const [sourcePanelOpen, setSourcePanelOpen] = useState<boolean>(false);

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

						<span className="text-xl font-medium">
							{title.length > 0 ? title : "Untitled Notebook"}
						</span>
					</div>
					<div className="flex flex-row items-center gap-3">
						<Button
							size="icon"
							className="rounded-full md:hidden"
							onClick={() => setSourceDialogOpen(true)}
						>
							<PlusIcon />
						</Button>
						<Button
							size="icon"
							className="rounded-full md:hidden"
							onClick={() => setSourcePanelOpen((prev) => !prev)}
						>
							<GlobeIcon />
						</Button>
						<UserDropdown className="hidden md:block" />
					</div>
				</div>
			</nav>
			<div className="w-full mx-auto items-center justify-center flex flex-row gap-2 p-2 pt-16 relative">
				{/* Chat Container */}
				<div className="w-full mx-auto relative size-full h-[calc(100vh-4.5rem)] border border-border rounded-md">
					<div className="flex items-center justify-between gap-3 border-b px-3 py-2 bg-accent rounded-t-md">
						<div className="flex items-center justify-start gap-3">
							<div className="font-medium">Chat</div>
						</div>
					</div>
					<div className="flex flex-col h-[calc(100vh-7rem)] p-3">
						<Conversation className="h-full">
							<ConversationContent>
								{messages.map((message) => (
									<div key={message.id}>
										{message.role === "assistant" &&
											message.parts.filter(
												(part) =>
													part.type === "source-url",
											).length > 0 && (
												<Sources>
													<SourcesTrigger
														count={
															message.parts.filter(
																(part) =>
																	part.type ===
																	"source-url",
															).length
														}
													/>
													{message.parts
														.filter(
															(part) =>
																part.type ===
																"source-url",
														)
														.map((part, i) => (
															<SourcesContent
																key={`${message.id}-${i}`}
															>
																<Source
																	key={`${message.id}-${i}`}
																	href={
																		part.url
																	}
																	title={
																		part.url
																	}
																/>
															</SourcesContent>
														))}
												</Sources>
											)}
										{message.parts.map((part, i) => {
											switch (part.type) {
												case "text":
													return (
														<Fragment
															key={`${message.id}-${i}`}
														>
															<Message
																from={
																	message.role
																}
															>
																<MessageContent>
																	<Response>
																		{
																			part.text
																		}
																	</Response>
																</MessageContent>
															</Message>
															{message.role ===
																"assistant" &&
																i ===
																	messages.length -
																		1 && (
																	<Actions className="mt-2">
																		<Action
																			onClick={() =>
																				regenerate()
																			}
																			label="Retry"
																		>
																			<RefreshCcwIcon className="size-3" />
																		</Action>
																		<Action
																			onClick={() =>
																				navigator.clipboard.writeText(
																					part.text,
																				)
																			}
																			label="Copy"
																		>
																			<CopyIcon className="size-3" />
																		</Action>
																	</Actions>
																)}
														</Fragment>
													);
												case "reasoning":
													return (
														<Reasoning
															key={`${message.id}-${i}`}
															className="w-full"
															isStreaming={
																status ===
																	"streaming" &&
																i ===
																	message
																		.parts
																		.length -
																		1 &&
																message.id ===
																	messages.at(
																		-1,
																	)?.id
															}
														>
															<ReasoningTrigger />
															<ReasoningContent>
																{part.text}
															</ReasoningContent>
														</Reasoning>
													);
												default:
													return null;
											}
										})}
									</div>
								))}
								{status === "submitted" && <Loader />}
							</ConversationContent>
							<ConversationScrollButton />
						</Conversation>

						<PromptInput onSubmit={handleSubmit} className="mt-4">
							<PromptInputTextarea
								onChange={(e) => setInput(e.target.value)}
								value={input}
							/>
							<PromptInputToolbar>
								<PromptInputTools>
									<PromptInputButton
										variant={
											webSearch ? "default" : "ghost"
										}
										onClick={() => setWebSearch(!webSearch)}
									>
										<GlobeIcon size={16} />
										<span>Search</span>
									</PromptInputButton>
									<PromptInputModelSelect
										onValueChange={(value) => {
											setModel(value);
										}}
										value={model}
									>
										<PromptInputModelSelectTrigger>
											<PromptInputModelSelectValue />
										</PromptInputModelSelectTrigger>
										<PromptInputModelSelectContent>
											{models.map((model) => (
												<PromptInputModelSelectItem
													key={model.value}
													value={model.value}
												>
													{model.name}
												</PromptInputModelSelectItem>
											))}
										</PromptInputModelSelectContent>
									</PromptInputModelSelect>
								</PromptInputTools>
								<PromptInputSubmit
									disabled={!input}
									status={status}
								/>
							</PromptInputToolbar>
						</PromptInput>
					</div>
				</div>
				{/* Sources Panel */}
				<div
					className={cn(
						"hidden md:block md:relative md:max-w-xs lg:max-w-md h-[calc(100vh-4.5rem)] bg-background border w-full rounded-md",
						sourcePanelOpen
							? "block fixed top-16 left-2 right-2 bottom-0 z-40 bg-background md:relative md:inset-auto md:z-auto md:w-full"
							: "hidden",
					)}
				>
					<div className="flex items-center justify-between gap-3 border-b px-3 py-1 bg-accent rounded-t-md">
						<div className="flex items-center justify-center gap-3">
							<div className="font-medium">Sources</div>
						</div>
						<div className="flex items-center gap-3">
							<Button
								className="rounded-full md:hidden"
								onClick={() => setSourcePanelOpen(false)}
								variant="secondary"
								size="icon"
							>
								<ArrowLeftIcon className="size-4" />
							</Button>
							<Button
								variant="default"
								className="rounded-full"
								size="sm"
								onClick={() => setSourceDialogOpen(true)}
							>
								<PlusIcon className="size-4" />
								Add
							</Button>
						</div>
					</div>
					<div className="flex flex-col gap-2 p-3 bg-background" />
				</div>
			</div>
			<SourceDialog
				open={sourceDialogOpen}
				onOpenChange={setSourceDialogOpen}
			/>
		</>
	);
}
