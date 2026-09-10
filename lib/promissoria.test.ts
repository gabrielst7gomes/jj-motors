import { describe, expect, it } from "vitest";

import { simularPromissoria } from "./promissoria";

describe("simularPromissoria", () => {
  it("sem juros: parcelas iguais e soma exata ao saldo financiado", () => {
    const resultado = simularPromissoria({
      precoVeiculoCentavos: 10_000_00n,
      entradaCentavos: 4_000_00n,
      qtdParcelas: 6,
      taxaJurosMensal: 0,
    });

    expect(resultado.saldoFinanciadoCentavos).toBe(6_000_00n);
    expect(resultado.parcelas).toHaveLength(6);

    const soma = resultado.parcelas.reduce((a, p) => a + p.valorCentavos, 0n);
    expect(soma).toBe(6_000_00n);
    expect(resultado.totalPagoCentavos).toBe(6_000_00n);
  });

  it("sem juros, saldo não divisível igualmente: resíduo vai para a última parcela", () => {
    // 1000 centavos / 3 = 333.33... -> parcelas 333, 333, 334
    const resultado = simularPromissoria({
      precoVeiculoCentavos: 1000n,
      entradaCentavos: 0n,
      qtdParcelas: 3,
      taxaJurosMensal: 0,
    });

    expect(resultado.parcelas.at(0)?.valorCentavos).toBe(333n);
    expect(resultado.parcelas.at(1)?.valorCentavos).toBe(333n);
    expect(resultado.parcelas.at(2)?.valorCentavos).toBe(334n);

    const soma = resultado.parcelas.reduce((a, p) => a + p.valorCentavos, 0n);
    expect(soma).toBe(1000n);
  });

  it("com juros: todas as parcelas (exceto a última) têm o mesmo valor", () => {
    const resultado = simularPromissoria({
      precoVeiculoCentavos: 20_000_00n,
      entradaCentavos: 5_000_00n,
      qtdParcelas: 12,
      taxaJurosMensal: 0.02,
    });

    const primeiras11 = resultado.parcelas.slice(0, 11);
    for (const p of primeiras11) {
      expect(p.valorCentavos).toBe(resultado.valorParcelaCentavos);
    }
    // Total pago com juros deve exceder o saldo financiado.
    expect(resultado.totalPagoCentavos).toBeGreaterThan(
      resultado.saldoFinanciadoCentavos,
    );
  });

  it("com juros: parcela bate com a fórmula de Price (tolerância de 1 centavo)", () => {
    const pv = 10_000_00; // R$ 10.000,00 em centavos
    const i = 0.025;
    const n = 24;
    const pmtEsperada = Math.round((pv * i) / (1 - Math.pow(1 + i, -n)));

    const resultado = simularPromissoria({
      precoVeiculoCentavos: BigInt(pv),
      entradaCentavos: 0n,
      qtdParcelas: n,
      taxaJurosMensal: i,
    });

    expect(resultado.valorParcelaCentavos).toBe(BigInt(pmtEsperada));
  });

  it("entrada igual ao preço: saldo financiado zero, parcelas zeradas", () => {
    const resultado = simularPromissoria({
      precoVeiculoCentavos: 5_000_00n,
      entradaCentavos: 5_000_00n,
      qtdParcelas: 12,
      taxaJurosMensal: 0.02,
    });

    expect(resultado.saldoFinanciadoCentavos).toBe(0n);
    expect(resultado.valorParcelaCentavos).toBe(0n);
    expect(resultado.parcelas.every((p) => p.valorCentavos === 0n)).toBe(true);
  });

  it("1 parcela única: valor da parcela é o próprio saldo financiado (sem juros)", () => {
    const resultado = simularPromissoria({
      precoVeiculoCentavos: 5_000_00n,
      entradaCentavos: 3_000_00n,
      qtdParcelas: 1,
      taxaJurosMensal: 0,
    });

    expect(resultado.parcelas).toHaveLength(1);
    expect(resultado.parcelas.at(0)?.valorCentavos).toBe(2_000_00n);
  });

  it("rejeita entrada maior que o preço", () => {
    expect(() =>
      simularPromissoria({
        precoVeiculoCentavos: 100n,
        entradaCentavos: 200n,
        qtdParcelas: 12,
        taxaJurosMensal: 0.02,
      }),
    ).toThrow();
  });

  it("rejeita quantidade de parcelas inválida", () => {
    expect(() =>
      simularPromissoria({
        precoVeiculoCentavos: 100n,
        entradaCentavos: 0n,
        qtdParcelas: 0,
        taxaJurosMensal: 0.02,
      }),
    ).toThrow();
  });

  it("rejeita preço não positivo", () => {
    expect(() =>
      simularPromissoria({
        precoVeiculoCentavos: 0n,
        entradaCentavos: 0n,
        qtdParcelas: 12,
        taxaJurosMensal: 0.02,
      }),
    ).toThrow();
  });
});
