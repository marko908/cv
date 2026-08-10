export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
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
          rola: string
          stripe_customer_id: string | null
          updated_at: string
          utworzono: string
          zgoda_marketing: boolean
        }
        Insert: {
          email?: string | null
          id: string
          rola?: string
          stripe_customer_id?: string | null
          updated_at?: string
          utworzono?: string
          zgoda_marketing?: boolean
        }
        Update: {
          email?: string | null
          id?: string
          rola?: string
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
      wpis_bloga: {
        Row: {
          canonical_url: string | null
          czas_czytania_min: number
          faq: Json
          id: string
          kategoria: string
          meta_opis: string | null
          meta_tytul: string | null
          okladka_alt: string | null
          okladka_url: string | null
          opublikowano_o: string | null
          slug: string
          status: string
          tagi: string[]
          token_podgladu: string | null
          tresc: string
          tytul: string
          updated_at: string
          utworzono: string
          zajawka: string | null
        }
        Insert: {
          canonical_url?: string | null
          czas_czytania_min?: number
          faq?: Json
          id?: string
          kategoria?: string
          meta_opis?: string | null
          meta_tytul?: string | null
          okladka_alt?: string | null
          okladka_url?: string | null
          opublikowano_o?: string | null
          slug: string
          status?: string
          tagi?: string[]
          token_podgladu?: string | null
          tresc: string
          tytul: string
          updated_at?: string
          utworzono?: string
          zajawka?: string | null
        }
        Update: {
          canonical_url?: string | null
          czas_czytania_min?: number
          faq?: Json
          id?: string
          kategoria?: string
          meta_opis?: string | null
          meta_tytul?: string | null
          okladka_alt?: string | null
          okladka_url?: string | null
          opublikowano_o?: string | null
          slug?: string
          status?: string
          tagi?: string[]
          token_podgladu?: string | null
          tresc?: string
          tytul?: string
          updated_at?: string
          utworzono?: string
          zajawka?: string | null
        }
        Relationships: []
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
      zuzycie_miesieczne: {
        Row: {
          darmowy_dopasowanie_id: string | null
          dopasowania: number
          miesiac: string
          updated_at: string
          user_id: string
        }
        Insert: {
          darmowy_dopasowanie_id?: string | null
          dopasowania?: number
          miesiac: string
          updated_at?: string
          user_id: string
        }
        Update: {
          darmowy_dopasowanie_id?: string | null
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
      czy_admin: { Args: never; Returns: boolean }
      eksportuj_moje_dane: { Args: never; Returns: Json }
      klucz_miesiaca: { Args: never; Returns: string }
      ma_aktywna_subskrypcje: { Args: never; Returns: boolean }
      ma_dostep_do: { Args: { p_dopasowanie: string }; Returns: boolean }
      usun_moje_konto: { Args: never; Returns: undefined }
      wpis_po_tokenie: {
        Args: { p_token: string }
        Returns: {
          canonical_url: string | null
          czas_czytania_min: number
          faq: Json
          id: string
          kategoria: string
          meta_opis: string | null
          meta_tytul: string | null
          okladka_alt: string | null
          okladka_url: string | null
          opublikowano_o: string | null
          slug: string
          status: string
          tagi: string[]
          token_podgladu: string | null
          tresc: string
          tytul: string
          updated_at: string
          utworzono: string
          zajawka: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "wpis_bloga"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      zuzyj_darmowe_dopasowanie: {
        Args: { p_dopasowanie: string }
        Returns: boolean
      }
      zuzyj_dopasowanie: { Args: { p_limit: number }; Returns: number }
      zuzyto_w_tym_miesiacu: { Args: never; Returns: number }
    }
    Enums: {
      okres_rozliczeniowy: "miesiac" | "rok"
      plan_id: "start" | "pro"
      rodzaj_zgody:
        | "regulamin_polityka"
        | "usluga_przed_odstapieniem"
        | "marketing"
        | "marketing_wycofanie"
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
      okres_rozliczeniowy: ["miesiac", "rok"],
      plan_id: ["start", "pro"],
      rodzaj_zgody: [
        "regulamin_polityka",
        "usluga_przed_odstapieniem",
        "marketing",
        "marketing_wycofanie",
      ],
      status_subskrypcji: ["aktywna", "zalega", "anulowana"],
      status_zakupu: ["oczekuje", "oplacony", "nieudany", "zwrocony"],
    },
  },
} as const
