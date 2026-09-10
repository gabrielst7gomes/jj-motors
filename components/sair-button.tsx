"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { sair } from "@/app/(auth)/login/actions";

export function SairButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="fantasma"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => sair())}
    >
      <LogOut />
      Sair
    </Button>
  );
}
