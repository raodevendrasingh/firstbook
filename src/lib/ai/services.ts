import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { GoogleGenAI } from "@google/genai";
import Exa from "exa-js";
import { env } from "@/lib/env";
import type { Keys } from "@/types/data-types";

export function createServices(apiKeys?: Keys) {
	const openaiKey = apiKeys?.openaiKey || env.OPENAI_API_KEY;
	const anthropicKey = apiKeys?.anthropicKey || env.ANTHROPIC_API_KEY;
	const googleKey = apiKeys?.googleKey || env.GOOGLE_GENERATIVE_AI_API_KEY;
	const exaKey = apiKeys?.exaKey || env.EXASEARCH_API_KEY;

	return {
		openai: createOpenAI({ apiKey: openaiKey }),
		anthropic: createAnthropic({ apiKey: anthropicKey }),
		google: createGoogleGenerativeAI({ apiKey: googleKey }),

		googleAI: new GoogleGenAI({ apiKey: googleKey! }),
		exa: exaKey ? new Exa(exaKey) : null,
	};
}
