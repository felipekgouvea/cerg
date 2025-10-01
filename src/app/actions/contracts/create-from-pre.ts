"use server";

import { revalidatePath } from "next/cache";
import { ContractService } from "@/app/(protected)/contracts/domain/ContractService";

export async function createContractFromPre(opts: {
  preReenrollmentId: number;
  customMonthlyCents?: number;
  startMonth?: number;
  months?: number;
}) {
  try {
    const out = await ContractService.createFromPre(opts);
    revalidatePath("/contracts");
    return { success: true, contractId: out.contractId };
  } catch (e) {
    console.error("createContractFromPre", e);
    return { success: false, error: "CREATE_CONTRACT_ERROR" };
  }
}
