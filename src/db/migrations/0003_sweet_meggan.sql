CREATE TABLE "embedding" (
	"id" text PRIMARY KEY NOT NULL,
	"resourceId" text NOT NULL,
	"vector" vector(1536) NOT NULL,
	"model" varchar NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resource" DROP CONSTRAINT "resource_id_createdAt_pk";--> statement-breakpoint
ALTER TABLE "resource" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "vectorId" text;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "status" varchar DEFAULT 'fetched';--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "chatId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "metadata" json;--> statement-breakpoint
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_resourceId_resource_id_fk" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "resource_chatId_chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chat"("id") ON DELETE no action ON UPDATE no action;