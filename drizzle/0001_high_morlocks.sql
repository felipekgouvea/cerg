CREATE TABLE "alunos_25" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"birth_date" date,
	"guardian_name" text,
	"guardian_phone" text,
	"turma_id" integer NOT NULL,
	"student_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pre_reenrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"current_year" integer NOT NULL,
	"current_grade" "grade_enum" NOT NULL,
	"next_year" integer NOT NULL,
	"next_grade" "grade_enum" NOT NULL,
	"service_key" "service_enum" NOT NULL,
	"payment_option" "payment_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pre_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"student_name" text NOT NULL,
	"birth_date" date NOT NULL,
	"guardian_name" text NOT NULL,
	"guardian_phone" text NOT NULL,
	"target_year" integer NOT NULL,
	"target_grade" "grade_enum" NOT NULL,
	"service_key" "service_enum" NOT NULL,
	"payment_option" "payment_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"year" integer NOT NULL,
	"payment_option" "payment_enum" NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_turmas" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"year" integer NOT NULL,
	"grade" "grade_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" "service_enum" NOT NULL,
	"name" text NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "turmas" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"grade" "grade_enum" NOT NULL,
	"label" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pre_enrollments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pre_registration" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "pre_enrollments" CASCADE;--> statement-breakpoint
DROP TABLE "pre_registration" CASCADE;--> statement-breakpoint
DROP INDEX "student_enrollments_year_idx";--> statement-breakpoint
DROP INDEX "student_enrollments_grade_idx";--> statement-breakpoint
DROP INDEX "student_enrollments_year_grade_idx";--> statement-breakpoint
DROP INDEX "students_guardian_name_idx";--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD COLUMN "turma_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "alunos_25" ADD CONSTRAINT "alunos_25_turma_id_turmas_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turmas"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "alunos_25" ADD CONSTRAINT "alunos_25_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_reenrollments" ADD CONSTRAINT "pre_reenrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pre_registrations" ADD CONSTRAINT "pre_registrations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_turmas" ADD CONSTRAINT "service_turmas_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "alunos25_turma_idx" ON "alunos_25" USING btree ("turma_id");--> statement-breakpoint
CREATE INDEX "alunos25_name_turma_idx" ON "alunos_25" USING btree ("student_name","turma_id");--> statement-breakpoint
CREATE INDEX "pre_reenrollments_student_year_idx" ON "pre_reenrollments" USING btree ("student_id","current_year");--> statement-breakpoint
CREATE INDEX "pre_registrations_year_idx" ON "pre_registrations" USING btree ("target_year");--> statement-breakpoint
CREATE INDEX "pre_registrations_target_idx" ON "pre_registrations" USING btree ("target_year","target_grade");--> statement-breakpoint
CREATE UNIQUE INDEX "service_prices_service_year_payment_uq" ON "service_prices" USING btree ("service_id","year","payment_option");--> statement-breakpoint
CREATE INDEX "service_prices_year_idx" ON "service_prices" USING btree ("year");--> statement-breakpoint
CREATE UNIQUE INDEX "service_turmas_service_year_grade_uq" ON "service_turmas" USING btree ("service_id","year","grade");--> statement-breakpoint
CREATE INDEX "service_turmas_year_idx" ON "service_turmas" USING btree ("year");--> statement-breakpoint
CREATE INDEX "service_turmas_grade_idx" ON "service_turmas" USING btree ("grade");--> statement-breakpoint
CREATE UNIQUE INDEX "services_key_uq" ON "services" USING btree ("key");--> statement-breakpoint
CREATE INDEX "services_active_idx" ON "services" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "turmas_year_grade_uq" ON "turmas" USING btree ("year","grade");--> statement-breakpoint
CREATE INDEX "turmas_year_idx" ON "turmas" USING btree ("year");--> statement-breakpoint
CREATE INDEX "turmas_grade_idx" ON "turmas" USING btree ("grade");--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_turma_id_turmas_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turmas"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "student_enrollments_turma_idx" ON "student_enrollments" USING btree ("turma_id");--> statement-breakpoint
CREATE INDEX "students_guardian_idx" ON "students" USING btree ("guardian_name");--> statement-breakpoint
ALTER TABLE "student_enrollments" DROP COLUMN "grade";