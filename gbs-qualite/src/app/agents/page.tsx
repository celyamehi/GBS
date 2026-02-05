'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, UserX, UserCheck } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { Agent } from '@/lib/supabase'
import { useAgents } from '@/hooks/useSupabaseData'

export default function AgentsPage() {
  const { agents, loading, error, createAgent, updateAgent, deleteAgent } = useAgents()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    nom: '',
    actif: true
  })

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.nom.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const openModal = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent)
      setFormData({
        nom: agent.nom,
        actif: agent.actif
      })
    } else {
      setEditingAgent(null)
      setFormData({
        nom: '',
        actif: true
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nom) return

    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, formData)
      } else {
        const newAgent = {
          nom: formData.nom,
          code_agent: `AG${Date.now().toString().slice(-4)}`,
          projet: 'Mutuelles',
          actif: formData.actif
        }
        await createAgent(newAgent)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const toggleActif = async (agent: Agent) => {
    try {
      await updateAgent(agent.id, { actif: !agent.actif })
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto mb-4"></div>
          <p className="text-[#6b7280]">Chargement des agents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <UserX className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-red-600 mb-2">Erreur de chargement</p>
          <p className="text-[#6b7280] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Gestion des Agents"
        description="Gérez vos agents et leurs informations"
        action={
          <button 
            onClick={() => openModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un agent
          </button>
        }
      />

      <div className="card p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-[#6b7280]">
                    Aucun agent trouvé
                  </td>
                </tr>
              ) : (
                filteredAgents.map(agent => (
                  <tr key={agent.id}>
                    <td className="font-medium">{agent.nom}</td>
                    <td>
                      <span className={`badge ${agent.actif ? 'badge-success' : 'badge-danger'}`}>
                        {agent.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(agent)}
                          className="p-2 rounded-lg hover:bg-[#ede9fe] transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4 text-[#7c3aed]" />
                        </button>
                        <button
                          onClick={() => toggleActif(agent)}
                          className={`p-2 rounded-lg transition-colors ${
                            agent.actif 
                              ? 'hover:bg-[#ffd6e0]' 
                              : 'hover:bg-[#d4edda]'
                          }`}
                          title={agent.actif ? 'Désactiver' : 'Activer'}
                        >
                          {agent.actif ? (
                            <UserX className="w-4 h-4 text-[#ef4444]" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-[#10b981]" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgent ? 'Modifier l\'agent' : 'Ajouter un agent'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="input-field"
              placeholder="Ex: Marie Dupont"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="actif"
              checked={formData.actif}
              onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
              className="checkbox-custom"
            />
            <label htmlFor="actif" className="text-sm font-medium text-[#1a1a2e]">
              Agent actif
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingAgent ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
