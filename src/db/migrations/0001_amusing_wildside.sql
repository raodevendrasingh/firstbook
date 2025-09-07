CREATE TABLE "chat" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource" (
	"id" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"type" varchar DEFAULT 'text' NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "resource_id_createdAt_pk" PRIMARY KEY("id","createdAt")
);
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_chatId_chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "resource_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;