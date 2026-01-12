import { Agent, Ecoute, CritereEvaluation, Briefing } from '@/lib/supabase'

export const mockAgents: Agent[] = [
  {
    id: '1',
    nom: 'Marie Dupont',
    code_agent: 'MD001',
    projet: 'Mutuelle Senior',
    actif: true,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nom: 'Jean Martin',
    code_agent: 'JM002',
    projet: 'Mutuelle Senior',
    actif: true,
    created_at: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    nom: 'Sophie Bernard',
    code_agent: 'SB003',
    projet: 'Mutuelle Famille',
    actif: true,
    created_at: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    nom: 'Pierre Leroy',
    code_agent: 'PL004',
    projet: 'Mutuelle Famille',
    actif: false,
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: '5',
    nom: 'Claire Moreau',
    code_agent: 'CM005',
    projet: 'Mutuelle Senior',
    actif: true,
    created_at: '2024-01-19T10:00:00Z'
  }
]

export const mockEcoutes: Ecoute[] = [
  {
    id: '1',
    agent_id: '1',
    lien_audio: null,
    audio_data: null,
    audio_name: null,
    date_prise_rdv: '2024-01-20',
    date_rdv: '2024-01-25',
    statut_rdv: 'Validé qualité',
    rdv_qualite: true,
    rdv_honore: true,
    note_globale: 8,
    remarques: 'Très bon appel, bonne maîtrise du script',
    criteres: null,
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    agent_id: '1',
    lien_audio: null,
    audio_data: null,
    audio_name: null,
    date_prise_rdv: '2024-01-21',
    date_rdv: '2024-01-26',
    statut_rdv: 'Annulé',
    rdv_qualite: false,
    rdv_honore: false,
    note_globale: 5,
    remarques: 'Question clé oubliée, reformulation absente',
    criteres: null,
    created_at: '2024-01-21T09:15:00Z'
  },
  {
    id: '3',
    agent_id: '2',
    lien_audio: null,
    audio_data: null,
    audio_name: null,
    date_prise_rdv: '2024-01-22',
    date_rdv: '2024-01-27',
    statut_rdv: 'Validé qualité',
    rdv_qualite: true,
    rdv_honore: true,
    note_globale: 9,
    remarques: 'Excellent, très professionnel',
    criteres: null,
    created_at: '2024-01-22T11:00:00Z'
  },
  {
    id: '4',
    agent_id: '3',
    lien_audio: null,
    audio_data: null,
    audio_name: null,
    date_prise_rdv: '2024-01-22',
    date_rdv: '2024-01-28',
    statut_rdv: 'En attente',
    rdv_qualite: true,
    rdv_honore: null,
    note_globale: 7,
    remarques: 'Bon appel mais peut améliorer la sécurisation',
    criteres: null,
    created_at: '2024-01-22T15:45:00Z'
  },
  {
    id: '5',
    agent_id: '2',
    lien_audio: null,
    audio_data: null,
    audio_name: null,
    date_prise_rdv: '2024-01-23',
    date_rdv: '2024-01-29',
    statut_rdv: 'Annulé',
    rdv_qualite: false,
    rdv_honore: false,
    note_globale: 4,
    remarques: 'Mauvaise gestion des objections',
    criteres: null,
    created_at: '2024-01-23T10:30:00Z'
  }
]

export const mockCriteres: CritereEvaluation[] = [
  { id: '1', ecoute_id: '1', bloc: 'qualification_hc', critere: 'Mutuelle identifiée', respecte: true, commentaire: null },
  { id: '2', ecoute_id: '1', bloc: 'qualification_hc', critere: 'Ancienneté vérifiée', respecte: true, commentaire: null },
  { id: '3', ecoute_id: '1', bloc: 'respect_script', critere: 'Accroche', respecte: true, commentaire: 'Très bien' },
  { id: '4', ecoute_id: '1', bloc: 'respect_script', critere: 'Question clé', respecte: true, commentaire: null },
]

export const mockBriefings: Briefing[] = [
  {
    id: '1',
    agent_id: '1',
    date_briefing: '2024-01-24',
    type: 'automatique',
    contenu: `**Briefing pour Marie Dupont - 24/01/2024**

**Axes prioritaires de travail :**
1. **Reformulation systématique** - Après chaque découverte des besoins, reformuler pour valider la compréhension
2. **Question clé** - Ne jamais oublier de poser la question clé avant la proposition
3. **Sécurisation du RDV** - Renforcer la confirmation du RDV avec rappel des bénéfices

**Exemples de formulations :**
- "Si je comprends bien, vous recherchez une mutuelle qui couvre particulièrement..."
- "Avant de vous présenter notre solution, permettez-moi de vous poser une question importante..."
- "Je vous confirme donc notre rendez-vous le [date] à [heure], vous allez pouvoir découvrir..."

**Consignes concrètes :**
- Prendre 2 secondes de pause avant chaque transition
- Noter les besoins exprimés pendant l'appel
- Sourire au téléphone pour améliorer le ton`,
    created_at: '2024-01-24T06:00:00Z'
  },
  {
    id: '2',
    agent_id: '2',
    date_briefing: '2024-01-24',
    type: 'automatique',
    contenu: `**Briefing pour Jean Martin - 24/01/2024**

**Axes prioritaires de travail :**
1. **Gestion des objections** - Travailler sur l'objection "je vais réfléchir"
2. **Découverte approfondie** - Poser plus de questions sur les besoins santé
3. **Clôture professionnelle** - Améliorer la fin d'appel

**Exemples de formulations :**
- "Je comprends que vous souhaitiez réfléchir. Qu'est-ce qui vous ferait hésiter ?"
- "En matière de santé, qu'est-ce qui est le plus important pour vous ?"
- "Je vous remercie pour cet échange, n'hésitez pas à me rappeler si vous avez des questions"

**Consignes concrètes :**
- Écouter activement sans interrompre
- Utiliser le prénom du prospect
- Terminer chaque appel sur une note positive`,
    created_at: '2024-01-24T06:00:00Z'
  }
]

export const PROJETS = ['Mutuelle Senior', 'Mutuelle Famille', 'Mutuelle Entreprise']
