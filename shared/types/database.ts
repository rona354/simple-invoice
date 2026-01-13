export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          business_name: string | null
          business_email: string | null
          business_phone: string | null
          business_address: string | null
          business_city: string | null
          business_country: string | null
          business_postal_code: string | null
          tax_id: string | null
          tax_id_label: string
          logo_url: string | null
          default_currency: string
          default_payment_terms: number
          default_tax_rate: number
          default_notes: string | null
          default_payment_instructions: string | null
          locale: string
          date_format: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name?: string | null
          business_email?: string | null
          business_phone?: string | null
          business_address?: string | null
          business_city?: string | null
          business_country?: string | null
          business_postal_code?: string | null
          tax_id?: string | null
          tax_id_label?: string
          logo_url?: string | null
          default_currency?: string
          default_payment_terms?: number
          default_tax_rate?: number
          default_notes?: string | null
          default_payment_instructions?: string | null
          locale?: string
          date_format?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string | null
          business_email?: string | null
          business_phone?: string | null
          business_address?: string | null
          business_city?: string | null
          business_country?: string | null
          business_postal_code?: string | null
          tax_id?: string | null
          tax_id_label?: string
          logo_url?: string | null
          default_currency?: string
          default_payment_terms?: number
          default_tax_rate?: number
          default_notes?: string | null
          default_payment_instructions?: string | null
          locale?: string
          date_format?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
          tax_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          tax_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          tax_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          invoice_number: string
          status: string
          client_name: string
          client_email: string | null
          client_phone: string | null
          client_address: string | null
          client_tax_id: string | null
          items: Json
          subtotal_cents: number
          discount_cents: number
          discount_type: string
          discount_value: number
          tax_rate: number
          tax_cents: number
          total_cents: number
          currency: string
          issue_date: string
          due_date: string | null
          paid_date: string | null
          sent_date: string | null
          viewed_date: string | null
          notes: string | null
          payment_instructions: string | null
          terms: string | null
          footer: string | null
          public_id: string
          public_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          invoice_number: string
          status?: string
          client_name: string
          client_email?: string | null
          client_phone?: string | null
          client_address?: string | null
          client_tax_id?: string | null
          items?: Json
          subtotal_cents?: number
          discount_cents?: number
          discount_type?: string
          discount_value?: number
          tax_rate?: number
          tax_cents?: number
          total_cents?: number
          currency?: string
          issue_date?: string
          due_date?: string | null
          paid_date?: string | null
          sent_date?: string | null
          viewed_date?: string | null
          notes?: string | null
          payment_instructions?: string | null
          terms?: string | null
          footer?: string | null
          public_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          invoice_number?: string
          status?: string
          client_name?: string
          client_email?: string | null
          client_phone?: string | null
          client_address?: string | null
          client_tax_id?: string | null
          items?: Json
          subtotal_cents?: number
          discount_cents?: number
          discount_type?: string
          discount_value?: number
          tax_rate?: number
          tax_cents?: number
          total_cents?: number
          currency?: string
          issue_date?: string
          due_date?: string | null
          paid_date?: string | null
          sent_date?: string | null
          viewed_date?: string | null
          notes?: string | null
          payment_instructions?: string | null
          terms?: string | null
          footer?: string | null
          public_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
