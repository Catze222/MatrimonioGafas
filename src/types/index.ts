/**
 * TypeScript type definitions for the wedding app
 */

// Database types (matching Supabase schema)
export type Invitado = {
  id: string
  slug: string
  nombre_1: string
  nombre_2?: string | null
  foto_url?: string | null
  asistencia_1: 'pendiente' | 'si' | 'no'
  asistencia_2: 'pendiente' | 'si' | 'no'
  restriccion_1?: string | null
  restriccion_2?: string | null
  mensaje?: string | null
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
  mensaje?: string | null
  monto: number
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  created_at?: string
  // Include producto details when joining
  producto?: Producto
}

// Form types for user input
export type RSVPFormData = {
  asistencia_1: 'pendiente' | 'si' | 'no'
  asistencia_2: 'pendiente' | 'si' | 'no'
  restriccion_1?: string
  restriccion_2?: string
}

export type GiftFormData = {
  producto_id: string
  quien_regala: string
  mensaje?: string
  monto: number
}

export type AdminInvitadoForm = {
  nombre_1: string
  nombre_2?: string
  slug: string
  foto_url?: string
}

export type AdminProductoForm = {
  titulo: string
  descripcion: string
  imagen_url: string
}

// UI Component props
export type LoadingState = {
  loading: boolean
  error?: string | null
}

export type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

// API Response types
export type ApiResponse<T> = {
  data?: T
  error?: string
  success: boolean
}

// Admin authentication
export type AdminAuth = {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}
