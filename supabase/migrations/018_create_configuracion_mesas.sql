-- Migration: Create table for table configuration (capacity settings)
-- Allows flexible table sizes (8, 9, or 10 people per table)

CREATE TABLE IF NOT EXISTS configuracion_mesas (
  numero_mesa INTEGER PRIMARY KEY CHECK (numero_mesa >= 1 AND numero_mesa <= 23),
  capacidad INTEGER NOT NULL DEFAULT 8 CHECK (capacidad >= 1 AND capacidad <= 10),
  nombre_mesa TEXT, -- Optional: custom name like "Mesa Principal", "VIP", etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Populate with default configuration: 23 tables with 8 people capacity each
INSERT INTO configuracion_mesas (numero_mesa, capacidad)
SELECT generate_series(1, 23), 8;

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER trigger_update_configuracion_mesas_updated_at
  BEFORE UPDATE ON configuracion_mesas
  FOR EACH ROW
  EXECUTE FUNCTION update_asignaciones_mesas_updated_at(); -- Reuse existing function

-- Enable Row Level Security
ALTER TABLE configuracion_mesas ENABLE ROW LEVEL SECURITY;

-- Policy: Allow full public access (admin operations)
CREATE POLICY "Allow full public access to configuracion_mesas"
  ON configuracion_mesas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE configuracion_mesas IS 'Configuration for wedding tables - stores capacity (8, 9, or 10) for each table';
COMMENT ON COLUMN configuracion_mesas.capacidad IS 'Table capacity (8, 9, or 10 people)';

