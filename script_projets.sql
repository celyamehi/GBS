-- Script SQL pour créer la table projets
-- À exécuter dans l'éditeur SQL de Supabase si vous voulez une table dédiée pour les projets

-- Création de la table projets
CREATE TABLE IF NOT EXISTS projets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des projets de base
INSERT INTO projets (nom, description, actif) VALUES
  ('GBS Conseille', 'Projet principal de conseil en mutuelle', true),
  ('CAPSICOM', 'Projet CAPSICOM', true),
  ('CAP Prevoyance', 'Projet CAP Prevoyance', true)
ON CONFLICT (nom) DO NOTHING;

-- Création d'un index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_projets_actif ON projets(actif);
CREATE INDEX IF NOT EXISTS idx_projets_nom ON projets(nom);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projets_updated_at 
    BEFORE UPDATE ON projets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Vérification de la création
SELECT * FROM projets ORDER BY nom;
