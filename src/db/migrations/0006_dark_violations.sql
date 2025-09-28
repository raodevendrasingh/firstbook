ALTER TABLE "embedding" ALTER COLUMN "model" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "type" SET DEFAULT 'text';--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "status" SET DEFAULT 'fetched';