import { describe, expect, it } from "vitest";

import { formatBRL, parseBRL } from "./money";

describe("formatBRL", () => {
  it("formata valores redondos", () => {
    expect(formatBRL(1_900_000n)).toBe("R$ 19.000,00");
  });

  it("formata centavos < 1 real", () => {
    expect(formatBRL(5n)).toBe("R$ 0,05");
    expect(formatBRL(99n)).toBe("R$ 0,99");
  });

  it("formata zero", () => {
    expect(formatBRL(0n)).toBe("R$ 0,00");
  });

  it("formata valores negativos (estornos)", () => {
    expect(formatBRL(-100_000n)).toBe("-R$ 1.000,00");
  });

  it("formata valores grandes com múltiplos separadores de milhar", () => {
    expect(formatBRL(123_456_789_00n)).toBe("R$ 123.456.789,00");
  });

  it("formata valores com centavos não redondos", () => {
    expect(formatBRL(1_234_56n)).toBe("R$ 1.234,56");
  });
});

describe("parseBRL", () => {
  it("faz o round-trip com formatBRL para valores redondos", () => {
    expect(parseBRL("R$ 19.000,00")).toBe(1_900_000n);
  });

  it("aceita sem o símbolo R$", () => {
    expect(parseBRL("19.000,00")).toBe(1_900_000n);
  });

  it("aceita sem separador de milhar", () => {
    expect(parseBRL("19000,00")).toBe(1_900_000n);
  });

  it("aceita inteiro puro (sem vírgula) como reais cheios", () => {
    expect(parseBRL("19000")).toBe(1_900_000n);
  });

  it("aceita valores negativos (estorno)", () => {
    expect(parseBRL("-R$ 1.000,00")).toBe(-100_000n);
  });

  it("aceita centavos < 10 com zero à esquerda", () => {
    expect(parseBRL("R$ 0,05")).toBe(5n);
  });

  it("rejeita parte decimal com 1 dígito", () => {
    expect(() => parseBRL("19,0")).toThrow();
  });

  it("rejeita parte decimal com 3 dígitos", () => {
    expect(() => parseBRL("19,000")).toThrow();
  });

  it("rejeita string vazia", () => {
    expect(() => parseBRL("")).toThrow();
    expect(() => parseBRL("   ")).toThrow();
  });

  it("rejeita texto não numérico", () => {
    expect(() => parseBRL("abc")).toThrow();
    expect(() => parseBRL("R$ abc,00")).toThrow();
  });

  it("round-trip formatBRL -> parseBRL preserva o valor para uma faixa de centavos", () => {
    const amostras = [0n, 1n, 5n, 99n, 100n, 1_900_000n, -250_000n, 999_999_99n];
    for (const centavos of amostras) {
      expect(parseBRL(formatBRL(centavos))).toBe(centavos);
    }
  });
});
