# Templates de WhatsApp (HSM) — JJ Motors

> **Regra da Meta:** mensagens **proativas** (fora da janela de 24h após a última
> mensagem do cliente) só podem ser enviadas usando um **template HSM aprovado**
> pela Meta. Todas as notificações deste sistema são proativas, então **todos** os
> textos abaixo precisam ser submetidos e aprovados no WhatsApp Manager antes de
> `WHATSAPP_PROVIDER=meta` funcionar em produção.

Categoria sugerida na submissão: **UTILITY** (as mensagens são sobre o andamento
de um serviço já contratado pelo cliente — a compra programada). Idioma: `pt_BR`.

As variáveis são numeradas (`{{1}}`, `{{2}}`, ...). A ordem aqui é a ordem em que
`WhatsAppProvider.enviarTemplate({ variaveis })` deve enviá-las (Fase 6).

---

## 1. `novo_veiculo_elegivel`

**Quando:** um veículo entra no estoque como `disponivel` e o cliente já tem
saldo suficiente (regra 3.5, gatilho *a*).

**Corpo:**

```
Boa notícia, {{1}}! 🚗

Um {{2}} acabou de entrar no estoque da JJ Motors por {{3}}, e o seu saldo da
Compra Programada já cobre a entrada.

Entrada com seu saldo: {{4}}
Restante em promissória: {{5}}

Responda esta mensagem ou acesse o app para reservar. A reserva vale por {{6}}.
```

| Var | Conteúdo | Exemplo |
|-----|----------|---------|
| {{1}} | Primeiro nome do cliente | `Ana` |
| {{2}} | Marca + modelo + versão | `Volkswagen Gol 1.0 MPI` |
| {{3}} | Preço de venda | `R$ 38.000,00` |
| {{4}} | Saldo aplicado como entrada | `R$ 24.500,00` |
| {{5}} | Saldo a financiar | `R$ 13.500,00` |
| {{6}} | Prazo da reserva | `72 horas` |

---

## 2. `preco_reduzido`

**Quando:** o `preco_venda_centavos` de um veículo `disponivel` é reduzido e o
cliente passa a ser elegível (regra 3.5, gatilho *b*).

**Corpo:**

```
{{1}}, o preço baixou! 📉

O {{2}} que você acompanha agora custa {{3}} (antes {{4}}) e você já está
elegível para adquiri-lo pela Compra Programada.

Entrada com seu saldo: {{5}}
Restante em promissória: {{6}}

Acesse o app para reservar.
```

| Var | Conteúdo | Exemplo |
|-----|----------|---------|
| {{1}} | Primeiro nome | `Bruno` |
| {{2}} | Marca + modelo | `Chevrolet Onix` |
| {{3}} | Preço novo | `R$ 66.000,00` |
| {{4}} | Preço anterior | `R$ 69.000,00` |
| {{5}} | Entrada (saldo) | `R$ 34.000,00` |
| {{6}} | Saldo a financiar | `R$ 32.000,00` |

---

## 3. `veiculo_reaberto`

**Quando:** uma reserva expira e o veículo volta de `reservado` para
`disponivel` (regra 3.5, gatilho *c* — decisão A3: tipo próprio `reaberto`).

**Corpo:**

```
{{1}}, o {{2}} voltou a ficar disponível na JJ Motors. 🔄

Preço: {{3}}
Entrada com seu saldo: {{4}}
Restante em promissória: {{5}}

Se ainda tiver interesse, reserve pelo app — desta vez a prioridade é de quem
reservar primeiro.
```

| Var | Conteúdo | Exemplo |
|-----|----------|---------|
| {{1}} | Primeiro nome | `Ana` |
| {{2}} | Marca + modelo | `Jeep Renegade` |
| {{3}} | Preço | `R$ 129.000,00` |
| {{4}} | Entrada (saldo) | `R$ 65.000,00` |
| {{5}} | Saldo a financiar | `R$ 64.000,00` |

---

## 4. `reserva_expirando`

**Quando:** a reserva do cliente está a X horas de expirar (Fase 5/6).

**Corpo:**

```
{{1}}, sua reserva do {{2}} expira em {{3}}. ⏳

Para não perder a prioridade, finalize a proposta pelo app ou fale com um
consultor da JJ Motors.
```

| Var | Conteúdo | Exemplo |
|-----|----------|---------|
| {{1}} | Primeiro nome | `Carla` |
| {{2}} | Marca + modelo | `Fiat Argo` |
| {{3}} | Tempo restante | `12 horas` |

---

## 5. `lembrete_aporte`

**Quando:** aproxima-se o `dia_vencimento` do plano e o aporte do mês ainda não
foi registrado (Fase 6).

**Corpo:**

```
Olá, {{1}}! Passando para lembrar do seu aporte da Compra Programada.

Vencimento: dia {{2}}
Valor previsto: {{3}}
Saldo atual: {{4}}

Assim que o pagamento cair, envie o comprovante para a JJ Motors.
```

| Var | Conteúdo | Exemplo |
|-----|----------|---------|
| {{1}} | Primeiro nome | `Ana` |
| {{2}} | Dia do vencimento | `10` |
| {{3}} | Aporte mensal previsto | `R$ 3.000,00` |
| {{4}} | Saldo confirmado atual | `R$ 24.500,00` |

---

## Checklist de submissão na Meta

- [ ] App criado no [Meta for Developers](https://developers.facebook.com/) com o produto **WhatsApp**.
- [ ] Número de telefone verificado e com nome de exibição aprovado.
- [ ] Cada template acima cadastrado no **WhatsApp Manager → Modelos de mensagem**, categoria **UTILITY**, idioma **Português (BR)**.
- [ ] Nomes dos templates batendo EXATAMENTE com a coluna `template` da tabela `notificacoes` (`novo_veiculo_elegivel`, `preco_reduzido`, `veiculo_reaberto`, `reserva_expirando`, `lembrete_aporte`).
- [ ] Token permanente (System User) gerado e colocado em `WHATSAPP_TOKEN`.
- [ ] `WHATSAPP_PHONE_NUMBER_ID` preenchido.
- [ ] Teste de ponta a ponta com `WHATSAPP_PROVIDER=meta` para um número de teste.
