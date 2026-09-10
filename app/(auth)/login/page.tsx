import { MarcaCompleta } from "@/components/logo-jj";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col gap-5">
          <MarcaCompleta />
          <h1 className="txt-titulo text-branco">Entrar no painel</h1>
        </div>
        <div className="mostrador p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
