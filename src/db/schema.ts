import {
  pgTable,
  serial,
  text,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const serviceEnum = pgEnum("service_enum", [
  "integral",
  "meio_periodo",
  "infantil_vespertino",
  "fundamental_vespertino",
]);

export const gradeEnum = pgEnum("grade_enum", [
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
]);

export const paymentEnum = pgEnum("payment_enum", ["one_sep", "two_sep_oct"]);

export const preEnrollments = pgTable("pre_enrollments", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  birthDate: date("birth_date", { mode: "date" }).notNull(),
  guardianName: text("guardian_name").notNull(),
  guardianPhone: text("guardian_phone").notNull(),
  service: serviceEnum("service").notNull(),
  grade: gradeEnum("grade").notNull(),
  paymentOption: paymentEnum("payment_option").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const preRegistration = pgTable("pre_registration", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  birthDate: date("birth_date", { mode: "date" }).notNull(),
  guardianName: text("guardian_name").notNull(),
  guardianPhone: text("guardian_phone").notNull(),
  service: serviceEnum("service").notNull(),
  grade: gradeEnum("grade").notNull(),
  paymentOption: paymentEnum("payment_option").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
