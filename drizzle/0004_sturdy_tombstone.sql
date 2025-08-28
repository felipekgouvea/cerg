CREATE TABLE "service_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"year" integer NOT NULL,
	"grade" "grade_enum" NOT NULL,
	"list_price_cents" integer NOT NULL,
	"punctual_price_cents" integer NOT NULL,
	"reenroll_price_cents" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "values" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "values" CASCADE;--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_value_id_values_id_fk";
--> statement-breakpoint
ALTER TABLE "pre_reenrollments" DROP CONSTRAINT "pre_reenrollments_value_id_values_id_fk";
--> statement-breakpoint
ALTER TABLE "pre_registrations" DROP CONSTRAINT "pre_registrations_value_id_values_id_fk";
--> statement-breakpoint
ALTER TABLE "service_values" ADD CONSTRAINT "service_values_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "service_values_service_year_grade_uq" ON "service_values" USING btree ("service_id","year","grade");--> statement-breakpoint
CREATE INDEX "service_values_year_idx" ON "service_values" USING btree ("year");--> statement-breakpoint
CREATE INDEX "service_values_service_idx" ON "service_values" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "service_values_grade_idx" ON "service_values" USING btree ("grade");--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_value_id_service_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."service_values"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD CONSTRAINT "pre_reenrollments_value_id_service_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."service_values"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD CONSTRAINT "pre_registrations_value_id_service_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."service_values"("id") ON DELETE set null ON UPDATE cascade;