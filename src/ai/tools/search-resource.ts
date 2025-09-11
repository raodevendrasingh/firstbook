import { tool } from "ai";
import { inArray, sql } from "drizzle-orm";
import z from "zod";
import { googleAI } from "@/ai/lib/services";
import { db } from "@/db/drizzle";
import { embedding, type Resource, resource } from "@/db/schema";
import { normalizeVector } from "@/utils/normalize-vector";

export const searchResource = (selectedResources: Resource[]) =>
	tool({
		description:
			"Search the user's selected resources for context information",
		inputSchema: z.object({
			query: z.string().min(1).max(100).describe("The search query"),
		}),
		execute: async ({ query }) => {
			const selectedResourceIds = selectedResources.map((r) => r.id);

			if (selectedResourceIds.length === 0) {
				return [];
			}

			const userQueryEmbedding = await googleAI.models.embedContent({
				model: "gemini-embedding-001",
				contents: [query],
				config: {
					outputDimensionality: 1536,
				},
			});

			const embeddingsArr = userQueryEmbedding.embeddings ?? [];
			if (!embeddingsArr.length) {
				throw new Error("No embeddings returned");
			}

			const userQueryVector = normalizeVector(
				embeddingsArr[0].values ?? [],
			);

			const vectorString = `[${userQueryVector.join(",")}]`;

			const results = await db
				.select({
					id: embedding.id,
					resourceId: embedding.resourceId,
					chunk: embedding.chunk,
					similarity: sql<number>`1 - (${embedding.vector} <=> ${sql.raw(`'${vectorString}'::vector`)})`,
				})
				.from(embedding)
				.where(inArray(embedding.resourceId, selectedResourceIds))
				.orderBy(
					sql`(${embedding.vector} <=> ${sql.raw(`'${vectorString}'::vector`)})`,
				)
				.limit(5);

			const resourceIds = results.map((r) => r.resourceId);

			const resources = await db
				.select({
					id: resource.id,
					title: resource.title,
					url: resource.source,
					text: resource.content,
					publishedDate: resource.createdAt,
				})
				.from(resource)
				.where(inArray(resource.id, resourceIds));

			const merged = results.map((res) => {
				const meta = resources.find((r) => r.id === res.resourceId);
				return {
					title: meta?.title ?? null,
					url: meta?.url ?? null,
					content: res.chunk.slice(0, 1000),
					publishedDate: meta?.publishedDate ?? null,
					similarity: res.similarity,
				};
			});

			return merged;
		},
	});
