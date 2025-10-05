"use client";

import type { ChatStatus, UIMessage } from "ai";
import { CheckIcon, CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputButton,
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
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import { ModelCombobox } from "@/components/model-combobox";
import { cn } from "@/lib/utils";
import { Response } from "./ai-elements/response";
import { DotsLoader } from "./loader";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

export type ChatContainerProps = {
	className?: string;
	title?: string;
	messages: UIMessage[];
	summary?: string;
	status: string;
	regenerate: () => void;
	input: string;
	setInput: (value: string) => void;
	handleSubmit: (e: React.FormEvent) => void;
	webSearch: boolean;
	setWebSearch: (value: boolean) => void;
	model: string;
	setModel: (value: string) => void;
	models: string[];
	isLoading?: boolean;
	hasSources?: boolean;
	sourceCount?: number;
};

export function ChatContainer({
	className,
	title,
	messages,
	summary,
	status,
	regenerate,
	input,
	setInput,
	handleSubmit,
	webSearch,
	setWebSearch,
	model,
	setModel,
	models,
	isLoading,
	hasSources = true,
	sourceCount = 0,
}: ChatContainerProps) {
	const [justCopied, setJustCopied] = useState(false);

	useEffect(() => {
		if (justCopied) {
			const timer = setTimeout(() => setJustCopied(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [justCopied]);

	return (
		<div
			className={cn(
				"w-full mx-auto relative size-full border border-border rounded-xl bg-background",
				className,
			)}
		>
			<div className="flex flex-col h-[calc(100vh-7.3rem)] md:h-[calc(100vh-4.7rem)] p-3">
				<Conversation className="h-full">
					<ConversationContent>
						<div className="flex flex-col gap-2 max-w-4xl mx-auto pt-5">
							{isLoading ? (
								<div className="flex flex-col gap-3">
									<Skeleton className="h-9 w-3/4 rounded-lg" />
									<Skeleton className="h-5 w-28 rounded-full" />
									<div className="flex flex-col gap-2">
										{[1, 2, 3, 4, 5, 6, 7].map((num) => (
											<Skeleton
												key={`summary-skeleton-${num}`}
												className="h-7 w-full rounded-lg"
											/>
										))}
									</div>
									<Separator />
								</div>
							) : (
								<>
									{title && (
										<h1 className="text-3xl font-semibold">
											{title}
										</h1>
									)}
									{sourceCount > 0 && (
										<span className="text-sm text-muted-foreground">
											{sourceCount}{" "}
											{sourceCount === 1
												? "source"
												: "sources"}
										</span>
									)}
									{summary && (
										<div className="flex flex-col gap-3">
											<p className="text-sm leading-6 text-muted-foreground text-balance">
												{summary}
											</p>
											<div className="flex justify-end">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														navigator.clipboard.writeText(
															summary,
														);
														setJustCopied(true);
													}}
													className="h-7 px-2 text-xs"
												>
													{justCopied ? (
														<CheckIcon className="size-3" />
													) : (
														<CopyIcon className="size-3" />
													)}
													{justCopied
														? "Copied!"
														: "Copy summary"}
												</Button>
											</div>
										</div>
									)}
									{(title || summary) && <Separator />}
								</>
							)}
						</div>
						{messages.map((message) => (
							<div key={message.id} className="max-w-4xl mx-auto">
								{message.role === "assistant" &&
									message.parts.filter(
										(part) => part.type === "source-url",
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
															href={part.url}
															title={part.url}
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
														from={message.role}
													>
														<MessageContent variant="flat">
															<Response className="md:text-base">
																{part.text}
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
															message.parts
																.length -
																1 &&
														message.id ===
															messages.at(-1)?.id
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
						{(() => {
							const lastMessage = messages.at(-1);
							const hasTextContent =
								lastMessage?.role === "assistant" &&
								lastMessage.parts?.some(
									(part) =>
										part.type === "text" &&
										part.text?.trim().length > 0,
								);

							const showLoader =
								status === "submitted" ||
								(status === "streaming" && !hasTextContent);

							return (
								showLoader && (
									<div className="max-w-4xl mx-auto">
										<DotsLoader />
									</div>
								)
							);
						})()}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>

				<PromptInput
					onSubmit={handleSubmit}
					className={cn(
						"mt-4 rounded-3xl border-2 border-primary/20 shadow-3xl p-1",
						!hasSources && "opacity-70 pointer-events-none",
					)}
				>
					<PromptInputTextarea
						onChange={(e) => setInput(e.target.value)}
						value={input}
						disabled={!hasSources}
						className="border"
						placeholder={
							hasSources
								? "What would you like to know?"
								: "Add sources to start chatting"
						}
					/>
					<PromptInputToolbar>
						<PromptInputTools>
							<PromptInputButton
								variant={webSearch ? "default" : "outline"}
								onClick={() => setWebSearch(!webSearch)}
								disabled={!hasSources}
								className="rounded-full border"
							>
								<GlobeIcon size={16} />
								<span>Search</span>
							</PromptInputButton>
							<ModelCombobox
								models={models}
								selectedModel={model}
								onModelChange={setModel}
								disabled={!hasSources}
								className="border"
							/>
						</PromptInputTools>
						<PromptInputSubmit
							className="rounded-full"
							disabled={!input || !hasSources}
							status={status as ChatStatus}
						/>
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	);
}
