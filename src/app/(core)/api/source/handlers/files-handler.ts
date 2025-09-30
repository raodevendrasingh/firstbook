import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { embedding, resource } from "@/db/schema";
import { createServices } from "@/lib/ai/services";
import { getS3Client } from "@/lib/s3-client";
import type { FileData, UserSession } from "@/types/data-types";
import { createChunks } from "@/utils/createChunks";
import { normalizeVector } from "@/utils/normalize-vector";
import {
	cleanExtractedText,
	extractTextFromFile,
	generateTitleFromFilename,
} from "@/utils/text-extractor";

export async function handleFilesUpload(
	session: UserSession,
	data: { files: FileData[] },
	chatId: string,
	exaKey: string | null,
	googleKey: string | null,
) {
	for (const fileData of data.files) {
		try {
			const fileId = randomUUID();
			const fileName = `${fileId}_${fileData.name}`;
			const filePath = `sources/${chatId}/${fileName}`;

			const baseUrl = (process.env.R2_PUBLIC_ACCESS_URL ?? "").replace(
				/\/+$/,
				"",
			);
			const bucketName = process.env.R2_PUBLIC_BUCKET ?? "firstbook";
			const sourceUrl = baseUrl
				? `${baseUrl}/${bucketName}/${filePath}`
				: `/${bucketName}/${filePath}`;
			const fileBuffer = Buffer.from(fileData.data, "base64");

			const s3Client = getS3Client();
			const uploadCommand = new PutObjectCommand({
				Bucket: "firstbook",
				Key: filePath,
				Body: fileBuffer,
				ContentType: fileData.type,
				Metadata: {
					originalName: fileData.name,
					uploadedAt: new Date().toISOString(),
					chatId,
					fileId,
				},
			});

			try {
				await s3Client.send(uploadCommand);
			} catch (error) {
				throw new Error(
					`Failed to upload file ${fileData.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}

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
		} catch {}
	}
}
