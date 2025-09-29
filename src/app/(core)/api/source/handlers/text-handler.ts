import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { embedding, type Resource, resource } from "@/db/schema";
import { createServices } from "@/lib/ai/services";
import type { UserSession } from "@/types/data-types";
import { createChunks } from "@/utils/createChunks";
import { generateTitleFromResource } from "@/utils/generate-title-from-resource";
import { normalizeVector } from "@/utils/normalize-vector";
import { sanitizeText } from "@/utils/sanitize-text";

export async function handleTextProcessing(
	session: UserSession,
	data: { text: string },
	chatId: string,
	exaKey: string | null,
	googleKey: string | null,
) {
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
		status: "fetched" as const,
		type: "text" as const,
		source: "user_input",
		vectorId: null,
		metadata: {
			inputMethod: "raw_text",
			textLength: cleanedText.length,
		},
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
	if (!embeddingsArr.length) throw new Error("No embeddings returned");

	const rows = embeddingsArr.map((e: { values?: number[] }, i: number) => ({
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
}
