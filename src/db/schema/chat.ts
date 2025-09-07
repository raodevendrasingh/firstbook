import type { InferSelectModel } from "drizzle-orm";
import {
	json,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const chat = pgTable("chat", {
	id: text("id").primaryKey().notNull(),
	createdAt: timestamp("createdAt").notNull(),
	title: text("title").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
});

export const message = pgTable("message", {
	id: text("id").primaryKey().notNull(),
	chatId: text("chatId")
		.notNull()
		.references(() => chat.id),
	role: varchar("role").notNull(),
	parts: json("parts").notNull(),
	attachments: json("attachments").notNull(),
	createdAt: timestamp("createdAt").notNull(),
});

export const resource = pgTable(
	"resource",
	{
		id: text("id").notNull(),
		createdAt: timestamp("createdAt").notNull(),
		title: text("title").notNull(),
		content: text("content"),
		type: varchar("type", { enum: ["text", "code", "image", "sheet"] })
			.notNull()
			.default("text"),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => [primaryKey({ columns: [table.id, table.createdAt] })],
);

export type Chat = InferSelectModel<typeof chat>;
export type Message = InferSelectModel<typeof message>;
export type Resource = InferSelectModel<typeof resource>;
