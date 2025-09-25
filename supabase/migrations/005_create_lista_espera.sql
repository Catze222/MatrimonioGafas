-- Migration 005: Create lista_espera table
-- Table for managing guests in waiting list before converting to official invitados

-- Create lista_espera table
CREATE TABLE lista_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_1 TEXT NOT NULL,
  nombre_2 TEXT,
  de_quien TEXT NOT NULL CHECK (de_quien IN ('jaime', 'alejandra')),
  notas TEXT,
  prioridad TEXT NOT NULL DEFAULT 'media' CHECK (prioridad IN ('alta', 'media', 'baja')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_lista_espera_de_quien ON lista_espera(de_quien);
CREATE INDEX idx_lista_espera_prioridad ON lista_espera(prioridad);
CREATE INDEX idx_lista_espera_created_at ON lista_espera(created_at);

-- Row Level Security (RLS)
ALTER TABLE lista_espera ENABLE ROW LEVEL SECURITY;

-- Policies for lista_espera table
-- Public read access (guests can see waiting list if needed)
CREATE POLICY "Public read access for lista_espera" ON lista_espera
FOR SELECT USING (true);

-- Admin operations use service role key which bypasses RLS
-- So no additional policies needed for admin operations
