"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { entrar, type EstadoLogin } from "./actions";

const ESTADO_INICIAL: EstadoLogin = {};

function BotaoEntrar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export function LoginForm() {
  const [estado, formAction] = useActionState(entrar, ESTADO_INICIAL);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {estado.erro && (
        <p role="alert" className="txt-pequeno text-ambar">
          {estado.erro}
        </p>
      )}

      <div className="pt-1">
        <BotaoEntrar />
      </div>
    </form>
  );
}
