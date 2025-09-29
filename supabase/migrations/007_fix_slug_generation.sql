-- Migration 007: Fix slug generation function
-- Properly handles Spanish names and prevents duplicates

-- Drop the problematic functions and trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON invitados;
DROP FUNCTION IF EXISTS auto_generate_slug();
DROP FUNCTION IF EXISTS generate_unique_slug(TEXT, TEXT);
DROP FUNCTION IF EXISTS clean_text_for_slug(TEXT);

-- Create function to normalize Spanish text for slugs
CREATE OR REPLACE FUNCTION normalize_for_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Handle Spanish characters and clean text
    RETURN lower(
        trim(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                regexp_replace(
                                    regexp_replace(input_text, '[áàäâ]', 'a', 'gi'),
                                    '[éèëê]', 'e', 'gi'
                                ),
                                '[íìïî]', 'i', 'gi'
                            ),
                            '[óòöô]', 'o', 'gi'
                        ),
                        '[úùüû]', 'u', 'gi'
                    ),
                    '[ñ]', 'n', 'gi'
                ),
                '[^a-z0-9\s]', '', 'g'  -- Remove special chars, keep letters/numbers/spaces
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Create improved slug generation function with duplicate handling
CREATE OR REPLACE FUNCTION generate_unique_slug(nombre_1 TEXT, nombre_2 TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
    clean_name_1 TEXT;
    clean_name_2 TEXT;
    first_name_1 TEXT;
    first_name_2 TEXT;
BEGIN
    -- Normalize names
    clean_name_1 := normalize_for_slug(nombre_1);
    first_name_1 := split_part(clean_name_1, ' ', 1);
    
    -- Handle empty or very short names
    IF length(first_name_1) < 2 THEN
        first_name_1 := 'invitado';
    END IF;
    
    IF nombre_2 IS NOT NULL AND nombre_2 != '' AND nombre_2 != 'Acompañante' THEN
        -- Two people: use both first names
        clean_name_2 := normalize_for_slug(nombre_2);
        first_name_2 := split_part(clean_name_2, ' ', 1);
        
        IF length(first_name_2) < 2 THEN
            first_name_2 := 'acompanante';
        END IF;
        
        base_slug := first_name_1 || '-' || first_name_2 || '-2025';
    ELSE
        -- Single person: use first name + last name if available
        IF split_part(clean_name_1, ' ', 2) != '' AND length(split_part(clean_name_1, ' ', 2)) >= 2 THEN
            base_slug := first_name_1 || '-' || split_part(clean_name_1, ' ', 2) || '-2025';
        ELSE
            base_slug := first_name_1 || '-2025';
        END IF;
    END IF;
    
    -- Clean up the base slug (remove extra spaces, multiple dashes)
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    final_slug := base_slug;
    
    -- Check for duplicates and add counter if needed
    WHILE EXISTS (SELECT 1 FROM invitados WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for auto-generation
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

-- Recreate the trigger
CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT ON invitados
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

-- Add comments for documentation
COMMENT ON FUNCTION normalize_for_slug(TEXT) IS 'Normalizes Spanish text for URL-friendly slugs';
COMMENT ON FUNCTION generate_unique_slug(TEXT, TEXT) IS 'Generates unique slugs like: ana-carlos-2025, maria-garcia-2025, with automatic duplicate handling';
COMMENT ON FUNCTION auto_generate_slug() IS 'Trigger function that auto-generates slug if not provided';
