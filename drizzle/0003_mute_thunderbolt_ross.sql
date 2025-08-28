CREATE TYPE "public"."price_tier_enum" AS ENUM('table', 'punctual', 'reenrollment');--> statement-breakpoint
ALTER TABLE "service_value_map" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "service_value_map" CASCADE;--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_service_value_map_id_service_value_map_id_fk";
--> statement-breakpoint
ALTER TABLE "pre_reenrollments" DROP CONSTRAINT "pre_reenrollments_service_value_map_id_service_value_map_id_fk";
--> statement-breakpoint
ALTER TABLE "pre_registrations" DROP CONSTRAINT "pre_registrations_service_value_map_id_service_value_map_id_fk";
--> statement-breakpoint
DROP INDEX "pre_reenrollments_student_year_idx";--> statement-breakpoint
DROP INDEX "pre_reenrollments_next_idx";--> statement-breakpoint
DROP INDEX "pre_registrations_year_idx";--> statement-breakpoint
DROP INDEX "pre_registrations_target_idx";--> statement-breakpoint
DROP INDEX "values_code_uq";--> statement-breakpoint
DROP INDEX "values_payment_idx";--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "value_id" integer;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "price_tier" "price_tier_enum";--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "applied_price_cents" integer;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD COLUMN "value_id" integer;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD COLUMN "price_tier" "price_tier_enum";--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD COLUMN "applied_price_cents" integer;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD COLUMN "value_id" integer;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD COLUMN "price_tier" "price_tier_enum";--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD COLUMN "applied_price_cents" integer;--> statement-breakpoint
ALTER TABLE "values" ADD COLUMN "service_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "values" ADD COLUMN "year" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "values" ADD COLUMN "grade" "grade_enum" NOT NULL;--> statement-breakpoint
ALTER TABLE "values" ADD COLUMN "list_price_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "values" ADD COLUMN "punctual_price_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "values" ADD COLUMN "reenroll_price_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_value_id_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."values"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD CONSTRAINT "pre_reenrollments_value_id_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."values"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD CONSTRAINT "pre_registrations_value_id_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."values"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "values" ADD CONSTRAINT "values_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "pre_reenroll_student_year_idx" ON "pre_reenrollments" USING btree ("student_id","current_year");--> statement-breakpoint
CREATE INDEX "pre_reenroll_next_idx" ON "pre_reenrollments" USING btree ("next_year","next_grade");--> statement-breakpoint
CREATE INDEX "pre_regs_year_idx" ON "pre_registrations" USING btree ("target_year");--> statement-breakpoint
CREATE INDEX "pre_regs_target_idx" ON "pre_registrations" USING btree ("target_year","target_grade");--> statement-breakpoint
CREATE UNIQUE INDEX "values_service_year_grade_uq" ON "values" USING btree ("service_id","year","grade");--> statement-breakpoint
CREATE INDEX "values_year_idx" ON "values" USING btree ("year");--> statement-breakpoint
CREATE INDEX "values_service_idx" ON "values" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "values_grade_idx" ON "values" USING btree ("grade");--> statement-breakpoint
ALTER TABLE "enrollments" DROP COLUMN "service_value_map_id";--> statement-breakpoint
ALTER TABLE "pre_reenrollments" DROP COLUMN "service_value_map_id";--> statement-breakpoint
ALTER TABLE "pre_registrations" DROP COLUMN "service_value_map_id";--> statement-breakpoint
ALTER TABLE "values" DROP COLUMN "code";--> statement-breakpoint
ALTER TABLE "values" DROP COLUMN "label";--> statement-breakpoint
ALTER TABLE "values" DROP COLUMN "payment_option";--> statement-breakpoint
ALTER TABLE "values" DROP COLUMN "base_amount_cents";--> statement-breakpoint
ALTER TABLE "values" DROP COLUMN "currency";