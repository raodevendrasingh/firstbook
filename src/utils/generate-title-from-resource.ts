import { generateText } from "ai";
import { createServices } from "@/lib/ai/services";

type resourceType = {
	title?: string;
	content: string;
};

export async function generateTitleFromResource({
	resource,
	googleKey,
}: {
	resource: resourceType;
	googleKey?: string;
}) {
	try {
		const { google } = createServices({
			googleKey: googleKey,
		});

		const { text: title } = await generateText({
			model: google("gemini-2.0-flash-lite"),
			system: `\n
				- you will generate a short title based on the first message a user begins a conversation with
				- ensure it is not more than 60 characters long
				- the title should be a summary of the user's message
				- do not use quotes or colons`,
			prompt: JSON.stringify(resource),
		});

		return title;
	} catch (error) {
		throw error;
	}
}
