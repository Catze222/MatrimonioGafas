-- Migration 010: Fix uppercase to lowercase conversion
-- Ensure all uppercase letters are properly converted to lowercase

-- Updated function with better lowercase conversion
CREATE OR REPLACE FUNCTION clean_name_simple(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- First convert to lowercase, then handle accents and special chars
    RETURN regexp_replace(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                lower(trim(input_text)),  -- Convert to lowercase first
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
        '[^a-z0-9\s]', '', 'g'  -- Remove special chars, keep only lowercase letters, numbers and spaces
    );
END;
$$ LANGUAGE plpgsql;

-- Test the function (you can run this to verify it works)
-- SELECT clean_name_simple('PABLO SCHLESINGER') as test1;
-- SELECT clean_name_simple('José María GONZÁLEZ') as test2;
-- Expected: pablo schlesinger, jose maria gonzalez

COMMENT ON FUNCTION clean_name_simple(TEXT) IS 'Converts to lowercase and cleans names for slugs - handles uppercase properly';
