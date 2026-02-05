import { useState, useEffect, useCallback } from 'react'
import { Agent, Ecoute } from '@/lib/supabase'
import { agentsService, ecoutesService } from '@/lib/supabaseService'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await agentsService.getAll()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const createAgent = useCallback(async (agent: Omit<Agent, 'id' | 'created_at'>) => {
    try {
      const newAgent = await agentsService.create(agent)
      setAgents(prev => [...prev, newAgent])
      return newAgent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
      throw err
    }
  }, [])

  const updateAgent = useCallback(async (id: string, agent: Partial<Agent>) => {
    try {
      const updatedAgent = await agentsService.update(id, agent)
      setAgents(prev => prev.map(a => a.id === id ? updatedAgent : a))
      return updatedAgent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      throw err
    }
  }, [])

  const deleteAgent = useCallback(async (id: string) => {
    try {
      await agentsService.delete(id)
      setAgents(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      throw err
    }
  }, [])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent
  }
}

export function useEcoutes() {
  const [ecoutes, setEcoutes] = useState<Ecoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEcoutes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ecoutesService.getAll()
      setEcoutes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des écoutes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEcoutes()
  }, [fetchEcoutes])

  const createEcoute = useCallback(async (ecoute: Omit<Ecoute, 'id' | 'created_at'>) => {
    try {
      const newEcoute = await ecoutesService.create(ecoute)
      setEcoutes(prev => [newEcoute, ...prev])
      return newEcoute
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
      throw err
    }
  }, [])

  const updateEcoute = useCallback(async (id: string, ecoute: Partial<Ecoute>) => {
    try {
      const updatedEcoute = await ecoutesService.update(id, ecoute)
      setEcoutes(prev => prev.map(e => e.id === id ? updatedEcoute : e))
      return updatedEcoute
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      throw err
    }
  }, [])

  const deleteEcoute = useCallback(async (id: string) => {
    try {
      await ecoutesService.delete(id)
      setEcoutes(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      throw err
    }
  }, [])

  const toggleQualite = useCallback(async (id: string) => {
    try {
      const updatedEcoute = await ecoutesService.toggleQualite(id)
      setEcoutes(prev => prev.map(e => e.id === id ? updatedEcoute : e))
      return updatedEcoute
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      throw err
    }
  }, [])

  const toggleHonore = useCallback(async (id: string, honore: boolean) => {
    try {
      const updatedEcoute = await ecoutesService.toggleHonore(id, honore)
      setEcoutes(prev => prev.map(e => e.id === id ? updatedEcoute : e))
      return updatedEcoute
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      throw err
    }
  }, [])

  return {
    ecoutes,
    loading,
    error,
    refetch: fetchEcoutes,
    createEcoute,
    updateEcoute,
    deleteEcoute,
    toggleQualite,
    toggleHonore
  }
}
