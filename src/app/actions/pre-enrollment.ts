"use server";

import { db } from "@/db";
import { preEnrollments } from "@/db/schema";
import {
  preEnrollmentSchema,
  type PreEnrollmentForm,
} from "@/lib/validation/pre-enrollment";

export async function createPreEnrollment(input: PreEnrollmentForm) {
  try {
    const data = preEnrollmentSchema.parse(input);

    await db.insert(preEnrollments).values({
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
    console.error("createPreEnrollment error", err);
    return { success: false, error: "VALIDATION_OR_DB_ERROR" };
  }
}
