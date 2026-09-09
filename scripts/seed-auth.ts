/**
 * seed-auth.ts — cria os usuários de exemplo no Supabase Auth.
 *
 * Por que um script e não SQL: criar linhas em auth.users direto por SQL é
 * frágil (hash de senha, identities, triggers do GoTrue). A Admin API resolve
 * isso e dispara o trigger handle_new_user() que materializa o profile.
 *
 * Uso:
 *   npm run db:seed-auth
 *
 * Requer no .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SEED_USER_PASSWORD  (default: senha123)
 *
 * Os UUIDs são FIXOS e casam com os referenciados em supabase/seed.sql.
 * O script é idempotente: se o usuário já existe, atualiza os metadados.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const senha = process.env.SEED_USER_PASSWORD ?? "senha123";

if (!url || !serviceRoleKey) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type SeedUser = {
  id: string;
  email: string;
  nome_completo: string;
  cpf: string;
  telefone_e164: string;
  papel: "admin" | "operador" | "cliente";
};

// IDs fixos — mantêm o seed.sql determinístico.
const USUARIOS: SeedUser[] = [
  {
    id: "00000000-0000-0000-0000-0000000000a1",
    email: "admin@jjmotors.local",
    nome_completo: "Joana Justino",
    cpf: "10000000001",
    telefone_e164: "+5562990000001",
    papel: "admin",
  },
  {
    id: "00000000-0000-0000-0000-0000000000c1",
    email: "cliente.ana@jjmotors.local",
    nome_completo: "Ana Ribeiro",
    cpf: "20000000001",
    telefone_e164: "+5562991110001",
    papel: "cliente",
  },
  {
    id: "00000000-0000-0000-0000-0000000000c2",
    email: "cliente.bruno@jjmotors.local",
    nome_completo: "Bruno Carvalho",
    cpf: "20000000002",
    telefone_e164: "+5562991110002",
    papel: "cliente",
  },
  {
    id: "00000000-0000-0000-0000-0000000000c3",
    email: "cliente.carla@jjmotors.local",
    nome_completo: "Carla Dias",
    cpf: "20000000003",
    telefone_e164: "+5562991110003",
    papel: "cliente",
  },
];

async function upsertUsuario(u: SeedUser) {
  const user_metadata = {
    nome_completo: u.nome_completo,
    cpf: u.cpf,
    telefone_e164: u.telefone_e164,
    papel: u.papel,
  };

  // Tenta criar com ID fixo.
  const { error: createError } = await supabase.auth.admin.createUser({
    id: u.id,
    email: u.email,
    password: senha,
    email_confirm: true,
    user_metadata,
  } as Parameters<typeof supabase.auth.admin.createUser>[0]);

  if (
    createError &&
    !/already been registered|already exists/i.test(createError.message)
  ) {
    throw createError;
  }

  if (createError) {
    // Já existe: atualiza metadados e senha.
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      u.id,
      {
        password: senha,
        email_confirm: true,
        user_metadata,
      },
    );
    if (updateError) throw updateError;
    console.log(`  atualizado: ${u.email} (${u.papel})`);
  } else {
    console.log(`  criado:     ${u.email} (${u.papel})`);
  }

  // Garante o profile alinhado (o trigger cobre o create; o update reforça).
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: u.id,
      nome_completo: u.nome_completo,
      cpf: u.cpf,
      telefone_e164: u.telefone_e164,
      papel: u.papel,
      ativo: true,
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;
}

async function main() {
  console.log(`Criando usuários de seed (senha: "${senha}")...`);
  for (const u of USUARIOS) {
    await upsertUsuario(u);
  }
  console.log("\nUsuários de seed prontos:");
  console.table(
    USUARIOS.map((u) => ({ email: u.email, senha, papel: u.papel })),
  );
  console.log(
    "\nAgora rode as migrations + seed de dados:  supabase db reset  (ou npm run db:reset)",
  );
}

main().catch((err) => {
  console.error("Falha no seed-auth:", err);
  process.exit(1);
});
