import { generateText } from "ai";
import summaryPrompt from "@/lib/ai/prompt/summary.md";
import { createServices } from "@/lib/ai/services";

export async function generateUnifiedSummary({
	resourceSummaries,
	chatTitle,
	googleKey,
}: {
	resourceSummaries: string[];
	chatTitle: string;
	googleKey?: string;
}): Promise<string> {
	try {
		if (resourceSummaries.length === 0) {
			return "";
		}

		const { google } = createServices({
			googleKey: googleKey,
		});

		const summariesText = resourceSummaries
			.filter((summary) => summary.trim().length > 0)
			.join("\n\n");

		if (!summariesText.trim()) {
			return "";
		}

		const summariesArray = resourceSummaries.filter(
			(summary) => summary.trim().length > 0,
		);

		const promptTemplate = summaryPrompt;

		const prompt = promptTemplate
			.replace("{{RESOURCE_COUNT}}", summariesArray.length.toString())
			.replace("{{CHAT_TITLE}}", chatTitle)
			.replace(
				"{{RESOURCE_SUMMARIES}}",
				summariesArray
					.map(
						(summary, index) => `Resource ${index + 1}: ${summary}`,
					)
					.join("\n\n"),
			)
			.replace(
				"{{ADDITIONAL_RESOURCES}}",
				summariesArray.length > 3
					? "Resource 4: [short summary of fourth resource]\n(continue for all resources)"
					: "",
			);

		const { text: unifiedSummary } = await generateText({
			model: google("gemini-2.0-flash-lite"),
			system: "You are an expert at summarizing individual resources. Focus on creating clear, concise summaries that capture the key information from each specific resource while maintaining their distinct nature and individual characteristics.",
			prompt,
		});

		return unifiedSummary;
	} catch (_error) {
		return "";
	}
}
