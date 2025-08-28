"use server";

import { db } from "@/db";
import { preReenrollments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { z } from "zod";

const preStatusSchema = z.enum([
  "realizada",
  "em_conversas",
  "finalizado",
  "cancelado",
]);

export async function updatePreEnrollmentStatus(opts: {
  id: number | string;
  status: z.infer<typeof preStatusSchema>;
}) {
  noStore();

  const parsed = preStatusSchema.safeParse(opts.status);
  if (!parsed.success) return { success: false, error: "INVALID_STATUS" };

  const idValue = typeof opts.id === "string" ? Number(opts.id) : opts.id;
  if (!Number.isFinite(idValue)) return { success: false, error: "INVALID_ID" };

  try {
    const res = await db
      .update(preReenrollments)
      .set({ status: parsed.data })
      .where(eq(preReenrollments.id, idValue))
      .returning({ id: preReenrollments.id });

    if (res.length === 0) return { success: false, error: "NOT_FOUND" };

    revalidatePath("/pre-enrollments"); // ajuste se sua rota for outra
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error("updatePreEnrollmentStatus error", e);
    return { success: false, error: "DB_ERROR" };
  }
}
