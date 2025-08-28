// app/_lib/messages/registration-whatsapp.ts

import type { Registration } from "../types/registration";

/** Labels legíveis */
export const SERVICE_LABEL: Record<Registration["service"], string> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};

export const GRADE_LABEL: Record<Registration["grade"], string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º ano",
  ANO_2: "2º ano",
  ANO_3: "3º ano",
  ANO_4: "4º ano",
  ANO_5: "5º ano",
};

export const PAYMENT_LABEL: Record<Registration["paymentOption"], string> = {
  one_oct: "1x (Setembro)",
  two_sep_oct: "2x (Set/Out)",
};

export type PreRematriculaMessageOpts = {
  /** Ano letivo da rematrícula. Default: próximo ano. */
  year?: number;
  /** Telefone fixo/secretaria para exibição (mascarado opcionalmente). */
  secretaryPhoneDisplay?: string;
  /** WhatsApp da secretaria (somente dígitos, ex: 5531999999999) para exibição. */
  secretaryWhatsAppDigits?: string;
  /** Incluir lista de documentos no texto longo. Default: true */
  includeDocsList?: boolean;
};

/** Mascara simples BR (00) 0.0000-0000 / (00) 0000-0000 */
export function maskPhoneBR(digitsLike: string): string {
  const d = (digitsLike || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 10) {
    const dd = d.padEnd(10, " ");
    return `(${dd.slice(0, 2)}) ${dd.slice(2, 6)}-${dd.slice(6, 10)}`.trim();
  }
  const dd = d.padEnd(11, " ");
  return `(${dd.slice(0, 2)}) ${dd.slice(2, 3)}.${dd.slice(3, 7)}-${dd.slice(7, 11)}`.trim();
}

/** Monta link wa.me com mensagem pré-preenchida */
export function buildWhatsAppLink(
  phoneDigits: string,
  message: string,
): string {
  const phone = (phoneDigits || "").replace(/\D/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

/** Mensagem completa (recomendada) */
export function buildPreRematriculaMessage(
  reg: Pick<
    Registration,
    "guardianName" | "studentName" | "service" | "grade" | "paymentOption"
  >,
  opts: PreRematriculaMessageOpts = {},
): string {
  const year =
    typeof opts.year === "number"
      ? opts.year
      : new Date().getMonth() >= 6
        ? new Date().getFullYear() + 1
        : new Date().getFullYear(); // heurística: 2º semestre => próximo ano

  const serviceLabel = SERVICE_LABEL[reg.service];
  const gradeLabel = GRADE_LABEL[reg.grade];
  const paymentLabel = PAYMENT_LABEL[reg.paymentOption];

  const docs = opts.includeDocsList ?? true;

  const secretariaTel = opts.secretaryPhoneDisplay
    ? ` ${opts.secretaryPhoneDisplay}`
    : "";
  const secretariaZap = opts.secretaryWhatsAppDigits
    ? ` ${maskPhoneBR(opts.secretaryWhatsAppDigits)}`
    : "";

  return (
    `Olá, ${reg.guardianName}! 👋\n\n` +
    `Recebemos a pré-rematrícula do(a) ${reg.studentName} para ${year} no CERG. 💛\n\n` +
    `📌 Resumo do pedido:\n` +
    `• Série: ${gradeLabel}\n` +
    `• Período/Serviço: ${serviceLabel}\n` +
    `• Forma de pagamento: ${paymentLabel}\n\n` +
    `✅ O que acontece agora?\n` +
    `Nossa equipe vai validar os dados e enviar as instruções para formalizar a matrícula em setembro (com a 1ª parcela/“matrícula”).\n` +
    `A vaga fica garantida após a confirmação do pagamento e entrega da documentação.\n\n` +
    (docs
      ? `🗂️ Documentos (antecipe-se):\n` +
        `• Certidão de nascimento do aluno(a)\n` +
        `• RG e CPF do responsável\n` +
        `• Comprovante de residência\n` +
        `• Carteira de vacinação atualizada\n` +
        `• (EF) Histórico/Declaração de transferência\n\n`
      : "") +
    `Em caso de dúvidas, fale com a secretaria:${secretariaTel || ""}${
      secretariaZap ? " | WhatsApp:" + secretariaZap : ""
    }.\n` +
    `Conte sempre com a nossa equipe! ✨`
  );
}

/** Mensagem curta */
export function buildPreRematriculaMessageShort(
  reg: Pick<
    Registration,
    "guardianName" | "studentName" | "service" | "grade" | "paymentOption"
  >,
  opts: PreRematriculaMessageOpts = {},
): string {
  const year =
    typeof opts.year === "number"
      ? opts.year
      : new Date().getMonth() >= 6
        ? new Date().getFullYear() + 1
        : new Date().getFullYear();

  const serviceLabel = SERVICE_LABEL[reg.service];
  const gradeLabel = GRADE_LABEL[reg.grade];
  const paymentLabel = PAYMENT_LABEL[reg.paymentOption];

  const secretariaZap = opts.secretaryWhatsAppDigits
    ? ` ${maskPhoneBR(opts.secretaryWhatsAppDigits)}`
    : "";

  return (
    `Olá, ${reg.guardianName}! ✅\n` +
    `Sua pré-rematrícula do(a) ${reg.studentName} para ${year} foi recebida.\n\n` +
    `• Série: ${gradeLabel}\n` +
    `• Período: ${serviceLabel}\n` +
    `• Pagamento: ${paymentLabel}\n\n` +
    `Em setembro enviaremos as orientações para formalizar a matrícula (1ª parcela + documentos).` +
    (secretariaZap ? `\nDúvidas: ${secretariaZap}` : "") +
    `\n💛 CERG`
  );
}
