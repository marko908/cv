/**
 * Typy wygenerowane ze schematu bazy Aplikando (projekt urjpluqutufsgkzysazq).
 *
 * PLIK GENEROWANY — nie edytuj ręcznie. Po każdej migracji odśwież go
 * z aktualnego stanu bazy (Supabase MCP `generate_typescript_types` albo
 * `npx supabase gen types typescript --project-id urjpluqutufsgkzysazq`).
 *
 * ⚠️ Blok `zgoda` / `rodzaj_zgody` (2026-08-05) jest dopisany RĘCZNIE, bo tunel
 * do Supabase w tamtej sesji nie miał uprawnień do zastosowania migracji
 * (`supabase/migrations/20260805103000_zgody.sql` istnieje, ale NIE została
 * jeszcze zastosowana do bazy). Zastosuj ją, a potem odśwież ten plik
 * normalnym poleceniem z akapitu wyżej — nadpisze ten ręczny wpis identyczną
 * treścią, więc regenerowanie jest bezpieczne.
 *
 * Uwaga: `tresc`, `cv_bazowe`, `cv_dopasowane` i `ai_meta` mają tu typ `Json`,
 * bo baza zna tylko JSONB. Prawdziwym kontraktem tych kolumn jest `TailoredCv`
 * i `AiMeta` — przy odczycie przepuszczaj je przez Zoda z `cv-schema.ts`,
 * a nie rzutuj na siłę.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cv: {
        Row: {
          id: string
          nazwa: string
          sekcje: string[]
          szablon: string
          tresc: Json
          updated_at: string
          user_id: string
          utworzono: string
        }
        Insert: {
          id?: string
          nazwa?: string
          sekcje?: string[]
          szablon?: string
          tresc: Json
          updated_at?: string
          user_id: string
          utworzono?: string
        }
        Update: {
          id?: string
          nazwa?: string
          sekcje?: string[]
          szablon?: string
          tresc?: Json
          updated_at?: string
          user_id?: string
          utworzono?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profil"
            referencedColumns: ["id"]
          },
        ]
      }
      dopasowanie: {
        Row: {
          ai_meta: Json
          cv_bazowe: Json
          cv_dopasowane: Json
          cv_id: string | null
          id: string
          korzen_id: string | null
          szablon: string
          tresc_oferty: string
          tytul_oferty: string
          url_oferty: string
          user_id: string
          utworzono: string
        }
        Insert: {
          ai_meta?: Json
          cv_bazowe: Json
          cv_dopasowane: Json
          cv_id?: string | null
          id?: string
          korzen_id?: string | null
          szablon?: string
          tresc_oferty?: string
          tytul_oferty?: string
          url_oferty?: string
          user_id: string
          utworzono?: string
        }
        Update: {
          ai_meta?: Json
          cv_bazowe?: Json
          cv_dopasowane?: Json
          cv_id?: string | null
          id?: string
          korzen_id?: string | null
          szablon?: string
          tresc_oferty?: string
          tytul_oferty?: string
          url_oferty?: string
          user_id?: string
          utworzono?: string
        }
        Relationships: [
          {
            foreignKeyName: "dopasowanie_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dopasowanie_korzen_id_fkey"
            columns: ["korzen_id"]
            isOneToOne: false
            referencedRelation: "dopasowanie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dopasowanie_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profil"
            referencedColumns: ["id"]
          },
        ]
      }
      profil: {
        Row: {
          email: string | null
          id: string
          stripe_customer_id: string | null
          updated_at: string
          utworzono: string
          zgoda_marketing: boolean
        }
        Insert: {
          email?: string | null
          id: string
          stripe_customer_id?: string | null
          updated_at?: string
          utworzono?: string
          zgoda_marketing?: boolean
        }
        Update: {
          email?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          utworzono?: string
          zgoda_marketing?: boolean
        }
        Relationships: []
      }
      subskrypcja: {
        Row: {
          anuluje_sie: boolean
          id: string
          koniec_okresu: string | null
          okres: Database["public"]["Enums"]["okres_rozliczeniowy"]
          plan: Database["public"]["Enums"]["plan_id"]
          status: Database["public"]["Enums"]["status_subskrypcji"]
          stripe_customer_id: string
          stripe_status: string | null
          stripe_subscription_id: string
          tryb_testowy: boolean
          updated_at: string
          user_id: string
          utworzono: string
        }
        Insert: {
          anuluje_sie?: boolean
          id?: string
          koniec_okresu?: string | null
          okres: Database["public"]["Enums"]["okres_rozliczeniowy"]
          plan: Database["public"]["Enums"]["plan_id"]
          status: Database["public"]["Enums"]["status_subskrypcji"]
          stripe_customer_id: string
          stripe_status?: string | null
          stripe_subscription_id: string
          tryb_testowy?: boolean
          updated_at?: string
          user_id: string
          utworzono?: string
        }
        Update: {
          anuluje_sie?: boolean
          id?: string
          koniec_okresu?: string | null
          okres?: Database["public"]["Enums"]["okres_rozliczeniowy"]
          plan?: Database["public"]["Enums"]["plan_id"]
          status?: Database["public"]["Enums"]["status_subskrypcji"]
          stripe_customer_id?: string
          stripe_status?: string | null
          stripe_subscription_id?: string
          tryb_testowy?: boolean
          updated_at?: string
          user_id?: string
          utworzono?: string
        }
        Relationships: [
          {
            foreignKeyName: "subskrypcja_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profil"
            referencedColumns: ["id"]
          },
        ]
      }
      zakup: {
        Row: {
          dopasowanie_id: string
          id: string
          kwota_grosze: number
          metoda: string | null
          status: Database["public"]["Enums"]["status_zakupu"]
          stripe_payment_intent_id: string
          tryb_testowy: boolean
          updated_at: string
          user_id: string
          utworzono: string
          waluta: string
        }
        Insert: {
          dopasowanie_id: string
          id?: string
          kwota_grosze: number
          metoda?: string | null
          status?: Database["public"]["Enums"]["status_zakupu"]
          stripe_payment_intent_id: string
          tryb_testowy?: boolean
          updated_at?: string
          user_id: string
          utworzono?: string
          waluta?: string
        }
        Update: {
          dopasowanie_id?: string
          id?: string
          kwota_grosze?: number
          metoda?: string | null
          status?: Database["public"]["Enums"]["status_zakupu"]
          stripe_payment_intent_id?: string
          tryb_testowy?: boolean
          updated_at?: string
          user_id?: string
          utworzono?: string
          waluta?: string
        }
        Relationships: [
          {
            foreignKeyName: "zakup_dopasowanie_id_fkey"
            columns: ["dopasowanie_id"]
            isOneToOne: false
            referencedRelation: "dopasowanie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zakup_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profil"
            referencedColumns: ["id"]
          },
        ]
      }
      zdarzenie_stripe: {
        Row: {
          blad: string | null
          id: string
          payload: Json | null
          przetworzono: string | null
          tryb_testowy: boolean
          typ: string
          utworzono: string
        }
        Insert: {
          blad?: string | null
          id: string
          payload?: Json | null
          przetworzono?: string | null
          tryb_testowy?: boolean
          typ: string
          utworzono?: string
        }
        Update: {
          blad?: string | null
          id?: string
          payload?: Json | null
          przetworzono?: string | null
          tryb_testowy?: boolean
          typ?: string
          utworzono?: string
        }
        Relationships: []
      }
      zgloszenie_bledu: {
        Row: {
          dopasowanie_id: string | null
          id: string
          kategoria: string
          obsluzone: boolean
          tresc: string
          user_id: string | null
          utworzono: string
        }
        Insert: {
          dopasowanie_id?: string | null
          id?: string
          kategoria: string
          obsluzone?: boolean
          tresc: string
          user_id?: string | null
          utworzono?: string
        }
        Update: {
          dopasowanie_id?: string | null
          id?: string
          kategoria?: string
          obsluzone?: boolean
          tresc?: string
          user_id?: string | null
          utworzono?: string
        }
        Relationships: [
          {
            foreignKeyName: "zgloszenie_bledu_dopasowanie_id_fkey"
            columns: ["dopasowanie_id"]
            isOneToOne: false
            referencedRelation: "dopasowanie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zgloszenie_bledu_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profil"
            referencedColumns: ["id"]
          },
        ]
      }
      zuzycie_ai: {
        Row: {
          dopasowanie_id: string | null
          etap: string
          id: string
          koszt_usd: number
          model: string
          tokeny_wejscie: number
          tokeny_wyjscie: number
          trwalo_ms: number | null
          user_id: string | null
          utworzono: string
        }
        Insert: {
          dopasowanie_id?: string | null
          etap: string
          id?: string
          koszt_usd?: number
          model: string
          tokeny_wejscie?: number
          tokeny_wyjscie?: number
          trwalo_ms?: number | null
          user_id?: string | null
          utworzono?: string
        }
        Update: {
          dopasowanie_id?: string | null
          etap?: string
          id?: string
          koszt_usd?: number
          model?: string
          tokeny_wejscie?: number
          tokeny_wyjscie?: number
          trwalo_ms?: number | null
          user_id?: string | null
          utworzono?: string
        }
        Relationships: [
          {
            foreignKeyName: "zuzycie_ai_dopasowanie_id_fkey"
            columns: ["dopasowanie_id"]
            isOneToOne: false
            referencedRelation: "dopasowanie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zuzycie_ai_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profil"
            referencedColumns: ["id"]
          },
        ]
      }
      zgoda: {
        Row: {
          id: string
          kontekst: string
          rodzaj: Database["public"]["Enums"]["rodzaj_zgody"]
          udzielono_o: string
          user_id: string | null
          utworzono: string
          wersja_dokumentow: string
        }
        Insert: {
          id?: string
          kontekst: string
          rodzaj: Database["public"]["Enums"]["rodzaj_zgody"]
          udzielono_o?: string
          user_id?: string | null
          utworzono?: string
          wersja_dokumentow: string
        }
        Update: {
          id?: string
          kontekst?: string
          rodzaj?: Database["public"]["Enums"]["rodzaj_zgody"]
          udzielono_o?: string
          user_id?: string | null
          utworzono?: string
          wersja_dokumentow?: string
        }
        Relationships: [
          {
            foreignKeyName: "zgoda_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profil"
            referencedColumns: ["id"]
          },
        ]
      }
      zuzycie_miesieczne: {
        Row: {
          dopasowania: number
          miesiac: string
          updated_at: string
          user_id: string
        }
        Insert: {
          dopasowania?: number
          miesiac: string
          updated_at?: string
          user_id: string
        }
        Update: {
          dopasowania?: number
          miesiac?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zuzycie_miesieczne_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profil"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      eksportuj_moje_dane: { Args: never; Returns: Json }
      klucz_miesiaca: { Args: never; Returns: string }
      ma_aktywna_subskrypcje: { Args: never; Returns: boolean }
      ma_dostep_do: { Args: { p_dopasowanie: string }; Returns: boolean }
      usun_moje_konto: { Args: never; Returns: undefined }
      zuzyj_dopasowanie: { Args: { p_limit: number }; Returns: number }
      zuzyto_w_tym_miesiacu: { Args: never; Returns: number }
    }
    Enums: {
      okres_rozliczeniowy: "miesiac" | "rok"
      plan_id: "start" | "pro"
      rodzaj_zgody: "regulamin_polityka" | "usluga_przed_odstapieniem"
      status_subskrypcji: "aktywna" | "zalega" | "anulowana"
      status_zakupu: "oczekuje" | "oplacony" | "nieudany" | "zwrocony"
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

export const Constants = {
  public: {
    Enums: {
      okres_rozliczeniowy: ["miesiac", "rok"],
      plan_id: ["start", "pro"],
      rodzaj_zgody: ["regulamin_polityka", "usluga_przed_odstapieniem"],
      status_subskrypcji: ["aktywna", "zalega", "anulowana"],
      status_zakupu: ["oczekuje", "oplacony", "nieudany", "zwrocony"],
    },
  },
} as const
