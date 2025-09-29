import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { chat, embedding, type Resource, resource } from "@/db/schema";
import { createServices } from "@/lib/ai/services";
import type { UserSession } from "@/types/data-types";
import { createChunks } from "@/utils/createChunks";
import { generateTitleFromResource } from "@/utils/generate-title-from-resource";
import { normalizeVector } from "@/utils/normalize-vector";
import { sanitizeText } from "@/utils/sanitize-text";

export async function handleLinksProcessing(
	session: UserSession,
	data: { urls: string[] },
	chatId: string,
	chatTitle: string,
	titleUpdated: boolean,
	exaKey: string | null,
	googleKey: string | null,
) {
	const uniqueUrls = [...new Set(data.urls)].filter((url) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	});

	if (uniqueUrls.length === 0) {
		throw new Error("No valid URLs provided");
	}

	if (!exaKey) {
		throw new Error("Exa API key is required for source processing");
	}

	await Promise.all(
		uniqueUrls.map(async (url) => {
			const { exa, googleAI } = createServices({
				exaKey: exaKey!,
				googleKey: googleKey!,
			});

			const result = await exa!.getContents([url], { text: true });
			const exaResult = result.results?.[0];
			if (!exaResult?.text) return;

			if (chatTitle.length === 0 && !titleUpdated) {
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
									eq(chat.userId, session.user.id),
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
				status: "fetched" as const,
				type: "links" as const,
				source: url,
				vectorId: null,
				metadata: {
					url,
					title: exaResult.title,
					extractedTextLength: cleanedText.length,
				},
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
}
