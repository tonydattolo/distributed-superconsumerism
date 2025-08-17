ALTER TABLE "d_corps" ADD COLUMN "blockchain_tx_hash" varchar(66);--> statement-breakpoint
ALTER TABLE "d_corps" ADD COLUMN "ovault_addresses" jsonb;