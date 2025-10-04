import { MODELS } from "@/utils/resolve-models";
import type { Keys } from "../types/data-types";
import { env } from "./env";

export async function getRequiredApiKeys(
	_userId: string,
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
		if (!env.OPENAI_API_KEY) {
			throw new Error(
				"OpenAI API key is required for this model. Please configure OPENAI_API_KEY in your environment variables.",
			);
		}
		keys.openaiKey = env.OPENAI_API_KEY;
	} else if (isAnthropic) {
		if (!env.ANTHROPIC_API_KEY) {
			throw new Error(
				"Anthropic API key is required for this model. Please configure ANTHROPIC_API_KEY in your environment variables.",
			);
		}
		keys.anthropicKey = env.ANTHROPIC_API_KEY;
	} else if (isGoogle) {
		if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
			throw new Error(
				"Google API key is required for this model. Please configure GOOGLE_GENERATIVE_AI_API_KEY in your environment variables.",
			);
		}
		keys.googleKey = env.GOOGLE_GENERATIVE_AI_API_KEY;
	}

	if (webSearchEnabled) {
		if (!env.EXASEARCH_API_KEY) {
			throw new Error(
				"Exa API key is required for web search. Please configure EXASEARCH_API_KEY in your environment variables.",
			);
		}
		keys.exaKey = env.EXASEARCH_API_KEY;
	}

	return keys;
}
