import { db } from "@/db";
import {
  contracts,
  contractInstallments,
  enrollments,
  preReenrollments,
  serviceValues,
} from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ContractPlan } from "./ContractPlan";

export type CreateFromPreInput = {
  preReenrollmentId: number;
  // opcionalmente sobrescrever meses/valor
  customMonthlyCents?: number;
  startMonth?: number;
  months?: number;
};

export class ContractService {
  /** Cria (ou substitui) contrato + parcelas para o aluno da pré-rematrícula */
  static async createFromPre(input: CreateFromPreInput) {
    const [pre] = await db
      .select()
      .from(preReenrollments)
      .where(eq(preReenrollments.id, input.preReenrollmentId))
      .limit(1);

    if (!pre) throw new Error("PRE_NOT_FOUND");

    // cria (ou encontra) a matrícula 2026
    const [enr] = await db
      .insert(enrollments)
      .values({
        studentId: pre.studentId,
        year: pre.nextYear,
        grade: pre.nextGrade,
        serviceId: pre.serviceId ?? null,
        valueId: pre.valueId ?? null,
        priceTier: pre.priceTier ?? null,
        appliedPriceCents: pre.appliedPriceCents ?? null,
        status: "active",
      })
      .onConflictDoUpdate({
        target: [enrollments.studentId, enrollments.year],
        set: {
          grade: pre.nextGrade,
          serviceId: pre.serviceId ?? null,
          valueId: pre.valueId ?? null,
          priceTier: pre.priceTier ?? null,
          appliedPriceCents: pre.appliedPriceCents ?? null,
          status: "active",
        },
      })
      .returning();

    // busca valor mensal padrão do service_values (fallback: appliedPriceCents/12)
    let monthly = input.customMonthlyCents ?? null;

    if (monthly == null && pre.valueId) {
      const [val] = await db
        .select()
        .from(serviceValues)
        .where(eq(serviceValues.id, pre.valueId));
      monthly = val?.listPriceCents ?? null;
    }
    if (monthly == null) {
      // fallback: se veio appliedPriceCents de rematrícula (taxa), não é mensalidade.
      // escolha um valor conservador (ex.: 0) para forçar ajuste manual.
      monthly = 0;
    }

    // cria (ou substitui) contrato
    const [contract] = await db
      .insert(contracts)
      .values({
        studentId: pre.studentId,
        enrollmentId: enr.id,
        year: pre.nextYear,
        grade: pre.nextGrade,
        serviceId: pre.serviceId!,
        status: "active",
      })
      .onConflictDoUpdate({
        target: [contracts.studentId, contracts.year],
        set: {
          enrollmentId: enr.id,
          grade: pre.nextGrade,
          serviceId: pre.serviceId!,
          status: "active",
          updatedAt: new Date(),
        },
      })
      .returning();

    // apaga parcelas anteriores (se houver) e recria
    await db
      .delete(contractInstallments)
      .where(eq(contractInstallments.contractId, contract.id));

    const specs = ContractPlan.buildStandard({
      year: pre.nextYear,
      monthlyCents: monthly,
      startMonth: input.startMonth ?? 1,
      months: input.months ?? 12,
    });

    if (specs.length) {
      await db.insert(contractInstallments).values(
        specs.map((s) => ({
          contractId: contract.id,
          seq: s.seq,
          dueDate: s.dueDate,
          amountCents: s.amountCents,
          discountCents: 0,
          status: "open" as const,
        })),
      );
    }

    return { contractId: contract.id };
  }

  static async getContracts(year: number) {
    // lista resumida para a tabela
    const rows = await db
      .select({
        id: contracts.id,
        year: contracts.year,
        studentId: contracts.studentId,
        serviceId: contracts.serviceId,
        status: contracts.status,
      })
      .from(contracts)
      .where(eq(contracts.year, year))
      .orderBy(asc(contracts.id));
    return rows;
  }

  static async getContractDetail(contractId: number) {
    const [c] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1);
    if (!c) throw new Error("CONTRACT_NOT_FOUND");

    const installments = await db
      .select()
      .from(contractInstallments)
      .where(eq(contractInstallments.contractId, contractId))
      .orderBy(asc(contractInstallments.seq));

    return { contract: c, installments };
  }

  static async addInstallment(params: {
    contractId: number;
    dueDate: Date;
    amountCents: number;
  }) {
    const [row] = await db
      .select({ maxSeq: contractInstallments.seq })
      .from(contractInstallments)
      .where(eq(contractInstallments.contractId, params.contractId))
      .orderBy(asc(contractInstallments.seq));

    const nextSeq = (row?.maxSeq ?? 0) + 1;

    await db.insert(contractInstallments).values({
      contractId: params.contractId,
      seq: nextSeq,
      dueDate: params.dueDate,
      amountCents: params.amountCents,
      discountCents: 0,
      status: "open",
    });
  }

  static async updateInstallment(params: {
    installmentId: number;
    dueDate?: Date;
    amountCents?: number;
    discountCents?: number;
    status?: "open" | "paid" | "cancelled";
    markPaid?: { paidAt?: Date; paidAmountCents?: number };
  }) {
    const patch: Record<string, any> = {};
    if (params.dueDate) patch.dueDate = params.dueDate;
    if (typeof params.amountCents === "number")
      patch.amountCents = params.amountCents;
    if (typeof params.discountCents === "number")
      patch.discountCents = params.discountCents;
    if (params.status) patch.status = params.status;

    if (params.markPaid) {
      patch.status = "paid";
      patch.paidAt = params.markPaid.paidAt ?? new Date();
      patch.paidAmountCents =
        typeof params.markPaid.paidAmountCents === "number"
          ? params.markPaid.paidAmountCents
          : undefined;
    }

    await db
      .update(contractInstallments)
      .set(patch)
      .where(eq(contractInstallments.id, params.installmentId));
  }

  static async deleteInstallment(installmentId: number) {
    await db
      .delete(contractInstallments)
      .where(eq(contractInstallments.id, installmentId));
  }
}
