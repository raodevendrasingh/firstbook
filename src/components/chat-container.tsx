"use client";

import type { ChatStatus, UIMessage } from "ai";
import {
	CopyIcon,
	GlobeIcon,
	MessageSquare,
	RefreshCcwIcon,
} from "lucide-react";
import { Fragment } from "react";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
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
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import { cn } from "@/lib/utils";
import { Response } from "./ai-elements/response";

export type ChatContainerProps = {
	className?: string;
	title?: string;
	messages: UIMessage[];
	status: string;
	regenerate: () => void;
	input: string;
	setInput: (value: string) => void;
	handleSubmit: (e: React.FormEvent) => void;
	webSearch: boolean;
	setWebSearch: (value: boolean) => void;
	model: string;
	setModel: (value: string) => void;
	models: { name: string; value: string }[];
};

export function ChatContainer({
	className,
	title = "Chat",
	messages,
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
}: ChatContainerProps) {
	return (
		<div
			className={cn(
				"w-full mx-auto relative size-full border border-border rounded-md",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-3 border-b px-3 py-1 md:py-2 bg-accent rounded-t-md">
				<div className="flex items-center justify-start gap-3">
					<div className="font-medium">{title}</div>
				</div>
			</div>
			<div className="flex flex-col h-[calc(100vh-9.3rem)] md:h-[calc(100vh-7rem)] p-3">
				<Conversation className="h-full">
					<ConversationContent>
						{messages.length === 0 ? (
							<ConversationEmptyState
								icon={<MessageSquare className="size-12" />}
								title="No messages yet"
								description="Start a conversation to see messages here"
							/>
						) : (
							messages.map((message) => (
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
																<Response>
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
																messages.at(-1)
																	?.id
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
							))
						)}
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
								variant={webSearch ? "default" : "ghost"}
								onClick={() => setWebSearch(!webSearch)}
							>
								<GlobeIcon size={16} />
								<span>Search</span>
							</PromptInputButton>
							<PromptInputModelSelect
								onValueChange={(value) => setModel(value)}
								value={model}
							>
								<PromptInputModelSelectTrigger>
									<PromptInputModelSelectValue />
								</PromptInputModelSelectTrigger>
								<PromptInputModelSelectContent>
									{models.map((m) => (
										<PromptInputModelSelectItem
											key={m.value}
											value={m.value}
										>
											{m.name}
										</PromptInputModelSelectItem>
									))}
								</PromptInputModelSelectContent>
							</PromptInputModelSelect>
						</PromptInputTools>
						<PromptInputSubmit
							disabled={!input}
							status={status as ChatStatus}
						/>
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	);
}
