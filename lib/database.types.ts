/**
 * Tipos gerados do schema do banco.
 *
 * Este arquivo é um PLACEHOLDER. Gere o conteúdo real com:
 *
 *   npm run db:types
 *
 * (equivale a: supabase gen types typescript --local > lib/database.types.ts)
 *
 * Ele é regravado a cada mudança de migration e NÃO deve ser editado à mão.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
