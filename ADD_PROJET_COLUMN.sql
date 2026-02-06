-- Ajouter la colonne projet à la table ecoutes
ALTER TABLE ecoutes ADD COLUMN projet TEXT;

-- Mettre à jour les écoutes existantes avec le projet par défaut
UPDATE ecoutes SET projet = 'GBS Conseille' WHERE projet IS NULL;
