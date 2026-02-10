import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Agent = {
  id: string
  nom: string
  code_agent: string
  projet: string
  actif: boolean
  created_at: string
}

export type Ecoute = {
  id: string
  agent_id: string
  projet: string
  lien_audio: string | null
  audio_data: string | null
  audio_name: string | null
  date_prise_rdv: string
  date_rdv: string
  statut_rdv: string
  rdv_qualite: boolean
  rdv_honore: boolean | null
  suivi: string | null
  confirmation: string | null
  note_globale: number
  remarques: string | null
  numero_client: string | null
  nom_client: string | null
  est_nouveau_rdv: boolean // true = nouveau RDV, false = relance
  
  // Informations complémentaires RDV
  adresse: string | null
  mutuelle_actuelle: string | null
  prix_actuel: number | null
  garantie: string | null
  optique: string | null
  dentaire: string | null
  depassements_honoraires: string | null
  ald: string | null
  medecine_douce: string | null
  hospitalisation: string | null
  appareillage: string | null
  regime: string | null
  satisfaction: string | null
  date_heure_rdv: string | null
  type_rdv: string | null // ex: Téléphonique
  age: number | null
  nombre_personnes: number | null
  code_postal: string | null
  adresse_email: string | null
  
  criteres: Record<string, { respecte: boolean; commentaire: string }> | null
  created_at: string
  agent?: Agent
}

export type CritereEvaluation = {
  id: string
  ecoute_id: string
  bloc: string
  critere: string
  respecte: boolean
  commentaire: string | null
}

export type Briefing = {
  id: string
  agent_id: string
  date_briefing: string
  type: 'automatique' | 'manuel'
  contenu: string
  created_at: string
  agent?: Agent
}

export const BLOCS_CRITERES = {
  qualification_hc: {
    titre: 'Qualification / HC',
    couleur: '#ffd6e0',
    criteres: [
      'Mutuelle identifiée',
      'Ancienneté vérifiée',
      'Liste 19 HC respectée',
      'Âge vérifié',
      'Cotisation actuelle demandée',
      'Email récupéré',
      'Gestion des HC correcte'
    ]
  },
  besoins_sante: {
    titre: 'Besoins santé',
    couleur: '#c1e3ff',
    criteres: [
      'Optique',
      'Dentaire',
      'Auditif',
      'Médecine douce',
      'Dépassements d\'honoraires',
      'ALD (jamais HC)',
      'Hospitalisation'
    ]
  },
  respect_script: {
    titre: 'Respect du script',
    couleur: '#d4edda',
    criteres: [
      'Accroche',
      'Découverte',
      'Reformulation',
      'Implication',
      'Bénéfices',
      'Avis enregistrement RGPD',
      'Question clé',
      'Prise de RDV valorisée',
      'Sécurisation',
      'Récapitulatif',
      'Clôture professionnelle'
    ]
  },
  gestion_objections: {
    titre: 'Gestion des objections',
    couleur: '#fff3cd',
    criteres: [
      'Objection "Je suis satisfait"',
      'Objection "Je vais réfléchir"',
      'Objection "C\'est compliqué de changer"',
      'Objection "Je n\'ai pas le temps"',
      'Objection "Comment vous avez eu mon numéro ?"',
      'Objection "Envoyez par mail"',
      'Objection "Je dois en parler à mon conjoint"'
    ]
  }
}

export const STATUTS_RDV = [
  'Validé qualité',
  '2ème passage',
  'Annulé'
]
