-- Migration 006: Auto-generate slugs and allow capitalized names
-- Adds automatic slug generation and updates de_quien constraint

-- First, drop the existing constraint
ALTER TABLE invitados DROP CONSTRAINT IF EXISTS invitados_de_quien_check;

-- Add new constraint that accepts both lowercase and capitalized
ALTER TABLE invitados 
ADD CONSTRAINT invitados_de_quien_check 
CHECK (de_quien IN ('jaime', 'alejandra', 'Jaime', 'Alejandra'));

-- Function to clean and normalize text for slugs
CREATE OR REPLACE FUNCTION clean_text_for_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(input_text, '[áàäâ]', 'a', 'gi'),
                '[éèëê]', 'e', 'gi'
            ),
            regexp_replace(
                regexp_replace(
                    regexp_replace(input_text, '[íìïî]', 'i', 'gi'),
                    '[óòöô]', 'o', 'gi'
                ),
                '[úùüû]', 'u', 'gi'
            ),
            'gi'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique slug automatically
CREATE OR REPLACE FUNCTION generate_unique_slug(nombre_1 TEXT, nombre_2 TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
    clean_nombre_1 TEXT;
    clean_nombre_2 TEXT;
BEGIN
    -- Clean and prepare names
    clean_nombre_1 := clean_text_for_slug(split_part(nombre_1, ' ', 1)); -- First name only
    
    IF nombre_2 IS NOT NULL AND nombre_2 != '' THEN
        clean_nombre_2 := clean_text_for_slug(split_part(nombre_2, ' ', 1)); -- First name only
        base_slug := clean_nombre_1 || '-' || clean_nombre_2 || '-2025';
    ELSE
        -- Get first name and first lastname
        clean_nombre_2 := clean_text_for_slug(split_part(nombre_1, ' ', 2));
        IF clean_nombre_2 != '' THEN
            base_slug := clean_nombre_1 || '-' || clean_nombre_2 || '-2025';
        ELSE
            base_slug := clean_nombre_1 || '-2025';
        END IF;
    END IF;
    
    final_slug := base_slug;
    
    -- Check if slug exists and add counter if needed
    WHILE EXISTS (SELECT 1 FROM invitados WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate slug before insert
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate slug if it's not provided or is empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_unique_slug(NEW.nombre_1, NEW.nombre_2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto slug generation
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON invitados;
CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT ON invitados
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

-- Update schema documentation
COMMENT ON FUNCTION generate_unique_slug(TEXT, TEXT) IS 'Generates unique slug from names: ana-carlos-2025, maria-garcia-2025, etc.';
COMMENT ON FUNCTION auto_generate_slug() IS 'Trigger function that auto-generates slug if not provided';
