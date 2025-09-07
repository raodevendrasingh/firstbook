"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import { Fragment, use, useEffect, useState } from "react";
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

const models = [
	{
		name: "GPT 4o",
		value: "openai/gpt-4o",
	},
	{
		name: "Deepseek R1",
		value: "deepseek/deepseek-r1",
	},
];

interface NotebookPageProps {
	params: Promise<{ slug: string }>;
}

export default function NotebookPage({ params }: NotebookPageProps) {
	const { slug } = use(params);
	const [input, setInput] = useState("");
	const [model, setModel] = useState<string>(models[0].value);
	const [webSearch, setWebSearch] = useState(false);

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
		fetch(`/api/chat?chatId=${slug}`)
			.then((res) => res.json())
			.then((data) => {
				setMessages(data.messages);
			});
	}, [slug]);


	return (
		<div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
			<div className="flex flex-col h-full">
				<Conversation className="h-full">
					<ConversationContent>
						{messages.map((message) => (
							<div key={message.id}>
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
														<MessageContent>
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
						<PromptInputSubmit disabled={!input} status={status} />
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	);
}
