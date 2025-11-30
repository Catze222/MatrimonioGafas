-- Fix constraint to allow temporary mesa 999 for swaps
-- This allows moving people to a temporary mesa during swap operations

-- Drop the old constraint
ALTER TABLE asignaciones_mesas 
DROP CONSTRAINT IF EXISTS asignaciones_mesas_numero_mesa_check;

-- Add new constraint that allows mesa 999 as temporary
ALTER TABLE asignaciones_mesas 
ADD CONSTRAINT asignaciones_mesas_numero_mesa_check 
CHECK (numero_mesa >= 1 AND numero_mesa <= 23 OR numero_mesa = 999);

-- Verify
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'asignaciones_mesas'::regclass 
AND conname LIKE '%numero_mesa%';

