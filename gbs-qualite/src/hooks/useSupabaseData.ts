import { useState, useEffect, useCallback } from 'react'
import { Agent, Ecoute } from '@/lib/supabase'
import { 
  getAgents, 
  createAgent, 
  updateAgent, 
  deleteAgent,
  getEcoutes, 
  createEcoute, 
  updateEcoute, 
  deleteEcoute,
  getBriefings,
  createBriefing
} from '@/lib/database'

export function useSupabaseAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAgents()
      setAgents(data)
    } catch (err) {
      setError('Erreur lors du chargement des agents')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addAgent = useCallback(async (agentData: Omit<Agent, 'id' | 'created_at'>) => {
    try {
      const newAgent = await createAgent(agentData)
      if (newAgent) {
        setAgents(prev => [newAgent, ...prev])
        return newAgent
      }
      return null
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'agent:', err)
      return null
    }
  }, [])

  const updateAgentData = useCallback(async (id: string, updates: Partial<Agent>) => {
    try {
      const updatedAgent = await updateAgent(id, updates)
      if (updatedAgent) {
        setAgents(prev => prev.map(agent => 
          agent.id === id ? updatedAgent : agent
        ))
        return updatedAgent
      }
      return null
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'agent:', err)
      return null
    }
  }, [])

  const removeAgent = useCallback(async (id: string) => {
    try {
      const success = await deleteAgent(id)
      if (success) {
        setAgents(prev => prev.filter(agent => agent.id !== id))
        return true
      }
      return false
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'agent:', err)
      return false
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
    addAgent,
    updateAgent: updateAgentData,
    deleteAgent: removeAgent
  }
}

export function useSupabaseEcoutes() {
  const [ecoutes, setEcoutes] = useState<Ecoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEcoutes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getEcoutes()
      setEcoutes(data)
    } catch (err) {
      setError('Erreur lors du chargement des écoutes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addEcoute = useCallback(async (ecouteData: Omit<Ecoute, 'id' | 'created_at'>) => {
    try {
      const newEcoute = await createEcoute(ecouteData)
      if (newEcoute) {
        setEcoutes(prev => [newEcoute, ...prev])
        return newEcoute
      }
      return null
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'écoute:', err)
      return null
    }
  }, [])

  const updateEcouteData = useCallback(async (id: string, updates: Partial<Ecoute>) => {
    try {
      const updatedEcoute = await updateEcoute(id, updates)
      if (updatedEcoute) {
        setEcoutes(prev => prev.map(ecoute => 
          ecoute.id === id ? updatedEcoute : ecoute
        ))
        return updatedEcoute
      }
      return null
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'écoute:', err)
      return null
    }
  }, [])

  const removeEcoute = useCallback(async (id: string) => {
    try {
      const success = await deleteEcoute(id)
      if (success) {
        setEcoutes(prev => prev.filter(ecoute => ecoute.id !== id))
        return true
      }
      return false
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'écoute:', err)
      return false
    }
  }, [])

  useEffect(() => {
    fetchEcoutes()
  }, [fetchEcoutes])

  return {
    ecoutes,
    loading,
    error,
    refetch: fetchEcoutes,
    addEcoute,
    updateEcoute: updateEcouteData,
    deleteEcoute: removeEcoute
  }
}

export function useSupabaseBriefings() {
  const [briefings, setBriefings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBriefings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getBriefings()
      setBriefings(data)
    } catch (err) {
      setError('Erreur lors du chargement des briefings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addBriefing = useCallback(async (briefingData: any) => {
    try {
      const newBriefing = await createBriefing(briefingData)
      if (newBriefing) {
        setBriefings(prev => [newBriefing, ...prev])
        return newBriefing
      }
      return null
    } catch (err) {
      console.error('Erreur lors de l\'ajout du briefing:', err)
      return null
    }
  }, [])

  useEffect(() => {
    fetchBriefings()
  }, [fetchBriefings])

  return {
    briefings,
    loading,
    error,
    refetch: fetchBriefings,
    addBriefing
  }
}
