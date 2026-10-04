ALTER TYPE "public"."payment_status" ADD VALUE 'authorized' BEFORE 'paid';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'canceled' BEFORE 'refunded';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'expired' BEFORE 'refunded';--> statement-breakpoint
ALTER TABLE "restaurant_settings" ALTER COLUMN "prep_minutes" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "restaurant_settings" ALTER COLUMN "prep_minutes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refused_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "method" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "capture_mode" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "checkout_url" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "capture_requested_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "captured_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurant_settings" ADD COLUMN "rush_prep_minutes" integer;