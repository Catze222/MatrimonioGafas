-- Migration: Add orden_display column to configuracion_mesas
-- This allows custom ordering of tables in the UI via drag & drop
-- Tables keep their original numero_mesa (1-23) but can be displayed in any order

-- Add orden_display column (defaults to numero_mesa for initial order)
ALTER TABLE configuracion_mesas 
ADD COLUMN orden_display INTEGER;

-- Set initial orden_display to match numero_mesa (1, 2, 3, ... 23)
UPDATE configuracion_mesas 
SET orden_display = numero_mesa;

-- Make it NOT NULL after setting values
ALTER TABLE configuracion_mesas 
ALTER COLUMN orden_display SET NOT NULL;

-- Add unique constraint to ensure no duplicate display orders
ALTER TABLE configuracion_mesas 
ADD CONSTRAINT configuracion_mesas_orden_display_unique UNIQUE (orden_display);

-- Add comment for documentation
COMMENT ON COLUMN configuracion_mesas.orden_display 
IS 'Custom display order for tables in the UI (can be reordered via drag & drop)';

