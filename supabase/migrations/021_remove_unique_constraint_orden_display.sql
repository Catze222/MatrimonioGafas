-- Migration: Remove unique constraint from orden_display
-- The unique constraint causes slow updates because we need to do 2-step process
-- It's not critical to have unique orden_display - we can handle duplicates in the app

-- Drop the unique constraint
ALTER TABLE configuracion_mesas 
DROP CONSTRAINT IF EXISTS configuracion_mesas_orden_display_unique;

-- Add comment
COMMENT ON COLUMN configuracion_mesas.orden_display 
IS 'Display order for tables (reorderable via drag & drop, not strictly unique)';

