import { tool } from "ai";
import z from "zod";
import { exa } from "@/ai/lib/services";

export const webSearch = tool({
	description: `Search the web for up-to-date information, use this tool only if the user asks about real-time events 
	or very recent data that may not exist in stored resources.`,
	inputSchema: z.object({
		query: z.string().min(1).max(100).describe("The search query"),
	}),
	execute: async ({ query }) => {
		const { results } = await exa.searchAndContents(query, {
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
