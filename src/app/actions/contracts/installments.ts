"use server";

import { revalidatePath } from "next/cache";
import { ContractService } from "@/app/(protected)/contracts/domain/ContractService";

export async function addInstallment(input: {
  contractId: number;
  dueDate: string; // "YYYY-MM-DD"
  amountCents: number;
}) {
  await ContractService.addInstallment({
    contractId: input.contractId,
    dueDate: new Date(input.dueDate),
    amountCents: input.amountCents,
  });
  revalidatePath("/contracts");
  return { success: true };
}

export async function updateInstallment(input: {
  installmentId: number;
  dueDate?: string;
  amountCents?: number;
  discountCents?: number;
  status?: "open" | "paid" | "cancelled";
  markPaid?: { paidAt?: string; paidAmountCents?: number };
}) {
  await ContractService.updateInstallment({
    installmentId: input.installmentId,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    amountCents: input.amountCents,
    discountCents: input.discountCents,
    status: input.status,
    markPaid: input.markPaid
      ? {
          paidAt: input.markPaid.paidAt
            ? new Date(input.markPaid.paidAt)
            : undefined,
          paidAmountCents: input.markPaid.paidAmountCents,
        }
      : undefined,
  });
  revalidatePath("/contracts");
  return { success: true };
}

export async function deleteInstallment(installmentId: number) {
  await ContractService.deleteInstallment(installmentId);
  revalidatePath("/contracts");
  return { success: true };
}
