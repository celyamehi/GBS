-- ========================================
-- SCRIPT DE VÉRIFICATION SUPABASE
-- ========================================

-- Afficher toutes les tables de la base de données
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- VÉRIFICATION TABLE AGENTS
-- ========================================

-- Vérifier si la table agents existe et sa structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'agents' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Afficher le nombre d'agents et quelques exemples
SELECT 
    COUNT(*) as total_agents,
    STRING_AGG(nom, ', ' ORDER BY nom) as agents_list
FROM agents;

-- Afficher tous les agents avec détails
SELECT 
    id,
    nom,
    code_agent,
    projet,
    actif,
    created_at
FROM agents
ORDER BY nom;

-- ========================================
-- VÉRIFICATION TABLE ÉCOUTES
-- ========================================

-- Vérifier si la table ecoutes existe et sa structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'ecoutes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Afficher le nombre d'écoutes et statistiques
SELECT 
    COUNT(*) as total_ecoutes,
    COUNT(DISTINCT agent_id) as agents_with_ecoutes,
    COUNT(CASE WHEN rdv_qualite = true THEN 1 END) as rdv_qualite_count,
    COUNT(CASE WHEN rdv_honore = true THEN 1 END) as rdv_honores_count,
    COUNT(CASE WHEN rdv_honore = false THEN 1 END) as rdv_non_honores_count,
    COUNT(CASE WHEN rdv_honore IS NULL THEN 1 END) as rdv_en_attente_count,
    COUNT(CASE WHEN lien_audio IS NOT NULL AND lien_audio != '' THEN 1 END) as ecoutes_with_audio,
    COUNT(CASE WHEN numero_client IS NOT NULL AND numero_client != '' THEN 1 END) as ecoutes_with_numero_client,
    COUNT(CASE WHEN nom_client IS NOT NULL AND nom_client != '' THEN 1 END) as ecoutes_with_nom_client,
    MIN(date_rdv) as oldest_rdv,
    MAX(date_rdv) as newest_rdv
FROM ecoutes;

-- Afficher quelques écoutes récentes avec détails
SELECT 
    e.id,
    e.agent_id,
    a.nom as agent_nom,
    e.date_prise_rdv,
    e.date_rdv,
    e.statut_rdv,
    e.rdv_qualite,
    e.rdv_honore,
    e.note_globale,
    e.numero_client,
    e.nom_client,
    e.lien_audio IS NOT NULL as has_audio,
    e.created_at
FROM ecoutes e
LEFT JOIN agents a ON e.agent_id = a.id
ORDER BY e.created_at DESC
LIMIT 10;

-- ========================================
-- VÉRIFICATION BUCKETS STORAGE
-- ========================================

-- Afficher tous les buckets storage
SELECT 
    name,
    id,
    created_at,
    updated_at,
    public
FROM storage.buckets
ORDER BY name;

-- Afficher les fichiers dans le bucket audio-ecoutes (s'il existe)
SELECT 
    name,
    id,
    bucket_id,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects
WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'audio-ecoutes')
ORDER BY created_at DESC
LIMIT 10;

-- Compter les fichiers dans chaque bucket
SELECT 
    b.name as bucket_name,
    COUNT(o.id) as file_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
GROUP BY b.name, b.id
ORDER BY b.name;

-- ========================================
-- VÉRIFICATION POLITIQUES RLS
-- ========================================

-- Afficher les politiques RLS pour la table agents
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'agents'
ORDER BY policyname;

-- Afficher les politiques RLS pour la table ecoutes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'ecoutes'
ORDER BY policyname;

-- Afficher les politiques RLS pour les buckets storage
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename LIKE 'storage.objects%'
ORDER BY tablename, policyname;

-- ========================================
-- VÉRIFICATION INDEX
-- ========================================

-- Afficher les index sur la table agents
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'agents' 
    AND schemaname = 'public'
ORDER BY indexname;

-- Afficher les index sur la table ecoutes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'ecoutes' 
    AND schemaname = 'public'
ORDER BY indexname;

-- ========================================
-- VÉRIFICATION TRIGGERS
-- ========================================

-- Afficher les triggers sur la table agents
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'agents'
    AND trigger_schema = 'public';

-- Afficher les triggers sur la table ecoutes
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'ecoutes'
    AND trigger_schema = 'public';

-- ========================================
-- RÉSUMÉ
-- ========================================

-- Afficher un résumé de l'état actuel
SELECT 
    'TABLES' as type,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as count
UNION ALL
SELECT 
    'AGENTS' as type,
    COUNT(*) as count
FROM agents
UNION ALL
SELECT 
    'ECOUTES' as type,
    COUNT(*) as count
FROM ecoutes
UNION ALL
SELECT 
    'BUCKETS' as type,
    COUNT(*) as count
FROM storage.buckets
UNION ALL
SELECT 
    'POLICIES_RLS' as type,
    COUNT(*) as count
FROM pg_policies
UNION ALL
SELECT 
    'INDEX' as type,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public';
