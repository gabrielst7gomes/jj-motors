export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      aportes: {
        Row: {
          comprovante_url: string | null
          confirmado_em: string | null
          confirmado_por: string | null
          criado_em: string
          data_competencia: string
          estorno_de_id: string | null
          id: string
          meio_pagamento: Database["public"]["Enums"]["meio_pagamento"]
          plano_id: string
          status: Database["public"]["Enums"]["status_aporte"]
          tipo: Database["public"]["Enums"]["tipo_aporte"]
          valor_centavos: number
        }
        Insert: {
          comprovante_url?: string | null
          confirmado_em?: string | null
          confirmado_por?: string | null
          criado_em?: string
          data_competencia?: string
          estorno_de_id?: string | null
          id?: string
          meio_pagamento?: Database["public"]["Enums"]["meio_pagamento"]
          plano_id: string
          status?: Database["public"]["Enums"]["status_aporte"]
          tipo?: Database["public"]["Enums"]["tipo_aporte"]
          valor_centavos: number
        }
        Update: {
          comprovante_url?: string | null
          confirmado_em?: string | null
          confirmado_por?: string | null
          criado_em?: string
          data_competencia?: string
          estorno_de_id?: string | null
          id?: string
          meio_pagamento?: Database["public"]["Enums"]["meio_pagamento"]
          plano_id?: string
          status?: Database["public"]["Enums"]["status_aporte"]
          tipo?: Database["public"]["Enums"]["tipo_aporte"]
          valor_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "aportes_confirmado_por_fkey"
            columns: ["confirmado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aportes_estorno_de_id_fkey"
            columns: ["estorno_de_id"]
            isOneToOne: false
            referencedRelation: "aportes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aportes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aportes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["plano_id"]
          },
          {
            foreignKeyName: "aportes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_saldo_cliente"
            referencedColumns: ["plano_id"]
          },
        ]
      }
      audit_log: {
        Row: {
          acao: string
          criado_em: string
          dados_antes: Json | null
          dados_depois: Json | null
          entidade: string
          entidade_id: string | null
          id: string
          ip: unknown
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade: string
          entidade_id?: string | null
          id?: string
          ip?: unknown
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade?: string
          entidade_id?: string | null
          id?: string
          ip?: unknown
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cargo_permissoes: {
        Row: {
          cargo_id: string
          permissao_chave: string
        }
        Insert: {
          cargo_id: string
          permissao_chave: string
        }
        Update: {
          cargo_id?: string
          permissao_chave?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargo_permissoes_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_permissoes_permissao_chave_fkey"
            columns: ["permissao_chave"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["chave"]
          },
        ]
      }
      cargos: {
        Row: {
          criado_em: string
          descricao: string | null
          id: string
          nome: string
          percentual_comissao: number
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
          percentual_comissao?: number
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
          percentual_comissao?: number
        }
        Relationships: []
      }
      catalogo_modelos: {
        Row: {
          ano_max: number | null
          ano_min: number | null
          ativo: boolean
          atualizado_em: string
          criado_em: string
          id: string
          marca: string
          modelo: string
          observacoes: string | null
        }
        Insert: {
          ano_max?: number | null
          ano_min?: number | null
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          marca: string
          modelo: string
          observacoes?: string | null
        }
        Update: {
          ano_max?: number | null
          ano_min?: number | null
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          marca?: string
          modelo?: string
          observacoes?: string | null
        }
        Relationships: []
      }
      comissoes: {
        Row: {
          criado_em: string
          id: string
          pago_em: string | null
          percentual: number
          plano_id: string
          preco_venda_centavos: number
          reserva_id: string | null
          status: string
          valor_centavos: number
          veiculo_id: string
          vendedor_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          pago_em?: string | null
          percentual: number
          plano_id: string
          preco_venda_centavos: number
          reserva_id?: string | null
          status?: string
          valor_centavos: number
          veiculo_id: string
          vendedor_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          pago_em?: string | null
          percentual?: number
          plano_id?: string
          preco_venda_centavos?: number
          reserva_id?: string | null
          status?: string
          valor_centavos?: number
          veiculo_id?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["plano_id"]
          },
          {
            foreignKeyName: "comissoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_saldo_cliente"
            referencedColumns: ["plano_id"]
          },
          {
            foreignKeyName: "comissoes_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["veiculo_id"]
          },
          {
            foreignKeyName: "comissoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_veiculos_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          atualizado_em: string
          chave: string
          descricao: string | null
          valor: string
        }
        Insert: {
          atualizado_em?: string
          chave: string
          descricao?: string | null
          valor: string
        }
        Update: {
          atualizado_em?: string
          chave?: string
          descricao?: string | null
          valor?: string
        }
        Relationships: []
      }
      negociacoes: {
        Row: {
          atualizado_em: string
          cliente_id: string
          criado_em: string
          id: string
          mensagem: string | null
          plano_id: string
          status: Database["public"]["Enums"]["status_negociacao"]
          veiculo_id: string
          vendedor_id: string | null
        }
        Insert: {
          atualizado_em?: string
          cliente_id: string
          criado_em?: string
          id?: string
          mensagem?: string | null
          plano_id: string
          status?: Database["public"]["Enums"]["status_negociacao"]
          veiculo_id: string
          vendedor_id?: string | null
        }
        Update: {
          atualizado_em?: string
          cliente_id?: string
          criado_em?: string
          id?: string
          mensagem?: string | null
          plano_id?: string
          status?: Database["public"]["Enums"]["status_negociacao"]
          veiculo_id?: string
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negociacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociacoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociacoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["plano_id"]
          },
          {
            foreignKeyName: "negociacoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_saldo_cliente"
            referencedColumns: ["plano_id"]
          },
          {
            foreignKeyName: "negociacoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociacoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["veiculo_id"]
          },
          {
            foreignKeyName: "negociacoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_veiculos_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociacoes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          agendado_para: string
          canal: Database["public"]["Enums"]["canal_notificacao"]
          cliente_id: string
          criado_em: string
          enviado_em: string | null
          erro: string | null
          id: string
          payload: Json
          provider_message_id: string | null
          status: Database["public"]["Enums"]["status_notificacao"]
          template: string
          tipo: Database["public"]["Enums"]["tipo_notificacao"]
          veiculo_id: string | null
        }
        Insert: {
          agendado_para?: string
          canal?: Database["public"]["Enums"]["canal_notificacao"]
          cliente_id: string
          criado_em?: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          payload?: Json
          provider_message_id?: string | null
          status?: Database["public"]["Enums"]["status_notificacao"]
          template: string
          tipo: Database["public"]["Enums"]["tipo_notificacao"]
          veiculo_id?: string | null
        }
        Update: {
          agendado_para?: string
          canal?: Database["public"]["Enums"]["canal_notificacao"]
          cliente_id?: string
          criado_em?: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          payload?: Json
          provider_message_id?: string | null
          status?: Database["public"]["Enums"]["status_notificacao"]
          template?: string
          tipo?: Database["public"]["Enums"]["tipo_notificacao"]
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["veiculo_id"]
          },
          {
            foreignKeyName: "notificacoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_veiculos_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes: {
        Row: {
          chave: string
          descricao: string
        }
        Insert: {
          chave: string
          descricao: string
        }
        Update: {
          chave?: string
          descricao?: string
        }
        Relationships: []
      }
      planos: {
        Row: {
          aporte_mensal_previsto_centavos: number
          cliente_id: string
          codigo: string
          criado_em: string
          data_adesao: string
          dia_vencimento: number
          id: string
          observacoes: string | null
          percentual_minimo: number
          status: Database["public"]["Enums"]["status_plano"]
          taxa_juros_mensal: number | null
          veiculo_alvo_id: string | null
          vendedor_id: string | null
        }
        Insert: {
          aporte_mensal_previsto_centavos?: number
          cliente_id: string
          codigo: string
          criado_em?: string
          data_adesao?: string
          dia_vencimento?: number
          id?: string
          observacoes?: string | null
          percentual_minimo?: number
          status?: Database["public"]["Enums"]["status_plano"]
          taxa_juros_mensal?: number | null
          veiculo_alvo_id?: string | null
          vendedor_id?: string | null
        }
        Update: {
          aporte_mensal_previsto_centavos?: number
          cliente_id?: string
          codigo?: string
          criado_em?: string
          data_adesao?: string
          dia_vencimento?: number
          id?: string
          observacoes?: string | null
          percentual_minimo?: number
          status?: Database["public"]["Enums"]["status_plano"]
          taxa_juros_mensal?: number | null
          veiculo_alvo_id?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_veiculo_alvo_id_fkey"
            columns: ["veiculo_alvo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_veiculo_alvo_id_fkey"
            columns: ["veiculo_alvo_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["veiculo_id"]
          },
          {
            foreignKeyName: "planos_veiculo_alvo_id_fkey"
            columns: ["veiculo_alvo_id"]
            isOneToOne: false
            referencedRelation: "vw_veiculos_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preferencias_veiculo: {
        Row: {
          ano_max: number | null
          ano_min: number | null
          ativa: boolean
          atualizado_em: string
          catalogo_modelo_id: string | null
          criado_em: string
          id: string
          marca: string
          modelo: string
          observacoes: string | null
          plano_id: string
          valor_meta_centavos: number | null
        }
        Insert: {
          ano_max?: number | null
          ano_min?: number | null
          ativa?: boolean
          atualizado_em?: string
          catalogo_modelo_id?: string | null
          criado_em?: string
          id?: string
          marca: string
          modelo: string
          observacoes?: string | null
          plano_id: string
          valor_meta_centavos?: number | null
        }
        Update: {
          ano_max?: number | null
          ano_min?: number | null
          ativa?: boolean
          atualizado_em?: string
          catalogo_modelo_id?: string | null
          criado_em?: string
          id?: string
          marca?: string
          modelo?: string
          observacoes?: string | null
          plano_id?: string
          valor_meta_centavos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_veiculo_catalogo_modelo_id_fkey"
            columns: ["catalogo_modelo_id"]
            isOneToOne: false
            referencedRelation: "catalogo_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferencias_veiculo_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferencias_veiculo_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["plano_id"]
          },
          {
            foreignKeyName: "preferencias_veiculo_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_saldo_cliente"
            referencedColumns: ["plano_id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          cargo_id: string | null
          cpf: string
          criado_em: string
          id: string
          nome_completo: string
          papel: Database["public"]["Enums"]["papel_usuario"]
          telefone_e164: string
        }
        Insert: {
          ativo?: boolean
          cargo_id?: string | null
          cpf: string
          criado_em?: string
          id: string
          nome_completo: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
          telefone_e164: string
        }
        Update: {
          ativo?: boolean
          cargo_id?: string | null
          cpf?: string
          criado_em?: string
          id?: string
          nome_completo?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
          telefone_e164?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          criado_em: string
          entrada_centavos: number
          id: string
          preco_veiculo_centavos: number
          qtd_parcelas: number
          reserva_id: string
          saldo_financiado_centavos: number
          status: Database["public"]["Enums"]["status_proposta"]
          taxa_juros_mensal: number
          valor_parcela_centavos: number
        }
        Insert: {
          criado_em?: string
          entrada_centavos: number
          id?: string
          preco_veiculo_centavos: number
          qtd_parcelas: number
          reserva_id: string
          saldo_financiado_centavos: number
          status?: Database["public"]["Enums"]["status_proposta"]
          taxa_juros_mensal?: number
          valor_parcela_centavos: number
        }
        Update: {
          criado_em?: string
          entrada_centavos?: number
          id?: string
          preco_veiculo_centavos?: number
          qtd_parcelas?: number
          reserva_id?: string
          saldo_financiado_centavos?: number
          status?: Database["public"]["Enums"]["status_proposta"]
          taxa_juros_mensal?: number
          valor_parcela_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas: {
        Row: {
          criado_em: string
          expira_em: string
          id: string
          plano_id: string
          status: Database["public"]["Enums"]["status_reserva"]
          veiculo_id: string
        }
        Insert: {
          criado_em?: string
          expira_em: string
          id?: string
          plano_id: string
          status?: Database["public"]["Enums"]["status_reserva"]
          veiculo_id: string
        }
        Update: {
          criado_em?: string
          expira_em?: string
          id?: string
          plano_id?: string
          status?: Database["public"]["Enums"]["status_reserva"]
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["plano_id"]
          },
          {
            foreignKeyName: "reservas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_saldo_cliente"
            referencedColumns: ["plano_id"]
          },
          {
            foreignKeyName: "reservas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["veiculo_id"]
          },
          {
            foreignKeyName: "reservas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_veiculos_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculo_fotos: {
        Row: {
          capa: boolean
          criado_em: string
          id: string
          ordem: number
          url: string
          veiculo_id: string
        }
        Insert: {
          capa?: boolean
          criado_em?: string
          id?: string
          ordem?: number
          url: string
          veiculo_id: string
        }
        Update: {
          capa?: boolean
          criado_em?: string
          id?: string
          ordem?: number
          url?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculo_fotos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculo_fotos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["veiculo_id"]
          },
          {
            foreignKeyName: "veiculo_fotos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_veiculos_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculo_precos_historico: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          id: string
          preco_anterior_centavos: number
          preco_novo_centavos: number
          veiculo_id: string
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          id?: string
          preco_anterior_centavos: number
          preco_novo_centavos: number
          veiculo_id: string
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          id?: string
          preco_anterior_centavos?: number
          preco_novo_centavos?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculo_precos_historico_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculo_precos_historico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculo_precos_historico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_elegibilidade"
            referencedColumns: ["veiculo_id"]
          },
          {
            foreignKeyName: "veiculo_precos_historico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "vw_veiculos_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano_fabricacao: number
          ano_modelo: number
          cambio: string | null
          chassi: string | null
          combustivel: string | null
          cor: string | null
          criado_em: string
          destaque: boolean
          id: string
          km: number
          marca: string
          modelo: string
          placa: string | null
          preco_custo_centavos: number | null
          preco_venda_centavos: number
          publicado_em: string | null
          renavam: string | null
          status: Database["public"]["Enums"]["status_veiculo"]
          versao: string | null
        }
        Insert: {
          ano_fabricacao: number
          ano_modelo: number
          cambio?: string | null
          chassi?: string | null
          combustivel?: string | null
          cor?: string | null
          criado_em?: string
          destaque?: boolean
          id?: string
          km?: number
          marca: string
          modelo: string
          placa?: string | null
          preco_custo_centavos?: number | null
          preco_venda_centavos: number
          publicado_em?: string | null
          renavam?: string | null
          status?: Database["public"]["Enums"]["status_veiculo"]
          versao?: string | null
        }
        Update: {
          ano_fabricacao?: number
          ano_modelo?: number
          cambio?: string | null
          chassi?: string | null
          combustivel?: string | null
          cor?: string | null
          criado_em?: string
          destaque?: boolean
          id?: string
          km?: number
          marca?: string
          modelo?: string
          placa?: string | null
          preco_custo_centavos?: number | null
          preco_venda_centavos?: number
          publicado_em?: string | null
          renavam?: string | null
          status?: Database["public"]["Enums"]["status_veiculo"]
          versao?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vw_elegibilidade: {
        Row: {
          cliente_id: string | null
          elegivel: boolean | null
          marca: string | null
          meta_centavos: number | null
          modelo: string | null
          percentual_minimo: number | null
          plano_codigo: string | null
          plano_id: string | null
          preco_venda_centavos: number | null
          saldo_confirmado_centavos: number | null
          valor_faltante_centavos: number | null
          veiculo_id: string | null
          versao: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_saldo_cliente: {
        Row: {
          cliente_id: string | null
          percentual_minimo: number | null
          plano_codigo: string | null
          plano_id: string | null
          saldo_confirmado_centavos: number | null
          saldo_pendente_centavos: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_veiculos_publico: {
        Row: {
          ano_fabricacao: number | null
          ano_modelo: number | null
          cambio: string | null
          combustivel: string | null
          cor: string | null
          criado_em: string | null
          destaque: boolean | null
          id: string | null
          km: number | null
          marca: string | null
          modelo: string | null
          placa_mascarada: string | null
          preco_venda_centavos: number | null
          publicado_em: string | null
          status: Database["public"]["Enums"]["status_veiculo"] | null
          versao: string | null
        }
        Insert: {
          ano_fabricacao?: number | null
          ano_modelo?: number | null
          cambio?: string | null
          combustivel?: string | null
          cor?: string | null
          criado_em?: string | null
          destaque?: boolean | null
          id?: string | null
          km?: number | null
          marca?: string | null
          modelo?: string | null
          placa_mascarada?: never
          preco_venda_centavos?: number | null
          publicado_em?: string | null
          status?: Database["public"]["Enums"]["status_veiculo"] | null
          versao?: string | null
        }
        Update: {
          ano_fabricacao?: number | null
          ano_modelo?: number | null
          cambio?: string | null
          combustivel?: string | null
          cor?: string | null
          criado_em?: string | null
          destaque?: boolean | null
          id?: string | null
          km?: number | null
          marca?: string | null
          modelo?: string | null
          placa_mascarada?: never
          preco_venda_centavos?: number | null
          publicado_em?: string | null
          status?: Database["public"]["Enums"]["status_veiculo"] | null
          versao?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      abrir_negociacao: {
        Args: { p_mensagem?: string; p_veiculo_id: string }
        Returns: {
          atualizado_em: string
          cliente_id: string
          criado_em: string
          id: string
          mensagem: string | null
          plano_id: string
          status: Database["public"]["Enums"]["status_negociacao"]
          veiculo_id: string
          vendedor_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "negociacoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      atualizar_status_negociacao: {
        Args: {
          p_negociacao_id: string
          p_status: Database["public"]["Enums"]["status_negociacao"]
        }
        Returns: {
          atualizado_em: string
          cliente_id: string
          criado_em: string
          id: string
          mensagem: string | null
          plano_id: string
          status: Database["public"]["Enums"]["status_negociacao"]
          veiculo_id: string
          vendedor_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "negociacoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      auth_papel: {
        Args: never
        Returns: Database["public"]["Enums"]["papel_usuario"]
      }
      converter_negociacao_em_venda: {
        Args: { p_negociacao_id: string }
        Returns: {
          criado_em: string
          id: string
          pago_em: string | null
          percentual: number
          plano_id: string
          preco_venda_centavos: number
          reserva_id: string | null
          status: string
          valor_centavos: number
          veiculo_id: string
          vendedor_id: string
        }
        SetofOptions: {
          from: "*"
          to: "comissoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      converter_reserva_em_venda: {
        Args: { p_reserva_id: string }
        Returns: {
          criado_em: string
          id: string
          pago_em: string | null
          percentual: number
          plano_id: string
          preco_venda_centavos: number
          reserva_id: string | null
          status: string
          valor_centavos: number
          veiculo_id: string
          vendedor_id: string
        }
        SetofOptions: {
          from: "*"
          to: "comissoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      criar_reserva: {
        Args: { p_veiculo_id: string }
        Returns: {
          criado_em: string
          expira_em: string
          id: string
          plano_id: string
          status: Database["public"]["Enums"]["status_reserva"]
          veiculo_id: string
        }
        SetofOptions: {
          from: "*"
          to: "reservas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      definir_preferencia_veiculo: {
        Args: {
          p_ano_max?: number
          p_ano_min?: number
          p_catalogo_modelo_id?: string
          p_marca?: string
          p_modelo?: string
          p_observacoes?: string
          p_valor_meta_centavos?: number
        }
        Returns: {
          ano_max: number | null
          ano_min: number | null
          ativa: boolean
          atualizado_em: string
          catalogo_modelo_id: string | null
          criado_em: string
          id: string
          marca: string
          modelo: string
          observacoes: string | null
          plano_id: string
          valor_meta_centavos: number | null
        }
        SetofOptions: {
          from: "*"
          to: "preferencias_veiculo"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      enfileirar_notificacoes_preferencia: {
        Args: { p_veiculo_id: string }
        Returns: number
      }
      enfileirar_notificacoes_veiculo: {
        Args: {
          p_template: string
          p_tipo: Database["public"]["Enums"]["tipo_notificacao"]
          p_veiculo_id: string
        }
        Returns: number
      }
      is_staff: { Args: never; Returns: boolean }
      is_vendedor: { Args: never; Returns: boolean }
      marcar_comissao_paga: {
        Args: { p_comissao_id: string }
        Returns: {
          criado_em: string
          id: string
          pago_em: string | null
          percentual: number
          plano_id: string
          preco_venda_centavos: number
          reserva_id: string | null
          status: string
          valor_centavos: number
          veiculo_id: string
          vendedor_id: string
        }
        SetofOptions: {
          from: "*"
          to: "comissoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      meta_centavos: {
        Args: { percentual_minimo: number; preco_venda_centavos: number }
        Returns: number
      }
      plano_e_meu: { Args: { p_plano_id: string }; Returns: boolean }
      remover_preferencia_veiculo: {
        Args: { p_preferencia_id: string }
        Returns: undefined
      }
      taxa_juros_do_plano: { Args: { p_plano_id: string }; Returns: number }
      tem_permissao: { Args: { p_permissao: string }; Returns: boolean }
      veiculo_e_publico: { Args: { p_veiculo_id: string }; Returns: boolean }
    }
    Enums: {
      canal_notificacao: "whatsapp"
      meio_pagamento: "pix" | "dinheiro" | "ted" | "cartao" | "outro"
      papel_usuario: "admin" | "operador" | "cliente" | "vendedor"
      status_aporte: "pendente" | "confirmado" | "rejeitado"
      status_negociacao: "nova" | "em_andamento" | "fechada" | "perdida"
      status_notificacao: "fila" | "enviada" | "entregue" | "lida" | "falha"
      status_plano: "ativo" | "suspenso" | "concluido" | "cancelado"
      status_proposta: "rascunho" | "aprovada" | "recusada" | "fechada"
      status_reserva: "ativa" | "expirada" | "convertida" | "cancelada"
      status_veiculo: "disponivel" | "reservado" | "vendido" | "inativo"
      tipo_aporte: "aporte" | "estorno" | "taxa" | "ajuste"
      tipo_notificacao:
        | "novo_elegivel"
        | "preco_reduzido"
        | "reaberto"
        | "reserva_expirando"
        | "lembrete_aporte"
        | "preferencia_disponivel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      canal_notificacao: ["whatsapp"],
      meio_pagamento: ["pix", "dinheiro", "ted", "cartao", "outro"],
      papel_usuario: ["admin", "operador", "cliente", "vendedor"],
      status_aporte: ["pendente", "confirmado", "rejeitado"],
      status_negociacao: ["nova", "em_andamento", "fechada", "perdida"],
      status_notificacao: ["fila", "enviada", "entregue", "lida", "falha"],
      status_plano: ["ativo", "suspenso", "concluido", "cancelado"],
      status_proposta: ["rascunho", "aprovada", "recusada", "fechada"],
      status_reserva: ["ativa", "expirada", "convertida", "cancelada"],
      status_veiculo: ["disponivel", "reservado", "vendido", "inativo"],
      tipo_aporte: ["aporte", "estorno", "taxa", "ajuste"],
      tipo_notificacao: [
        "novo_elegivel",
        "preco_reduzido",
        "reaberto",
        "reserva_expirando",
        "lembrete_aporte",
        "preferencia_disponivel",
      ],
    },
  },
} as const

