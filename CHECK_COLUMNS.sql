-- Vérifier les noms exacts des colonnes dans la table ecoutes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ecoutes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
