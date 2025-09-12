import { randomUUID } from "node:crypto";
import {
	convertToModelMessages,
	stepCountIs,
	streamText,
	type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import systemPrompt from "@/ai/lib/prompt/system.md";
import { searchResource } from "@/ai/tools/search-resource";
import { webSearch } from "@/ai/tools/web-search";
import { db } from "@/db/drizzle";
import { chat, message, type Resource } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import { convertDbMessagesToUI } from "@/utils/convert-db-messages";
import { resolveModel } from "@/utils/resolve-models";

export const maxDuration = 30;

export const revalidate = 60;

type MessagePayload = {
	selectedModel: string;
	chatId: string;
	webSearch: boolean;
	id: string;
	messages: UIMessage[];
	selectedResources: Resource[];
};

export async function POST(req: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return Response.json(
			{ success: false, error: "Unauthorized" } satisfies ApiResponse,
			{ status: 401 },
		);
	}

	const payload: MessagePayload = await req.json();

	const latestUserMessage = payload.messages[payload.messages.length - 1];

	await db.insert(message).values({
		id: latestUserMessage.id,
		chatId: payload.chatId,
		role: "user",
		parts: latestUserMessage.parts,
		attachments: [],
		createdAt: new Date(),
	});

	const model = resolveModel(payload.selectedModel);

	const result = streamText({
		model,
		system: systemPrompt,
		stopWhen: stepCountIs(3),
		tools: {
			searchResource: searchResource(payload.selectedResources),
			...(payload.webSearch && { webSearch }),
		},
		messages: convertToModelMessages(payload.messages),
		onFinish: async (result) => {
			await db.insert(message).values({
				id: randomUUID(),
				chatId: payload.chatId,
				role: "assistant",
				parts: [{ type: "text", text: result.text }],
				attachments: [],
				createdAt: new Date(),
			});
		},
	});

	return result.toUIMessageStreamResponse();
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const chatId = searchParams.get("chatId");

		if (!chatId) {
			return Response.json(
				{
					success: false,
					error: "Chat ID is required",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		const notebook = await db
			.select()
			.from(chat)
			.where(eq(chat.id, chatId));

		if (!notebook) {
			return Response.json(
				{
					success: false,
					error: "Chat not found",
				} satisfies ApiResponse,
				{ status: 404 },
			);
		}

		const notebookTitle = notebook[0].title;

		const messages = await db
			.select()
			.from(message)
			.where(eq(message.chatId, chatId));

		const uiMessages = convertDbMessagesToUI(messages);

		return Response.json(
			{
				success: true,
				message: "Chat fetched",
				data: { messages: uiMessages, title: notebookTitle },
			} satisfies ApiResponse<{ messages: UIMessage[]; title: string }>,
			{ status: 200 },
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ success: false, error: errorMessage } satisfies ApiResponse,
			{ status: 500 },
		);
	}
}
