Cahier des charges – Application qualité GBS Conseil (Supabase + IA)
1. Contexte et objectif
Je suis qualiticienne dans un centre d’appel pour GBS Conseil (télésales mutuelle santé).
Je veux une application web interne qui me permette de :

Gérer mes agents.

Évaluer chaque appel / prise de RDV à partir du Script GBS V7 et de la Check‑list simplifiée GBS V7 (documents fournis).
​

Classer les agents du meilleur au pire.

Suivre les RDV honorés / non honorés.

Générer des briefings IA quotidiens pour chaque agent en fonction de leurs RDV annulés (Google Gemini).
​

Visualiser des statistiques globales et par agent.

Stack souhaitée :

Front : Next.js + React + TypeScript.
​

Backend / BDD : Supabase (PostgreSQL, auth, storage).
​

IA : Google Gemini API (clé fournie via variables d’environnement).
​

2. Pages / vues à générer
2.1. Page “Agents”
Objectif : gestion des agents.

Liste des agents (table) : nom, code, projet, statut actif.

Filtres : par projet, recherche par nom.

Bouton “Ajouter un agent” → formulaire (nom, code_agent, projet, actif).

Édition / désactivation (actif=false).

2.2. Page “Écoutes / RDV”
Objectif : créer et évaluer une écoute.

Formulaire principal :

Sélection Agent.

Lien ou champ pour l’audio.

Date de prise de RDV.

Date du RDV.

Statut RDV (par exemple : validé qualité, annulé, etc.).

RDV qualité / non qualité (toggle ou radio).

RDV honoré / non honoré (toggle modifiable).

Note globale (0–10).

Champ texte Remarques qualiticienne.

Sous le formulaire, une grille de critères basée sur le Script GBS V7 + Check‑list simplifiée GBS V7 :
​

Blocs demandés :

Qualification / HC : mutuelle identifiée, ancienneté, liste 19 HC, âge, cotisation, email, gestion des HC, etc.

Besoins santé : optique, dentaire, auditif, médecine douce, dépassements d’honoraires, ALD (jamais HC), hospitalisation.

Respect du script : accroche, découverte, reformulation, implication, bénéfices, avis enregistrement RGPD, question clé, prise de RDV valorisée, sécurisation, récapitulatif, clôture pro.

Gestion des objections : satisfait, “je vais réfléchir”, “c’est compliqué de changer”, “je n’ai pas le temps”, “comment vous avez eu mon numéro ?”, “envoyez par mail”, “je dois en parler à mon conjoint”.

Pour chaque critère :

Une case à cocher “respecté”.

Un petit champ commentaire (optionnel).

La page doit permettre :

La création d’une nouvelle écoute avec sa grille.

L’édition d’une écoute existante (formulaire + critères).

2.3. Page “Classement agents”
Objectif : voir les agents du meilleur au pire selon les RDV qualité.

Fonctionnalités :

Filtres : période (dates), projet.

Tableau avec pour chaque agent :

Nom agent.

Total RDV.

RDV qualité.

RDV non qualité.

Taux de qualité (%).

RDV honorés / non honorés.

Tri par défaut : taux de qualité décroissant (meilleur → pire).

2.4. Page “Suivi RDV honorés”
Objectif : suivi des RDV honorés / non honorés.

Fonctionnalités :

Filtres : date RDV, agent, statut RDV, honoré / non honoré.

Tableau : agent, date prise RDV, date RDV, qualité, statut RDV, case honoré modifiable en ligne.

Quand on coche “honoré”, la valeur est sauvegardée (et inversement).

2.5. Page “Briefings (IA)”
Objectif : consulter les briefings IA et en créer manuellement si besoin.

Fonctionnalités :

Filtres : date de briefing (par défaut aujourd’hui), agent, type (briefing automatique quotidien ou manuel).

Liste : agent, date, type, début du texte.

Vue détail : texte complet + bouton “copier”.

Option : bouton “Nouveau briefing manuel” :

Choix de l’agent.

Champ texte “remarques”.

Appel à Gemini → création d’un briefing manuel, enregistré et visible dans la liste.
​

2.6. Page “Statistiques”
Objectif : vue globale et par agent sur la qualité et l’honorisation.

Fonctionnalités :

Filtres : période, projet.

Vue globale :
​

Total RDV.

RDV qualité / non qualité (+ %).

RDV annulés.

RDV honorés / non honorés (+ %).

Vue par agent :

Tableau agents avec les mêmes indicateurs.

Possibilité de cliquer un agent pour voir son évolution dans le temps (par jour / semaine / mois, simple tableau ou graphique).

3. IA – Briefings quotidiens automatiques (Gemini)
Objectif : chaque soir, générer automatiquement un briefing pour chaque agent basé sur ses RDV annulés de la journée.
​

Comportement souhaité :

Récupérer, pour une journée donnée, tous les RDV annulés, groupés par agent.

Pour chaque agent, construire un résumé :

Nombre de RDV annulés.

Principales erreurs / critères non respectés (ex. question clé oubliée, avis enregistrement non dit, mauvaise qualification, etc.).

Extraits des remarques qualiticienne.

Appeler la Gemini API avec un prompt du type :

Tu es superviseur qualité en centre d’appel.
À partir de ces informations (RDV annulés de la journée pour cet agent), génère un briefing opérationnel pour la journée de demain :

Nom agent

Nombre de RDV annulés

Problèmes récurrents
Donne :

3 à 5 axes prioritaires de travail

Des exemples de formulations à utiliser

Des consignes concrètes pour le prochain jour de production.

Enregistrer le texte généré comme briefing du lendemain pour cet agent.

Déclenchement souhaité :

Soit via un cron / job planifié (Edge Function Supabase ou autre solution simple).
​

Soit via un bouton “Générer les briefings du jour” accessible à l’admin.

4. Exigences techniques / UX
Projet en Next.js + React + TypeScript, proprement typé.
​

Utilisation du client Supabase pour les opérations CRUD et l’auth.
​

Gestion d’authentification simple (accès restreint à l’équipe qualité).

Interfaces claires pour une utilisatrice non développeuse :

Navigation : Agents / Écoutes / Classement / RDV honorés / Briefings / Statistiques.

Formulaires lisibles, sections bien séparées.

Messages d’erreur explicites si un champ obligatoire manque.