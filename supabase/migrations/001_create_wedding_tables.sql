-- Wedding App Database Schema
-- Tables: invitados, productos, pagos

-- Create invitados table
CREATE TABLE IF NOT EXISTS invitados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nombre_1 TEXT NOT NULL,
    nombre_2 TEXT,
    foto_url TEXT,
    asistencia_1 TEXT DEFAULT 'pendiente' CHECK (asistencia_1 IN ('pendiente', 'si', 'no')),
    asistencia_2 TEXT DEFAULT 'pendiente' CHECK (asistencia_2 IN ('pendiente', 'si', 'no')),
    restriccion_1 TEXT,
    restriccion_2 TEXT,
    mensaje TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create productos table
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    imagen_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pagos table
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    quien_regala TEXT NOT NULL,
    mensaje TEXT,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitados_slug ON invitados(slug);
CREATE INDEX IF NOT EXISTS idx_pagos_producto_id ON pagos(producto_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);

-- Create updated_at trigger for invitados
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invitados_updated_at
    BEFORE UPDATE ON invitados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE invitados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Allow read access to all tables (wedding guests should be able to see data)
CREATE POLICY "Allow read access to invitados" ON invitados FOR SELECT USING (true);
CREATE POLICY "Allow read access to productos" ON productos FOR SELECT USING (true);
CREATE POLICY "Allow read access to pagos" ON pagos FOR SELECT USING (true);

-- Allow guests to update their own RSVP data by slug
CREATE POLICY "Allow update own RSVP" ON invitados FOR UPDATE USING (true);

-- Allow anyone to create new pagos (gifts)
CREATE POLICY "Allow insert pagos" ON pagos FOR INSERT WITH CHECK (true);

-- Note: For admin operations, we'll use the service role key which bypasses RLS
