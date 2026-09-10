"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ModeloCatalogoForm } from "./modelo-form";

export function NovoModeloCatalogo() {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <Button onClick={() => setAberto(true)} className="w-full sm:w-auto">
        Adicionar modelo
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <ModeloCatalogoForm onConcluido={() => setAberto(false)} />
      </CardContent>
    </Card>
  );
}
