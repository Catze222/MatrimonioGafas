-- Add email field to pagos table for sending thank you emails
-- Migration: 013_add_email_to_pagos.sql

-- Add email column to pagos table
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index for email field for better performance
CREATE INDEX IF NOT EXISTS idx_pagos_email ON pagos(email);

-- Update schema documentation comment
COMMENT ON COLUMN pagos.email IS 'Email address of the contributor for sending thank you emails';
