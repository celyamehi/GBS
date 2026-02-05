# Migration vers Supabase - Instructions Complètes

## 🎯 Objectif
Migrer l'application GBS Qualité du localStorage vers Supabase pour une base de données centralisée et persistante.

## 📋 Étapes à suivre

### 1. Configuration de l'environnement

Assurez-vous que votre fichier `.env.local` contient bien :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 2. Création des tables Supabase

1. Allez dans votre projet Supabase
2. Ouvrez le **SQL Editor**
3. Copiez et exécutez le contenu du fichier `SUPABASE_DATABASE_SETUP.sql`

Ce script va créer :
- ✅ Table `agents` avec tous les champs nécessaires
- ✅ Table `ecoutes` avec tous les champs (y compris numero_client, nom_client)
- ✅ Politiques RLS pour l'accès public
- ✅ Index pour optimiser les performances
- ✅ Données de démonstration (agents)

### 3. Configuration du Storage (pour les fichiers audio)

Si ce n'est pas déjà fait :

1. Créez un bucket `audio-ecoutes` dans Supabase Storage
2. Configurez les politiques RLS pour ce bucket avec le script fourni précédemment

### 4. Vérification de la migration

Une fois le script SQL exécuté, vérifiez dans Supabase :

#### Tables créées :
- `agents` (id, nom, code_agent, projet, actif, created_at, updated_at)
- `ecoutes` (tous les champs y compris numero_client, nom_client, criteres)

#### Politiques RLS activées :
- Accès en lecture/écriture/suppression pour tout le monde
- Sécurité par bucket pour les fichiers audio

## 🔄 Changements dans le code

### Nouveaux fichiers créés :
- `src/lib/supabaseService.ts` - Services pour communiquer avec Supabase
- `src/hooks/useSupabaseData.ts` - Hooks React pour remplacer localStorage
- `SUPABASE_DATABASE_SETUP.sql` - Script de création des tables

### Pages mises à jour :
- ✅ `src/app/ecoutes/page.tsx` - Utilise Supabase + gestion des erreurs
- ✅ `src/app/classement/page.tsx` - Utilise Supabase + filtres qualité
- ✅ `src/app/statistiques/page.tsx` - Utilise Supabase + stats temps réel
- ✅ `src/app/suivi-rdv/page.tsx` - Utilise Supabase + toggle honore
- ✅ `src/app/analyse/page.tsx` - Utilise Supabase + analyse critères

## 🎯 Fonctionnalités préservées

### Filtres et recherche :
- ✅ Recherche globale (agent, client, numéro, statut)
- ✅ Filtres par date RDV et date prise RDV
- ✅ Filtre par agent et statut

### Statistiques qualité :
- ✅ Uniquement les RDV "Validé qualité" et "2ème passage"
- ✅ Mise à jour en temps réel des stats
- ✅ Synchronisation entre toutes les pages

### Gestion des données :
- ✅ Création, modification, suppression d'écoutes
- ✅ Toggle qualité et honore en temps réel
- ✅ Upload des fichiers audio sur Supabase Storage

## 🔧 Dépannage

### Erreurs possibles :

1. **"Erreur de chargement"**
   - Vérifiez vos variables d'environnement
   - Vérifiez que les tables existent dans Supabase
   - Vérifiez les politiques RLS

2. **"Permission denied"**
   - Exécutez le script SQL pour créer les politiques RLS
   - Vérifiez que votre clé anon est correcte

3. **"Table not found"**
   - Exécutez le script `SUPABASE_DATABASE_SETUP.sql`
   - Vérifiez que vous êtes sur le bon projet Supabase

## 🚀 Déploiement

1. Poussez les modifications sur GitHub
2. Déployez sur Vercel (variables d'environnement déjà configurées)
3. Testez toutes les fonctionnalités

## ✅ Checklist de validation

- [ ] Tables créées dans Supabase
- [ ] Politiques RLS activées
- [ ] Variables d'environnement configurées
- [ ] Pages se chargent sans erreur
- [ ] Création d'écoute fonctionne
- [ ] Modification d'écoute fonctionne
- [ ] Suppression d'écoute fonctionne
- [ ] Toggle qualité/honore fonctionne
- [ ] Filtres fonctionnent
- [ ] Statistiques sont à jour
- [ ] Upload audio fonctionne

## 🎉 Résultat

Votre application utilise maintenant Supabase comme base de données principale :
- Plus de localStorage
- Données persistantes et centralisées
- Mises à jour en temps réel
- Gestion des erreurs améliorée
- États de chargement informatifs
