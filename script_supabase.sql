-- Script SQL pour ajouter les champs complémentaires RDV dans la table ecoutes
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajout des champs complémentaires RDV
ALTER TABLE ecoutes 
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS mutuelle_actuelle TEXT,
ADD COLUMN IF NOT EXISTS prix_actuel DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS garantie TEXT,
ADD COLUMN IF NOT EXISTS optique TEXT,
ADD COLUMN IF NOT EXISTS dentaire TEXT,
ADD COLUMN IF NOT EXISTS depassements_honoraires TEXT,
ADD COLUMN IF NOT EXISTS ald TEXT,
ADD COLUMN IF NOT EXISTS medecine_douce TEXT,
ADD COLUMN IF NOT EXISTS hospitalisation TEXT,
ADD COLUMN IF NOT EXISTS appareillage TEXT,
ADD COLUMN IF NOT EXISTS regime TEXT,
ADD COLUMN IF NOT EXISTS satisfaction TEXT,
ADD COLUMN IF NOT EXISTS date_heure_rdv TEXT,
ADD COLUMN IF NOT EXISTS type_rdv TEXT DEFAULT 'Téléphonique',
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS nombre_personnes INTEGER,
ADD COLUMN IF NOT EXISTS code_postal TEXT,
ADD COLUMN IF NOT EXISTS adresse_email TEXT;

-- Ajout de commentaires pour chaque champ (optionnel)
COMMENT ON COLUMN ecoutes.adresse IS 'Adresse complète du client';
COMMENT ON COLUMN ecoutes.mutuelle_actuelle IS 'Mutuelle souscrite actuellement par le client';
COMMENT ON COLUMN ecoutes.prix_actuel IS 'Montant mensuel/annuel payé actuellement';
COMMENT ON COLUMN ecoutes.garantie IS 'Niveau de garantie souhaité par le client';
COMMENT ON COLUMN ecoutes.optique IS 'Couverture optique souhaitée';
COMMENT ON COLUMN ecoutes.dentaire IS 'Couverture dentaire souhaitée';
COMMENT ON COLUMN ecoutes.depassements_honoraires IS 'Gestion des dépassements honoraires souhaitée';
COMMENT ON COLUMN ecoutes.ald IS 'Affection Longue Durée du client';
COMMENT ON COLUMN ecoutes.medecine_douce IS 'Couverture médecines douces souhaitée';
COMMENT ON COLUMN ecoutes.hospitalisation IS 'Couverture hospitalière souhaitée';
COMMENT ON COLUMN ecoutes.appareillage IS 'Couverture appareils médicaux souhaitée';
COMMENT ON COLUMN ecoutes.regime IS 'Régime de sécurité sociale du client';
COMMENT ON COLUMN ecoutes.satisfaction IS 'Niveau de satisfaction actuel du client';
COMMENT ON COLUMN ecoutes.date_heure_rdv IS 'Heure précise du rendez-vous';
COMMENT ON COLUMN ecoutes.type_rdv IS 'Type de rendez-vous (Téléphonique, Visio, Physique...)';
COMMENT ON COLUMN ecoutes.age IS 'Âge du client en années';
COMMENT ON COLUMN ecoutes.nombre_personnes IS 'Nombre de personnes à couvrir';
COMMENT ON COLUMN ecoutes.code_postal IS 'Code postal du client';
COMMENT ON COLUMN ecoutes.adresse_email IS 'Adresse email du client';

-- Création d'index pour optimiser les performances (optionnel)
CREATE INDEX IF NOT EXISTS idx_ecoutes_code_postal ON ecoutes(code_postal);
CREATE INDEX IF NOT EXISTS idx_ecoutes_mutuelle_actuelle ON ecoutes(mutuelle_actuelle);
CREATE INDEX IF NOT EXISTS idx_ecoutes_type_rdv ON ecoutes(type_rdv);
CREATE INDEX IF NOT EXISTS idx_ecoutes_age ON ecoutes(age);

-- Vérification de l'ajout des colonnes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ecoutes' 
AND table_schema = 'public'
ORDER BY ordinal_position;
