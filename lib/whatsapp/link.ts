/**
 * Monta um link wa.me (WhatsApp Click to Chat) a partir de um telefone E.164
 * e uma mensagem pré-preenchida. Não envia nada — só abre a conversa no
 * app/web do WhatsApp para o vendedor atender manualmente.
 *
 * Ver docs: https://faq.whatsapp.com/5913398998672934
 */
export function linkWhatsApp(telefoneE164: string, mensagem?: string): string {
  // wa.me quer só dígitos (com DDI), sem "+".
  const numero = telefoneE164.replace(/\D/g, "");
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Mensagem padrão que o consultor manda ao abrir a conversa de uma negociação. */
export function mensagemNegociacao(opts: {
  nomeCliente: string;
  marca: string;
  modelo: string;
}): string {
  const primeiroNome = opts.nomeCliente.split(" ")[0];
  return (
    `Olá, ${primeiroNome}! Aqui é da JJ Motors. ` +
    `Vi que você abriu uma negociação para o ${opts.marca} ${opts.modelo}. ` +
    `Vamos acertar as condições?`
  );
}
