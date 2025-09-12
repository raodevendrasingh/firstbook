import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export const MODELS = {
	OPENAI: [
		"GPT-5",
		"GPT-5 Mini",
		"GPT-5 Nano",
		"GPT-4.1",
		"O3 Deep Research",
		"O4 Mini Deep Research",
	] as const,
	ANTHROPIC: [
		"Claude Opus 4.1",
		"Claude Opus 4",
		"Claude Sonnet 4",
		"Claude Sonnet 3.7",
	] as const,
	GOOGLE: [
		"Gemini 2.5 Pro",
		"Gemini 2.5 Flash",
		"Gemini 2.5 Flash-Lite",
		"Gemini 2.0 Flash",
		"Gemini 2.0 Flash-Lite",
	] as const,
} as const;

export const ALL_MODELS = Object.values(MODELS).flat();

export function resolveModel(selected?: string) {
	const name = (selected ?? "").trim();

	const modelMap: Record<string, () => LanguageModel> = {
		// OpenAI models (Latest 2025)
		"GPT-5": () => openai("gpt-5-2025-08-07"),
		"GPT-5 Mini": () => openai("gpt-5-mini-2025-08-07"),
		"GPT-5 Nano": () => openai("gpt-5-nano-2025-08-07"),
		"GPT-4.1": () => openai("gpt-4.1-2025-04-14"),
		"O3 Deep Research": () => openai("o3-deep-research-2025-06-26"),
		"O4 Mini Deep Research": () =>
			openai("o4-mini-deep-research-2025-06-26"),

		// Anthropic models (Latest 2025)
		"Claude Opus 4.1": () => anthropic("claude-opus-4-1"),
		"Claude Opus 4": () => anthropic("claude-opus-4-0"),
		"Claude Sonnet 4": () => anthropic("claude-sonnet-4-0"),
		"Claude Sonnet 3.7": () => anthropic("claude-3-7-sonnet-latest"),

		// Google models (Latest 2025)
		"Gemini 2.5 Pro": () => google("gemini-2.5-pro"),
		"Gemini 2.5 Flash": () => google("gemini-2.5-flash"),
		"Gemini 2.5 Flash-Lite": () => google("gemini-2.5-flash-lite"),
		"Gemini 2.0 Flash": () => google("gemini-2.0-flash"),
		"Gemini 2.0 Flash-Lite": () => google("gemini-2.0-flash-lite"),
	};

	return modelMap[name]?.() || openai("gpt-5-mini-2025-08-07");
}
