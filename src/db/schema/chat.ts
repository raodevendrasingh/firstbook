import type { InferSelectModel } from "drizzle-orm";
import {
	integer,
	json,
	pgTable,
	text,
	timestamp,
	varchar,
	vector,
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

export const resource = pgTable("resource", {
	id: text("id").primaryKey().notNull(),
	title: text("title").notNull(),
	content: text("content"),
	type: varchar("type", { enum: ["text", "code", "image", "sheet"] })
		.notNull()
		.default("text"),
	source: text("source"),
	vectorId: text("vectorId"),
	status: varchar("status", {
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
});

export const embedding = pgTable("embedding", {
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
	model: varchar("model").notNull(),
	createdAt: timestamp("createdAt").notNull(),
});

export type Chat = InferSelectModel<typeof chat>;
export type Message = InferSelectModel<typeof message>;
export type Resource = InferSelectModel<typeof resource>;
export type Embedding = InferSelectModel<typeof embedding>;
