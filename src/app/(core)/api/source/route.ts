import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { chat, embedding, type Resource, resource } from "@/db/schema";
import { createServices } from "@/lib/ai/services";
import { getApiKey } from "@/lib/api-keys";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types/api-handler";
import { createChunks } from "@/utils/createChunks";
import { generateTitleFromResource } from "@/utils/generate-title-from-resource";
import { normalizeVector } from "@/utils/normalize-vector";
import { sanitizeText } from "@/utils/sanitize-text";

interface SourcePayload {
	chatId: string;
	type: "files" | "links" | "text";
	data: {
		urls?: string[];
		files?: File[];
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
		let titleUpdated = false;

		const [exaKey, googleKey] = await Promise.all([
			getApiKey(session.user.id, "exa"),
			getApiKey(session.user.id, "gemini"),
		]);

		if (!googleKey) {
			return Response.json(
				{
					success: false,
					error: "Google API key is required for embeddings",
					requiresSetup: true,
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		if (type === "links" && !exaKey) {
			return Response.json(
				{
					success: false,
					error: "Exa API key is required for source processing",
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

				const uniqueUrls = [...new Set(data.urls)].filter((url) => {
					try {
						new URL(url);
						return true;
					} catch {
						return false;
					}
				});

				if (uniqueUrls.length === 0) {
					return Response.json(
						{
							success: false,
							error: "No valid URLs provided",
						} satisfies ApiResponse,
						{ status: 400 },
					);
				}

				if (!exaKey) {
					return Response.json(
						{
							success: false,
							error: "Exa API key is required for source processing",
							requiresSetup: true,
						} satisfies ApiResponse,
						{ status: 400 },
					);
				}

				await Promise.all(
					uniqueUrls.map(async (url) => {
						const { exa, googleAI } = createServices({
							exaKey: exaKey!,
							googleKey: googleKey!,
						});

						const result = await exa!.getContents([url], {
							text: true,
						});
						const exaResult = result.results?.[0];
						if (!exaResult?.text) return;

						if (chatTitle.length === 0 && !titleUpdated) {
							titleUpdated = true;
							await generateTitleFromResource({
								resource: {
									title: exaResult.title ?? "",
									content: exaResult.text ?? "",
								},
								googleKey: googleKey ?? undefined,
							})
								.then(async (title) => {
									await db
										.update(chat)
										.set({ title })
										.where(
											and(
												eq(chat.id, chatId),
												eq(
													chat.userId,
													session.user.id,
												),
											),
										);
								})
								.catch(() => {});
						}

						const cleanedText = sanitizeText(exaResult.text);

						const resourceId = randomUUID();

						const resourcesData = {
							id: resourceId,
							chatId,
							userId: session.user.id,
							title: exaResult.title ?? "",
							content: cleanedText,
							status: "fetched",
							type: "links",
							source: url,
							createdAt: new Date(),
						} as Resource;

						const chunks = createChunks(cleanedText);

						const vectorResp = await googleAI.models.embedContent({
							model: "gemini-embedding-001",
							contents: chunks,
							config: {
								outputDimensionality: 1536,
							},
						});

						const embeddingsArr = vectorResp.embeddings ?? [];
						if (!embeddingsArr.length)
							throw new Error("No embeddings returned");

						const rows = embeddingsArr.map((e, i) => ({
							id: randomUUID(),
							resourceId,
							chatId,
							chunk: chunks[i],
							position: i,
							vector: normalizeVector(e.values ?? []),
							createdAt: new Date(),
							model: "gemini-embedding-001",
						}));

						await db.transaction(async (tx) => {
							await tx.insert(resource).values(resourcesData);
							await tx.insert(embedding).values(rows);
							await tx
								.update(resource)
								.set({ status: "embedded" })
								.where(eq(resource.id, resourceId));
						});
					}),
				);
				break;
			}

			case "files": {
				// TODO: Implement file processing
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

				// Placeholder for file processing logic
				// TODO: Implement file processing
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

				const cleanedText = sanitizeText(data.text);

				const resourceId = randomUUID();

				const generatedTitle = await generateTitleFromResource({
					resource: {
						content: cleanedText,
					},
					googleKey: googleKey ?? undefined,
				}).catch(() => "Text Document");

				const resourcesData = {
					id: resourceId,
					chatId,
					userId: session.user.id,
					title: generatedTitle,
					content: cleanedText,
					status: "fetched",
					type: "text",
					source: "user_input",
					createdAt: new Date(),
				} as Resource;

				const chunks = createChunks(cleanedText);

				const { googleAI: googleAIForText } = createServices({
					exaKey: exaKey!,
					googleKey: googleKey!,
				});

				const vectorResp = await googleAIForText.models.embedContent({
					model: "gemini-embedding-001",
					contents: chunks,
					config: {
						outputDimensionality: 1536,
					},
				});

				const embeddingsArr = vectorResp.embeddings ?? [];
				if (!embeddingsArr.length)
					throw new Error("No embeddings returned");

				const rows = embeddingsArr.map(
					(e: { values?: number[] }, i: number) => ({
						id: randomUUID(),
						resourceId,
						chatId,
						chunk: chunks[i],
						position: i,
						vector: normalizeVector(e.values ?? []),
						createdAt: new Date(),
						model: "gemini-embedding-001",
					}),
				);

				await db.transaction(async (tx) => {
					await tx.insert(resource).values(resourcesData);
					await tx.insert(embedding).values(rows);
					await tx
						.update(resource)
						.set({ status: "embedded" })
						.where(eq(resource.id, resourceId));
				});
				break;
			}

			default: {
				return Response.json(
					{
						success: false,
						error: "Invalid type. Must be 'files', 'links', or 'text'",
					} satisfies ApiResponse,
					{ status: 400 },
				);
			}
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
