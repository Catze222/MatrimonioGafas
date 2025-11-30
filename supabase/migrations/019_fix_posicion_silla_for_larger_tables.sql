-- Migration: Update posicion_silla constraint to support tables with 8, 9, or 10 chairs
-- Previous constraint only allowed positions 1-8 and 90-99 (temporary for swaps)
-- Now we need to allow 1-10 for regular positions, and 90-99 for temporary swap positions

-- Drop the old constraint
ALTER TABLE asignaciones_mesas 
DROP CONSTRAINT IF EXISTS asignaciones_mesas_posicion_silla_check;

-- Add new constraint that allows positions 1-10 (real chairs) OR 90-99 (temporary for swaps)
ALTER TABLE asignaciones_mesas 
ADD CONSTRAINT asignaciones_mesas_posicion_silla_check 
CHECK ((posicion_silla >= 1 AND posicion_silla <= 10) OR (posicion_silla >= 90 AND posicion_silla <= 99));

-- Add comment for documentation
COMMENT ON CONSTRAINT asignaciones_mesas_posicion_silla_check ON asignaciones_mesas 
IS 'Allows chair positions 1-10 for real seating (tables can have 8, 9, or 10 chairs), and 90-99 as temporary holding positions for swap operations';

