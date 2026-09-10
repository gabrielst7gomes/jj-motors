/**
 * lib/promissoria.ts — simulação da promissória (crédito direto ao consumidor).
 *
 * DECISÃO A2: Tabela Price.
 *   PMT = PV * i / (1 - (1 + i)^-n)
 *   - PV = saldo a financiar (preço - entrada), em centavos
 *   - i  = taxa de juros mensal (default configurável, placeholder 0.02 = 2% a.m.)
 *   - n  = quantidade de parcelas
 *
 * O cálculo de `i` e `(1+i)^-n` é inerentemente de ponto flutuante (não existe
 * forma exata em BigInt para exponenciação com juros compostos). Isolamos essa
 * imprecisão dentro desta função: fazemos a conta em `number` só para achar o
 * valor "ideal" da parcela e então voltamos para BigInt já arredondado ao
 * centavo. Nenhum outro módulo do sistema faz essa conversão.
 *
 * Cada parcela é arredondada ao centavo; o resíduo de arredondamento (a
 * diferença entre `saldoFinanciado` e `parcela * n`) é jogado inteiro na
 * última parcela, garantindo que a soma das parcelas bate exatamente com o
 * saldo financiado.
 */

export type EntradaPromissoria = {
  precoVeiculoCentavos: bigint;
  entradaCentavos: bigint;
  qtdParcelas: number;
  taxaJurosMensal: number;
};

export type ParcelaSimulada = {
  numero: number;
  valorCentavos: bigint;
};

export type ResultadoPromissoria = {
  saldoFinanciadoCentavos: bigint;
  valorParcelaCentavos: bigint;
  totalPagoCentavos: bigint;
  parcelas: ParcelaSimulada[];
};

export function simularPromissoria(
  entrada: EntradaPromissoria,
): ResultadoPromissoria {
  const {
    precoVeiculoCentavos,
    entradaCentavos,
    qtdParcelas,
    taxaJurosMensal,
  } = entrada;

  if (precoVeiculoCentavos <= 0n) {
    throw new Error("precoVeiculoCentavos deve ser positivo");
  }
  if (entradaCentavos < 0n) {
    throw new Error("entradaCentavos não pode ser negativo");
  }
  if (entradaCentavos > precoVeiculoCentavos) {
    throw new Error("entradaCentavos não pode exceder precoVeiculoCentavos");
  }
  if (!Number.isInteger(qtdParcelas) || qtdParcelas <= 0) {
    throw new Error("qtdParcelas deve ser um inteiro positivo");
  }
  if (!Number.isFinite(taxaJurosMensal) || taxaJurosMensal < 0) {
    throw new Error("taxaJurosMensal deve ser um número >= 0");
  }

  const saldoFinanciadoCentavos = precoVeiculoCentavos - entradaCentavos;

  if (saldoFinanciadoCentavos === 0n) {
    return {
      saldoFinanciadoCentavos: 0n,
      valorParcelaCentavos: 0n,
      totalPagoCentavos: 0n,
      parcelas: Array.from({ length: qtdParcelas }, (_, i) => ({
        numero: i + 1,
        valorCentavos: 0n,
      })),
    };
  }

  const pvCentavosNumber = Number(saldoFinanciadoCentavos);
  const i = taxaJurosMensal;
  const n = qtdParcelas;

  let parcelaIdealCentavos: number;
  if (i === 0) {
    // Sem juros: parcela = PV / n.
    parcelaIdealCentavos = pvCentavosNumber / n;
  } else {
    const fator = 1 - Math.pow(1 + i, -n);
    parcelaIdealCentavos = (pvCentavosNumber * i) / fator;
  }

  const valorParcelaCentavos = BigInt(Math.round(parcelaIdealCentavos));

  if (valorParcelaCentavos <= 0n) {
    throw new Error(
      "Parâmetros resultaram em parcela não positiva — revise taxa/prazo",
    );
  }

  const parcelas: ParcelaSimulada[] = [];
  for (let numero = 1; numero < n; numero++) {
    parcelas.push({ numero, valorCentavos: valorParcelaCentavos });
  }

  // Última parcela absorve o resíduo, garantindo soma exata = saldoFinanciado
  // quando i = 0 (sem juros). Com juros > 0, o "total pago" naturalmente
  // excede o saldo financiado (isso é o custo do financiamento) — nesse caso
  // a última parcela é apenas ajustada para não deixar resíduo de centavo
  // por arredondamento das parcelas anteriores.
  const somaParcelasAnteriores = valorParcelaCentavos * BigInt(n - 1);
  let ultimaParcela: bigint;
  if (i === 0) {
    ultimaParcela = saldoFinanciadoCentavos - somaParcelasAnteriores;
  } else {
    // Total ideal (com juros) calculado em float, convertido 1x ao centavo.
    const totalIdealCentavos = BigInt(
      Math.round(parcelaIdealCentavos * n),
    );
    ultimaParcela = totalIdealCentavos - somaParcelasAnteriores;
  }
  parcelas.push({ numero: n, valorCentavos: ultimaParcela });

  const totalPagoCentavos = parcelas.reduce(
    (acc, p) => acc + p.valorCentavos,
    0n,
  );

  return {
    saldoFinanciadoCentavos,
    valorParcelaCentavos,
    totalPagoCentavos,
    parcelas,
  };
}
