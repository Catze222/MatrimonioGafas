-- Fix RLS policies for asignaciones_mesas
-- Run this if you already executed the migration and are getting RLS errors

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to asignaciones_mesas" ON asignaciones_mesas;
DROP POLICY IF EXISTS "Allow authenticated full access to asignaciones_mesas" ON asignaciones_mesas;
DROP POLICY IF EXISTS "Allow full public access to asignaciones_mesas" ON asignaciones_mesas;

-- Create new permissive policy for all operations
CREATE POLICY "Allow full public access to asignaciones_mesas"
  ON asignaciones_mesas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'asignaciones_mesas';

