ALTER TABLE "d_corp_members" RENAME COLUMN "user_id" TO "wallet_address";--> statement-breakpoint
ALTER TABLE "d_corps" RENAME COLUMN "founder_id" TO "founder_wallet_address";--> statement-breakpoint
ALTER TABLE "d_corps" ADD COLUMN "blockchain_tx_hash" varchar(66);--> statement-breakpoint
ALTER TABLE "d_corps" ADD COLUMN "contract_address" varchar(42);--> statement-breakpoint
ALTER TABLE "d_corps" ADD COLUMN "vault_address" varchar(42);