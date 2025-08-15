"use server";

import { db } from "@/db";
import { preRegistration } from "@/db/schema";
import {
  preRegistrationSchema,
  type PreRegistrationForm,
} from "@/lib/validation/pre-registration";

export async function createPreRegistration(input: PreRegistrationForm) {
  try {
    const data = preRegistrationSchema.parse(input);

    await db.insert(preRegistration).values({
      studentName: data.studentName,
      birthDate: new Date(data.birthDate),
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      service: data.service,
      grade: data.grade,
      paymentOption: data.paymentOption,
    });

    return { success: true };
  } catch (err) {
    console.error("createPreRegistration error", err);
    return { success: false, error: "VALIDATION_OR_DB_ERROR" };
  }
}
