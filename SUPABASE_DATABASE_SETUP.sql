-- ========================================
-- SCRIPT DE CRÉATION DES TABLES SUPABASE
-- ========================================

-- Activer l'extension UUID si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE DES AGENTS
-- ========================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    code_agent VARCHAR(50) NOT NULL UNIQUE,
    projet VARCHAR(100) NOT NULL,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABLE DES ÉCOUTES
-- ========================================
CREATE TABLE IF NOT EXISTS ecoutes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    lien_audio TEXT,
    audio_data TEXT, -- Gardé pour compatibilité mais ne plus utiliser
    audio_name TEXT,
    date_prise_rdv DATE NOT NULL,
    date_rdv DATE NOT NULL,
    statut_rdv VARCHAR(50) NOT NULL DEFAULT 'En attente',
    rdv_qualite BOOLEAN DEFAULT false,
    rdv_honore BOOLEAN, -- NULL = en attente, true = honoré, false = non honoré
    note_globale INTEGER DEFAULT 5 CHECK (note_globale >= 0 AND note_globale <= 10),
    remarques TEXT,
    numero_client TEXT,
    nom_client TEXT,
    criteres JSONB, -- Stocke les critères d'évaluation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_ecoutes_updated_at 
    BEFORE UPDATE ON ecoutes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ========================================

-- Activer RLS sur les deux tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoutes ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table agents
CREATE POLICY "Les agents sont visibles par tout le monde" ON agents
    FOR SELECT USING (true);

CREATE POLICY "Les agents peuvent être créés par tout le monde" ON agents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Les agents peuvent être modifiés par tout le monde" ON agents
    FOR UPDATE USING (true);

CREATE POLICY "Les agents peuvent être supprimés par tout le monde" ON agents
    FOR DELETE USING (true);

-- Politiques pour la table ecoutes
CREATE POLICY "Les écoutes sont visibles par tout le monde" ON ecoutes
    FOR SELECT USING (true);

CREATE POLICY "Les écoutes peuvent être créées par tout le monde" ON ecoutes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Les écoutes peuvent être modifiées par tout le monde" ON ecoutes
    FOR UPDATE USING (true);

CREATE POLICY "Les écoutes peuvent être supprimées par tout le monde" ON ecoutes
    FOR DELETE USING (true);

-- ========================================
-- INDEX POUR AMÉLIORER LES PERFORMANCES
-- ========================================

-- Index pour les agents
CREATE INDEX IF NOT EXISTS idx_agents_nom ON agents(nom);
CREATE INDEX IF NOT EXISTS idx_agents_projet ON agents(projet);
CREATE INDEX IF NOT EXISTS idx_agents_actif ON agents(actif);

-- Index pour les écoutes
CREATE INDEX IF NOT EXISTS idx_ecoutes_agent_id ON ecoutes(agent_id);
CREATE INDEX IF NOT EXISTS idx_ecoutes_date_rdv ON ecoutes(date_rdv);
CREATE INDEX IF NOT EXISTS idx_ecoutes_statut_rdv ON ecoutes(statut_rdv);
CREATE INDEX IF NOT EXISTS idx_ecoutes_rdv_qualite ON ecoutes(rdv_qualite);
CREATE INDEX IF NOT EXISTS idx_ecoutes_numero_client ON ecoutes(numero_client);
CREATE INDEX IF NOT EXISTS idx_ecoutes_nom_client ON ecoutes(nom_client);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_ecoutes_agent_date ON ecoutes(agent_id, date_rdv);
CREATE INDEX IF NOT EXISTS idx_ecoutes_statut_qualite ON ecoutes(statut_rdv, rdv_qualite);

-- ========================================
-- INSÉRER DES DONNÉES DE DÉMO (OPTIONNEL)
-- ========================================

-- Insérer quelques agents de démonstration
INSERT INTO agents (nom, code_agent, projet, actif) VALUES
('Alice Martin', 'AG001', 'GBS', true),
('Bob Dupont', 'AG002', 'GBS', true),
('Claire Bernard', 'AG003', 'GBS', true),
('David Petit', 'AG004', 'GBS', false)
ON CONFLICT (code_agent) DO NOTHING;

-- ========================================
-- VALIDATION
-- ========================================

-- Afficher la structure des tables créées
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('agents', 'ecoutes')
ORDER BY table_name, ordinal_position;

-- Afficher les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('agents', 'ecoutes')
ORDER BY tablename, policyname;
