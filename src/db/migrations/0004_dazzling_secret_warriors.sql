ALTER TABLE "embedding" ADD COLUMN "chatId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "embedding" ADD COLUMN "chunk" text NOT NULL;--> statement-breakpoint
ALTER TABLE "embedding" ADD COLUMN "position" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_chatId_chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chat"("id") ON DELETE no action ON UPDATE no action;