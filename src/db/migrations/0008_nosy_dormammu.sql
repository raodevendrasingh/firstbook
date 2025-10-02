CREATE INDEX "chat_user_id_idx" ON "chat" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "embedding_resource_id_idx" ON "embedding" USING btree ("resourceId");--> statement-breakpoint
CREATE INDEX "embedding_chat_id_idx" ON "embedding" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "message_chat_id_idx" ON "message" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "resource_chat_id_idx" ON "resource" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "resource_user_id_idx" ON "resource" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "keys_user_id_idx" ON "keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");