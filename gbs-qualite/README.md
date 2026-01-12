# GBS Qualité - Application Qualité Centre d'Appel

Application web interne pour la gestion de la qualité des appels chez GBS Conseil (télésales mutuelle santé).

## Fonctionnalités

- **Gestion des Agents** : Ajout, modification, activation/désactivation des agents
- **Écoutes / RDV** : Évaluation des appels avec grille de critères basée sur le Script GBS V7
- **Classement** : Classement des agents par taux de qualité
- **Suivi RDV** : Suivi des RDV honorés / non honorés
- **Briefings IA** : Génération de briefings automatiques et manuels via Google Gemini
- **Statistiques** : Vue globale et par agent sur la qualité et l'honorisation

## Stack Technique

- **Frontend** : Next.js 15 + React + TypeScript
- **Styling** : Tailwind CSS (style pastel Apple-like)
- **Backend/BDD** : Supabase (PostgreSQL)
- **IA** : Google Gemini API

## Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp env.example .env.local
```

Remplir les valeurs dans `.env.local` :
- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `GEMINI_API_KEY` : Clé API Google Gemini

4. Lancer le serveur de développement :
```bash
npm run dev
```

5. Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── agents/            # Gestion des agents
│   ├── ecoutes/           # Écoutes et évaluations
│   ├── classement/        # Classement des agents
│   ├── suivi-rdv/         # Suivi des RDV honorés
│   ├── briefings/         # Briefings IA
│   └── statistiques/      # Statistiques globales
├── components/            # Composants réutilisables
├── data/                  # Données mock pour démo
├── hooks/                 # Hooks personnalisés
└── lib/                   # Configuration (Supabase, Gemini)
```

## Grille d'Évaluation

L'application intègre les critères du Script GBS V7 :

### Qualification / HC
- Mutuelle identifiée, Ancienneté, Liste 19 HC, Âge, Cotisation, Email, Gestion HC

### Besoins Santé
- Optique, Dentaire, Auditif, Médecine douce, Dépassements d'honoraires, ALD, Hospitalisation

### Respect du Script
- Accroche, Découverte, Reformulation, Implication, Bénéfices, RGPD, Question clé, Prise RDV valorisée, Sécurisation, Récapitulatif, Clôture

### Gestion des Objections
- "Je suis satisfait", "Je vais réfléchir", "C'est compliqué de changer", "Je n'ai pas le temps", "Comment vous avez eu mon numéro ?", "Envoyez par mail", "Je dois en parler à mon conjoint"

## Configuration Supabase

Créer les tables suivantes dans Supabase :

```sql
-- Table agents
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code_agent TEXT NOT NULL UNIQUE,
  projet TEXT NOT NULL,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table ecoutes
CREATE TABLE ecoutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  lien_audio TEXT,
  date_prise_rdv DATE NOT NULL,
  date_rdv DATE NOT NULL,
  statut_rdv TEXT NOT NULL,
  rdv_qualite BOOLEAN DEFAULT false,
  rdv_honore BOOLEAN,
  note_globale INTEGER CHECK (note_globale >= 0 AND note_globale <= 10),
  remarques TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table criteres_evaluation
CREATE TABLE criteres_evaluation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecoute_id UUID REFERENCES ecoutes(id) ON DELETE CASCADE,
  bloc TEXT NOT NULL,
  critere TEXT NOT NULL,
  respecte BOOLEAN DEFAULT false,
  commentaire TEXT
);

-- Table briefings
CREATE TABLE briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  date_briefing DATE NOT NULL,
  type TEXT CHECK (type IN ('automatique', 'manuel')),
  contenu TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Mode Démo

L'application fonctionne en mode démo avec localStorage si Supabase n'est pas configuré. Les données sont persistées localement dans le navigateur.
