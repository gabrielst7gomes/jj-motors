/**
 * lib/elegibilidade.ts — regra de elegibilidade como função pura.
 *
 * REGRA (após a mudança de 2026-09-10 — carência):
 *   meta            = ROUND(preco_venda * percentual_minimo)   [half-up]
 *   saldoOk         = saldo_confirmado >= meta
 *   carenciaOk      = data_adesao + N meses de calendário <= hoje  (N default 3)
 *   elegivel        = saldoOk E carenciaOk
 *   valor_faltante  = meta - saldo_confirmado   (>= 0; 0 quando saldoOk)
 *
 * Espelha EXATAMENTE a função SQL `meta_centavos()`, `meses_carencia()` e a
 * view `vw_elegibilidade` (migrations 20260101000000, 20260101001100,
 * 20260101001900). Os testes de borda garantem que os dois lados concordam.
 *
 * Dinheiro em BigInt (regra 3.1). O percentual (NUMERIC(4,3) no banco) é
 * tratado como fração exata de inteiros sobre 1000, nunca como float
 * multiplicando um bigint.
 */

export type PercentualMinimo = number;

export type EntradaElegibilidade = {
  saldoConfirmadoCentavos: bigint;
  precoVendaCentavos: bigint;
  /** Fração do preço exigida. Padrão 0.5. Configurável por plano. */
  percentualMinimo: PercentualMinimo;
  /** Data de adesão do plano (ISO "YYYY-MM-DD" ou Date). Omitir = ignora carência. */
  dataAdesao?: string | Date;
  /** Meses de carência de calendário. Padrão 3. */
  carenciaMeses?: number;
  /** "Hoje" — injetável para teste. Padrão: agora. */
  hoje?: Date;
};

export type ResultadoElegibilidade = {
  metaCentavos: bigint;
  saldoOk: boolean;
  carenciaOk: boolean;
  /** Data (fim do dia) em que a carência termina. undefined se sem dataAdesao. */
  carenciaAte?: Date;
  elegivel: boolean;
  valorFaltanteCentavos: bigint;
};

const DENOMINADOR = 1000n;

function percentualParaNumerador(percentual: number): bigint {
  if (!Number.isFinite(percentual) || percentual <= 0 || percentual > 1) {
    throw new Error(
      `percentualMinimo deve estar em (0, 1], recebido: ${percentual}`,
    );
  }
  return BigInt(Math.round(percentual * 1000));
}

function metaCentavos(
  precoVendaCentavos: bigint,
  percentualMinimo: PercentualMinimo,
): bigint {
  if (precoVendaCentavos < 0n) {
    throw new Error(
      `precoVendaCentavos não pode ser negativo: ${precoVendaCentavos}`,
    );
  }
  const numerador = percentualParaNumerador(percentualMinimo);
  const produto = precoVendaCentavos * numerador;
  return (produto + DENOMINADOR / 2n) / DENOMINADOR;
}

/**
 * Soma N meses de calendário a uma data, espelhando `make_interval(months=>N)`
 * do Postgres. O Postgres, ao somar meses, mantém o dia e faz clamp para o
 * último dia do mês quando o dia não existe (31 jan + 1 mês = 28/29 fev).
 * `Date.setMonth` do JS já faz esse comportamento de clamp via overflow, o
 * que não bate exatamente com o do Postgres em casos de fim de mês; para a
 * carência (comparação `<=` contra "hoje", granularidade de dia) a diferença
 * de no máximo ~3 dias em datas de virada de mês é aceitável e conservadora.
 */
export function somaMesesCalendario(base: Date, meses: number): Date {
  const d = new Date(base.getTime());
  const diaOriginal = d.getDate();
  d.setMonth(d.getMonth() + meses);
  // Clamp: se o mês "pulou" (ex.: 31/01 + 1 = 03/03), volta pro último dia do
  // mês alvo — igual ao Postgres.
  if (d.getDate() < diaOriginal) {
    d.setDate(0);
  }
  return d;
}

export function calcularElegibilidade(
  entrada: EntradaElegibilidade,
): ResultadoElegibilidade {
  const {
    saldoConfirmadoCentavos,
    precoVendaCentavos,
    percentualMinimo,
    dataAdesao,
    carenciaMeses = 3,
    hoje = new Date(),
  } = entrada;

  const meta = metaCentavos(precoVendaCentavos, percentualMinimo);
  const saldoOk = saldoConfirmadoCentavos >= meta;
  const valorFaltante = meta - saldoConfirmadoCentavos;

  let carenciaOk = true;
  let carenciaAte: Date | undefined;
  if (dataAdesao != null) {
    const base = dataAdesao instanceof Date ? dataAdesao : new Date(dataAdesao);
    carenciaAte = somaMesesCalendario(base, carenciaMeses);
    // Comparação por dia: carência cumprida quando a data-limite já passou
    // (ou é hoje). Zeramos as horas dos dois lados.
    const limiteDia = new Date(
      carenciaAte.getFullYear(),
      carenciaAte.getMonth(),
      carenciaAte.getDate(),
    );
    const hojeDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );
    carenciaOk = limiteDia.getTime() <= hojeDia.getTime();
  }

  return {
    metaCentavos: meta,
    saldoOk,
    carenciaOk,
    carenciaAte,
    elegivel: saldoOk && carenciaOk,
    valorFaltanteCentavos: valorFaltante > 0n ? valorFaltante : 0n,
  };
}
