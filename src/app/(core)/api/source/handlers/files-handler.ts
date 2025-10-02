import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { embedding, resource } from "@/db/schema";
import { createServices } from "@/lib/ai/services";
import {
	getR2CredentialsForUser,
	getR2PublicUrl,
	uploadFileToR2,
} from "@/lib/r2-service";
import type { FileData, UserSession } from "@/types/data-types";
import { createChunks } from "@/utils/createChunks";
import { normalizeVector } from "@/utils/normalize-vector";
import {
	cleanExtractedText,
	extractTextFromFile,
	generateTitleFromFilename,
} from "@/utils/text-extractor";

interface FileUploadResult {
	successful: Array<{
		fileName: string;
		resourceId: string;
	}>;
	failed: Array<{
		fileName: string;
		error: string;
	}>;
}

export async function handleFilesUpload(
	session: UserSession,
	data: { files: FileData[] },
	chatId: string,
	exaKey: string | null,
	googleKey: string | null,
): Promise<FileUploadResult> {
	const r2Credentials = await getR2CredentialsForUser(session.user.id);

	const result: FileUploadResult = {
		successful: [],
		failed: [],
	};

	for (const fileData of data.files) {
		try {
			const fileId = randomUUID();
			const fileName = `${fileId}_${fileData.name}`;
			const filePath = `sources/${chatId}/${fileName}`;

			const sourceUrl = getR2PublicUrl(r2Credentials, filePath);
			const fileBuffer = Buffer.from(fileData.data, "base64");

			await uploadFileToR2(
				r2Credentials,
				filePath,
				fileBuffer,
				fileData.type,
				{
					originalName: fileData.name,
					uploadedAt: new Date().toISOString(),
					chatId,
					fileId,
				},
			);

			let extractedText = "";
			try {
				extractedText = await extractTextFromFile(
					fileBuffer,
					fileData.type,
				);
				if (extractedText) {
					extractedText = cleanExtractedText(extractedText);
				}
			} catch {}

			const title = generateTitleFromFilename(fileData.name);
			const resourceId = randomUUID();

			const resourcesData = {
				id: resourceId,
				chatId,
				userId: session.user.id,
				title,
				content: extractedText || title,
				status: "fetched" as const,
				type: "files" as const,
				source: sourceUrl,
				vectorId: null,
				metadata: {
					fileName: fileData.name,
					fileSize: fileData.size,
					mimeType: fileData.type,
					hasTextContent: extractedText.length > 0,
				},
				createdAt: new Date(),
			};

			if (extractedText) {
				const chunks = createChunks(extractedText);

				const { googleAI: googleAIForFiles } = createServices({
					exaKey: exaKey!,
					googleKey: googleKey!,
				});

				const vectorResp = await googleAIForFiles.models.embedContent({
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
			} else {
				await db.insert(resource).values(resourcesData);
			}

			result.successful.push({
				fileName: fileData.name,
				resourceId,
			});
		} catch (error) {
			result.failed.push({
				fileName: fileData.name,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	return result;
}
