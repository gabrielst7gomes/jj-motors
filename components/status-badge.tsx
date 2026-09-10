import { Badge } from "@/components/ui/badge";

/**
 * Mapeia os enums de negócio para as variants de Badge documentadas em
 * design/IDENTIDADE.md seção 7. "Ativo"/"confirmado" usam a variant
 * `confirmado` (azul-claro, quadrado) — não `elegivel` (vermelho): vermelho
 * é reservado exclusivamente ao veredito de elegibilidade de compra, nunca
 * a "está tudo bem" genérico de status de registro.
 */
const CONFIG_APORTE = {
  confirmado: { variant: "confirmado", label: "Confirmado" },
  pendente: { variant: "pendente", label: "Pendente" },
  rejeitado: { variant: "falha", label: "Rejeitado" },
} as const;

export function StatusAporteBadge({
  status,
}: {
  status: keyof typeof CONFIG_APORTE;
}) {
  const config = CONFIG_APORTE[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const CONFIG_PLANO = {
  ativo: { variant: "confirmado", label: "Ativo" },
  suspenso: { variant: "pendente", label: "Suspenso" },
  concluido: { variant: "progresso", label: "Concluído" },
  cancelado: { variant: "falha", label: "Cancelado" },
} as const;

export function StatusPlanoBadge({
  status,
}: {
  status: keyof typeof CONFIG_PLANO;
}) {
  const config = CONFIG_PLANO[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
