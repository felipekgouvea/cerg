"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function listActiveServices() {
  const rows = await db
    .select({ id: services.id, key: services.key, name: services.name })
    .from(services)
    .where(eq(services.active, 1))
    .orderBy(asc(services.name));
  return rows;
}
