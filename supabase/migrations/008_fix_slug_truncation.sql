-- Migration 008: Fix slug truncation and remove 2025 suffix
-- Fixes the character cutting issue and removes unnecessary 2025

-- Update the normalize function to fix character truncation
CREATE OR REPLACE FUNCTION normalize_for_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Handle Spanish characters properly without removing letters
    RETURN lower(
        trim(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                regexp_replace(
                                    regexp_replace(
                                        regexp_replace(input_text, '[áàäâ]', 'a', 'g'),
                                        '[éèëê]', 'e', 'g'
                                    ),
                                    '[íìïî]', 'i', 'g'
                                ),
                                '[óòöô]', 'o', 'g'
                            ),
                            '[úùüû]', 'u', 'g'
                        ),
                        '[ñ]', 'n', 'g'
                    ),
                    '[^a-z0-9\s]', '', 'g'  -- Remove only special chars, keep all letters
                ),
                '\s+', ' ', 'g'  -- Normalize multiple spaces to single space
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Update slug generation to remove 2025 and fix truncation
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
        
        base_slug := first_name_1 || '-' || first_name_2;
    ELSE
        -- Single person: use first name + last name if available
        IF split_part(clean_name_1, ' ', 2) != '' AND length(split_part(clean_name_1, ' ', 2)) >= 2 THEN
            base_slug := first_name_1 || '-' || split_part(clean_name_1, ' ', 2);
        ELSE
            base_slug := first_name_1;
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

-- Update comments
COMMENT ON FUNCTION normalize_for_slug(TEXT) IS 'Normalizes Spanish text for URL-friendly slugs (fixed character truncation)';
COMMENT ON FUNCTION generate_unique_slug(TEXT, TEXT) IS 'Generates unique slugs like: ana-carlos, maria-garcia (no 2025 suffix)';
