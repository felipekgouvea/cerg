CREATE TYPE "public"."grade_enum" AS ENUM('MATERNAL_3', 'PRE_I_4', 'PRE_II_5', 'ANO_1', 'ANO_2', 'ANO_3', 'ANO_4', 'ANO_5');--> statement-breakpoint
CREATE TYPE "public"."payment_enum" AS ENUM('one_sep', 'two_sep_oct');--> statement-breakpoint
CREATE TYPE "public"."service_enum" AS ENUM('integral', 'meio_periodo', 'infantil_vespertino', 'fundamental_vespertino');--> statement-breakpoint
CREATE TABLE "pre_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"birth_date" date NOT NULL,
	"guardian_name" text NOT NULL,
	"guardian_phone" text NOT NULL,
	"service" "service_enum" NOT NULL,
	"grade" "grade_enum" NOT NULL,
	"payment_option" "payment_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pre_registration" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"birth_date" date NOT NULL,
	"guardian_name" text NOT NULL,
	"guardian_phone" text NOT NULL,
	"service" "service_enum" NOT NULL,
	"grade" "grade_enum" NOT NULL,
	"payment_option" "payment_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"year" integer NOT NULL,
	"grade" "grade_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"birth_date" date NOT NULL,
	"guardian_name" text NOT NULL,
	"guardian_phone" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "student_enrollments_student_year_uq" ON "student_enrollments" USING btree ("student_id","year");--> statement-breakpoint
CREATE INDEX "student_enrollments_year_idx" ON "student_enrollments" USING btree ("year");--> statement-breakpoint
CREATE INDEX "student_enrollments_grade_idx" ON "student_enrollments" USING btree ("grade");--> statement-breakpoint
CREATE INDEX "student_enrollments_year_grade_idx" ON "student_enrollments" USING btree ("year","grade");--> statement-breakpoint
CREATE INDEX "students_name_idx" ON "students" USING btree ("name");--> statement-breakpoint
CREATE INDEX "students_guardian_name_idx" ON "students" USING btree ("guardian_name");