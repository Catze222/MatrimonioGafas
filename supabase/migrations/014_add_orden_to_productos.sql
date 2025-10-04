-- Add 'orden' column to productos table for custom sorting
-- This allows manual ordering of gift products

ALTER TABLE productos 
ADD COLUMN orden INTEGER;

-- Set default values based on current order (by created_at)
WITH ordered_productos AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM productos
)
UPDATE productos 
SET orden = ordered_productos.row_num
FROM ordered_productos
WHERE productos.id = ordered_productos.id;

-- Make orden NOT NULL after setting values
ALTER TABLE productos 
ALTER COLUMN orden SET NOT NULL;

-- Add index for better query performance
CREATE INDEX idx_productos_orden ON productos(orden);

-- Add comment
COMMENT ON COLUMN productos.orden IS 'Manual sort order for displaying products (lower number = higher priority)';

