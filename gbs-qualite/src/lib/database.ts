import { supabase } from './supabase'
import { Agent, Ecoute } from './supabase'

// AGENTS
export async function getAgents(): Promise<Agent[]> {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error)
    return []
  }
}

export async function createAgent(agent: Omit<Agent, 'id' | 'created_at'>): Promise<Agent | null> {
  try {
    const { data, error } = await supabase
      .from('agents')
      .insert([{
        ...agent,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent:', error)
    return null
  }
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
  try {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'agent:', error)
    return null
  }
}

export async function deleteAgent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
    
    return !error
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'agent:', error)
    return false
  }
}

// ÉCOUTES
export async function getEcoutes(): Promise<Ecoute[]> {
  try {
    const { data, error } = await supabase
      .from('ecoutes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des écoutes:', error)
    return []
  }
}

export async function createEcoute(ecoute: Omit<Ecoute, 'id' | 'created_at'>): Promise<Ecoute | null> {
  try {
    const { data, error } = await supabase
      .from('ecoutes')
      .insert([{
        ...ecoute,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la création de l\'écoute:', error)
    return null
  }
}

export async function updateEcoute(id: string, updates: Partial<Ecoute>): Promise<Ecoute | null> {
  try {
    const { data, error } = await supabase
      .from('ecoutes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'écoute:', error)
    return null
  }
}

export async function deleteEcoute(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ecoutes')
      .delete()
      .eq('id', id)
    
    return !error
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'écoute:', error)
    return false
  }
}

// BRIEFINGS
export async function getBriefings() {
  try {
    const { data, error } = await supabase
      .from('briefings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des briefings:', error)
    return []
  }
}

export async function createBriefing(briefing: any) {
  try {
    const { data, error } = await supabase
      .from('briefings')
      .insert([{
        ...briefing,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la création du briefing:', error)
    return null
  }
}

export async function deleteBriefing(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('briefings')
      .delete()
      .eq('id', id)
    
    return !error
  } catch (error) {
    console.error('Erreur lors de la suppression du briefing:', error)
    return false
  }
}
