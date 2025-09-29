-- Migration 011: Fix encoding issues in names
-- Fixes characters like Ã¡ → á, Ã© → é, etc.

-- Function to fix encoding issues
CREATE OR REPLACE FUNCTION fix_encoding(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN regexp_replace(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                regexp_replace(
                                    regexp_replace(
                                        regexp_replace(input_text, 'Ã¡', 'á', 'g'),
                                        'Ã©', 'é', 'g'
                                    ),
                                    'Ã­', 'í', 'g'
                                ),
                                'Ã³', 'ó', 'g'
                            ),
                            'Ãº', 'ú', 'g'
                        ),
                        'Ã±', 'ñ', 'g'
                    ),
                    'Ã¬', 'í', 'g'  -- For MarÃ¬a → María
                ),
                'Ã ', 'à', 'g'
            ),
            'Ã¨', 'è', 'g'
        ),
        'Ã²', 'ò', 'g'
    );
END;
$$ LANGUAGE plpgsql;

-- Update existing records to fix encoding
UPDATE invitados SET 
    nombre_1 = fix_encoding(nombre_1),
    nombre_2 = fix_encoding(nombre_2)
WHERE nombre_1 LIKE '%Ã%' OR nombre_2 LIKE '%Ã%';

-- Update the slug generation to handle encoding
CREATE OR REPLACE FUNCTION clean_name_simple(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- First fix encoding, then convert to lowercase and clean
    RETURN regexp_replace(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                lower(trim(fix_encoding(input_text))),  -- Fix encoding first
                                '[áàäâ]', 'a', 'g'
                            ),
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
        '[^a-z0-9\s]', '', 'g'
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fix_encoding(TEXT) IS 'Fixes encoding issues like Ã¡ → á, Ã© → é';
