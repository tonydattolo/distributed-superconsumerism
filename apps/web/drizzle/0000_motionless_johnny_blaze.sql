CREATE TYPE "public"."d_corp_member_role" AS ENUM('founder', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."distribution_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "d_corp_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"d_corp_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "d_corp_member_role" DEFAULT 'member',
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "d_corps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"description" text,
	"capital_percentage" integer NOT NULL,
	"labor_percentage" integer NOT NULL,
	"consumer_percentage" integer NOT NULL,
	"treasury_balance" numeric(18, 2) DEFAULT '0',
	"total_distributed" numeric(18, 2) DEFAULT '0',
	"attestations" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"founder_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"d_corp_id" uuid NOT NULL,
	"total_amount" numeric(18, 2) NOT NULL,
	"capital_amount" numeric(18, 2) NOT NULL,
	"labor_amount" numeric(18, 2) NOT NULL,
	"consumer_amount" numeric(18, 2) NOT NULL,
	"quarter" varchar(10) NOT NULL,
	"status" "distribution_status" DEFAULT 'pending',
	"notes" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "d_corp_members" ADD CONSTRAINT "d_corp_members_d_corp_id_d_corps_id_fk" FOREIGN KEY ("d_corp_id") REFERENCES "public"."d_corps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_d_corp_id_d_corps_id_fk" FOREIGN KEY ("d_corp_id") REFERENCES "public"."d_corps"("id") ON DELETE no action ON UPDATE no action;