import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),

	NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),

	R2_S3_API_ENDPOINT: z.url().optional(),
	R2_ACCESS_KEY_ID: z.string().optional(),
	R2_SECRET_ACCESS_KEY: z.string().optional(),
	R2_PUBLIC_ACCESS_URL: z.url().optional(),
	R2_PUBLIC_BUCKET: z.string().default("firstbook"),

	OPENAI_API_KEY: z.string().optional(),
	ANTHROPIC_API_KEY: z.string().optional(),
	GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
	EXASEARCH_API_KEY: z.string().optional(),

	API_KEY_ENCRYPTION_SECRET: z.string().min(1),

	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
});

function createEnv() {
	if (typeof window !== "undefined") {
		return {
			NEXT_PUBLIC_APP_URL: "http://localhost:3000",
			NODE_ENV: "development" as const,
		} as z.infer<typeof envSchema>;
	}

	return envSchema.parse(process.env);
}

export const env = createEnv();
