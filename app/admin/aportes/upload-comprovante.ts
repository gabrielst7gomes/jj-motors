"use server";

import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { exigirPermissao } from "@/app/admin/_actions/autorizacao";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10MiB — mesmo limite do bucket

/**
 * Faz upload do comprovante para o bucket privado `comprovantes`, sob o path
 * `<cliente_id>/<uuid>.<ext>` (a policy `comprovantes_cliente_le_os_seus` lê
 * esse prefixo). Usa `service_role` porque o upload é feito EM NOME do
 * operador durante o lançamento do aporte — não é o cliente fazendo upload.
 *
 * Retorna a URL assinada de longa duração para gravar em
 * aportes.comprovante_url (o bucket é privado; uma URL pública não
 * funcionaria).
 */
export async function uploadComprovante(
  clienteId: string,
  arquivo: File,
): Promise<{ url: string } | { erro: string }> {
  await exigirPermissao("aportes.confirmar");

  if (arquivo.size === 0) {
    return { erro: "Arquivo vazio" };
  }
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    return { erro: "Arquivo excede 10MB" };
  }
  if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
    return { erro: "Tipo de arquivo não permitido (use PNG, JPEG, WEBP ou PDF)" };
  }

  const admin = createAdminClient();
  const extensao = arquivo.name.split(".").pop() ?? "bin";
  const caminho = `${clienteId}/${randomUUID()}.${extensao}`;

  const { error: erroUpload } = await admin.storage
    .from("comprovantes")
    .upload(caminho, arquivo, { contentType: arquivo.type });

  if (erroUpload) {
    return { erro: `Falha no upload: ${erroUpload.message}` };
  }

  // Bucket privado: geramos uma URL assinada de longa duração (1 ano) em vez
  // de uma pública, que não funcionaria. Uma alternativa mais robusta seria
  // gerar a URL assinada sob demanda ao exibir o comprovante; optamos por
  // gravar uma de validade longa para simplificar a Fase 4.
  const { data: assinada, error: erroAssinatura } = await admin.storage
    .from("comprovantes")
    .createSignedUrl(caminho, 60 * 60 * 24 * 365);

  if (erroAssinatura || !assinada) {
    return { erro: `Falha ao gerar URL do comprovante: ${erroAssinatura?.message}` };
  }

  return { url: assinada.signedUrl };
}
