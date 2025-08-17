ALTER TABLE "d_corps" ADD COLUMN "ovault_status" varchar(20) DEFAULT 'not_deployed';--> statement-breakpoint
ALTER TABLE "d_corps" ADD COLUMN "ovault_deployed_at" timestamp;--> statement-breakpoint
ALTER TABLE "d_corps" ADD COLUMN "ovault_tx_hashes" jsonb;--> statement-breakpoint
ALTER TABLE "d_corps" ADD COLUMN "ovault_config" jsonb;