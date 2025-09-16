import { z } from "zod";

export const providerEnum = z
	.enum(["exa", "openai", "gemini", "anthropic"])
	.refine((val) => ["exa", "openai", "gemini", "anthropic"].includes(val), {
		message: "Please select a valid provider",
	});

export const keySchema = z
	.string()
	.min(1, { message: "API key is required" })
	.max(200, { message: "API key must be less than 200 characters" })
	.regex(/^[a-zA-Z0-9\-_]+$/, {
		message: "API key contains invalid characters",
	});

export const apiKeySchema = z.object({
	provider: providerEnum,
	apiKey: keySchema,
});

export const updateApiKeySchema = z.object({
	keyId: z.string().min(1, { message: "Key ID is required" }),
	apiKey: keySchema,
});

export const providerLabels: Record<Provider, string> = {
	openai: "OpenAI",
	anthropic: "Anthropic",
	gemini: "Google Gemini",
	exa: "Exa Search",
};

export type ApiKeyData = z.infer<typeof apiKeySchema>;
export type UpdateApiKeyData = z.infer<typeof updateApiKeySchema>;
export type Provider = z.infer<typeof providerEnum>;
