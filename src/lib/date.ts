// src/lib/date.ts
export function formatDateTimeBR(value: string | Date) {
  const d = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo", // <- chave para evitar mismatch
  }).format(d);
}

export function formatDateBR(value: string | Date) {
  const d = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}
