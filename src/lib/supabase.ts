/**
 * Supabase client configuration for the wedding app
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Invitado = {
  id: string
  slug: string
  nombre_1: string
  nombre_2?: string
  foto_url?: string
  asistencia_1: 'pendiente' | 'si' | 'no'
  asistencia_2: 'pendiente' | 'si' | 'no'
  restriccion_1?: string
  restriccion_2?: string
  mensaje?: string
  de_quien?: 'jaime' | 'alejandra'
  invitacion_enviada?: boolean
  created_at?: string
  updated_at?: string
}

export type Producto = {
  id: string
  titulo: string
  descripcion: string
  imagen_url: string
  created_at?: string
}

export type Pago = {
  id: string
  producto_id: string
  quien_regala: string
  mensaje?: string
  monto: number
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  created_at?: string
}

export type ListaEspera = {
  id: string
  nombre_1: string
  nombre_2?: string
  de_quien: 'jaime' | 'alejandra'
  notas?: string
  prioridad: 'alta' | 'media' | 'baja'
  created_at?: string
}
