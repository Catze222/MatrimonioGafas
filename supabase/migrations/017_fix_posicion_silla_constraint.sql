-- Migration: Fix posicion_silla constraint to allow temporary positions for swap operations
-- This allows using positions 90-99 as temporary holding positions during swaps

-- Drop the old constraint that only allows 1-8
ALTER TABLE asignaciones_mesas 
DROP CONSTRAINT IF EXISTS asignaciones_mesas_posicion_silla_check;

-- Add new constraint that allows positions 1-8 (real) OR 90-99 (temporary)
ALTER TABLE asignaciones_mesas 
ADD CONSTRAINT asignaciones_mesas_posicion_silla_check 
CHECK ((posicion_silla >= 1 AND posicion_silla <= 8) OR (posicion_silla >= 90 AND posicion_silla <= 99));

-- Add comment for documentation
COMMENT ON CONSTRAINT asignaciones_mesas_posicion_silla_check ON asignaciones_mesas 
IS 'Allows chair positions 1-8 for real seating, and 90-99 as temporary holding positions for swap operations';

