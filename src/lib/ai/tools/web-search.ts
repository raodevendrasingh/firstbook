import { tool } from "ai";
import z from "zod";
import { createServices } from "@/lib/ai/services";

export function createWebSearchTool(exaKey?: string) {
	return tool({
		description: `Search the web for up-to-date information, use this tool only if the user asks about real-time events 
		or very recent data that may not exist in stored resources.`,
		inputSchema: z.object({
			query: z.string().min(1).max(100).describe("The search query"),
		}),
		execute: async ({ query }) => {
			const services = createServices({ exaKey });

			if (!services.exa) {
				throw new Error("Exa API key is required for web search");
			}

			const { results } = await services.exa.searchAndContents(query, {
				livecrawl: "always",
				numResults: 3,
				text: true,
				highlights: true,
			});
			return results.map((result) => ({
				title: result.title,
				url: result.url,
				content: result.text.slice(0, 1000),
				publishedDate: result.publishedDate,
			}));
		},
	});
}

export const webSearch = createWebSearchTool();
