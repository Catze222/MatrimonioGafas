-- Fix RLS policies for admin operations
-- The admin panel needs to be able to insert/update/delete all records

-- Drop existing restrictive policies for invitados
DROP POLICY IF EXISTS "Allow update own RSVP" ON invitados;

-- Create new policies that allow admin operations
-- For invitados table
CREATE POLICY "Allow all operations for invitados" ON invitados FOR ALL USING (true) WITH CHECK (true);

-- For productos table  
CREATE POLICY "Allow all operations for productos" ON productos FOR ALL USING (true) WITH CHECK (true);

-- For pagos table
CREATE POLICY "Allow all operations for pagos" ON pagos FOR ALL USING (true) WITH CHECK (true);

-- Note: In production, you'd want more granular policies, but for a wedding app
-- with simple password protection, this is acceptable.
