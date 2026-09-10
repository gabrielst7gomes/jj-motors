import { describe, expect, it } from "vitest";

import { calcularElegibilidade } from "./elegibilidade";

describe("calcularElegibilidade", () => {
  it("saldo exato no limite (meta) é elegível e falta zero", () => {
    // preço 38.000,00 * 0.5 = meta 19.000,00 (1.900.000 centavos)
    const resultado = calcularElegibilidade({
      precoVendaCentavos: 3_800_000n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: 1_900_000n,
    });

    expect(resultado.metaCentavos).toBe(1_900_000n);
    expect(resultado.elegivel).toBe(true);
    expect(resultado.valorFaltanteCentavos).toBe(0n);
  });

  it("saldo 1 centavo abaixo da meta NÃO é elegível e falta exatamente 1 centavo", () => {
    const resultado = calcularElegibilidade({
      precoVendaCentavos: 3_800_000n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: 1_899_999n,
    });

    expect(resultado.metaCentavos).toBe(1_900_000n);
    expect(resultado.elegivel).toBe(false);
    expect(resultado.valorFaltanteCentavos).toBe(1n);
  });

  it("saldo 1 centavo ACIMA da meta é elegível", () => {
    const resultado = calcularElegibilidade({
      precoVendaCentavos: 3_800_000n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: 1_900_001n,
    });

    expect(resultado.elegivel).toBe(true);
    expect(resultado.valorFaltanteCentavos).toBe(0n);
  });

  it("plano com percentual customizado (0.60) exige meta maior", () => {
    // preço 69.000,00 * 0.6 = meta 41.400,00 (4.140.000 centavos)
    const saldo = 4_000_000n; // suficiente para 0.5 (34.500,00) mas não para 0.6

    const comPadrao = calcularElegibilidade({
      precoVendaCentavos: 6_900_000n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: saldo,
    });
    const comCustomizado = calcularElegibilidade({
      precoVendaCentavos: 6_900_000n,
      percentualMinimo: 0.6,
      saldoConfirmadoCentavos: saldo,
    });

    expect(comPadrao.metaCentavos).toBe(3_450_000n);
    expect(comPadrao.elegivel).toBe(true);

    expect(comCustomizado.metaCentavos).toBe(4_140_000n);
    expect(comCustomizado.elegivel).toBe(false);
    expect(comCustomizado.valorFaltanteCentavos).toBe(140_000n);
  });

  it("preço alterado após elegibilidade pode tornar o cliente inelegível de novo", () => {
    const saldo = 1_900_000n; // exatamente a meta do preço original

    const antesDoAumento = calcularElegibilidade({
      precoVendaCentavos: 3_800_000n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: saldo,
    });
    expect(antesDoAumento.elegivel).toBe(true);

    // Preço sobe para 40.000,00 -> nova meta 20.000,00; saldo não mudou.
    const depoisDoAumento = calcularElegibilidade({
      precoVendaCentavos: 4_000_000n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: saldo,
    });
    expect(depoisDoAumento.elegivel).toBe(false);
    expect(depoisDoAumento.valorFaltanteCentavos).toBe(100_000n);

    // Preço cai para 35.000,00 -> nova meta 17.500,00; volta a ser elegível.
    const depoisDaQueda = calcularElegibilidade({
      precoVendaCentavos: 3_500_000n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: saldo,
    });
    expect(depoisDaQueda.elegivel).toBe(true);
    expect(depoisDaQueda.valorFaltanteCentavos).toBe(0n);
  });

  it("arredondamento half-up: meta com fração de centavo exata .5 arredonda para cima", () => {
    // 3 * 0.505 = 1,515 -> ROUND = 2 (half-up), não 1 (round-half-even)
    const resultado = calcularElegibilidade({
      precoVendaCentavos: 3n,
      percentualMinimo: 0.505,
      saldoConfirmadoCentavos: 0n,
    });
    expect(resultado.metaCentavos).toBe(2n);
  });

  it("saldo zero nunca é elegível para preço positivo", () => {
    const resultado = calcularElegibilidade({
      precoVendaCentavos: 100n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: 0n,
    });
    expect(resultado.elegivel).toBe(false);
    expect(resultado.valorFaltanteCentavos).toBe(50n);
  });

  it("saldo negativo (plano com estornos líquidos negativos) nunca é elegível", () => {
    const resultado = calcularElegibilidade({
      precoVendaCentavos: 100n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: -500n,
    });
    expect(resultado.elegivel).toBe(false);
    expect(resultado.valorFaltanteCentavos).toBe(550n);
  });

  it("percentualMinimo fora de (0, 1] lança erro", () => {
    expect(() =>
      calcularElegibilidade({
        precoVendaCentavos: 100n,
        percentualMinimo: 0,
        saldoConfirmadoCentavos: 0n,
      }),
    ).toThrow();

    expect(() =>
      calcularElegibilidade({
        precoVendaCentavos: 100n,
        percentualMinimo: 1.5,
        saldoConfirmadoCentavos: 0n,
      }),
    ).toThrow();
  });

  it("precoVendaCentavos negativo lança erro", () => {
    expect(() =>
      calcularElegibilidade({
        precoVendaCentavos: -100n,
        percentualMinimo: 0.5,
        saldoConfirmadoCentavos: 0n,
      }),
    ).toThrow();
  });
});
