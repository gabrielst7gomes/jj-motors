"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { exigirPermissao } from "@/app/admin/_actions/autorizacao";
import { registrarAuditoria } from "@/app/admin/_actions/auditoria";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024;

export type EstadoUploadFoto = { erro?: string; sucesso?: boolean };

export async function uploadFotoVeiculo(
  veiculoId: string,
  _estadoAnterior: EstadoUploadFoto,
  formData: FormData,
): Promise<EstadoUploadFoto> {
  const { supabase, userId } = await exigirPermissao("estoque.editar");

  const arquivo = formData.get("foto");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Selecione uma imagem" };
  }
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    return { erro: "Imagem excede 10MB" };
  }
  if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
    return { erro: "Formato não permitido (use PNG, JPEG ou WEBP)" };
  }

  const admin = createAdminClient();
  const extensao = arquivo.name.split(".").pop() ?? "jpg";
  const caminho = `${veiculoId}/${randomUUID()}.${extensao}`;

  const { error: erroUpload } = await admin.storage
    .from("veiculo-fotos")
    .upload(caminho, arquivo, { contentType: arquivo.type });

  if (erroUpload) {
    return { erro: `Falha no upload: ${erroUpload.message}` };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("veiculo-fotos").getPublicUrl(caminho);

  const { count: totalFotos } = await supabase
    .from("veiculo_fotos")
    .select("id", { count: "exact", head: true })
    .eq("veiculo_id", veiculoId);

  const { error } = await supabase.from("veiculo_fotos").insert({
    veiculo_id: veiculoId,
    url: publicUrl,
    ordem: totalFotos ?? 0,
    capa: (totalFotos ?? 0) === 0,
  });

  if (error) {
    return { erro: `Erro ao salvar foto: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "upload_foto_veiculo",
    entidade: "veiculo_fotos",
    entidadeId: veiculoId,
    dadosDepois: { url: publicUrl },
  });

  revalidatePath(`/admin/estoque/${veiculoId}`);
  return { sucesso: true };
}

export async function removerFotoVeiculo(fotoId: string, veiculoId: string) {
  const { supabase, userId } = await exigirPermissao("estoque.editar");

  const { error } = await supabase
    .from("veiculo_fotos")
    .delete()
    .eq("id", fotoId);

  if (!error) {
    await registrarAuditoria(supabase, {
      usuarioId: userId,
      acao: "remover_foto_veiculo",
      entidade: "veiculo_fotos",
      entidadeId: fotoId,
    });
  }

  revalidatePath(`/admin/estoque/${veiculoId}`);
}

export async function definirFotoCapa(fotoId: string, veiculoId: string) {
  const { supabase } = await exigirPermissao("estoque.editar");

  // Remove a capa atual e define a nova em duas operações — não há problema
  // de concorrência relevante aqui (ação manual de um único operador).
  await supabase
    .from("veiculo_fotos")
    .update({ capa: false })
    .eq("veiculo_id", veiculoId);
  await supabase.from("veiculo_fotos").update({ capa: true }).eq("id", fotoId);

  revalidatePath(`/admin/estoque/${veiculoId}`);
}
