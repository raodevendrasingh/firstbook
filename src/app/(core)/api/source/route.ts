import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { chat, type Resource, resource } from "@/db/schema";
import { getApiKey } from "@/lib/api-keys";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types/api-handler";
import type { FileData } from "@/types/data-types";
import { handleFilesUpload } from "./handlers/files-handler";
import { handleLinksProcessing } from "./handlers/links-handler";
import { handleTextProcessing } from "./handlers/text-handler";

interface SourcePayload {
	chatId: string;
	type: "files" | "links" | "text";
	data: {
		urls?: string[];
		files?: FileData[];
		text?: string;
	};
}

export async function POST(request: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" } satisfies ApiResponse,
				{ status: 401 },
			);
		}

		const { type, data, chatId }: SourcePayload = await request.json();

		if (!type || !chatId) {
			return Response.json(
				{
					success: false,
					error: "Type and chatId are required",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		const chatResult = await db
			.select()
			.from(chat)
			.where(and(eq(chat.id, chatId), eq(chat.userId, session.user.id)))
			.then((res) => res[0]);

		if (!chatResult) {
			return Response.json(
				{
					success: false,
					error: "Chat not found",
				} satisfies ApiResponse,
				{ status: 404 },
			);
		}

		const chatTitle = chatResult.title;
		const titleUpdated = false;

		const [exaKey, googleKey] = await Promise.all([
			getApiKey(session.user.id, "exa"),
			getApiKey(session.user.id, "gemini"),
		]);

		// Validate required API keys
		if (!googleKey) {
			return Response.json(
				{
					success: false,
					error: "Google API key is required for embeddings. Please configure it in settings.",
					requiresSetup: true,
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		if (type === "links" && !exaKey) {
			return Response.json(
				{
					success: false,
					error: "Exa API key is required for URL processing. Please configure it in settings.",
					requiresSetup: true,
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		if (type === "files") {
			if (!process.env.R2_S3_API_ENDPOINT) {
				return Response.json(
					{
						success: false,
						error: "R2 S3 endpoint is not configured. Please configure R2 credentials in environment variables.",
						requiresSetup: true,
					} satisfies ApiResponse,
					{ status: 500 },
				);
			}
			if (
				!process.env.R2_ACCESS_KEY_ID ||
				!process.env.R2_SECRET_ACCESS_KEY
			) {
				return Response.json(
					{
						success: false,
						error: "R2 access credentials are not configured. Please configure R2 credentials in environment variables.",
						requiresSetup: true,
					} satisfies ApiResponse,
					{ status: 500 },
				);
			}
		}

		if (type === "text" && !googleKey) {
			return Response.json(
				{
					success: false,
					error: "Google API key is required for text processing. Please configure it in settings.",
					requiresSetup: true,
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		switch (type) {
			case "links": {
				if (
					!data.urls ||
					!Array.isArray(data.urls) ||
					data.urls.length === 0
				) {
					return Response.json(
						{
							success: false,
							error: "URLs array is required for links type",
						} satisfies ApiResponse,
						{ status: 400 },
					);
				}

				await handleLinksProcessing(
					session,
					{ urls: data.urls || [] },
					chatId,
					chatTitle,
					titleUpdated,
					exaKey,
					googleKey,
				);
				break;
			}

			case "files": {
				if (
					!data.files ||
					!Array.isArray(data.files) ||
					data.files.length === 0
				) {
					return Response.json(
						{
							success: false,
							error: "Files array is required for files type",
						} satisfies ApiResponse,
						{ status: 400 },
					);
				}

				await handleFilesUpload(
					session,
					{ files: data.files || [] },
					chatId,
					exaKey,
					googleKey,
				);
				break;
			}

			case "text": {
				if (
					!data.text ||
					typeof data.text !== "string" ||
					data.text.trim().length === 0
				) {
					return Response.json(
						{
							success: false,
							error: "Text content is required for text type",
						} satisfies ApiResponse,
						{ status: 400 },
					);
				}

				await handleTextProcessing(
					session,
					{ text: data.text || "" },
					chatId,
					exaKey,
					googleKey,
				);
				break;
			}

			default:
				return Response.json(
					{
						success: false,
						error: "Invalid type. Must be 'files', 'links', or 'text'",
					} satisfies ApiResponse,
					{ status: 400 },
				);
		}

		return Response.json(
			{ success: true, message: "Source(s) added" } satisfies ApiResponse,
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

export async function GET(request: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" } satisfies ApiResponse,
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
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

		const sources = await db
			.select()
			.from(resource)
			.where(
				and(
					eq(resource.chatId, chatId),
					eq(resource.userId, session.user.id),
				),
			);

		return Response.json(
			{
				success: true,
				message: "Resource(s) fetched",
				data: {
					resource: sources,
				},
			} satisfies ApiResponse<{ resource: Resource[] }>,
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

export async function DELETE(request: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" } satisfies ApiResponse,
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const chatId = searchParams.get("chatId");
		const id = searchParams.get("id");

		if (!chatId || !id) {
			return Response.json(
				{
					success: false,
					error: "Chat ID and resource ID are required",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		const resourceResult = await db
			.select()
			.from(resource)
			.where(
				and(
					eq(resource.id, id),
					eq(resource.chatId, chatId),
					eq(resource.userId, session.user.id),
				),
			)
			.then((res) => res[0]);

		if (!resourceResult) {
			return Response.json(
				{
					success: false,
					error: "Resource not found or access denied",
				} satisfies ApiResponse,
				{ status: 404 },
			);
		}

		await db.delete(resource).where(eq(resource.id, id));

		return Response.json(
			{
				success: true,
				message: "Resource deleted successfully",
			} satisfies ApiResponse,
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
