import { MarcaCompleta } from "@/components/logo-jj";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-6">
          <MarcaCompleta />
          <p className="txt-pequeno text-cinza-texto">
            Entre com seu e-mail e senha.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
