import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { exa, googleAI } from "@/ai/lib/services";
import { db } from "@/db/drizzle";
import { chat, embedding, type Resource, resource } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import { createChunks } from "@/utils/createChunks";
import { generateTitleFromResource } from "@/utils/generate-title-from-resource";
import { normalizeVector } from "@/utils/normalize-vector";
import { sanitizeText } from "@/utils/sanitize-text";

type SourcePayload = {
	urls: string[];
	chatId: string;
};

export async function POST(request: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { urls, chatId }: SourcePayload = await request.json();

		if (!urls || !Array.isArray(urls) || urls.length === 0) {
			return Response.json(
				{ success: false, error: "URLs array is required" },
				{ status: 400 },
			);
		}

		const uniqueUrls = [...new Set(urls)].filter((url) => {
			try {
				new URL(url);
				return true;
			} catch {
				return false;
			}
		});

		if (uniqueUrls.length === 0) {
			return Response.json(
				{ success: false, error: "No valid URLs provided" },
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
				{ success: false, error: "Chat not found" },
				{ status: 404 },
			);
		}

		const chatTitle = chatResult.title;
		let titleUpdated = false;

		await Promise.all(
			uniqueUrls.map(async (url) => {
				const result = await exa.getContents([url], { text: true });
				const exaResult = result.results?.[0];
				if (!exaResult?.text) return;

				if (chatTitle.length === 0 && !titleUpdated) {
					titleUpdated = true;
					await generateTitleFromResource({
						resource: {
							title: exaResult.title ?? "",
							content: exaResult.text ?? "",
						},
					})
						.then(async (title) => {
							await db
								.update(chat)
								.set({ title })
								.where(
									and(
										eq(chat.id, chatId),
										eq(chat.userId, session.user.id),
									),
								);
						})
						.catch((error) => {
							// silently ignore error
						});
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
					type: "text",
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

		return Response.json(
			{ success: true, message: "Source(s) added" } satisfies ApiResponse,
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

export async function GET(request: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const chatId = searchParams.get("chatId");

		if (!chatId) {
			return Response.json(
				{ success: false, error: "Chat ID is required" },
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
