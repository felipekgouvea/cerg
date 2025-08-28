// src/db/clean.ts
import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  preReenrollments,
  preRegistrations,
  enrollments,
  serviceValues,
  services,
  students,
} from "./schema";

async function clean() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_RESET !== "true"
  ) {
    throw new Error(
      "LIMPEZA BLOQUEADA EM PRODUÇÃO. Defina ALLOW_RESET=true para permitir.",
    );
  }

  // ⚠️ sem "as const" aqui
  const tables = [
    preReenrollments,
    preRegistrations,
    enrollments,
    serviceValues,
    services,
    students,
  ];

  // se seu editor ainda reclamar de tipos, force para SQLChunk[]:
  await db.execute(
    sql`TRUNCATE TABLE ${sql.join(tables, sql`, `)} RESTART IDENTITY CASCADE;`,
  );

  console.log("✅ Banco limpo.");
}

clean().catch((e) => {
  console.error(e);
  process.exit(1);
});

export default clean;
