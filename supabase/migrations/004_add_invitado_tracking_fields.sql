-- Migration 004: Add tracking fields to invitados table
-- Adds fields for invitation management and WhatsApp tracking

-- Add de_quien field to track whose guest this is
ALTER TABLE invitados 
ADD COLUMN de_quien TEXT CHECK (de_quien IN ('jaime', 'alejandra'));

-- Add invitacion_enviada field to track invitation sending status
ALTER TABLE invitados 
ADD COLUMN invitacion_enviada BOOLEAN DEFAULT FALSE;

-- Create index for filtering by de_quien
CREATE INDEX idx_invitados_de_quien ON invitados(de_quien);

-- Create index for filtering by invitation status
CREATE INDEX idx_invitados_invitacion_enviada ON invitados(invitacion_enviada);
