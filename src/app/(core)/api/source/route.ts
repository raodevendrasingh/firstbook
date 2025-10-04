import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { chat, type Resource, resource } from "@/db/schema";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { getR2CredentialsForUser } from "@/lib/r2-service";
import type { ApiResponse } from "@/types/api-handler";
import type { FileData } from "@/types/data-types";
import { generateTitleFromResource } from "@/utils/generate-title-from-resource";
import { generateUnifiedSummary } from "@/utils/generate-unified-summary";
import { handleFilesUpload } from "./handlers/files-handler";
import { handleLinksProcessing } from "./handlers/links-handler";
import { handleTextProcessing } from "./handlers/text-handler";

interface FileUploadResponseData {
	warnings: string[];
}

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

		const exaKey = env.EXASEARCH_API_KEY;
		const googleKey = env.GOOGLE_GENERATIVE_AI_API_KEY;

		if (!googleKey) {
			return Response.json(
				{
					success: false,
					error: "Google API key is required for embeddings. Please configure it in your environment variables.",
					requiresSetup: true,
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		if (type === "links" && !exaKey) {
			return Response.json(
				{
					success: false,
					error: "Exa API key is required for URL processing. Please configure it in your environment variables.",
					requiresSetup: true,
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		if (type === "files") {
			try {
				await getR2CredentialsForUser(session.user.id);
			} catch {
				return Response.json(
					{
						success: false,
						error: "R2 credentials are not configured. Please configure your file upload credentials in environment variables.",
						requiresSetup: true,
					} satisfies ApiResponse,
					{ status: 400 },
				);
			}
		}

		if (type === "text" && !googleKey) {
			return Response.json(
				{
					success: false,
					error: "Google API key is required for text processing. Please configure it in your environment variables.",
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
					exaKey || null,
					googleKey || null,
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

				const uploadResult = await handleFilesUpload(
					session,
					{ files: data.files || [] },
					chatId,
					exaKey || null,
					googleKey || null,
				);

				if (
					uploadResult.successful.length === 0 &&
					uploadResult.failed.length > 0
				) {
					return Response.json(
						{
							success: false,
							error: `All file uploads failed: ${uploadResult.failed.map((f) => `${f.fileName}: ${f.error}`).join(", ")}`,
						} satisfies ApiResponse,
						{ status: 500 },
					);
				}

				if (uploadResult.failed.length > 0) {
					return Response.json(
						{
							success: true,
							message: `Sources added with warnings. Successful: ${uploadResult.successful.length}, Failed: ${uploadResult.failed.length}`,
							data: {
								warnings: uploadResult.failed.map(
									(f) => `${f.fileName}: ${f.error}`,
								),
							},
						} satisfies ApiResponse<FileUploadResponseData>,
						{ status: 200 },
					);
				}

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
					exaKey || null,
					googleKey || null,
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

		try {
			const allResources = await db
				.select({
					summary: resource.summary,
					title: resource.title,
					type: resource.type,
					content: sql<string>`LEFT(${resource.content}, 1000)`,
				})
				.from(resource)
				.where(
					and(
						eq(resource.chatId, chatId),
						eq(resource.userId, session.user.id),
					),
				);

			const resourceSummaries = allResources
				.map((r) => r.summary)
				.filter(
					(summary): summary is string =>
						summary !== null && summary.trim().length > 0,
				);

			if (chatTitle === "Untitled Notebook" || chatTitle === "") {
				try {
					const resourceWithContent = allResources.find(
						(r) => r.content && r.content.trim().length > 0,
					);

					if (resourceWithContent?.content) {
						const generatedTitle = await generateTitleFromResource({
							resource: {
								content: resourceWithContent.content,
							},
							googleKey: googleKey ?? undefined,
						});

						if (
							generatedTitle &&
							generatedTitle.trim().length > 0
						) {
							await db
								.update(chat)
								.set({ title: generatedTitle })
								.where(
									and(
										eq(chat.id, chatId),
										eq(chat.userId, session.user.id),
									),
								);
						}
					}
				} catch {
					// Silently fail if title generation fails
				}
			}

			if (resourceSummaries.length > 0) {
				const unifiedSummary = await generateUnifiedSummary({
					resourceSummaries,
					chatTitle,
					googleKey: googleKey ?? undefined,
				});

				if (unifiedSummary.trim().length > 0) {
					await db
						.update(chat)
						.set({ summary: unifiedSummary })
						.where(
							and(
								eq(chat.id, chatId),
								eq(chat.userId, session.user.id),
							),
						);
				}
			}
		} catch {
			// Silently handle error
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
