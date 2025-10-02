import { generateText } from "ai";
import { createServices } from "@/lib/ai/services";

export async function generateSummaryFromContent({
	content,
	googleKey,
}: {
	content: string;
	googleKey?: string;
}): Promise<string> {
	try {
		const { google } = createServices({
			googleKey: googleKey,
		});

		const { text: summary } = await generateText({
			model: google("gemini-2.0-flash-lite"),
			system: "Generate a concise summary of the provided content. The summary should be 2-3 sentences long and capture the main points.",
			prompt: content,
		});

		return summary;
	} catch (_error) {
		return "";
	}
}
