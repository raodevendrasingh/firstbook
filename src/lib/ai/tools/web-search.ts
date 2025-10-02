import { tool } from "ai";
import z from "zod";
import { createServices } from "@/lib/ai/services";

export function createWebSearchTool(exaKey?: string) {
	return tool({
		description: `Search the web for strictly real-time or up-to-date information. 
			Always prefer using stored resources first. 
			Only use this tool if the query is explicitly about current events, recent updates, or information that could not exist in the provided resources. 
			Do not use it for general knowledge or off-topic questions — the notebook remains the primary source of truth.`,
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
