import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  pgEnum,
  uniqueIndex,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ====================== Enums ====================== */
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

export const serviceEnum = pgEnum("service_enum", [
  "integral",
  "meio_periodo",
  "infantil_vespertino",
  "fundamental_vespertino",
]);

export const paymentEnum = pgEnum("payment_enum", [
  "one_sep", // 1x (Setembro) — sua UI mapeia one_oct -> one_sep
  "two_sep_oct", // 2x (Set/Out)
]);

export const priceTierEnum = pgEnum("price_tier_enum", [
  "table", // valor de tabela
  "punctual", // desconto por pontualidade
  "reenrollment", // desconto de rematrícula (pré em setembro)
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status_enum", [
  "pending",
  "active",
  "cancelled",
  "transferred",
]);

/* >>> NOVO: status de pré-(re)matrículas <<< */
export const preStatusEnum = pgEnum("pre_status_enum", [
  "realizada",
  "em_conversas",
  "finalizado",
  "cancelado",
]);

export const userTable = pgTable("user_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessionTable = pgTable("session_table", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const accountTable = pgTable("account_table", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationTable = pgTable("verification_table", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

/* ====================== Tabela principal: estudantes ====================== */
export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    birthDate: date("birth_date", { mode: "date" }).notNull(),
    guardianName: text("guardian_name").notNull(),
    guardianPhone: text("guardian_phone").notNull(), // salve sem máscara; formate na UI
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    idxName: index("students_name_idx").on(t.name),
    idxGuardian: index("students_guardian_idx").on(t.guardianName),
  }),
);

/* ====================== Serviços (catálogo) ====================== */
export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    key: serviceEnum("key").notNull(),
    name: text("name").notNull(),
    active: integer("active").notNull().default(1), // 1=ativo, 0=inativo
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uqKey: uniqueIndex("services_key_uq").on(t.key),
    idxActive: index("services_active_idx").on(t.active),
  }),
);

/* ====================== Valores por Serviço/Ano/Série ====================== */
export const serviceValues = pgTable(
  "service_values",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    year: integer("year").notNull(),
    grade: gradeEnum("grade").notNull(),
    listPriceCents: integer("list_price_cents").notNull(),
    punctualPriceCents: integer("punctual_price_cents").notNull(),
    reenrollPriceCents: integer("reenroll_price_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uqSvcYearGrade: uniqueIndex("service_values_service_year_grade_uq").on(
      t.serviceId,
      t.year,
      t.grade,
    ),
    idxYear: index("service_values_year_idx").on(t.year),
    idxService: index("service_values_service_idx").on(t.serviceId),
    idxGrade: index("service_values_grade_idx").on(t.grade),
  }),
);

/* ====================== Matrículas (por ano letivo) ====================== */
export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    year: integer("year").notNull(),
    grade: gradeEnum("grade").notNull(),
    serviceId: integer("service_id").references(() => services.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
    valueId: integer("value_id").references(() => serviceValues.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    priceTier: priceTierEnum("price_tier"),
    appliedPriceCents: integer("applied_price_cents"),
    status: enrollmentStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uqStudentYear: uniqueIndex("enrollments_student_year_uq").on(
      t.studentId,
      t.year,
    ),
    idxYear: index("enrollments_year_idx").on(t.year),
    idxService: index("enrollments_service_idx").on(t.serviceId),
  }),
);

/* ====================== Pré-matrícula (novos) ====================== */
export const preRegistrations = pgTable(
  "pre_registrations",
  {
    id: serial("id").primaryKey(),

    studentId: integer("student_id").references(() => students.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    studentName: text("student_name").notNull(),
    birthDate: date("birth_date", { mode: "date" }).notNull(),
    guardianName: text("guardian_name").notNull(),
    guardianPhone: text("guardian_phone").notNull(),

    targetYear: integer("target_year").notNull(),
    targetGrade: gradeEnum("target_grade").notNull(),

    serviceId: integer("service_id").references(() => services.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    valueId: integer("value_id").references(() => serviceValues.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    priceTier: priceTierEnum("price_tier"),
    appliedPriceCents: integer("applied_price_cents"),

    paymentOption: paymentEnum("payment_option"),

    /* >>> NOVO: status da pré-matrícula <<< */
    status: preStatusEnum("status").notNull().default("realizada"),

    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    idxYear: index("pre_regs_year_idx").on(t.targetYear),
    idxTarget: index("pre_regs_target_idx").on(t.targetYear, t.targetGrade),
    idxPreRegStatus: index("pre_regs_status_idx").on(t.status), // <<< novo
  }),
);

/* ====================== Pré-rematrícula (alunos da casa) ====================== */
export const preReenrollments = pgTable(
  "pre_reenrollments",
  {
    id: serial("id").primaryKey(),

    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    currentYear: integer("current_year").notNull(),
    currentGrade: gradeEnum("current_grade").notNull(),
    nextYear: integer("next_year").notNull(),
    nextGrade: gradeEnum("next_grade").notNull(),

    serviceId: integer("service_id").references(() => services.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    valueId: integer("value_id").references(() => serviceValues.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    priceTier: priceTierEnum("price_tier"),
    appliedPriceCents: integer("applied_price_cents"),

    paymentOption: paymentEnum("payment_option"),

    /* >>> NOVO: status da pré-rematrícula <<< */
    status: preStatusEnum("status").notNull().default("realizada"),

    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    idxStudentYear: index("pre_reenroll_student_year_idx").on(
      t.studentId,
      t.currentYear,
    ),
    idxNext: index("pre_reenroll_next_idx").on(t.nextYear, t.nextGrade),
    idxPreReenrollStatus: index("pre_reenroll_status_idx").on(t.status), // <<< novo
  }),
);

/* ====================== Relations (opcionais) ====================== */
export const studentsRelations = relations(students, ({ many }) => ({
  enrollments: many(enrollments),
  preRegistrations: many(preRegistrations),
  preReenrollments: many(preReenrollments),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  serviceValues: many(serviceValues),
}));

export const serviceValuesRelations = relations(serviceValues, ({ one }) => ({
  service: one(services, {
    fields: [serviceValues.serviceId],
    references: [services.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  service: one(services, {
    fields: [enrollments.serviceId],
    references: [services.id],
  }),
  value: one(serviceValues, {
    fields: [enrollments.valueId],
    references: [serviceValues.id],
  }),
}));

export const preRegistrationsRelations = relations(
  preRegistrations,
  ({ one }) => ({
    student: one(students, {
      fields: [preRegistrations.studentId],
      references: [students.id],
    }),
    service: one(services, {
      fields: [preRegistrations.serviceId],
      references: [services.id],
    }),
    value: one(serviceValues, {
      fields: [preRegistrations.valueId],
      references: [serviceValues.id],
    }),
  }),
);

export const preReenrollmentsRelations = relations(
  preReenrollments,
  ({ one }) => ({
    student: one(students, {
      fields: [preReenrollments.studentId],
      references: [students.id],
    }),
    service: one(services, {
      fields: [preReenrollments.serviceId],
      references: [services.id],
    }),
    value: one(serviceValues, {
      fields: [preReenrollments.valueId],
      references: [serviceValues.id],
    }),
  }),
);

/* ====================== Tipos ====================== */
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Service = typeof services.$inferSelect;
export type ServiceValue = typeof serviceValues.$inferSelect;
export type NewServiceValue = typeof serviceValues.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type PreRegistration = typeof preRegistrations.$inferSelect;
export type NewPreRegistration = typeof preRegistrations.$inferInsert;
export type PreReenrollment = typeof preReenrollments.$inferSelect;
export type NewPreReenrollment = typeof preReenrollments.$inferInsert;
