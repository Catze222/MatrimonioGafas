-- Migration: Create table for wedding table assignments (seating chart)
-- This table manages the distribution of guests across 23 tables (8 people each)

CREATE TABLE IF NOT EXISTS asignaciones_mesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitado_id UUID NOT NULL REFERENCES invitados(id) ON DELETE CASCADE,
  numero_mesa INTEGER NOT NULL CHECK (numero_mesa >= 1 AND numero_mesa <= 23),
  posicion_silla INTEGER NOT NULL CHECK (posicion_silla >= 1 AND posicion_silla <= 8),
  persona_index INTEGER NOT NULL CHECK (persona_index IN (1, 2)),
  nombre_persona TEXT NOT NULL,
  acompanante_id UUID REFERENCES asignaciones_mesas(id) ON DELETE SET NULL,
  restriccion_alimentaria TEXT,
  color_pareja TEXT CHECK (color_pareja IN ('blue', 'green', 'purple', 'pink')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique position per table
  UNIQUE(numero_mesa, posicion_silla),
  
  -- Ensure each person from invitado is only assigned once
  UNIQUE(invitado_id, persona_index)
);

-- Create indexes for better query performance
CREATE INDEX idx_asignaciones_numero_mesa ON asignaciones_mesas(numero_mesa);
CREATE INDEX idx_asignaciones_invitado_id ON asignaciones_mesas(invitado_id);
CREATE INDEX idx_asignaciones_acompanante_id ON asignaciones_mesas(acompanante_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_asignaciones_mesas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_asignaciones_mesas_updated_at
  BEFORE UPDATE ON asignaciones_mesas
  FOR EACH ROW
  EXECUTE FUNCTION update_asignaciones_mesas_updated_at();

-- Enable Row Level Security
ALTER TABLE asignaciones_mesas ENABLE ROW LEVEL SECURITY;

-- Policy: Allow full public access (admin operations)
-- Note: Admin panel uses client-side auth, so we allow public access
-- Real security is handled by admin password authentication in the app
CREATE POLICY "Allow full public access to asignaciones_mesas"
  ON asignaciones_mesas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE asignaciones_mesas IS 'Wedding table seating assignments - manages distribution of guests across 23 tables (8 people each)';
COMMENT ON COLUMN asignaciones_mesas.numero_mesa IS 'Table number (1-23)';
COMMENT ON COLUMN asignaciones_mesas.posicion_silla IS 'Chair position in circular table (1-8, starting from top clockwise)';
COMMENT ON COLUMN asignaciones_mesas.persona_index IS 'Which person from invitado record (1 or 2)';
COMMENT ON COLUMN asignaciones_mesas.acompanante_id IS 'Reference to companion record for visual pairing';
COMMENT ON COLUMN asignaciones_mesas.color_pareja IS 'Color code for visual couple identification (blue/green/purple/pink)';

