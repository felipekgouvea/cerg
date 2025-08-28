CREATE TYPE "public"."enrollment_status_enum" AS ENUM('pending', 'active', 'cancelled', 'transferred');--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"year" integer NOT NULL,
	"grade" "grade_enum" NOT NULL,
	"service_id" integer,
	"service_value_map_id" integer,
	"status" "enrollment_status_enum" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_value_map" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"value_id" integer NOT NULL,
	"year" integer NOT NULL,
	"amount_cents" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "values" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"payment_option" "payment_enum" NOT NULL,
	"base_amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alunos_25" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_prices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_turmas" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_enrollments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "turmas" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "alunos_25" CASCADE;--> statement-breakpoint
DROP TABLE "service_prices" CASCADE;--> statement-breakpoint
DROP TABLE "service_turmas" CASCADE;--> statement-breakpoint
DROP TABLE "student_enrollments" CASCADE;--> statement-breakpoint
DROP TABLE "turmas" CASCADE;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ALTER COLUMN "payment_option" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pre_registrations" ALTER COLUMN "payment_option" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD COLUMN "service_id" integer;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD COLUMN "service_value_map_id" integer;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD COLUMN "service_id" integer;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD COLUMN "service_value_map_id" integer;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_service_value_map_id_service_value_map_id_fk" FOREIGN KEY ("service_value_map_id") REFERENCES "public"."service_value_map"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_value_map" ADD CONSTRAINT "service_value_map_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_value_map" ADD CONSTRAINT "service_value_map_value_id_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."values"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_student_year_uq" ON "enrollments" USING btree ("student_id","year");--> statement-breakpoint
CREATE INDEX "enrollments_year_idx" ON "enrollments" USING btree ("year");--> statement-breakpoint
CREATE INDEX "enrollments_service_idx" ON "enrollments" USING btree ("service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_value_year_uq" ON "service_value_map" USING btree ("service_id","value_id","year");--> statement-breakpoint
CREATE INDEX "svm_service_year_idx" ON "service_value_map" USING btree ("service_id","year");--> statement-breakpoint
CREATE INDEX "svm_value_year_idx" ON "service_value_map" USING btree ("value_id","year");--> statement-breakpoint
CREATE UNIQUE INDEX "values_code_uq" ON "values" USING btree ("code");--> statement-breakpoint
CREATE INDEX "values_payment_idx" ON "values" USING btree ("payment_option");--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD CONSTRAINT "pre_reenrollments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD CONSTRAINT "pre_reenrollments_service_value_map_id_service_value_map_id_fk" FOREIGN KEY ("service_value_map_id") REFERENCES "public"."service_value_map"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD CONSTRAINT "pre_registrations_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD CONSTRAINT "pre_registrations_service_value_map_id_service_value_map_id_fk" FOREIGN KEY ("service_value_map_id") REFERENCES "public"."service_value_map"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "pre_reenrollments_next_idx" ON "pre_reenrollments" USING btree ("next_year","next_grade");--> statement-breakpoint
ALTER TABLE "pre_reenrollments" DROP COLUMN "service_key";--> statement-breakpoint
ALTER TABLE "pre_registrations" DROP COLUMN "service_key";