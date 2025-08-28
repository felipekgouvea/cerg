CREATE TYPE "public"."pre_status_enum" AS ENUM('realizada', 'em_conversas', 'finalizado', 'cancelado');--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD COLUMN "status" "pre_status_enum" DEFAULT 'realizada' NOT NULL;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD COLUMN "status" "pre_status_enum" DEFAULT 'realizada' NOT NULL;--> statement-breakpoint
CREATE INDEX "pre_reenroll_status_idx" ON "pre_reenrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pre_regs_status_idx" ON "pre_registrations" USING btree ("status");