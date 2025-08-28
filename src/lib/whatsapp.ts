// lib/whatsapp.ts
export type Grade =
  | "MATERNAL_3"
  | "PRE_I_4"
  | "PRE_II_5"
  | "ANO_1"
  | "ANO_2"
  | "ANO_3"
  | "ANO_4"
  | "ANO_5";

export type ServiceKey =
  | "integral"
  | "meio_periodo"
  | "infantil_vespertino"
  | "fundamental_vespertino";

export type PaymentUI = "one_oct" | "two_sep_oct";
export type PreStatus =
  | "realizada"
  | "em_conversas"
  | "finalizado"
  | "cancelado";

// (mesmo shape que você usa na tabela de pré-matrículas)
export type PreRegistrationForMsg = {
  studentName: string;
  birthDate: string; // "YYYY-MM-DD"
  guardianName: string;
  guardianPhone: string; // pode vir com máscara; vamos limpar
  grade: Grade;
  service: ServiceKey | null;
  paymentOption: PaymentUI | null;
  createdAt: string; // ISO
  status: PreStatus;
};

export const GRADE_LABEL: Record<Grade, string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º ANO",
  ANO_2: "2º ANO",
  ANO_3: "3º ANO",
  ANO_4: "4º ANO",
  ANO_5: "5º ANO",
};

export const SERVICE_LABEL: Record<ServiceKey, string> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};

export const PAYMENT_LABEL: Record<PaymentUI, string> = {
  one_oct: "1x (Outubro)",
  two_sep_oct: "2x (Set/Out)",
};

export function formatPhoneBR(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{1})(\d{4})(\d{4})$/, "$1.$2-$3");
}

export function formatDateBR(ymd: string) {
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateTimeBR(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

/** Gera a mensagem para WhatsApp (pré-matrícula) */
export function buildPreRegistrationWhatsAppMessage(
  row: PreRegistrationForMsg,
  escolaNome = "CERG",
) {
  const serviceLabel = row.service ? SERVICE_LABEL[row.service] : "—";
  const paymentLabel = row.paymentOption
    ? PAYMENT_LABEL[row.paymentOption]
    : "—";

  return `Olá ${row.guardianName}! Aqui é do ${escolaNome} 👋

Recebemos a PRÉ-MATRÍCULA de *${row.studentName}*.

📌 Dados enviados:
• Nascimento: ${formatDateBR(row.birthDate)}
• Série pretendida: ${GRADE_LABEL[row.grade]}
• Serviço: ${serviceLabel}
• Forma de pagamento: ${paymentLabel}
• Enviado em: ${formatDateTimeBR(row.createdAt)}
• Status: ${row.status.replace("_", " ")}

Em breve entraremos em contato para os próximos passos. 
Se preferir, pode responder por aqui. Obrigado!`;
}

/** Monta link do WhatsApp com número + mensagem (text) */
export function whatsappLink(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "");

  // adiciona DDI se não tiver (Brasil: 55)
  if (digits.length === 10 || digits.length === 11) {
    digits = "55" + digits;
  }
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
