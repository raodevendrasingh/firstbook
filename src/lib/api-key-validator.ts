import { MODELS } from "@/utils/resolve-models";
import type { Keys } from "../types/data-types";
import { getApiKey, hasApiKey } from "./api-keys";

export async function getRequiredApiKeys(
	userId: string,
	selectedModel: string,
	webSearchEnabled: boolean,
): Promise<Keys> {
	const keys: Keys = {};

	const isOpenAI = MODELS.OPENAI.includes(
		selectedModel as (typeof MODELS.OPENAI)[number],
	);
	const isAnthropic = MODELS.ANTHROPIC.includes(
		selectedModel as (typeof MODELS.ANTHROPIC)[number],
	);
	const isGoogle = MODELS.GOOGLE.includes(
		selectedModel as (typeof MODELS.GOOGLE)[number],
	);

	if (isOpenAI) {
		const hasOpenAIKey = await hasApiKey(userId, "openai");
		if (!hasOpenAIKey) {
			throw new Error(
				"OpenAI API key is required for this model. Please add your OpenAI API key in settings.",
			);
		}
		keys.openaiKey = (await getApiKey(userId, "openai")) || undefined;
	} else if (isAnthropic) {
		const hasAnthropicKey = await hasApiKey(userId, "anthropic");
		if (!hasAnthropicKey) {
			throw new Error(
				"Anthropic API key is required for this model. Please add your Anthropic API key in settings.",
			);
		}
		keys.anthropicKey = (await getApiKey(userId, "anthropic")) || undefined;
	} else if (isGoogle) {
		const hasGoogleKey = await hasApiKey(userId, "gemini");
		if (!hasGoogleKey) {
			throw new Error(
				"Google API key is required for this model. Please add your Google API key in settings.",
			);
		}
		keys.googleKey = (await getApiKey(userId, "gemini")) || undefined;
	}

	if (webSearchEnabled) {
		const hasExaKey = await hasApiKey(userId, "exa");
		if (!hasExaKey) {
			throw new Error(
				"Exa API key is required for web search. Please add your Exa API key in settings.",
			);
		}
		keys.exaKey = (await getApiKey(userId, "exa")) || undefined;
	}

	return keys;
}
