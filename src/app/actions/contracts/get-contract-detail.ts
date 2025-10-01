"use server";

import { ContractService } from "@/app/(protected)/contracts/domain/ContractService";

export async function getContractDetail(contractId: number) {
  try {
    return await ContractService.getContractDetail(contractId);
  } catch (e) {
    console.error("getContractDetail", e);
    return null;
  }
}
