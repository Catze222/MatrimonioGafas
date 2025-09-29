-- Migration 009: Simple full names slug generation
-- Just use full names, no creativity, no 2025, no truncation

-- Simple function to clean names for slugs
CREATE OR REPLACE FUNCTION clean_name_simple(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Just convert to lowercase, replace spaces with dashes, remove special chars
    RETURN lower(
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
            '[^a-z0-9\s]', '', 'g'  -- Remove special chars
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Simple slug generation with full names
CREATE OR REPLACE FUNCTION generate_unique_slug(nombre_1 TEXT, nombre_2 TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
    clean_name_1 TEXT;
    clean_name_2 TEXT;
BEGIN
    -- Clean first name (full name, not just first word)
    clean_name_1 := clean_name_simple(nombre_1);
    clean_name_1 := regexp_replace(clean_name_1, '\s+', '-', 'g');  -- spaces to dashes
    clean_name_1 := regexp_replace(clean_name_1, '-+', '-', 'g');   -- multiple dashes to single
    clean_name_1 := trim(clean_name_1, '-');                       -- remove leading/trailing dashes
    
    -- If there's a second person and it's not "Acompañante"
    IF nombre_2 IS NOT NULL AND nombre_2 != '' AND nombre_2 != 'Acompañante' THEN
        clean_name_2 := clean_name_simple(nombre_2);
        clean_name_2 := regexp_replace(clean_name_2, '\s+', '-', 'g');
        clean_name_2 := regexp_replace(clean_name_2, '-+', '-', 'g');
        clean_name_2 := trim(clean_name_2, '-');
        
        base_slug := clean_name_1 || '-' || clean_name_2;
    ELSE
        -- Just the first person's full name
        base_slug := clean_name_1;
    END IF;
    
    -- Clean up final slug
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    final_slug := base_slug;
    
    -- Handle duplicates by adding number
    WHILE EXISTS (SELECT 1 FROM invitados WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update trigger function (keep the same)
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

-- Update comments
COMMENT ON FUNCTION clean_name_simple(TEXT) IS 'Simple name cleaning for slugs - full names, no truncation';
COMMENT ON FUNCTION generate_unique_slug(TEXT, TEXT) IS 'Generates slugs with full names: pablo-schlesinger, joe-bonilla-paola-moncaleano';
COMMENT ON FUNCTION auto_generate_slug() IS 'Trigger function that auto-generates slug if not provided';
