import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	integer,
	json,
	pgTable,
	text,
	timestamp,
	vector,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const chat = pgTable(
	"chat",
	{
		id: text("id").primaryKey().notNull(),
		createdAt: timestamp("createdAt").notNull(),
		title: text("title").notNull(),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
	},
	(table) => [index("chat_user_id_idx").on(table.userId)],
);

export const message = pgTable(
	"message",
	{
		id: text("id").primaryKey().notNull(),
		chatId: text("chatId")
			.notNull()
			.references(() => chat.id),
		role: text("role").notNull(),
		parts: json("parts").notNull(),
		attachments: json("attachments").notNull(),
		createdAt: timestamp("createdAt").notNull(),
	},
	(table) => [index("message_chat_id_idx").on(table.chatId)],
);

export const resource = pgTable(
	"resource",
	{
		id: text("id").primaryKey().notNull(),
		title: text("title").notNull(),
		content: text("content"),
		type: text("type", { enum: ["text", "files", "links"] })
			.notNull()
			.default("text"),
		source: text("source"),
		vectorId: text("vectorId"),
		status: text("status", {
			enum: ["fetched", "embedded", "failed"],
		}).default("fetched"),
		chatId: text("chatId")
			.notNull()
			.references(() => chat.id),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		createdAt: timestamp("createdAt").notNull(),
		metadata: json("metadata"),
	},
	(table) => [
		index("resource_chat_id_idx").on(table.chatId),
		index("resource_user_id_idx").on(table.userId),
	],
);

export const embedding = pgTable(
	"embedding",
	{
		id: text("id").primaryKey().notNull(),
		resourceId: text("resourceId")
			.notNull()
			.references(() => resource.id, { onDelete: "cascade" }),
		chatId: text("chatId")
			.notNull()
			.references(() => chat.id),
		chunk: text("chunk").notNull(),
		vector: vector("vector", { dimensions: 1536 }).notNull(),
		position: integer("position").notNull(),
		model: text("model").notNull(),
		createdAt: timestamp("createdAt").notNull(),
	},
	(table) => [
		index("embedding_resource_id_idx").on(table.resourceId),
		index("embedding_chat_id_idx").on(table.chatId),
	],
);

export type Chat = InferSelectModel<typeof chat>;
export type Message = InferSelectModel<typeof message>;
export type Resource = InferSelectModel<typeof resource>;
export type Embedding = InferSelectModel<typeof embedding>;
