-- Ajouter les colonnes pour le suivi et la confirmation
ALTER TABLE ecoutes 
ADD COLUMN suivi TEXT,
ADD COLUMN confirmation TEXT;

-- Mettre à jour les données existantes
UPDATE ecoutes SET 
    suivi = CASE 
        WHEN rdv_honore = true THEN 'Honore'
        WHEN rdv_honore = false THEN 'NRP'
        ELSE NULL
    END,
    confirmation = NULL
WHERE suivi IS NULL;
