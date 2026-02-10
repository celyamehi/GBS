import { supabase } from './supabase'
import { Agent, Ecoute } from './supabase'

// Service pour les agents
export const agentsService = {
  async getAll(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('nom')
    
    if (error) throw error
    return data || []
  },

  async create(agent: Omit<Agent, 'id' | 'created_at'>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert([agent])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, agent: Partial<Agent>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .update(agent)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Service pour les écoutes - Version corrigée 2024
export const ecoutesService = {
  async getAll(): Promise<Ecoute[]> {
    const { data, error } = await supabase
      .from('ecoutes')
      .select(`
        id,
        agent_id,
        projet,
        lien_audio,
        date_prise_rdv,
        date_rdv,
        statut_rdv,
        rdv_qualite,
        rdv_honore,
        suivi,
        confirmation,
        note_globale,
        remarques,
        numero_client,
        nom_client,
        created_at,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .order('date_rdv', { ascending: false })
    
    if (error) throw error
    return data?.map(e => ({
      id: e.id,
      agent_id: e.agent_id,
      projet: e.projet || 'GBS Conseille', // Valeur par défaut
      lien_audio: e.lien_audio,
      audio_data: null, // N'existe plus dans la base
      audio_name: null, // N'existe pas dans la base
      date_prise_rdv: e.date_prise_rdv,
      date_rdv: e.date_rdv,
      statut_rdv: e.statut_rdv,
      rdv_qualite: e.rdv_qualite,
      rdv_honore: e.rdv_honore,
      suivi: e.suivi || null,
      confirmation: e.confirmation || null,
      note_globale: e.note_globale,
      remarques: e.remarques,
      numero_client: e.numero_client,
      nom_client: e.nom_client,
      est_nouveau_rdv: (e as any).est_nouveau_rdv ?? true, // Valeur par défaut pour les données existantes
      
      // Informations complémentaires RDV
      adresse: (e as any).adresse || null,
      mutuelle_actuelle: (e as any).mutuelle_actuelle || null,
      prix_actuel: (e as any).prix_actuel || null,
      garantie: (e as any).garantie || null,
      optique: (e as any).optique || null,
      dentaire: (e as any).dentaire || null,
      depassements_honoraires: (e as any).depassements_honoraires || null,
      ald: (e as any).ald || null,
      medecine_douce: (e as any).medecine_douce || null,
      hospitalisation: (e as any).hospitalisation || null,
      appareillage: (e as any).appareillage || null,
      regime: (e as any).regime || null,
      satisfaction: (e as any).satisfaction || null,
      date_heure_rdv: (e as any).date_heure_rdv || null,
      type_rdv: (e as any).type_rdv || null,
      age: (e as any).age || null,
      nombre_personnes: (e as any).nombre_personnes || null,
      code_postal: (e as any).code_postal || null,
      adresse_email: (e as any).adresse_email || null,
      
      criteres: {}, // N'existe pas dans la base
      created_at: e.created_at,
      agent: e.agents?.[0] ? {
        id: '', // Pas retourné par la jointure
        nom: e.agents[0].nom,
        code_agent: '', // Pas retourné par la jointure
        projet: e.agents[0].projet,
        actif: e.agents[0].actif,
        created_at: '' // Pas retourné par la jointure
      } : undefined
    })) || []
  },

  async create(ecoute: Omit<Ecoute, 'id' | 'created_at' | 'audio_data'>): Promise<Ecoute> {
    // Ne pas inclure audio_data dans l'insertion
    const { agent, ...ecouteToInsert } = ecoute
    
    const { data, error } = await supabase
      .from('ecoutes')
      .insert([ecouteToInsert])
      .select(`
        id,
        agent_id,
        projet,
        lien_audio,
        date_prise_rdv,
        date_rdv,
        statut_rdv,
        rdv_qualite,
        rdv_honore,
        suivi,
        confirmation,
        note_globale,
        remarques,
        numero_client,
        nom_client,
        created_at,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .single()
    
    if (error) throw error
    return {
      id: data.id,
      agent_id: data.agent_id,
      projet: data.projet || 'GBS Conseille',
      lien_audio: data.lien_audio,
      audio_data: null,
      audio_name: null,
      date_prise_rdv: data.date_prise_rdv,
      date_rdv: data.date_rdv,
      statut_rdv: data.statut_rdv,
      rdv_qualite: data.rdv_qualite,
      rdv_honore: data.rdv_honore,
      suivi: data.suivi || null,
      confirmation: data.confirmation || null,
      note_globale: data.note_globale,
      remarques: data.remarques,
      numero_client: data.numero_client,
      nom_client: data.nom_client,
      est_nouveau_rdv: (data as any).est_nouveau_rdv ?? true,
      
      // Informations complémentaires RDV
      adresse: (data as any).adresse || null,
      mutuelle_actuelle: (data as any).mutuelle_actuelle || null,
      prix_actuel: (data as any).prix_actuel || null,
      garantie: (data as any).garantie || null,
      optique: (data as any).optique || null,
      dentaire: (data as any).dentaire || null,
      depassements_honoraires: (data as any).depassements_honoraires || null,
      ald: (data as any).ald || null,
      medecine_douce: (data as any).medecine_douce || null,
      hospitalisation: (data as any).hospitalisation || null,
      appareillage: (data as any).appareillage || null,
      regime: (data as any).regime || null,
      satisfaction: (data as any).satisfaction || null,
      date_heure_rdv: (data as any).date_heure_rdv || null,
      type_rdv: (data as any).type_rdv || null,
      age: (data as any).age || null,
      nombre_personnes: (data as any).nombre_personnes || null,
      code_postal: (data as any).code_postal || null,
      adresse_email: (data as any).adresse_email || null,
      
      criteres: {},
      created_at: data.created_at,
      agent: data.agents?.[0] ? {
        id: '',
        nom: data.agents[0].nom,
        code_agent: '',
        projet: data.agents[0].projet,
        actif: data.agents[0].actif,
        created_at: ''
      } : undefined
    }
  },

  async update(id: string, ecoute: Partial<Ecoute>): Promise<Ecoute> {
    // Ne pas inclure audio_data dans la mise à jour
    const { agent, audio_data, ...ecouteToUpdate } = ecoute
    
    const { data, error } = await supabase
      .from('ecoutes')
      .update(ecouteToUpdate)
      .eq('id', id)
      .select(`
        id,
        agent_id,
        projet,
        lien_audio,
        date_prise_rdv,
        date_rdv,
        statut_rdv,
        rdv_qualite,
        rdv_honore,
        suivi,
        confirmation,
        note_globale,
        remarques,
        numero_client,
        nom_client,
        created_at,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .single()
    
    if (error) throw error
    return {
      id: data.id,
      agent_id: data.agent_id,
      projet: data.projet || 'GBS Conseille',
      lien_audio: data.lien_audio,
      audio_data: null,
      audio_name: null,
      date_prise_rdv: data.date_prise_rdv,
      date_rdv: data.date_rdv,
      statut_rdv: data.statut_rdv,
      rdv_qualite: data.rdv_qualite,
      rdv_honore: data.rdv_honore,
      suivi: data.suivi || null,
      confirmation: data.confirmation || null,
      note_globale: data.note_globale,
      remarques: data.remarques,
      numero_client: data.numero_client,
      nom_client: data.nom_client,
      est_nouveau_rdv: (data as any).est_nouveau_rdv ?? true,
      
      // Informations complémentaires RDV
      adresse: (data as any).adresse || null,
      mutuelle_actuelle: (data as any).mutuelle_actuelle || null,
      prix_actuel: (data as any).prix_actuel || null,
      garantie: (data as any).garantie || null,
      optique: (data as any).optique || null,
      dentaire: (data as any).dentaire || null,
      depassements_honoraires: (data as any).depassements_honoraires || null,
      ald: (data as any).ald || null,
      medecine_douce: (data as any).medecine_douce || null,
      hospitalisation: (data as any).hospitalisation || null,
      appareillage: (data as any).appareillage || null,
      regime: (data as any).regime || null,
      satisfaction: (data as any).satisfaction || null,
      date_heure_rdv: (data as any).date_heure_rdv || null,
      type_rdv: (data as any).type_rdv || null,
      age: (data as any).age || null,
      nombre_personnes: (data as any).nombre_personnes || null,
      code_postal: (data as any).code_postal || null,
      adresse_email: (data as any).adresse_email || null,
      
      criteres: {},
      created_at: data.created_at,
      agent: data.agents?.[0] ? {
        id: '',
        nom: data.agents[0].nom,
        code_agent: '',
        projet: data.agents[0].projet,
        actif: data.agents[0].actif,
        created_at: ''
      } : undefined
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ecoutes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async toggleQualite(id: string): Promise<Ecoute> {
    // D'abord récupérer l'écoute actuelle
    const { data: currentEcoute, error: fetchError } = await supabase
      .from('ecoutes')
      .select('rdv_qualite')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Inverser la valeur
    const { data, error } = await supabase
      .from('ecoutes')
      .update({ rdv_qualite: !currentEcoute.rdv_qualite })
      .eq('id', id)
      .select(`
        id,
        agent_id,
        projet,
        lien_audio,
        date_prise_rdv,
        date_rdv,
        statut_rdv,
        rdv_qualite,
        rdv_honore,
        suivi,
        confirmation,
        note_globale,
        remarques,
        numero_client,
        nom_client,
        created_at,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .single()
    
    if (error) throw error
    return {
      id: data.id,
      agent_id: data.agent_id,
      projet: data.projet || 'GBS Conseille',
      lien_audio: data.lien_audio,
      audio_data: null,
      audio_name: null,
      date_prise_rdv: data.date_prise_rdv,
      date_rdv: data.date_rdv,
      statut_rdv: data.statut_rdv,
      rdv_qualite: data.rdv_qualite,
      rdv_honore: data.rdv_honore,
      suivi: data.suivi || null,
      confirmation: data.confirmation || null,
      note_globale: data.note_globale,
      remarques: data.remarques,
      numero_client: data.numero_client,
      nom_client: data.nom_client,
      est_nouveau_rdv: (data as any).est_nouveau_rdv ?? true,
      
      // Informations complémentaires RDV
      adresse: (data as any).adresse || null,
      mutuelle_actuelle: (data as any).mutuelle_actuelle || null,
      prix_actuel: (data as any).prix_actuel || null,
      garantie: (data as any).garantie || null,
      optique: (data as any).optique || null,
      dentaire: (data as any).dentaire || null,
      depassements_honoraires: (data as any).depassements_honoraires || null,
      ald: (data as any).ald || null,
      medecine_douce: (data as any).medecine_douce || null,
      hospitalisation: (data as any).hospitalisation || null,
      appareillage: (data as any).appareillage || null,
      regime: (data as any).regime || null,
      satisfaction: (data as any).satisfaction || null,
      date_heure_rdv: (data as any).date_heure_rdv || null,
      type_rdv: (data as any).type_rdv || null,
      age: (data as any).age || null,
      nombre_personnes: (data as any).nombre_personnes || null,
      code_postal: (data as any).code_postal || null,
      adresse_email: (data as any).adresse_email || null,
      
      criteres: {},
      created_at: data.created_at,
      agent: data.agents?.[0] ? {
        id: '',
        nom: data.agents[0].nom,
        code_agent: '',
        projet: data.agents[0].projet,
        actif: data.agents[0].actif,
        created_at: ''
      } : undefined
    }
  },

  async toggleHonore(id: string, honore: boolean): Promise<Ecoute> {
    const { data, error } = await supabase
      .from('ecoutes')
      .update({ rdv_honore: honore })
      .eq('id', id)
      .select(`
        id,
        agent_id,
        projet,
        lien_audio,
        date_prise_rdv,
        date_rdv,
        statut_rdv,
        rdv_qualite,
        rdv_honore,
        suivi,
        confirmation,
        note_globale,
        remarques,
        numero_client,
        nom_client,
        created_at,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .single()
    
    if (error) throw error
    return {
      id: data.id,
      agent_id: data.agent_id,
      projet: data.projet || 'GBS Conseille',
      lien_audio: data.lien_audio,
      audio_data: null,
      audio_name: null,
      date_prise_rdv: data.date_prise_rdv,
      date_rdv: data.date_rdv,
      statut_rdv: data.statut_rdv,
      rdv_qualite: data.rdv_qualite,
      rdv_honore: data.rdv_honore,
      suivi: data.suivi || null,
      confirmation: data.confirmation || null,
      note_globale: data.note_globale,
      remarques: data.remarques,
      numero_client: data.numero_client,
      nom_client: data.nom_client,
      est_nouveau_rdv: (data as any).est_nouveau_rdv ?? true,
      
      // Informations complémentaires RDV
      adresse: (data as any).adresse || null,
      mutuelle_actuelle: (data as any).mutuelle_actuelle || null,
      prix_actuel: (data as any).prix_actuel || null,
      garantie: (data as any).garantie || null,
      optique: (data as any).optique || null,
      dentaire: (data as any).dentaire || null,
      depassements_honoraires: (data as any).depassements_honoraires || null,
      ald: (data as any).ald || null,
      medecine_douce: (data as any).medecine_douce || null,
      hospitalisation: (data as any).hospitalisation || null,
      appareillage: (data as any).appareillage || null,
      regime: (data as any).regime || null,
      satisfaction: (data as any).satisfaction || null,
      date_heure_rdv: (data as any).date_heure_rdv || null,
      type_rdv: (data as any).type_rdv || null,
      age: (data as any).age || null,
      nombre_personnes: (data as any).nombre_personnes || null,
      code_postal: (data as any).code_postal || null,
      adresse_email: (data as any).adresse_email || null,
      
      criteres: {},
      created_at: data.created_at,
      agent: data.agents?.[0] ? {
        id: '',
        nom: data.agents[0].nom,
        code_agent: '',
        projet: data.agents[0].projet,
        actif: data.agents[0].actif,
        created_at: ''
      } : undefined
    }
  }
}
