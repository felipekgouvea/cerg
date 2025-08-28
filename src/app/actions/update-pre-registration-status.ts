// src/app/actions/update-pre-registration-status.ts
"use server";

import { db } from "@/db";
import { preRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  preStatusSchema,
  type PreStatus,
} from "@/lib/validation/pre-registration";

export async function updatePreRegistrationStatus(opts: {
  id: number | string;
  status: PreStatus;
}) {
  const parsed = preStatusSchema.safeParse(opts.status);
  if (!parsed.success) {
    return { success: false, error: "INVALID_STATUS" };
  }

  const idNum = typeof opts.id === "string" ? Number(opts.id) : opts.id;
  if (!Number.isFinite(idNum)) {
    return { success: false, error: "INVALID_ID" };
  }

  try {
    await db
      .update(preRegistrations)
      .set({ status: parsed.data })
      .where(eq(preRegistrations.id, idNum));
    return { success: true };
  } catch (e) {
    console.error("updatePreRegistrationStatus error", e);
    return { success: false, error: "DB_ERROR" };
  }
}
