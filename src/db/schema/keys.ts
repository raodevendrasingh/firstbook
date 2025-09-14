import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export const providerEnum = pgEnum("provider", [
	"exa",
	"openai",
	"gemini",
	"anthropic",
]);

export const keys = pgTable("keys", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	provider: providerEnum("provider").notNull(),
	keyCiphertext: text("key_ciphertext").notNull(),
	keyIv: text("key_iv").notNull(),
	keyTag: text("key_tag"),
	algo: text("algo").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
