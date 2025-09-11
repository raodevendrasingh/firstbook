import type { UIMessage } from "ai";
import type { Message } from "@/db/schema";

export function convertDbMessagesToUI(messages: Message[]): UIMessage[] {
	return messages.map((msg) => {
		const uiMessage: UIMessage = {
			id: msg.id,
			role: msg.role as "user" | "assistant" | "system",
			parts: msg.parts as UIMessage["parts"],
		};

		return uiMessage;
	});
}
