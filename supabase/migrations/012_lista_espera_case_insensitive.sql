-- Migration 012: Allow case insensitive de_quien in lista_espera
-- Updates constraint to accept both 'jaime'/'Jaime' and 'alejandra'/'Alejandra'

-- Drop existing constraint
ALTER TABLE lista_espera DROP CONSTRAINT IF EXISTS lista_espera_de_quien_check;

-- Add new constraint that accepts both cases
ALTER TABLE lista_espera 
ADD CONSTRAINT lista_espera_de_quien_check 
CHECK (de_quien IN ('jaime', 'alejandra', 'Jaime', 'Alejandra'));

-- Also update prioridad constraint to be more flexible (optional)
ALTER TABLE lista_espera DROP CONSTRAINT IF EXISTS lista_espera_prioridad_check;

ALTER TABLE lista_espera 
ADD CONSTRAINT lista_espera_prioridad_check 
CHECK (prioridad IN ('alta', 'media', 'baja', 'Alta', 'Media', 'Baja'));

-- Update schema documentation
COMMENT ON TABLE lista_espera IS 'Waiting list table - accepts case insensitive de_quien and prioridad values';
