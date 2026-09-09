/**
 * lib/whatsapp/provider.ts — contrato da camada de envio de WhatsApp.
 *
 * A aplicação nunca fala com um provedor concreto: ela depende de
 * `WhatsAppProvider`. A implementação concreta é escolhida em runtime pela env
 * `WHATSAPP_PROVIDER` (ver lib/whatsapp/index.ts).
 *
 * Implementações (Fase 6):
 *   - MetaCloudApiProvider  -> WhatsApp Cloud API oficial da Meta (produção)
 *   - MockProvider          -> loga no console e grava no banco (desenvolvimento)
 *
 * TODO(fase-6+): plugar um terceiro provider — Z-API ou Evolution API.
 *   Criar lib/whatsapp/zapi-provider.ts (ou evolution-provider.ts) implementando
 *   esta mesma interface e registrá-lo no switch de lib/whatsapp/index.ts sob
 *   WHATSAPP_PROVIDER = "zapi" | "evolution". Nenhum outro arquivo deve mudar.
 */

export interface WhatsAppProvider {
  enviarTemplate(params: {
    /** Telefone em E.164, ex.: +5562999999999 */
    telefone: string;
    /** Nome do template HSM aprovado na Meta (ver docs/templates-whatsapp.md) */
    template: string;
    /** Variáveis do template, na ordem esperada pelo HSM */
    variaveis: Record<string, string>;
  }): Promise<{ providerMessageId: string }>;
}
