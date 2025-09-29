-- Test script to verify slug generation is working correctly
-- Run this after applying migration 007

-- Test the normalize function
SELECT 
    'José María' as original,
    normalize_for_slug('José María') as normalized;

-- Test the slug generation function
SELECT 
    'Pablo Schlesinger' as nombre_1,
    'Acompañante' as nombre_2,
    generate_unique_slug('Pablo Schlesinger', 'Acompañante') as generated_slug;

SELECT 
    'Joe Bonilla' as nombre_1,
    'Paola Moncaleano' as nombre_2,
    generate_unique_slug('Joe Bonilla', 'Paola Moncaleano') as generated_slug;

SELECT 
    'Valentina Rubio' as nombre_1,
    NULL as nombre_2,
    generate_unique_slug('Valentina Rubio', NULL) as generated_slug;

-- Expected results:
-- pablo-schlesinger (not pablo-acompanante since Acompañante is handled specially)
-- joe-paola
-- valentina-rubio
