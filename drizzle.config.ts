import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/lib/env";

config({ path: ".env.local", quiet: true, override: true });

export default defineConfig({
	out: "./src/db/migrations",
	schema: "./src/db/schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
