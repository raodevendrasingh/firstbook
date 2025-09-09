import { randomUUID } from "node:crypto";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { chat, message } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateTitleFromUserMessage } from "@/utils/generate-title-from-user-message";

export const maxDuration = 30;

type MessagePayload = {
	model: string;
	chatId: string;
	webSearch: boolean;
	id: string;
	messages: UIMessage[];
};

export async function POST(req: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return Response.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 },
		);
	}

	const { messages, chatId, model }: MessagePayload = await req.json();

	const chatResult = await db
		.select()
		.from(chat)
		.where(and(eq(chat.id, chatId), eq(chat.userId, session.user.id)))
		.then((res) => res[0]);

	if (!chatResult) {
		return Response.json(
			{ success: false, error: "Chat not found" },
			{ status: 404 },
		);
	}

	const chatTitle = chatResult.title;

	if (messages.length === 1 && chatTitle.length === 0) {
		generateTitleFromUserMessage({
			message: messages[0],
		})
			.then(async (title) => {
				await db.update(chat).set({ title }).where(eq(chat.id, chatId));
			})
			.catch((error) => {
				// ignore error
			});
	}

	const latestUserMessage = messages[messages.length - 1];

	await db.insert(message).values({
		id: randomUUID(),
		chatId,
		role: "user",
		parts: latestUserMessage.parts,
		attachments: [],
		createdAt: new Date(),
	});

	const result = streamText({
		model: google(model),
		system: "You are a helpful assistant.",
		messages: convertToModelMessages(messages),
		onFinish: async (result) => {
			await db.insert(message).values({
				id: randomUUID(),
				chatId: chatId,
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
				{ success: false, error: "Chat ID is required" },
				{ status: 400 },
			);
		}

		const notebook = await db
			.select()
			.from(chat)
			.where(eq(chat.id, chatId));

		if (!notebook) {
			return Response.json(
				{ success: false, error: "Chat not found" },
				{ status: 404 },
			);
		}

		const title = notebook[0].title;

		const messages = await db
			.select()
			.from(message)
			.where(eq(message.chatId, chatId));

		return Response.json(
			{
				success: true,
				message: "Chat fetched",
				data: { messages, title },
			},
			{ status: 200 },
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ success: false, error: errorMessage },
			{ status: 500 },
		);
	}
}
