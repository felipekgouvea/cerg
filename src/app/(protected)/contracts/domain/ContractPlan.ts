export type PlanInput = {
  year: number; // 2026
  monthlyCents: number; // valor cheio mensal (service_values.listPriceCents)
  startMonth?: number; // 1..12 (default: 1)
  months?: number; // default: 12
};

export type InstallmentSpec = {
  seq: number;
  dueDate: Date;
  amountCents: number;
};

export class ContractPlan {
  static buildStandard(input: PlanInput): InstallmentSpec[] {
    const months = input.months ?? 12;
    const start = input.startMonth ?? 1;

    const out: InstallmentSpec[] = [];
    for (let i = 0; i < months; i++) {
      const seq = i + 1;
      const month = start + i;
      const date = new Date(input.year, month - 1, 5, 0, 0, 0, 0); // vencimento dia 5
      out.push({ seq, dueDate: date, amountCents: input.monthlyCents });
    }
    return out;
  }
}
