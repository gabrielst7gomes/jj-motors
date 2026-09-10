import { describe, expect, it } from "vitest";

import { calcularElegibilidade, somaMesesCalendario } from "./elegibilidade";

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

describe("carência de 3 meses", () => {
  const base = {
    precoVendaCentavos: 3_800_000n,
    percentualMinimo: 0.5,
    saldoConfirmadoCentavos: 5_000_000n, // saldo de sobra
  };

  it("sem dataAdesao, carência é ignorada (elegivel = saldoOk)", () => {
    const r = calcularElegibilidade(base);
    expect(r.carenciaOk).toBe(true);
    expect(r.carenciaAte).toBeUndefined();
    expect(r.elegivel).toBe(true);
  });

  it("com saldo mas dentro da carência: saldoOk true, carenciaOk false, NÃO elegível", () => {
    const r = calcularElegibilidade({
      ...base,
      dataAdesao: "2026-08-01",
      hoje: new Date("2026-09-15"), // 1,5 mês depois
    });
    expect(r.saldoOk).toBe(true);
    expect(r.carenciaOk).toBe(false);
    expect(r.elegivel).toBe(false);
    expect(r.carenciaAte).toEqual(somaMesesCalendario(new Date("2026-08-01"), 3));
  });

  it("exatamente no fim da carência (dia = data-limite): elegível", () => {
    const r = calcularElegibilidade({
      ...base,
      dataAdesao: "2026-06-10",
      hoje: new Date("2026-09-10"), // exatamente 3 meses
    });
    expect(r.carenciaOk).toBe(true);
    expect(r.elegivel).toBe(true);
  });

  it("um dia antes do fim da carência: NÃO elegível", () => {
    const r = calcularElegibilidade({
      ...base,
      dataAdesao: "2026-06-10",
      hoje: new Date("2026-09-09"),
    });
    expect(r.carenciaOk).toBe(false);
    expect(r.elegivel).toBe(false);
  });

  it("carência cumprida mas sem saldo: NÃO elegível, e a falta de saldo é o bloqueio", () => {
    const r = calcularElegibilidade({
      precoVendaCentavos: 3_800_000n,
      percentualMinimo: 0.5,
      saldoConfirmadoCentavos: 1_000_000n, // falta 900.000
      dataAdesao: "2025-01-01",
      hoje: new Date("2026-09-15"),
    });
    expect(r.carenciaOk).toBe(true);
    expect(r.saldoOk).toBe(false);
    expect(r.elegivel).toBe(false);
    expect(r.valorFaltanteCentavos).toBe(900_000n);
  });

  it("carenciaMeses configurável (ex.: 6)", () => {
    const r = calcularElegibilidade({
      ...base,
      dataAdesao: "2026-06-01",
      carenciaMeses: 6,
      hoje: new Date("2026-09-15"),
    });
    expect(r.carenciaOk).toBe(false); // só 3,5 dos 6 meses
  });

  it("somaMesesCalendario faz clamp de fim de mês (31/01 + 1 mês)", () => {
    const r = somaMesesCalendario(new Date("2026-01-31"), 1);
    expect(r.getMonth()).toBe(1); // fevereiro
    expect(r.getDate()).toBe(28); // 2026 não é bissexto
  });
});
