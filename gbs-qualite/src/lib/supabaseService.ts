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

// Service pour les écoutes
export const ecoutesService = {
  async getAll(): Promise<Ecoute[]> {
    const { data, error } = await supabase
      .from('ecoutes')
      .select(`
        *,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .order('date_rdv', { ascending: false })
    
    if (error) throw error
    return data?.map(e => ({
      ...e,
      agent: e.agents
    })) || []
  },

  async create(ecoute: Omit<Ecoute, 'id' | 'created_at'>): Promise<Ecoute> {
    const { data, error } = await supabase
      .from('ecoutes')
      .insert([ecoute])
      .select(`
        *,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .single()
    
    if (error) throw error
    return {
      ...data,
      agent: data.agents
    }
  },

  async update(id: string, ecoute: Partial<Ecoute>): Promise<Ecoute> {
    const { data, error } = await supabase
      .from('ecoutes')
      .update(ecoute)
      .eq('id', id)
      .select(`
        *,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .single()
    
    if (error) throw error
    return {
      ...data,
      agent: data.agents
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
        *,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .single()
    
    if (error) throw error
    return {
      ...data,
      agent: data.agents
    }
  },

  async toggleHonore(id: string, honore: boolean): Promise<Ecoute> {
    const { data, error } = await supabase
      .from('ecoutes')
      .update({ rdv_honore: honore })
      .eq('id', id)
      .select(`
        *,
        agents (
          nom,
          projet,
          actif
        )
      `)
      .single()
    
    if (error) throw error
    return {
      ...data,
      agent: data.agents
    }
  }
}
