/**
 * Helpers de exibição da carência de 3 meses. A regra em si vive em
 * lib/elegibilidade.ts e na view vw_elegibilidade; aqui é só formatação.
 */

export function formatarData(iso: string | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Dias restantes até a data de carência (0 se já passou). */
export function diasRestantes(carenciaAte: string | Date, hoje = new Date()): number {
  const alvo = carenciaAte instanceof Date ? carenciaAte : new Date(carenciaAte);
  const a = Date.UTC(alvo.getFullYear(), alvo.getMonth(), alvo.getDate());
  const h = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.max(0, Math.ceil((a - h) / 86_400_000));
}

/**
 * Estima em quantos meses o cliente atinge a meta, pela MÉDIA dos aportes
 * confirmados já feitos (o aporte deixou de ser fixo — não há mais valor
 * mensal previsto). Retorna null quando não há base para estimar.
 */
export function estimarMesesParaMeta(
  valorFaltanteCentavos: bigint,
  aportesConfirmadosCentavos: bigint[],
  mesesDeHistorico: number,
): number | null {
  if (valorFaltanteCentavos <= 0n) return 0;
  if (aportesConfirmadosCentavos.length === 0 || mesesDeHistorico < 1) return null;
  const total = aportesConfirmadosCentavos.reduce((s, v) => s + v, 0n);
  const mediaMensal = total / BigInt(Math.max(1, mesesDeHistorico));
  if (mediaMensal <= 0n) return null;
  return Math.ceil(Number(valorFaltanteCentavos) / Number(mediaMensal));
}
