-- Migration: Fix numero_mesa constraint to allow temporary mesa 999 for swap operations
-- This allows moving people to a temporary mesa during complex swap operations
-- to avoid duplicate key constraint violations

-- Drop the old constraint that only allows 1-23
ALTER TABLE asignaciones_mesas 
DROP CONSTRAINT IF EXISTS asignaciones_mesas_numero_mesa_check;

-- Add new constraint that allows mesa 1-23 OR mesa 999 (temporal)
ALTER TABLE asignaciones_mesas 
ADD CONSTRAINT asignaciones_mesas_numero_mesa_check 
CHECK ((numero_mesa >= 1 AND numero_mesa <= 23) OR numero_mesa = 999);

-- Add comment for documentation
COMMENT ON CONSTRAINT asignaciones_mesas_numero_mesa_check ON asignaciones_mesas 
IS 'Allows table numbers 1-23 for real tables, and 999 as temporary holding table for swap operations';

