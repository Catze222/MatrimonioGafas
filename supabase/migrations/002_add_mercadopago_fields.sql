-- Add MercadoPago fields to pagos table
-- This migration adds fields to track MercadoPago payment information

ALTER TABLE pagos 
ADD COLUMN mercadopago_payment_id TEXT,
ADD COLUMN mercadopago_preference_id TEXT;
