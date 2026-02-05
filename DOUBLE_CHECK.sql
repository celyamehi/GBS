-- Vérification très précise de la table ecoutes
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'ecoutes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier si la table existe vraiment
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'ecoutes'
);

-- Afficher un échantillon des données pour voir les colonnes réelles
SELECT * FROM ecoutes LIMIT 1;
